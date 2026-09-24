import { useEffect, useState } from 'react';
import { buscarSumarioAlta, salvarSumarioAlta } from '../../lib/pepMedico';

export default function AbaSumarioAlta({ atendimento, medicoId, onImprimir }) {
  const [dados, setDados] = useState({
    data_internacao: '', data_alta: '',
    diagnostico_internacao: '', cid_internacao: '',
    diagnostico_alta: '', cid_alta: '',
    resumo_clinico: '', orientacoes_continuidade: '',
  })
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    buscarSumarioAlta(atendimento.atendimento_id).then((s) => {
      if (s) {
        setDados({
          data_internacao: s.data_internacao || '', data_alta: s.data_alta || '',
          diagnostico_internacao: s.diagnostico_internacao || '', cid_internacao: s.cid_internacao || '',
          diagnostico_alta: s.diagnostico_alta || '', cid_alta: s.cid_alta || '',
          resumo_clinico: s.resumo_clinico || '', orientacoes_continuidade: s.orientacoes_continuidade || '',
        })
        setSalvo(s)
      }
      setCarregando(false)
    })
  }, [atendimento.atendimento_id])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    setSalvando(true)
    const { data } = await salvarSumarioAlta({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        data_internacao: dados.data_internacao || null, data_alta: dados.data_alta || null,
        diagnostico_internacao: dados.diagnostico_internacao || null, cid_internacao: dados.cid_internacao || null,
        diagnostico_alta: dados.diagnostico_alta || null, cid_alta: dados.cid_alta || null,
        resumo_clinico: dados.resumo_clinico || null, orientacoes_continuidade: dados.orientacoes_continuidade || null,
      },
    })
    setSalvando(false)
    setSucesso(true)
    setSalvo(data)
  }

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-clipboard-text" /> Sumário de Alta</h2>
          <p>Documento único por atendimento, editável até o fechamento.</p>
        </div>
      </div>

      <div className="cc-body">
        <div className="assess-grid">
          <div className="form-group">
            <label><i className="ph ph-calendar" /> Data de internação</label>
            <input type="date" value={dados.data_internacao} onChange={(e) => set('data_internacao', e.target.value)} />
          </div>
          <div className="form-group">
            <label><i className="ph ph-calendar-check" /> Data da alta</label>
            <input type="date" value={dados.data_alta} onChange={(e) => set('data_alta', e.target.value)} />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-virus" /> Diagnóstico de internação</div>
          <div className="assess-grid">
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label>Diagnóstico</label>
              <input type="text" value={dados.diagnostico_internacao} onChange={(e) => set('diagnostico_internacao', e.target.value)} />
            </div>
            <div className="form-group">
              <label>CID</label>
              <input type="text" placeholder="Ex: J18.9" value={dados.cid_internacao} onChange={(e) => set('cid_internacao', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-check-circle" /> Diagnóstico de alta</div>
          <div className="assess-grid">
            <div className="form-group">
              <label>Diagnóstico</label>
              <input type="text" value={dados.diagnostico_alta} onChange={(e) => set('diagnostico_alta', e.target.value)} />
            </div>
            <div className="form-group">
              <label>CID</label>
              <input type="text" placeholder="Ex: J18.9" value={dados.cid_alta} onChange={(e) => set('cid_alta', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label><i className="ph ph-text-align-left" /> Resumo clínico</label>
          <textarea value={dados.resumo_clinico} onChange={(e) => set('resumo_clinico', e.target.value)} />
        </div>

        <div className="form-group">
          <label><i className="ph ph-list-checks" /> Orientações para continuidade do tratamento</label>
          <textarea value={dados.orientacoes_continuidade} onChange={(e) => set('orientacoes_continuidade', e.target.value)} />
        </div>

        {sucesso && (
          <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="info" style={{ color: '#166534' }}>
              <i className="ph ph-check-circle" /> Sumário de alta salvo.
            </div>
          </div>
        )}
      </div>

      <div className="cc-footer">
        <span />
        <div style={{ display: 'flex', gap: 12 }}>
          {salvo && (
            <button type="button" className="btn-save-draft" onClick={() => onImprimir(salvo)}>
              <i className="ph ph-printer" /> Imprimir
            </button>
          )}
          <button className="btn-save-print" onClick={salvar} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar sumário'}
          </button>
        </div>
      </div>
    </div>
  )
}
