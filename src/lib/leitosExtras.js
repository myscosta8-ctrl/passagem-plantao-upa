import { supabase } from './supabaseClient.js'

// Leito extra: o número ("Extra N") é único por setor e continua ocupado por
// leitos antigos que ficaram no histórico (não podem ser apagados). Por isso o
// próximo número é calculado sobre TODOS os extras do setor, e não só os visíveis.
export async function criarLeitoExtra(setorId) {
  const setor = Number(setorId)
  const { data: existentes, error: erroLista } = await supabase
    .from('leitos').select('numero').eq('setor_id', setor).eq('tipo', 'extra')
  if (erroLista) return { error: erroLista }
  const usados = new Set((existentes ?? []).map((l) => String(l.numero)))
  let n = 1
  while (usados.has(`Extra ${n}`)) n++
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const { data: novo, error } = await supabase
      .from('leitos').insert({ setor_id: setor, numero: `Extra ${n + tentativa}`, tipo: 'extra', ativo: true })
      .select().single()
    if (!error) return { novo }
    if (error.code !== '23505') return { error } // outro erro que não seja número repetido
  }
  return { error: new Error('Não foi possível gerar um número livre para o leito extra.') }
}

// Leito extra sem paciente sai do painel. Sem histórico: é apagado. Com histórico
// (já teve paciente): não pode ser apagado — fica inativo e com o número liberado.
export async function recolherLeitosExtras(ids) {
  for (const id of ids || []) {
    const { error } = await supabase.from('leitos').delete().eq('id', id)
    if (!error) continue
    if (error.code === '23503') {
      const carimbo = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      const { data: l } = await supabase.from('leitos').select('numero, ativo').eq('id', id).maybeSingle()
      if (l?.ativo) await supabase.from('leitos').update({ ativo: false, numero: `${l.numero} (${carimbo})` }).eq('id', id)
    }
  }
}
