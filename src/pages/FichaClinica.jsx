import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import {
  buscarAdmissao, salvarAdmissao,
  listarSinaisVitais, registrarSinaisVitais,
  listarEvolucoes, registrarEvolucao,
  listarDispositivos, inserirDispositivo, removerDispositivo,
  listarBalancoHidrico, registrarBalancoHidrico,
  listarEscalas, registrarEscala,
  buscarResumoPaciente,
  listarAlergias, registrarAlergia, inativarAlergia,
  listarIsolamentos, registrarIsolamento, encerrarIsolamento,
} from '../lib/pepClinico'
import './PassagemForm.css'

// Ficha clínica contínua (Fase 2, piloto Observação/Internação) — separada
// da passagem de plantão (que é o resumo de handoff entre turnos). Admissão
// é preenchida uma vez (exame físico por marcação, formulário real da
// unidade); Sinais Vitais acumula em série.

const GRUPOS_EXAME = [
  { chave: 'neurologico', titulo: 'Avaliação neurológica',
    itens: ['Consciente', 'Orientado', 'Vigil', 'Torporoso', 'Letárgico', 'Comatoso', 'Inconsciente', 'Desorientado', 'Obnubilado', 'Confuso', 'Sedado'],
    extras: [{ campo: 'glasgow', rotulo: 'Glasgow', tipo: 'text' }, { campo: 'rass', rotulo: 'RASS', tipo: 'text' }] },
  { chave: 'movimentacao', titulo: 'Movimentação',
    itens: ['Deambula', 'Espasmo muscular', 'Acamado', 'Deambula com auxílio', 'Atrofia muscular', 'Restrito ao leito'],
    extras: [{ campo: 'hemiplegia_lado', rotulo: 'Hemiplegia', tipo: 'lado' }, { campo: 'paresia_lado', rotulo: 'Paresia', tipo: 'lado' }, { campo: 'parestesia_lado', rotulo: 'Parestesia', tipo: 'lado' }] },
  { chave: 'pele', titulo: 'Pele / tecidos / hidratação',
    itens: ['Normocorada', 'Hidratada', 'Escoriação', 'Eritema', 'Hipocorada', 'Desidratada', 'Dermatite', 'Ictérica', 'Hematoma', 'Prurido', 'Cianótica', 'Anasarca', 'Fissura'],
    extras: [{ campo: 'perfusao', rotulo: 'Perfusão', tipo: 'select', opcoes: ['Normal', 'Lentificado'] }, { campo: 'temperatura', rotulo: 'Temperatura', tipo: 'select', opcoes: ['Normotérmica', 'Hipotérmica', 'Hipertérmica'] }] },
  { chave: 'cabeca_pescoco', titulo: 'Cabeça / pescoço',
    itens: ['Aumento das parótidas', 'Pediculose', 'Estase venosa jugular', 'Aumento das gland. tireóideas', 'Seborreia', 'Traqueostomia', 'Sem alteração'],
    extras: [{ campo: 'linfonodos', rotulo: 'Linfonodos', tipo: 'text' }, { campo: 'outros', rotulo: 'Outros', tipo: 'text' }] },
  { chave: 'olhos', titulo: 'Olhos',
    itens: ['Lacrimejamento', 'Equimose', 'Acuidade visual diminuída', 'Blefarohematoma', 'Uso de lentes de contato', 'Sem alteração', 'Secreção', 'Edema de pálpebras'],
    extras: [{ campo: 'outros', rotulo: 'Outros', tipo: 'text' }] },
  { chave: 'pupilas', titulo: 'Pupilas',
    itens: ['Não fotoreagentes', 'Fotoreagentes', 'Miose', 'Midríase', 'Isocóricas', 'Anisocóricas', 'D>E', 'D<E'] },
  { chave: 'ouvido', titulo: 'Ouvido',
    itens: ['Prurido', 'Otorragia', 'Acuidade auditiva diminuída', 'Otorréia', 'Surdez', 'Otalgia', 'Sem alteração', 'Zumbido'] },
  { chave: 'narinas', titulo: 'Narinas',
    itens: ['Coriza', 'Obstrução', 'Epistaxe', 'Sem alteração'],
    extras: [{ campo: 'lesao_septo', rotulo: 'Lesão de septo', tipo: 'select', opcoes: ['Sim', 'Não'] }] },
  { chave: 'boca_faringe', titulo: 'Boca / faringe',
    itens: ['Edema gengival', 'Xerostomia', 'Disfasia', 'Saburra lingual', 'Prótese dentária', 'Disfagia', 'Halitose', 'Hiperemiada', 'Sangramento', 'Sem alteração'],
    extras: [{ campo: 'outros', rotulo: 'Outros', tipo: 'text' }] },
  { chave: 'nutricao', titulo: 'Nutrição',
    itens: ['NPP', 'Aceitação satisfatória', 'Aceitação insatisfatória', 'Dieta zero'],
    extras: [{ campo: 'via_oral_tipo', rotulo: 'Via oral / tipo', tipo: 'text' }, { campo: 'dieta_enteral_tipo', rotulo: 'Dieta enteral / tipo', tipo: 'text' }] },
  { chave: 'tosse', titulo: 'Tosse',
    itens: ['Produtiva', 'Improdutiva'],
    extras: [{ campo: 'expectoracao', rotulo: 'Expectoração', tipo: 'text' }] },
  { chave: 'respiracao', titulo: 'Respiração', itens: ['Eupnéico', 'Dispnéico', 'Taquipnéico', 'Bradipnéico'] },
  { chave: 'modo_ventilatorio', titulo: 'Modo ventilatório',
    itens: ['Ar ambiente', 'VM', 'Cateter nasal tipo óculos'],
    extras: [{ campo: 'venturi_percent', rotulo: 'Máscara de Venturi (%)', tipo: 'text' }] },
  { chave: 'simetria', titulo: 'Simetria', itens: ['Expansibilidade simétrica', 'Expansibilidade assimétrica', 'Expansão bilateral'] },
  { chave: 'ausculta_resp', titulo: 'Ausculta respiratória', itens: ['Murmúrios vesiculares sem anormalidades', 'Murmúrios vesiculares diminuídos', 'Sibilos', 'Roncos', 'Estertores', 'Crepitações'] },
  { chave: 'cv_frequencia', titulo: 'Frequência cardíaca', itens: ['Normocárdico', 'Taquicárdico', 'Bradicárdico'] },
  { chave: 'cv_bulhas', titulo: 'Bulhas', itens: ['Normofonéticas', 'Hipofonéticas'] },
  { chave: 'cv_ritmo', titulo: 'Ritmo', itens: ['Rítmico', 'Arrítmico'] },
  { chave: 'cv_pulso', titulo: 'Pulso', itens: ['Cheio', 'Filiforme'] },
  { chave: 'abdome', titulo: 'Abdome', itens: ['Indolor', 'Doloroso à palpação', 'Incisão cirúrgica', 'Globoso', 'Flácido', 'Distendido', 'Timpânico', 'Colostomia', 'Hepato/esplenomegalia', 'Gastrostomia', 'Ileostomia', 'Jejunostomia'] },
  { chave: 'ruidos_hidroaereos', titulo: 'Ruídos hidroaéreos', itens: ['Presentes', 'Ausentes', 'Diminuídos'] },
  { chave: 'urinario', titulo: 'Sistema urinário', itens: ['Diurese espontânea', 'Fralda descartável', 'SVD', 'Incontinência urinária', 'Anúria', 'Oligúria', 'Disúria', 'Polaciúria', 'Nictúria', 'Hematúria', 'Poliúria', 'Prurido'] },
  { chave: 'genitalia', titulo: 'Genitália',
    itens: ['Ardência', 'Corrimento', 'Presença de lesões', 'Sem alterações'],
    extras: [{ campo: 'outros', rotulo: 'Outros', tipo: 'text' }] },
  { chave: 'evacuacao', titulo: 'Evacuação',
    itens: ['Presente', 'Ausente'],
    extras: [{ campo: 'dias', rotulo: 'Ausente há (dias)', tipo: 'text' }] },
  { chave: 'membros_superiores', titulo: 'Membros superiores',
    itens: ['Atrofia', 'Hipotrofia', 'Hipertrofia', 'Amputação', 'Paralisia', 'Plegia', 'Edema'],
    extras: [{ campo: 'outros', rotulo: 'Outros', tipo: 'text' }] },
  { chave: 'membros_inferiores', titulo: 'Membros inferiores',
    itens: ['Atrofia', 'Hipotrofia', 'Hipertrofia', 'Amputação', 'Paralisia', 'Plegia', 'Edema'],
    extras: [{ campo: 'outros', rotulo: 'Outros', tipo: 'text' }] },
]

