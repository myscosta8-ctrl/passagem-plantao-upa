import { useEffect, useState } from 'react';
import { listarTfd, criarTfd } from '../../lib/pepMedico';
import { TFD_VAZIA } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'

// Laudo Médico de Tratamento Fora de Domicílio — impresso 13-tratamento-fora-domicilio-tfd.html.
const SV = [['pa', 'PA (mmHg)', '120/80'], ['fc', 'FC (bpm)'], ['fr', 'FR (irpm)'], ['spo2', 'SpO₂ (%)'], ['tax', 'Tax (°C)'], ['hgt', 'HGT (mg/dL)']]
const TRANSPORTES = ['Fluvial', 'Terrestre', 'Aéreo', 'Fluvial / Terrestre com Acompanhante', 'Aéreo (UTI aérea)']

export default function AbaTfd({ atendimento, medicoId, onImprimir, onFechar }) {
  const [dados, setDados] = useState(TFD_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const rascunho = useRascunho({ tabela: 'tfd_solicitacoes', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar(imprimir = false) {
    if (!dados.diagnostico.trim() || !dados.tratamento_indicado.trim()) {
      setErro('Preencha ao menos o diagnóstico principal e o tratamento indicado no destino.')
      return
    }
    setErro('')
    setSalvando(true)
    const {
      historia_doenca_atual, exame_fisico, diagnostico, exame_complementar,
      tratamento_realizado, tratamento_indicado, tempo_provavel_dias,
      acompanhante_nome, acompanhante_relacao, ...extra
    } = dados
    const { data, error } = await criarTfd({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id, profissionalResponsavel: medicoId,
      dados: {
        historia_doenca_atual, exame_fisico, diagnostico, exame_complementar,
        tratamento_realizado, tratamento_indicado,
        tempo_provavel_dias: tempo_provavel_dias ? Number(tempo_provavel_dias) : null,
        acompanhante_nome, acompanhante_relacao,
        campos_extra: extra,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
    setDados(TFD_VAZIA)
  }

  const campo = (k, rotulo, props = {}) => (
    <div key={k} className="form-group" style={props.span ? { gridColumn: props.span } : undefined}>
      <label>{rotulo}</label>
      <input type={props.type || 'text'} placeholder={props.ph || ''} value={dados[k]} onChange={(e) => set(k, e.target.value)} />
    </div>
  )
  const area = (k, ph, rows = 3) => (
    <textarea className="form-control-area" rows={rows} value={dados[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} />
  )

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-body">
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-identification-card" /> Identificação do Laudo e Acompanhante</div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {campo('numero_laudo', 'Nº do laudo médico')}
            <div className="form-group"><label>Caráter</label>
              <select value={dados.carater} onChange={(e) => set('carater', e.target.value)}>
                <option value="">—</option><option>URGÊNCIA</option><option>ELETIVO REGULADO</option><option>URGÊNCIA / ELETIVO REGULADO</option>
              </select>
            </div>
            {campo('profissao', 'Profissão do paciente')}
            {campo('acompanhante_nome', 'Nome do acompanhante')}
            {campo('acompanhante_relacao', 'Parentesco / relação')}
            {campo('acompanhante_rg', 'RG do acompanhante')}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-notebook" /> 1. História da Doença Atual (HDA) e Justificativa de Deslocamento</div>
          <div className="form-group">{area('historia_doenca_atual', 'Início, evolução, tratamentos prévios e motivo do deslocamento.', 4)}</div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-stethoscope" /> 2. Exame Físico Geral e Específico Dirigido</div>
          <div className="form-group"><label>Estado geral</label>{area('exame_fisico', 'Ex: BEG, lúcido, orientado, afebril, anictérico, acianótico.', 2)}</div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 12 }}>
            {SV.map(([k, r, ph]) => campo('sv_' + k, r, { ph }))}
          </div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Avaliação segmentar</label>{area('avaliacao_segmentar', 'ACV, AR, abdome, extremidades.', 2)}</div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Exame dirigido (especialidade)</label>{area('exame_dirigido', 'Achados específicos que motivam o encaminhamento.', 3)}</div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clipboard-text" /> 3. Hipótese Diagnóstica e Indisponibilidade de Tratamento Local</div>
          <div className="assess-grid">
            {campo('diagnostico', 'Diagnóstico principal (CID) *', { ph: 'Ex: H16.0 — Úlcera de córnea' })}
            {campo('diagnostico_secundario', 'Diagnóstico secundário (CID)')}
          </div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Justificativa TFD</label>{area('justificativa_tfd', 'Por que o tratamento não pode ser feito em Breves / Marajó.', 3)}</div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-path" /> 4. Tratamentos Realizados e Dados do Encaminhamento TFD</div>
          <div className="form-group"><label>Exames complementares</label>{area('exame_complementar', 'Resultados relevantes.', 2)}</div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Tratamento realizado na UPA</label>{area('tratamento_realizado', '', 2)}</div>
          <div className="form-group" style={{ marginTop: 12 }}><label>Tratamento indicado no destino *</label>{area('tratamento_indicado', '', 2)}</div>
          <div className="assess-grid" style={{ marginTop: 12 }}>
            {campo('tempo_provavel_dias', 'Tempo provável de tratamento (dias)', { type: 'number' })}
            <div className="form-group"><label>Meio de transporte recomendado</label>
              <input type="text" list="tfd-transportes" value={dados.meio_transporte} onChange={(e) => set('meio_transporte', e.target.value)} />
              <datalist id="tfd-transportes">{TRANSPORTES.map((t) => <option key={t} value={t} />)}</datalist>
            </div>
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
