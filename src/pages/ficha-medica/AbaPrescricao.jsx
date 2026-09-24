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
