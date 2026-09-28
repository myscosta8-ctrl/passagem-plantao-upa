// Número de administrações no dia a partir da frequência prescrita.
// "6/6h" → 4 · "8/8h" → 3 · "12/12h" → 2 · "24/24h" → 1 · "3x/dia" → 3 · "1x/dia"/"dose única" → 1.
// Contínuo, se necessário (SN) ou a critério médico (ACM) → null (não há número fixo de doses).
export function dosesPorDia(freq) {
  const f = String(freq || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '')
  if (!f || /continu|bic|\bsn\b|acm|senecessario|criterio/.test(f)) return null
  let m = f.match(/(\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)h/)
  if (m) { const h = parseFloat(m[2].replace(',', '.')); return h > 0 && h <= 24 ? Math.round(24 / h) : null }
  m = f.match(/(\d+)em(\d+)h/)
  if (m) { const h = Number(m[2]); return h > 0 && h <= 24 ? Math.round(24 / h) : null }
  m = f.match(/(\d+)x/)
  if (m) return Number(m[1]) || null
  if (/unica|1vez|agora|imediat/.test(f)) return 1
  return null
}

// Apresentações (unidade de dispensação) e siglas usadas na prescrição.
export const APRESENTACOES = [
  ['AMP', 'Ampola'], ['FA', 'Frasco-ampola'], ['FRS', 'Frasco'], ['BLS', 'Blister'], ['CP', 'Comprimido'],
  ['CPS', 'Cápsula'], ['BOL', 'Bolsa'], ['BIS', 'Bisnaga'], ['ENV', 'Envelope'], ['SER', 'Seringa'],
  ['SUP', 'Supositório'], ['TB', 'Tubo'], ['UN', 'Unidade'],
]

// Sugere a apresentação a partir da forma farmacêutica do catálogo.
export function apresentacaoDaForma(forma) {
  const f = String(forma || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (!f) return ''
  if (/frasco-ampola|po (para )?(solucao )?injet|^po\b(?!.*oral)/.test(f)) return 'FA'
  if (/infusao|bolsa/.test(f)) return 'BOL'
  if (/injet|ampola/.test(f)) return 'AMP'
  if (/capsula/.test(f)) return 'CPS'
  if (/comprimido/.test(f)) return 'CP'
  if (/supositorio/.test(f)) return 'SUP'
  if (/seringa/.test(f)) return 'SER'
  if (/creme|pomada|gel/.test(f)) return 'BIS'
  if (/envelope|po para solucao oral/.test(f)) return 'ENV'
  if (/oral|suspensao|xarope|frasco|gotas|colirio|inalador|nebuliz|spray|solucao/.test(f)) return 'FRS'
  return ''
}

const num = (v) => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : null }
const br = (n) => String(Math.round(n * 100) / 100).replace('.', ',')

// Quantidade do dia: "4 AMP" (6/6h × 1 ampola). Sem frequência fixa: a quantidade por dose ("1 AMP").
// Sem apresentação informada: cai para a dose ("1 g").
export function quantidadeDia(it) {
  const n = dosesPorDia(it.frequencia)
  const q = num(it.qtd_por_dose) ?? 1
  if (it.apresentacao) return n ? `${br(n * q)} ${it.apresentacao}` : `${br(q)} ${it.apresentacao}`
  return it.dose != null && it.dose !== '' ? `${String(it.dose).replace('.', ',')} ${it.dose_unidade || ''}`.trim() : ''
}
