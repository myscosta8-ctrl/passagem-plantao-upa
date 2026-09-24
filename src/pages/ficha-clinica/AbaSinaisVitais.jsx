import { useEffect, useState } from 'react';
import { listarSinaisVitais, registrarSinaisVitais } from '../../lib/pepClinico';
import { SV_VAZIO } from './constantes';

export default function AbaSinaisVitais({ atendimento, autorId }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(SV_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarSinaisVitais(atendimento.atendimento_id))
    setCarregando(false)
  }

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function registrar() {
    setErro('')
    setSalvando(true)
    const { error } = await registrarSinaisVitais({ atendimentoId: atendimento.atendimento_id, registradoPor: autorId, dados })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setDados(SV_VAZIO)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Novo registro</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field"><label>PA sistólica</label><input type="number" value={dados.pa_sistolica} onChange={(e) => set('pa_sistolica', e.target.value)} /></div>
        <div className="form-field"><label>PA diastólica</label><input type="number" value={dados.pa_diastolica} onChange={(e) => set('pa_diastolica', e.target.value)} /></div>
        <div className="form-field"><label>FC</label><input type="number" value={dados.fc} onChange={(e) => set('fc', e.target.value)} /></div>
        <div className="form-field"><label>FR</label><input type="number" value={dados.fr} onChange={(e) => set('fr', e.target.value)} /></div>
        <div className="form-field"><label>SpO2</label><input type="number" value={dados.spo2} onChange={(e) => set('spo2', e.target.value)} /></div>
        <div className="form-field"><label>Temperatura</label><input type="number" step="0.1" value={dados.temperatura} onChange={(e) => set('temperatura', e.target.value)} /></div>
        <div className="form-field"><label>Glicemia</label><input type="number" value={dados.glicemia} onChange={(e) => set('glicemia', e.target.value)} /></div>
        <div className="form-field"><label>Dor (0-10)</label><input type="number" min="0" max="10" value={dados.dor_escala} onChange={(e) => set('dor_escala', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando}>
        {salvando ? 'Registrando...' : 'Registrar'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum registro ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr>
                <th>Data/hora</th><th>PA</th><th>FC</th><th>FR</th><th>SpO2</th><th>Temp.</th><th>Glicemia</th><th>Dor</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((sv) => (
                <tr key={sv.id}>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(sv.registrado_em).toLocaleString('pt-BR')}</td>
                  <td>{sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'}</td>
                  <td>{sv.fc ?? '—'}</td>
                  <td>{sv.fr ?? '—'}</td>
                  <td>{sv.spo2 ?? '—'}</td>
                  <td>{sv.temperatura ? `${sv.temperatura}°C` : '—'}</td>
                  <td>{sv.glicemia ?? '—'}</td>
                  <td>{sv.dor_escala ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

