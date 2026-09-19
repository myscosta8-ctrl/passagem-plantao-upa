import { supabase } from './supabaseClient'

// Indicadores Clínicos (Seção 5 da evolução do PEP) — calculados a partir da
// tabela `pacientes`, que é onde os dados reais de produção estão hoje
// (pep_ativo desligado). `atendimentos` já recebe os mesmos campos (ver
// pepAtendimentos.js), pronto pra quando fizer sentido unificar as duas
// fontes aqui — não feito agora pra não misturar dois formatos de "desfecho"
// que ainda não são equivalentes (tipo_desfecho não existe no caminho novo).

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

  const [
    { count: emObservacaoAgora },
    { data: internaram },
    { data: desfechosInternados },
    { data: condutas },
    { data: internadosAgora },
  ] = await Promise.all([
    supabase.from('pacientes').select('id', { count: 'exact', head: true })
      .eq('status', 'internado').eq('status_internacao', 'Em observação'),
    supabase.from('pacientes').select('diagnostico')
      .eq('status_internacao', 'Internado').gte('data_conduta_definida', desdeISO),
    supabase.from('pacientes').select('data_admissao, data_desfecho')
      .eq('status', 'alta').eq('status_internacao', 'Internado')
      .gte('data_desfecho', desdeISO).not('data_admissao', 'is', null),
    supabase.from('pacientes').select('data_admissao, data_conduta_definida')
      .gte('data_conduta_definida', desdeISO).not('data_admissao', 'is', null),
    supabase.from('pacientes').select('classificacao_manchester').eq('status', 'internado'),
  ])

  const porDiagnostico = {}
  for (const p of internaram ?? []) {
    const chave = (p.diagnostico || '').trim() || 'Sem diagnóstico registrado'
    porDiagnostico[chave] = (porDiagnostico[chave] || 0) + 1
  }

  const tempoMedioInternacaoHoras = mediaHoras(
    (desfechosInternados ?? []).map((p) => ({
      inicio: new Date(`${p.data_admissao}T00:00:00`),
      fim: new Date(p.data_desfecho),
    }))
  )

  const tempoMedioAteCondutaHoras = mediaHoras(
    (condutas ?? []).map((p) => ({
      inicio: new Date(`${p.data_admissao}T00:00:00`),
      fim: new Date(p.data_conduta_definida),
    }))
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
