import { useEffect, useState } from 'react';
import { listarDispositivos, inserirDispositivo, removerDispositivo } from '../../lib/pepClinico';
import { TIPOS_DISPOSITIVO } from './constantes';

export default function AbaDispositivos({ atendimento }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('')
  const [localInsercao, setLocalInsercao] = useState('')
  const [trocaPrevista, setTrocaPrevista] = useState('')
  const [motivos, setMotivos] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarDispositivos(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function inserir() {
    if (!tipo) return
    setErro('')
    setSalvando(true)
    const { error } = await inserirDispositivo({
      atendimentoId: atendimento.atendimento_id,
      tipo,
      localInsercao,
      trocaPrevistaEm: trocaPrevista ? new Date(trocaPrevista).toISOString() : null,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar o dispositivo. Tente de novo.')
      console.error(error)
      return
    }
    setTipo('')
    setLocalInsercao('')
    setTrocaPrevista('')
    carregar()
  }

  async function remover(id) {
    await removerDispositivo({ id, motivo: motivos[id] || '' })
    carregar()
  }

  const ativos = lista.filter((d) => !d.removido_em)
  const removidos = lista.filter((d) => d.removido_em)

  return (
    <div className="form-section">
      <div className="form-section-title">Novo dispositivo</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Tipo</label>
          <div className="chip-group">
            {TIPOS_DISPOSITIVO.map((t) => (
              <button key={t} type="button" className={`chip ${tipo === t ? 'on' : ''}`} onClick={() => setTipo(tipo === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Local de inserção</label><input type="text" value={localInsercao} onChange={(e) => setLocalInsercao(e.target.value)} /></div>
        <div className="form-field"><label>Troca prevista</label><input type="date" value={trocaPrevista} onChange={(e) => setTrocaPrevista(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={inserir} disabled={salvando || !tipo}>
        {salvando ? 'Registrando...' : 'Registrar dispositivo'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativos</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : ativos.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum dispositivo ativo.</p>
      ) : (
        <div className="hist-tabela-wrap" style={{ marginBottom: 4 }}>
          <table className="hist-tabela">
            <thead>
              <tr><th>Tipo</th><th>Local</th><th>Inserido em</th><th>Troca prevista</th><th className="col-larga">Motivo da remoção</th><th></th></tr>
            </thead>
            <tbody>
              {ativos.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.tipo}</td>
                  <td>{d.local_insercao || '—'}</td>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(d.inserido_em).toLocaleString('pt-BR')}</td>
                  <td style={{ color: 'var(--c-text-muted)' }}>{d.troca_prevista_em ? new Date(d.troca_prevista_em).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="col-larga">
                    <input
                      type="text"
                      placeholder="Opcional"
                      value={motivos[d.id] || ''}
                      onChange={(e) => setMotivos((p) => ({ ...p, [d.id]: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td><button type="button" className="btn-fechar" onClick={() => remover(d.id)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {removidos.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Removidos</div>
          <div className="hist-tabela-wrap">
            <table className="hist-tabela">
              <thead>
                <tr><th>Tipo</th><th>Local</th><th>Removido em</th><th className="col-larga">Motivo</th></tr>
              </thead>
              <tbody>
                {removidos.map((d) => (
                  <tr key={d.id}>
                    <td>{d.tipo}</td>
                    <td>{d.local_insercao || '—'}</td>
                    <td style={{ color: 'var(--c-text-muted)' }}>{new Date(d.removido_em).toLocaleString('pt-BR')}</td>
                    <td className="col-larga" style={{ color: 'var(--c-text-muted)' }}>{d.motivo_remocao || '—'}</td>
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


