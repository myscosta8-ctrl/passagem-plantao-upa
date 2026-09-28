import { useEffect, useState } from 'react';
import { listarNotasIntercorrenciaMedica, criarNotaIntercorrenciaMedica } from '../../lib/pepMedico';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'

// Nota de Intercorrência Médica — impresso 09-nota-intercorrencia-medica.html.
// Colunas: descricao_evento (1), sinais_vitais_evento jsonb (2: exame físico + SV),
// conduta_tomada (3), notas (4: reavaliação e desfecho).
const VAZIA = {
  descricao: '', exame_fisico: '', pa: '', fc: '', fr: '', spo2: '', temp: '', hgt: '',
  condutas: '', desfecho: '',
};

export default function AbaNotaIntercorrenciaMedica({ atendimento, medicoId, onImprimir, onFechar }) {
  const [d, setD] = useState(VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const rascunho = useRascunho({ tabela: 'notas_intercorrencia_medica', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { d: [d, setD] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  const set = (campo, valor) => setD((p) => ({ ...p, [campo]: valor }))

  async function salvar(imprimir = false) {
    if (!d.descricao.trim() || !d.condutas.trim()) { setErro('Preencha ao menos o motivo/descrição da intercorrência e as condutas tomadas.'); return }
    setErro('')
    setSalvando(true)
    const { data, error } = await criarNotaIntercorrenciaMedica({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        medico_id: medicoId,
        data_hora: new Date().toISOString(),
        descricao_evento: d.descricao.trim(),
        sinais_vitais_evento: { exame_fisico: d.exame_fisico, pa: d.pa, fc: d.fc, fr: d.fr, spo2: d.spo2, temp: d.temp, hgt: d.hgt },
        conduta_tomada: d.condutas.trim(),
        notas: d.desfecho.trim() || null,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
    setD(VAZIA)
  }

  const sv = [['pa', 'PA (mmHg)', '120x80'], ['fc', 'FC (bpm)'], ['fr', 'FR (irpm)'], ['spo2', 'SpO₂ (%)'], ['temp', 'Tax (°C)'], ['hgt', 'HGT (mg/dL)']]

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-body">
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-bell-ringing" /> 1. Motivo do Chamado e Descrição da Intercorrência *</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="4" value={d.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Quem solicitou, horário, queixa e achados no momento do chamado." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-stethoscope" /> 2. Exame Físico no Momento da Avaliação</div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {sv.map(([k, rotulo, ph]) => (
              <div key={k} className="form-group"><label>{rotulo}</label><input type="text" placeholder={ph || ''} value={d[k]} onChange={(e) => set(k, e.target.value)} /></div>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <textarea className="form-control-area" rows="3" value={d.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} placeholder="Estado geral, neurológico, cardiorrespiratório, abdome, extremidades." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-first-aid" /> 3. Condutas Médicas Tomadas *</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="4" value={d.condutas} onChange={(e) => set('condutas', e.target.value)} placeholder="Medicações administradas, exames solicitados, cuidados e monitorização." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-arrows-clockwise" /> 4. Reavaliação e Desfecho</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="3" value={d.desfecho} onChange={(e) => set('desfecho', e.target.value)} placeholder="Resposta às medidas, novos sinais vitais e destino do paciente." />
          </div>
        </div>

        {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
          </div>
        )}

      </div>

      <div className="cc-footer">
        <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> Cancelar</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
        </div>
      </div>
    </div>
  )
}
