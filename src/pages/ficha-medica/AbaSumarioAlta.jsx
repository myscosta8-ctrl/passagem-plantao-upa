import { avisarErro } from '../../lib/erros'
import { useEffect, useState } from 'react';
import { buscarSumarioAlta, salvarSumarioAlta, mensagemErroSalvar, buscarDadosParaSumario } from '../../lib/pepMedico';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { descartarRascunho } from '../../lib/documentos'

export default function AbaSumarioAlta({ atendimento, medicoId, onImprimir, onFechar }) {
  const [dados, setDados] = useState({
    data_internacao: '', data_alta: '',
    diagnostico_internacao: '', cid_internacao: '',
    diagnostico_alta: '', cid_alta: '',
    resumo_clinico: '', orientacoes_continuidade: '',
  })
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

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
        setCarregando(false)
        return
      }
      // Sumário novo: já traz o que foi registrado na admissão/AIH (o médico revisa).
      buscarDadosParaSumario(atendimento.atendimento_id).then((sug) => {
        const hoje = new Date()
        const hojeIso = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
        setDados((prev) => ({
          ...prev,
          data_internacao: prev.data_internacao || sug.data_internacao,
          data_alta: prev.data_alta || hojeIso,
          diagnostico_internacao: prev.diagnostico_internacao || sug.diagnostico_internacao,
          cid_internacao: prev.cid_internacao || sug.cid_internacao,
        }))
      }).finally(() => setCarregando(false))
    })
  }, [atendimento.atendimento_id])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar(imprimir = false) {
    setSalvando(true)
    const { data, error } = await salvarSumarioAlta({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro),
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        data_internacao: dados.data_internacao || null, data_alta: dados.data_alta || null,
        diagnostico_internacao: dados.diagnostico_internacao || null, cid_internacao: dados.cid_internacao || null,
        diagnostico_alta: dados.diagnostico_alta || null, cid_alta: dados.cid_alta || null,
        resumo_clinico: dados.resumo_clinico || null, orientacoes_continuidade: dados.orientacoes_continuidade || null,
      },
    })
    setSalvando(false)
    if (error || !data) { console.error(error); setSucesso(false); setErro(mensagemErroSalvar(error, 'o sumário de alta')); return }
    setErro('')
    setSucesso(true)
    setSalvo(data)
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
  }

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
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

        {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}

        {erro && (
  <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', marginTop: 16 }}>
    <div className="info" style={{ color: '#991B1B' }}><i className="ph ph-warning" /> {erro}</div>
  </div>
)}
        {sucesso && (
          <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="info" style={{ color: '#166534' }}>
              <i className="ph ph-check-circle" /> Sumário de alta salvo.
            </div>
          </div>
        )}
      </div>

      <div className="cc-footer">
        <div>
          <button type="button" className="btn-cancel" onClick={async () => { if (salvo?.situacao === 'rascunho') { if (!window.confirm('Cancelar descarta este rascunho em definitivo. Deseja continuar?')) return; const { error } = await descartarRascunho('sumarios_alta', salvo.id); if (error) { avisarErro('Sumário de alta', error); return } } onFechar?.() }}>
            <i className="ph ph-x-circle" /> Cancelar
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {salvo?.situacao === 'finalizado' && (
            <button type="button" className="btn-save-draft" onClick={() => onImprimir(salvo)}>
              <i className="ph ph-printer" /> Reimprimir
            </button>
          )}
          <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
            <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
          </button>
        </div>
      </div>
    </div>
  )
}
