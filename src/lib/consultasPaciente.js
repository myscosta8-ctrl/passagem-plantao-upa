import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FRESCOR_CLINICO, FRESCOR_CABECALHO, frescor, buscarComCache } from './cache.js'
import { listarAlergias, alergiasAtivas, listarSinaisVitais, listarEvolucoes } from './pepClinico.js'
import { buscarCabecalhoImpressao, buscarHistoricoEnfermagem, listarPrescricoes, listarAtm, listarEvolucoesMedicas, listarExames } from './pepMedico.js'

// Dados do paciente compartilhados entre as abas da ficha (ver lib/cache.js).
// A chave começa pelo nome da tabela, para a gravação avisar o cache (dadosMudaram).
export const chaves = {
  cabecalho: (atendimentoId) => ['cabecalho', atendimentoId],
  alergias: (pessoaId) => ['alergias', pessoaId],
  sinaisVitais: (atendimentoId) => ['sinais_vitais', atendimentoId],
  historicoEnfermagem: (atendimentoId) => ['historico_enfermagem', atendimentoId],
  prescricoes: (atendimentoId) => ['prescricoes_medicas', atendimentoId],
  atm: (atendimentoId) => ['solicitacoes_atm', atendimentoId],
  evolucoesMedicas: (atendimentoId) => ['evolucoes_medicas', atendimentoId],
  evolucoes: (atendimentoId) => ['evolucoes', atendimentoId],
  exames: (atendimentoId) => ['exames_solicitados', atendimentoId],
}

// Funções de busca usadas pelo cache (as mesmas que as telas usavam antes).
export const buscas = {
  cabecalho: buscarCabecalhoImpressao,
  alergias: listarAlergias,
  sinaisVitais: listarSinaisVitais,
  historicoEnfermagem: buscarHistoricoEnfermagem,
  prescricoes: listarPrescricoes,
  atm: listarAtm,
  evolucoesMedicas: listarEvolucoesMedicas,
  evolucoes: listarEvolucoes,
  exames: listarExames,
}

// Para buscas dentro de funções (carregar várias coisas juntas, pré-preencher formulário):
// usa o cache se fresco, senão busca. Ex.: doCache('prescricoes', atendimentoId).
export function doCache(nome, id) {
  return buscarComCache(chaves[nome](id), () => buscas[nome](id), nome === 'cabecalho' ? FRESCOR_CABECALHO : FRESCOR_CLINICO)
}

function useConsulta(nome, id, ms = FRESCOR_CLINICO) {
  return useQuery({
    queryKey: chaves[nome](id),
    queryFn: () => buscas[nome](id),
    enabled: !!id,
    staleTime: frescor(ms),
  })
}

export const useCabecalhoPaciente = (atendimentoId) => useConsulta('cabecalho', atendimentoId, FRESCOR_CABECALHO)
export const useSinaisVitais = (atendimentoId) => useConsulta('sinaisVitais', atendimentoId)
export const useHistoricoEnfermagem = (atendimentoId) => useConsulta('historicoEnfermagem', atendimentoId)
export const usePrescricoes = (atendimentoId) => useConsulta('prescricoes', atendimentoId)
export const useEvolucoesMedicas = (atendimentoId) => useConsulta('evolucoesMedicas', atendimentoId)
export const useEvolucoes = (atendimentoId) => useConsulta('evolucoes', atendimentoId)
export const useExames = (atendimentoId) => useConsulta('exames', atendimentoId)

// Alergias: lista completa (com inativadas) e só as ativas. `falhou` = não deu para carregar
// (a tela avisa — falha ao carregar nunca é mostrada como "sem alergias").
export function useAlergias(pessoaId) {
  const q = useConsulta('alergias', pessoaId)
  const lista = q.data ?? null
  const falhou = !!(q.data?.falhou || q.isError)
  const ativas = useMemo(() => {
    if (!lista) return null
    const a = alergiasAtivas(lista)
    if (falhou) a.falhou = true
    return a
  }, [lista, falhou])
  return { lista, ativas, falhou, carregando: q.isPending && !!pessoaId, recarregar: () => q.refetch() }
}
