import { useEffect, useState } from 'react';
import { listarEvolucoes, registrarEvolucao } from '../../lib/pepClinico';

export default function AbaEvolucao({ atendimento, autorId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarEvolucoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!texto.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEvolucao({ atendimentoId: atendimento.atendimento_id, autorId, texto: texto.trim() })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setTexto('')
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova evolução</div>
      <div className="form-field" style={{ marginBottom: 14 }}>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} placeholder="Descreva a evolução do paciente..." />
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !texto.trim()}>
        {salvando ? 'Registrando...' : 'Registrar evolução'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma evolução registrada ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr><th>Data/hora</th><th>Autor</th><th>Evolução</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {historico.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ color: 'var(--c-text-muted)', verticalAlign: 'top' }}>{new Date(ev.criado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ color: 'var(--c-primary)', fontWeight: 600, verticalAlign: 'top' }}>
                    {ev.enfermeiros?.nome_exibicao || ev.enfermeiros?.nome || 'Enfermagem'}
                  </td>
                  <td className="col-larga" style={{ whiteSpace: 'pre-wrap' }}>{ev.texto}</td>
                  <td style={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {onImprimir && (
                      <button
                        type="button"
                        className="btn-copiar"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                        onClick={() => onImprimir(ev)}
                      >
                        🖨️ Imprimir (SAE)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


