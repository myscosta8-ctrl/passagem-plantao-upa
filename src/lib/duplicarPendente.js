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

// Duplicar qualquer outro documento (Atualização de Quadro, Nota de Intercorrência, Exames,
// Receituário, AIH, SBAR, documentos da equipe multiprofissional...): o histórico guarda o
// formulário já montado a partir do registro (ver copiaDocumento.js) e o useRascunho da aba
// daquela tabela, ao abrir, preenche a tela com ele — como documento NOVO.
let copia = null

export function definirCopia(tabela, estado, mensagem, filtro = null) {
  copia = { tabela, estado, mensagem, filtro }
}

// Olhar sem retirar (a aba escolhe a sub-aba certa antes de montar o formulário).
export function espiarCopia(tabela) {
  return copia?.tabela === tabela ? copia : null
}

export function retirarCopia(tabela, filtro = null) {
  if (!copia || copia.tabela !== tabela) return null
  if (copia.filtro && Object.entries(copia.filtro).some(([k, v]) => (filtro || {})[k] !== v)) return null
  const c = copia
  copia = null
  return c
}
