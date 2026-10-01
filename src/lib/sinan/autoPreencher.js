// Monta os valores iniciais da ficha a partir do cadastro, do atendimento e de quem está notificando.
// Só usa dado que já existe no sistema — nada clínico é inventado. Tudo continua editável na tela.
import { UNIDADE } from './modelos/comum'

const digitos = (s) => String(s ?? '').replace(/\D/g, '')
const hojeISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belem' }).format(new Date())
const iso = (d) => (d ? String(d).slice(0, 10) : '')

// Idade no código do impresso: 1-Hora, 2-Dia, 3-Mês, 4-Ano (cai para a unidade menor quando a maior daria zero).
export function idadeSinan(nascimento, referencia = new Date()) {
  if (!nascimento) return null
  const n = new Date(`${String(nascimento).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(n.getTime())) return null
  const r = new Date(referencia)
  let anos = r.getFullYear() - n.getFullYear()
  if (r.getMonth() < n.getMonth() || (r.getMonth() === n.getMonth() && r.getDate() < n.getDate())) anos--
  if (anos >= 1) return { idade: String(anos), unidade: '4' }
  let meses = (r.getFullYear() - n.getFullYear()) * 12 + r.getMonth() - n.getMonth()
  if (r.getDate() < n.getDate()) meses--
  if (meses >= 1) return { idade: String(meses), unidade: '3' }
  const horas = Math.floor((r - n) / 3600000)
  if (horas >= 24) return { idade: String(Math.floor(horas / 24)), unidade: '2' }
  return horas >= 0 ? { idade: String(horas), unidade: '1' } : null
}

const RACA_COD = { branca: '1', preta: '2', negra: '2', amarela: '3', parda: '4', indigena: '5', indígena: '5', ignorado: '9', 'sem informação': '9' }
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
export function racaSinan(texto) {
  const t = semAcento(texto)
  if (!t) return ''
  if (/^[1-59]$/.test(t)) return t
  return RACA_COD[t] || ''
}
export function sexoSinan(s) {
  const t = semAcento(s)
  if (['m', 'masculino'].includes(t)) return 'M'
  if (['f', 'feminino'].includes(t)) return 'F'
  if (['i', 'ignorado'].includes(t)) return 'I'
  return ''
}

// ctx: { pessoa, atendimento, internacao, notificante: { nome, funcao } }
export function valoresIniciais(ctx = {}) {
  const p = ctx.pessoa || {}
  const at = ctx.atendimento || {}
  const int = ctx.internacao || null
  const hoje = hojeISO()
  const idade = idadeSinan(p.data_nascimento) || (p.idade_informada ? { idade: String(p.idade_informada), unidade: '4' } : null)
  const residenteBreves = semAcento(p.cidade) === 'breves'
  const v = {
    tipo_notificacao: '2',
    data_notificacao: hoje,
    uf_notificacao: UNIDADE.uf,
    municipio_notificacao: UNIDADE.municipio,
    ibge_notificacao: UNIDADE.municipio_ibge,
    unidade_notificadora: UNIDADE.nome,
    cnes: UNIDADE.cnes,
    nome: p.nome || '',
    data_nascimento: iso(p.data_nascimento),
    idade: idade?.idade || '',
    unidade_idade: idade?.unidade || '',
    sexo: sexoSinan(p.sexo),
    raca: racaSinan(p.raca_cor),
    cns: digitos(p.cns).slice(0, 15),
    cpf: digitos(p.cpf).slice(0, 11),
    tem_cpf: digitos(p.cpf).length === 11 ? '1' : '',
    nome_mae: p.nome_mae || '',
    uf_residencia: p.uf || (residenteBreves ? 'PA' : ''),
    // Sem cidade cadastrada, mas com o código IBGE de Breves: o município é Breves.
    municipio_residencia: p.cidade || (digitos(p.municipio_ibge).startsWith(UNIDADE.municipio_ibge) ? UNIDADE.municipio : ''),
    ibge_residencia: digitos(p.municipio_ibge).slice(0, 6) || (residenteBreves ? UNIDADE.municipio_ibge : ''),
    bairro: p.bairro || '',
    logradouro: p.endereco || '',
    numero: p.endereco_numero || '',
    cep: digitos(p.cep).slice(0, 8),
    telefone: digitos(p.telefone || p.telefone_contato).slice(-11),
    pais: '',
    notificante_unidade: `${UNIDADE.municipio} / ${UNIDADE.nome}`,
    notificante_nome: ctx.notificante?.nome || '',
    notificante_funcao: ctx.notificante?.funcao || '',
  }
  // Internação nesta UPA (o paciente está em leito): hospitalização = Sim, com data e a própria unidade.
  if (int?.internado_em || at.status_internacao === 'internado') {
    Object.assign(v, {
      hospitalizacao: '1',
      data_hospitalizacao: iso(int?.internado_em || at.criado_em),
      uf_hospital: UNIDADE.uf, municipio_hospital: UNIDADE.municipio, ibge_hospital: UNIDADE.municipio_ibge,
      nome_hospital: UNIDADE.nome, cnes_hospital: UNIDADE.cnes,
    })
  }
  // Desfecho já registrado
  if (int?.desfecho_tipo === 'obito') Object.assign(v, { obito: '1', data_obito: iso(int.desfecho_em) })
  if (int?.desfecho_em) v.data_encerramento = iso(int.desfecho_em)
  return v
}
