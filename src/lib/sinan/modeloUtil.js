// Utilidades comuns às fichas SINAN (sem dependência de React nem de pdf-lib).
export const camposDe = (modelo) => modelo.secoes.flatMap((s) => s.campos)

// `quando` indica se o campo se aplica ao caso (ex.: data do óbito só com evolução = óbito).
// Na tela todos os campos ficam abertos para edição; `quando` só decide o código automático (`senao`) do papel.
export const visivel = (campo, dados) => !campo.quando || campo.quando(dados)

// Únicos campos obrigatórios, em todas as fichas: identificação do paciente e endereço completo.
export const OBRIGATORIOS = new Set(['data_notificacao', 'nome', 'data_nascimento', 'nome_mae', 'uf_residencia', 'municipio_residencia', 'bairro', 'logradouro', 'numero'])
export const ehObrigatorio = (campo) => OBRIGATORIOS.has(campo.chave) && !campo.espelho && !campo.derivar

// Códigos que a enfermagem não preenche (IBGE, CNES, código do logradouro): ficam fora da tela.
// Os da própria unidade/Breves continuam saindo no papel pelo preenchimento automático.
export const ehCodigoOculto = (campo) => /(^|_)(ibge|cnes)(_|$)|logradouro_codigo/.test(campo.chave)

// Valor que vai para o papel: o que foi digitado; vazio + campo que não se aplica com código fixo (ex.: Gestante = 6 - Não se aplica) usa o código.
export function valorEfetivo(campo, dados) {
  if (campo.derivar) return campo.derivar(dados) ?? ''
  const v = dados[campo.chave]
  if (v !== undefined && v !== null && String(v).trim() !== '') return v
  if (!visivel(campo, dados)) return campo.senao ?? ''
  return v ?? ''
}

// Obrigatórios que estão vazios.
export function pendencias(modelo, dados) {
  return camposDe(modelo).filter((c) => ehObrigatorio(c) && !String(dados[c.chave] ?? '').trim())
}

export function validarCampo(campo, valor) {
  const v = String(valor ?? '').trim()
  if (!v) return null
  if (campo.tipo === 'data') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v) || /^(\d{2})\/?(\d{2})\/?(\d{4})$/.exec(v)
    if (!m) return 'Data inválida'
  }
  if (campo.tipo === 'digitos' && !campo.alfa && v.replace(/\D/g, '').length > campo.digitos) return `Máximo de ${campo.digitos} dígitos`
  if ((campo.tipo === 'codigo' || campo.tipo === 'escolha') && campo.opcoes && !campo.opcoes.some(([c]) => c === v)) return 'Opção inválida'
  return null
}

// Data do formulário (AAAA-MM-DD) para o papel (DDMMAAAA).
export function dataParaPapel(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ''))
  return m ? `${m[3]}${m[2]}${m[1]}` : String(v || '').replace(/\D/g, '')
}
