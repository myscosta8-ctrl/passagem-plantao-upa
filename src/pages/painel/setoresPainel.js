// Nomes e ocupação dos setores do Painel de Leitos (sem tela; usados pelos cards e pelo topo).

export function formatarNomeSetor(nome) {
  if (!nome) return ''
  const n = nome.toLowerCase()
  if (n.includes('vermelha')) return 'Sala Vermelha - Emergência'
  if (n === 'internação' || n === 'internacao') return 'Internação Adulto'
  if (n.includes('pediátr') || n.includes('pediatr')) return 'Observação Pediátrica'
  if (n.includes('observa')) return 'Sala Amarela - Observação Adulto'
  return nome
}

// Nome dos botões de setor no topo do painel: Sala Vermelha, Internação, Pediatria, Observação.
// Outros setores (ex.: Isolamento, Observação Feminina) aparecem com o próprio nome.
export function nomeCurto(nome) {
  const n = String(nome || '').trim().toLowerCase()
  if (n.includes('vermelha')) return 'Sala Vermelha'
  if (n.includes('pediátr') || n.includes('pediatr')) return 'Pediatria'
  if (n.startsWith('internação') || n.startsWith('internacao')) return 'Internação'
  if (n === 'observação' || n === 'observacao') return 'Observação'
  return String(nome || '').trim()
}

export function contarSetores(setores, leitos, pacientesPorLeito) {
  return (setores || [])
    .map((s) => {
      const doSetor = (leitos || []).filter((l) => l.setor_id === s.id)
      return { id: s.id, nome: nomeCurto(s.nome), ocupados: doSetor.filter((l) => pacientesPorLeito?.[l.id]).length, total: doSetor.length }
    })
    .filter((s) => s.total > 0)
}

