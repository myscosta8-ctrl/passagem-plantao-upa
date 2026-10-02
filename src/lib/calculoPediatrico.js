// Calculadora de dose pediátrica da Prescrição Médica (mg/kg/dose ou mg/kg/dia ÷ nº de doses),
// separada da tela para poder ser testada (tests/unit/regras-clinicas.test.js).
import { dosesPorDia } from '../pages/ficha-medica/constantes.js'

export const CALC_VAZIA = { pesoKg: '', doseAlvoMgKg: '', apresentacaoMg: '', diluenteMl: '', soroMl: '', tipoDose: 'dose', frequencia: '', arredondar: '' }
// Arredondamento da dose por tomada, a critério médico.
export const ARREDONDAMENTOS = [
  { v: '', r: 'Sem arredondar' },
  { v: '0.1', r: '1 casa decimal (0,1 mg)' },
  { v: '0.5', r: 'Múltiplo de 0,5 mg' },
  { v: '1', r: 'Número inteiro (1 mg)' },
  { v: '5', r: 'Múltiplo de 5 mg' },
  { v: '10', r: 'Múltiplo de 10 mg' },
]
export const FREQ_CALC = ['1/1h', '2/2h', '3/3h', '4/4h', '6/6h', '8/8h', '12/12h', '24/24h']

// Aceita vírgula ou ponto como decimal ("12,5" ou "12.5").
const numBR = (v) => { const n = parseFloat(String(v ?? '').trim().replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : 0 }
// Mesma conta na tela da calculadora e no "Aplicar".
export function calcularDosePediatrica(calc, pacientePeso) {
  const pesoKg = numBR(calc.pesoKg) || numBR(pacientePeso)
  const doseAlvoMgKg = numBR(calc.doseAlvoMgKg)
  const apresentacaoMg = numBR(calc.apresentacaoMg)
  const diluenteMl = numBR(calc.diluenteMl)
  const soroMl = numBR(calc.soroMl)
  // Dose alvo por tomada (mg/kg/dose) ou diária (mg/kg/dia ÷ nº de doses do horário escolhido: 6/6h → ÷ 4).
  const porDia = calc.tipoDose === 'dia'
  const dosesDia = porDia ? (dosesPorDia(calc.frequencia) || 0) : 1
  const doseDiariaMg = porDia && pesoKg && doseAlvoMgKg ? pesoKg * doseAlvoMgKg : 0
  const doseCalculadaMg = pesoKg && doseAlvoMgKg ? (porDia ? (dosesDia ? doseDiariaMg / dosesDia : 0) : pesoKg * doseAlvoMgKg) : 0
  const passo = numBR(calc.arredondar)
  const doseTotalMg = doseCalculadaMg && passo ? Math.max(passo, Math.round(doseCalculadaMg / passo) * passo) : doseCalculadaMg
  const concentracaoMgMl = apresentacaoMg && diluenteMl ? apresentacaoMg / diluenteMl : 0
  const volumeAspirarMl = doseTotalMg && concentracaoMgMl ? doseTotalMg / concentracaoMgMl : 0
  return { pesoKg, doseAlvoMgKg, apresentacaoMg, diluenteMl, soroMl, doseTotalMg, doseCalculadaMg, doseDiariaMg, dosesDia, porDia, concentracaoMgMl, volumeAspirarMl }
}
