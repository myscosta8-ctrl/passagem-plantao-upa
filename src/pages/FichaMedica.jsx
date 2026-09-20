import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { listarEventosAuditoria } from '../lib/pepAtendimentos'
import {
  listarConsultas, criarConsulta,
  listarPrescricoes, criarPrescricao, cancelarPrescricao,
  listarAih, criarAih,
  listarCatalogoMedicamentos, listarCatalogoCid,
  buscarInternacao, atualizarDiagnosticoCid,
  listarExames, criarExame, atualizarExame,
  listarSorologias, criarSorologia, atualizarSorologia,
  listarHemoterapia, criarHemoterapia, marcarTransfundido,
  buscarPlanoTerapeutico, salvarPlanoTerapeutico,
  listarApac, criarApac,
  listarAtm, criarAtm,
  listarTfd, criarTfd,
  listarRegulacao, registrarRegulacao,
  buscarAberturaRegulacao, abrirRegulacao, encerrarRegulacao,
  listarMedicacoesContinuas, registrarMedicacaoContinua, suspenderMedicacaoContinua,
} from '../lib/pepMedico'
import FichaMedicaPrint from './FichaMedicaPrint'
import './PassagemForm.css'

const VIAS = ['VO', 'EV', 'IM', 'SC', 'SL', 'INAL', 'TOP', 'RET', 'VAG', 'OFT', 'IN', 'IO', 'Outra']
const ABAS = [
  { chave: 'consulta', rotulo: 'Consulta' },
  { chave: 'prescricao', rotulo: 'Prescrição' },
  { chave: 'aih', rotulo: 'AIH' },
  { chave: 'exames', rotulo: 'Exames' },
  { chave: 'plano', rotulo: 'Plano Terapêutico' },
  { chave: 'apac', rotulo: 'APAC' },
  { chave: 'atm', rotulo: 'ATM' },
  { chave: 'tfd', rotulo: 'TFD' },
  { chave: 'regulacao', rotulo: 'Regulação' },
  { chave: 'medicacoesContinuas', rotulo: 'Medicações Contínuas' },
  { chave: 'auditoria', rotulo: 'Auditoria' },
]

export default function FichaMedica({ atendimento, onFechar, embedded = false }) {
  const { enfermeiro } = useAuth()
  const [aba, setAba] = useState('consulta')
  const [imprimindo, setImprimindo] = useState(null) // { tipo, registro }

  if (imprimindo) {
    return (
      <FichaMedicaPrint
        atendimentoId={atendimento.atendimento_id}
        tipo={imprimindo.tipo}
        registro={imprimindo.registro}
        onVoltar={() => setImprimindo(null)}
      />
    )
  }

  const corpo = (
    <div className={embedded ? "ficha-clinica-embedded" : "form-panel"} onClick={(e) => e.stopPropagation()}>
      {!embedded && (
        <div className="form-header">
          <span className="form-leito-tag">Leito {atendimento.leito_numero} — {atendimento.nome}</span>
          <button className="form-header-close" onClick={onFechar}>×</button>
        </div>
      )}

        <DiagnosticoPrincipal atendimento={atendimento} medicoId={enfermeiro?.id} />

        <div className="form-toolbar">
          {ABAS.map((a) => (
            <button
              key={a.chave}
              className={a.chave === aba ? 'btn-realocar' : 'btn-copiar'}
              onClick={() => setAba(a.chave)}
            >
              {a.rotulo}
            </button>
          ))}
        </div>

        {aba === 'consulta' && <AbaConsulta atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'consulta', registro })} />}
        {aba === 'prescricao' && <AbaPrescricao atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'prescricao', registro })} />}
        {aba === 'aih' && <AbaAih atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'aih', registro })} />}
        {aba === 'exames' && <AbaExames atendimento={atendimento} />}
        {aba === 'plano' && <AbaPlanoTerapeutico atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'plano', registro })} />}
        {aba === 'apac' && <AbaApac atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'apac', registro })} />}
        {aba === 'atm' && <AbaAtm atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'atm', registro })} />}
        {aba === 'tfd' && <AbaTfd atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'tfd', registro })} />}
        {aba === 'regulacao' && <AbaRegulacao atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'regulacao', registro })} />}
        {aba === 'medicacoesContinuas' && <AbaMedicacoesContinuas atendimento={atendimento} medicoId={enfermeiro?.id} />}
        {aba === 'auditoria' && <AbaAuditoria atendimento={atendimento} />}

        {!embedded && (
          <div className="form-footer">
            <button className="btn-fechar" onClick={onFechar}>Fechar</button>
          </div>
        )}
      </div>
  )

  if (embedded) return corpo
  return <div className="form-overlay">{corpo}</div>
}

