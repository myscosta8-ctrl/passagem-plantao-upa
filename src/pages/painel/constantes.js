// Cores reais da classificação de risco Manchester — exceção deliberada à paleta
// única do design system, porque aqui a cor É o dado clínico, não decoração.
export const MANCHESTER_CORES = [
  { nome: 'Vermelho', cor: '#B3261E', texto: '#fff' },
  { nome: 'Laranja', cor: '#C2670A', texto: '#fff' },
  { nome: 'Amarelo', cor: '#C9A227', texto: '#3A2E00' },
  { nome: 'Verde', cor: '#15803d', texto: '#fff' },
  { nome: 'Azul', cor: '#14507D', texto: '#fff' },
]

export function normalizarNome(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
