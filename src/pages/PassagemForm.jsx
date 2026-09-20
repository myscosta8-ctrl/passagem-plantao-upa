import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ConfirmModal from './ConfirmModal'
import { pepEstaAtivo } from '../lib/pepConfig'
import {
  buscarPassagemAtualPep,
  buscarUltimaPassagemPep,
  salvarPassagemPep,
  salvarIdentificacaoPep,
  registrarDesfechoPep,
  excluirAtendimentoPep,
  obterOuCriarAtendimentoParaPaciente,
} from '../lib/pepAtendimentos'
import { listarExames, listarSorologias, listarHemoterapia, buscarAberturaRegulacao } from '../lib/pepMedico'
import './PassagemForm.css'

const DISPOSITIVOS_OPCOES = ['AVP', 'SVD', 'SNE', 'Dreno', 'O2']
const NIVEIS_CONSCIENCIA = ['Consciente', 'Confuso', 'Sonolento', 'Sedado', 'Torporoso', 'Agitado', 'Inconsciente']

const PASSAGEM_VAZIA = {
  curativo_realizado: null,
  avp_data_insercao: '',
  avp_hora_insercao: '',
  nivel_consciencia: '',
  dispositivos: [],
  dispositivos_detalhe: '',
  acompanhante: null,

  leito_liberado_outro_hospital: null,
  leito_liberado_hospital: '',
  leito_liberado_transporte: '',
  alta_sala_vermelha: null,
  alta_sala_vermelha_data: '',
  alta_sala_vermelha_hora: '',

  pendencias: '',
}

