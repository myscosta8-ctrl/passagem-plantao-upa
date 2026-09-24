import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { buscarPessoas, abrirAtendimento } from '../../lib/pepRecepcao'
import CamposAtendimento from './CamposAtendimento'
import { ATENDIMENTO_VAZIO } from './constantes'

export default function AbaBusca({ enfermeiroId, onAtendimentoAberto, onCompletarCadastro, onIrParaNovo }) {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [jaBuscou, setJaBuscou] = useState(false)
  const [selecionada, setSelecionada] = useState(null)
  const [atd, setAtd] = useState(ATENDIMENTO_VAZIO)
  const [setores, setSetores] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(null)

  useEffect(() => {
    supabase.from('setores').select('*').order('ordem').then(({ data }) => {
      setSetores(data ?? [])
      const observacao = (data ?? []).find((s) => s.nome.includes('Observação'))
      if (observacao) setAtd((prev) => ({ ...prev, setor_id: String(observacao.id) }))
    })
  }, [])

  async function buscar(e) {
    e.preventDefault()
    if (!termo.trim()) return
    setBuscando(true)
    setJaBuscou(true)
    setResultados(await buscarPessoas(termo))
    setBuscando(false)
  }

  function setA(campo, valor) { setAtd((prev) => ({ ...prev, [campo]: valor })) }

  async function abrirNovoAtendimento() {
    if (!selecionada) return
    setSalvando(true)
    setErro('')
    const { data: atendimento, error } = await abrirAtendimento({
      pessoaId: selecionada.id,
      setorId: atd.setor_id || null,
      medicoResponsavelNome: atd.medico,
      responsavel: { nome: atd.responsavelNome, rg: atd.responsavelRg, relacao: atd.responsavelRelacao, endereco: atd.responsavelEndereco },
      criadoPor: enfermeiroId,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível abrir o atendimento. Tente de novo.')
      console.error(error)
      return
    }
    setSucesso({ nome: selecionada.nome, atendimento: atendimento.numero_atendimento })
    setSelecionada(null)
    setAtd(ATENDIMENTO_VAZIO)
    onAtendimentoAberto?.()
  }

  return (
    <div className="card">
      <form onSubmit={buscar} className="recepcao-search-bar" style={{ marginBottom: 16 }}>
        <div className="recepcao-search-input">
          <i className="ph ph-magnifying-glass" />
          <input
            type="text"
            placeholder="Digite Nome, CPF, CNS ou nº de prontuário..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" className="submit-btn" style={{ padding: '0 20px', maxWidth: 140 }} disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {sucesso && (
        <div className="error-box" style={{ marginBottom: 16, background: 'var(--c-primary-light)', color: 'var(--c-primary)', borderLeftColor: 'var(--c-primary)' }}>
          Atendimento aberto pra <b>{sucesso.nome}</b> — nº {sucesso.atendimento}.
        </div>
      )}

      {jaBuscou && resultados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--c-surface-inset)', borderRadius: 8, margin: '14px 0' }}>
          <p style={{ fontSize: 13.5, color: 'var(--c-text-secondary)', marginBottom: 12 }}>
            Nenhum paciente encontrado para <b>"{termo}"</b>.
          </p>
          <button type="button" className="btn-realocar" onClick={onIrParaNovo}>
            <i className="ph ph-plus-circle" /> Iniciar novo cadastro para este paciente
          </button>
        </div>
      )}

      {!selecionada && resultados.map((p) => (
        <div key={p.id} className="recepcao-resultado-item">
          <div>
            <div className="recepcao-resultado-nome">{p.nome}</div>
            <div className="recepcao-resultado-meta">
              Prontuário: {p.prontuario_numero || '—'} {p.cpf ? `· CPF: ${p.cpf}` : ''} {p.cns ? `· CNS: ${p.cns}` : ''} {p.data_nascimento ? `· Nasc: ${new Date(p.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
            </div>
          </div>
          <div className="recepcao-resultado-acoes">
            <button type="button" className="modal-btn-secondary" style={{ fontSize: 12 }} onClick={() => onCompletarCadastro?.(p)}>
              <i className="ph ph-pencil-simple" /> Completar dados
            </button>
            <button type="button" className="btn-realocar" style={{ fontSize: 12 }} onClick={() => setSelecionada(p)}>
              Abrir atendimento
            </button>
          </div>
        </div>
      ))}

      {selecionada && (
        <>
          <div className="form-section-title">Novo atendimento — {selecionada.nome}</div>
          <CamposAtendimento atd={atd} set={setA} setores={setores} />
          {erro && <div className="error-box" style={{ marginTop: 16 }}>{erro}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="modal-btn-secondary" onClick={() => setSelecionada(null)}>Cancelar</button>
            <button className="submit-btn" style={{ maxWidth: 260 }} onClick={abrirNovoAtendimento} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Abrir atendimento'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