// Diagnóstico principal codificado da internação — sempre visível,
// independente da aba, porque alimenta o cabeçalho de qualquer documento
// impresso (distinto do CID da AIH, que é do procedimento solicitado).
function DiagnosticoPrincipal({ atendimento, medicoId }) {
  const [internacao, setInternacao] = useState(null)
  const [cids, setCids] = useState([])
  const [cid, setCid] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarInternacao(atendimento.atendimento_id).then((i) => { setInternacao(i); setCid(i?.diagnostico_cid || '') })
    listarCatalogoCid().then(setCids)
  }, [atendimento.atendimento_id])

  async function salvar() {
    setSalvando(true)
    await atualizarDiagnosticoCid(atendimento.atendimento_id, cid, medicoId)
    setSalvando(false)
    buscarInternacao(atendimento.atendimento_id).then(setInternacao)
  }

  if (!internacao) return null

  return (
    <div className="resumo-paciente" style={{ marginBottom: 4 }}>
      <div className="resumo-bloco" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="resumo-bloco-titulo">Diagnóstico principal (CID-10)</div>
          <select value={cid} onChange={(e) => setCid(e.target.value)} style={{ width: '100%' }}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <button className="modal-btn-secondary" onClick={salvar} disabled={salvando || cid === (internacao.diagnostico_cid || '')}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

// Modelo simplificado — segue à risca a referência oficial (5 blocos de
// texto livre + sinais vitais + assinatura), sem checkboxes nem tabelas.
const CONSULTA_VAZIA = {
  queixa_principal: '',
  antecedentes: '',
  exame_geral: '',
  sv: { pa: '', fc: '', fr: '', spo2: '', temp: '', dor: '' },
  sv_registrado_por: '',
  hipotese_diagnostica: '',
  cidade_uf: '', data_assinatura: '',
}

function AbaConsulta({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(CONSULTA_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarConsultas(atendimento.atendimento_id))
    setCarregando(false)
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }))
  }

  async function salvar() {
    if (!dados.queixa_principal.trim() || !dados.hipotese_diagnostica.trim()) {
      setErro('Preencha ao menos a queixa principal e a hipótese diagnóstica.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarConsulta({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      medicoId,
      dados,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar. Tente de novo.')
      return
    }
    setDados(CONSULTA_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova consulta (Admissão Médica)</div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 4 }}>Queixa principal e história da doença atual (HDA)</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Queixa principal, início, evolução, características e informações clínicas relevantes *</label>
          <textarea value={dados.queixa_principal} onChange={(e) => set('queixa_principal', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Antecedentes relevantes</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Doenças prévias, cirurgias, internações, alergias e medicamentos em uso</label>
          <textarea value={dados.antecedentes} onChange={(e) => set('antecedentes', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Exame físico e sinais vitais</div>
      <div className="form-grid">
        <div className="form-field span-3"><label>Exame físico</label><textarea value={dados.exame_geral} onChange={(e) => set('exame_geral', e.target.value)} /></div>
        {[['pa', 'PA (mmHg)'], ['fc', 'FC (bpm)'], ['fr', 'FR (irpm)'], ['spo2', 'SpO2 (%)'], ['temp', 'Temp. (°C)'], ['dor', 'Dor (0-10)']].map(([k, r]) => (
          <div className="form-field" key={k}><label>{r}</label><input type="text" value={dados.sv[k]} onChange={(e) => set('sv', { ...dados.sv, [k]: e.target.value })} /></div>
        ))}
        <div className="form-field"><label>Registrado por</label><input type="text" value={dados.sv_registrado_por} onChange={(e) => set('sv_registrado_por', e.target.value)} /></div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Impressão diagnóstica e conduta</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Hipótese/avaliação diagnóstica, conduta inicial, medicamentos, exames, observação e orientações *</label>
          <textarea value={dados.hipotese_diagnostica} onChange={(e) => set('hipotese_diagnostica', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Assinatura médica</div>
      <div className="form-grid">
        <div className="form-field"><label>Cidade/UF</label><input type="text" value={dados.cidade_uf} onChange={(e) => set('cidade_uf', e.target.value)} /></div>
        <div className="form-field"><label>Data</label><input type="date" value={dados.data_assinatura} onChange={(e) => set('data_assinatura', e.target.value)} /></div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
        Nome e CRM/UF do médico são preenchidos automaticamente pelo cadastro no impresso — só fica o espaço para assinatura/carimbo manual.
      </p>

      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Registrar consulta'}
        </button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma consulta registrada ainda.</p>
      ) : (
        historico.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.hipotese_diagnostica}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {c.queixa_principal} — {c.enfermeiros?.nome_exibicao || c.enfermeiros?.nome} · {new Date(c.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>
              <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(c)}>Imprimir</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

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

function AbaPrescricao({ atendimento, medicoId, onImprimir }) {
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
    <div className="form-section">
      <div className="form-section-title">Nova prescrição</div>

      <div className="form-field span-3">
        <label>Dieta</label>
        <input type="text" placeholder="ex: Dieta oral livre, Dieta enteral padrão..." value={dieta} onChange={(e) => setDieta(e.target.value)} />
      </div>

      <div className="form-section-title" style={{ fontSize: 13, marginTop: 16 }}>Medicamentos</div>
      {itens.map((it, i) => (
        <div key={i} className="form-grid" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed var(--color-border)' }}>
          <div className="form-field span-2">
            <label>Medicamento</label>
            <AutocompleteMedicamento
              catalogo={catalogo}
              valor={it.medicamento_nome}
              onChange={(v) => setItem(i, 'medicamento_nome', v)}
              onSelecionar={(m) => selecionarMedicamento(i, m)}
            />
          </div>
          <div className="form-field">
            <label>Dose</label>
            <input type="number" value={it.dose} onChange={(e) => setItem(i, 'dose', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Unidade</label>
            <input type="text" placeholder="mg, ml..." value={it.dose_unidade} onChange={(e) => setItem(i, 'dose_unidade', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Via</label>
            <select value={it.via} onChange={(e) => setItem(i, 'via', e.target.value)}>
              {VIAS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Frequência</label>
            <input type="text" placeholder="ex: 8/8h" value={it.frequencia} onChange={(e) => setItem(i, 'frequencia', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Duração</label>
            <input type="text" placeholder="ex: 7 dias" value={it.duracao} onChange={(e) => setItem(i, 'duracao', e.target.value)} />
          </div>
          <div className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" id={`sn-${i}`} checked={it.sn_aplic} onChange={(e) => setItem(i, 'sn_aplic', e.target.checked)} />
            <label htmlFor={`sn-${i}`} style={{ margin: 0 }}>Se necessário (SN)</label>
          </div>
          <div className="form-field span-2">
            <label>Instruções / diluição</label>
            <input type="text" placeholder="ex: Diluir em 100mL SF 0,9% e correr em 30 minutos" value={it.diluicao} onChange={(e) => setItem(i, 'diluicao', e.target.value)} />
          </div>
          <div className="form-field span-2">
            <label>Instruções gerais</label>
            <input type="text" value={it.instrucoes} onChange={(e) => setItem(i, 'instrucoes', e.target.value)} />
          </div>
          {itens.length > 1 && (
            <div className="form-field" style={{ alignSelf: 'flex-end' }}>
              <button type="button" className="modal-btn-secondary" onClick={() => removerItem(i)}>Remover</button>
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn-copiar" onClick={adicionarItem}>+ Adicionar medicamento</button>

      <div className="form-section-title" style={{ fontSize: 13, marginTop: 16 }}>Orientação enfermagem</div>
      {orientacaoEnfermagem.map((o, i) => (
        <div key={i} className="form-grid" style={{ marginBottom: 6 }}>
          <div className="form-field span-2">
            <label>Orientação</label>
            <input type="text" placeholder="ex: Monitorização contínua" value={o.texto} onChange={(e) => setOrientacao(i, 'texto', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Frequência</label>
            <input type="text" placeholder="ex: 6/6h, Contínuo..." value={o.frequencia} onChange={(e) => setOrientacao(i, 'frequencia', e.target.value)} />
          </div>
          {orientacaoEnfermagem.length > 1 && (
            <div className="form-field" style={{ alignSelf: 'flex-end' }}>
              <button type="button" className="modal-btn-secondary" onClick={() => removerOrientacao(i)}>Remover</button>
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn-copiar" onClick={adicionarOrientacao}>+ Adicionar orientação</button>

      <div className="form-field span-3" style={{ marginTop: 14 }}>
        <label>Avaliação multidisciplinar</label>
        <textarea value={avaliacaoMultidisciplinar} onChange={(e) => setAvaliacaoMultidisciplinar(e.target.value)} />
      </div>

      <div className="form-field span-3">
        <label>Hemocomponente</label>
        <textarea value={hemocomponente} onChange={(e) => setHemocomponente(e.target.value)} />
      </div>

      <div className="form-field span-3" style={{ marginTop: 14 }}>
        <label>Observações</label>
        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      </div>

      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Registrar prescrição'}
        </button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma prescrição registrada ainda.</p>
      ) : (
        historico.map((p) => (
          <div key={p.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>
                {(p.prescricao_itens ?? []).map((it) => it.medicamento_nome).join(', ')}
              </span>
              <span style={{ fontSize: 11, color: p.status === 'cancelada' ? 'var(--color-danger, #b91c1c)' : 'var(--color-text-muted)' }}>
                {p.status}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {p.enfermeiros?.nome_exibicao || p.enfermeiros?.nome} · {new Date(p.criado_em).toLocaleString('pt-BR')}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(p)}>Imprimir</button>
              {p.status === 'ativa' && (
                <button type="button" className="modal-btn-secondary" onClick={() => cancelar(p.id)}>
                  Cancelar prescrição
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const AIH_VAZIA = {
  // 1-4 · Identificação do estabelecimento de saúde
  estabelecimento_solicitante_nome: 'UPA 24H BREVES', estabelecimento_solicitante_cnes: '',
  estabelecimento_executante_nome: 'UPA 24H BREVES', estabelecimento_executante_cnes: '',
  // 10.1 / 13-19 · Identificação do paciente — campos que NÃO existem no cadastro da pessoa
  etnia: '', nome_responsavel: '', municipio_residencia_uf: '', municipio_residencia_cep: '', municipio_residencia_ibge: '',
  // 20-22 · Justificativa da internação
  sinais_sintomas_clinicos: '', condicoes_justificam_internacao: '', resultados_provas_diagnosticas: '',
  // 23-26 · Diagnóstico
  diagnostico_inicial_texto: '', cid_principal: '', cid_secundario: '', cid_causas_associadas: '',
  // 27-35 · Procedimento solicitado
  procedimento_principal_nome: '', procedimento_principal_codigo: '', procedimento_secundario_codigo: '',
  clinica: '', carater_internacao: 'URGENCIA', profissional_documento_tipo: 'CNS', profissional_documento_numero: '',
  // 36-45 · Preencher em caso de causas externas
  causa_externa_transito: false, causa_externa_trabalho_tipico: false, causa_externa_trabalho_trajeto: false,
  cnpj_seguradora: '', numero_bilhete: '', serie_bilhete: '', cnpj_empresa: '', cnae_empresa: '', cbor: '',
  vinculo_previdencia: '',
  // 46-52 · Autorização (preenchido pelo regulador/auditor, não pelo médico solicitante — mas o
  // campo continua no formulário pra ser preenchido manualmente depois)
  autorizador_nome: '', autorizador_codigo_orgao_emissor: '', autorizador_documento_tipo: 'CNS',
  autorizador_documento_numero: '', numero_autorizacao: '', data_autorizacao: '',
}

const VINCULO_PREVIDENCIA_OPCOES = [
  { valor: 'empregado', rotulo: 'Empregado' },
  { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' },
  { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' },
  { valor: 'nao_segurado', rotulo: 'Não segurado' },
]

function AbaAih({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(AIH_VAZIA)
  const [cids, setCids] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar(); carregarCids() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarAih(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function carregarCids() {
    const { data } = await supabase.from('cid_catalog').select('codigo, descricao').order('codigo')
    setCids(data ?? [])
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }))
  }

  async function salvar() {
    if (!dados.procedimento_principal_nome.trim() || !dados.sinais_sintomas_clinicos.trim() || !dados.diagnostico_inicial_texto.trim()) {
      setErro('Preencha ao menos o procedimento, os sinais/sintomas clínicos e o diagnóstico inicial.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarAih({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      solicitanteId: medicoId,
      dados,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar. Tente de novo.')
      return
    }
    setDados(AIH_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova solicitação de AIH</div>
      <div className="form-grid">
        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Identificação do estabelecimento de saúde</div>
        <div className="form-field span-2">
          <label>Estabelecimento solicitante</label>
          <input type="text" value={dados.estabelecimento_solicitante_nome} onChange={(e) => set('estabelecimento_solicitante_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNES solicitante</label>
          <input type="text" value={dados.estabelecimento_solicitante_cnes} onChange={(e) => set('estabelecimento_solicitante_cnes', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Estabelecimento executante</label>
          <input type="text" value={dados.estabelecimento_executante_nome} onChange={(e) => set('estabelecimento_executante_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNES executante</label>
          <input type="text" value={dados.estabelecimento_executante_cnes} onChange={(e) => set('estabelecimento_executante_cnes', e.target.value)} />
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>Identificação do paciente — complemento</div>
        <div className="form-field">
          <label>Etnia (se indígena)</label>
          <input type="text" value={dados.etnia} onChange={(e) => set('etnia', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Nome do responsável</label>
          <input type="text" value={dados.nome_responsavel} onChange={(e) => set('nome_responsavel', e.target.value)} />
        </div>
        <div className="form-field">
          <label>UF de residência</label>
          <input type="text" maxLength={2} value={dados.municipio_residencia_uf} onChange={(e) => set('municipio_residencia_uf', e.target.value.toUpperCase())} />
        </div>
        <div className="form-field">
          <label>CEP</label>
          <input type="text" value={dados.municipio_residencia_cep} onChange={(e) => set('municipio_residencia_cep', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cód. IBGE do município</label>
          <input type="text" value={dados.municipio_residencia_ibge} onChange={(e) => set('municipio_residencia_ibge', e.target.value)} />
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>Procedimento solicitado</div>
        <div className="form-field span-2">
          <label>Procedimento solicitado *</label>
          <input type="text" value={dados.procedimento_principal_nome} onChange={(e) => set('procedimento_principal_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Código do procedimento</label>
          <input type="text" value={dados.procedimento_principal_codigo} onChange={(e) => set('procedimento_principal_codigo', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Clínica</label>
          <input type="text" placeholder="ex: UTI Adulto, Clínica Médica" value={dados.clinica} onChange={(e) => set('clinica', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Caráter da internação</label>
          <div className="toggle-group" style={{ maxWidth: 220 }}>
            {['URGENCIA', 'ELETIVA'].map((op) => (
              <button
                key={op}
                type="button"
                className={`toggle-btn ${dados.carater_internacao === op ? 'on' : ''}`}
                onClick={() => set('carater_internacao', op)}
              >
                {op === 'URGENCIA' ? 'Urgência' : 'Eletiva'}
              </button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label>Documento do solicitante</label>
          <select value={dados.profissional_documento_tipo} onChange={(e) => set('profissional_documento_tipo', e.target.value)}>
            <option value="CNS">CNS</option>
            <option value="CPF">CPF</option>
          </select>
        </div>
        <div className="form-field span-2">
          <label>Nº do documento</label>
          <input type="text" value={dados.profissional_documento_numero} onChange={(e) => set('profissional_documento_numero', e.target.value)} />
        </div>

        <div className="form-field span-3">
          <label>Principais sinais e sintomas clínicos *</label>
          <textarea value={dados.sinais_sintomas_clinicos} onChange={(e) => set('sinais_sintomas_clinicos', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Condições que justificam a internação</label>
          <textarea value={dados.condicoes_justificam_internacao} onChange={(e) => set('condicoes_justificam_internacao', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Principais resultados de provas diagnósticas</label>
          <textarea value={dados.resultados_provas_diagnosticas} onChange={(e) => set('resultados_provas_diagnosticas', e.target.value)} />
        </div>

        <div className="form-field span-3">
          <label>Diagnóstico inicial *</label>
          <input type="text" value={dados.diagnostico_inicial_texto} onChange={(e) => set('diagnostico_inicial_texto', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CID principal</label>
          <select value={dados.cid_principal} onChange={(e) => set('cid_principal', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>CID secundário</label>
          <select value={dados.cid_secundario} onChange={(e) => set('cid_secundario', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>CID causas associadas</label>
          <select value={dados.cid_causas_associadas} onChange={(e) => set('cid_causas_associadas', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>Preencher em caso de causas externas</div>
        <div className="form-field span-3">
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={dados.causa_externa_transito} onChange={(e) => set('causa_externa_transito', e.target.checked)} />
              Acidente de trânsito
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={dados.causa_externa_trabalho_tipico} onChange={(e) => set('causa_externa_trabalho_tipico', e.target.checked)} />
              Acidente trabalho típico
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input type="checkbox" checked={dados.causa_externa_trabalho_trajeto} onChange={(e) => set('causa_externa_trabalho_trajeto', e.target.checked)} />
              Acidente trabalho trajeto
            </label>
          </div>
        </div>
        <div className="form-field">
          <label>CNPJ da seguradora</label>
          <input type="text" value={dados.cnpj_seguradora} onChange={(e) => set('cnpj_seguradora', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nº do bilhete</label>
          <input type="text" value={dados.numero_bilhete} onChange={(e) => set('numero_bilhete', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Série</label>
          <input type="text" value={dados.serie_bilhete} onChange={(e) => set('serie_bilhete', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNPJ da empresa</label>
          <input type="text" value={dados.cnpj_empresa} onChange={(e) => set('cnpj_empresa', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNAE da empresa</label>
          <input type="text" value={dados.cnae_empresa} onChange={(e) => set('cnae_empresa', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CBOR</label>
          <input type="text" value={dados.cbor} onChange={(e) => set('cbor', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Vínculo com a previdência</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VINCULO_PREVIDENCIA_OPCOES.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`toggle-btn ${dados.vinculo_previdencia === op.valor ? 'on' : ''}`}
                style={{ flex: '0 0 auto' }}
                onClick={() => set('vinculo_previdencia', dados.vinculo_previdencia === op.valor ? '' : op.valor)}
              >
                {op.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>
          Autorização (preenchido pelo regulador/auditor)
        </div>
        <div className="form-field span-2">
          <label>Nome do profissional autorizador</label>
          <input type="text" value={dados.autorizador_nome} onChange={(e) => set('autorizador_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cód. órgão emissor</label>
          <input type="text" value={dados.autorizador_codigo_orgao_emissor} onChange={(e) => set('autorizador_codigo_orgao_emissor', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Documento</label>
          <select value={dados.autorizador_documento_tipo} onChange={(e) => set('autorizador_documento_tipo', e.target.value)}>
            <option value="CNS">CNS</option>
            <option value="CPF">CPF</option>
          </select>
        </div>
        <div className="form-field">
          <label>Nº do documento</label>
          <input type="text" value={dados.autorizador_documento_numero} onChange={(e) => set('autorizador_documento_numero', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nº da autorização de internação</label>
          <input type="text" value={dados.numero_autorizacao} onChange={(e) => set('numero_autorizacao', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Data da autorização</label>
          <input type="date" value={dados.data_autorizacao} onChange={(e) => set('data_autorizacao', e.target.value)} />
        </div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Registrar solicitação'}
        </button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação registrada ainda.</p>
      ) : (
        historico.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.procedimento_principal_nome}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {a.status} · {a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome} · {new Date(a.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>
              <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(a)}>Imprimir</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const STATUS_EXAME = ['a_realizar', 'aguardando_laudo', 'resultado_disponivel']
const ROTULO_STATUS_EXAME = { a_realizar: 'A realizar', aguardando_laudo: 'Aguardando laudo', resultado_disponivel: 'Resultado disponível' }

function SecaoExames({ atendimentoId }) {
  const [lista, setLista] = useState([])
  const [nome, setNome] = useState('')
  const [preparo, setPreparo] = useState('')
  const [local, setLocal] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])
  async function carregar() { setLista(await listarExames(atendimentoId)) }

  async function adicionar() {
    if (!nome.trim()) return
    setSalvando(true)
    await criarExame({ atendimentoId, nome: nome.trim(), preparo, local })
    setSalvando(false)
    setNome('')
    setPreparo('')
    setLocal('')
    carregar()
  }

  async function mudarStatus(id, status) {
    await atualizarExame(id, { status })
    carregar()
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div className="form-section-title">Exames</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Nome do exame" value={nome} onChange={(e) => setNome(e.target.value)} style={{ flex: 2, minWidth: 160 }} />
        <input type="text" placeholder="Preparo (opcional)" value={preparo} onChange={(e) => setPreparo(e.target.value)} style={{ flex: 2, minWidth: 160 }} />
        <input type="text" placeholder="Local (ex: HRPM, lab. externo)" value={local} onChange={(e) => setLocal(e.target.value)} style={{ flex: 2, minWidth: 160 }} />
        <button type="button" className="modal-btn-secondary" onClick={adicionar} disabled={salvando || !nome.trim()}>+ Adicionar</button>
      </div>
      {lista.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 12.5 }}>Nenhum exame solicitado ainda.</p>
      ) : (
        lista.map((e) => (
          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
            <span>{e.nome}{e.preparo ? ` · ${e.preparo}` : ''}{e.local ? ` · ${e.local}` : ''}</span>
            <select value={e.status} onChange={(ev) => mudarStatus(e.id, ev.target.value)} style={{ fontSize: 11.5 }}>
              {STATUS_EXAME.map((s) => <option key={s} value={s}>{ROTULO_STATUS_EXAME[s]}</option>)}
            </select>
          </div>
        ))
      )}
    </div>
  )
}

const STATUS_SOROLOGIA = ['coleta_pendente', 'aguardando_resultado', 'resultado_disponivel']
const ROTULO_STATUS_SOROLOGIA = { coleta_pendente: 'Coleta pendente', aguardando_resultado: 'Aguardando resultado', resultado_disponivel: 'Resultado disponível' }

function SecaoSorologias({ atendimentoId }) {
  const [lista, setLista] = useState([])
  const [agravo, setAgravo] = useState('')
  const [dataColeta, setDataColeta] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [pendenteNotificacao, setPendenteNotificacao] = useState(null) // id aguardando informar data_notificacao

  useEffect(() => { carregar() }, [])
  async function carregar() { setLista(await listarSorologias(atendimentoId)) }

  async function adicionar() {
    if (!agravo.trim()) return
    setSalvando(true)
    await criarSorologia({ atendimentoId, agravo: agravo.trim(), dataColeta })
    setSalvando(false)
    setAgravo('')
    setDataColeta('')
    carregar()
  }

  async function mudarStatus(id, status) {
    // "Resultado disponível" é o gatilho pra notificação compulsória — pede a
    // data antes de gravar, em vez de deixar a notificação sem data nenhuma.
    if (status === 'resultado_disponivel') {
      setPendenteNotificacao(id)
      return
    }
    await atualizarSorologia(id, { status })
    carregar()
  }

  async function confirmarNotificacao(id, dataNotificacao) {
    await atualizarSorologia(id, { status: 'resultado_disponivel', dataNotificacao: dataNotificacao || null })
    setPendenteNotificacao(null)
    carregar()
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div className="form-section-title">Sorologias / notificação compulsória</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Agravo / sorologia" value={agravo} onChange={(e) => setAgravo(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
        <input type="date" title="Data da coleta" value={dataColeta} onChange={(e) => setDataColeta(e.target.value)} />
        <button type="button" className="modal-btn-secondary" onClick={adicionar} disabled={salvando || !agravo.trim()}>+ Adicionar</button>
      </div>
      {lista.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 12.5 }}>Nenhuma notificação registrada ainda.</p>
      ) : (
        lista.map((s) => (
          <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{s.agravo}{s.data_coleta ? ` · coleta ${new Date(s.data_coleta + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}</span>
              <select value={s.status} onChange={(ev) => mudarStatus(s.id, ev.target.value)} style={{ fontSize: 11.5 }}>
                {STATUS_SOROLOGIA.map((st) => <option key={st} value={st}>{ROTULO_STATUS_SOROLOGIA[st]}</option>)}
              </select>
            </div>
            {s.data_notificacao && (
              <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Notificado em {new Date(s.data_notificacao + 'T00:00:00').toLocaleDateString('pt-BR')}
              </div>
            )}
            {pendenteNotificacao === s.id && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                <label style={{ fontSize: 11.5 }}>Data da notificação:</label>
                <input
                  type="date"
                  autoFocus
                  onChange={(e) => e.target.value && confirmarNotificacao(s.id, e.target.value)}
                />
                <button type="button" className="modal-btn-secondary" onClick={() => setPendenteNotificacao(null)}>Cancelar</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

const TIPOS_HEMO = ['CH', 'PFC', 'CP', 'Crioprecipitado']

function SecaoHemoterapia({ atendimentoId }) {
  const [lista, setLista] = useState([])
  const [tipo, setTipo] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [solicitadoEm, setSolicitadoEm] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [pendenteTransfusao, setPendenteTransfusao] = useState(null) // id aguardando informar data da transfusão

  useEffect(() => { carregar() }, [])
  async function carregar() { setLista(await listarHemoterapia(atendimentoId)) }

  async function adicionar() {
    if (!tipo) return
    setSalvando(true)
    await criarHemoterapia({ atendimentoId, tipo, quantidade, solicitadoEm })
    setSalvando(false)
    setTipo('')
    setQuantidade('')
    setSolicitadoEm('')
    carregar()
  }

  async function confirmarTransfusao(id, dataTransfusao) {
    await marcarTransfundido(id, dataTransfusao)
    setPendenteTransfusao(null)
    carregar()
  }

  return (
    <div>
      <div className="form-section-title">Hemoterapia</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ flex: 1, minWidth: 120 }}>
          <option value="">Tipo</option>
          {TIPOS_HEMO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <input type="date" title="Data da solicitação (padrão: hoje)" value={solicitadoEm} onChange={(e) => setSolicitadoEm(e.target.value)} />
        <button type="button" className="modal-btn-secondary" onClick={adicionar} disabled={salvando || !tipo}>+ Adicionar</button>
      </div>
      {lista.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 12.5 }}>Nenhum hemoderivado solicitado ainda.</p>
      ) : (
        lista.map((h) => (
          <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{h.tipo}{h.quantidade ? ` · ${h.quantidade}` : ''} · solicitado {new Date(h.solicitado_em).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
              {h.transfundido_em ? (
                <span style={{ fontSize: 11.5, color: 'var(--c-primary)' }}>Transfundido em {new Date(h.transfundido_em).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
              ) : (
                <button type="button" className="modal-btn-secondary" onClick={() => setPendenteTransfusao(h.id)}>Marcar transfundido</button>
              )}
            </div>
            {pendenteTransfusao === h.id && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                <label style={{ fontSize: 11.5 }}>Data da transfusão:</label>
                <input
                  type="date"
                  autoFocus
                  onChange={(e) => e.target.value && confirmarTransfusao(h.id, e.target.value)}
                />
                <button type="button" className="modal-btn-secondary" onClick={() => setPendenteTransfusao(null)}>Cancelar</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function AbaExames({ atendimento }) {
  return (
    <div className="form-section">
      <SecaoExames atendimentoId={atendimento.atendimento_id} />
      <SecaoSorologias atendimentoId={atendimento.atendimento_id} />
      <SecaoHemoterapia atendimentoId={atendimento.atendimento_id} />
    </div>
  )
}

const PROTOCOLOS_OPCOES = ['Prevenção de queda', 'Prevenção de LPP', 'Prevenção de TEV', 'Sepse', 'AVC']
const EQUIPE_OPCOES = ['Enfermagem', 'Fisioterapia', 'Nutrição', 'Psicologia', 'Serviço Social', 'Farmácia']

function AbaPlanoTerapeutico({ atendimento, medicoId, onImprimir }) {
  const [dados, setDados] = useState({
    motivo_internacao: '', objetivos_terapeuticos: '', protocolos_elegiveis: [],
    tempo_internacao_previsto_dias: '', equipe_multidisciplinar: [],
  })
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    buscarPlanoTerapeutico(atendimento.atendimento_id).then((p) => {
      if (p) {
        setDados({
          motivo_internacao: p.motivo_internacao || '', objetivos_terapeuticos: p.objetivos_terapeuticos || '',
          protocolos_elegiveis: p.protocolos_elegiveis || [], tempo_internacao_previsto_dias: p.tempo_internacao_previsto_dias || '',
          equipe_multidisciplinar: p.equipe_multidisciplinar || [],
        })
        setSalvo(p)
      }
      setCarregando(false)
    })
  }, [atendimento.atendimento_id])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function toggleLista(campo, item) {
    setDados((prev) => ({
      ...prev,
      [campo]: prev[campo].includes(item) ? prev[campo].filter((i) => i !== item) : [...prev[campo], item],
    }))
  }

  async function salvar() {
    setSalvando(true)
    const { data } = await salvarPlanoTerapeutico({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: { ...dados, tempo_internacao_previsto_dias: dados.tempo_internacao_previsto_dias ? Number(dados.tempo_internacao_previsto_dias) : null },
    })
    setSalvando(false)
    setSucesso(true)
    setSalvo(data)
  }

  if (carregando) return <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>

  return (
    <div className="form-section">
      <div className="form-section-title">Plano terapêutico</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Motivo da internação</label>
          <textarea value={dados.motivo_internacao} onChange={(e) => set('motivo_internacao', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Objetivos terapêuticos</label>
          <textarea value={dados.objetivos_terapeuticos} onChange={(e) => set('objetivos_terapeuticos', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Protocolos institucionais elegíveis</label>
          <div className="chip-group">
            {PROTOCOLOS_OPCOES.map((p) => (
              <button key={p} type="button" className={`chip ${dados.protocolos_elegiveis.includes(p) ? 'on' : ''}`} onClick={() => toggleLista('protocolos_elegiveis', p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label>Tempo de internação previsto (dias)</label>
          <input type="number" value={dados.tempo_internacao_previsto_dias} onChange={(e) => set('tempo_internacao_previsto_dias', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Equipe multidisciplinar envolvida</label>
          <div className="chip-group">
            {EQUIPE_OPCOES.map((e) => (
              <button key={e} type="button" className={`chip ${dados.equipe_multidisciplinar.includes(e) ? 'on' : ''}`} onClick={() => toggleLista('equipe_multidisciplinar', e)}>{e}</button>
            ))}
          </div>
        </div>
      </div>
      {sucesso && <p style={{ fontSize: 12, color: 'var(--c-primary)', marginTop: 14 }}>Plano terapêutico salvo.</p>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar plano'}</button>
        {salvo && <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(salvo)}>Imprimir</button>}
      </div>
    </div>
  )
}

const APAC_VAZIA = { procedimento_codigo: '', procedimento_nome: '', quantidade: '', cid_principal: '', cid_secundario: '', justificativa: '', numero_autorizacao: '', validade_inicio: '', validade_fim: '' }

function AbaApac({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(APAC_VAZIA)
  const [cids, setCids] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar(); listarCatalogoCid().then(setCids) }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarApac(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.procedimento_nome.trim() || !dados.justificativa.trim()) {
      setErro('Preencha ao menos o procedimento e a justificativa.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarApac({
      atendimentoId: atendimento.atendimento_id, solicitanteId: medicoId,
      dados: {
        ...dados,
        quantidade: dados.quantidade ? Number(dados.quantidade) : null,
        cid_principal: dados.cid_principal || null, cid_secundario: dados.cid_secundario || null,
        validade_inicio: dados.validade_inicio || null, validade_fim: dados.validade_fim || null,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(APAC_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova solicitação de APAC</div>
      <div className="form-grid">
        <div className="form-field span-2"><label>Procedimento *</label><input type="text" value={dados.procedimento_nome} onChange={(e) => set('procedimento_nome', e.target.value)} /></div>
        <div className="form-field"><label>Código</label><input type="text" value={dados.procedimento_codigo} onChange={(e) => set('procedimento_codigo', e.target.value)} /></div>
        <div className="form-field"><label>Quantidade</label><input type="number" value={dados.quantidade} onChange={(e) => set('quantidade', e.target.value)} /></div>
        <div className="form-field span-2">
          <label>CID principal</label>
          <select value={dados.cid_principal} onChange={(e) => set('cid_principal', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field span-2">
          <label>CID secundário</label>
          <select value={dados.cid_secundario} onChange={(e) => set('cid_secundario', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field span-3"><label>Justificativa clínica *</label><textarea value={dados.justificativa} onChange={(e) => set('justificativa', e.target.value)} /></div>
        <div className="form-field"><label>Nº autorização</label><input type="text" value={dados.numero_autorizacao} onChange={(e) => set('numero_autorizacao', e.target.value)} /></div>
        <div className="form-field"><label>Validade início</label><input type="date" value={dados.validade_inicio} onChange={(e) => set('validade_inicio', e.target.value)} /></div>
        <div className="form-field"><label>Validade fim</label><input type="date" value={dados.validade_fim} onChange={(e) => set('validade_fim', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar solicitação'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação registrada ainda.</p>
      ) : historico.map((a) => (
        <div key={a.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{a.procedimento_nome}{a.numero_autorizacao ? ` — ${a.numero_autorizacao}` : ''}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome} · {new Date(a.solicitado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(a)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const ATM_VAZIA = { medicamento: '', posologia: '', dose: '', intervalo: '', tempo_uso_dias: '', justificativa_clinica: '' }

function AbaAtm({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(ATM_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarAtm(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.medicamento.trim() || !dados.justificativa_clinica.trim()) {
      setErro('Preencha ao menos o medicamento e a justificativa clínica.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarAtm({
      atendimentoId: atendimento.atendimento_id, solicitanteId: medicoId,
      dados: { ...dados, tempo_uso_dias: dados.tempo_uso_dias ? Number(dados.tempo_uso_dias) : null },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(ATM_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova solicitação de ATM</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Liberação de antibiótico de uso restrito — o parecer da farmácia é dado manualmente, fora do sistema. Aqui só registra a solicitação e gera o documento completo pra impressão, parecer, assinatura e carimbo do farmacêutico.
      </p>
      <div className="form-grid">
        <div className="form-field span-2"><label>Medicamento *</label><input type="text" value={dados.medicamento} onChange={(e) => set('medicamento', e.target.value)} /></div>
        <div className="form-field"><label>Dose</label><input type="text" value={dados.dose} onChange={(e) => set('dose', e.target.value)} /></div>
        <div className="form-field"><label>Posologia</label><input type="text" value={dados.posologia} onChange={(e) => set('posologia', e.target.value)} /></div>
        <div className="form-field"><label>Intervalo</label><input type="text" placeholder="ex: 8/8h" value={dados.intervalo} onChange={(e) => set('intervalo', e.target.value)} /></div>
        <div className="form-field"><label>Tempo de uso (dias)</label><input type="number" value={dados.tempo_uso_dias} onChange={(e) => set('tempo_uso_dias', e.target.value)} /></div>
        <div className="form-field span-3"><label>Justificativa clínica *</label><textarea value={dados.justificativa_clinica} onChange={(e) => set('justificativa_clinica', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar solicitação'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação registrada ainda.</p>
      ) : historico.map((a) => (
        <div key={a.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{a.medicamento}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {a.parecer_farmaceutico ? `Parecer: ${a.parecer_farmaceutico}` : 'Aguardando parecer'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome} · {new Date(a.criado_em).toLocaleString('pt-BR')}
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(a)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const TFD_VAZIA = { historia_doenca_atual: '', exame_fisico: '', diagnostico: '', exame_complementar: '', tratamento_realizado: '', tratamento_indicado: '', tempo_provavel_dias: '', acompanhante_nome: '', acompanhante_relacao: '' }

function AbaTfd({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(TFD_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarTfd(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.diagnostico.trim() || !dados.tratamento_indicado.trim()) {
      setErro('Preencha ao menos o diagnóstico e o tratamento indicado.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarTfd({
      atendimentoId: atendimento.atendimento_id, profissionalResponsavel: medicoId,
      dados: { ...dados, tempo_provavel_dias: dados.tempo_provavel_dias ? Number(dados.tempo_provavel_dias) : null },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(TFD_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Novo laudo de TFD</div>
      <div className="form-grid">
        <div className="form-field span-3"><label>História da doença atual</label><textarea value={dados.historia_doenca_atual} onChange={(e) => set('historia_doenca_atual', e.target.value)} /></div>
        <div className="form-field span-3"><label>Exame físico</label><textarea value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} /></div>
        <div className="form-field span-3"><label>Diagnóstico *</label><input type="text" value={dados.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></div>
        <div className="form-field span-3"><label>Exame complementar</label><input type="text" value={dados.exame_complementar} onChange={(e) => set('exame_complementar', e.target.value)} /></div>
        <div className="form-field span-3"><label>Tratamento realizado</label><textarea value={dados.tratamento_realizado} onChange={(e) => set('tratamento_realizado', e.target.value)} /></div>
        <div className="form-field span-3"><label>Tratamento indicado *</label><textarea value={dados.tratamento_indicado} onChange={(e) => set('tratamento_indicado', e.target.value)} /></div>
        <div className="form-field"><label>Tempo provável (dias)</label><input type="number" value={dados.tempo_provavel_dias} onChange={(e) => set('tempo_provavel_dias', e.target.value)} /></div>
        <div className="form-field"><label>Acompanhante</label><input type="text" value={dados.acompanhante_nome} onChange={(e) => set('acompanhante_nome', e.target.value)} /></div>
        <div className="form-field"><label>Relação</label><input type="text" value={dados.acompanhante_relacao} onChange={(e) => set('acompanhante_relacao', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar laudo'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum laudo registrado ainda.</p>
      ) : historico.map((t) => (
        <div key={t.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{t.diagnostico}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {t.enfermeiros?.nome_exibicao || t.enfermeiros?.nome} · {new Date(t.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(t)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function AbaRegulacao({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [abertura, setAbertura] = useState(null)
  const [tipoAbertura, setTipoAbertura] = useState('SER')
  const [abrindo, setAbrindo] = useState(false)
  const [evolucao, setEvolucao] = useState('')
  const [pendencias, setPendencias] = useState('')
  const [conduta, setConduta] = useState('')
  const [numeroSer, setNumeroSer] = useState('')
  const [pa, setPa] = useState({ pas: '', pad: '' })
  const [fc, setFc] = useState('')
  const [fr, setFr] = useState('')
  const [temp, setTemp] = useState('')
  const [spo2, setSpo2] = useState('')
  const [hgt, setHgt] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregar() }, [])
  async function carregar() {
    setCarregando(true)
    setHistorico(await listarRegulacao(atendimento.atendimento_id))
    setAbertura(await buscarAberturaRegulacao(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function confirmarAbertura() {
    setAbrindo(true)
    await abrirRegulacao(atendimento.atendimento_id, tipoAbertura)
    setAbrindo(false)
    carregar()
  }

  async function confirmarEncerramento() {
    setAbrindo(true)
    await encerrarRegulacao(atendimento.atendimento_id)
    setAbrindo(false)
    carregar()
  }

  async function registrar() {
    if (!evolucao.trim()) return
    setSalvando(true)
    await registrarRegulacao({
      atendimentoId: atendimento.atendimento_id, atualizadoPor: medicoId,
      dados: {
        evolucao: evolucao.trim(), pendencias: pendencias || null, conduta: conduta || null,
        numero_solicitacao_ser: numeroSer || null,
        sinais_vitais: { pa_sistolica: pa.pas || null, pa_diastolica: pa.pad || null, fc: fc || null, fr: fr || null, temperatura: temp || null, spo2: spo2 || null, hgt: hgt || null },
      },
    })
    setSalvando(false)
    setEvolucao(''); setPendencias(''); setConduta(''); setNumeroSer('')
    setPa({ pas: '', pad: '' }); setFc(''); setFr(''); setTemp(''); setSpo2(''); setHgt('')
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Regulação</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : abertura?.regulacao_flag ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 13 }}>
            Regulação aberta · <b>{abertura.regulacao_tipo}</b>
            {abertura.regulacao_aberta_em && ` · desde ${new Date(abertura.regulacao_aberta_em).toLocaleDateString('pt-BR')}`}
          </span>
          <button type="button" className="modal-btn-secondary" onClick={confirmarEncerramento} disabled={abrindo}>
            {abrindo ? 'Encerrando...' : 'Encerrar regulação'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Regulação não aberta.</span>
          <div className="toggle-group" style={{ maxWidth: 160 }}>
            <button type="button" className={`toggle-btn ${tipoAbertura === 'SER' ? 'on' : ''}`} onClick={() => setTipoAbertura('SER')}>SER</button>
            <button type="button" className={`toggle-btn ${tipoAbertura === 'SISREG' ? 'on' : ''}`} onClick={() => setTipoAbertura('SISREG')}>SISREG</button>
          </div>
          <button type="button" className="modal-btn-primary" onClick={confirmarAbertura} disabled={abrindo}>
            {abrindo ? 'Abrindo...' : 'Abrir regulação'}
          </button>
        </div>
      )}

      <div className="form-section-title">Nova atualização de quadro clínico (SER/SISREG)</div>
      <div className="form-grid">
        <div className="form-field"><label>PA sistólica</label><input type="number" value={pa.pas} onChange={(e) => setPa((p) => ({ ...p, pas: e.target.value }))} /></div>
        <div className="form-field"><label>PA diastólica</label><input type="number" value={pa.pad} onChange={(e) => setPa((p) => ({ ...p, pad: e.target.value }))} /></div>
        <div className="form-field"><label>FC</label><input type="number" value={fc} onChange={(e) => setFc(e.target.value)} /></div>
        <div className="form-field"><label>FR</label><input type="number" value={fr} onChange={(e) => setFr(e.target.value)} /></div>
        <div className="form-field"><label>Temperatura</label><input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} /></div>
        <div className="form-field"><label>SpO2</label><input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} /></div>
        <div className="form-field"><label>HGT</label><input type="number" value={hgt} onChange={(e) => setHgt(e.target.value)} /></div>
        <div className="form-field"><label>Nº solicitação SER</label><input type="text" value={numeroSer} onChange={(e) => setNumeroSer(e.target.value)} /></div>
        <div className="form-field span-3"><label>Evolução *</label><textarea value={evolucao} onChange={(e) => setEvolucao(e.target.value)} /></div>
        <div className="form-field span-3"><label>Pendências</label><input type="text" value={pendencias} onChange={(e) => setPendencias(e.target.value)} /></div>
        <div className="form-field span-3"><label>Conduta</label><input type="text" value={conduta} onChange={(e) => setConduta(e.target.value)} /></div>
      </div>
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={registrar} disabled={salvando || !evolucao.trim()}>{salvando ? 'Registrando...' : 'Registrar atualização'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma atualização registrada ainda.</p>
      ) : historico.map((r) => (
        <div key={r.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <p style={{ margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{r.evolucao}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {r.enfermeiros?.nome_exibicao || r.enfermeiros?.nome} · {new Date(r.atualizado_em).toLocaleString('pt-BR')}
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(r)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function AbaMedicacoesContinuas({ atendimento, medicoId }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [medicamento, setMedicamento] = useState('')
  const [dose, setDose] = useState('')
  const [frequencia, setFrequencia] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarMedicacoesContinuas(atendimento.pessoa_id))
    setCarregando(false)
  }

  async function adicionar() {
    if (!medicamento.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarMedicacaoContinua({ pessoaId: atendimento.pessoa_id, medicamento: medicamento.trim(), dose, frequencia, registradoPor: medicoId })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setMedicamento('')
    setDose('')
    setFrequencia('')
    carregar()
  }

  async function suspender(id) {
    await suspenderMedicacaoContinua(id)
    carregar()
  }

  const ativas = lista.filter((m) => m.status === 'ativo')
  const suspensas = lista.filter((m) => m.status !== 'ativo')

  return (
    <div className="form-section">
      <div className="form-section-title">Nova medicação de uso contínuo</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Uso contínuo em casa (reconciliação medicamentosa) — fica ligado à pessoa, não só a este atendimento, e continua valendo em internações futuras até ser suspenso.
      </p>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field span-2"><label>Medicamento *</label><input type="text" value={medicamento} onChange={(e) => setMedicamento(e.target.value)} /></div>
        <div className="form-field"><label>Dose</label><input type="text" value={dose} onChange={(e) => setDose(e.target.value)} /></div>
        <div className="form-field"><label>Frequência</label><input type="text" placeholder="ex: 1x/dia" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={adicionar} disabled={salvando || !medicamento.trim()}>{salvando ? 'Salvando...' : '+ Adicionar'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativas</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : ativas.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma medicação contínua ativa.</p>
      ) : ativas.map((m) => (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
          <span>{m.medicamento}{m.dose ? ` · ${m.dose}` : ''}{m.frequencia ? ` · ${m.frequencia}` : ''}</span>
          <button type="button" className="modal-btn-secondary" onClick={() => suspender(m.id)}>Suspender</button>
        </div>
      ))}

      {suspensas.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Suspensas</div>
          {suspensas.map((m) => (
            <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 12.5, color: 'var(--color-text-muted)' }}>
              {m.medicamento}{m.dose ? ` · ${m.dose}` : ''}{m.frequencia ? ` · ${m.frequencia}` : ''}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const ACOES_AUDITORIA = {
  diagnostico_cid_atualizado: 'Diagnóstico (CID-10) atualizado',
  desfecho_registrado: 'Desfecho registrado',
  duplicata_fundida: 'Cadastros duplicados fundidos',
}

function AbaAuditoria({ atendimento }) {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    listarEventosAuditoria(atendimento.atendimento_id).then((lista) => { setEventos(lista); setCarregando(false) })
  }, [atendimento.atendimento_id])

  return (
    <div className="form-section">
      <div className="form-section-title">Trilha de auditoria</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Registro somente-leitura das ações mais sensíveis feitas neste atendimento — não cobre tudo, só os pontos de maior impacto (diagnóstico, desfecho, fusão de cadastro).
      </p>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : eventos.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum evento registrado ainda.</p>
      ) : eventos.map((e) => (
        <div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{ACOES_AUDITORIA[e.acao] || e.acao}</strong>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{new Date(e.ocorrido_em).toLocaleString('pt-BR')}</span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
            {e.enfermeiros?.nome_exibicao || e.enfermeiros?.nome || 'Autor desconhecido'}
            {e.dados ? ` · ${JSON.stringify(e.dados)}` : ''}
          </div>
        </div>
      ))}
    </div>
  )
}
