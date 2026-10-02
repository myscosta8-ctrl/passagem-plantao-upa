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
    instrucoes: [it.diluicao, it.instrucoes].filter(Boolean).join(' — '),
    apresentacao: it.apresentacao || '',
    qtd_por_dose: it.qtd_por_dose != null ? String(it.qtd_por_dose).replace('.', ',') : '1',
  }
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
