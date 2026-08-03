import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ConfirmModal from './ConfirmModal'
import './PassagemForm.css'

const DISPOSITIVOS_OPCOES = ['SVD', 'SNE', 'Dreno', 'O2']
const NIVEIS_CONSCIENCIA = ['Alerta', 'Confuso', 'Sonolento', 'Inconsciente']
const EXAME_STATUS_OPCOES = ['A realizar', 'Aguardando laudo', 'Resultado disponível']
const SOROLOGIA_STATUS_OPCOES = ['Coleta pendente', 'Aguardando resultado', 'Resultado disponível']

const PASSAGEM_VAZIA = {
  curativo_realizado: null,
  avp: null,
  avp_data_insercao: '',
  nivel_consciencia: '',
  dispositivos: [],
  dispositivos_detalhe: '',
  acompanhante: null,

  exame_nome: '',
  exame_status: '',
  exame_a_realizar_data: '',
  exame_a_realizar_hora: '',
  exame_a_realizar_local: '',
  preparo_exame: '',
  exame_resultado: '',

  sorologias: '',
  sorologia_status: '',
  sorologia_data_coleta: '',

  hemo_tipo: '',
  hemo_solicitado: null,
  hemo_transfundido: null,
  hemo_data_transfusao: '',
  hemo_quantidade: '',

  leito_liberado_outro_hospital: null,
  leito_liberado_hospital: '',
  leito_liberado_transporte: '',
  alta_sala_vermelha: null,
  alta_sala_vermelha_data: '',
  alta_sala_vermelha_hora: '',

  pendencias: '',
}

