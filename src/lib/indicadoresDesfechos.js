// Indicadores de desfecho (sem tela): altas, transferências, óbitos e evasões no período,
// a série por dia/semana/mês e os blocos de óbitos, evasões e transferências.
// O diagnóstico é digitado em texto livre (o CID quase nunca vem preenchido), então ele é
// agrupado por palavras-chave; a lista de cada bloco mostra o texto como foi escrito.

export const TIPOS_DESFECHO = ['Alta', 'Transferência', 'Óbito', 'Evasão']

// Ordem importa: o primeiro grupo que casar vence (ex.: "TB/HIV" → Infecções antes de Respiratório).
export const GRUPOS_DIAGNOSTICO = [
  ['Saúde mental / intoxicação', /(SURTO|SUIC|AUTOEXTERM|PSIC|INTOXICA|AGITA)/],
  ['Neoplasia / paliativo', /(NEOPLAS|\bCA DE\b|METASTA|\bLLA\b|PALIAT|TUMOR)/],
  ['Sepse', /(SEPS|SEPTIC)/],
  ['Cardiovascular / AVC', /(\bAVE\b|\bAVC\b|\bICC\b|INSUFICI.NCIA CARD|\bIAM\b|\bSCA\b|ANEURISMA|\bIC DESC|HIPERTENS|ARRITMI)/],
  ['Respiratório', /(\bPNM\b|PNEUMON|\bPAC\b|BRONQ|DPOC|RESPIRAT|HIPOX|\bBPNM\b|ASMA|\bIRPA\b)/],
  ['Renal / urinário', /(\bITU\b|PIELONEF|\bIRA\b|AN.RIA|NEFR|\bDRC\b|HEMAT.RIA)/],
  ['Digestivo / abdome', /(DIARR|\bGECA\b|GASTRO|.MESE|VOMIT|V.MITO|\bABD|APEND|COLE|PANCREAT|COLANG|H.RNIA|MEGAC|CONSTIPA)/],
  ['Pele e partes moles', /(CELULITE|ERISIPELA|ABC?ESSO|IMPETIGO|PARTES MOLES|PIOMIOS|ARTRITE|FERIDA|M.ASE)/],
  ['Trauma / acidentes', /(TRAUMA|\bTCE\b|FERIMENTO|QUEIMAD|CORTE|OF.DI|FRATURA|QUEDA)/],
  ['Febre / infecções', /(FEBRE|FEBRIL|DENGUE|MAL.RIA|\bTB\b|TUBERC|\bHIV\b|CHAGAS|VIROSE|INFEC)/],
]

export function grupoDiagnostico(texto) {
  const t = String(texto || '').toUpperCase()
  if (!t.trim()) return 'Sem diagnóstico registrado'
  const g = GRUPOS_DIAGNOSTICO.find(([, re]) => re.test(t))
  return g ? g[0] : 'Outros'
}

const HORA = 3600 * 1000
const fusoBelem = { timeZone: 'America/Belem' }

// Data do desfecho: no óbito, a data/hora do óbito quando foi informada (o registro pode ter
// sido lançado depois); nos demais, a data do registro da saída.
export function dataDoDesfecho(l) {
  const obito = l.desfecho_tipo === 'Óbito' && l.dados_obito?.data_hora_obito
  const d = new Date(obito || l.desfecho_em)
  return Number.isNaN(d.getTime()) ? new Date(l.desfecho_em) : d
}

function idadeEmAnos(nasc, em) {
  if (!nasc) return null
  const n = new Date(`${nasc}T00:00:00`)
  if (Number.isNaN(n.getTime())) return null
  let a = em.getFullYear() - n.getFullYear()
  if (em.getMonth() < n.getMonth() || (em.getMonth() === n.getMonth() && em.getDate() < n.getDate())) a -= 1
  return a
}

