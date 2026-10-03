// Idade em anos, meses e dias ("27A 8M 21D"), calculada sozinha a partir da data de nascimento
// do cadastro, na data do documento (não na data em que é reimpresso).
// nascimento: 'AAAA-MM-DD'; referencia: Date ou texto 'DD/MM/AAAA[, hh:mm]' (como os documentos
// guardam a data do registro). Sem nascimento válido → ''.
export function dataDeReferencia(referencia) {
  if (referencia instanceof Date) return referencia
  const m = String(referencia || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date()
}

export function idadeDetalhada(nascimento, referencia) {
  const m = String(nascimento || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const ref = dataDeReferencia(referencia)
  let anos = ref.getFullYear() - a
  let meses = ref.getMonth() + 1 - mes
  let dias = ref.getDate() - d
  if (dias < 0) { meses -= 1; dias += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate() }
  if (meses < 0) { anos -= 1; meses += 12 }
  if (anos < 0 || anos > 130) return ''
  return `${anos}A ${meses}M ${dias}D`
}
