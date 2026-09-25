import { useEffect, useState } from 'react';
import { listarAtestadosMedicos, criarAtestadoMedico } from '../../lib/pepMedico';

const HOJE = new Date().toISOString().slice(0, 10);

export default function AbaAtestadoMedico({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [cid, setCid] = useState('')
  const [diasAfastamento, setDiasAfastamento] = useState('')
  const [dataInicio, setDataInicio] = useState(HOJE)
  const [textoLivre, setTextoLivre] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarAtestadosMedicos(atendimento.atendimento_id)); setCarregando(false) }

  async function salvar() {
    if (!diasAfastamento) {
      setErro('Informe a quantidade de dias de afastamento.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarAtestadoMedico({
      atendimentoId: atendimento.atendimento_id,
      criadoPor: medicoId,
      dados: {
        cid: cid || null,
        dias_afastamento: Number(diasAfastamento),
        data_inicio: dataInicio,
        texto_livre: textoLivre || null,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setCid(''); setDiasAfastamento(''); setDataInicio(HOJE); setTextoLivre('')
    carregar()
  }

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-file-text" /> Atestado Médico</h2>
          <p>Documento de afastamento — via única.</p>
        </div>
      </div>

      <div className="cc-body">
        <div className="assess-grid">
          <div className="form-group">
            <label><i className="ph ph-calendar" /> Data de início</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="form-group">
            <label><i className="ph ph-clock-countdown" /> Dias de afastamento *</label>
            <input type="number" min="1" value={diasAfastamento} onChange={(e) => setDiasAfastamento(e.target.value)} />
          </div>
          <div className="form-group">
            <label><i className="ph ph-virus" /> CID (opcional)</label>
            <input type="text" placeholder="Ex: J11" value={cid} onChange={(e) => setCid(e.target.value.toUpperCase())} />
          </div>
        </div>

        <div className="form-group">
          <label><i className="ph ph-text-align-left" /> Observações (opcional)</label>
          <textarea value={textoLivre} onChange={(e) => setTextoLivre(e.target.value)} placeholder="Texto adicional a compor o atestado, se necessário." />
        </div>

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}>
              <i className="ph ph-warning" /> {erro}
            </div>
          </div>
        )}

        <div>
          <div className="form-section-box-title" style={{ position: 'static', marginBottom: 8 }}><i className="ph ph-clock-counter-clockwise" /> Histórico</div>
          {carregando ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Carregando...</p>
          ) : historico.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum atestado registrado ainda.</p>
          ) : historico.map((a) => (
            <div key={a.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 4px' }}>
                    {a.dias_afastamento} dia(s) a partir de {new Date(a.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {a.cid ? ` — CID ${a.cid}` : ''}
                  </p>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome} · {new Date(a.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
                <button type="button" className="btn-save-draft" onClick={() => onImprimir(a)}>
                  <i className="ph ph-printer" /> Imprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-footer">
        <span />
        <button className="btn-save-print" onClick={salvar} disabled={salvando}>
          <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Registrar atestado'}
        </button>
      </div>
    </div>
  )
}
