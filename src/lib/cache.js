import { QueryClient } from '@tanstack/react-query'

// ===================== Cache de dados entre abas =====================
// Ao trocar de aba na ficha do paciente, os dados já buscados (cabeçalho, alergias,
// sinais vitais, prescrições...) aparecem na hora, sem nova busca no banco.
//
// Segurança clínica:
// - Dado clínico é considerado "fresco" por só 20 segundos. Depois disso, a tela mostra o
//   que já tinha e busca de novo em segundo plano (atualiza sozinha em instantes).
// - Toda gravação feita pelo sistema (salvar rascunho, finalizar, invalidar, descartar,
//   registrar sinais/alergias, realocar, desfecho...) avisa o cache, que busca de novo.
// - Falha ao carregar nunca fica guardada: na próxima abertura busca outra vez.
// - Ao sair do sistema, o cache é apagado (o próximo usuário do computador não vê nada).
// - Impressos continuam buscando sempre direto no banco.

export const FRESCOR_CLINICO = 20 * 1000
export const FRESCOR_CABECALHO = 60 * 1000

// Lista que veio com falha (marca `falhou`) ou erro: nunca é tratada como fresca.
export const frescor = (ms) => (query) => (query.state.data?.falhou ? 0 : ms)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false, // trocar de janela do navegador não dispara nova busca
      retry: 1,
    },
  },
})

// Tabelas que alteram o cabeçalho do paciente (nome, idade, leito, alergias).
const AFETAM_CABECALHO = new Set(['pessoas', 'atendimentos', 'alergias', 'leito_ocupacoes', 'internacoes'])

// Chamada depois de qualquer gravação: as telas abertas que mostram essas tabelas buscam de novo.
// A chave de cada consulta começa pelo nome da tabela (ex.: ['prescricoes_medicas', atendimentoId]).
export function dadosMudaram(...tabelas) {
  let cabecalho = false
  for (const t of tabelas) {
    if (!t) continue
    queryClient.invalidateQueries({ queryKey: [t] })
    if (AFETAM_CABECALHO.has(t)) cabecalho = true
  }
  if (cabecalho) queryClient.invalidateQueries({ queryKey: ['cabecalho'] })
}

// Para telas que buscam dentro de uma função (ex.: carregar prescrições + ATM juntos):
// usa o que está no cache se ainda fresco; senão busca. Resultado com falha não fica guardado.
export async function buscarComCache(chave, buscar, ms = FRESCOR_CLINICO) {
  const dados = await queryClient.fetchQuery({ queryKey: chave, queryFn: buscar, staleTime: frescor(ms) })
  if (dados?.falhou) queryClient.removeQueries({ queryKey: chave, exact: true })
  return dados
}

// Ao sair: nenhum dado de paciente fica na memória do navegador.
export function limparCache() {
  queryClient.clear()
}

// Executa uma gravação e, se deu certo, avisa o cache das tabelas alteradas.
export function avisando(gravacao, ...tabelas) {
  return Promise.resolve(gravacao).then((r) => { if (!r?.error) dadosMudaram(...tabelas); return r })
}
