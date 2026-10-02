import { useEffect, useState } from 'react';
import { criarAtm, listarAtm, listarPrescricoes, buscarDadosParaSumario } from '../../lib/pepMedico';
import { ATM_VAZIA, ATM_RESTRITOS, atbRestrito, viaIntravenosa, atmPendentes, calculoDxIxT, atmsVigentes, alertasAtm, textoValidadeAtm, dataCurta } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'

// Solicitação de Autorização de Uso de Antimicrobiano (ATM) — modelo
// 11-formulario-antimicrobiano-atm.html. Documento interno obrigatório sempre
// que a Prescrição Médica inclui um antimicrobiano da lista de uso restrito:
// os pendentes vêm do banco (prescrições não invalidadas com antimicrobiano restrito EV e ainda sem ATM),
// então a fila aparece em qualquer aparelho e também para prescrição salva só como rascunho.

// Em pacote (vinda do "Finalizar e Imprimir" da prescrição): cada ATM finalizada entra na mesma
// impressão da prescrição; quando não sobra ATM pendente, o pacote inteiro é impresso.
export default function AbaAtm({  atendimento, medicoId, onImprimir, onFechar , headerTabs, emPacote = false, onAtmNoPacote, onImprimirPacoteAgora }) {
  const atdId = atendimento.atendimento_id
  const [pendentes, setPendentes] = useState([])
  const [vigentes, setVigentes] = useState(new Map()) // ATM mais recente de cada antimicrobiano + validade
  const [alertas, setAlertas] = useState([])
  const [base, setBase] = useState({}) // diagnóstico e data de internação do atendimento
  const [dados, setDados] = useState(ATM_VAZIA)
  const [origemPrescricao, setOrigemPrescricao] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const rascunho = useRascunho({ tabela: 'solicitacoes_atm', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  // Carrega a fila de ATM pendente e os dados da internação. Um rascunho reaberto (useRascunho) tem prioridade.
  async function carregarPendentes(preencher) {
    const [prescricoes, atms, sug] = await Promise.all([listarPrescricoes(atdId), listarAtm(atdId), buscarDadosParaSumario(atdId)])
    const lista = atmPendentes(prescricoes, atms)
    const b = { diagnostico: sug.diagnostico_internacao || '', data_internacao: sug.data_internacao || '' }
    setPendentes(lista); setBase(b); setVigentes(atmsVigentes(atms)); setAlertas(alertasAtm(prescricoes, atms))
    if (preencher) {
      setDados((prev) => (prev.medicamento || prev.justificativa_clinica ? prev : { ...ATM_VAZIA, ...b, ...(lista[0] || {}) }))
      if (lista[0]) setOrigemPrescricao(true)
    }
    return { lista, b }
  }
  useEffect(() => { carregarPendentes(true) }, [atdId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Intervalo ou tempo de uso mudou: refaz o DxIxT se ele estava vazio ou era o calculado automaticamente.
  function set(campo, valor) {
    setDados((prev) => {
      const next = { ...prev, [campo]: valor }
      if ((campo === 'intervalo' || campo === 'tempo_uso_dias') && (!prev.dxixt || prev.dxixt === calculoDxIxT(prev.intervalo, prev.tempo_uso_dias))) {
        next.dxixt = calculoDxIxT(next.intervalo, next.tempo_uso_dias)
      }
      return next
    })
  }

  function usarPendente(p, b = base) { setDados({ ...ATM_VAZIA, ...b, ...p }); setOrigemPrescricao(true); setErro('') }

  const restritoAtual = atbRestrito(dados.medicamento)
  const viaNaoEv = !!dados.via && !viaIntravenosa(dados.via)

  // ATM ainda válida do mesmo antimicrobiano (outra ficha, já finalizada).
  const vigenteAtual = restritoAtual ? vigentes.get(restritoAtual.rotulo) : null
  const duplicada = vigenteAtual && !vigenteAtual.rascunho && vigenteAtual.atm.id !== editandoId && (!vigenteAtual.validade || !vigenteAtual.validade.vencida)

  async function salvar(imprimir = false) {
    if (!dados.medicamento.trim() || !dados.justificativa_clinica.trim()) {
      setErro('Preencha ao menos o medicamento solicitado e a justificativa clínica.')
      return
    }
    if (imprimir && !(Number(dados.tempo_uso_dias) > 0)) {
      setErro('Informe o tempo de uso (dias): ele define a validade da ficha — enquanto válida, não é preciso emitir outra.')
      return
    }
    if (imprimir && duplicada) {
      setErro(`Já existe ATM ${textoValidadeAtm(vigenteAtual.validade)} para ${vigenteAtual.atm.medicamento}. Não é preciso emitir outra — para reimprimir, use o botão "ATM" na prescrição.`)
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
    if (imprimir && data && emPacote) {
      setEditandoId(null); setDataRegistro(''); setAviso('')
      const { lista, b } = await carregarPendentes(false)
      if (lista[0]) usarPendente(lista[0], b)
      else { setDados({ ...ATM_VAZIA, ...b }); setOrigemPrescricao(false) }
      onAtmNoPacote?.(data, lista.length === 0)
      return
    }
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')

    // Recarrega a fila (o antibiótico solicitado sai dela) e já abre o próximo pendente.
    const { lista, b } = await carregarPendentes(false)
    if (lista[0]) usarPendente(lista[0], b)
    else { setDados({ ...ATM_VAZIA, ...b }); setOrigemPrescricao(false) }
 
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
        {emPacote && (
          <div className="allergy-alert" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <div className="info" style={{ color: '#1E40AF', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <i className="ph ph-printer" /> <span><strong>Prescrição salva.</strong> Complete a ATM e clique em "Finalizar e Imprimir": ela sai junto com a prescrição{pendentes.length > 1 ? ` (${pendentes.length} ATMs pendentes)` : ''}, na mesma impressão.</span>
              <button type="button" className="btn-add-chip" style={{ marginLeft: 'auto' }} onClick={onImprimirPacoteAgora}>Imprimir a prescrição agora (ATM depois)</button>
            </div>
          </div>
        )}
        {pendentes.length > 0 && (
          <div className="allergy-alert" style={{ background: '#FFF7ED', borderColor: '#FDBA74' }}>
            <div className="info" style={{ color: '#9A3412', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <i className="ph ph-warning-circle" /> <strong>ATM pendente da prescrição:</strong>
              {pendentes.map((p) => (
                <button key={p.medicamento} type="button" className={'btn-add-chip' + (p.medicamento === dados.medicamento ? ' on' : '')} onClick={() => usarPendente(p)}
                  title={p.renovacao ? `ATM anterior venceu em ${dataCurta(p.venceu_em)} e o antimicrobiano continua prescrito` : undefined}>
                  {p.medicamento}{p.renovacao ? ` — renovação (venceu ${dataCurta(p.venceu_em)})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {alertas.length > 0 && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#B91C1C' }}>
              <i className="ph ph-alarm" /> <strong>Validade da ATM:</strong> {alertas.map((a) => `${a.medicamento} — ${a.texto}`).join('; ')}. O uso vai continuar? {alertas.some((a) => a.validade.vencida) ? 'Se sim, preencha a renovação (marcada acima como pendente); se não, suspenda o antimicrobiano na prescrição.' : 'Se sim, mantenha o antimicrobiano na prescrição — a renovação aparece aqui quando a ficha vencer; se não, suspenda-o.'}
            </div>
          </div>
        )}
        {vigentes.size > 0 && (
          <div className="allergy-alert" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
            <div className="info" style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span><i className="ph ph-shield-check" /> <strong>ATMs emitidas neste atendimento:</strong></span>
              {[...vigentes.values()].map((v) => (
                <span key={v.rotulo} style={{ color: v.rascunho ? undefined : v.validade?.vencida ? '#B91C1C' : v.validade && v.validade.diasRestantes <= 1 ? '#B45309' : '#166534' }}>
                  • {v.atm.medicamento} — {v.rascunho ? 'rascunho (não finalizada)' : textoValidadeAtm(v.validade)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clipboard-text" /> Diagnóstico Clínico / Infeccioso e Admissão</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group"><label>Diagnóstico</label><input type="text" value={dados.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></div>
            <div className="form-group"><label>Data de internação</label><input type="date" value={String(dados.data_internacao || '').slice(0, 10)} onChange={(e) => set('data_internacao', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-note-pencil" /> Justificativa Clínica para o Uso de Antimicrobiano Restrito *</div>
          <div className="form-group">
            <textarea className="form-control-area" rows="4" value={dados.justificativa_clinica} onChange={(e) => set('justificativa_clinica', e.target.value)} placeholder="Evolução, falha terapêutica prévia, exames (hemograma, PCR, culturas, imagem) e o que justifica o escalonamento." />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-pill" /> Tratamento Antimicrobiano Proposto</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="form-group"><label>Tratamento pretendido</label><input type="text" value={dados.tratamento_pretendido} onChange={(e) => set('tratamento_pretendido', e.target.value)} /></div>
            <div className="form-group"><label>Via</label><input type="text" placeholder="Ex: Endovenosa (EV)" value={dados.via} onChange={(e) => set('via', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ gridTemplateColumns: '1fr', marginTop: 12 }}>
            <div className="form-group">
              <label>Medicamento solicitado *
                {origemPrescricao && <span className="badge-2vias" style={{ background: 'var(--c-primary-soft, #CCFBF1)', color: 'var(--c-primary-hover, #0F766E)' }}>Da prescrição</span>}
                {dados.medicamento && !restritoAtual && <span className="badge-2vias">Fora da lista restrita</span>}
                {restritoAtual && viaNaoEv && <span className="badge-2vias">Via não intravenosa — ATM não exigida</span>}
                {duplicada && <span className="badge-2vias">Já há ATM {textoValidadeAtm(vigenteAtual.validade)}</span>}
              </label>
              <input type="text" list="atm-restritos" value={dados.medicamento} onChange={(e) => set('medicamento', e.target.value)} />
              <datalist id="atm-restritos">{ATM_RESTRITOS.map((a) => <option key={a.rotulo} value={a.rotulo} />)}</datalist>
            </div>
            <div className="form-group"><label>Posologia / Infusão</label><input type="text" placeholder="Reconstituição, diluição e tempo de infusão" value={dados.posologia} onChange={(e) => set('posologia', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 12 }}>
            <div className="form-group"><label>Dose</label><input type="text" value={dados.dose} onChange={(e) => set('dose', e.target.value)} /></div>
            <div className="form-group"><label>Intervalo</label><input type="text" placeholder="Ex: 6/6 horas" value={dados.intervalo} onChange={(e) => set('intervalo', e.target.value)} /></div>
            <div className="form-group"><label>Tempo de uso (dias) *</label><input type="number" min="1" value={dados.tempo_uso_dias} onChange={(e) => set('tempo_uso_dias', e.target.value)} /></div>
            <div className="form-group"><label>Regime</label>
              <select value={dados.regime} onChange={(e) => set('regime', e.target.value)}>
                <option value="">—</option><option>Contínuo</option><option>Intermitente</option><option>Dose única</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-calculator" /> Quantitativo Total do Tratamento Solicitado (DxIxT)</div>
          <div className="assess-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
            <div className="form-group"><label>Cálculo DxIxT</label><input type="text" placeholder="Ex: 4 doses/dia × 7 dias = 28 doses" value={dados.dxixt} onChange={(e) => set('dxixt', e.target.value)} /></div>
            <div className="form-group"><label>Ampolas</label><input type="text" value={dados.ampolas} onChange={(e) => set('ampolas', e.target.value)} /></div>
            <div className="form-group"><label>Frasco-ampolas</label><input type="text" value={dados.frasco_ampolas} onChange={(e) => set('frasco_ampolas', e.target.value)} /></div>
            <div className="form-group"><label>Bolsas SF 0,9%</label><input type="text" value={dados.bolsas} onChange={(e) => set('bolsas', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-flask" /> Parecer Farmacêutico e Controle de Estoque (CCIH / Farmácia Central)</div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>
            Preenchido pelo farmacêutico no documento impresso: parecer (de acordo / contrário), disponibilidade em estoque (integral / parcial / indisponível), observações, assinatura e carimbo.
          </p>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-list-checks" /> Antimicrobianos de Uso Restrito Institucional (Controle Obrigatório UPA Breves)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px', fontSize: 'var(--fs-xs)' }}>
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
