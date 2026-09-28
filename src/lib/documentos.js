import { supabase } from './supabaseClient.js'
import { avisarErro } from './erros.js'

// ===================== Regras de documento clínico =====================
// "Salvar" grava como rascunho (editável pelo autor); "Salvar e Imprimir"
// finaliza (o banco bloqueia edição — só pode ser invalidado). Com `id`,
// atualiza o próprio rascunho em vez de criar outro registro.
// Avisa as telas (ex.: contador de "documentos não finalizados" no menu) que um documento mudou.
export const EVENTO_DOCUMENTOS = 'documentos-alterados'
function avisarMudanca() { try { window.dispatchEvent(new Event(EVENTO_DOCUMENTOS)) } catch { /* fora do navegador */ } }

export function gravar(tabela, id, row, situacao, select = '*') {
  // situacao: 'rascunho' | 'finalizado' ou { situacao, data_registro } (ver metaDoc)
  const meta = typeof situacao === 'string' ? { situacao } : (situacao || {})
  const linha = { ...row, ...meta }
  const q = id ? supabase.from(tabela).update(linha).eq('id', id) : supabase.from(tabela).insert(linha)
  // .then() transforma em Promise comum (executa a gravação uma única vez)
  return q.select(select).single().then((r) => { if (!r.error) avisarMudanca(); return r })
}

export async function invalidarRegistro(tabela, id, motivo) {
  return supabase.rpc('invalidar_registro', { p_tabela: tabela, p_id: id, p_motivo: motivo })
}

export const MSG_FINALIZADO = 'Este documento já foi finalizado (Salvar e Imprimir) e não pode mais ser editado — apenas invalidado.'

// Metadados do documento: situação (rascunho/finalizado) e a data clínica do
// registro — pode ser retroativa; a data de impressão é sempre a atual.
export function metaDoc(finalizar, dataRegistro, estadoFormulario) {
  const meta = { situacao: finalizar ? 'finalizado' : 'rascunho' }
  if (dataRegistro) meta.data_registro = new Date(dataRegistro).toISOString()
  // O rascunho guarda o formulário como estava na tela, para reabrir depois.
  if (!finalizar && estadoFormulario !== undefined) meta.rascunho_estado = estadoFormulario
  return meta
}

// Último rascunho do próprio profissional neste atendimento (ou null).
export async function buscarRascunho(tabela, atendimentoId, autorId) {
  if (!atendimentoId || !autorId) return null
  const { data, error: erroConsulta1 } = await supabase.from(tabela).select('*')
    .eq('atendimento_id', atendimentoId).eq('situacao', 'rascunho').eq('autor_auth', autorId)
    .order('criado_em', { ascending: false }).limit(1).maybeSingle()
  if (erroConsulta1) avisarErro('documentos', erroConsulta1)
  return data
}

// "Cancelar" antes de finalizar: descarta o rascunho em definitivo (fica na auditoria).
export async function descartarRascunho(tabela, id) {
  if (!id) return { error: null }
  const r = await supabase.from(tabela).delete().eq('id', id).eq('situacao', 'rascunho')
  if (!r.error) avisarMudanca()
  return r
}
