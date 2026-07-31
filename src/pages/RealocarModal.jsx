import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function RealocarModal({ paciente, leitoOrigem, enfermeiroId, onFechar, onRealocado }) {
  const [setores, setSetores] = useState([])
  const [leitosVazios, setLeitosVazios] = useState([])
  const [setorDestinoId, setSetorDestinoId] = useState('')
  const [leitoDestinoId, setLeitoDestinoId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data: listaSetores } = await supabase.from('setores').select('*').order('ordem')
    const { data: todosLeitos } = await supabase.from('leitos').select('*').eq('ativo', true)
    const { data: internados } = await supabase.from('pacientes').select('leito_atual_id').eq('status', 'internado')
    const ocupados = new Set((internados ?? []).map((p) => p.leito_atual_id))
    setSetores(listaSetores ?? [])
    setLeitosVazios((todosLeitos ?? []).filter((l) => !ocupados.has(l.id) && l.id !== leitoOrigem.id))
  }

  const leitosDoSetorDestino = leitosVazios
    .filter((l) => l.setor_id === Number(setorDestinoId))
    .sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true }))

  async function confirmar() {
    if (!leitoDestinoId) {
      setErro('Escolha o leito de destino.')
      return
    }
    setSalvando(true)

    const { error: erroUpdate } = await supabase
      .from('pacientes')
      .update({ leito_atual_id: Number(leitoDestinoId), updated_at: new Date().toISOString() })
      .eq('id', paciente.id)

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

  return (
    <div className="modal-backdrop" onClick={onFechar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Realocar {paciente.nome}</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: -10, marginBottom: 18 }}>
          Saindo do leito {leitoOrigem.numero}. Os dados clínicos já preenchidos são preservados.
        </p>

        {erro && <div className="error-box">{erro}</div>}

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Setor de destino</label>
          <select
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={setorDestinoId}
            onChange={(e) => { setSetorDestinoId(e.target.value); setLeitoDestinoId('') }}
          >
            <option value="">Selecione o setor</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        {setorDestinoId && (
          <div className="field">
            <label>Leito de destino</label>
            <select
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={leitoDestinoId}
              onChange={(e) => setLeitoDestinoId(e.target.value)}
            >
              <option value="">Selecione o leito vazio</option>
              {leitosDoSetorDestino.map((l) => (
                <option key={l.id} value={l.id}>Leito {l.numero}</option>
              ))}
            </select>
            {leitosDoSetorDestino.length === 0 && (
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 6 }}>
                Nenhum leito vazio nesse setor. Abra um leito extra primeiro.
              </p>
            )}
          </div>
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
