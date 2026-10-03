// Regras do Início (sem tela): tela salva para voltar ao mesmo lugar, títulos, iniciais,
// data e turno no horário de Belém. Testadas sem navegador.

export function hojeISOLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

// Turno pelo horário de Belém: 07h00–18h59 Diurno; o resto Noturno.
export function turnoAtualPorHora(agora = new Date()) {
  const horaAtual = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Belem', hour: 'numeric', hour12: false }).format(agora)
  )
  return horaAtual >= 7 && horaAtual < 19 ? 'Diurno' : 'Noturno'
}

// Guarda em qual tela a pessoa estava, pra voltar pro mesmo lugar se o app recarregar sozinho
// (comum no celular). Expira depois de um tempo, pra nunca reabrir num lugar "velho" demais.
export const TELAS_VALIDAS = [
  'painel', 'recepcao', 'print1', 'print2', 'altas',
  'indicadoresClinicos', 'pendencias', 'compartilhar', 'equipe',
  'ajuda', 'conta', 'profissionais', 'passagemColetiva',
]
export const LIMITE_HORAS_TELA_SALVA = 4

export const TITULO_TELA = {
  painel: 'Painel de Leitos',
  recepcao: 'Recepção',
  passagemColetiva: 'Passagem de Plantão',
  altas: 'Desfechos',
  indicadoresClinicos: 'Indicadores Clínicos',
  pendencias: 'Pendências',
  compartilhar: 'Compartilhar Plantão',
  equipe: 'Painel de Equipe',
  profissionais: 'Gerenciar Profissionais',
  conta: 'Minha Conta',
  ajuda: 'Ajuda',
  print1: 'Impressão — Grupo 1',
  print2: 'Impressão — Grupo 2',
}

export function iniciais(nome) {
  if (!nome) return 'MC'
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase()
}

export function lerTelaSalva() {
  try {
    const bruto = localStorage.getItem('app_tela_v2')
    if (!bruto) return 'painel'
    const { tela, quando } = JSON.parse(bruto)
    const horasPassadas = (Date.now() - quando) / (1000 * 60 * 60)
    if (horasPassadas > LIMITE_HORAS_TELA_SALVA) return 'painel'
    if (!TELAS_VALIDAS.includes(tela)) return 'painel' // valor desconhecido/antigo — nunca deixa em branco
    return tela
  } catch {
    return 'painel'
  }
}

export function salvarTela(tela) {
  try {
    localStorage.setItem('app_tela_v2', JSON.stringify({ tela, quando: Date.now() }))
  } catch {
    // localStorage indisponível (modo privado, etc.) — não é crítico, só não persiste
  }
}
