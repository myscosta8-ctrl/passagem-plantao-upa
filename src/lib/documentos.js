import { supabase } from './supabaseClient.js'
import { avisarErro } from './erros.js'
import { dadosMudaram } from './cache.js'

// ===================== Regras de documento clínico =====================
// "Salvar Rascunho" grava como rascunho (editável pelo autor); "Finalizar e Imprimir"
// finaliza (o banco bloqueia edição — só pode ser invalidado). Com `id`,
// atualiza o próprio rascunho em vez de criar outro registro.
// Avisa as telas (ex.: contador de "documentos não finalizados" no menu) que um documento mudou.
export const EVENTO_DOCUMENTOS = 'documentos-alterados'
// Também avisa o cache entre abas (lib/cache.js) para as telas abertas buscarem de novo.
function avisarMudanca(tabela) {
  dadosMudaram(tabela)
  try { window.dispatchEvent(new Event(EVENTO_DOCUMENTOS)) } catch { /* fora do navegador */ }
}

export function gravar(tabela, id, row, situacao, select = '*') {
  // situacao: 'rascunho' | 'finalizado' ou { situacao, data_registro } (ver metaDoc)
  const meta = typeof situacao === 'string' ? { situacao } : (situacao || {})
  const linha = { ...row, ...meta }
  const q = id ? supabase.from(tabela).update(linha).eq('id', id) : supabase.from(tabela).insert(linha)
  // .then() transforma em Promise comum (executa a gravação uma única vez)
  return q.select(select).single().then((r) => { if (!r.error) avisarMudanca(tabela); return r })
}

export async function invalidarRegistro(tabela, id, motivo) {
  const r = await supabase.rpc('invalidar_registro', { p_tabela: tabela, p_id: id, p_motivo: motivo })
  if (!r.error) avisarMudanca(tabela)
  return r
}

export const MSG_FINALIZADO = 'Este documento já foi finalizado (Finalizar e Imprimir) e não pode mais ser editado — apenas invalidado.'

// Metadados do documento: situação (rascunho/finalizado) e a data clínica do
// registro — pode ser retroativa; a data de impressão é sempre a atual.
export function metaDoc(finalizar, dataRegistro, estadoFormulario) {
  const meta = { situacao: finalizar ? 'finalizado' : 'rascunho' }
  if (dataRegistro) meta.data_registro = new Date(dataRegistro).toISOString()
  // O rascunho guarda o formulário como estava na tela, para reabrir depois.
  if (!finalizar && estadoFormulario !== undefined) meta.rascunho_estado = estadoFormulario
  return meta
}

// Rascunho escolhido no Histórico Clínico ("Editar rascunho"): a próxima abertura
// do formulário daquela tabela reabre exatamente esse rascunho (uma vez só).
let rascunhoAlvo = null
export function definirRascunhoAlvo(tabela, id) { rascunhoAlvo = { tabela, id } }

// Último rascunho do próprio profissional neste atendimento (ou null).
// `filtro` separa documentos que dividem a mesma tabela (ex.: admissão × evolução nutricional).
export async function buscarRascunho(tabela, atendimentoId, autorId, filtro = null) {
  if (!atendimentoId || !autorId) return null
  if (rascunhoAlvo?.tabela === tabela) {
    const { id } = rascunhoAlvo
    rascunhoAlvo = null
    let qa = supabase.from(tabela).select('*')
      .eq('id', id).eq('atendimento_id', atendimentoId).eq('situacao', 'rascunho').eq('autor_auth', autorId)
    if (filtro) qa = qa.match(filtro)
    const { data: alvo, error: erroAlvo } = await qa.maybeSingle()
    if (erroAlvo) avisarErro('documentos', erroAlvo)
    if (alvo) return alvo
    if (tabela === 'aih_solicitacoes') {
      const enc = await aihEncaminhada(atendimentoId, autorId, id)
      if (enc) return enc
    }
  }
  let q = supabase.from(tabela).select('*')
    .eq('atendimento_id', atendimentoId).eq('situacao', 'rascunho').eq('autor_auth', autorId)
  if (filtro) q = q.match(filtro)
  const { data, error: erroConsulta1 } = await q.order('criado_em', { ascending: false }).limit(1).maybeSingle()
  if (erroConsulta1) avisarErro('documentos', erroConsulta1)
  if (!data && tabela === 'aih_solicitacoes') return aihEncaminhada(atendimentoId, autorId)
  return data
}

// AIH pré-preenchida pela enfermagem/recepção e encaminhada a este médico (ainda rascunho).
async function aihEncaminhada(atendimentoId, medicoId, id) {
  let q = supabase.from('aih_solicitacoes').select('*')
    .eq('atendimento_id', atendimentoId).eq('situacao', 'rascunho').eq('medico_destino_id', medicoId).not('encaminhado_em', 'is', null)
  if (id) q = q.eq('id', id)
  const { data, error } = await q.order('encaminhado_em', { ascending: false }).limit(1).maybeSingle()
  if (error) avisarErro('documentos', error)
  return data
}

// "Cancelar" antes de finalizar: descarta o rascunho em definitivo (fica na auditoria).
export async function descartarRascunho(tabela, id) {
  if (!id) return { error: null }
  const r = await supabase.from(tabela).delete().eq('id', id).eq('situacao', 'rascunho')
  if (!r.error) avisarMudanca(tabela)
  return r
}
