import { useState } from 'react';
import { registrarAlergia, inativarAlergia } from '../../lib/pepClinico';
import { useAlergias } from '../../lib/consultasPaciente';
import { GRAVIDADES } from './constantes';

export default function AbaAlergias({ atendimento, onFechar }) {
  // Lista do cache entre abas; registrar/inativar atualiza sozinho (lib/cache.js).
  const al = useAlergias(atendimento.pessoa_id)
  const lista = al.falhou ? Object.assign([], { falhou: true }) : (al.lista || [])
  const carregando = al.carregando
  const [substancia, setSubstancia] = useState('')
  const [reacao, setReacao] = useState('')
  const [gravidade, setGravidade] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function registrar() {
    if (!substancia.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarAlergia({ pessoaId: atendimento.pessoa_id, substancia: substancia.trim(), reacao, gravidade })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setSubstancia('')
    setReacao('')
    setGravidade('')
  }

  async function inativar(id) {
    await inativarAlergia(id)
  }

  const ativas = lista.filter((a) => a.status === 'ativa')
  const inativas = lista.filter((a) => a.status !== 'ativa')

  return (
    <div className="form-section">
      <div className="form-section-title">Nova alergia</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field"><label>Substância</label><input type="text" value={substancia} onChange={(e) => setSubstancia(e.target.value)} /></div>
        <div className="form-field"><label>Reação</label><input type="text" placeholder="ex: urticária, edema..." value={reacao} onChange={(e) => setReacao(e.target.value)} /></div>
        <div className="form-field">
          <label>Gravidade</label>
          <div className="chip-group">
            {GRAVIDADES.map((g) => (
              <button key={g} type="button" className={`chip ${gravidade === g ? 'on' : ''}`} onClick={() => setGravidade(gravidade === g ? '' : g)}>{g}</button>
            ))}
          </div>
        </div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn-cancel" onClick={onFechar}>
          <i className="ph ph-x-circle" /> Cancelar
        </button>
        <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !substancia.trim()}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativas</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : lista.falhou ? (
        <p style={{ color: '#B91C1C' }}><i className="ph ph-warning" /> Não foi possível carregar as alergias (falha de conexão). <button type="button" className="btn-add-chip" onClick={al.recarregar}>Tentar de novo</button></p>
      ) : ativas.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma alergia ativa registrada.</p>
      ) : (
        <div className="hist-tabela-wrap" style={{ marginBottom: 4 }}>
          <table className="hist-tabela">
            <thead>
              <tr><th>Substância</th><th>Reação</th><th>Gravidade</th><th></th></tr>
            </thead>
            <tbody>
              {ativas.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.substancia}</td>
                  <td className="col-larga">{a.reacao || '—'}</td>
                  <td>{a.gravidade ? <span className={`resumo-badge ${a.gravidade === 'Grave' ? 'danger' : a.gravidade === 'Moderada' ? 'warn' : 'ok'}`}>{a.gravidade}</span> : '—'}</td>
                  <td><button type="button" className="btn-fechar" onClick={() => inativar(a.id)}>Inativar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inativas.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Inativas</div>
          <div className="hist-tabela-wrap">
            <table className="hist-tabela">
              <thead>
                <tr><th>Substância</th><th>Reação</th><th>Gravidade</th></tr>
              </thead>
              <tbody>
                {inativas.map((a) => (
                  <tr key={a.id} style={{ color: 'var(--c-text-muted)' }}>
                    <td>{a.substancia}</td>
                    <td className="col-larga">{a.reacao || '—'}</td>
                    <td>{a.gravidade || '—'}</td>
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


