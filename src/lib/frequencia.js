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
  m = f.match(/^(\d+)(?:\/)?h$/) || f.match(/acada(\d+)h/)
  if (m) { const h = Number(m[1]); return h > 0 && h <= 24 ? Math.round(24 / h) : null }
  if (/unica|1vez|agora|imediat/.test(f)) return 1
  return null
}

// Texto da quantidade diária: "4 × 1 g" (4 administrações de 1 g no dia).
export function quantidadeDia(dose, unidade, freq) {
  const n = dosesPorDia(freq)
  const d = dose != null && dose !== '' ? `${String(dose).replace('.', ',')} ${unidade || ''}`.trim() : ''
  if (!n) return d
  return d ? `${n} × ${d}` : `${n}×`
}
