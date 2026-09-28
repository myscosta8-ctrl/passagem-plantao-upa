import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { pepEstaAtivo } from '../lib/pepConfig'
import { leitosOcupadosIdsPep, realocarAtendimentoPep } from '../lib/pepAtendimentos'
import { avisarErro } from '../lib/erros'
import './RealocarModal.css'

const ehIsolamento = (l) => /ISO/i.test(l.numero || '') || l.tipo === 'isolamento'
const rotuloLeito = (l) => (ehIsolamento(l) ? 'Isolamento' : `Leito ${String(l.numero).replace(/^0+(?=\d)/, '')}`)

export default function RealocarModal({ paciente, leitoOrigem, enfermeiroId, onFechar, onRealocado }) {
  const [setores, setSetores] = useState([])
  const [leitosVazios, setLeitosVazios] = useState([])
  const [leitosTodos, setLeitosTodos] = useState([])
  const [setorDestinoId, setSetorDestinoId] = useState('')
  const [leitoDestinoId, setLeitoDestinoId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [pepAtivo, setPepAtivo] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const pep = await pepEstaAtivo(enfermeiroId)
    setPepAtivo(pep)
    const { data: listaSetores, error: erroConsulta1 } = await supabase.from('setores').select('*').eq('ativo', true).order('ordem')
    if (erroConsulta1) avisarErro('RealocarModal', erroConsulta1)
    const { data: todosLeitos, error: erroConsulta2 } = await supabase.from('leitos').select('*').eq('ativo', true)
    if (erroConsulta2) avisarErro('RealocarModal', erroConsulta2)
    const ocupados = await leitosOcupadosIdsPep()
    setSetores(listaSetores ?? [])
    setLeitosTodos((todosLeitos ?? []).filter((l) => l.id !== leitoOrigem.id))
    setLeitosVazios((todosLeitos ?? []).filter((l) => !ocupados.has(l.id) && l.id !== leitoOrigem.id))
  }

  const ordenar = (a, b) => (ehIsolamento(a) - ehIsolamento(b)) || a.numero.localeCompare(b.numero, undefined, { numeric: true })
  const leitosDoSetorDestino = leitosVazios.filter((l) => l.setor_id === Number(setorDestinoId)).sort(ordenar)
  const todosDoSetor = leitosTodos.filter((l) => l.setor_id === Number(setorDestinoId)).sort(ordenar)
  const livresIds = new Set(leitosVazios.map((l) => l.id))
  const livresPorSetor = (id) => leitosVazios.filter((l) => l.setor_id === id).length

  async function confirmar() {
    if (!leitoDestinoId) {
      setErro('Escolha o leito de destino.')
      return
    }
    setSalvando(true)

    const { error: erroUpdate } = await realocarAtendimentoPep({
      atendimentoId: paciente.id,
      leitoOrigemId: leitoOrigem.id,
      leitoDestinoId: Number(leitoDestinoId),
      setorDestinoId: Number(setorDestinoId),
    })

    if (erroUpdate) {
      setErro('Não foi possível realocar o paciente.')
      setSalvando(false)
      return
    }

    await supabase.from('realocacoes').insert({
      paciente_id: paciente.id,
      setor_origem_id: leitoOrigem.setor_id,
      leito_origem_id: leitoOrigem.id,
      setor_destino_id: Number(setorDestinoId),
      leito_destino_id: Number(leitoDestinoId),
      enfermeiro_id: enfermeiroId,
    })

    setSalvando(false)
    onRealocado?.()
  }

  async function abrirLeitoExtra() {
    const { count } = await supabase
      .from('leitos')
      .select('id', { count: 'exact', head: true })
      .eq('setor_id', Number(setorDestinoId))
      .eq('tipo', 'extra')
    const numeroExtra = (count ?? 0) + 1
    const { data: novo, error } = await supabase
      .from('leitos')
      .insert({ setor_id: Number(setorDestinoId), numero: `Extra ${numeroExtra}`, tipo: 'extra' })
      .select()
      .single()
    if (!error && novo) {
      setLeitosVazios((prev) => [...prev, novo])
      setLeitosTodos((prev) => [...prev, novo])
      setLeitoDestinoId(String(novo.id))
    } else {
      setErro('Não foi possível abrir o leito extra. Tente de novo.')
      console.error('Erro ao abrir leito extra na realocação:', error)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card rl-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Realocar paciente</h2>
        <div className="rl-origem">
          <i className="ph ph-user" /> <b>{paciente.nome}</b>
          <span>saindo do {rotuloLeito(leitoOrigem)}</span>
        </div>
        <p className="rl-nota">Os dados clínicos já preenchidos são preservados.</p>

        {erro && <div className="error-box">{erro}</div>}

        <div className="rl-rotulo">1. Setor de destino</div>
        <div className="rl-setores">
          {setores.map((s) => {
            const livres = livresPorSetor(s.id)
            return (
              <button key={s.id} type="button" className={`rl-setor ${String(s.id) === setorDestinoId ? 'on' : ''}`}
                onClick={() => { setSetorDestinoId(String(s.id)); setLeitoDestinoId(''); setErro('') }}>
                <span className="rl-setor-nome">{s.nome}</span>
                <span className={`rl-setor-livres ${livres ? '' : 'zero'}`}>{livres ? `${livres} livre${livres > 1 ? 's' : ''}` : 'lotado'}</span>
              </button>
            )
          })}
        </div>

        {setorDestinoId && (
          <>
            <div className="rl-rotulo">2. Leito de destino</div>
            <div className="rl-leitos">
              {todosDoSetor.map((l) => {
                const livre = livresIds.has(l.id)
                return (
                  <button key={l.id} type="button" disabled={!livre}
                    className={`rl-leito ${ehIsolamento(l) ? 'iso' : ''} ${String(l.id) === leitoDestinoId ? 'on' : ''}`}
                    onClick={() => setLeitoDestinoId(String(l.id))}>
                    {ehIsolamento(l) ? <><i className="ph ph-shield-warning" /> ISO</> : String(l.numero).replace(/^0+(?=\d)/, '')}
                    <small>{livre ? 'livre' : 'ocupado'}</small>
                  </button>
                )
              })}
            </div>
            {leitosDoSetorDestino.length === 0 && (
              <div className="rl-lotado">
                Nenhum leito vazio nesse setor no momento.
                <button type="button" className="rl-extra" onClick={abrirLeitoExtra}>+ Abrir leito extra neste setor</button>
              </div>
            )}
          </>
        )}

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="modal-btn-primary" onClick={confirmar} disabled={salvando || !leitoDestinoId}>
            {salvando ? 'Movendo...' : 'Confirmar realocação'}
          </button>
        </div>
      </div>
    </div>
  )
}
