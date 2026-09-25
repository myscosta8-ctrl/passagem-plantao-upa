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

function CalculadoraDosePediatrica({ item, calc, onChange, onAplicar, onCancelar }) {
  const pesoKg = Number(calc.pesoKg) || 0
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
    <div className="form-section-box" style={{ background: '#FFFBEB', borderColor: '#FDE68A', gridColumn: 'span 2' }}>
      <div className="form-section-box-title"><i className="ph ph-calculator" /> Calculadora de Dose Pediátrica (EV/IM)</div>

      <div className="assess-grid">
        <div className="form-group">
          <label>Peso do paciente (kg)</label>
          <input type="number" step="0.1" value={calc.pesoKg} onChange={(e) => onChange('pesoKg', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Dose alvo (mg/kg)</label>
          <input type="number" step="0.1" value={calc.doseAlvoMgKg} onChange={(e) => onChange('doseAlvoMgKg', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Apresentação da ampola (mg)</label>
          <input type="number" value={calc.apresentacaoMg} onChange={(e) => onChange('apresentacaoMg', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Diluente inicial (mL)</label>
          <input type="number" value={calc.diluenteMl} onChange={(e) => onChange('diluenteMl', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Soro de rediluição (mL, opcional)</label>
          <input type="number" value={calc.soroMl} onChange={(e) => onChange('soroMl', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>Dose Total Resultante</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1D4ED8' }}>{doseTotalMg ? `${doseTotalMg.toFixed(0)} mg` : '—'}</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#BE123C', textTransform: 'uppercase' }}>Volume a Aspirar</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#BE123C' }}>{volumeAspirarMl ? `${volumeAspirarMl.toFixed(1)} mL` : '—'}</div>
        </div>
      </div>

      {textoFinal && (
        <div className="form-group">
          <label>Texto final sugerido para enfermagem</label>
          <div style={{ background: '#F8FAFC', border: '1px dashed var(--border-strong, #CBD5E1)', borderRadius: 8, padding: 12, fontSize: 12.5, fontFamily: 'monospace' }}>
            {textoFinal}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn-cancel" onClick={onCancelar}>
          <i className="ph ph-x" /> Cancelar
        </button>
        <button type="button" className="btn-add-chip" onClick={onAplicar} disabled={!podeAplicar}>
          <i className="ph ph-check" /> Aplicar à Prescrição
        </button>
      </div>
    </div>
  )
}


export default function AbaPrescricao({ atendimento, medicoId, onImprimir }) {
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

  async function salvar() {
    const validos = itens.filter((it) => it.medicamento_nome.trim())
    if (validos.length === 0) {
      setErro('Adicione pelo menos um medicamento.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarPrescricao({
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
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-pill" /> Prescrição Médica Hospitalar</h2>
          <p>Válida por 24 horas a partir da assinatura.</p>
        </div>
      </div>

      <div className="cc-body">
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-fork-knife" /> Dieta</div>
          <div className="form-group">
            <input type="text" placeholder="ex: Dieta oral livre, Dieta enteral padrão..." value={dieta} onChange={(e) => setDieta(e.target.value)} />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-syringe" /> Medicamentos</div>
          {itens.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed var(--border-strong)' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Medicamento</label>
                <AutocompleteMedicamento
                  catalogo={catalogo}
                  valor={it.medicamento_nome}
                  onChange={(v) => setItem(i, 'medicamento_nome', v)}
                  onSelecionar={(m) => selecionarMedicamento(i, m)}
                />
              </div>
              <div className="form-group">
                <label>Dose</label>
                <input type="number" value={it.dose} onChange={(e) => setItem(i, 'dose', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Unidade</label>
                <input type="text" placeholder="mg, ml..." value={it.dose_unidade} onChange={(e) => setItem(i, 'dose_unidade', e.target.value)} />
              </div>
              <div className="form-group">
                <label><i className="ph ph-syringe" /> Via</label>
                <select value={it.via} onChange={(e) => setItem(i, 'via', e.target.value)}>
                  {VIAS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label><i className="ph ph-clock" /> Frequência</label>
                <input type="text" placeholder="ex: 8/8h" value={it.frequencia} onChange={(e) => setItem(i, 'frequencia', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Duração</label>
                <input type="text" placeholder="ex: 7 dias" value={it.duracao} onChange={(e) => setItem(i, 'duracao', e.target.value)} />
              </div>
              <label className="checkbox-item">
                <input type="checkbox" checked={it.sn_aplic} onChange={(e) => setItem(i, 'sn_aplic', e.target.checked)} /> Se necessário (SN)
              </label>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Instruções / diluição</label>
                <input type="text" placeholder="ex: Diluir em 100mL SF 0,9% e correr em 30 minutos" value={it.diluicao} onChange={(e) => setItem(i, 'diluicao', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Instruções gerais</label>
                <input type="text" value={it.instrucoes} onChange={(e) => setItem(i, 'instrucoes', e.target.value)} />
              </div>
              <button type="button" className="btn-add-chip" style={{ justifySelf: 'flex-start' }} onClick={() => (calcAberto === i ? fecharCalculadora() : abrirCalculadora(i))}>
                <i className="ph ph-calculator" /> Calc. Pediátrica (EV/IM)
              </button>
              {itens.length > 1 && (
                <button type="button" className="btn-cancel" style={{ justifySelf: 'flex-start' }} onClick={() => removerItem(i)}>
                  <i className="ph ph-trash" /> Remover
                </button>
              )}
              {calcAberto === i && (
                <CalculadoraDosePediatrica
                  item={it}
                  calc={calc}
                  onChange={(campo, valor) => setCalc((prev) => ({ ...prev, [campo]: valor }))}
                  onAplicar={() => aplicarCalculadora(i)}
                  onCancelar={fecharCalculadora}
                />
              )}
            </div>
          ))}
          <button type="button" className="btn-add-chip" onClick={adicionarItem}>
            <i className="ph ph-plus" /> Adicionar medicamento
          </button>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-first-aid-kit" /> Orientação de enfermagem</div>
          {orientacaoEnfermagem.map((o, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, marginBottom: 8, alignItems: 'flex-end' }}>
              <div className="form-group">
                <label>Orientação</label>
                <input type="text" placeholder="ex: Monitorização contínua" value={o.texto} onChange={(e) => setOrientacao(i, 'texto', e.target.value)} />
              </div>
              <div className="form-group">
                <label><i className="ph ph-clock" /> Frequência</label>
                <input type="text" placeholder="ex: 6/6h, Contínuo..." value={o.frequencia} onChange={(e) => setOrientacao(i, 'frequencia', e.target.value)} />
              </div>
              {orientacaoEnfermagem.length > 1 && (
                <button type="button" className="btn-cancel" onClick={() => removerOrientacao(i)}>
                  <i className="ph ph-trash" />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-chip" onClick={adicionarOrientacao}>
            <i className="ph ph-plus" /> Adicionar orientação
          </button>
        </div>

        <div className="assess-grid">
          <div className="form-group">
            <label><i className="ph ph-users-three" /> Avaliação multidisciplinar</label>
            <textarea value={avaliacaoMultidisciplinar} onChange={(e) => setAvaliacaoMultidisciplinar(e.target.value)} />
          </div>
          <div className="form-group">
            <label><i className="ph ph-drop" /> Hemocomponente</label>
            <textarea value={hemocomponente} onChange={(e) => setHemocomponente(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label><i className="ph ph-note" /> Observações</label>
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
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
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma prescrição registrada ainda.</p>
          ) : (
            historico.map((p) => (
              <div key={p.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>
                    {(p.prescricao_itens ?? []).map((it) => it.medicamento_nome).join(', ')}
                  </span>
                  <span style={{ fontSize: 11, color: p.status === 'cancelada' ? '#DC2626' : 'var(--text-muted)' }}>
                    {p.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {p.enfermeiros?.nome_exibicao || p.enfermeiros?.nome} · {new Date(p.criado_em).toLocaleString('pt-BR')}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button type="button" className="btn-save-draft" onClick={() => onImprimir(p)}>
                    <i className="ph ph-printer" /> Imprimir
                  </button>
                  {p.status === 'ativa' && (
                    <button type="button" className="btn-cancel" onClick={() => cancelar(p.id)}>
                      <i className="ph ph-x-circle" /> Cancelar prescrição
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cc-footer">
        <span />
        <button className="btn-save-print" onClick={salvar} disabled={salvando}>
          <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Registrar prescrição'}
        </button>
      </div>
    </div>
  )
}