// Rótulo do grupo de tempo (dia, semana começando na segunda, ou mês) no fuso de Belém.
export function chaveTempo(data, agrupamento) {
  const [d, m, a] = data.toLocaleDateString('pt-BR', fusoBelem).split('/').map(Number)
  if (agrupamento === 'mes') return { chave: `${a}-${String(m).padStart(2, '0')}`, rotulo: new Date(a, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '') }
  if (agrupamento === 'semana') {
    const dia = new Date(a, m - 1, d)
    dia.setDate(dia.getDate() - ((dia.getDay() + 6) % 7))
    const dd = String(dia.getDate()).padStart(2, '0'); const mm = String(dia.getMonth() + 1).padStart(2, '0')
    return { chave: `${dia.getFullYear()}-${mm}-${dd}`, rotulo: `${dd}/${mm}` }
  }
  return { chave: `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, rotulo: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}` }
}

const media = (l) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : null)
const porGrupo = (lista) => Object.entries(lista.reduce((acc, x) => { acc[x.grupo] = (acc[x.grupo] || 0) + 1; return acc }, {}))
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

// linhas: internações com desfecho no período (desfecho_tipo, desfecho_em, internado_em,
// diagnostico_admissao, desfecho_obs, dados_obito, nascimento, setor, prontuario).
export function resumirDesfechos(linhas, agrupamento = 'semana') {
  const itens = (linhas || []).filter((l) => TIPOS_DESFECHO.includes(l.desfecho_tipo)).map((l) => {
    const em = dataDoDesfecho(l)
    const ini = l.internado_em ? new Date(l.internado_em) : null
    const horas = ini ? (em - ini) / HORA : null
    const hora = Number(em.toLocaleTimeString('pt-BR', { ...fusoBelem, hour: '2-digit', hour12: false }).slice(0, 2))
    return {
      tipo: l.desfecho_tipo, em, horas: Number.isFinite(horas) && horas >= 0 ? horas : null,
      diagnostico: (l.diagnostico_admissao || '').trim(), grupo: grupoDiagnostico(l.diagnostico_admissao),
      idade: idadeEmAnos(l.nascimento, em), turno: hora >= 7 && hora < 19 ? 'dia' : 'noite',
      obs: l.desfecho_obs || '', causa: l.dados_obito?.causa_mortis || '', setor: l.setor || '', prontuario: l.prontuario || '',
    }
  }).sort((a, b) => b.em - a.em)

  const totais = Object.fromEntries(TIPOS_DESFECHO.map((t) => [t, itens.filter((i) => i.tipo === t).length]))
  const saidas = itens.length
  const pct = (n) => (saidas ? (n / saidas) * 100 : 0)

  const mapa = new Map()
  for (const i of [...itens].reverse()) {
    const { chave, rotulo } = chaveTempo(i.em, agrupamento)
    if (!mapa.has(chave)) mapa.set(chave, { chave, rotulo, ...Object.fromEntries(TIPOS_DESFECHO.map((t) => [t, 0])) })
    mapa.get(chave)[i.tipo] += 1
  }
  const serie = [...mapa.values()].sort((a, b) => a.chave.localeCompare(b.chave))

  const bloco = (tipo) => {
    const l = itens.filter((i) => i.tipo === tipo)
    const comHoras = l.filter((i) => i.horas !== null)
    return {
      total: l.length, pct: pct(l.length),
      menos24h: comHoras.filter((i) => i.horas < 24).length,
      mais24h: comHoras.filter((i) => i.horas >= 24).length,
      horasMedia: media(comHoras.map((i) => i.horas)),
      dia: l.filter((i) => i.turno === 'dia').length, noite: l.filter((i) => i.turno === 'noite').length,
      idosos: l.filter((i) => i.idade !== null && i.idade >= 60).length,
      criancas: l.filter((i) => i.idade !== null && i.idade < 12).length,
      grupos: porGrupo(l), lista: l,
    }
  }
  return { saidas, totais, pct, serie, obitos: bloco('Óbito'), evasoes: bloco('Evasão'), transferencias: bloco('Transferência') }
}
