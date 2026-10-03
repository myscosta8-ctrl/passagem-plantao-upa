// Lista pronta de cuidados e orientações de enfermagem para a prescrição médica.
// Cada item entra com o horário mais usado (o médico pode trocar). Texto livre continua possível.
const G_MONIT = 'Sinais vitais e monitorização'
const G_ACESSO = 'Acesso venoso e sondas'
const G_RESP = 'Respiração e vias aéreas'
const G_POS = 'Posição e mobilidade'
const G_HIG = 'Higiene, pele e curativos'
const G_SEG = 'Segurança e precauções'
const G_COM = 'Comunicar ao médico'

const L = (grupo, itens) => itens.map(([texto, frequencia = '']) => ({ grupo, texto, frequencia }))

export const CUIDADOS_ENFERMAGEM = [
  ...L(G_MONIT, [
    ['Sinais vitais (PA, FC, FR, Tax e SatO2)', '6/6h'],
    ['Sinais vitais e escala de dor (0-10)', '6/6h'],
    ['Monitorização cardíaca contínua', 'Contínuo'],
    ['Oximetria de pulso contínua', 'Contínuo'],
    ['Glicemia capilar (HGT / dextro)', '6/6h'],
    ['Controle de diurese', 'Por turno'],
    ['Balanço hídrico', 'Por turno'],
    ['Curva térmica', '4/4h'],
    ['Avaliação neurológica (Glasgow e pupilas)', '2/2h'],
    ['Observar nível de consciência e agitação', 'Por turno'],
    ['Peso diário', '1x ao dia'],
  ]),
  ...L(G_ACESSO, [
    ['Puncionar acesso venoso periférico calibroso', 'Agora'],
    ['Puncionar 2 acessos venosos periféricos calibrosos', 'Agora'],
    ['Manter acesso venoso periférico pérvio', 'Contínuo'],
    ['Salinizar acesso venoso após as medicações', 'Se necessário (SN)'],
    ['Observar sinais de flebite no acesso venoso', 'Por turno'],
    ['Trocar acesso venoso periférico a cada 96 h ou se flebite', 'Se necessário (SN)'],
    ['Cuidados com cateter venoso central', 'Por turno'],
    ['Sondagem vesical de demora (SVD)', 'Agora'],
    ['Sondagem vesical de alívio se retenção urinária', 'Se necessário (SN)'],
    ['Cuidados com SVD e bolsa coletora', 'Por turno'],
    ['Sondagem nasogástrica (SNG) aberta em frasco', 'Agora'],
    ['Sondagem nasoenteral (SNE)', 'Agora'],
    ['Lavar sonda com 20 mL de AD após dieta e medicações', 'Se necessário (SN)'],
  ]),
  ...L(G_RESP, [
    ['Oxigênio por cateter nasal (manter SatO2 ≥ 92%)', 'Contínuo'],
    ['Oxigênio por máscara com reservatório', 'Contínuo'],
    ['Aspiração de vias aéreas superiores', 'Se necessário (SN)'],
    ['Aspiração de tubo orotraqueal / traqueostomia (técnica estéril)', 'Se necessário (SN)'],
    ['Cuidados com tubo orotraqueal (fixação e pressão do cuff)', 'Por turno'],
    ['Cuidados com ventilação mecânica', 'Contínuo'],
    ['Estimular tosse e respiração profunda', 'Por turno'],
  ]),
  ...L(G_POS, [
    ['Elevar cabeceira do leito a 30°', 'Contínuo'],
    ['Elevar cabeceira do leito a 45°', 'Contínuo'],
    ['Cabeceira a 0° (decúbito zero)', 'Contínuo'],
    ['Mudança de decúbito', '2/2h'],
    ['Estimular deambulação', 'Por turno'],
    ['Deambulação assistida', 'Por turno'],
    ['Repouso no leito', 'Contínuo'],
    ['Repouso absoluto no leito', 'Contínuo'],
    ['Elevar membros inferiores', 'Contínuo'],
    ['Proteger proeminências ósseas (prevenir lesão por pressão)', 'Por turno'],
    ['Auxiliar na alimentação', 'Por turno'],
  ]),
  ...L(G_HIG, [
    ['Curativo diário', '1x ao dia'],
    ['Curativo oclusivo', '1x ao dia'],
    ['Trocar curativo se sujo ou úmido', 'Se necessário (SN)'],
    ['Higiene oral', 'Por turno'],
    ['Higiene oral com clorexidina 0,12%', '12/12h'],
    ['Banho no leito', '1x ao dia'],
    ['Banho de aspersão assistido', '1x ao dia'],
    ['Higiene íntima', 'Por turno'],
    ['Hidratação da pele', 'Por turno'],
    ['Compressa fria local', 'Se necessário (SN)'],
    ['Compressa morna local', 'Se necessário (SN)'],
  ]),
  ...L(G_SEG, [
    ['Manter grades do leito elevadas', 'Contínuo'],
    ['Precaução de queda', 'Contínuo'],
    ['Precaução de contato', 'Contínuo'],
    ['Precaução para gotículas', 'Contínuo'],
    ['Precaução para aerossóis (máscara N95)', 'Contínuo'],
    ['Contenção mecânica no leito se agitação (reavaliar)', 'Se necessário (SN)'],
    ['Manter acompanhante', 'Contínuo'],
    ['Pulseira de identificação e de alergia', 'Contínuo'],
    ['Observar sangramentos', 'Por turno'],
  ]),
  ...L(G_COM, [
    ['Comunicar se PA ≥ 180 x 110 mmHg ou PAS < 90 mmHg', 'Se necessário (SN)'],
    ['Comunicar se FC > 120 ou < 50 bpm', 'Se necessário (SN)'],
    ['Comunicar se SatO2 < 92%', 'Se necessário (SN)'],
    ['Comunicar se Tax ≥ 37,8 °C', 'Se necessário (SN)'],
    ['Comunicar se glicemia < 70 ou > 300 mg/dL', 'Se necessário (SN)'],
    ['Comunicar se diurese < 0,5 mL/kg/h', 'Se necessário (SN)'],
    ['Comunicar alteração do nível de consciência', 'Se necessário (SN)'],
    ['Comunicar dor torácica ou desconforto respiratório', 'Se necessário (SN)'],
    ['Comunicar sangramento', 'Se necessário (SN)'],
    ['Comunicar intercorrências', 'Se necessário (SN)'],
  ]),
].map((c) => ({ ...c, chave: c.texto }))

// Sem acento e minúsculo, para a busca achar "cabeceira" em "Cabeceira" e "decubito" em "decúbito".
export const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Opções que contêm todas as palavras digitadas (em qualquer ordem), também no nome do grupo.
export function filtrarOpcoes(opcoes, termo) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean)
  if (!palavras.length) return opcoes
  return opcoes.filter((o) => {
    const alvo = normalizar(`${o.texto} ${o.grupo || ''}`)
    return palavras.every((p) => alvo.includes(p))
  })
}

// Escolher na lista: entra (no lugar das linhas vazias) ou sai, se já estava na prescrição.
export function alternarCuidado(lista, opcao) {
  const preenchidas = (lista || []).filter((o) => String(o.texto || '').trim())
  const ja = preenchidas.findIndex((o) => normalizar(o.texto) === normalizar(opcao.texto))
  if (ja >= 0) return preenchidas.filter((_, i) => i !== ja)
  return [...preenchidas, { texto: opcao.texto, frequencia: opcao.frequencia || '' }]
}
