import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import PassagemForm from './PassagemForm'
import RealocarModal from './RealocarModal'
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
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    const { data: listaSetores } = await supabase.from('setores').select('*').order('ordem')
    const { data: listaLeitos } = await supabase
      .from('leitos')
      .select('*')
      .eq('ativo', true)
      .order('numero')
    const { data: listaPacientes } = await supabase
      .from('pacientes')
      .select('*')
      .eq('status', 'internado')

    setSetores(listaSetores ?? [])
    setLeitos(listaLeitos ?? [])
    const mapa = {}
    for (const p of listaPacientes ?? []) {
      if (p.leito_atual_id) mapa[p.leito_atual_id] = p
    }
    setPacientesPorLeito(mapa)

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
    const { data: novo, error } = await supabase
      .from('pacientes')
      .insert({
        nome: dados.nome,
        diagnostico: dados.diagnostico,
        data_admissao: dados.dataAdmissao,
        leito_atual_id: leito.id,
        status: 'internado',
        status_internacao: dados.status,
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
      <h1 className="page-title">Painel do plantão</h1>
      <p className="page-subtitle">Selecione um leito para internar, editar ou realocar um paciente.</p>

      {erroGeral && (
        <div className="error-box" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{erroGeral}</span>
          <button onClick={() => setErroGeral('')} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 700, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {setoresVisiveis.map((setor) => {
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
                    onClick={() => (paciente ? setModalPassagem({ paciente, leito }) : setModalLeito(leito))}
                  >
                    <span className={`leito-numero ${leito.tipo === 'extra' ? 'extra' : ''}`}>
                      Leito {leito.numero}
                    </span>
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
                        {p?.dispositivos?.length > 0 && (
                          <div className="leito-paciente-extra">Dispositivos: {p.dispositivos.join(', ')}</div>
                        )}
                        {p?.pendencias && (
                          <div className="leito-paciente-pendencia">{p.pendencias}</div>
                        )}
                        {p?.criado_por && p?.enfermeiros && (
                          <div className="leito-ultima-alteracao no-print">
                            Última alteração: {p.enfermeiros?.nome_exibicao || p.enfermeiros?.nome || 'desconhecido'}
                            {' — '}
                            {new Date(p.atualizado_em || p.criado_em).toLocaleString('pt-BR')}
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
        <PassagemForm
          paciente={modalPassagem.paciente}
          leito={modalPassagem.leito}
          setorNome={setores.find((s) => s.id === modalPassagem.leito.setor_id)?.nome}
          plantaoId={plantao.id}
          enfermeiroId={enfermeiro?.id}
          onFechar={() => setModalPassagem(null)}
          onSalvo={carregarTudo}
          onRealocar={(paciente, leito) => {
            setModalPassagem(null)
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
  const [nome, setNome] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [dataAdmissao, setDataAdmissao] = useState('')
  const [status, setStatus] = useState(travado ? 'Internado' : 'Em observação')
  const [confirmouDuplicata, setConfirmouDuplicata] = useState(false)

  const valido = nome.trim() && diagnostico.trim() && dataAdmissao

  const duplicata = nome.trim()
    ? (pacientesExistentes ?? []).find((p) => normalizarNome(p.nome) === normalizarNome(nome))
    : null

  function tentarInternar() {
    if (duplicata && !confirmouDuplicata) {
      setConfirmouDuplicata(true) // primeiro clique só revela o aviso/confirmação
      return
    }
    onConfirmar({ nome, diagnostico, dataAdmissao, status })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Internar no leito {leito.numero}</h2>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Nome completo *</label>
          <input
            type="text"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={nome}
            onChange={(e) => { setNome(e.target.value); setConfirmouDuplicata(false) }}
            autoFocus
          />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Diagnóstico *</label>
          <input
            type="text"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Data de admissão *</label>
          <input
            type="date"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
          />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Pode ser uma data anterior a hoje (internação retroativa).
          </p>
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

        {erroExterno && (
          <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>{erroExterno}</div>
        )}

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button
            className="modal-btn-primary"
            disabled={!valido}
            onClick={tentarInternar}
            style={duplicata ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : undefined}
          >
            {duplicata ? (confirmouDuplicata ? 'Internar mesmo assim' : 'Verificar duplicata') : 'Internar'}
          </button>
        </div>
      </div>
    </div>
  )
}
