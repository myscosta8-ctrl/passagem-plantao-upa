import { supabase } from '../supabaseClient'
import { avisarErro } from '../erros.js'

export async function listarNotificacoes(atendimentoId) {
  const { data, error } = await supabase
    .from('notificacoes_sinan')
    .select('*, enfermeiros!notificacoes_sinan_criado_por_fkey(nome_exibicao, nome)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (error) avisarErro('sinan', error)
  return data ?? []
}

export async function salvarNotificacao({ id, atendimentoId, pessoaId, modelo, agravo, dados, situacao, sigiloso }) {
  const linha = { modelo, agravo, dados, situacao, sigiloso: !!sigiloso }
  if (id) {
    const { data, error } = await supabase.from('notificacoes_sinan').update(linha).eq('id', id).select().single()
    return { data, error }
  }
  const { data, error } = await supabase
    .from('notificacoes_sinan')
    .insert({ ...linha, atendimento_id: atendimentoId, pessoa_id: pessoaId })
    .select().single()
  return { data, error }
}

export async function invalidarNotificacao(id, autorId, motivo) {
  const { error } = await supabase.from('notificacoes_sinan')
    .update({ situacao: 'invalidada', invalidado_por: autorId, invalidado_em: new Date().toISOString(), motivo_invalidacao: motivo || null })
    .eq('id', id)
  return { error }
}

export async function marcarEntregue(id) {
  const { error } = await supabase.from('notificacoes_sinan').update({ situacao: 'entregue', entregue_em: new Date().toISOString() }).eq('id', id)
  return { error }
}

// Dados para o pré-preenchimento: pessoa, atendimento e internação.
export async function buscarContexto(atendimentoId) {
  const { data: atendimento } = await supabase.from('atendimentos').select('*').eq('id', atendimentoId).single()
  if (!atendimento) return null
  const [{ data: pessoa }, { data: internacao }] = await Promise.all([
    supabase.from('pessoas').select('*').eq('id', atendimento.pessoa_id).single(),
    supabase.from('internacoes').select('*').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false }).limit(1).maybeSingle(),
  ])
  return { atendimento, pessoa, internacao }
}
