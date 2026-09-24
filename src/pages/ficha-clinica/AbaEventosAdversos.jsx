import { useEffect, useState } from 'react';
import { listarEventosAdversos, registrarEventoAdverso } from '../../lib/pepClinico';

export default function AbaEventosAdversos({ atendimento, autorId, onImprimir }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [categoria, setCategoria] = useState('')
  const [gravidade, setGravidade] = useState('')
  const [descricao, setDescricao] = useState('')
  const [acaoImediata, setAcaoImediata] = useState('')
  const [anonimo, setAnonimo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarEventosAdversos(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!categoria || !gravidade || !descricao.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEventoAdverso({
      atendimentoId: atendimento.atendimento_id, relatorId: autorId, anonimo,
      categoria, gravidade, descricao: descricao.trim(), acaoImediata: acaoImediata.trim(),
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setCategoria(''); setGravidade(''); setDescricao(''); setAcaoImediata(''); setAnonimo(false)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Notificar evento adverso</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Cultura justa de notificação — o objetivo é identificar falhas do processo, não punir quem relata. Pode ser registrado como anônimo.
      </p>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Categoria</label>
          <div className="chip-group">
            {CATEGORIAS_EVENTO_ADVERSO.map((c) => (
              <button key={c} type="button" className={`chip ${categoria === c ? 'on' : ''}`} onClick={() => setCategoria(categoria === c ? '' : c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label>Gravidade</label>
          <div className="chip-group">
            {GRAVIDADES_EVENTO_ADVERSO.map((g) => (
              <button key={g} type="button" className={`chip ${gravidade === g ? 'on' : ''}`} onClick={() => setGravidade(gravidade === g ? '' : g)}>{g}</button>
            ))}
          </div>
        </div>
        <div className="form-field span-2"><label>Descrição *</label><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
        <div className="form-field span-2"><label>Ação imediata tomada</label><textarea rows={2} value={acaoImediata} onChange={(e) => setAcaoImediata(e.target.value)} /></div>
        <div className="form-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} />
            Registrar como anônimo
          </label>
        </div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !categoria || !gravidade || !descricao.trim()}>
        {salvando ? 'Registrando...' : 'Registrar evento'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : lista.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum evento adverso registrado.</p>
      ) : (
        lista.map((e) => (
          <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{e.categoria} · {e.gravidade}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{new Date(e.ocorrido_em).toLocaleString('pt-BR')}</span>
                {onImprimir && (
                  <button
                    type="button"
                    className="btn-copiar"
                    style={{ padding: '3px 8px', fontSize: 11 }}
                    onClick={() => onImprimir({
                      classificacao: `${e.categoria} (${e.gravidade})`,
                      descricao: e.descricao,
                      conduta: e.acao_imediata || 'Ações imediatas adotadas conforme protocolo institucional.',
                      desfecho: 'Paciente sob observação contínua da equipe de enfermagem.',
                      criado_em: e.ocorrido_em,
                    })}
                  >
                    🖨️ Imprimir
                  </button>
                )}
              </div>
            </div>
            <div style={{ marginTop: 4 }}>{e.descricao}</div>
            {e.acao_imediata && <div style={{ color: 'var(--c-text-muted)', fontSize: 12.5, marginTop: 2 }}>Ação imediata: {e.acao_imediata}</div>}
            <div style={{ color: 'var(--c-text-muted)', fontSize: 12, marginTop: 4 }}>
              {e.anonimo ? 'Relato anônimo' : (e.enfermeiros?.nome_exibicao || e.enfermeiros?.nome || '—')}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

