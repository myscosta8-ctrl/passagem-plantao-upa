// Regras do item de prescrição (sem tela): formulário ↔ banco, texto de diluição e
// aplicação da calculadora pediátrica. Usadas pela aba Prescrição e testadas sem navegador.
import { calcularDosePediatrica } from '../../../lib/calculoPediatrico.js'

export const ITEM_VAZIO = { medicamento_nome: '', dose: '', dose_unidade: 'mg', via: 'VO', frequencia: '', duracao: '', instrucoes: '', condicao: '', diluente: '', diluente_ml: '', tempo_infusao: '', apresentacao: '', qtd_por_dose: '1' }
export const ORIENTACAO_VAZIA = { texto: '', frequencia: '' }
export const HEMO_OPCOES_RAPIDAS = [
  { chave: 'hemacias', label: 'Concentrado de Hemácias', icon: 'ph-drop' },
  { chave: 'plasma', label: 'Plasma Fresco Congelado', icon: 'ph-flask' },
  { chave: 'plaquetas', label: 'Concentrado de Plaquetas', icon: 'ph-circle-dashed' },
  { chave: 'crio', label: 'Crioprecipitado', icon: 'ph-snowflake' },
]

export const fmtMg = (n) => (Number.isInteger(n) ? String(n) : n >= 10 ? String(Math.round(n * 10) / 10).replace('.', ',') : String(Math.round(n * 100) / 100).replace('.', ','))
export const fmtMl = (n) => n.toFixed(1).replace('.', ',')

// Monta o texto de diluição a partir dos campos guiados (ex.: "Diluir em 100 mL de SF 0,9% — Em 30 min").
export function textoDiluicao(it) {
  const partes = []
  if (it.diluente) partes.push(`Diluir em ${it.diluente_ml ? `${it.diluente_ml} mL de ` : ''}${it.diluente}`)
  if (it.tempo_infusao) partes.push(it.tempo_infusao)
  return partes.join(' — ')
}

// Só as colunas de prescricao_itens; a condição (SN/ACM/se dor...) vai em observacoes.
export function itemParaBanco(it) {
  return {
    medicamento_nome: it.medicamento_nome.trim(),
    dose: it.dose ? Number(String(it.dose).replace(',', '.')) : null,
    dose_unidade: it.dose ? it.dose_unidade : null,
    via: it.via || null,
    frequencia: it.frequencia || null,
    duracao: it.duracao || null,
    diluicao: textoDiluicao(it) || null,
    velocidade_infusao: it.tempo_infusao || null,
    instrucoes: it.instrucoes || null,
    sn_aplic: !!it.condicao,
    observacoes: it.condicao || null,
    apresentacao: it.apresentacao || null,
    qtd_por_dose: it.qtd_por_dose ? Number(String(it.qtd_por_dose).replace(',', '.')) || 1 : 1,
  }
}

// Texto de diluição gravado → campos guiados do formulário ("Diluir em 100 mL de SF 0,9% — Em
// 30 min" volta como diluente SF 0,9%, 100 mL e tempo "Em 30 min"). O que não seguir esse
// formato fica no campo de instruções, sem repetir o tempo de infusão.
export function diluicaoDoBanco(diluicao, tempo) {
  const partes = String(diluicao || '').split(' — ').map((x) => x.trim()).filter(Boolean)
    .filter((x) => !tempo || x !== String(tempo).trim())
  const m = partes[0]?.match(/^Diluir em (?:(\d+(?:[.,]\d+)?) mL de )?(.+)$/)
  if (m) return { diluente: m[2], diluente_ml: m[1] || '', resto: partes.slice(1).join(' — ') }
  return { diluente: '', diluente_ml: '', resto: partes.join(' — ') }
}

// Item gravado → formulário (usado em "Duplicar" uma prescrição anterior).
export function itemDoBanco(it) {
  return {
    ...ITEM_VAZIO,
    medicamento_nome: it.medicamento_nome || '',
    dose: it.dose != null ? String(it.dose).replace('.', ',') : '',
    dose_unidade: it.dose_unidade || 'mg',
    via: it.via || 'VO',
    frequencia: it.frequencia || '',
    duracao: it.duracao || '',
    condicao: it.sn_aplic ? (it.observacoes || '') : '',
    tempo_infusao: it.velocidade_infusao || '',
    // Diluição volta para os campos guiados (sem repetir o tempo de infusão a cada duplicação).
    ...(() => { const d = diluicaoDoBanco(it.diluicao, it.velocidade_infusao); return { diluente: d.diluente, diluente_ml: d.diluente_ml, instrucoes: [d.resto, it.instrucoes].filter(Boolean).join(' — ') } })(),
    apresentacao: it.apresentacao || '',
    qtd_por_dose: it.qtd_por_dose != null ? String(it.qtd_por_dose).replace('.', ',') : '1',
  }
}

// Hemocomponentes gravados ([{ tipo, quantidade }]) → marcações do formulário (usado em "Duplicar").
export function hemocomponentesDoBanco(lista) {
  const marcados = {}
  for (const h of HEMO_OPCOES_RAPIDAS) {
    const g = (lista || []).find((x) => x?.tipo === h.label)
    if (g) marcados[h.chave] = { marcado: true, quantidade: g.quantidade || '' }
  }
  return marcados
}

// Campos extras da prescrição (dieta, cuidados, hemocomponentes) como vão para o banco.
export function camposPrescricaoParaBanco({ dieta, orientacaoEnfermagem, hemocomponentes, hemocomponenteObs }) {
  return {
    dieta: dieta || null,
    orientacao_enfermagem: orientacaoEnfermagem.filter((o) => o.texto.trim()),
    hemocomponentes: HEMO_OPCOES_RAPIDAS
      .filter((h) => hemocomponentes[h.chave]?.marcado)
      .map((h) => ({ tipo: h.label, quantidade: hemocomponentes[h.chave]?.quantidade || '' })),
    hemocomponente_obs: hemocomponenteObs || null,
  }
}

// Calculadora pediátrica → item: dose, frequência, rediluição e o texto de reconstituição.
// Devolve null se o cálculo ainda não está completo (nada é alterado).
export function aplicarCalculoAoItem(it, calc, pesoPaciente) {
  const { pesoKg, doseAlvoMgKg, diluenteMl, soroMl, doseTotalMg, dosesDia, porDia, volumeAspirarMl } = calcularDosePediatrica(calc, pesoPaciente)
  if (!doseTotalMg || !volumeAspirarMl) return null
  const base = porDia
    ? `${String(doseAlvoMgKg).replace('.', ',')} mg/kg/dia × ${String(pesoKg).replace('.', ',')} kg ÷ ${dosesDia} doses`
    : `${String(doseAlvoMgKg).replace('.', ',')} mg/kg × ${String(pesoKg).replace('.', ',')} kg`
  const reconstituicao = `Reconstituir em ${diluenteMl} mL de AD e aspirar ${fmtMl(volumeAspirarMl)} mL (${base}${calc.arredondar ? ', arredondado' : ''})`
  return {
    pesoUsado: String(calc.pesoKg || pesoKg),
    item: {
      ...it,
      dose: fmtMg(doseTotalMg),
      dose_unidade: 'mg',
      ...(calc.frequencia ? { frequencia: calc.frequencia } : {}),
      diluente: soroMl ? 'SF 0,9%' : it.diluente,
      diluente_ml: soroMl ? String(soroMl) : it.diluente_ml,
      instrucoes: reconstituicao,
    },
  }
}
