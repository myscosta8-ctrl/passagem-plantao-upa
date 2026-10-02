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

// Leito extra sem paciente sai do painel. Feito no banco (recolher_leitos_extras), numa
// operação só: sem histórico é apagado; com histórico fica inativo e com o número liberado.
// Extras abertos há menos de 15 min são preservados (outro profissional pode estar admitindo).
// `imediato`: o próprio profissional cancelou a admissão do extra que acabou de abrir.
export async function recolherLeitosExtras(ids = null, { imediato = false } = {}) {
  const { data, error } = await supabase.rpc('recolher_leitos_extras', {
    p_ids: ids && ids.length ? ids.map(Number) : null,
    ...(imediato ? { p_min_idade: '0 seconds' } : {}),
  })
  if (error) console.error('Erro ao recolher leitos extras:', error)
  return { recolhidos: data ?? 0, error }
}
