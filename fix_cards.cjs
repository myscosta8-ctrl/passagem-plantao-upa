const fs = require('fs');

const jsx = `import { normalizarNome } from './constantes'
import './PainelCards.css'

export function formatarNomeSetor(nome) {
  if (!nome) return ''
  const n = nome.toLowerCase()
  if (n.includes('vermelha')) return 'Sala Vermelha - Emergência'
  if (n === 'internação' || n === 'internacao') return 'Internação Adulto'
  if (n.includes('pediátr') || n.includes('pediatr')) return 'Observação Pediátrica'
  if (n.includes('observa')) return 'Sala Amarela - Observação Adulto'
  return nome
}

export function formatarNumeroLeito(numero) {
  if (!numero) return ''
  const s = String(numero).trim()
  if (s.toLowerCase().includes('extra')) return s
  if (s === '17-ISO') return '17 (Isolamento)'
  if (s === '06-ISO') return '06 (Isolamento)'
  if (s === '09-ISO') return '09 (Isolamento)'
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && n < 10) return \`0\${n}\`
  return s
}

export function formatarNomePaciente(nome) {
  if (!nome) return 'Paciente N/I'
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => {
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(p)) return p
      return p.charAt(0).toUpperCase() + p.slice(1)
    })
    .join(' ')
}

export function obterClasseRisco(classificacao, setorNome) {
  if (classificacao) {
    const c = classificacao.toLowerCase()
    if (c.includes('verm') || c.includes('emerg')) return 'vermelho'
    if (c.includes('laran') || c.includes('muito')) return 'laranja'
    if (c.includes('amar') || c.includes('urg')) return 'amarelo'
    if (c.includes('verd') || c.includes('pouco')) return 'verde'
    if (c.includes('azul') || c.includes('não') || c.includes('nao')) return 'azul'
  }
  const s = (setorNome || '').toLowerCase()
  if (s.includes('verm') || s.includes('emerg')) return 'vermelho'
  if (s.includes('interna')) return 'laranja'
  return 'amarelo'
}

function formatarAdmissao(dataStr) {
  if (!dataStr) return 'Não informada'
  try {
    const d = new Date(dataStr.includes('T') ? dataStr : \`\${dataStr}T12:00:00\`)
    const hoje = new Date()
    const ehHoje = d.toDateString() === hoje.toDateString()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const ehOntem = d.toDateString() === ontem.toDateString()

    const hora = dataStr.includes('T')
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : ''

    if (ehHoje) return \`Hoje\${hora ? \`, \${hora}\` : ''}\`
    if (ehOntem) return \`Ontem\${hora ? \`, \${hora}\` : ''}\`
    
    const diffHoras = Math.floor((hoje - d) / (1000 * 60 * 60))
    if (diffHoras < 72 && diffHoras > 0) return \`Há \${diffHoras}h\`
    
    return \`\${d.toLocaleDateString('pt-BR')}\${hora ? \`, \${hora}\` : ''}\`
  } catch {
    return dataStr
  }
}

export function ordenarLeitos(a, b) {
  const an = String(a.numero).toLowerCase()
  const bn = String(b.numero).toLowerCase()
  const aEx = an.includes('extra')
  const bEx = bn.includes('extra')
  if (aEx && !bEx) return 1
  if (!aEx && bEx) return -1
  return an.localeCompare(bn, undefined, { numeric: true })
}

export default function PainelCards({
  setoresFiltrados,
  busca,
  onAbrirPassagem,
  onAbrirModalInternar,
  onAbrirRealocar,
  onAbrirLeitoExtra,
  onAbrirDesfecho,
}) {
  const buscaNorm = normalizarNome(busca || '')

  return (
    <>
      {setoresFiltrados
        .filter((setor) => {
          if (!buscaNorm) return true
          const bateSetor = normalizarNome(setor.nome).includes(buscaNorm)
          const leitosQueBatem = setor.leitos.some((leito) => {
            const numeroNorm = normalizarNome(leito.numero?.toString() || '')
            const paciente = leito.pacientes?.[0]
            if (!paciente) return numeroNorm.includes(buscaNorm)
            return (
              numeroNorm.includes(buscaNorm) ||
              normalizarNome(paciente.nome || '').includes(buscaNorm) ||
              normalizarNome(paciente.diagnostico || '').includes(buscaNorm)
            )
          })
          return bateSetor || leitosQueBatem
        })
        .map((setor) => {
          const ocupados = setor.leitos.filter((l) => l.pacientes?.length > 0).length
          const total = setor.leitos.length
          const perc = total > 0 ? (ocupados / total) * 100 : 0
          const colorPerc = perc > 90 ? 'var(--color-danger)' : perc > 70 ? 'var(--color-warning)' : 'var(--color-success)'

          let leitosDoSetor = setor.leitos.filter((leito) => {
            if (!buscaNorm) return true
            const numeroNorm = normalizarNome(leito.numero?.toString() || '')
            const paciente = leito.pacientes?.[0]
            if (paciente) {
              return (
                numeroNorm.includes(buscaNorm) ||
                normalizarNome(paciente.nome || '').includes(buscaNorm) ||
                normalizarNome(paciente.diagnostico || '').includes(buscaNorm)
              )
            }
            return numeroNorm.includes(buscaNorm)
          })
          
          leitosDoSetor.sort(ordenarLeitos)
          
          if (leitosDoSetor.length === 0) return null

          return (
            <section key={setor.id} className="setor-section">
              <header className="setor-header">
                <h2>{formatarNomeSetor(setor.nome)}</h2>
                <div className="setor-stats">
                  <span className="ocupacao-text" style={{ color: colorPerc }}>
                    {ocupados}/{total} ocupados
                  </span>
                  <div className="ocupacao-bar">
                    <div className="ocupacao-fill" style={{ width: \`\${perc}%\`, background: colorPerc }} />
                  </div>
                  <button
                    type="button"
                    className="btn-setor-extra"
                    onClick={() => onAbrirLeitoExtra(setor.id)}
                    title={\`Abrir leito extra em \${formatarNomeSetor(setor.nome)}\`}
                  >
                    <i className="ph ph-plus" /> Leito Extra
                  </button>
                </div>
              </header>

              <div className="leitos-grid">
                {leitosDoSetor.map((leito) => {
                  const paciente = leito.pacientes?.[0]
                  const classeRisco = paciente ? obterClasseRisco(paciente.classificacao_manchester, setor.nome) : ''

                  return paciente ? (
                    <div
                      key={leito.id}
                      className="leito-card"
                      onClick={() => onAbrirPassagem(paciente, leito)}
                    >
                      <div className={\`risk-bar \${classeRisco}\`} />

                      <div className="leito-header">
                        <div className={\`leito-numero \${leito.tipo === 'extra' ? 'extra' : ''}\`}>
                          <i className="ph ph-bed" /> Leito {formatarNumeroLeito(leito.numero)}
                        </div>
                        <div className={\`leito-status \${paciente.status_internacao === 'Internado' ? 'status-internado' : 'status-observacao'}\`}>
                          {paciente.status_internacao || 'Internado'}
                        </div>
                      </div>

                      <div className="leito-body">
                        <div className="paciente-nome">
                          {formatarNomePaciente(paciente.nome)}
                          {paciente.alergias && <span className="status-badge alerta" title="Possui Alergias"><i className="ph ph-warning-circle" /> Alergia</span>}
                        </div>

                        <div className="paciente-meta">
                          <span><i className="ph ph-user-circle" /> {paciente.idade ? \`\${paciente.idade} anos\` : 'Adulto'} • {paciente.sexo === 'F' ? 'Fem' : 'Masc'}</span>
                        </div>

                        <div className="paciente-hd">
                          <strong><i className="ph ph-stethoscope" /> HD:</strong> {paciente.diagnostico || 'Não registrado'}
                        </div>
                        
                        <div className="paciente-admissao">
                          <strong><i className="ph ph-clock" /> Entrada:</strong> {formatarAdmissao(paciente.data_admissao)}
                        </div>
                      </div>

                      <div className="leito-footer no-print" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="btn-footer action-btn" onClick={() => onAbrirPassagem(paciente, leito)}>
                          <i className="ph ph-folder-open" /> Prontuário
                        </button>
                        
                        <div className="footer-actions-right">
                          <button type="button" className="btn-footer icon-only" title="Realocar / Transferir" onClick={() => onAbrirRealocar({ paciente, leitoOrigem: leito })}>
                            <i className="ph ph-arrows-left-right" />
                          </button>
                          <button type="button" className="btn-footer icon-only danger" title="Sinalizar Desfecho" onClick={() => onAbrirDesfecho({ paciente, leitoOrigem: leito })}>
                            <i className="ph ph-sign-out" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={leito.id}
                      className="leito-card leito-vazio"
                      onClick={() => onAbrirModalInternar(leito)}
                    >
                      <i className="ph ph-plus-circle vazio-icon" />
                      <div className="vazio-title">Leito {formatarNumeroLeito(leito.numero)}</div>
                      <div className="vazio-subtitle">Livre • Clique p/ Internar</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
    </>
  )
}
`
fs.writeFileSync('src/pages/painel/PainelCards.jsx', jsx, 'utf8');
