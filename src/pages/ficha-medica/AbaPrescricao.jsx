import { useEffect, useState } from 'react';
import { listarPrescricoes, criarPrescricao, cancelarPrescricao, listarCatalogoMedicamentos } from '../../lib/pepMedico';
import { VIAS } from './constantes';


function AutocompleteMedicamento({ catalogo, valor, onChange, onSelecionar }) {
  const [aberto, setAberto] = useState(false)
  const termo = valor.trim().toLowerCase()
  const sugestoes = termo.length >= 2
    ? catalogo.filter((m) => m.nome.toLowerCase().includes(termo)).slice(0, 8)
    : []

  return (
    <div className="autocomplete-wrap">
      <input
        type="text"
        value={valor}
        onChange={(e) => { onChange(e.target.value); setAberto(true) }}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        autoComplete="off"
      />
      {aberto && sugestoes.length > 0 && (
        <div className="autocomplete-lista">
          {sugestoes.map((m) => (
            <button
              key={m.id}
              type="button"
              className="autocomplete-item"
              onMouseDown={(e) => { e.preventDefault(); onSelecionar(m); setAberto(false) }}
            >
              <span className="autocomplete-item-nome">{m.nome}</span>
              <span className="autocomplete-item-sub">
                {m.forma_farmaceutica}
                {m.classe_controlada ? ` · ${m.classe_controlada}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ITEM_VAZIO = { medicamento_nome: '', dose: '', dose_unidade: '', via: 'VO', frequencia: '', duracao: '', instrucoes: '', sn_aplic: false, horario_aplicacao: '', diluicao: '' }
const ORIENTACAO_VAZIA = { texto: '', frequencia: '' }
const CALC_VAZIA = { pesoKg: '', doseAlvoMgKg: '', apresentacaoMg: '', diluenteMl: '', soroMl: '' }

function CalculadoraDosePediatrica({ item, calc, onChange, onAplicar, onCancelar, pacienteNome, pacientePeso }) {
  const pesoKg = Number(calc.pesoKg) || pacientePeso || 0
  const doseAlvoMgKg = Number(calc.doseAlvoMgKg) || 0
  const apresentacaoMg = Number(calc.apresentacaoMg) || 0
  const diluenteMl = Number(calc.diluenteMl) || 0
  const soroMl = Number(calc.soroMl) || 0

  const doseTotalMg = pesoKg && doseAlvoMgKg ? pesoKg * doseAlvoMgKg : 0
  const concentracaoMgMl = apresentacaoMg && diluenteMl ? apresentacaoMg / diluenteMl : 0
  const volumeAspirarMl = doseTotalMg && concentracaoMgMl ? doseTotalMg / concentracaoMgMl : 0

  const textoFinal = doseTotalMg && volumeAspirarMl
    ? `${item.medicamento_nome || 'Medicação'} — Diluir em ${diluenteMl} mL (AD/Diluente). Aspirar ${volumeAspirarMl.toFixed(1)} mL (${doseTotalMg.toFixed(0)} mg)${soroMl ? ` e rediluir em ${soroMl} mL de SF 0,9%` : ''}. Administrar conforme via prescrita.`
    : ''

  const podeAplicar = doseTotalMg > 0 && volumeAspirarMl > 0

  return (
    <div className="modal-overlay">
      <div className="modal-calc">
        <div className="modal-header">
          <h3><i className="ph ph-calculator"></i> Calculadora Pediátrica Injetável</h3>
          <button type="button" className="modal-close" onClick={onCancelar}><i className="ph ph-x"></i></button>
        </div>
        
        <div className="modal-body">
          <div className="calc-info-bar">
            <div className="calc-info-item">
              <label>Paciente</label>
              <span>{pacienteNome || 'Paciente'}</span>
            </div>
            <div className="calc-info-item" style={{ alignItems: 'flex-end' }}>
              <label>Peso (Base de Cálculo)</label>
              <span style={{ fontSize: 18 }}>
                <input type="number" step="0.1" style={{ width: 60, border: 'none', background: 'transparent', textAlign: 'right', fontWeight: 700, color: '#D97706', outline: 'none' }} value={calc.pesoKg || pacientePeso || ''} onChange={(e) => onChange('pesoKg', e.target.value)} /> kg
              </span>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-box" style={{ flex: 2 }}>
              <label>Medicação Selecionada</label>
              <input type="text" value={item.medicamento_nome || 'Selecione a medicação'} readOnly style={{ background: '#F8FAFC', fontWeight: 600 }} />
            </div>
            <div className="calc-box" style={{ flex: 1 }}>
              <label>Dose Alvo (mg/kg)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" step="0.1" value={calc.doseAlvoMgKg} onChange={(e) => onChange('doseAlvoMgKg', e.target.value)} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>mg</span>
              </div>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-box">
              <label>Apresentação</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" value={calc.apresentacaoMg} onChange={(e) => onChange('apresentacaoMg', e.target.value)} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>mg</span>
              </div>
            </div>
            <div className="calc-box">
              <label>Diluente da Ampola</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" value={calc.diluenteMl} onChange={(e) => onChange('diluenteMl', e.target.value)} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>mL (AD)</span>
              </div>
            </div>
            <div className="calc-box">
              <label>Soro de Rediluição</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" value={calc.soroMl} onChange={(e) => onChange('soroMl', e.target.value)} placeholder="Opcional" />
                <span style={{ fontSize: 11, fontWeight: 700 }}>mL (SF)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="calc-result-highlight" style={{ flex: 1 }}>
              <span>Dose Total Resultante</span>
              <strong>{doseTotalMg ? `${doseTotalMg.toFixed(0)} mg` : '—'}</strong>
            </div>
            <div className="calc-result-highlight" style={{ flex: 1, background: '#FFF1F2', borderColor: '#FECDD3' }}>
              <span style={{ color: '#BE123C' }}>Volume a Aspirar{concentracaoMgMl ? ` (${concentracaoMgMl.toFixed(0)}mg/mL)` : ''}</span>
              <strong style={{ color: '#BE123C' }}>{volumeAspirarMl ? `${volumeAspirarMl.toFixed(1)} mL` : '—'}</strong>
            </div>
          </div>

          {textoFinal && (
            <div className="calc-final-text">
              {textoFinal}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="btn-apply" onClick={onAplicar} disabled={!podeAplicar}>
            <i className="ph ph-check" /> Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}


export default function AbaPrescricao({ atendimento, medicoId, onImprimir, onFechar }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [dieta, setDieta] = useState('')
  const [itens, setItens] = useState([{ ...ITEM_VAZIO }])
  const [orientacaoEnfermagem, setOrientacaoEnfermagem] = useState([{ ...ORIENTACAO_VAZIA }])
  const [avaliacaoMultidisciplinar, setAvaliacaoMultidisciplinar] = useState('')
  const [hemocomponente, setHemocomponente] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [catalogo, setCatalogo] = useState([])
  const [calcAberto, setCalcAberto] = useState(null)
  const [calc, setCalc] = useState({ ...CALC_VAZIA })
  const [gruposFechados, setGruposFechados] = useState({})

  useEffect(() => { carregar() }, [])
  useEffect(() => { listarCatalogoMedicamentos().then(setCatalogo) }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarPrescricoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  function setItem(i, campo, valor) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }

  function selecionarMedicamento(i, m) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, medicamento_nome: m.nome, via: m.via_padrao || it.via } : it)))
  }

  function adicionarItem() {
    setItens((prev) => [...prev, { ...ITEM_VAZIO }])
  }

  function removerItem(i) {
    setItens((prev) => prev.filter((_, idx) => idx !== i))
    if (calcAberto === i) setCalcAberto(null)
  }

  function abrirCalculadora(i) {
    setCalc({ ...CALC_VAZIA })
    setCalcAberto(i)
  }

  function fecharCalculadora() {
    setCalcAberto(null)
  }

  function toggleGrupo(chave) {
    setGruposFechados((prev) => ({ ...prev, [chave]: !prev[chave] }))
  }

  function aplicarCalculadora(i) {
    const pesoKg = Number(calc.pesoKg) || 0
    const doseAlvoMgKg = Number(calc.doseAlvoMgKg) || 0
    const apresentacaoMg = Number(calc.apresentacaoMg) || 0
    const diluenteMl = Number(calc.diluenteMl) || 0
    const soroMl = Number(calc.soroMl) || 0
    const doseTotalMg = pesoKg && doseAlvoMgKg ? pesoKg * doseAlvoMgKg : 0
    const concentracaoMgMl = apresentacaoMg && diluenteMl ? apresentacaoMg / diluenteMl : 0
    const volumeAspirarMl = doseTotalMg && concentracaoMgMl ? doseTotalMg / concentracaoMgMl : 0
    if (!doseTotalMg || !volumeAspirarMl) return
    const nomeMedicamento = itens[i]?.medicamento_nome || 'Medicação'
    const textoFinal = `${nomeMedicamento} — Diluir em ${diluenteMl} mL (AD/Diluente). Aspirar ${volumeAspirarMl.toFixed(1)} mL (${doseTotalMg.toFixed(0)} mg)${soroMl ? ` e rediluir em ${soroMl} mL de SF 0,9%` : ''}. Administrar conforme via prescrita.`
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, dose: doseTotalMg.toFixed(0), dose_unidade: 'mg', diluicao: textoFinal } : it)))
    setCalcAberto(null)
  }

  function setOrientacao(i, campo, valor) {
    setOrientacaoEnfermagem((prev) => prev.map((o, idx) => (idx === i ? { ...o, [campo]: valor } : o)))
  }

  function adicionarOrientacao() {
    setOrientacaoEnfermagem((prev) => [...prev, { ...ORIENTACAO_VAZIA }])
  }

  function removerOrientacao(i) {
    setOrientacaoEnfermagem((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function salvar(imprimir = false) {
    const validos = itens.filter((it) => it.medicamento_nome.trim())
    if (validos.length === 0) {
      setErro('Adicione pelo menos um medicamento.')
      return
    }
    setErro('')
    setSalvando(true)
    const { data, error } = await criarPrescricao({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      medicoId,
      observacoes,
      itens: validos.map((it) => ({ ...it, dose: it.dose ? Number(it.dose) : null })),
      camposPrescricao: {
        dieta: dieta || null,
        orientacao_enfermagem: orientacaoEnfermagem.filter((o) => o.texto.trim()),
        avaliacao_multidisciplinar: avaliacaoMultidisciplinar || null,
        hemocomponente: hemocomponente || null,
      },
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar a prescrição. Tente de novo.')
      return
    }
    if (imprimir && data) onImprimir(data)
    setObservacoes('')
    setDieta('')
    setItens([{ ...ITEM_VAZIO }])
    setOrientacaoEnfermagem([{ ...ORIENTACAO_VAZIA }])
    setAvaliacaoMultidisciplinar('')
    setHemocomponente('')
    carregar()
  }

  async function cancelar(prescricaoId) {
    await cancelarPrescricao(prescricaoId, medicoId, 'Cancelada pelo médico')
    carregar()
  }

  return (
    <div className="clinical-split">
      <aside className="tools-pane">
        <div className="pane-header">
          <span><i className="ph ph-magic-wand"></i> Prescrição Inteligente</span>
        </div>
        <div className="tools-body">
          <div className="search-med">
            <i className="ph ph-magnifying-glass"></i>
            <input type="text" placeholder="Buscar medicamento no catálogo..." />
          </div>
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
              <i className="ph ph-list-plus" /> Adicionar Rápido
            </h3>
            <button type="button" className="template-btn" onClick={adicionarItem} style={{ width: '100%' }}>
              <div>
                <strong>Novo Medicamento</strong>
                <span>Prescrever item manual</span>
              </div>
              <span style={{ color: '#1D4ED8', fontSize: 16 }}>+</span>
            </button>
            <button type="button" className="template-btn" onClick={adicionarOrientacao} style={{ width: '100%' }}>
              <div>
                <strong>Nova Orientação</strong>
                <span>Adicionar cuidado de enf.</span>
              </div>
              <span style={{ color: '#1D4ED8', fontSize: 16 }}>+</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="clinical-card" style={{ flex: 1 }}>
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-pill" /> Prescrição Médica Hospitalar</h2>
            <p>Válida por 24 horas a partir da assinatura.</p>
          </div>
        </div>

        <div className="cc-body" id="presc-accordion" style={{ padding: 0 }}>
          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', margin: '16px 20px 0' }}>
              <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
            </div>
          )}

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* GRUPO 1: DIETA */}
            <div className={`presc-group${gruposFechados.dieta ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('dieta')}>
                <h3><i className="ph ph-fork-knife" /> 1. Dieta</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px' }}>
                <input type="text" className="form-control" placeholder="ex: Dieta oral livre, Dieta enteral padrão..." value={dieta} onChange={(e) => setDieta(e.target.value)} />
              </div>
            </div>

            {/* GRUPO 2: MEDICAMENTOS */}
            <div className={`presc-group${gruposFechados.medicamentos ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('medicamentos')}>
                <h3><i className="ph ph-pill" /> 2. Medicamentos</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list">
                {itens.map((it, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    
                    {/* Exibição consolidada (Item já parcialmente preenchido) */}
                    {it.medicamento_nome && (
                      <div className="presc-item">
                        <div className="item-num">{String(i + 1).padStart(2, '0')}</div>
                        <div className="item-details">
                          <div className="item-name">{it.medicamento_nome} {it.dose && `- ${it.dose} ${it.dose_unidade}`}</div>
                          <div className="item-sub">
                            <span><i className="ph ph-syringe"></i> {it.via || 'Via não def.'}</span>
                            <span><i className="ph ph-clock"></i> {it.frequencia || 'Frequência não def.'}</span>
                            {it.diluicao && <span><strong>Posologia:</strong> {it.diluicao}</span>}
                            {it.duracao && <span><i className="ph ph-calendar"></i> {it.duracao}</span>}
                          </div>
                        </div>
                        <div className="item-actions">
                          {itens.length > 1 && (
                            <button type="button" onClick={() => removerItem(i)}><i className="ph ph-trash" /></button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Formulário de Edição — compacto em 3 linhas */}
                    <div className="presc-input-row presc-input-row-compact">
                      <div className="presc-input-linha1">
                        <div className="item-num">{String(i + 1).padStart(2, '0')}</div>
                        <AutocompleteMedicamento
                          catalogo={catalogo}
                          valor={it.medicamento_nome}
                          onChange={(v) => setItem(i, 'medicamento_nome', v)}
                          onSelecionar={(m) => selecionarMedicamento(i, m)}
                        />
                        <button type="button" className="btn-calc-ped" onClick={() => abrirCalculadora(i)} title="Calculadora de Dose Pediátrica">
                          <i className="ph ph-calculator" /><i className="ph ph-baby" />
                        </button>
                        {itens.length > 1 && (
                          <button type="button" onClick={() => removerItem(i)} className="btn-remover-item" title="Remover">
                            <i className="ph ph-trash" />
                          </button>
                        )}
                      </div>

                      <div className="presc-input-linha2">
                        <input type="number" className="form-control" placeholder="Qtd" value={it.dose} onChange={(e) => setItem(i, 'dose', e.target.value)} />
                        <input type="text" className="form-control" placeholder="Und" value={it.dose_unidade} onChange={(e) => setItem(i, 'dose_unidade', e.target.value)} />
                        <select className="form-control" value={it.via} onChange={(e) => setItem(i, 'via', e.target.value)}>
                          {VIAS.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <input type="text" className="form-control" placeholder="Freq (6/6h)" value={it.frequencia} onChange={(e) => setItem(i, 'frequencia', e.target.value)} />
                        <input type="text" className="form-control" placeholder="Duração" value={it.duracao} onChange={(e) => setItem(i, 'duracao', e.target.value)} />
                      </div>

                      <div className="presc-input-linha3">
                        <input type="text" className="form-control" placeholder="Instruções / Diluição (Ex: Diluir em 10mL AD e fazer lento)" value={it.diluicao} onChange={(e) => setItem(i, 'diluicao', e.target.value)} />
                        <label className="presc-sn-toggle">
                          <input type="checkbox" checked={it.sn_aplic} onChange={(e) => setItem(i, 'sn_aplic', e.target.checked)} />
                          SN
                        </label>
                      </div>
                    </div>

                    {calcAberto === i && (
                      <CalculadoraDosePediatrica
                        item={it}
                        calc={calc}
                        pacienteNome={atendimento?.paciente?.nome}
                        pacientePeso={atendimento?.paciente?.peso}
                        onChange={(campo, valor) => setCalc((prev) => ({ ...prev, [campo]: valor }))}
                        onAplicar={() => aplicarCalculadora(i)}
                        onCancelar={fecharCalculadora}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GRUPO 3: ORIENTAÇÕES */}
            <div className={`presc-group${gruposFechados.orientacoes ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('orientacoes')}>
                <h3><i className="ph ph-first-aid-kit" /> 3. Cuidados e Orientações de Enfermagem</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {orientacaoEnfermagem.map((o, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'center' }}>
                    <input type="text" className="form-control" placeholder="ex: Monitorização contínua" value={o.texto} onChange={(e) => setOrientacao(i, 'texto', e.target.value)} />
                    <input type="text" className="form-control" placeholder="Frequência (ex: 6/6h)" value={o.frequencia} onChange={(e) => setOrientacao(i, 'frequencia', e.target.value)} />
                    {orientacaoEnfermagem.length > 1 && (
                      <button type="button" className="btn-cancel" style={{ padding: '6px 10px' }} onClick={() => removerOrientacao(i)}><i className="ph ph-trash" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GRUPO 4: MULTIDISCIPLINAR E HEMOCOMPONENTES */}
            <div className={`presc-group${gruposFechados.multi ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('multi')}>
                <h3><i className="ph ph-users-three" /> 4. Avaliação Multidisciplinar e Hemocomponentes</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Avaliação Multidisciplinar</label>
                  <textarea className="form-control-area" rows={2} value={avaliacaoMultidisciplinar} onChange={(e) => setAvaliacaoMultidisciplinar(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Hemocomponente</label>
                  <textarea className="form-control-area" rows={2} value={hemocomponente} onChange={(e) => setHemocomponente(e.target.value)} />
                </div>
              </div>
            </div>

            {/* GRUPO 5: OBSERVAÇÕES */}
            <div className={`presc-group${gruposFechados.observacoes ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('observacoes')}>
                <h3><i className="ph ph-note" /> 5. Observações da Prescrição</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px' }}>
                <textarea className="form-control-area" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>
            </div>

            {/* HISTÓRICO */}
            {historico.length > 0 && (
              <div className={`presc-group${gruposFechados.historico ? ' collapsed' : ''}`}>
                <div className="presc-group-header" onClick={() => toggleGrupo('historico')}>
                  <h3><i className="ph ph-clock-counter-clockwise" /> Histórico de Prescrições Anteriores</h3>
                  <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
                </div>
                <div className="presc-list" style={{ padding: '12px 16px' }}>
                  {historico.map((p) => (
                    <div key={p.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 12, fontSize: 12.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>
                          {(p.prescricao_itens ?? []).map((it) => it.medicamento_nome).join(', ')}
                        </span>
                        <span style={{ fontSize: 11, color: p.status === 'cancelada' ? '#DC2626' : 'var(--text-muted)' }}>
                          {p.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                        Prescrito por {p.enfermeiros?.nome_exibicao || p.enfermeiros?.nome} • {new Date(p.criado_em).toLocaleString('pt-BR')}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => onImprimir(p)}>
                          <i className="ph ph-printer" /> Imprimir 2ª via
                        </button>
                        {p.status === 'ativa' && (
                          <button type="button" className="btn-cancel" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => cancelar(p.id)}>
                            <i className="ph ph-x-circle" /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="cc-footer">
          <div>
            <button type="button" className="btn-cancel" onClick={onFechar}>
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
