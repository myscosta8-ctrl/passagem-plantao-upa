// Notificação compulsória (SINAN) do atendimento: lista, escolha do agravo, réplica da ficha e impressão no PDF oficial.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { AGRAVOS, carregarModelo, agravosPorCid } from '../../lib/sinan/agravos'
import { valoresIniciais } from '../../lib/sinan/autoPreencher'
import { pendencias } from '../../lib/sinan/modeloUtil'
import { listarNotificacoes, salvarNotificacao, invalidarNotificacao, marcarEntregue, buscarContexto } from '../../lib/sinan/api'
import { registrarEventoAuditoria } from '../../lib/pepAtendimentos'
import FichaSinan from './FichaSinan'
import './sinan.css'

const SITUACAO = { rascunho: 'Rascunho', registrada: 'Registrada', entregue: 'Entregue à vigilância', invalidada: 'Invalidada' }
const dataBR = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function funcaoDe(e) {
  if (!e) return ''
  const base = e.funcao || (e.tipo === 'medico' ? 'Médico(a)' : 'Enfermeiro(a)')
  const reg = e.crm ? `CRM ${e.crm}` : e.coren ? `COREN ${e.coren}` : e.registro_profissional || ''
  return [base, reg].filter(Boolean).join(' - ')
}

export default function AbaNotificacaoSinan({ atendimento, onFechar }) {
  const { enfermeiro } = useAuth()
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modo, setModo] = useState('lista') // lista | escolher | ficha
  const [busca, setBusca] = useState('')
  const [ctx, setCtx] = useState(null)
  const [atual, setAtual] = useState(null) // { id, agravo, modelo(obj), dados, sigiloso }
  const [msg, setMsg] = useState(null)
  const [faltando, setFaltando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const travaRef = useRef(false)

  async function recarregar() {
    setCarregando(true)
    const [l, c] = await Promise.all([listarNotificacoes(atendimento.id), ctx ? Promise.resolve(ctx) : buscarContexto(atendimento.id)])
    setLista(l); setCtx(c); setCarregando(false)
  }
  useEffect(() => { recarregar() }, [atendimento?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const cidAtual = ctx?.internacao?.cid_admissao || ctx?.internacao?.diagnostico_cid || ''
  const sugeridos = useMemo(() => agravosPorCid(cidAtual), [cidAtual])
  const filtrados = useMemo(() => {
    const t = semAcento(busca)
    return AGRAVOS.filter((a) => !t || semAcento(a.nome).includes(t) || semAcento(a.cid).includes(t))
  }, [busca])

  async function abrirNovo(agravo) {
    const modelo = await carregarModelo(agravo.modelo)
    const base = valoresIniciais({ ...ctx, notificante: { nome: enfermeiro?.nome_exibicao || enfermeiro?.nome || '', funcao: funcaoDe(enfermeiro) } })
    let dados = { ...base, agravo: agravo.livre ? '' : `${agravo.nome}${agravo.cid ? ` (${agravo.cid})` : ''}` }
    if (modelo.inicializar) dados = modelo.inicializar(dados, agravo)
    setAtual({ id: null, agravo, modelo, dados, sigiloso: !!(agravo.sigiloso || modelo.sigilosa) })
    setMsg(null); setFaltando(null); setModo('ficha')
  }

  async function abrirExistente(reg) {
    const agravo = AGRAVOS.find((a) => a.nome === reg.agravo) || { nome: reg.agravo, modelo: reg.modelo }
    const modelo = await carregarModelo(reg.modelo)
    setAtual({ id: reg.id, agravo, modelo, dados: reg.dados || {}, sigiloso: reg.sigiloso, situacao: reg.situacao })
    setMsg(null); setFaltando(null); setModo('ficha')
  }

  async function salvar(imprimir, forcar = false) {
    if (travaRef.current) return
    if (imprimir && !forcar) {
      const f = pendencias(atual.modelo, atual.dados)
      if (f.length) { setFaltando(f); return }
    }
    travaRef.current = true; setSalvando(true); setMsg(null)
    const situacao = imprimir ? 'registrada' : (atual.situacao && atual.situacao !== 'rascunho' ? atual.situacao : 'rascunho')
    const { data, error } = await salvarNotificacao({
      id: atual.id, atendimentoId: atendimento.id, pessoaId: ctx?.pessoa?.id || ctx?.atendimento?.pessoa_id,
      modelo: atual.modelo.id, agravo: atual.agravo.nome, dados: atual.dados, situacao, sigiloso: atual.sigiloso,
    })
    if (error) {
      setMsg({ erro: true, texto: 'Não foi possível salvar a notificação. Tente de novo.' })
      travaRef.current = false; setSalvando(false); return
    }
    setAtual((a) => ({ ...a, id: data.id, situacao }))
    if (imprimir) {
      registrarEventoAuditoria({ atendimentoId: atendimento.id, autorId: enfermeiro?.id, acao: 'notificacao_sinan_registrada', dados: { notificacao_id: data.id, agravo: atual.agravo.nome, modelo: atual.modelo.id } })
      try {
        const { imprimirFicha } = await import('../../lib/sinan/imprimirFicha')
        await imprimirFicha(atual.modelo, atual.dados)
      } catch {
        setMsg({ erro: true, texto: 'A notificação foi salva, mas não foi possível gerar a ficha para impressão.' })
      }
    } else {
      setMsg({ texto: 'Rascunho salvo. Use "Salvar e Imprimir" para registrar e imprimir a ficha oficial.' })
    }
    setFaltando(null)
    travaRef.current = false; setSalvando(false)
    recarregar()
    if (imprimir) setModo('lista')
  }

  async function reimprimir(reg) {
    const modelo = await carregarModelo(reg.modelo)
    const { imprimirFicha } = await import('../../lib/sinan/imprimirFicha')
    await imprimirFicha(modelo, reg.dados || {})
  }

  async function invalidar(reg) {
    const motivo = window.prompt('Motivo da invalidação (a notificação não é apagada, só fica marcada como invalidada):')
    if (motivo === null) return
    const { error } = await invalidarNotificacao(reg.id, enfermeiro?.id, motivo)
    if (!error) registrarEventoAuditoria({ atendimentoId: atendimento.id, autorId: enfermeiro?.id, acao: 'notificacao_sinan_invalidada', dados: { notificacao_id: reg.id, motivo } })
    recarregar()
  }

  async function entregue(reg) {
    await marcarEntregue(reg.id)
    recarregar()
  }

  if (modo === 'ficha' && atual) {
    const a = atual.agravo
    return (
      <div className="sn-aba">
        <FichaSinan
          modelo={atual.modelo}
          dados={atual.dados}
          onChange={(d) => setAtual((x) => ({ ...x, dados: d }))}
          cabecalho={<div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span className="sn-chip">{a.nome}{a.cid ? ` · ${a.cid}` : ''}</span>
            {a.imediata && <span className="sn-chip h24">Notificação imediata (até 24h)</span>}
            {atual.sigiloso && <span className="sn-chip sig"><i className="ph ph-lock-simple" /> Sigilosa</span>}
          </div>}
        />
        {faltando && (
          <div className="sn-alerta">
            <b>Faltam {faltando.length} campo(s) obrigatório(s):</b>
            <ul>{faltando.slice(0, 12).map((c) => <li key={c.chave}>{c.n ? `${c.n} - ` : ''}{c.rotulo}</li>)}</ul>
            <div style={{ marginTop: 8 }}><button type="button" className="sn-btn peq" onClick={() => salvar(true, true)} disabled={salvando}>Imprimir mesmo assim</button></div>
          </div>
        )}
        {msg && <div className={`sn-msg${msg.erro ? ' erro' : ''}`}>{msg.texto}</div>}
        <div className="sn-rodape">
          <button type="button" className="sn-btn" onClick={() => { setModo('lista'); setAtual(null) }}><i className="ph ph-x-circle" /> Cancelar</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="sn-btn" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="sn-btn prim" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> Salvar e Imprimir</button>
          </div>
        </div>
      </div>
    )
  }

  if (modo === 'escolher') {
    return (
      <div className="sn-aba">
        <div className="sn-cab">
          <div><h3>Qual agravo vai notificar?</h3><p>As doenças sem ficha própria saem na Ficha de Notificação Individual.</p></div>
          <button type="button" className="sn-btn" onClick={() => setModo('lista')}><i className="ph ph-arrow-left" /> Voltar</button>
        </div>
        {sugeridos.length > 0 && (
          <div className="sn-sugestao"><i className="ph ph-lightbulb" /> Pelo diagnóstico ({cidAtual}):
            {sugeridos.map((a) => <button key={a.nome} type="button" className="sn-btn peq prim" onClick={() => abrirNovo(a)}>{a.nome}</button>)}
          </div>
        )}
        <input className="sn-busca" autoFocus placeholder="Buscar por nome ou CID (ex.: malária, B54)" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="sn-agravos">
          {filtrados.map((a) => (
            <button key={a.nome} type="button" className="sn-agravo" onClick={() => abrirNovo(a)}>
              <b>{a.nome}</b>
              <small>
                {a.cid && <span>CID {a.cid}</span>}
                <span>{a.modelo === 'NOTIFICACAO_INDIVIDUAL' ? 'Notificação Individual' : 'Ficha própria'}</span>
                {a.imediata && <span className="sn-chip h24">24h</span>}
                {a.sigiloso && <span className="sn-chip sig">Sigilosa</span>}
              </small>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="sn-aba">
      <div className="sn-cab">
        <div><h3>Notificação compulsória (SINAN)</h3><p>A ficha sai impressa no modelo oficial do Ministério da Saúde, para entrega à vigilância epidemiológica.</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onFechar && <button type="button" className="sn-btn" onClick={onFechar}><i className="ph ph-x" /> Fechar</button>}
          <button type="button" className="sn-btn prim" onClick={() => { setBusca(''); setModo('escolher') }} disabled={!ctx}><i className="ph ph-plus" /> Nova notificação</button>
        </div>
      </div>
      {carregando ? <div className="sn-vazio">Carregando...</div> : lista.length === 0 ? (
        <div className="sn-vazio">Nenhuma notificação neste atendimento.</div>
      ) : (
        <div className="sn-lista">
          {lista.map((r) => (
            <div key={r.id} className={`sn-item ${r.situacao}`}>
              <div className="sn-item-info">
                <b>{r.agravo}</b> {r.sigiloso && <span className="sn-chip sig"><i className="ph ph-lock-simple" /> Sigilosa</span>}
                <small>{dataBR(r.criado_em)} · {r.enfermeiros?.nome_exibicao || r.enfermeiros?.nome || ''}{r.motivo_invalidacao ? ` · Motivo: ${r.motivo_invalidacao}` : ''}</small>
              </div>
              <span className={`sn-chip ${r.situacao}`}>{SITUACAO[r.situacao] || r.situacao}</span>
              <div className="sn-item-acoes">
                {r.situacao === 'rascunho' && <button type="button" className="sn-btn peq" onClick={() => abrirExistente(r)}><i className="ph ph-pencil-simple" /> Continuar</button>}
                {r.situacao !== 'rascunho' && r.situacao !== 'invalidada' && <button type="button" className="sn-btn peq" onClick={() => reimprimir(r)}><i className="ph ph-printer" /> Imprimir</button>}
                {r.situacao === 'registrada' && <button type="button" className="sn-btn peq" onClick={() => entregue(r)}><i className="ph ph-check" /> Entregue à vigilância</button>}
                {r.situacao !== 'invalidada' && <button type="button" className="sn-btn peq" onClick={() => invalidar(r)}><i className="ph ph-prohibit" /> Invalidar</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
