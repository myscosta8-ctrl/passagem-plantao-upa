import { useEffect, useState } from 'react';
import { listarAtm, criarAtm } from '../../lib/pepMedico';
import { ATM_VAZIA, ATM_RESTRITOS, ATM_PENDENTES_KEY, atbRestrito } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'

// Solicitação de Autorização de Uso de Antimicrobiano (ATM) — modelo
// 11-formulario-antimicrobiano-atm.html. Documento interno obrigatório sempre
// que a Prescrição Médica inclui um antimicrobiano da lista de uso restrito:
// a prescrição grava os itens em sessionStorage e abre esta aba já preenchida.
function lerPendentes(atendimentoId) {
  try { return JSON.parse(sessionStorage.getItem(ATM_PENDENTES_KEY + ':' + atendimentoId) || '[]') } catch { return [] }
}
function gravarPendentes(atendimentoId, lista) {
  try {
    if (lista.length) sessionStorage.setItem(ATM_PENDENTES_KEY + ':' + atendimentoId, JSON.stringify(lista))
    else sessionStorage.removeItem(ATM_PENDENTES_KEY + ':' + atendimentoId)
  } catch { /* ignore */ }
}

export default function AbaAtm({  atendimento, medicoId, onImprimir, onFechar , headerTabs }) {
  const atdId = atendimento.atendimento_id
  const [pendentes, setPendentes] = useState(() => lerPendentes(atdId))
  const [dados, setDados] = useState(() => {
    const p = lerPendentes(atdId)[0]
    return p ? { ...ATM_VAZIA, ...p } : ATM_VAZIA
  })
  const [origemPrescricao, setOrigemPrescricao] = useState(() => lerPendentes(atdId).length > 0)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const rascunho = useRascunho({ tabela: 'solicitacoes_atm', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  function usarPendente(p) { setDados({ ...ATM_VAZIA, ...p }); setOrigemPrescricao(true); setErro('') }

  const restritoAtual = atbRestrito(dados.medicamento)

  async function salvar(imprimir = false) {
    if (!dados.medicamento.trim() || !dados.justificativa_clinica.trim()) {
      setErro('Preencha ao menos o medicamento solicitado e a justificativa clínica.')
      return
    }
    setErro('')
    setSalvando(true)
    const {
      medicamento, posologia, dose, intervalo, tempo_uso_dias, justificativa_clinica, ...extra
    } = dados
    const { data, error } = await criarAtm({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atdId, solicitanteId: medicoId,
      dados: {
        medicamento, posologia, dose, intervalo, justificativa_clinica,
        tempo_uso_dias: tempo_uso_dias ? Number(tempo_uso_dias) : null,
        campos_extra: extra,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')

    // Tira da fila o antibiótico que acabou de ser solicitado e já carrega o próximo.
    const restantes = pendentes.filter((p) => p.medicamento !== medicamento)
    gravarPendentes(atdId, restantes)
    setPendentes(restantes)
    if (restantes[0]) usarPendente(restantes[0])
    else { setDados(ATM_VAZIA); setOrigemPrescricao(false) }
 
  }

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-shield-warning" /> Solicitação de Autorização de Uso de Antimicrobiano (ATM)</h2>
          </div>
          {headerTabs}
      </div>

      <div className="cc-body">
        {pendentes.length > 0 && (
          <div className="allergy-alert" style={{ background: '#FFF7ED', borderColor: '#FDBA74' }}>
            <div className="info" style={{ color: '#9A3412', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <i className="ph ph-warning-circle" /> <strong>ATM pendente da prescrição:</strong>
              {pendentes.map((p) => (
                <button key={p.medicamento} type="button" className={'btn-add-chip' + (p.medicamento === dados.medicamento ? ' on' : '')} onClick={() => usarPendente(p)}>
                  {p.medicamento}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clipboard-text" /> 1. Diagnóstico Clínico / Infeccioso e Admissão</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group"><label>Diagnóstico</label><input type="text" value={dados.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></div>
            <div className="form-group"><label>Data de internação</label><input type="datetime-local" value={dados.data_internacao} onChange={(e) => set('data_internacao', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-note-pencil" /> 2. Justificativa Clínica para o Uso de Antimicrobiano Restrito *</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="4" value={dados.justificativa_clinica} onChange={(e) => set('justificativa_clinica', e.target.value)} placeholder="Evolução, falha terapêutica prévia, exames (hemograma, PCR, culturas, imagem) e o que justifica o escalonamento." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-pill" /> 3. Tratamento Antimicrobiano Proposto</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group"><label>Tratamento pretendido</label><input type="text" value={dados.tratamento_pretendido} onChange={(e) => set('tratamento_pretendido', e.target.value)} /></div>
            <div className="form-group"><label>Via</label><input type="text" placeholder="Ex: Endovenosa (EV)" value={dados.via} onChange={(e) => set('via', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ gridTemplateColumns: '1fr', marginTop: 12 }}>
            <div className="form-group">
              <label>Medicamento solicitado *
                {origemPrescricao && <span className="badge-2vias" style={{ background: 'var(--c-primary-soft, #CCFBF1)', color: 'var(--c-primary-hover, #0F766E)' }}>Da prescrição</span>}
                {dados.medicamento && !restritoAtual && <span className="badge-2vias">Fora da lista restrita</span>}
              </label>
              <input type="text" list="atm-restritos" value={dados.medicamento} onChange={(e) => set('medicamento', e.target.value)} />
              <datalist id="atm-restritos">{ATM_RESTRITOS.map((a) => <option key={a.rotulo} value={a.rotulo} />)}</datalist>
            </div>
            <div className="form-group"><label>Posologia / Infusão</label><input type="text" placeholder="Reconstituição, diluição e tempo de infusão" value={dados.posologia} onChange={(e) => set('posologia', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 12 }}>
            <div className="form-group"><label>Dose</label><input type="text" value={dados.dose} onChange={(e) => set('dose', e.target.value)} /></div>
            <div className="form-group"><label>Intervalo</label><input type="text" placeholder="Ex: 6/6 horas" value={dados.intervalo} onChange={(e) => set('intervalo', e.target.value)} /></div>
            <div className="form-group"><label>Tempo de uso (dias)</label><input type="number" min="1" value={dados.tempo_uso_dias} onChange={(e) => set('tempo_uso_dias', e.target.value)} /></div>
            <div className="form-group"><label>Regime</label>
              <select value={dados.regime} onChange={(e) => set('regime', e.target.value)}>
                <option value="">—</option><option>Contínuo</option><option>Intermitente</option><option>Dose única</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-calculator" /> 4. Quantitativo Total do Tratamento Solicitado (DxIxT)</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
            <div className="form-group"><label>Cálculo DxIxT</label><input type="text" placeholder="Ex: 4 doses/dia × 7 dias = 28 doses" value={dados.dxixt} onChange={(e) => set('dxixt', e.target.value)} /></div>
            <div className="form-group"><label>Ampolas</label><input type="text" value={dados.ampolas} onChange={(e) => set('ampolas', e.target.value)} /></div>
            <div className="form-group"><label>Frasco-ampolas</label><input type="text" value={dados.frasco_ampolas} onChange={(e) => set('frasco_ampolas', e.target.value)} /></div>
            <div className="form-group"><label>Bolsas SF 0,9%</label><input type="text" value={dados.bolsas} onChange={(e) => set('bolsas', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-flask" /> 5. Parecer Farmacêutico e Controle de Estoque (CCIH / Farmácia Central)</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Preenchido pelo farmacêutico no documento impresso: parecer (de acordo / contrário), disponibilidade em estoque (integral / parcial / indisponível), observações, assinatura e carimbo.
          </p>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-list-checks" /> 6. Antimicrobianos de Uso Restrito Institucional (Controle Obrigatório UPA Breves)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px', fontSize: 12 }}>
            {ATM_RESTRITOS.map((a) => {
              const ativo = restritoAtual === a
              return (
                <div key={a.rotulo} style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: ativo ? 700 : 400, color: ativo ? '#B91C1C' : 'var(--text-secondary)' }}>
                  <span style={{ color: '#B91C1C', fontWeight: 800 }}>•</span> {a.rotulo}
                </div>
              )
            })}
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
