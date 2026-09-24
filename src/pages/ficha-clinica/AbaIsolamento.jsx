import { useEffect, useState } from 'react';
import { listarIsolamentos, registrarIsolamento, encerrarIsolamento } from '../../lib/pepClinico';
import { TIPOS_ISOLAMENTO } from './constantes';

export default function AbaIsolamento({ atendimento, autorId }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [patogeno, setPatogeno] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarIsolamentos(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!tipo) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarIsolamento({ atendimentoId: atendimento.atendimento_id, tipo, motivo, patogenoSuspeito: patogeno, prescritoPor: autorId })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setTipo('')
    setMotivo('')
    setPatogeno('')
    carregar()
  }

  async function encerrar(id) {
    await encerrarIsolamento(id)
    carregar()
  }

  const ativos = lista.filter((i) => i.ativo)
  const encerrados = lista.filter((i) => !i.ativo)

  return (
    <div className="form-section">
      <div className="form-section-title">Nova precaução de isolamento</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Tipo</label>
          <div className="chip-group">
            {TIPOS_ISOLAMENTO.map((t) => (
              <button key={t} type="button" className={`chip ${tipo === t ? 'on' : ''}`} onClick={() => setTipo(tipo === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Motivo</label><input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
        <div className="form-field"><label>Patógeno suspeito</label><input type="text" value={patogeno} onChange={(e) => setPatogeno(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !tipo}>
        {salvando ? 'Registrando...' : 'Registrar isolamento'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativos</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : ativos.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum isolamento ativo.</p>
      ) : (
        <div className="hist-tabela-wrap" style={{ marginBottom: 4 }}>
          <table className="hist-tabela">
            <thead>
              <tr><th>Tipo</th><th>Motivo</th><th>Patógeno suspeito</th><th>Início</th><th></th></tr>
            </thead>
            <tbody>
              {ativos.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.tipo}</td>
                  <td className="col-larga">{i.motivo || '—'}</td>
                  <td>{i.patogeno_suspeito || '—'}</td>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(i.inicio_em).toLocaleString('pt-BR')}</td>
                  <td><button type="button" className="btn-fechar" onClick={() => encerrar(i.id)}>Encerrar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {encerrados.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Encerrados</div>
          <div className="hist-tabela-wrap">
            <table className="hist-tabela">
              <thead>
                <tr><th>Tipo</th><th>Motivo</th><th>Início</th><th>Fim</th></tr>
              </thead>
              <tbody>
                {encerrados.map((i) => (
                  <tr key={i.id} style={{ color: 'var(--c-text-muted)' }}>
                    <td>{i.tipo}</td>
                    <td className="col-larga">{i.motivo || '—'}</td>
                    <td>{new Date(i.inicio_em).toLocaleString('pt-BR')}</td>
                    <td>{i.fim_em ? new Date(i.fim_em).toLocaleString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}


