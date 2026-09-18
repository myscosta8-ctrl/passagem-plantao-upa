const CHAVE = 'tema_v1'

// Claro é o padrão (uso real é sob luz forte de UPA o dia inteiro) — escuro
// fica disponível pra quem prefere, salvo por aparelho.
export function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE) === 'escuro' ? 'escuro' : 'claro'
  } catch {
    return 'claro'
  }
}

export function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema)
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // localStorage indisponível — tema só não persiste entre sessões
  }
}

export function alternarTema() {
  const atual = document.documentElement.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro'
  const novo = atual === 'escuro' ? 'claro' : 'escuro'
  aplicarTema(novo)
  return novo
}
