import { supabase } from './supabaseClient'

// Chave de configuração (Etapa H da Fase 0 do PEP): controla se o app lê/escreve
// na estrutura nova (pessoas/atendimentos/internacoes/leito_ocupacoes) ou continua
// no caminho antigo (pacientes). Fica no banco, não no código — dá pra ligar/
// desligar sem precisar recompilar ou reimplantar o app. Desligada por padrão.
//
// Além do interruptor geral, cada enfermeiro pode ter enfermeiros.pep_beta = true,
// o que liga o caminho novo só para o login dele — usado para validar em uso real
// (ex: ADMIN.MARCUS) antes de ligar pra todo mundo.
const cache = new Map()

export async function pepEstaAtivo(enfermeiroId) {
  const chave = enfermeiroId ?? '_global'
  if (cache.has(chave)) return cache.get(chave)
  let ativo = false
  try {
    const [{ data: config }, { data: enf }] = await Promise.all([
      supabase.from('configuracoes').select('valor').eq('chave', 'pep_ativo').maybeSingle(),
      enfermeiroId
        ? supabase.from('enfermeiros').select('pep_beta').eq('id', enfermeiroId).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    ativo = config?.valor === true || enf?.pep_beta === true
  } catch {
    ativo = false
  }
  cache.set(chave, ativo)
  return ativo
}
