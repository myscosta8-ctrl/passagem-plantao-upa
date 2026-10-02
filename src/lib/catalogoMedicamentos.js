// Catálogo de medicamentos: princípio ativo + concentração + apresentação + nome comercial.
// Usado na busca da Prescrição e do Receituário.

const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// "Dipirona 500 mg/mL — Ampola 2 mL"
export function descricaoMedicamento(m) {
  if (!m) return ''
  const principio = [m.substancia_ativa || m.nome, m.concentracao].filter(Boolean).join(' ')
  const apresentacao = m.apresentacao || m.forma_farmaceutica
  return [principio, apresentacao].filter(Boolean).join(' — ')
}

// Texto gravado na prescrição/receita: "Dipirona 500 mg/mL — Ampola 2 mL (Novalgina)"
export function rotuloMedicamento(m) {
  const base = descricaoMedicamento(m)
  return m?.nome_comercial ? `${base} (${m.nome_comercial})` : base
}

// Busca sem acento por princípio ativo, nome comercial, concentração ou apresentação.
// Várias palavras = todas precisam aparecer ("dipi amp", "novalgina gotas").
export function filtrarCatalogo(catalogo, termo, limite = 12) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean)
  if (!palavras.length || normalizar(termo).trim().length < 2) return []
  const achados = []
  for (const m of catalogo) {
    const principio = normalizar(m.substancia_ativa || m.nome)
    const comercial = normalizar(m.nome_comercial)
    const texto = `${principio} ${comercial} ${normalizar(m.concentracao)} ${normalizar(m.apresentacao || m.forma_farmaceutica)}`
    if (!palavras.every((p) => texto.includes(p))) continue
    const p0 = palavras[0]
    const peso = principio.startsWith(p0) ? 0 : comercial.startsWith(p0) ? 1 : 2
    achados.push({ m, peso })
  }
  achados.sort((a, b) => a.peso - b.peso)
  return achados.slice(0, limite).map((a) => a.m)
}

// Linha de detalhes da sugestão: "Novalgina · EV · Controlado (Port. 344)"
export function detalheMedicamento(m) {
  return [
    m.nome_comercial,
    m.via_padrao,
    m.classe_controlada || (m.controlado ? 'Controlado' : ''),
    m.antimicrobiano ? 'Antimicrobiano' : '',
  ].filter(Boolean).join(' · ')
}
