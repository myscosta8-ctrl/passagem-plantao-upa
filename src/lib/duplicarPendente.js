// Duplicar evolução a partir do Histórico Clínico: o histórico guarda aqui o
// registro escolhido e a aba de evolução, ao abrir, retira e preenche o formulário.
let pendente = null

export function definirDuplicacao(categoria, registro, mensagem) {
  pendente = { categoria, registro, mensagem }
}

export function retirarDuplicacao(categoria) {
  if (!pendente || pendente.categoria !== categoria) return null
  const p = pendente
  pendente = null
  return p
}
