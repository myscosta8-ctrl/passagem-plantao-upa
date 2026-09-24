export function limparPrefixo(val) {
  if (!val) return ''
  return String(val).replace(/^[A-Za-z]+-/, '')
}

export function CampoComb({ cap, val, digitos, w }) {
  const limpo = (val || '').replace(/\D/g, '')
  const total = digitos || Math.max(limpo.length, 6)
  const casas = Array.from({ length: total }, (_, i) => limpo[i] || '')
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: 0 }}>
      <span className="cap">{cap}</span>
      <div className="sus-comb">
        {casas.map((d, i) => <span key={i} className="digito">{d}</span>)}
      </div>
    </div>
  )
}

export function CampoSus({ cap, val, w, full }) {
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: full ? '100%' : 0 }}>
      <span className="cap">{cap}</span>
      <span className="val">{val || '\u00A0'}</span>
    </div>
  )
}

export function Marca({ marcado }) {
  return <span className="caixa">({marcado ? 'X' : '\u00A0\u00A0'})</span>
}

export function Digitos({ valor, n }) {
  const limpo = (valor || '').replace(/\D/g, '')
  const casas = Array.from({ length: n }, (_, i) => limpo[i] || '')
  return <div className="sus-comb">{casas.map((d, i) => <span key={i} className="digito">{d}</span>)}</div>
}

// Data em 3 grupos de caixinhas (dd / mm / aaaa), igual ao formulário oficial.
export function CampoData({ cap, valorISO, w }) {
  const [ano, mes, dia] = valorISO ? valorISO.split('-') : ['', '', '']
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: 0 }}>
      <span className="cap">{cap}</span>
      <div className="sus-data">
        <Digitos valor={dia} n={2} /><span className="barra">/</span>
        <Digitos valor={mes} n={2} /><span className="barra">/</span>
        <Digitos valor={ano} n={4} />
      </div>
    </div>
  )
}

// DDD + número em caixinhas separadas, com sub-rótulos, igual ao original.
export function CampoTelefone({ cap, valor, w }) {
  const limpo = (valor || '').replace(/\D/g, '')
  const ddd = limpo.slice(0, 2)
  const numero = limpo.slice(2)
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: 0 }}>
      <span className="cap">{cap}</span>
      <div className="sus-tel">
        <div className="grupo"><span className="subcap">DDD</span><Digitos valor={ddd} n={2} /></div>
        <div className="grupo"><span className="subcap">Nº do telefone</span><Digitos valor={numero} n={9} /></div>
      </div>
    </div>
  )
}

// Sexo — checkbox + código fixo impresso ao lado (Masc. (X) 1 · Fem. ( ) 3),
// igual ao original: o número não é o dado, é rótulo fixo do formulário.
export function CampoSexo({ sexo }) {
  return (
    <div className="sus-field" style={{ flexGrow: 1, flexBasis: 0 }}>
      <span className="cap">9. Sexo</span>
      <div className="sus-sexo">
        <span className="sus-checkbox">Masc. <Marca marcado={sexo === 'M'} /> 1</span>
        <span className="sus-checkbox">Fem. <Marca marcado={sexo === 'F'} /> 3</span>
      </div>
    </div>
  )
}