export default function PassagemForm({ paciente, leito, setorNome, plantaoId, enfermeiroId, onFechar, onSalvo, onRealocar }) {
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
  const [erroSalvar, setErroSalvar] = useState('')
  const [origemCopia, setOrigemCopia] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)

    // 1. Já existe passagem preenchida NESTE plantão para esse paciente?
    const { data: atual } = await supabase
      .from('passagens')
      .select('*')
      .eq('plantao_id', plantaoId)
      .eq('paciente_id', paciente.id)
      .maybeSingle()

    if (atual) {
      setPassagem({ ...PASSAGEM_VAZIA, ...atual })
      setCarregando(false)
      return
    }

    // 2. Senão, copia automaticamente da última passagem desse paciente (outro plantão)
    const { data: anterior } = await supabase
      .from('passagens')
      .select('*')
      .eq('paciente_id', paciente.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (anterior) {
      setPassagem({ ...PASSAGEM_VAZIA, ...anterior })
      setOrigemCopia(anterior.criado_em)
    }
    setCarregando(false)
  }

  async function copiarNovamente() {
    const { data: anterior } = await supabase
      .from('passagens')
      .select('*')
      .eq('paciente_id', paciente.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (anterior) {
      setPassagem({ ...PASSAGEM_VAZIA, ...anterior })
      setOrigemCopia(anterior.criado_em)
    }
  }

  function set(campo, valor) {
    setPassagem((prev) => ({ ...prev, [campo]: valor }))
    setSalvo(false)
  }

  function toggleDispositivo(d) {
    setPassagem((prev) => {
      const atuais = prev.dispositivos ?? []
      return {
        ...prev,
        dispositivos: atuais.includes(d) ? atuais.filter((x) => x !== d) : [...atuais, d],
      }
    })
    setSalvo(false)
  }

  async function salvar() {
    setSalvando(true)
    setErroSalvar('')

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
        status_internacao: statusTravado ? 'Internado' : identificacao.status_internacao,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paciente.id)

    const payload = {
      plantao_id: plantaoId,
      paciente_id: paciente.id,
      leito_id: leito.id,
      setor_id: leito.setor_id,
      criado_por: enfermeiroId,
      ...passagem,
      avp_data_insercao: passagem.avp_data_insercao || null,
      exame_a_realizar_data: passagem.exame_a_realizar_data || null,
      exame_a_realizar_hora: passagem.exame_a_realizar_hora || null,
      hemo_data_transfusao: passagem.hemo_data_transfusao || null,
      sorologia_data_coleta: passagem.sorologia_data_coleta || null,
      alta_sala_vermelha_data: passagem.alta_sala_vermelha_data || null,
      alta_sala_vermelha_hora: passagem.alta_sala_vermelha_hora || null,
      exame_status: passagem.exame_status || null,
      sorologia_status: passagem.sorologia_status || null,
    }

    const { error } = await supabase
      .from('passagens')
      .upsert(payload, { onConflict: 'plantao_id,paciente_id' })

    setSalvando(false)
    if (!error) {
      setSalvo(true)
      onSalvo?.()
      onFechar?.()
    } else {
      setErroSalvar('Não foi possível salvar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao salvar passagem:', error)
    }
  }

  async function registrarDesfecho(tipo, detalhe) {
    setProcessando(true)
    const { error } = await supabase
      .from('pacientes')
      .update({
        status: 'alta',
        tipo_desfecho: tipo,
        desfecho_detalhe: detalhe || null,
        data_desfecho: new Date().toISOString(),
      })
      .eq('id', paciente.id)
    setProcessando(false)
    if (!error) {
      onSalvo?.()
      onFechar?.()
    }
  }

  async function excluirPaciente() {
    setModalExcluir(true)
  }

  async function confirmarExclusao() {
    setModalExcluir(false)
    setProcessando(true)
    const { error } = await supabase.from('pacientes').delete().eq('id', paciente.id)
    setProcessando(false)
    if (!error) {
      onSalvo?.()
      onFechar?.()
    }
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

  return (
    <div className="form-overlay">
      <div className="form-panel" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <span className="form-leito-tag">Leito {leito.numero}</span>
          <button className="form-header-close" onClick={onFechar}>×</button>
        </div>

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
              <input type="text" value={identificacao.nome} onChange={(e) => setIdentificacao((p) => ({ ...p, nome: e.target.value }))} />
            </div>
            <div className="form-field span-2">
              <label>Diagnóstico</label>
              <input type="text" value={identificacao.diagnostico} onChange={(e) => setIdentificacao((p) => ({ ...p, diagnostico: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Idade</label>
              <input type="number" value={identificacao.idade} onChange={(e) => setIdentificacao((p) => ({ ...p, idade: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Sexo</label>
              <select value={identificacao.sexo} onChange={(e) => setIdentificacao((p) => ({ ...p, sexo: e.target.value }))}>
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
                    onClick={() => setIdentificacao((p) => ({ ...p, status_internacao: 'Em observação' }))}
                  >
                    Em observação
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${identificacao.status_internacao === 'Internado' ? 'on' : ''}`}
                    onClick={() => setIdentificacao((p) => ({ ...p, status_internacao: 'Internado' }))}
                  >
                    Internado
                  </button>
                </div>
              )}
            </div>
            <div className="form-field span-2">
              <label>Data de admissão</label>
              <input type="date" value={identificacao.data_admissao} onChange={(e) => setIdentificacao((p) => ({ ...p, data_admissao: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Alergias</label>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn ${identificacao.alergias === false ? 'on' : ''}`} onClick={() => setIdentificacao((p) => ({ ...p, alergias: false }))}>Não</button>
                <button type="button" className={`toggle-btn ${identificacao.alergias === true ? 'on danger' : ''}`} onClick={() => setIdentificacao((p) => ({ ...p, alergias: true }))}>Sim</button>
              </div>
            </div>
            {identificacao.alergias && (
              <div className="form-field span-3">
                <label>Quais alergias</label>
                <input type="text" value={identificacao.alergias_obs} onChange={(e) => setIdentificacao((p) => ({ ...p, alergias_obs: e.target.value }))} />
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
              <label>AVP</label>
              <SimNao valor={passagem.avp} onChange={(v) => set('avp', v)} />
            </div>
            {passagem.avp && (
              <div className="form-field span-2">
                <label>Data de inserção do AVP</label>
                <input type="date" value={passagem.avp_data_insercao ?? ''} onChange={(e) => set('avp_data_insercao', e.target.value)} />
              </div>
            )}
            <div className="form-field">
              <label>Nível de consciência</label>
              <select value={passagem.nivel_consciencia ?? ''} onChange={(e) => set('nivel_consciencia', e.target.value)}>
                <option value="">—</option>
                {NIVEIS_CONSCIENCIA.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Acompanhante presente</label>
              <SimNao valor={passagem.acompanhante} onChange={(v) => set('acompanhante', v)} />
            </div>
            <div className="form-field span-3">
              <label>Dispositivos invasivos (além do AVP)</label>
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
            {passagem.dispositivos?.length > 0 && (
              <div className="form-field span-3">
                <label>Detalhe do dispositivo (nº, tamanho)</label>
                <input
                  type="text"
                  placeholder="ex: SVD Nº16, TOT 7,5"
                  value={passagem.dispositivos_detalhe ?? ''}
                  onChange={(e) => set('dispositivos_detalhe', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* EXAMES */}
        <div className="form-section">
          <div className="form-section-title">Exames</div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label>Qual exame</label>
              <input
                type="text"
                placeholder="ex: USG abdominal total"
                value={passagem.exame_nome ?? ''}
                onChange={(e) => set('exame_nome', e.target.value)}
              />
            </div>
            <div className="form-field span-3">
              <label>Situação do exame</label>
              <div className="chip-group">
                {EXAME_STATUS_OPCOES.map((op) => (
                  <button
                    type="button"
                    key={op}
                    className={`chip ${passagem.exame_status === op ? 'on' : ''}`}
                    onClick={() => set('exame_status', passagem.exame_status === op ? '' : op)}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {passagem.exame_status === 'A realizar' && (
              <>
                <div className="form-field">
                  <label>Data agendada</label>
                  <input type="date" value={passagem.exame_a_realizar_data ?? ''} onChange={(e) => set('exame_a_realizar_data', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Hora</label>
                  <input type="time" value={passagem.exame_a_realizar_hora ?? ''} onChange={(e) => set('exame_a_realizar_hora', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Local</label>
                  <input type="text" value={passagem.exame_a_realizar_local ?? ''} onChange={(e) => set('exame_a_realizar_local', e.target.value)} />
                </div>
                <div className="form-field span-3">
                  <label>Preparo específico</label>
                  <input
                    type="text"
                    placeholder="ex: jejum 8h, contraste, suspender medicação X"
                    value={passagem.preparo_exame ?? ''}
                    onChange={(e) => set('preparo_exame', e.target.value)}
                  />
                </div>
              </>
            )}

            {(passagem.exame_status === 'Aguardando laudo' || passagem.exame_status === 'Resultado disponível') && (
              <div className="form-field span-3">
                <label>{passagem.exame_status === 'Resultado disponível' ? 'Resultado / laudo' : 'Observação sobre o laudo'}</label>
                <input
                  type="text"
                  placeholder={passagem.exame_status === 'Resultado disponível' ? 'ex: sem alterações, aguardando avaliação médica' : 'ex: realizado em 30/07, aguardando laudo'}
                  value={passagem.exame_resultado ?? ''}
                  onChange={(e) => set('exame_resultado', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* SOROLOGIA / NOTIFICAÇÃO COMPULSÓRIA */}
        <div className="form-section">
          <div className="form-section-title">Sorologia / Notificação compulsória</div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label>Qual agravo / sorologia</label>
              <input
                type="text"
                placeholder="ex: Malária, Chagas, Ofidismo, SRAG, HIV, HBV, HCV"
                value={passagem.sorologias ?? ''}
                onChange={(e) => set('sorologias', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Data da coleta</label>
              <input type="date" value={passagem.sorologia_data_coleta ?? ''} onChange={(e) => set('sorologia_data_coleta', e.target.value)} />
            </div>
            <div className="form-field span-3">
              <label>Situação</label>
              <div className="chip-group">
                {SOROLOGIA_STATUS_OPCOES.map((op) => (
                  <button
                    type="button"
                    key={op}
                    className={`chip ${passagem.sorologia_status === op ? 'on' : ''}`}
                    onClick={() => set('sorologia_status', passagem.sorologia_status === op ? '' : op)}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HEMOTERAPIA */}
        <div className="form-section">
          <div className="form-section-title">Hemoterapia</div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label>Tipo</label>
              <div className="chip-group">
                {['CH', 'PFC', 'CP', 'Crioprecipitado'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={`chip ${passagem.hemo_tipo === t ? 'on' : ''}`}
                    onClick={() => set('hemo_tipo', passagem.hemo_tipo === t ? '' : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Solicitado</label>
              <SimNao valor={passagem.hemo_solicitado} onChange={(v) => set('hemo_solicitado', v)} />
            </div>
            <div className="form-field">
              <label>Transfundido</label>
              <SimNao valor={passagem.hemo_transfundido} onChange={(v) => set('hemo_transfundido', v)} />
            </div>
            {passagem.hemo_transfundido === true && (
              <div className="form-field">
                <label>Data da transfusão</label>
                <input type="date" value={passagem.hemo_data_transfusao ?? ''} onChange={(e) => set('hemo_data_transfusao', e.target.value)} />
              </div>
            )}
            <div className="form-field span-2">
              <label>Quantidade</label>
              <input type="text" value={passagem.hemo_quantidade ?? ''} onChange={(e) => set('hemo_quantidade', e.target.value)} />
            </div>
          </div>
        </div>

        {/* REGULAÇÃO E TRANSFERÊNCIA */}
        <div className="form-section">
          <div className="form-section-title">Regulação e transferência</div>
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
          <button className="btn-fechar" onClick={onFechar}>Fechar</button>
          <button className="btn-salvar" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar passagem'}
          </button>
        </div>
        {salvo && <div className="save-flag">Salvo com sucesso.</div>}
        {erroSalvar && <div className="error-box" style={{ marginTop: 10 }}>{erroSalvar}</div>}
      </div>

      {modalDesfecho && (
        <ModalDesfecho
          nomePaciente={identificacao.nome}
          numeroLeito={leito.numero}
          processando={processando}
          onCancelar={() => setModalDesfecho(false)}
          onConfirmar={(tipo, detalhe) => registrarDesfecho(tipo, detalhe)}
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
    </div>
  )
}

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
          <div className="field">
            <label>{tipo === 'Transferência' ? 'Para qual unidade/hospital' : 'Observação (opcional)'}</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button
            className="modal-btn-primary"
            disabled={!tipo || processando}
            onClick={() => onConfirmar(tipo, detalhe)}
          >
            {processando ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
