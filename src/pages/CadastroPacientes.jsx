import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import {
  buscarPessoas, criarPessoaCompleta, abrirAtendimento, listarCadastrosRecentes,
  detectarDuplicatas, listarDuplicatasPendentes, descartarDuplicata, confirmarEFundirDuplicata,
} from '../lib/pepRecepcao'
import './PassagemForm.css'

const PESSOA_VAZIA = {
  nome: '', sexo: '', data_nascimento: '', cns: '', rg: '', cpf: '', numero_registro_nascimento: '',
  endereco: '', endereco_numero: '', bairro: '', cidade: '', telefone: '',
  nome_mae: '', nome_pai: '',
}

// Home da Recepção — cadastro de identidade completo (Ficha de Identificação
// do Paciente, UPA Breves) + abertura do atendimento administrativo. Não
// decide leito nem internação — isso é da equipe assistencial, em outra tela.
export default function CadastroPacientes() {
  const { enfermeiro } = useAuth()
  const [aba, setAba] = useState('novo') // novo | buscar | duplicatas
  const [recentes, setRecentes] = useState([])
  const [qtdDuplicatas, setQtdDuplicatas] = useState(0)

  useEffect(() => { carregarRecentes() }, [])
  useEffect(() => { carregarQtdDuplicatas() }, [])

  async function carregarRecentes() {
    setRecentes(await listarCadastrosRecentes())
  }

  async function carregarQtdDuplicatas() {
    setQtdDuplicatas((await listarDuplicatasPendentes()).length)
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1 className="page-title">Cadastro de pacientes</h1>
      <p className="page-subtitle">Ficha de Identificação do Paciente — dados completos, uma vez, pra alimentar o resto do sistema (AIH, documentos, prontuário). Piloto começando pela Observação/Internação — setor já vem marcado, mas pode trocar se precisar.</p>

      <div className="form-toolbar" style={{ maxWidth: 460 }}>
        <button className={aba === 'novo' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('novo')}>Novo cadastro</button>
        <button className={aba === 'buscar' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('buscar')}>Buscar existente</button>
        <button className={aba === 'duplicatas' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('duplicatas')}>
          Duplicatas{qtdDuplicatas > 0 ? ` (${qtdDuplicatas})` : ''}
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        {aba === 'novo' && <FormNovoCadastro enfermeiroId={enfermeiro?.id} onCadastrado={carregarRecentes} />}
        {aba === 'buscar' && <Busca enfermeiroId={enfermeiro?.id} onAtendimentoAberto={carregarRecentes} />}
        {aba === 'duplicatas' && <Duplicatas enfermeiroId={enfermeiro?.id} onResolvida={carregarQtdDuplicatas} />}
      </div>

      <div className="form-section" style={{ marginTop: 32 }}>
        <div className="form-section-title">Cadastrados recentemente</div>
        {recentes.length === 0 ? (
          <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>Nenhum cadastro ainda.</p>
        ) : (
          recentes.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
              <span>{a.pessoas?.nome}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-muted)' }}>
                {a.pessoas?.prontuario_numero} · {new Date(a.criado_em).toLocaleString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

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

function Duplicatas({ enfermeiroId, onResolvida }) {
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

function CamposIdentidade({ dados, set }) {
  return (
    <>
      <div className="form-section-title">Identificação</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Nome completo *</label>
          <input type="text" value={dados.nome} onChange={(e) => set('nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Sexo</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${dados.sexo === 'F' ? 'on' : ''}`} onClick={() => set('sexo', 'F')}>Fem.</button>
            <button type="button" className={`toggle-btn ${dados.sexo === 'M' ? 'on' : ''}`} onClick={() => set('sexo', 'M')}>Masc.</button>
          </div>
        </div>
        <div className="form-field">
          <label>Data de nascimento</label>
          <input type="date" value={dados.data_nascimento} onChange={(e) => set('data_nascimento', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cartão Nacional SUS</label>
          <input type="text" value={dados.cns} onChange={(e) => set('cns', e.target.value)} />
        </div>
        <div className="form-field">
          <label>RG</label>
          <input type="text" value={dados.rg} onChange={(e) => set('rg', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CPF</label>
          <input type="text" value={dados.cpf} onChange={(e) => set('cpf', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nº registro de nascimento</label>
          <input type="text" value={dados.numero_registro_nascimento} onChange={(e) => set('numero_registro_nascimento', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: 22 }}>Endereço e contato</div>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Endereço</label>
          <input type="text" value={dados.endereco} onChange={(e) => set('endereco', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Número</label>
          <input type="text" value={dados.endereco_numero} onChange={(e) => set('endereco_numero', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Bairro</label>
          <input type="text" value={dados.bairro} onChange={(e) => set('bairro', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cidade</label>
          <input type="text" value={dados.cidade} onChange={(e) => set('cidade', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Contato</label>
          <input type="text" placeholder="(  ) ....." value={dados.telefone} onChange={(e) => set('telefone', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: 22 }}>Filiação</div>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Mãe</label>
          <input type="text" value={dados.nome_mae} onChange={(e) => set('nome_mae', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Pai</label>
          <input type="text" value={dados.nome_pai} onChange={(e) => set('nome_pai', e.target.value)} />
        </div>
      </div>
    </>
  )
}

function CamposAtendimento({ atd, set, setores }) {
  return (
    <>
      <div className="form-section-title" style={{ marginTop: 22 }}>Atendimento</div>
      <div className="form-grid">
        <div className="form-field">
          <label>Setor</label>
          <select value={atd.setor_id} onChange={(e) => set('setor_id', e.target.value)}>
            <option value="">—</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="form-field span-2">
          <label>Médico</label>
          <input type="text" value={atd.medico} onChange={(e) => set('medico', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: 22 }}>Responsável pelo paciente</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Pra declaração/termo de responsabilidade — assinado em papel na hora da internação.
      </p>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Nome do responsável</label>
          <input type="text" value={atd.responsavelNome} onChange={(e) => set('responsavelNome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>RG do responsável</label>
          <input type="text" value={atd.responsavelRg} onChange={(e) => set('responsavelRg', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Relação com o paciente</label>
          <input type="text" placeholder="ex: mãe, cônjuge..." value={atd.responsavelRelacao} onChange={(e) => set('responsavelRelacao', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Endereço do responsável</label>
          <input type="text" value={atd.responsavelEndereco} onChange={(e) => set('responsavelEndereco', e.target.value)} />
        </div>
      </div>
    </>
  )
}

function FormNovoCadastro({ enfermeiroId, onCadastrado }) {
  const [dados, setDados] = useState(PESSOA_VAZIA)
  const [atd, setAtd] = useState({ setor_id: '', medico: '', responsavelNome: '', responsavelRg: '', responsavelRelacao: '', responsavelEndereco: '' })
  const [setores, setSetores] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(null)

  useEffect(() => {
    supabase.from('setores').select('*').order('ordem').then(({ data }) => {
      setSetores(data ?? [])
      // Piloto da recepção começa pela Observação (mais leitos/volume, maioria
      // segue pra internação de lá) — pré-marcado, mas continua trocável.
      const observacao = (data ?? []).find((s) => s.nome.includes('Observação'))
      if (observacao) setAtd((prev) => ({ ...prev, setor_id: String(observacao.id) }))
    })
  }, [])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function setA(campo, valor) { setAtd((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.nome.trim()) {
      setErro('Nome completo é obrigatório.')
      return
    }
    setErro('')
    setSucesso(null)
    setSalvando(true)

    const { data: pessoa, error: erroPessoa } = await criarPessoaCompleta(dados)
    if (erroPessoa) {
      setSalvando(false)
      setErro('Não foi possível salvar o cadastro. Tente de novo.')
      console.error(erroPessoa)
      return
    }
    detectarDuplicatas(pessoa.id, dados)

    const { data: atendimento, error: erroAtd } = await abrirAtendimento({
      pessoaId: pessoa.id,
      setorId: atd.setor_id || null,
      medicoResponsavelNome: atd.medico,
      responsavel: { nome: atd.responsavelNome, rg: atd.responsavelRg, relacao: atd.responsavelRelacao, endereco: atd.responsavelEndereco },
      criadoPor: enfermeiroId,
    })
    setSalvando(false)
    if (erroAtd) {
      setErro('Pessoa cadastrada, mas não foi possível abrir o atendimento. Tente de novo pela busca.')
      console.error(erroAtd)
      return
    }

    setSucesso({ nome: pessoa.nome, prontuario: pessoa.prontuario_numero, atendimento: atendimento.numero_atendimento })
    setDados(PESSOA_VAZIA)
    setAtd({ setor_id: '', medico: '', responsavelNome: '', responsavelRg: '', responsavelRelacao: '', responsavelEndereco: '' })
    onCadastrado?.()
  }

  return (
    <div className="card">
      <CamposIdentidade dados={dados} set={set} />
      <CamposAtendimento atd={atd} set={setA} setores={setores} />

      {erro && <div className="error-box" style={{ marginTop: 16 }}>{erro}</div>}
      {sucesso && (
        <div className="error-box" style={{ marginTop: 16, background: 'var(--c-primary-light)', color: 'var(--c-primary)', borderLeftColor: 'var(--c-primary)' }}>
          Cadastrado: <b>{sucesso.nome}</b> — prontuário {sucesso.prontuario}, atendimento {sucesso.atendimento}.
        </div>
      )}

      <button className="submit-btn" style={{ marginTop: 20, maxWidth: 260 }} onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Cadastrar paciente'}
      </button>
    </div>
  )
}

function Busca({ enfermeiroId, onAtendimentoAberto }) {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [selecionada, setSelecionada] = useState(null)
  const [atd, setAtd] = useState({ setor_id: '', medico: '', responsavelNome: '', responsavelRg: '', responsavelRelacao: '', responsavelEndereco: '' })
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
    setBuscando(true)
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
    setAtd({ setor_id: '', medico: '', responsavelNome: '', responsavelRg: '', responsavelRelacao: '', responsavelEndereco: '' })
    onAtendimentoAberto?.()
  }

  return (
    <div className="card">
      <form onSubmit={buscar} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input type="text" placeholder="Nome, CPF, CNS ou nº de prontuário..." value={termo} onChange={(e) => setTermo(e.target.value)} />
        <button type="submit" className="modal-btn-secondary" style={{ flexShrink: 0, padding: '0 16px' }} disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {sucesso && (
        <div className="error-box" style={{ marginBottom: 16, background: 'var(--c-primary-light)', color: 'var(--c-primary)', borderLeftColor: 'var(--c-primary)' }}>
          Atendimento aberto pra <b>{sucesso.nome}</b> — nº {sucesso.atendimento}.
        </div>
      )}

      {!selecionada && resultados.map((p) => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border-light)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.nome}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-muted)' }}>
              {p.prontuario_numero} {p.cpf ? `· CPF ${p.cpf}` : ''} {p.cns ? `· CNS ${p.cns}` : ''}
            </div>
          </div>
          <button className="modal-btn-secondary" onClick={() => setSelecionada(p)}>Abrir atendimento</button>
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