const DOENCAS_INFANCIA_OPCOES = ['Catapora', 'Caxumba', 'Poliomielite', 'Sarampo']
const DOENCAS_CRONICAS_OPCOES = ['Hipertensão Sistêmica Arterial', 'IRC']

export default function FichaClinica({ atendimento, onFechar }) {
  const { enfermeiro } = useAuth()
  const [aba, setAba] = useState('admissao')

  return (
    <div className="form-overlay">
      <div className="form-panel" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <span className="form-leito-tag">Ficha clínica — {atendimento.nome}</span>
          <button className="form-header-close" onClick={onFechar}>×</button>
        </div>

        <ResumoPaciente atendimento={atendimento} />

        <div className="form-toolbar">
          <button className={aba === 'admissao' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('admissao')}>Admissão</button>
          <button className={aba === 'sinaisVitais' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('sinaisVitais')}>Sinais Vitais</button>
          <button className={aba === 'evolucao' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('evolucao')}>Evolução</button>
          <button className={aba === 'dispositivos' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('dispositivos')}>Dispositivos</button>
          <button className={aba === 'balanco' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('balanco')}>Balanço Hídrico</button>
          <button className={aba === 'escalas' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('escalas')}>Escalas</button>
          <button className={aba === 'alergias' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('alergias')}>Alergias</button>
          <button className={aba === 'isolamento' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('isolamento')}>Isolamento</button>
        </div>

        {aba === 'admissao' && <AbaAdmissao atendimento={atendimento} autorId={enfermeiro?.id} />}
        {aba === 'sinaisVitais' && <AbaSinaisVitais atendimento={atendimento} autorId={enfermeiro?.id} />}
        {aba === 'evolucao' && <AbaEvolucao atendimento={atendimento} autorId={enfermeiro?.id} />}
        {aba === 'dispositivos' && <AbaDispositivos atendimento={atendimento} />}
        {aba === 'balanco' && <AbaBalancoHidrico atendimento={atendimento} autorId={enfermeiro?.id} />}
        {aba === 'escalas' && <AbaEscalas atendimento={atendimento} />}
        {aba === 'alergias' && <AbaAlergias atendimento={atendimento} />}
        {aba === 'isolamento' && <AbaIsolamento atendimento={atendimento} autorId={enfermeiro?.id} />}

        <div className="form-footer">
          <button className="btn-fechar" onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function formatarRelativo(iso) {
  if (!iso) return ''
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR')
}

function riscoClasse(nivel) {
  const n = (nivel || '').toLowerCase()
  if (n.includes('muito alto') || n.includes('risco alto')) return 'danger'
  if (n.includes('moderado') || n.includes('médio')) return 'warn'
  return 'ok'
}

// Painel de status no topo da ficha — mostra o essencial de cada aba num
// relance, antes de entrar em qualquer uma delas (proposta de redesign
// aprovada na conversa).
function ResumoPaciente({ atendimento }) {
  const [resumo, setResumo] = useState(null)

  useEffect(() => {
    let vivo = true
    buscarResumoPaciente(atendimento.atendimento_id, atendimento.pessoa_id).then((r) => { if (vivo) setResumo(r) })
    return () => { vivo = false }
  }, [atendimento.atendimento_id, atendimento.pessoa_id])

  if (!resumo) return null

  const { ultimoSv, escalaPorTipo, dispositivosAtivos, entradasHoje, saidasHoje, alergiasAtivas, isolamentosAtivos } = resumo
  const temEscalas = Object.keys(escalaPorTipo).length > 0
  const temAlgumDado = ultimoSv || temEscalas || dispositivosAtivos.length > 0 || entradasHoje || saidasHoje || alergiasAtivas.length > 0 || isolamentosAtivos.length > 0
  if (!temAlgumDado) return null

  return (
    <div className="resumo-paciente">
      {isolamentosAtivos.length > 0 && (
        <div className="resumo-bloco" style={{ gridColumn: '1 / -1' }}>
          <div className="resumo-bloco-titulo">⚠ Isolamento</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {isolamentosAtivos.map((i) => (
              <span key={i.id} className="resumo-badge warn">
                {i.tipo}{i.patogeno_suspeito ? ` · ${i.patogeno_suspeito}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {alergiasAtivas.length > 0 && (
        <div className="resumo-bloco" style={{ gridColumn: '1 / -1' }}>
          <div className="resumo-bloco-titulo">⚠ Alergias</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {alergiasAtivas.map((a) => (
              <span key={a.id} className="resumo-badge danger">
                {a.substancia}{a.gravidade ? ` · ${a.gravidade}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Sinais vitais</div>
        {ultimoSv ? (
          <>
            <div className="resumo-bloco-valor">
              PA {ultimoSv.pa_sistolica ?? '—'}/{ultimoSv.pa_diastolica ?? '—'} · FC {ultimoSv.fc ?? '—'}<br />
              FR {ultimoSv.fr ?? '—'} · SpO2 {ultimoSv.spo2 ?? '—'}{ultimoSv.temperatura ? ` · ${ultimoSv.temperatura}°C` : ''}
            </div>
            <div className="resumo-bloco-nota">{formatarRelativo(ultimoSv.registrado_em)}</div>
          </>
        ) : <div className="resumo-bloco-vazio">Sem registro</div>}
      </div>

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Escalas</div>
        {temEscalas ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.values(escalaPorTipo).map((e) => (
              <div key={e.tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ textTransform: 'capitalize', fontSize: 11.5 }}>{e.tipo}</span>
                <span className={`resumo-badge ${riscoClasse(e.nivel_risco)}`}>{e.pontuacao} · {e.nivel_risco}</span>
              </div>
            ))}
          </div>
        ) : <div className="resumo-bloco-vazio">Sem avaliação</div>}
      </div>

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Dispositivos ativos</div>
        {dispositivosAtivos.length > 0 ? (
          <div className="resumo-bloco-valor">{dispositivosAtivos.map((d) => d.tipo).join(', ')}</div>
        ) : <div className="resumo-bloco-vazio">Nenhum ativo</div>}
      </div>

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Balanço hídrico · hoje</div>
        <div className="resumo-bloco-valor">Entradas {entradasHoje} mL · Saídas {saidasHoje} mL</div>
        <div className="resumo-bloco-saldo">Saldo {entradasHoje - saidasHoje >= 0 ? '+' : ''}{entradasHoje - saidasHoje} mL</div>
      </div>
    </div>
  )
}

function GrupoExame({ grupo, exame, onToggle, onExtra }) {
  const atual = exame[grupo.chave] ?? {}
  return (
    <div className="form-field span-3" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--c-border-light)' }}>
      <label>{grupo.titulo}</label>
      <div className="chip-group">
        {grupo.itens.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${(atual.itens || []).includes(item) ? 'on' : ''}`}
            onClick={() => onToggle(grupo.chave, item)}
          >
            {item}
          </button>
        ))}
      </div>
      {grupo.extras?.length > 0 && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
          {grupo.extras.map((ex) => (
            <div key={ex.campo} style={{ minWidth: 130 }}>
              <label style={{ fontSize: 9.5 }}>{ex.rotulo}</label>
              {ex.tipo === 'text' && (
                <input type="text" value={atual[ex.campo] || ''} onChange={(e) => onExtra(grupo.chave, ex.campo, e.target.value)} />
              )}
              {ex.tipo === 'select' && (
                <select value={atual[ex.campo] || ''} onChange={(e) => onExtra(grupo.chave, ex.campo, e.target.value)}>
                  <option value="">—</option>
                  {ex.opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {ex.tipo === 'lado' && (
                <div className="toggle-group" style={{ maxWidth: 110 }}>
                  <button type="button" className={`toggle-btn ${atual[ex.campo] === 'D' ? 'on' : ''}`} onClick={() => onExtra(grupo.chave, ex.campo, atual[ex.campo] === 'D' ? '' : 'D')}>D</button>
                  <button type="button" className={`toggle-btn ${atual[ex.campo] === 'E' ? 'on' : ''}`} onClick={() => onExtra(grupo.chave, ex.campo, atual[ex.campo] === 'E' ? '' : 'E')}>E</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CABECALHO_VAZIO = {
  alergia_medicamentosa: '', alergia_alimentar: '', cidade_reside: '', acompanhante: '',
  medicamentos_controlados: null, medicamentos_controlados_quais: '', hipotese_diagnostica: '',
  tabagista: null, tabagista_tempo: '', etilista: null, etilista_tempo: '',
  observacoes: '',
}

function AbaAdmissao({ atendimento, autorId }) {
  const [carregando, setCarregando] = useState(true)
  const [jaSalvo, setJaSalvo] = useState(false)
  const [cab, setCab] = useState(CABECALHO_VAZIO)
  const [exame, setExame] = useState({})
  const [doencasInfancia, setDoencasInfancia] = useState({ itens: [], outros: '' })
  const [doencasCronicas, setDoencasCronicas] = useState({ itens: [], diabetes_tipo: '', outros: '' })
  const [integridade, setIntegridade] = useState({ lesao_cutanea: null, tipo: '', local_grau: '', desenvolvida_em: '' })
  const [svAdmissao, setSvAdmissao] = useState({ pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', spo2: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const a = await buscarAdmissao(atendimento.atendimento_id)
    if (a) {
      setJaSalvo(true)
      setCab({
        alergia_medicamentosa: a.alergia_medicamentosa || '', alergia_alimentar: a.alergia_alimentar || '',
        cidade_reside: a.cidade_reside || '', acompanhante: a.acompanhante || '',
        medicamentos_controlados: a.medicamentos_controlados, medicamentos_controlados_quais: a.medicamentos_controlados_quais || '',
        hipotese_diagnostica: a.hipotese_diagnostica || '',
        tabagista: a.tabagista, tabagista_tempo: a.tabagista_tempo || '',
        etilista: a.etilista, etilista_tempo: a.etilista_tempo || '',
        observacoes: a.observacoes || '',
      })
      setExame(a.exame_fisico || {})
      if (a.doencas_infancia && !Array.isArray(a.doencas_infancia)) setDoencasInfancia(a.doencas_infancia)
      if (a.doencas_cronicas && !Array.isArray(a.doencas_cronicas)) setDoencasCronicas(a.doencas_cronicas)
      if (a.integridade_fisica) setIntegridade((prev) => ({ ...prev, ...a.integridade_fisica }))
    }
    setCarregando(false)
  }

  function setC(campo, valor) { setCab((prev) => ({ ...prev, [campo]: valor })) }
  function toggleExame(grupoChave, item) {
    setExame((prev) => {
      const atuais = prev[grupoChave]?.itens ?? []
      const itens = atuais.includes(item) ? atuais.filter((i) => i !== item) : [...atuais, item]
      return { ...prev, [grupoChave]: { ...prev[grupoChave], itens } }
    })
  }
  function extraExame(grupoChave, campo, valor) {
    setExame((prev) => ({ ...prev, [grupoChave]: { ...prev[grupoChave], [campo]: valor } }))
  }
  function toggleDoenca(lista, setLista, item) {
    setLista((prev) => ({ ...prev, itens: prev.itens.includes(item) ? prev.itens.filter((i) => i !== item) : [...prev.itens, item] }))
  }

  async function salvar() {
    setErro('')
    setSalvando(true)
    const { error } = await salvarAdmissao({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      autorId,
      dados: { ...cab, exame_fisico: exame, doencas_infancia: doencasInfancia, doencas_cronicas: doencasCronicas, integridade_fisica: integridade },
    })
    if (error) {
      setSalvando(false)
      setErro('Não foi possível salvar. Tente de novo.')
      console.error(error)
      return
    }
    // Sinais vitais da admissão viram o primeiro registro da série — sem
    // duplicar campo, só se algo foi preenchido aqui.
    const temSv = Object.values(svAdmissao).some((v) => v !== '')
    if (temSv) {
      await registrarSinaisVitais({ atendimentoId: atendimento.atendimento_id, registradoPor: autorId, dados: svAdmissao })
    }
    setSalvando(false)
    setJaSalvo(true)
    setSucesso(true)
  }

  if (carregando) return <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>

  return (
    <div className="form-section">
      {jaSalvo && (
        <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--c-border)' }}>
          Admissão já registrada — pode ajustar e salvar de novo.
        </p>
      )}

      <div className="form-section-title">Identificação complementar</div>
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <div className="form-field"><label>Alergia medicamentosa</label><input type="text" value={cab.alergia_medicamentosa} onChange={(e) => setC('alergia_medicamentosa', e.target.value)} /></div>
        <div className="form-field"><label>Alergia alimentar</label><input type="text" value={cab.alergia_alimentar} onChange={(e) => setC('alergia_alimentar', e.target.value)} /></div>
        <div className="form-field"><label>Cidade onde reside</label><input type="text" value={cab.cidade_reside} onChange={(e) => setC('cidade_reside', e.target.value)} /></div>
        <div className="form-field"><label>Acompanhante</label><input type="text" value={cab.acompanhante} onChange={(e) => setC('acompanhante', e.target.value)} /></div>
        <div className="form-field">
          <label>Medicamentos controlados</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${cab.medicamentos_controlados === false ? 'on' : ''}`} onClick={() => setC('medicamentos_controlados', false)}>Não</button>
            <button type="button" className={`toggle-btn ${cab.medicamentos_controlados === true ? 'on' : ''}`} onClick={() => setC('medicamentos_controlados', true)}>Sim</button>
          </div>
        </div>
        {cab.medicamentos_controlados && (
          <div className="form-field"><label>Quais</label><input type="text" value={cab.medicamentos_controlados_quais} onChange={(e) => setC('medicamentos_controlados_quais', e.target.value)} /></div>
        )}
        <div className="form-field span-3"><label>Hipótese diagnóstica</label><input type="text" value={cab.hipotese_diagnostica} onChange={(e) => setC('hipotese_diagnostica', e.target.value)} /></div>
      </div>

      <div className="form-section-title">Sinais vitais da admissão</div>
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <div className="form-field"><label>PA sistólica</label><input type="number" value={svAdmissao.pa_sistolica} onChange={(e) => setSvAdmissao((p) => ({ ...p, pa_sistolica: e.target.value }))} /></div>
        <div className="form-field"><label>PA diastólica</label><input type="number" value={svAdmissao.pa_diastolica} onChange={(e) => setSvAdmissao((p) => ({ ...p, pa_diastolica: e.target.value }))} /></div>
        <div className="form-field"><label>Pulso</label><input type="number" value={svAdmissao.fc} onChange={(e) => setSvAdmissao((p) => ({ ...p, fc: e.target.value }))} /></div>
        <div className="form-field"><label>FR</label><input type="number" value={svAdmissao.fr} onChange={(e) => setSvAdmissao((p) => ({ ...p, fr: e.target.value }))} /></div>
        <div className="form-field"><label>SpO2</label><input type="number" value={svAdmissao.spo2} onChange={(e) => setSvAdmissao((p) => ({ ...p, spo2: e.target.value }))} /></div>
      </div>

      <div className="form-section-title">Exame físico</div>
      <div className="form-grid">
        {GRUPOS_EXAME.map((g) => (
          <GrupoExame key={g.chave} grupo={g} exame={exame} onToggle={toggleExame} onExtra={extraExame} />
        ))}
      </div>

      <div className="form-section-title" style={{ marginTop: 8 }}>Integridade física</div>
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <div className="form-field">
          <label>Presença de lesões cutâneas</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${integridade.lesao_cutanea === false ? 'on' : ''}`} onClick={() => setIntegridade((p) => ({ ...p, lesao_cutanea: false }))}>Não</button>
            <button type="button" className={`toggle-btn ${integridade.lesao_cutanea === true ? 'on' : ''}`} onClick={() => setIntegridade((p) => ({ ...p, lesao_cutanea: true }))}>Sim</button>
          </div>
        </div>
        {integridade.lesao_cutanea && (
          <>
            <div className="form-field">
              <label>Tipo</label>
              <div className="chip-group">
                {['Ferida operatória', 'Lesão por pressão'].map((t) => (
                  <button key={t} type="button" className={`chip ${integridade.tipo === t ? 'on' : ''}`} onClick={() => setIntegridade((p) => ({ ...p, tipo: p.tipo === t ? '' : t }))}>{t}</button>
                ))}
              </div>
            </div>
            <div className="form-field"><label>Região e grau</label><input type="text" value={integridade.local_grau} onChange={(e) => setIntegridade((p) => ({ ...p, local_grau: e.target.value }))} /></div>
          </>
        )}
        <div className="form-field span-3">
          <label>Desenvolvida em</label>
          <div className="chip-group">
            {['Casa', 'Enfermaria de origem', 'UTI Adulto/Hospital'].map((t) => (
              <button key={t} type="button" className={`chip ${integridade.desenvolvida_em === t ? 'on' : ''}`} onClick={() => setIntegridade((p) => ({ ...p, desenvolvida_em: p.desenvolvida_em === t ? '' : t }))}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section-title">Antecedentes</div>
      <div className="form-grid" style={{ marginBottom: 20 }}>
        <div className="form-field span-2">
          <label>Doenças da infância</label>
          <div className="chip-group">
            {DOENCAS_INFANCIA_OPCOES.map((d) => (
              <button key={d} type="button" className={`chip ${doencasInfancia.itens.includes(d) ? 'on' : ''}`} onClick={() => toggleDoenca(doencasInfancia, setDoencasInfancia, d)}>{d}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Outras (infância)</label><input type="text" value={doencasInfancia.outros} onChange={(e) => setDoencasInfancia((p) => ({ ...p, outros: e.target.value }))} /></div>

        <div className="form-field span-2">
          <label>Doenças crônicas</label>
          <div className="chip-group">
            {DOENCAS_CRONICAS_OPCOES.map((d) => (
              <button key={d} type="button" className={`chip ${doencasCronicas.itens.includes(d) ? 'on' : ''}`} onClick={() => toggleDoenca(doencasCronicas, setDoencasCronicas, d)}>{d}</button>
            ))}
            <button type="button" className={`chip ${doencasCronicas.itens.includes('Diabetes') ? 'on' : ''}`} onClick={() => toggleDoenca(doencasCronicas, setDoencasCronicas, 'Diabetes')}>Diabetes</button>
          </div>
        </div>
        {doencasCronicas.itens.includes('Diabetes') && (
          <div className="form-field"><label>Diabetes / tipo</label><input type="text" value={doencasCronicas.diabetes_tipo} onChange={(e) => setDoencasCronicas((p) => ({ ...p, diabetes_tipo: e.target.value }))} /></div>
        )}
        <div className="form-field"><label>Outras (crônicas)</label><input type="text" value={doencasCronicas.outros} onChange={(e) => setDoencasCronicas((p) => ({ ...p, outros: e.target.value }))} /></div>

        <div className="form-field">
          <label>Tabagista</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${cab.tabagista === false ? 'on' : ''}`} onClick={() => setC('tabagista', false)}>Não</button>
            <button type="button" className={`toggle-btn ${cab.tabagista === true ? 'on' : ''}`} onClick={() => setC('tabagista', true)}>Sim</button>
          </div>
        </div>
        {cab.tabagista && <div className="form-field"><label>Há quanto tempo</label><input type="text" value={cab.tabagista_tempo} onChange={(e) => setC('tabagista_tempo', e.target.value)} /></div>}
        <div className="form-field">
          <label>Etilista</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${cab.etilista === false ? 'on' : ''}`} onClick={() => setC('etilista', false)}>Não</button>
            <button type="button" className={`toggle-btn ${cab.etilista === true ? 'on' : ''}`} onClick={() => setC('etilista', true)}>Sim</button>
          </div>
        </div>
        {cab.etilista && <div className="form-field"><label>Há quanto tempo</label><input type="text" value={cab.etilista_tempo} onChange={(e) => setC('etilista_tempo', e.target.value)} /></div>}
      </div>

      <div className="form-section-title">Observações</div>
      <div className="form-field" style={{ marginBottom: 16 }}>
        <textarea value={cab.observacoes} onChange={(e) => setC('observacoes', e.target.value)} />
      </div>

      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      {sucesso && <p style={{ fontSize: 12, color: 'var(--c-primary)', marginBottom: 14 }}>Admissão salva.</p>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar admissão'}
      </button>
    </div>
  )
}

const SV_VAZIO = { pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', spo2: '', temperatura: '', glicemia: '', dor_escala: '' }

function AbaSinaisVitais({ atendimento, autorId }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(SV_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarSinaisVitais(atendimento.atendimento_id))
    setCarregando(false)
  }

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function registrar() {
    setErro('')
    setSalvando(true)
    const { error } = await registrarSinaisVitais({ atendimentoId: atendimento.atendimento_id, registradoPor: autorId, dados })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setDados(SV_VAZIO)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Novo registro</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field"><label>PA sistólica</label><input type="number" value={dados.pa_sistolica} onChange={(e) => set('pa_sistolica', e.target.value)} /></div>
        <div className="form-field"><label>PA diastólica</label><input type="number" value={dados.pa_diastolica} onChange={(e) => set('pa_diastolica', e.target.value)} /></div>
        <div className="form-field"><label>FC</label><input type="number" value={dados.fc} onChange={(e) => set('fc', e.target.value)} /></div>
        <div className="form-field"><label>FR</label><input type="number" value={dados.fr} onChange={(e) => set('fr', e.target.value)} /></div>
        <div className="form-field"><label>SpO2</label><input type="number" value={dados.spo2} onChange={(e) => set('spo2', e.target.value)} /></div>
        <div className="form-field"><label>Temperatura</label><input type="number" step="0.1" value={dados.temperatura} onChange={(e) => set('temperatura', e.target.value)} /></div>
        <div className="form-field"><label>Glicemia</label><input type="number" value={dados.glicemia} onChange={(e) => set('glicemia', e.target.value)} /></div>
        <div className="form-field"><label>Dor (0-10)</label><input type="number" min="0" max="10" value={dados.dor_escala} onChange={(e) => set('dor_escala', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando}>
        {salvando ? 'Registrando...' : 'Registrar'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum registro ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr>
                <th>Data/hora</th><th>PA</th><th>FC</th><th>FR</th><th>SpO2</th><th>Temp.</th><th>Glicemia</th><th>Dor</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((sv) => (
                <tr key={sv.id}>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(sv.registrado_em).toLocaleString('pt-BR')}</td>
                  <td>{sv.pa_sistolica ?? '—'}/{sv.pa_diastolica ?? '—'}</td>
                  <td>{sv.fc ?? '—'}</td>
                  <td>{sv.fr ?? '—'}</td>
                  <td>{sv.spo2 ?? '—'}</td>
                  <td>{sv.temperatura ? `${sv.temperatura}°C` : '—'}</td>
                  <td>{sv.glicemia ?? '—'}</td>
                  <td>{sv.dor_escala ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AbaEvolucao({ atendimento, autorId }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarEvolucoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!texto.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEvolucao({ atendimentoId: atendimento.atendimento_id, autorId, texto: texto.trim() })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setTexto('')
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova evolução</div>
      <div className="form-field" style={{ marginBottom: 14 }}>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} placeholder="Descreva a evolução do paciente..." />
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !texto.trim()}>
        {salvando ? 'Registrando...' : 'Registrar evolução'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma evolução registrada ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr><th>Data/hora</th><th>Autor</th><th>Evolução</th></tr>
            </thead>
            <tbody>
              {historico.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ color: 'var(--c-text-muted)', verticalAlign: 'top' }}>{new Date(ev.criado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ color: 'var(--c-primary)', fontWeight: 600, verticalAlign: 'top' }}>
                    {ev.enfermeiros?.nome_exibicao || ev.enfermeiros?.nome || 'Enfermagem'}
                  </td>
                  <td className="col-larga" style={{ whiteSpace: 'pre-wrap' }}>{ev.texto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const TIPOS_DISPOSITIVO = ['AVP', 'SVD', 'SNE', 'Dreno', 'CVC', 'Traqueostomia', 'O2']

function AbaDispositivos({ atendimento }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('')
  const [localInsercao, setLocalInsercao] = useState('')
  const [trocaPrevista, setTrocaPrevista] = useState('')
  const [motivos, setMotivos] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarDispositivos(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function inserir() {
    if (!tipo) return
    setErro('')
    setSalvando(true)
    const { error } = await inserirDispositivo({
      atendimentoId: atendimento.atendimento_id,
      tipo,
      localInsercao,
      trocaPrevistaEm: trocaPrevista ? new Date(trocaPrevista).toISOString() : null,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar o dispositivo. Tente de novo.')
      console.error(error)
      return
    }
    setTipo('')
    setLocalInsercao('')
    setTrocaPrevista('')
    carregar()
  }

  async function remover(id) {
    await removerDispositivo({ id, motivo: motivos[id] || '' })
    carregar()
  }

  const ativos = lista.filter((d) => !d.removido_em)
  const removidos = lista.filter((d) => d.removido_em)

  return (
    <div className="form-section">
      <div className="form-section-title">Novo dispositivo</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Tipo</label>
          <div className="chip-group">
            {TIPOS_DISPOSITIVO.map((t) => (
              <button key={t} type="button" className={`chip ${tipo === t ? 'on' : ''}`} onClick={() => setTipo(tipo === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Local de inserção</label><input type="text" value={localInsercao} onChange={(e) => setLocalInsercao(e.target.value)} /></div>
        <div className="form-field"><label>Troca prevista</label><input type="date" value={trocaPrevista} onChange={(e) => setTrocaPrevista(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={inserir} disabled={salvando || !tipo}>
        {salvando ? 'Registrando...' : 'Registrar dispositivo'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativos</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : ativos.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum dispositivo ativo.</p>
      ) : (
        <div className="hist-tabela-wrap" style={{ marginBottom: 4 }}>
          <table className="hist-tabela">
            <thead>
              <tr><th>Tipo</th><th>Local</th><th>Inserido em</th><th>Troca prevista</th><th className="col-larga">Motivo da remoção</th><th></th></tr>
            </thead>
            <tbody>
              {ativos.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.tipo}</td>
                  <td>{d.local_insercao || '—'}</td>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(d.inserido_em).toLocaleString('pt-BR')}</td>
                  <td style={{ color: 'var(--c-text-muted)' }}>{d.troca_prevista_em ? new Date(d.troca_prevista_em).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="col-larga">
                    <input
                      type="text"
                      placeholder="Opcional"
                      value={motivos[d.id] || ''}
                      onChange={(e) => setMotivos((p) => ({ ...p, [d.id]: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td><button type="button" className="btn-fechar" onClick={() => remover(d.id)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {removidos.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Removidos</div>
          <div className="hist-tabela-wrap">
            <table className="hist-tabela">
              <thead>
                <tr><th>Tipo</th><th>Local</th><th>Removido em</th><th className="col-larga">Motivo</th></tr>
              </thead>
              <tbody>
                {removidos.map((d) => (
                  <tr key={d.id}>
                    <td>{d.tipo}</td>
                    <td>{d.local_insercao || '—'}</td>
                    <td style={{ color: 'var(--c-text-muted)' }}>{new Date(d.removido_em).toLocaleString('pt-BR')}</td>
                    <td className="col-larga" style={{ color: 'var(--c-text-muted)' }}>{d.motivo_remocao || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

const VIAS_ENTRADA = ['Oral', 'Dieta enteral', 'EV', 'Outra']
const VIAS_SAIDA = ['Diurese', 'Vômito', 'Dreno', 'Evacuação', 'Outra']

function AbaBalancoHidrico({ atendimento, autorId }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('entrada')
  const [via, setVia] = useState('')
  const [volume, setVolume] = useState('')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarBalancoHidrico(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!via || !volume) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarBalancoHidrico({
      atendimentoId: atendimento.atendimento_id, registradoPor: autorId, tipo, via, volumeMl: volume, observacao,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setVia('')
    setVolume('')
    setObservacao('')
    carregar()
  }

  const totalEntradas = historico.filter((h) => h.tipo === 'entrada').reduce((s, h) => s + Number(h.volume_ml), 0)
  const totalSaidas = historico.filter((h) => h.tipo === 'saida').reduce((s, h) => s + Number(h.volume_ml), 0)
  const opcoesVia = tipo === 'entrada' ? VIAS_ENTRADA : VIAS_SAIDA

  return (
    <div className="form-section">
      <div className="form-section-title">Novo registro</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Tipo</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${tipo === 'entrada' ? 'on' : ''}`} onClick={() => { setTipo('entrada'); setVia('') }}>Entrada</button>
            <button type="button" className={`toggle-btn ${tipo === 'saida' ? 'on' : ''}`} onClick={() => { setTipo('saida'); setVia('') }}>Saída</button>
          </div>
        </div>
        <div className="form-field">
          <label>Via</label>
          <div className="chip-group">
            {opcoesVia.map((v) => (
              <button key={v} type="button" className={`chip ${via === v ? 'on' : ''}`} onClick={() => setVia(v)}>{v}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Volume (mL)</label><input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} /></div>
        <div className="form-field span-2"><label>Observação</label><input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !via || !volume}>
        {salvando ? 'Registrando...' : 'Registrar'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>
        Totais — Entradas {totalEntradas} mL · Saídas {totalSaidas} mL · Saldo {totalEntradas - totalSaidas} mL
      </div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum registro ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr><th>Data/hora</th><th>Tipo</th><th>Via</th><th>Volume</th><th className="col-larga">Observação</th></tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.id}>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(h.registrado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ color: h.tipo === 'entrada' ? 'var(--c-primary)' : 'var(--c-danger)', fontWeight: 600 }}>
                    {h.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </td>
                  <td>{h.via}</td>
                  <td>{h.tipo === 'entrada' ? '+' : '−'}{h.volume_ml} mL</td>
                  <td className="col-larga" style={{ color: 'var(--c-text-muted)' }}>{h.observacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const BRADEN_CAMPOS = [
  { chave: 'percepcao_sensorial', rotulo: 'Percepção sensorial', opcoes: [
    { v: 1, t: 'Completamente limitada' }, { v: 2, t: 'Muito limitada' }, { v: 3, t: 'Levemente limitada' }, { v: 4, t: 'Nenhuma limitação' },
  ] },
  { chave: 'umidade', rotulo: 'Umidade', opcoes: [
    { v: 1, t: 'Completamente molhada' }, { v: 2, t: 'Muito molhada' }, { v: 3, t: 'Ocasionalmente molhada' }, { v: 4, t: 'Raramente molhada' },
  ] },
  { chave: 'atividade', rotulo: 'Atividade', opcoes: [
    { v: 1, t: 'Acamado' }, { v: 2, t: 'Confinado à cadeira' }, { v: 3, t: 'Anda ocasionalmente' }, { v: 4, t: 'Anda frequentemente' },
  ] },
  { chave: 'mobilidade', rotulo: 'Mobilidade', opcoes: [
    { v: 1, t: 'Completamente imóvel' }, { v: 2, t: 'Muito limitada' }, { v: 3, t: 'Levemente limitada' }, { v: 4, t: 'Nenhuma limitação' },
  ] },
  { chave: 'nutricao', rotulo: 'Nutrição', opcoes: [
    { v: 1, t: 'Muito pobre' }, { v: 2, t: 'Provavelmente inadequada' }, { v: 3, t: 'Adequada' }, { v: 4, t: 'Excelente' },
  ] },
  { chave: 'friccao_cisalhamento', rotulo: 'Fricção e cisalhamento', opcoes: [
    { v: 1, t: 'Problema' }, { v: 2, t: 'Problema em potencial' }, { v: 3, t: 'Nenhum problema' },
  ] },
]

function riscoBraden(total) {
  if (total <= 9) return 'Risco muito alto'
  if (total <= 12) return 'Risco alto'
  if (total <= 14) return 'Risco moderado'
  if (total <= 18) return 'Risco baixo'
  return 'Sem risco'
}

const MORSE_CAMPOS = [
  { chave: 'historico_quedas', rotulo: 'Histórico de quedas', opcoes: [{ v: 0, t: 'Não' }, { v: 25, t: 'Sim' }] },
  { chave: 'diagnostico_secundario', rotulo: 'Diagnóstico secundário', opcoes: [{ v: 0, t: 'Não' }, { v: 15, t: 'Sim' }] },
  { chave: 'auxilio_locomocao', rotulo: 'Auxílio de locomoção', opcoes: [
    { v: 0, t: 'Nenhum / leito / cadeira de rodas / enfermeiro' }, { v: 15, t: 'Muletas / bengala / andador' }, { v: 30, t: 'Apoia-se em móveis' },
  ] },
  { chave: 'terapia_ev', rotulo: 'Terapia endovenosa', opcoes: [{ v: 0, t: 'Não' }, { v: 20, t: 'Sim' }] },
  { chave: 'marcha', rotulo: 'Marcha', opcoes: [{ v: 0, t: 'Normal / leito / imóvel' }, { v: 10, t: 'Fraca' }, { v: 20, t: 'Comprometida' }] },
  { chave: 'estado_mental', rotulo: 'Estado mental', opcoes: [
    { v: 0, t: 'Orienta-se quanto à própria capacidade' }, { v: 15, t: 'Superestima capacidade / esquece limitações' },
  ] },
]

function riscoMorse(total) {
  if (total <= 24) return 'Risco baixo'
  if (total <= 50) return 'Risco médio'
  return 'Risco alto'
}

function AbaEscalas({ atendimento }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('braden')
  const [respostas, setRespostas] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarEscalas(atendimento.atendimento_id))
    setCarregando(false)
  }

  const campos = tipo === 'braden' ? BRADEN_CAMPOS : MORSE_CAMPOS
  const completo = campos.every((c) => respostas[c.chave] !== undefined)
  const total = campos.reduce((s, c) => s + (respostas[c.chave] ?? 0), 0)
  const risco = tipo === 'braden' ? riscoBraden(total) : riscoMorse(total)

  function trocarTipo(t) {
    setTipo(t)
    setRespostas({})
  }

  async function registrar() {
    if (!completo) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEscala({
      atendimentoId: atendimento.atendimento_id, tipo, pontuacao: total, nivelRisco: risco, detalhes: respostas,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setRespostas({})
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova avaliação</div>
      <div className="form-field" style={{ marginBottom: 16, maxWidth: 260 }}>
        <div className="toggle-group">
          <button type="button" className={`toggle-btn ${tipo === 'braden' ? 'on' : ''}`} onClick={() => trocarTipo('braden')}>Braden</button>
          <button type="button" className={`toggle-btn ${tipo === 'morse' ? 'on' : ''}`} onClick={() => trocarTipo('morse')}>Morse</button>
        </div>
      </div>

      {campos.map((c) => (
        <div className="form-field span-3" key={c.chave} style={{ marginBottom: 14 }}>
          <label>{c.rotulo}</label>
          <div className="chip-group">
            {c.opcoes.map((o) => (
              <button
                key={o.v}
                type="button"
                className={`chip ${respostas[c.chave] === o.v ? 'on' : ''}`}
                onClick={() => setRespostas((p) => ({ ...p, [c.chave]: o.v }))}
              >
                {o.t} ({o.v})
              </button>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 13, fontWeight: 600, margin: '10px 0' }}>
        Pontuação: {total} — {risco}
      </p>

      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !completo}>
        {salvando ? 'Registrando...' : 'Registrar avaliação'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma avaliação registrada ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr><th>Data/hora</th><th>Escala</th><th>Pontuação</th><th>Risco</th></tr>
            </thead>
            <tbody>
              {historico.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(e.avaliado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{e.tipo}</td>
                  <td>{e.pontuacao}</td>
                  <td><span className={`resumo-badge ${riscoClasse(e.nivel_risco)}`}>{e.nivel_risco}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const GRAVIDADES = ['Leve', 'Moderada', 'Grave']

function AbaAlergias({ atendimento }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [substancia, setSubstancia] = useState('')
  const [reacao, setReacao] = useState('')
  const [gravidade, setGravidade] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarAlergias(atendimento.pessoa_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!substancia.trim()) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarAlergia({ pessoaId: atendimento.pessoa_id, substancia: substancia.trim(), reacao, gravidade })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setSubstancia('')
    setReacao('')
    setGravidade('')
    carregar()
  }

  async function inativar(id) {
    await inativarAlergia(id)
    carregar()
  }

  const ativas = lista.filter((a) => a.status === 'ativa')
  const inativas = lista.filter((a) => a.status !== 'ativa')

  return (
    <div className="form-section">
      <div className="form-section-title">Nova alergia</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field"><label>Substância</label><input type="text" value={substancia} onChange={(e) => setSubstancia(e.target.value)} /></div>
        <div className="form-field"><label>Reação</label><input type="text" placeholder="ex: urticária, edema..." value={reacao} onChange={(e) => setReacao(e.target.value)} /></div>
        <div className="form-field">
          <label>Gravidade</label>
          <div className="chip-group">
            {GRAVIDADES.map((g) => (
              <button key={g} type="button" className={`chip ${gravidade === g ? 'on' : ''}`} onClick={() => setGravidade(gravidade === g ? '' : g)}>{g}</button>
            ))}
          </div>
        </div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !substancia.trim()}>
        {salvando ? 'Registrando...' : 'Registrar alergia'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativas</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : ativas.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma alergia ativa registrada.</p>
      ) : (
        <div className="hist-tabela-wrap" style={{ marginBottom: 4 }}>
          <table className="hist-tabela">
            <thead>
              <tr><th>Substância</th><th>Reação</th><th>Gravidade</th><th></th></tr>
            </thead>
            <tbody>
              {ativas.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.substancia}</td>
                  <td className="col-larga">{a.reacao || '—'}</td>
                  <td>{a.gravidade ? <span className={`resumo-badge ${a.gravidade === 'Grave' ? 'danger' : a.gravidade === 'Moderada' ? 'warn' : 'ok'}`}>{a.gravidade}</span> : '—'}</td>
                  <td><button type="button" className="btn-fechar" onClick={() => inativar(a.id)}>Inativar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inativas.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Inativas</div>
          <div className="hist-tabela-wrap">
            <table className="hist-tabela">
              <thead>
                <tr><th>Substância</th><th>Reação</th><th>Gravidade</th></tr>
              </thead>
              <tbody>
                {inativas.map((a) => (
                  <tr key={a.id} style={{ color: 'var(--c-text-muted)' }}>
                    <td>{a.substancia}</td>
                    <td className="col-larga">{a.reacao || '—'}</td>
                    <td>{a.gravidade || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

const TIPOS_ISOLAMENTO = ['Contato', 'Gotículas', 'Aerossol']

function AbaIsolamento({ atendimento, autorId }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [patogeno, setPatogeno] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setLista(await listarIsolamentos(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function registrar() {
    if (!tipo) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarIsolamento({ atendimentoId: atendimento.atendimento_id, tipo, motivo, patogenoSuspeito: patogeno, prescritoPor: autorId })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setTipo('')
    setMotivo('')
    setPatogeno('')
    carregar()
  }

  async function encerrar(id) {
    await encerrarIsolamento(id)
    carregar()
  }

  const ativos = lista.filter((i) => i.ativo)
  const encerrados = lista.filter((i) => !i.ativo)

  return (
    <div className="form-section">
      <div className="form-section-title">Nova precaução de isolamento</div>
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-field">
          <label>Tipo</label>
          <div className="chip-group">
            {TIPOS_ISOLAMENTO.map((t) => (
              <button key={t} type="button" className={`chip ${tipo === t ? 'on' : ''}`} onClick={() => setTipo(tipo === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Motivo</label><input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
        <div className="form-field"><label>Patógeno suspeito</label><input type="text" value={patogeno} onChange={(e) => setPatogeno(e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !tipo}>
        {salvando ? 'Registrando...' : 'Registrar isolamento'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Ativos</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : ativos.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum isolamento ativo.</p>
      ) : (
        <div className="hist-tabela-wrap" style={{ marginBottom: 4 }}>
          <table className="hist-tabela">
            <thead>
              <tr><th>Tipo</th><th>Motivo</th><th>Patógeno suspeito</th><th>Início</th><th></th></tr>
            </thead>
            <tbody>
              {ativos.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.tipo}</td>
                  <td className="col-larga">{i.motivo || '—'}</td>
                  <td>{i.patogeno_suspeito || '—'}</td>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(i.inicio_em).toLocaleString('pt-BR')}</td>
                  <td><button type="button" className="btn-fechar" onClick={() => encerrar(i.id)}>Encerrar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {encerrados.length > 0 && (
        <>
          <div className="form-section-title" style={{ marginTop: 24 }}>Encerrados</div>
          <div className="hist-tabela-wrap">
            <table className="hist-tabela">
              <thead>
                <tr><th>Tipo</th><th>Motivo</th><th>Início</th><th>Fim</th></tr>
              </thead>
              <tbody>
                {encerrados.map((i) => (
                  <tr key={i.id} style={{ color: 'var(--c-text-muted)' }}>
                    <td>{i.tipo}</td>
                    <td className="col-larga">{i.motivo || '—'}</td>
                    <td>{new Date(i.inicio_em).toLocaleString('pt-BR')}</td>
                    <td>{i.fim_em ? new Date(i.fim_em).toLocaleString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