export default function PassagemForm({ paciente, leito, setorNome, plantaoId, enfermeiroId, onFechar, onSalvo, onRealocar, embedded = false }) {
  const [processando, setProcessando] = useState(false)
  const [modalDesfecho, setModalDesfecho] = useState(false)
  const [modalExcluir, setModalExcluir] = useState(false)
  const statusTravado = setorNome === 'Internação'
  const [identificacao, setIdentificacao] = useState({
    nome: paciente.nome ?? '',
    diagnostico: paciente.diagnostico ?? '',
    idade: paciente.idade ?? '',
    sexo: paciente.sexo ?? '',
    data_admissao: paciente.data_admissao ?? '',
    alergias: paciente.alergias ?? false,
    alergias_obs: paciente.alergias_obs ?? '',
    status_internacao: statusTravado ? 'Internado' : (paciente.status_internacao ?? 'Em observação'),
  })
  const [passagem, setPassagem] = useState(PASSAGEM_VAZIA)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [sujo, setSujo] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  const [camposFaltando, setCamposFaltando] = useState([])
  const [rascunhoEncontrado, setRascunhoEncontrado] = useState(null)
  const [confirmandoFechar, setConfirmandoFechar] = useState(false)
  const [origemCopia, setOrigemCopia] = useState(null)
  const [pepAtivo, setPepAtivo] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  useEffect(() => {
    function avisarSaidaComEdicaoPendente(e) {
      if (sujo) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', avisarSaidaComEdicaoPendente)
    return () => window.removeEventListener('beforeunload', avisarSaidaComEdicaoPendente)
  }, [sujo])

  // Guarda um rascunho automaticamente enquanto a pessoa digita, pra sobreviver
  // se a tela recarregar sozinha (comum no celular ao trocar de app e voltar, ou
  // no PWA minimizado por tempo demais). Inclui identificação — não só a passagem —
  // porque nome/diagnóstico/idade são digitados no mesmo formulário.
  function salvarRascunhoAgora() {
    if (!sujo || carregando) return
    localStorage.setItem(chaveRascunho(), JSON.stringify({ identificacao, passagem, quando: new Date().toISOString() }))
  }

  useEffect(() => {
    if (!sujo || carregando) return
    const atraso = setTimeout(salvarRascunhoAgora, 800)
    return () => clearTimeout(atraso)
  }, [identificacao, passagem, sujo, carregando])

  // Rede de segurança: se a tela for escondida (troca de app, aba minimizada) antes
  // dos 800ms acima rodarem, salva na hora — sem esperar o debounce, sem esperar
  // o beforeunload (que no celular pode nunca disparar a tempo).
  useEffect(() => {
    function aoEsconder() {
      if (document.visibilityState === 'hidden') salvarRascunhoAgora()
    }
    document.addEventListener('visibilitychange', aoEsconder)
    window.addEventListener('pagehide', salvarRascunhoAgora)
    return () => {
      document.removeEventListener('visibilitychange', aoEsconder)
      window.removeEventListener('pagehide', salvarRascunhoAgora)
    }
  }, [identificacao, passagem, sujo, carregando])

  function chaveRascunho() {
    return `rascunho_passagem_${plantaoId}_${paciente.id}`
  }

  // Compatibilidade: passagens antigas guardavam "AVP: sim" num campo à parte,
  // separado do grupo de dispositivos. Reconhece as duas formas ao carregar.
  function normalizarAvp(dados) {
    const dispositivos = dados.dispositivos ?? []
    if (dados.avp && !dispositivos.includes('AVP')) {
      return { ...dados, dispositivos: [...dispositivos, 'AVP'] }
    }
    return dados
  }

  function continuarRascunho() {
    // "dados" é o formato antigo do rascunho (só a passagem, sem identificação) —
    // continua sendo aceito pra não quebrar um rascunho salvo antes desta mudança.
    const dadosPassagem = rascunhoEncontrado.passagem ?? rascunhoEncontrado.dados ?? {}
    setPassagem({ ...PASSAGEM_VAZIA, ...dadosPassagem })
    if (rascunhoEncontrado.identificacao) {
      setIdentificacao((prev) => ({ ...prev, ...rascunhoEncontrado.identificacao }))
    }
    setSujo(true)
    setRascunhoEncontrado(null)
  }

  function descartarRascunho() {
    localStorage.removeItem(chaveRascunho())
    setRascunhoEncontrado(null)
    carregar()
  }

  async function carregar() {
    setCarregando(true)
    const pep = await pepEstaAtivo(enfermeiroId)
    setPepAtivo(pep)

    // Existe um rascunho não salvo (de uma interrupção anterior: tela recarregou, app fechou)?
    const rascunhoBruto = localStorage.getItem(chaveRascunho())
    if (rascunhoBruto) {
      try {
        const rascunho = JSON.parse(rascunhoBruto)
        setRascunhoEncontrado(rascunho)
        setCarregando(false)
        return
      } catch {
        localStorage.removeItem(chaveRascunho())
      }
    }

    // 1. Já existe passagem preenchida NESTE plantão para esse paciente?
    const atual = pep
      ? await buscarPassagemAtualPep(plantaoId, paciente.id)
      : (await supabase
          .from('passagens')
          .select('*')
          .eq('plantao_id', plantaoId)
          .eq('paciente_id', paciente.id)
          .maybeSingle()).data

    if (atual) {
      setPassagem(normalizarAvp({ ...PASSAGEM_VAZIA, ...atual }))
      setCarregando(false)
      return
    }

    // 2. Senão, copia automaticamente da última passagem desse paciente (outro plantão)
    const anterior = pep
      ? await buscarUltimaPassagemPep(paciente.id)
      : (await supabase
          .from('passagens')
          .select('*')
          .eq('paciente_id', paciente.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle()).data

    if (anterior) {
      setPassagem(normalizarAvp({ ...PASSAGEM_VAZIA, ...anterior }))
      setOrigemCopia(anterior.criado_em)
    }
    setCarregando(false)
  }

  async function copiarNovamente() {
    const anterior = pepAtivo
      ? await buscarUltimaPassagemPep(paciente.id)
      : (await supabase
          .from('passagens')
          .select('*')
          .eq('paciente_id', paciente.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle()).data
    if (anterior) {
      setPassagem(normalizarAvp({ ...PASSAGEM_VAZIA, ...anterior }))
      setOrigemCopia(anterior.criado_em)
    }
  }

  function set(campo, valor) {
    setPassagem((prev) => ({ ...prev, [campo]: valor }))
    setSalvo(false)
    setSujo(true)
  }

  // Antes, editar nome/diagnóstico/idade etc. não marcava o formulário como "sujo" —
  // ou seja, não entrava no rascunho automático nem avisava antes de sair da página.
  // Uma alteração perdida aqui não aparecia nem no aviso, nem na recuperação.
  function setId(campo, valor) {
    setIdentificacao((prev) => ({ ...prev, [campo]: valor }))
    setSalvo(false)
    setSujo(true)
  }

  function toggleDispositivo(d) {
    setSujo(true)
    setPassagem((prev) => {
      const atuais = prev.dispositivos ?? []
      return {
        ...prev,
        dispositivos: atuais.includes(d) ? atuais.filter((x) => x !== d) : [...atuais, d],
      }
    })
    setSalvo(false)
  }

  // Campos clínicos que, uma vez que a pergunta principal foi respondida "sim"
  // ou preenchida, precisam de data pra virar informação útil (ex: sem a hora
  // do AVP não dá pra alertar a troca das 96h).
  function validarObrigatorios() {
    const faltando = []
    if (passagem.dispositivos?.includes('AVP') && (!passagem.avp_data_insercao || !passagem.avp_hora_insercao)) {
      faltando.push('Data e hora de inserção do AVP')
    }
    return faltando
  }

  async function salvar() {
    const faltando = validarObrigatorios()
    if (faltando.length > 0) {
      setCamposFaltando(faltando)
      return
    }
    setCamposFaltando([])
    setSalvando(true)
    setErroSalvar('')

    let error
    if (pepAtivo) {
      const statusFinal = statusTravado ? 'Internado' : identificacao.status_internacao
      const { error: erroId } = await salvarIdentificacaoPep({
        atendimentoId: paciente.id,
        pessoaId: paciente.pessoa_id,
        identificacao: { ...identificacao, status_internacao: statusFinal },
      })
      if (erroId) {
        error = erroId
      } else {
        const payload = {
          plantao_id: plantaoId,
          atendimento_id: paciente.id,
          leito_id: leito.id,
          setor_id: leito.setor_id,
          criado_por: enfermeiroId,
          atualizado_em: new Date().toISOString(),
          ...passagem,
        }
        const resultado = await salvarPassagemPep(payload)
        error = resultado.error
      }
    } else {
      const statusInternacaoNovo = statusTravado ? 'Internado' : identificacao.status_internacao
      // Indicador clínico "tempo até conduta": marca o instante em que o paciente
      // deixa de estar "Em observação", uma única vez (nunca reescreve depois).
      const saiuDeObservacao = paciente.status_internacao === 'Em observação' && statusInternacaoNovo !== 'Em observação'

      await supabase
        .from('pacientes')
        .update({
          nome: identificacao.nome,
          diagnostico: identificacao.diagnostico,
          idade: identificacao.idade || null,
          sexo: identificacao.sexo || null,
          data_admissao: identificacao.data_admissao || null,
          alergias: identificacao.alergias,
          alergias_obs: identificacao.alergias_obs,
          status_internacao: statusInternacaoNovo,
          ...(saiuDeObservacao ? { data_conduta_definida: new Date().toISOString() } : {}),
          updated_at: new Date().toISOString(),
          ultima_alteracao_por: enfermeiroId,
          ultima_alteracao_em: new Date().toISOString(),
        })
        .eq('id', paciente.id)

      const payload = {
        plantao_id: plantaoId,
        paciente_id: paciente.id,
        leito_id: leito.id,
        setor_id: leito.setor_id,
        criado_por: enfermeiroId,
        atualizado_em: new Date().toISOString(),
        ...passagem,
      }
      // Qualquer campo de texto vazio vira NULL — evita que campos com valores
      // restritos (nivel_consciencia, exame_status, etc) travem a gravação no banco.
      for (const chave in payload) {
        if (payload[chave] === '') payload[chave] = null
      }

      const resultado = await supabase
        .from('passagens')
        .upsert(payload, { onConflict: 'plantao_id,paciente_id' })
      error = resultado.error
    }

    setSalvando(false)
    if (!error) {
      setSalvo(true)
      setSujo(false)
      localStorage.removeItem(chaveRascunho())
      onSalvo?.()
      onFechar?.()
    } else {
      setErroSalvar('Não foi possível salvar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao salvar passagem:', error)
    }
  }

  async function registrarDesfecho(tipo, detalhe, dadosObito) {
    setProcessando(true)
    const { error } = pepAtivo
      ? await registrarDesfechoPep({ atendimentoId: paciente.id, leitoId: leito.id, tipo, detalhe, autorId: enfermeiroId, dadosObito })
      : await supabase
          .from('pacientes')
          .update({
            status: 'alta',
            tipo_desfecho: tipo,
            desfecho_detalhe: detalhe || null,
            data_desfecho: new Date().toISOString(),
            // Foi direto da observação pro desfecho, sem nunca internar — também
            // conta como "saiu da observação" pro indicador de tempo até conduta.
            ...(paciente.status_internacao === 'Em observação' ? { data_conduta_definida: new Date().toISOString() } : {}),
            ultima_alteracao_por: enfermeiroId,
            ultima_alteracao_em: new Date().toISOString(),
          })
          .eq('id', paciente.id)
    setProcessando(false)
    if (!error) {
      onSalvo?.()
      onFechar?.()
    } else {
      setModalDesfecho(false)
      setErroSalvar('Não foi possível registrar o desfecho. Nada foi perdido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao registrar desfecho:', error)
    }
  }

  async function excluirPaciente() {
    setModalExcluir(true)
  }

  async function confirmarExclusao() {
    setModalExcluir(false)
    setProcessando(true)
    const { error } = pepAtivo
      ? await excluirAtendimentoPep(paciente.id, paciente.pessoa_id)
      : await supabase.from('pacientes').delete().eq('id', paciente.id)
    setProcessando(false)
    if (!error) {
      onSalvo?.()
      onFechar?.()
    } else {
      setErroSalvar('Não foi possível excluir. Nada foi alterado — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao excluir paciente:', error)
    }
  }

  function fecharComConfirmacao() {
    if (sujo) {
      setConfirmandoFechar(true)
      return
    }
    localStorage.removeItem(chaveRascunho())
    onFechar?.()
  }

  function confirmarFecharDescartando() {
    setConfirmandoFechar(false)
    localStorage.removeItem(chaveRascunho())
    onFechar?.()
  }

  if (carregando) {
    return (
      <div className="form-overlay">
        <div className="form-panel" onClick={(e) => e.stopPropagation()}>
          <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  const conteudo = (
    <>
      <div className={embedded ? "form-panel form-panel-embedded" : "form-panel"} onClick={(e) => e.stopPropagation()}>
        {!embedded && (
          <div className="form-header">
            <span className="form-leito-tag">Leito {leito.numero}</span>
            <button className="form-header-close" onClick={fecharComConfirmacao}>×</button>
          </div>
        )}

        <div className="form-toolbar">
          <button className="btn-copiar" onClick={copiarNovamente}>↺ Copiar do plantão anterior</button>
          <button className="btn-realocar" onClick={() => onRealocar?.(paciente, leito)}>⇄ Realocar paciente</button>
          <button className="btn-alta" onClick={() => setModalDesfecho(true)} disabled={processando}>✓ Registrar desfecho</button>
          <button className="btn-excluir" onClick={excluirPaciente} disabled={processando}>🗑 Excluir paciente</button>
        </div>
        {origemCopia && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: -14, marginBottom: 18 }}>
            Copiado do plantão de {new Date(origemCopia).toLocaleString('pt-BR')}. Ajuste o que mudou.
          </p>
        )}

        {/* IDENTIFICAÇÃO */}
        <div className="form-section">
          <div className="form-section-title">Identificação</div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label>Nome</label>
              <input type="text" value={identificacao.nome} onChange={(e) => setId('nome', e.target.value)} />
            </div>
            <div className="form-field span-2">
              <label>Diagnóstico</label>
              <input type="text" value={identificacao.diagnostico} onChange={(e) => setId('diagnostico', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Idade</label>
              <input type="number" value={identificacao.idade} onChange={(e) => setId('idade', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Sexo</label>
              <select value={identificacao.sexo} onChange={(e) => setId('sexo', e.target.value)}>
                <option value="">—</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div className="form-field span-2">
              <label>Status {statusTravado && '(Internação Adulto — fixo)'}</label>
              {statusTravado ? (
                <div className="toggle-group">
                  <button type="button" className="toggle-btn on" disabled>Internado</button>
                </div>
              ) : (
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${identificacao.status_internacao === 'Em observação' ? 'on' : ''}`}
                    onClick={() => setId('status_internacao', 'Em observação')}
                  >
                    Em observação
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${identificacao.status_internacao === 'Internado' ? 'on' : ''}`}
                    onClick={() => setId('status_internacao', 'Internado')}
                  >
                    Internado
                  </button>
                </div>
              )}
            </div>
            <div className="form-field span-2">
              <label>Data de admissão</label>
              <input type="date" value={identificacao.data_admissao} onChange={(e) => setId('data_admissao', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Alergias</label>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn ${identificacao.alergias === false ? 'on' : ''}`} onClick={() => setId('alergias', false)}>Não</button>
                <button type="button" className={`toggle-btn ${identificacao.alergias === true ? 'on danger' : ''}`} onClick={() => setId('alergias', true)}>Sim</button>
              </div>
            </div>
            {identificacao.alergias && (
              <div className="form-field span-3">
                <label>Quais alergias</label>
                <input type="text" value={identificacao.alergias_obs} onChange={(e) => setId('alergias_obs', e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* ASSISTÊNCIA */}
        <div className="form-section">
          <div className="form-section-title">Assistência</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Curativo realizado</label>
              <SimNao valor={passagem.curativo_realizado} onChange={(v) => set('curativo_realizado', v)} />
            </div>
            <div className="form-field">
              <label>Nível de consciência</label>
              <select value={passagem.nivel_consciencia ?? ''} onChange={(e) => set('nivel_consciencia', e.target.value)}>
                <option value="">—</option>
                {NIVEIS_CONSCIENCIA.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-field span-3">
              <label>Dispositivos invasivos</label>
              <div className="chip-group">
                {DISPOSITIVOS_OPCOES.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={`chip ${passagem.dispositivos?.includes(d) ? 'on' : ''}`}
                    onClick={() => toggleDispositivo(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {passagem.dispositivos?.includes('AVP') && (
              <>
                <div className="form-field">
                  <label>Data de inserção do AVP *</label>
                  <input type="date" value={passagem.avp_data_insercao ?? ''} onChange={(e) => set('avp_data_insercao', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Hora de inserção *</label>
                  <input type="time" value={passagem.avp_hora_insercao ?? ''} onChange={(e) => set('avp_hora_insercao', e.target.value)} />
                </div>
                <div className="form-field span-3">
                  <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', margin: 0 }}>Usado para alertar a troca do AVP nas 96h.</p>
                </div>
              </>
            )}
            {passagem.dispositivos?.length > 0 && (
              <div className="form-field span-3">
                <label>Detalhe dos dispositivos (nº, tamanho)</label>
                <input
                  type="text"
                  placeholder="ex: SVD Nº16, TOT 7,5"
                  value={passagem.dispositivos_detalhe ?? ''}
                  onChange={(e) => set('dispositivos_detalhe', e.target.value)}
                />
              </div>
            )}
            <div className="form-field span-3">
              <label>Acompanhante presente</label>
              <SimNao valor={passagem.acompanhante} onChange={(v) => set('acompanhante', v)} />
            </div>
          </div>
        </div>

        {/* RESUMO DO PRONTUÁRIO — somente leitura, puxado direto do Prontuário
            Médico. Exames/Sorologias/Hemoterapia/Regulação deixaram de ser
            digitados aqui pra não duplicar com o que já existe lá (Divisão
            Passagem/Prontuário, Etapa 4) — quem quiser editar, abre o pilar
            Prontuário Médico no Espaço do Paciente. */}
        <ResumoProntuario paciente={paciente} />

        {/* TRANSFERÊNCIA */}
        <div className="form-section">
          <div className="form-section-title">Transferência</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Leito liberado p/ outro hospital</label>
              <SimNao valor={passagem.leito_liberado_outro_hospital} onChange={(v) => set('leito_liberado_outro_hospital', v)} />
            </div>
            {passagem.leito_liberado_outro_hospital === true && (
              <>
                <div className="form-field span-2">
                  <label>Qual hospital</label>
                  <input type="text" value={passagem.leito_liberado_hospital ?? ''} onChange={(e) => set('leito_liberado_hospital', e.target.value)} />
                </div>
                <div className="form-field span-3">
                  <label>Tipo de transporte</label>
                  <input
                    type="text"
                    placeholder="ex: SAMU, ambulância própria, veículo particular"
                    value={passagem.leito_liberado_transporte ?? ''}
                    onChange={(e) => set('leito_liberado_transporte', e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="form-field">
              <label>Alta Sala Vermelha</label>
              <SimNao valor={passagem.alta_sala_vermelha} onChange={(v) => set('alta_sala_vermelha', v)} />
            </div>
            {passagem.alta_sala_vermelha === true && (
              <>
                <div className="form-field">
                  <label>Data da alta</label>
                  <input type="date" value={passagem.alta_sala_vermelha_data ?? ''} onChange={(e) => set('alta_sala_vermelha_data', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Horário da alta</label>
                  <input type="time" value={passagem.alta_sala_vermelha_hora ?? ''} onChange={(e) => set('alta_sala_vermelha_hora', e.target.value)} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* PENDÊNCIAS */}
        <div className="form-section">
          <div className="form-section-title">Observações/Pendência para o próximo plantão</div>
          <div className="form-field">
            <textarea value={passagem.pendencias ?? ''} onChange={(e) => set('pendencias', e.target.value)} />
          </div>
        </div>

        <div className="form-footer">
          <button className="btn-fechar" onClick={fecharComConfirmacao}>Fechar</button>
          <button className="btn-salvar" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar passagem'}
          </button>
        </div>
        {salvo && <div className="save-flag">Salvo com sucesso.</div>}
        {camposFaltando.length > 0 && (
          <div className="error-box" style={{ marginTop: 10 }}>
            ⚠ Preencha antes de salvar: <b>{camposFaltando.join(', ')}</b>
          </div>
        )}
        {erroSalvar && <div className="error-box" style={{ marginTop: 10 }}>{erroSalvar}</div>}
      </div>

      {modalDesfecho && (
        <ModalDesfecho
          nomePaciente={identificacao.nome}
          numeroLeito={leito.numero}
          processando={processando}
          onCancelar={() => setModalDesfecho(false)}
          onConfirmar={(tipo, detalhe, dadosObito) => registrarDesfecho(tipo, detalhe, dadosObito)}
        />
      )}

      {modalExcluir && (
        <ConfirmModal
          titulo={`Excluir ${identificacao.nome}?`}
          mensagem="Isso apaga o cadastro e todo o histórico de passagens dele, definitivamente. Use só em caso de erro/duplicidade — não é o mesmo que registrar um desfecho."
          confirmarTexto="Excluir definitivamente"
          perigo
          onConfirmar={confirmarExclusao}
          onCancelar={() => setModalExcluir(false)}
        />
      )}

      {rascunhoEncontrado && (
        <ConfirmModal
          titulo="Continuar rascunho anterior?"
          mensagem={`Encontramos um rascunho não salvo desta passagem, de ${new Date(rascunhoEncontrado.quando).toLocaleString('pt-BR')} — provavelmente a tela recarregou antes de você conseguir salvar. Deseja continuar de onde parou?`}
          confirmarTexto="Continuar rascunho"
          cancelarTexto="Descartar"
          onConfirmar={continuarRascunho}
          onCancelar={descartarRascunho}
        />
      )}

      {confirmandoFechar && (
        <ConfirmModal
          titulo="Fechar sem salvar?"
          mensagem="Você tem alterações não salvas nesta passagem. O rascunho será descartado."
          confirmarTexto="Fechar mesmo assim"
          cancelarTexto="Continuar editando"
          perigo
          onConfirmar={confirmarFecharDescartando}
          onCancelar={() => setConfirmandoFechar(false)}
        />
      )}
    </>
  )

  if (embedded) return conteudo
  return <div className="form-overlay">{conteudo}</div>
}

// Resumo somente-leitura do Prontuário Médico (Exames/Sorologias/Hemoterapia/
// Regulação) — resolve o atendimento real (ponte da Seção 0, se o paciente
// ainda não tiver um) e carrega uma vez; não edita nada aqui, só mostra.
function ResumoProntuario({ paciente }) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      setErro(false)
      let atendimentoId = paciente.pep_nativo ? paciente.id : null
      if (!atendimentoId) {
        const { atendimentoId: id, error } = await obterOuCriarAtendimentoParaPaciente(paciente.id)
        if (error) {
          if (!cancelado) { setErro(true); setCarregando(false) }
          console.error('Erro ao resolver atendimento pro resumo do prontuário:', error)
          return
        }
        atendimentoId = id
      }
      const [exames, sorologias, hemoterapia, regulacao] = await Promise.all([
        listarExames(atendimentoId),
        listarSorologias(atendimentoId),
        listarHemoterapia(atendimentoId),
        buscarAberturaRegulacao(atendimentoId),
      ])
      if (!cancelado) {
        setDados({ exames, sorologias, hemoterapia, regulacao })
        setCarregando(false)
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [paciente.id])

  const vazio = dados && dados.exames.length === 0 && dados.sorologias.length === 0
    && dados.hemoterapia.length === 0 && !dados.regulacao?.regulacao_flag

  return (
    <div className="form-section">
      <div className="form-section-title">Resumo do Prontuário (Exames / Sorologias / Hemoterapia / Regulação)</div>
      <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Somente leitura — pra editar, abra o pilar "Prontuário Médico" no Espaço do Paciente.
      </p>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Carregando...</p>
      ) : erro ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Não foi possível carregar o resumo do prontuário.</p>
      ) : vazio ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nada registrado ainda no Prontuário.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          {dados.exames.map((e) => (
            <div key={e.id}>Exame: {e.nome}{e.local ? ` · ${e.local}` : ''} · {ROTULO_STATUS_EXAME[e.status] || e.status}</div>
          ))}
          {dados.sorologias.map((s) => (
            <div key={s.id}>Sorologia: {s.agravo} · {ROTULO_STATUS_SOROLOGIA[s.status] || s.status}</div>
          ))}
          {dados.hemoterapia.map((h) => (
            <div key={h.id}>Hemoterapia: {h.tipo}{h.quantidade ? ` · ${h.quantidade}` : ''} · {h.transfundido_em ? 'transfundido' : 'aguardando transfusão'}</div>
          ))}
          {dados.regulacao?.regulacao_flag && (
            <div>Regulação: aberta · {dados.regulacao.regulacao_tipo}</div>
          )}
        </div>
      )}
    </div>
  )
}

const ROTULO_STATUS_EXAME = { a_realizar: 'A realizar', aguardando_laudo: 'Aguardando laudo', resultado_disponivel: 'Resultado disponível' }
const ROTULO_STATUS_SOROLOGIA = { coleta_pendente: 'Coleta pendente', aguardando_resultado: 'Aguardando resultado', resultado_disponivel: 'Resultado disponível' }

function SimNao({ valor, onChange }) {
  return (
    <div className="toggle-group">
      <button type="button" className={`toggle-btn ${valor === false ? 'on' : ''}`} onClick={() => onChange(valor === false ? null : false)}>Não</button>
      <button type="button" className={`toggle-btn ${valor === true ? 'on' : ''}`} onClick={() => onChange(valor === true ? null : true)}>Sim</button>
    </div>
  )
}

const TIPOS_DESFECHO = [
  { tipo: 'Alta', legenda: 'Alta médica normal' },
  { tipo: 'Transferência', legenda: 'Encaminhado para outra unidade/hospital' },
  { tipo: 'Evasão', legenda: 'Saiu sem alta médica' },
  { tipo: 'Óbito', legenda: 'Foi a óbito' },
]

function ModalDesfecho({ nomePaciente, numeroLeito, processando, onCancelar, onConfirmar }) {
  const [tipo, setTipo] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const [dataHoraObito, setDataHoraObito] = useState('')
  const [causaMortis, setCausaMortis] = useState('')
  const [medicoAtestante, setMedicoAtestante] = useState('')
  const [comunicadoFamilia, setComunicadoFamilia] = useState('')

  function confirmar() {
    const dadosObito = tipo === 'Óbito'
      ? { data_hora_obito: dataHoraObito || null, causa_mortis: causaMortis || null, medico_atestante: medicoAtestante || null, comunicado_familia: comunicadoFamilia || null }
      : null
    onConfirmar(tipo, detalhe, dadosObito)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Desfecho de {nomePaciente}</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: -10, marginBottom: 16 }}>
          O leito {numeroLeito} fica liberado. Isso fica registrado no histórico dos próximos 7 dias.
        </p>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>O que aconteceu?</label>
          <div className="chip-group">
            {TIPOS_DESFECHO.map((op) => (
              <button
                type="button"
                key={op.tipo}
                className={`chip ${tipo === op.tipo ? 'on' : ''}`}
                onClick={() => setTipo(tipo === op.tipo ? '' : op.tipo)}
              >
                {op.tipo}
              </button>
            ))}
          </div>
          {tipo && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>{TIPOS_DESFECHO.find((o) => o.tipo === tipo)?.legenda}</p>}
        </div>

        {(tipo === 'Transferência' || tipo === 'Óbito') && (
          <div className="field" style={{ marginBottom: tipo === 'Óbito' ? 14 : 0 }}>
            <label>{tipo === 'Transferência' ? 'Para qual unidade/hospital' : 'Observação (opcional)'}</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
            />
          </div>
        )}

        {tipo === 'Óbito' && (
          <>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Data/hora do óbito</label>
              <input
                type="datetime-local"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={dataHoraObito}
                onChange={(e) => setDataHoraObito(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Causa mortis</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={causaMortis}
                onChange={(e) => setCausaMortis(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Médico que atestou</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={medicoAtestante}
                onChange={(e) => setMedicoAtestante(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Comunicado à família</label>
              <div className="chip-group">
                {['Sim', 'Não'].map((op) => (
                  <button
                    type="button"
                    key={op}
                    className={`chip ${comunicadoFamilia === op ? 'on' : ''}`}
                    onClick={() => setComunicadoFamilia(comunicadoFamilia === op ? '' : op)}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button
            className="modal-btn-primary"
            disabled={!tipo || processando}
            onClick={confirmar}
          >
            {processando ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
