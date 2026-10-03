// Paginação das listas longas (Histórico Clínico): 15 registros por página e os botões
// ‹ 1 2 3 … 9 ›, com reticências quando há muitas páginas.
export const POR_PAGINA = 15

export function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const meio = [atual - 1, atual, atual + 1].filter((n) => n > 1 && n < total)
  return [1, ...(meio[0] > 2 ? ['…'] : []), ...meio, ...(meio[meio.length - 1] < total - 1 ? ['…'] : []), total]
}
