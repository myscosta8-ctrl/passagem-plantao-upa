import { useEffect, useState } from 'react';
import { listarEventosAdversos, registrarEventoAdverso } from '../../lib/pepClinico';
import { CATEGORIAS_EVENTO_ADVERSO, GRAVIDADES_EVENTO_ADVERSO } from './constantes';

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
  const [itemExpandido, setItemExpandido] = useState(null)

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
    <div className="clinical-split">
      <aside className="timeline-pane">
        <div className="pane-header">
          <span><i className="ph ph-warning-octagon" /> Ocorrências Registradas</span>
        </div>
        <div className="timeline-list">
          {carregando ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Carregando...</p>
          ) : lista.length === 0 ? (
            <p style={{ fontSize: 11, color: '#94A3B8' }}>Nenhum evento adverso registrado.</p>
          ) : lista.map((e) => (
            <div
              key={e.id}
              className={`tl-item ${itemExpandido === e.id ? 'expanded' : ''}`}
              onClick={() => setItemExpandido((atual) => (atual === e.id ? null : e.id))}
            >
              <div className="tl-date">
                {new Date(e.ocorrido_em).toLocaleString('pt-BR')}
                <i className={`ph ph-caret-${itemExpandido === e.id ? 'up' : 'down'}`} />
              </div>
              <div className="tl-author">
                <i className="ph ph-user" /> {e.anonimo ? 'Relato anônimo' : (e.enfermeiros?.nome_exibicao || e.enfermeiros?.nome || '—')}
              </div>
              <div className="tl-preview">
                <strong>{e.categoria} · {e.gravidade}</strong><br />
                {e.descricao}
                {e.acao_imediata && <><br /><em>Ação imediata: {e.acao_imediata}</em></>}
              </div>
              {onImprimir && (
                <button
                  type="button"
                  className="tl-print"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    onImprimir({
                      classificacao: `${e.categoria} (${e.gravidade})`,
                      descricao: e.descricao,
                      conduta: e.acao_imediata || 'Ações imediatas adotadas conforme protocolo institucional.',
                      desfecho: 'Paciente sob observação contínua da equipe de enfermagem.',
                      criado_em: e.ocorrido_em,
                    })
                  }}
                >
                  <i className="ph ph-printer" /> Imprimir
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-warning-circle" /> Registrar Nova Intercorrência / Evento Adverso</h2>
            <p>Cultura justa de notificação — o objetivo é identificar falhas do processo, não punir quem relata. Pode ser registrado como anônimo.</p>
          </div>
        </div>

        <div className="cc-body">
          <div className="form-group">
            <label>Classificação / Tipo de Evento:</label>
            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {CATEGORIAS_EVENTO_ADVERSO.map((c) => (
                <label key={c} className="checkbox-item">
                  <input type="radio" name="categoria-evento" checked={categoria === c} onChange={() => setCategoria(c)} /> {c}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Gravidade:</label>
            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {GRAVIDADES_EVENTO_ADVERSO.map((g) => (
                <label key={g} className="checkbox-item">
                  <input type="radio" name="gravidade-evento" checked={gravidade === g} onChange={() => setGravidade(g)} /> {g}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label><i className="ph ph-text-align-left" /> Descrição Detalhada do Evento e Queixas do Paciente *</label>
            <textarea className="large" style={{ minHeight: 100 }} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva os sinais objetivos, sintomas relatados pelo paciente ou familiar..." />
          </div>

          <div className="form-group">
            <label><i className="ph ph-first-aid" /> Ação Imediata Tomada</label>
            <textarea style={{ minHeight: 70 }} value={acaoImediata} onChange={(e) => setAcaoImediata(e.target.value)} placeholder="Descreva as medidas imediatas adotadas pela enfermagem..." />
          </div>

          <label className="checkbox-item">
            <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} /> Registrar como anônimo
          </label>

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <span />
          <button className="btn-save-print" onClick={registrar} disabled={salvando || !categoria || !gravidade || !descricao.trim()}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Registrando...' : 'Registrar evento'}
          </button>
        </div>
      </div>
    </div>
  )
}
