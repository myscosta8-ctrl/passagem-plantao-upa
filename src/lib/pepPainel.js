import { supabase } from './supabaseClient.js'
import { avisarErro } from './erros.js'
import { hojeBelem, somarDias } from './prescricaoValidade.js'

// Indicadores do Painel de Leitos, em poucas consultas agrupadas (uma por
// tabela, para todos os pacientes de uma vez — nunca uma por leito).
const TABELAS_RASCUNHO = ['consultas_medicas', 'evolucoes_medicas', 'prescricoes_medicas', 'notas_intercorrencia_medica',
  'sumarios_alta', 'planos_terapeuticos', 'aih_solicitacoes', 'historico_enfermagem', 'evolucoes', 'eventos_adversos', 'transferencias_sbar']

export async function carregarIndicadoresPainel(atendimentoIds) {
  const ids = (atendimentoIds || []).filter(Boolean)
  if (!ids.length) return {}
  const ontem = somarDias(hojeBelem(), -1)
  const [iso, presc, exames, soros, hemo, ...rasc] = await Promise.all([
    supabase.from('isolamentos').select('atendimento_id, tipo').in('atendimento_id', ids).eq('ativo', true),
    supabase.from('prescricoes_medicas').select('atendimento_id, data_referencia').in('atendimento_id', ids).eq('situacao', 'finalizado').gte('data_referencia', ontem),
    supabase.from('exames_solicitados').select('atendimento_id, status').in('atendimento_id', ids).neq('situacao', 'invalido'),
    supabase.from('sorologias_notificaveis').select('atendimento_id, status').in('atendimento_id', ids),
    supabase.from('solicitacoes_hemoterapia').select('atendimento_id, transfundido_em').in('atendimento_id', ids).is('transfundido_em', null),
    ...TABELAS_RASCUNHO.map((t) => supabase.from(t).select('atendimento_id').in('atendimento_id', ids).eq('situacao', 'rascunho')),
  ])
  for (const r of [iso, presc, exames, soros, hemo, ...rasc]) if (r.error) avisarErro('painel', r.error)

  const mapa = Object.fromEntries(ids.map((id) => [id, { isolamento: null, prescricoes: [], exames: 0, sorologias: 0, hemo: 0, rascunhos: 0 }]))
  for (const r of iso.data ?? []) if (mapa[r.atendimento_id]) mapa[r.atendimento_id].isolamento = r.tipo || 'Isolamento'
  for (const r of presc.data ?? []) mapa[r.atendimento_id]?.prescricoes.push(r.data_referencia)
  const concluido = /realizad|conclu|resultad|cancel|liberad/i
  for (const r of exames.data ?? []) if (mapa[r.atendimento_id] && !concluido.test(r.status || '')) mapa[r.atendimento_id].exames++
  for (const r of soros.data ?? []) if (mapa[r.atendimento_id] && /pendente|aguardando/i.test(r.status || '')) mapa[r.atendimento_id].sorologias++
  for (const r of hemo.data ?? []) if (mapa[r.atendimento_id]) mapa[r.atendimento_id].hemo++
  for (const res of rasc) for (const r of res.data ?? []) if (mapa[r.atendimento_id]) mapa[r.atendimento_id].rascunhos++
  return mapa
}
