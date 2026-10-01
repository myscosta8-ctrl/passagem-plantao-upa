// Utilidades comuns às fichas SINAN (sem dependência de React nem de pdf-lib).
export const camposDe = (modelo) => modelo.secoes.flatMap((s) => s.campos)

export const visivel = (campo, dados) => !campo.quando || campo.quando(dados)

// Valor que vai para o papel: se o campo não se aplica e tem um código fixo para esse caso (ex.: Gestante = 6 - Não se aplica), usa ele.
export function valorEfetivo(campo, dados) {
  if (!visivel(campo, dados)) return campo.senao ?? ''
  if (campo.derivar) return campo.derivar(dados) ?? ''
  return dados[campo.chave] ?? ''
}

// Campos obrigatórios que estão vazios (só os que se aplicam).
export function pendencias(modelo, dados) {
  return camposDe(modelo).filter((c) => c.obrig && !c.espelho && !c.derivar && visivel(c, dados) && !String(dados[c.chave] ?? '').trim())
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
