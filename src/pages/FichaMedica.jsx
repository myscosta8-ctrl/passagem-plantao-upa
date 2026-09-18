import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import {
  listarConsultas, criarConsulta,
  listarPrescricoes, criarPrescricao, cancelarPrescricao,
  listarAih, criarAih,
} from '../lib/pepMedico'
import FichaMedicaPrint from './FichaMedicaPrint'
import './PassagemForm.css'

const VIAS = ['VO', 'EV', 'IM', 'SC', 'SL', 'Inalatória', 'Tópica', 'Outra']
const ABAS = [
  { chave: 'consulta', rotulo: 'Consulta' },
  { chave: 'prescricao', rotulo: 'Prescrição' },
  { chave: 'aih', rotulo: 'AIH' },
]

export default function FichaMedica({ atendimento, onFechar }) {
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

  return (
    <div className="form-overlay">
      <div className="form-panel" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <span className="form-leito-tag">Leito {atendimento.leito_numero} — {atendimento.nome}</span>
          <button className="form-header-close" onClick={onFechar}>×</button>
        </div>

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

        <div className="form-footer">
          <button className="btn-fechar" onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

const CONSULTA_VAZIA = {
  queixa_principal: '', historia_doenca_atual: '', antecedentes: '',
  revisao_sistemas: '', exame_geral: '', hipotese_diagnostica: '', conduta_inicial: '',
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
      <div className="form-section-title">Nova consulta</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Queixa principal *</label>
          <input type="text" value={dados.queixa_principal} onChange={(e) => set('queixa_principal', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>História da doença atual</label>
          <textarea value={dados.historia_doenca_atual} onChange={(e) => set('historia_doenca_atual', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Antecedentes</label>
          <input type="text" value={dados.antecedentes} onChange={(e) => set('antecedentes', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Revisão de sistemas</label>
          <input type="text" value={dados.revisao_sistemas} onChange={(e) => set('revisao_sistemas', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Exame físico geral</label>
          <textarea value={dados.exame_geral} onChange={(e) => set('exame_geral', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Hipótese diagnóstica *</label>
          <input type="text" value={dados.hipotese_diagnostica} onChange={(e) => set('hipotese_diagnostica', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Conduta inicial</label>
          <textarea value={dados.conduta_inicial} onChange={(e) => set('conduta_inicial', e.target.value)} />
        </div>
      </div>
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

function AbaPrescricao({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState([{ medicamento_nome: '', dose: '', dose_unidade: '', via: 'VO', frequencia: '', duracao: '', instrucoes: '' }])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarPrescricoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  function setItem(i, campo, valor) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }

  function adicionarItem() {
    setItens((prev) => [...prev, { medicamento_nome: '', dose: '', dose_unidade: '', via: 'VO', frequencia: '', duracao: '', instrucoes: '' }])
  }

  function removerItem(i) {
    setItens((prev) => prev.filter((_, idx) => idx !== i))
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
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar a prescrição. Tente de novo.')
      return
    }
    setObservacoes('')
    setItens([{ medicamento_nome: '', dose: '', dose_unidade: '', via: 'VO', frequencia: '', duracao: '', instrucoes: '' }])
    carregar()
  }

  async function cancelar(prescricaoId) {
    await cancelarPrescricao(prescricaoId, medicoId, 'Cancelada pelo médico')
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova prescrição</div>
      {itens.map((it, i) => (
        <div key={i} className="form-grid" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed var(--color-border)' }}>
          <div className="form-field span-2">
            <label>Medicamento</label>
            <input type="text" value={it.medicamento_nome} onChange={(e) => setItem(i, 'medicamento_nome', e.target.value)} />
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
          <div className="form-field span-2">
            <label>Instruções</label>
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

const AIH_VAZIA = { procedimento_principal_nome: '', procedimento_principal_codigo: '', cid_principal: '', justificativa_clinica: '' }

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
    if (!dados.procedimento_principal_nome.trim() || !dados.justificativa_clinica.trim()) {
      setErro('Preencha ao menos o procedimento e a justificativa clínica.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarAih({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      solicitanteId: medicoId,
      dados: { ...dados, cid_principal: dados.cid_principal || null },
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
        <div className="form-field span-2">
          <label>Procedimento principal *</label>
          <input type="text" value={dados.procedimento_principal_nome} onChange={(e) => set('procedimento_principal_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Código</label>
          <input type="text" value={dados.procedimento_principal_codigo} onChange={(e) => set('procedimento_principal_codigo', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>CID principal</label>
          <select value={dados.cid_principal} onChange={(e) => set('cid_principal', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field span-3">
          <label>Justificativa clínica *</label>
          <textarea value={dados.justificativa_clinica} onChange={(e) => set('justificativa_clinica', e.target.value)} />
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
