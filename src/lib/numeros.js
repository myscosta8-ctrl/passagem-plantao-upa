// Nº de prontuário / registro sem prefixo interno ("PEP-", "AT-", "REG-") e sem "#".
export function numeroLimpo(valor) {
  return valor ? String(valor).replace(/^#?\s*(PEP|AT|REG)-?/i, '').replace(/^#/, '') : ''
}
