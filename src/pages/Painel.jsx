import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import EspacoPaciente from './EspacoPaciente'
import RealocarModal from './RealocarModal'
import ConfirmModal from './ConfirmModal'
import IndicadoresClinicos from '../components/IndicadoresClinicos'
import { pepEstaAtivo } from '../lib/pepConfig'
import { carregarLeitosOcupadosPep, internarPacientePep } from '../lib/pepAtendimentos'
import './Painel.css'

export default function Painel({ plantao, setoresIds }) {
  const { enfermeiro } = useAuth()
  const [setores, setSetores] = useState([])
  const [leitos, setLeitos] = useState([])
  const [pacientesPorLeito, setPacientesPorLeito] = useState({})
  const [passagemPorPaciente, setPassagemPorPaciente] = useState({})
  const [modalLeito, setModalLeito] = useState(null) // internar rápido
  const [erroInternar, setErroInternar] = useState('')
  const [erroGeral, setErroGeral] = useState('')
  const [modalPassagem, setModalPassagem] = useState(null) // { paciente, leito }
  const [modalRealocar, setModalRealocar] = useState(null) // { paciente, leitoOrigem }
  const [menuAcoesLeitoId, setMenuAcoesLeitoId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [visualizacao, setVisualizacao] = useState('cards') // 'cards' | 'tabela'
  const [buscaTabela, setBuscaTabela] = useState('')
  const [setorFiltro, setSetorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const restauradoRef = useRef(false)
  const pepAtivoRef = useRef(false)
  const chaveModalAberto = `modal_passagem_aberto_${plantao.id}`

  useEffect(() => {
    carregarTudo()
  }, [])

  // Reabre sozinho o card que a pessoa estava vendo/preenchendo se o app recarregar
  // (celular minimizado, PWA derrubada da memória) — sem isso, ela some de volta
  // pro painel em branco e perde de vista o paciente que estava olhando.
  function abrirPassagem(paciente, leito) {
    setModalPassagem({ paciente, leito })
    try {
      localStorage.setItem(chaveModalAberto, JSON.stringify({ pacienteId: paciente.id, leitoId: leito.id, quando: Date.now() }))
    } catch {
      // localStorage indisponível — só não persiste, não é crítico
    }
  }

  function fecharPassagem() {
    setModalPassagem(null)
    try {
      localStorage.removeItem(chaveModalAberto)
    } catch {
      // idem
    }
  }

  function restaurarModalSalvo(mapaAtual, listaLeitosAtual) {
    if (restauradoRef.current) return
    restauradoRef.current = true
    try {
      const bruto = localStorage.getItem(chaveModalAberto)
      if (!bruto) return
      const salvo = JSON.parse(bruto)
      const horasPassadas = (Date.now() - salvo.quando) / 3_600_000
      const paciente = mapaAtual[salvo.leitoId]
      const leito = listaLeitosAtual.find((l) => l.id === salvo.leitoId)
      if (horasPassadas <= 4 && paciente?.id === salvo.pacienteId && leito) {
        setModalPassagem({ paciente, leito })
      } else {
        localStorage.removeItem(chaveModalAberto)
      }
    } catch {
      localStorage.removeItem(chaveModalAberto)
    }
  }

  async function carregarTudo() {
    setCarregando(true)
    const pepAtivo = await pepEstaAtivo(enfermeiro?.id)
    pepAtivoRef.current = pepAtivo

    const { data: listaSetores } = await supabase.from('setores').select('*').order('ordem')
    const { data: listaLeitos } = await supabase
      .from('leitos')
      .select('*')
      .eq('ativo', true)
      .order('numero')

    setSetores(listaSetores ?? [])
    setLeitos(listaLeitos ?? [])

    if (pepAtivo) {
      const { pacientesPorLeito: mapa, passagemPorPaciente } = await carregarLeitosOcupadosPep()
      setPacientesPorLeito(mapa)
      setPassagemPorPaciente(passagemPorPaciente)
      restaurarModalSalvo(mapa, listaLeitos ?? [])
      setCarregando(false)
      return
    }

    const { data: listaPacientes } = await supabase
      .from('pacientes')
      .select('*, ultima_alteracao_por_enfermeiro:enfermeiros!ultima_alteracao_por(nome_exibicao, nome)')
      .eq('status', 'internado')

    const mapa = {}
    for (const p of listaPacientes ?? []) {
      if (p.leito_atual_id) mapa[p.leito_atual_id] = p
    }
    setPacientesPorLeito(mapa)
    restaurarModalSalvo(mapa, listaLeitos ?? [])

    const ids = (listaPacientes ?? []).map((p) => p.id)
    if (ids.length > 0) {
      const { data: passagens } = await supabase
        .from('passagens')
        .select('*, enfermeiros(nome_exibicao, nome)')
        .in('paciente_id', ids)
        .order('criado_em', { ascending: false })
      const ultimaPorPaciente = {}
      for (const p of passagens ?? []) {
        if (!ultimaPorPaciente[p.paciente_id]) ultimaPorPaciente[p.paciente_id] = p
      }
      setPassagemPorPaciente(ultimaPorPaciente)
    } else {
      setPassagemPorPaciente({})
    }

    setCarregando(false)
  }

  async function abrirLeitoExtra(setorId) {
    const leitosDoSetor = leitos.filter((l) => l.setor_id === setorId)
    const numeroExtra = leitosDoSetor.filter((l) => l.tipo === 'extra').length + 1
    const { data: novo, error } = await supabase
      .from('leitos')
      .insert({ setor_id: setorId, numero: `Extra ${numeroExtra}`, tipo: 'extra' })
      .select()
      .single()
    if (!error) {
      setLeitos((prev) => [...prev, novo])
    } else {
      setErroGeral('Não foi possível abrir o leito extra. Tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao abrir leito extra:', error)
    }
  }

  async function internarPaciente(leito, dados) {
    setErroInternar('')

    if (pepAtivoRef.current) {
      const { novo, error } = await internarPacientePep({ leito, dados, enfermeiroId: enfermeiro?.id })
      if (!error) {
        setPacientesPorLeito((prev) => ({ ...prev, [leito.id]: novo }))
        setModalLeito(null)
      } else {
        setErroInternar('Não foi possível internar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
        console.error('Erro ao internar paciente (PEP):', error)
      }
      return
    }

    const { data: novo, error } = await supabase
      .from('pacientes')
      .insert({
        nome: dados.nome,
        diagnostico: dados.diagnostico,
        data_admissao: dados.dataAdmissao,
        data_nascimento: dados.dataNascimento,
        classificacao_manchester: dados.classificacaoManchester,
        leito_atual_id: leito.id,
        status: 'internado',
        status_internacao: dados.status,
        ultima_alteracao_por: enfermeiro?.id,
        ultima_alteracao_em: new Date().toISOString(),
      })
      .select()
      .single()
    if (!error) {
      setPacientesPorLeito((prev) => ({ ...prev, [leito.id]: novo }))
      setModalLeito(null)
    } else {
      setErroInternar('Não foi possível internar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao internar paciente:', error)
    }
  }

  if (carregando) {
    return <div className="page"><p style={{ color: 'var(--color-text-muted)' }}>Carregando painel...</p></div>
  }

  const setoresVisiveis = setores.filter((s) => setoresIds.includes(s.id))

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Painel do plantão</h1>
          <p className="page-subtitle" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>Selecione um leito para internar, editar ou realocar um paciente.</p>
        </div>
        <div className="visualizacao-toggle">
          <button className={visualizacao === 'cards' ? 'on' : ''} onClick={() => setVisualizacao('cards')}>Cards</button>
          <button className={visualizacao === 'tabela' ? 'on' : ''} onClick={() => setVisualizacao('tabela')}>Lista</button>
        </div>
      </div>
      <div style={{ borderBottom: '1px solid var(--c-border)', marginBottom: 20 }} />

      {erroGeral && (
        <div className="error-box" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{erroGeral}</span>
          <button onClick={() => setErroGeral('')} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 700, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {visualizacao === 'tabela' && (
        <PainelTabela
          setoresVisiveis={setoresVisiveis}
          leitos={leitos}
          pacientesPorLeito={pacientesPorLeito}
          busca={buscaTabela}
          onBusca={setBuscaTabela}
          setorFiltro={setorFiltro}
          onSetorFiltro={setSetorFiltro}
          statusFiltro={statusFiltro}
          onStatusFiltro={setStatusFiltro}
          onAbrirLeito={(leito) => {
            const paciente = pacientesPorLeito[leito.id]
            paciente ? abrirPassagem(paciente, leito) : setModalLeito(leito)
          }}
        />
      )}

      {visualizacao === 'cards' && setoresVisiveis.map((setor) => {
        const leitosDoSetor = leitos
          .filter((l) => l.setor_id === setor.id)
          .sort((a, b) => {
            if (a.tipo !== b.tipo) return a.tipo === 'extra' ? 1 : -1
            return parseInt(a.numero, 10) - parseInt(b.numero, 10) || a.numero.localeCompare(b.numero)
          })
        const ocupados = leitosDoSetor.filter((l) => pacientesPorLeito[l.id]).length

        return (
          <div key={setor.id} className="setor-secao">
            <div className="setor-secao-titulo">
              {setor.nome}
              <span className="count">{ocupados}/{leitosDoSetor.length}</span>
            </div>

            <div className="leitos-grid">
              {leitosDoSetor.map((leito) => {
                const paciente = pacientesPorLeito[leito.id]
                const p = paciente ? passagemPorPaciente[paciente.id] : null
                return (
                  <div
                    key={leito.id}
                    className={`leito-card ${paciente ? '' : 'vazio'}`}
                    onClick={() => (paciente ? abrirPassagem(paciente, leito) : setModalLeito(leito))}
                  >
                    <span className={`leito-numero ${leito.tipo === 'extra' ? 'extra' : ''}`}>
                      Leito {leito.numero}
                    </span>
                    {paciente && (
                      <div className="leito-menu-acoes no-print" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="leito-menu-botao"
                          title="Mais ações"
                          onClick={() => setMenuAcoesLeitoId(menuAcoesLeitoId === leito.id ? null : leito.id)}
                        >
                          ⋮
                        </button>
                        {menuAcoesLeitoId === leito.id && (
                          <div className="leito-menu-dropdown">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuAcoesLeitoId(null)
                                setModalRealocar({ paciente, leitoOrigem: leito })
                              }}
                            >
                              ⇄ Realocar paciente
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {paciente ? (
                      <>
                        <div className="leito-paciente-nome">
                          {paciente.nome}
                          <span className={`status-badge ${paciente.status_internacao === 'Internado' ? 'internado' : 'observacao'}`}>
                            {paciente.status_internacao}
                          </span>
                          {paciente.alergias && <span className="status-badge alerta">Alergia</span>}
                        </div>
                        <div className="leito-paciente-diag">HD: {paciente.diagnostico || 'Sem diagnóstico registrado'}</div>
                        <div className="leito-paciente-extra">
                          {paciente.idade ? `${paciente.idade} anos` : null}
                          {paciente.idade && paciente.sexo ? ' · ' : null}
                          {paciente.sexo === 'F' ? 'Feminino' : paciente.sexo === 'M' ? 'Masculino' : null}
                          {paciente.data_admissao ? ` · Admissão: ${new Date(paciente.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR')}` : null}
                        </div>
                        <IndicadoresClinicos passagem={p} />
                        {p?.pendencias && (
                          <div className="leito-paciente-pendencia">{p.pendencias}</div>
                        )}
                        {paciente?.ultima_alteracao_por && paciente?.ultima_alteracao_por_enfermeiro && (
                          <div className="leito-ultima-alteracao no-print">
                            Última alteração: {paciente.ultima_alteracao_por_enfermeiro?.nome_exibicao || paciente.ultima_alteracao_por_enfermeiro?.nome || 'desconhecido'}
                            {' — '}
                            {new Date(paciente.ultima_alteracao_em).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="leito-vazio-texto">Leito vazio — clique para internar</div>
                    )}
                  </div>
                )
              })}
              <button className="leito-add-extra" onClick={() => abrirLeitoExtra(setor.id)}>
                + Abrir leito extra
              </button>
            </div>
          </div>
        )
      })}

      {modalLeito && (
        <ModalInternar
          leito={modalLeito}
          setorNome={setores.find((s) => s.id === modalLeito.setor_id)?.nome}
          pacientesExistentes={Object.values(pacientesPorLeito)}
          erroExterno={erroInternar}
          onCancelar={() => { setModalLeito(null); setErroInternar('') }}
          onConfirmar={(dados) => internarPaciente(modalLeito, dados)}
        />
      )}

      {modalPassagem && (
        <EspacoPaciente
          paciente={modalPassagem.paciente}
          leito={modalPassagem.leito}
          setorNome={setores.find((s) => s.id === modalPassagem.leito.setor_id)?.nome}
          plantaoId={plantao.id}
          enfermeiroId={enfermeiro?.id}
          enfermeiro={enfermeiro}
          onFechar={fecharPassagem}
          onSalvo={carregarTudo}
          onRealocar={(paciente, leito) => {
            fecharPassagem()
            setModalRealocar({ paciente, leitoOrigem: leito })
          }}
        />
      )}

      {modalRealocar && (
        <RealocarModal
          paciente={modalRealocar.paciente}
          leitoOrigem={modalRealocar.leitoOrigem}
          enfermeiroId={enfermeiro?.id}
          onFechar={() => setModalRealocar(null)}
          onRealocado={() => {
            setModalRealocar(null)
            carregarTudo()
          }}
        />
      )}
    </div>
  )
}

function PainelTabela({
  setoresVisiveis, leitos, pacientesPorLeito, busca, onBusca,
  setorFiltro, onSetorFiltro, statusFiltro, onStatusFiltro, onAbrirLeito,
}) {
  const buscaNorm = normalizarNome(busca || '')

  const linhas = setoresVisiveis.flatMap((setor) => {
    const leitosDoSetor = leitos
      .filter((l) => l.setor_id === setor.id)
      .sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === 'extra' ? 1 : -1
        return parseInt(a.numero, 10) - parseInt(b.numero, 10) || a.numero.localeCompare(b.numero)
      })
    return leitosDoSetor.map((leito) => ({ setor, leito, paciente: pacientesPorLeito[leito.id] || null }))
  }).filter(({ setor, paciente }) => {
    if (setorFiltro && setor.id !== setorFiltro) return false
    if (statusFiltro === 'ocupado' && !paciente) return false
    if (statusFiltro === 'vazio' && paciente) return false
    if (statusFiltro === 'internado' && paciente?.status_internacao !== 'Internado') return false
    if (statusFiltro === 'observacao' && paciente?.status_internacao !== 'Em observação') return false
    if (buscaNorm && !(paciente && normalizarNome(paciente.nome).includes(buscaNorm))) return false
    return true
  })

  const ocupados = linhas.filter((l) => l.paciente).length

  return (
    <div>
      <div className="tabela-filtros">
        <div className="tabela-filtro-campo">
          <label>Setor</label>
          <select value={setorFiltro} onChange={(e) => onSetorFiltro(e.target.value)}>
            <option value="">Todos os setores</option>
            {setoresVisiveis.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="tabela-filtro-campo">
          <label>Status</label>
          <select value={statusFiltro} onChange={(e) => onStatusFiltro(e.target.value)}>
            <option value="">Todos</option>
            <option value="ocupado">Ocupados</option>
            <option value="vazio">Vazios</option>
            <option value="internado">Internado</option>
            <option value="observacao">Em observação</option>
          </select>
        </div>
        <div className="tabela-filtro-campo" style={{ flexGrow: 1 }}>
          <label>Buscar paciente</label>
          <input type="text" placeholder="Nome do paciente..." value={busca} onChange={(e) => onBusca(e.target.value)} />
        </div>
      </div>

      <div className="tabela-painel-wrap">
        <table className="tabela-painel">
          <thead>
            <tr>
              <th>Setor / Leito</th>
              <th>Paciente</th>
              <th>Status</th>
              <th>HD</th>
              <th>Admissão</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--c-text-muted)', padding: '16px 14px' }}>Nenhum leito encontrado com esses filtros.</td></tr>
            )}
            {linhas.map(({ setor, leito, paciente }) => (
              <tr key={leito.id} onClick={() => onAbrirLeito(leito)}>
                <td>{setor.nome} · L{leito.numero}</td>
                <td style={{ fontWeight: 600 }}>{paciente ? paciente.nome : <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>Leito vazio</span>}</td>
                <td>
                  {paciente && (
                    <span className={`status-badge ${paciente.status_internacao === 'Internado' ? 'internado' : 'observacao'}`}>
                      {paciente.status_internacao}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--c-text-muted)' }}>{paciente?.diagnostico || '—'}</td>
                <td style={{ color: 'var(--c-text-muted)' }}>
                  {paciente?.data_admissao ? new Date(paciente.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabela-painel-rodape">
          <span>{ocupados} leito(s) ocupado(s) de {linhas.length}</span>
        </div>
      </div>
    </div>
  )
}

// Cores reais da classificação de risco Manchester — exceção deliberada à paleta
// única do design system, porque aqui a cor É o dado clínico, não decoração.
const MANCHESTER_CORES = [
  { nome: 'Vermelho', cor: '#B3261E', texto: '#fff' },
  { nome: 'Laranja', cor: '#C2670A', texto: '#fff' },
  { nome: 'Amarelo', cor: '#C9A227', texto: '#3A2E00' },
  { nome: 'Verde', cor: '#15803d', texto: '#fff' },
  { nome: 'Azul', cor: '#14507D', texto: '#fff' },
]

function normalizarNome(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function ModalInternar({ leito, setorNome, pacientesExistentes, erroExterno, onCancelar, onConfirmar }) {
  const travado = setorNome === 'Internação'
  const chaveRascunho = `rascunho_internar_${leito.id}`

  const [nome, setNome] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [dataAdmissao, setDataAdmissao] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [classificacaoManchester, setClassificacaoManchester] = useState('')
  const [status, setStatus] = useState(travado ? 'Internado' : 'Em observação')
  const [confirmouDuplicata, setConfirmouDuplicata] = useState(false)
  const [camposFaltando, setCamposFaltando] = useState([])

  const [rascunhoEncontrado, setRascunhoEncontrado] = useState(null)

  useEffect(() => {
    const bruto = localStorage.getItem(chaveRascunho)
    if (!bruto) return
    try {
      const rascunho = JSON.parse(bruto)
      setRascunhoEncontrado(rascunho)
    } catch {
      localStorage.removeItem(chaveRascunho)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function continuarRascunho() {
    setNome(rascunhoEncontrado.nome ?? '')
    setDiagnostico(rascunhoEncontrado.diagnostico ?? '')
    setDataAdmissao(rascunhoEncontrado.dataAdmissao ?? '')
    setDataNascimento(rascunhoEncontrado.dataNascimento ?? '')
    setClassificacaoManchester(rascunhoEncontrado.classificacaoManchester ?? '')
    setStatus(rascunhoEncontrado.status ?? (travado ? 'Internado' : 'Em observação'))
    setRascunhoEncontrado(null)
  }

  function descartarRascunho() {
    localStorage.removeItem(chaveRascunho)
    setRascunhoEncontrado(null)
  }

  useEffect(() => {
    if (!nome.trim() && !diagnostico.trim()) return
    const atraso = setTimeout(() => {
      localStorage.setItem(chaveRascunho, JSON.stringify({ nome, diagnostico, dataAdmissao, dataNascimento, classificacaoManchester, status, quando: new Date().toISOString() }))
    }, 800)
    return () => clearTimeout(atraso)
  }, [nome, diagnostico, dataAdmissao, dataNascimento, classificacaoManchester, status])

  const valido = nome.trim() && diagnostico.trim() && dataAdmissao && dataNascimento && classificacaoManchester

  const duplicata = nome.trim()
    ? (pacientesExistentes ?? []).find((p) => normalizarNome(p.nome) === normalizarNome(nome))
    : null

  function cancelarComLimpeza() {
    localStorage.removeItem(chaveRascunho)
    onCancelar()
  }

  function tentarInternar() {
    const faltando = []
    if (!nome.trim()) faltando.push('Nome completo')
    if (!diagnostico.trim()) faltando.push('Diagnóstico')
    if (!dataAdmissao) faltando.push('Data de admissão')
    if (!dataNascimento) faltando.push('Data de nascimento')
    if (!classificacaoManchester) faltando.push('Classificação de Manchester')
    if (faltando.length > 0) {
      setCamposFaltando(faltando)
      return
    }
    setCamposFaltando([])

    if (duplicata && !confirmouDuplicata) {
      setConfirmouDuplicata(true) // primeiro clique só revela o aviso/confirmação
      return
    }
    localStorage.removeItem(chaveRascunho)
    onConfirmar({ nome, diagnostico, dataAdmissao, dataNascimento, classificacaoManchester, status })
  }

  return (
    <>
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Internar no leito {leito.numero}</h2>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Nome completo *</label>
          <input
            type="text"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={nome}
            onChange={(e) => { setNome(e.target.value); setConfirmouDuplicata(false); setCamposFaltando([]) }}
            autoFocus
          />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Diagnóstico *</label>
          <input
            type="text"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={diagnostico}
            onChange={(e) => { setDiagnostico(e.target.value); setCamposFaltando([]) }}
          />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Data de admissão *</label>
          <input
            type="date"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={dataAdmissao}
            onChange={(e) => { setDataAdmissao(e.target.value); setCamposFaltando([]) }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Pode ser uma data anterior a hoje (internação retroativa).
          </p>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Data de nascimento *</label>
          <input
            type="date"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={dataNascimento}
            onChange={(e) => { setDataNascimento(e.target.value); setCamposFaltando([]) }}
          />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Classificação de Manchester *</label>
          <div className="chip-group">
            {MANCHESTER_CORES.map((c) => (
              <button
                type="button"
                key={c.nome}
                onClick={() => { setClassificacaoManchester(c.nome); setCamposFaltando([]) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1.5px solid ${c.cor}`,
                  background: classificacaoManchester === c.nome ? c.cor : 'transparent',
                  color: classificacaoManchester === c.nome ? c.texto : c.cor,
                  cursor: 'pointer',
                }}
              >
                {c.nome}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Status {travado && '(Internação Adulto — fixo)'}</label>
          {travado ? (
            <div className="toggle-group">
              <button type="button" className="toggle-btn on" disabled>Internado</button>
            </div>
          ) : (
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${status === 'Em observação' ? 'on' : ''}`}
                onClick={() => setStatus('Em observação')}
              >
                Em observação
              </button>
              <button
                type="button"
                className={`toggle-btn ${status === 'Internado' ? 'on' : ''}`}
                onClick={() => setStatus('Internado')}
              >
                Internado
              </button>
            </div>
          )}
        </div>

        {duplicata && (
          <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>
            ⚠ Já existe um paciente com nome parecido internado: <b>{duplicata.nome}</b>.
            {confirmouDuplicata
              ? ' Clique em "Internar mesmo assim" de novo pra confirmar.'
              : ' Confira se não é a mesma pessoa antes de continuar.'}
          </div>
        )}

        {camposFaltando.length > 0 && (
          <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>
            ⚠ Preencha antes de continuar: <b>{camposFaltando.join(', ')}</b>
          </div>
        )}

        {erroExterno && (
          <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>{erroExterno}</div>
        )}

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={cancelarComLimpeza}>Cancelar</button>
          <button
            className="modal-btn-primary"
            onClick={tentarInternar}
            style={duplicata ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : undefined}
          >
            {duplicata ? (confirmouDuplicata ? 'Internar mesmo assim' : 'Verificar duplicata') : 'Internar'}
          </button>
        </div>
      </div>
    </div>
    {rascunhoEncontrado && (
      <ConfirmModal
        titulo="Continuar rascunho anterior?"
        mensagem={`Encontramos um rascunho não salvo de internação neste leito, de ${new Date(rascunhoEncontrado.quando).toLocaleString('pt-BR')} — a tela deve ter recarregado antes de salvar. Deseja continuar de onde parou?`}
        confirmarTexto="Continuar rascunho"
        cancelarTexto="Descartar"
        onConfirmar={continuarRascunho}
        onCancelar={descartarRascunho}
      />
    )}
    </>
  )
}
