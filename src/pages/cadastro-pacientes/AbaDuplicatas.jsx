import { useEffect, useState } from 'react'
import {
  descartarDuplicata,
  confirmarEFundirDuplicata,
  listarDuplicatasPendentes,
} from '../../lib/pepRecepcao'

function CartaoPessoa({ pessoa, titulo, selecionada, onSelecionar }) {
  return (
    <div
      onClick={onSelecionar}
      style={{
        flex: 1, padding: '10px 12px', borderRadius: 'var(--r-sm)', cursor: onSelecionar ? 'pointer' : 'default',
        border: selecionada ? '1.5px solid var(--c-primary)' : '1px solid var(--c-border)',
        background: selecionada ? 'var(--c-primary-light)' : 'var(--c-surface)',
      }}
    >
      <div className="mono" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{pessoa.nome}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-muted)', marginTop: 3 }}>
        {pessoa.prontuario_numero || '—'}
        {pessoa.data_nascimento ? ` · nasc. ${new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
        {pessoa.cpf ? ` · CPF ${pessoa.cpf}` : ''}
        {pessoa.cns ? ` · CNS ${pessoa.cns}` : ''}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-text-muted)', marginTop: 3 }}>
        cadastrada em {new Date(pessoa.criado_em).toLocaleDateString('pt-BR')}
      </div>
    </div>
  )
}

function ItemDuplicata({ item, enfermeiroId, onResolvido }) {
  const [confirmando, setConfirmando] = useState(false)
  const [mantidaId, setMantidaId] = useState(null)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')

  async function descartar() {
    setProcessando(true)
    await descartarDuplicata(item.id, enfermeiroId)
    setProcessando(false)
    onResolvido()
  }

  async function confirmar() {
    if (!mantidaId) return
    setProcessando(true)
    setErro('')
    const removidaId = mantidaId === item.pessoa.id ? item.candidata.id : item.pessoa.id
    const { error } = await confirmarEFundirDuplicata({
      duplicataId: item.id, pessoaMantidaId: mantidaId, pessoaRemovidaId: removidaId, executadoPor: enfermeiroId,
    })
    setProcessando(false)
    if (error) {
      setErro('Não foi possível fundir. Tente de novo.')
      console.error(error)
      return
    }
    onResolvido()
  }

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className={`resumo-badge ${item.match_forca === 'forte' ? 'warn' : 'ok'}`}>
          Match {item.match_forca} — {item.campos_batidos.join(', ')}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <CartaoPessoa
          pessoa={item.pessoa} titulo="Cadastro novo"
          selecionada={confirmando && mantidaId === item.pessoa.id}
          onSelecionar={confirmando ? () => setMantidaId(item.pessoa.id) : undefined}
        />
        <CartaoPessoa
          pessoa={item.candidata} titulo="Já existia"
          selecionada={confirmando && mantidaId === item.candidata.id}
          onSelecionar={confirmando ? () => setMantidaId(item.candidata.id) : undefined}
        />
      </div>

      {erro && <div className="error-box" style={{ marginTop: 12 }}>{erro}</div>}

      {!confirmando ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="modal-btn-secondary" onClick={descartar} disabled={processando}>Não é duplicata</button>
          <button className="submit-btn" style={{ maxWidth: 220 }} onClick={() => setConfirmando(true)}>É a mesma pessoa</button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginBottom: 10 }}>
            Clique em qual dos dois cadastros deve continuar valendo. O outro fica marcado como mesclado (nada é apagado).
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="modal-btn-secondary" onClick={() => { setConfirmando(false); setMantidaId(null) }}>Cancelar</button>
            <button className="submit-btn" style={{ maxWidth: 220 }} onClick={confirmar} disabled={!mantidaId || processando}>
              {processando ? 'Fundindo...' : 'Confirmar fusão'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AbaDuplicatas({ enfermeiroId, onResolvida }) {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setItens(await listarDuplicatasPendentes())
    setCarregando(false)
  }

  function aoResolver() {
    carregar()
    onResolvida?.()
  }

  if (carregando) return <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
  if (itens.length === 0) return <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma duplicata pendente de revisão.</p>

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--c-text-muted)', marginBottom: 16 }}>
        O sistema encontrou cadastros com o mesmo nome. Revise cada um: se for a mesma pessoa, escolha qual prontuário continua sendo usado.
      </p>
      {itens.map((item) => (
        <ItemDuplicata key={item.id} item={item} enfermeiroId={enfermeiroId} onResolvido={aoResolver} />
      ))}
    </div>
  )
}
