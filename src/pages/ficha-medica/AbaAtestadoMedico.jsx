import { useState } from 'react';
import { criarAtestadoMedico } from '../../lib/pepMedico';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'

const HOJE = new Date().toISOString().slice(0, 10);

export default function AbaAtestadoMedico({ atendimento, medicoId, onImprimir, onFechar }) {
  const [cid, setCid] = useState('')
  const [diasAfastamento, setDiasAfastamento] = useState('')
  const [dataInicio, setDataInicio] = useState(HOJE)
  const [textoLivre, setTextoLivre] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const rascunho = useRascunho({ tabela: 'atestados_medicos', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { cid: [cid, setCid], diasAfastamento: [diasAfastamento, setDiasAfastamento], dataInicio: [dataInicio, setDataInicio], textoLivre: [textoLivre, setTextoLivre] }, editandoId, setEditandoId, setDataRegistro, onCopiado: (m) => setAviso(m), onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')


  async function salvar(imprimir = false) {
    if (!diasAfastamento) {
      setErro('Informe a quantidade de dias de afastamento.')
      return
    }
    setErro('')
    setSalvando(true)
    const { data, error } = await criarAtestadoMedico({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
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
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
    setCid(''); setDiasAfastamento(''); setDataInicio(HOJE); setTextoLivre('')
  }

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
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

        {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}>
              <i className="ph ph-warning" /> {erro}
            </div>
          </div>
        )}

      </div>

      <div className="cc-footer">
        <div>
          <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}>
            <i className="ph ph-x-circle" /> Cancelar
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
            <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Finalizar e Imprimir'}
          </button>
        </div>
      </div>
    </div>
  )
}
