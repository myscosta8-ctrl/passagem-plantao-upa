import { supabase } from './supabaseClient.js'

// Indicadores Clínicos (Seção 5 da evolução do PEP) — calculados a partir de
// `atendimentos` + `internacoes` (fonte oficial com o PEP ativo).

const belem = { timeZone: 'America/Belem', year: 'numeric', month: '2-digit', day: '2-digit' }

function inicioPeriodoISO(periodo) {
  const hojeStr = new Intl.DateTimeFormat('en-CA', belem).format(new Date())
  const diasParaTras = periodo === 'hoje' ? 0 : periodo === '7dias' ? 6 : 29
  const data = new Date(`${hojeStr}T00:00:00-03:00`) // Belém não observa horário de verão
  data.setDate(data.getDate() - diasParaTras)
  return data.toISOString()
}

function mediaHoras(pares) {
  const horas = pares
    .map(({ inicio, fim }) => (fim - inicio) / 3_600_000)
    .filter((h) => Number.isFinite(h) && h >= 0)
  if (horas.length === 0) return null
  return horas.reduce((soma, h) => soma + h, 0) / horas.length
}

export async function calcularIndicadoresClinicos(periodo) {
  const desdeISO = inicioPeriodoISO(periodo)

  const INT = 'internacoes(diagnostico_admissao, encerrado_em)'
  const [r1, r2, r3, r4, r5] = await Promise.all([
    supabase.from('atendimentos').select('id', { count: 'exact', head: true })
      .eq('status', 'internado').eq('status_internacao', 'Em observação'),
    supabase.from('atendimentos').select(`queixa_principal, ${INT}`)
      .eq('status_internacao', 'Internado').gte('data_conduta_definida', desdeISO).limit(5000),
    supabase.from('atendimentos').select('criado_em, encerrado_em')
      .eq('status', 'alta').eq('status_internacao', 'Internado')
      .gte('encerrado_em', desdeISO).limit(5000),
    supabase.from('atendimentos').select('criado_em, data_conduta_definida')
      .gte('data_conduta_definida', desdeISO).limit(5000),
    supabase.from('atendimentos').select('classificacao_risco_cor').eq('status', 'internado').limit(2000),
  ])
  const erro = [r1, r2, r3, r4, r5].find((r) => r.error)?.error
  if (erro) throw erro
  const emObservacaoAgora = r1.count
  const internaram = (r2.data ?? []).map((a) => {
    const i = Array.isArray(a.internacoes) ? a.internacoes[0] : a.internacoes
    return { diagnostico: i?.diagnostico_admissao || a.queixa_principal }
  })
  const desfechosInternados = (r3.data ?? []).map((a) => ({ inicio: a.criado_em, fim: a.encerrado_em }))
  const condutas = (r4.data ?? []).map((a) => ({ inicio: a.criado_em, fim: a.data_conduta_definida }))
  const internadosAgora = (r5.data ?? []).map((a) => ({ classificacao_manchester: a.classificacao_risco_cor }))

  const porDiagnostico = {}
  for (const p of internaram ?? []) {
    const chave = (p.diagnostico || '').trim() || 'Sem diagnóstico registrado'
    porDiagnostico[chave] = (porDiagnostico[chave] || 0) + 1
  }

  const tempoMedioInternacaoHoras = mediaHoras(
    desfechosInternados.map((p) => ({ inicio: new Date(p.inicio), fim: new Date(p.fim) }))
  )

  const tempoMedioAteCondutaHoras = mediaHoras(
    condutas.map((p) => ({ inicio: new Date(p.inicio), fim: new Date(p.fim) }))
  )

  const porManchester = {}
  for (const p of internadosAgora ?? []) {
    const chave = p.classificacao_manchester || 'Não classificado'
    porManchester[chave] = (porManchester[chave] || 0) + 1
  }

  return {
    emObservacaoAgora: emObservacaoAgora ?? 0,
    internaram: {
      total: internaram?.length ?? 0,
      porDiagnostico: Object.entries(porDiagnostico).sort((a, b) => b[1] - a[1]),
    },
    tempoMedioInternacaoHoras,
    tempoMedioAteCondutaHoras,
    porManchester,
  }
}
