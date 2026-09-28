import { supabase } from './supabaseClient'

// ===================== Regras de documento clínico =====================
// "Salvar" grava como rascunho (editável pelo autor); "Salvar e Imprimir"
// finaliza (o banco bloqueia edição — só pode ser invalidado). Com `id`,
// atualiza o próprio rascunho em vez de criar outro registro.
export function gravar(tabela, id, row, situacao, select = '*') {
  // situacao: 'rascunho' | 'finalizado' ou { situacao, data_registro } (ver metaDoc)
  const meta = typeof situacao === 'string' ? { situacao } : (situacao || {})
  const linha = { ...row, ...meta }
  const q = id ? supabase.from(tabela).update(linha).eq('id', id) : supabase.from(tabela).insert(linha)
  return q.select(select).single()
}

export async function invalidarRegistro(tabela, id, motivo) {
  return supabase.rpc('invalidar_registro', { p_tabela: tabela, p_id: id, p_motivo: motivo })
}

export const MSG_FINALIZADO = 'Este documento já foi finalizado (Salvar e Imprimir) e não pode mais ser editado — apenas invalidado.'

// Metadados do documento: situação (rascunho/finalizado) e a data clínica do
// registro — pode ser retroativa; a data de impressão é sempre a atual.
export function metaDoc(finalizar, dataRegistro) {
  const meta = { situacao: finalizar ? 'finalizado' : 'rascunho' }
  if (dataRegistro) meta.data_registro = new Date(dataRegistro).toISOString()
  return meta
}
