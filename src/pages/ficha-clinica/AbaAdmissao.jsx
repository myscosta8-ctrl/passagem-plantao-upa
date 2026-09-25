import { useEffect, useState } from 'react';
import { buscarAdmissao, salvarAdmissao, registrarSinaisVitais } from '../../lib/pepClinico';

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


function obterResumoExame(grupo, atual) {
  if (!atual) return 'Não preenchido'
  const partes = []
  if (atual.itens?.length > 0) {
    if (atual.itens.length <= 3) {
      partes.push(atual.itens.join(', '))
    } else {
      partes.push(`${atual.itens.slice(0, 3).join(', ')} (+${atual.itens.length - 3})`)
    }
  }
  if (grupo.extras) {
    for (const ex of grupo.extras) {
      const val = atual[ex.campo]
      if (val !== undefined && val !== null && val !== '') {
        partes.push(`${ex.rotulo}: ${val}`)
      }
    }
  }
  return partes.length > 0 ? partes.join(' · ') : 'Não preenchido'
}

function checarGrupoPreenchido(grupo, atual) {
  if (!atual) return false
  if (atual.itens?.length > 0) return true
  if (grupo.extras?.some((ex) => {
    const v = atual[ex.campo]
    return v !== undefined && v !== null && v !== ''
  })) return true
  return false
}

function GrupoExameColapsavel({ grupo, exame, aberto, onToggleAberto, onToggle, onExtra }) {
  const atual = exame[grupo.chave] ?? {}
  const preenchido = checarGrupoPreenchido(grupo, atual)
  const resumo = obterResumoExame(grupo, atual)

  return (
    <div className={`secao-exame ${aberto ? 'aberta' : ''}`}>
      <div className="secao-exame-cabecalho" onClick={onToggleAberto}>
        <div className="secao-exame-titulo">
          <span className={`secao-icone-status ${preenchido ? 'ok' : 'vazio'}`} />
          <span>{grupo.titulo}</span>
        </div>
        <div className="secao-exame-direita">
          <span className={`secao-resumo ${preenchido ? 'preenchido' : 'vazio'}`}>{resumo}</span>
          <span className="secao-seta">▾</span>
        </div>
      </div>

      {aberto && (
        <div className="secao-exame-corpo">
          <div className="chip-grade">
            {grupo.itens.map((item) => {
              const sel = (atual.itens || []).includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  className={`chip-admissao ${sel ? 'sel' : ''}`}
                  onClick={() => onToggle(grupo.chave, item)}
                >
                  {item}
                </button>
              )
            })}
          </div>

          {grupo.extras?.length > 0 && (
            <div className="extras-linha">
              {grupo.extras.map((ex) => (
                <div key={ex.campo} className="extra-campo">
                  <label>{ex.rotulo}</label>
                  {ex.tipo === 'text' && (
                    <input
                      type="text"
                      value={atual[ex.campo] || ''}
                      onChange={(e) => onExtra(grupo.chave, ex.campo, e.target.value)}
                    />
                  )}
                  {ex.tipo === 'select' && (
                    <select
                      value={atual[ex.campo] || ''}
                      onChange={(e) => onExtra(grupo.chave, ex.campo, e.target.value)}
                    >
                      <option value="">—</option>
                      {ex.opcoes.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}
                  {ex.tipo === 'lado' && (
                    <div className="toggle-group" style={{ maxWidth: 110 }}>
                      <button
                        type="button"
                        className={`toggle-btn ${atual[ex.campo] === 'D' ? 'on' : ''}`}
                        onClick={() => onExtra(grupo.chave, ex.campo, atual[ex.campo] === 'D' ? '' : 'D')}
                      >
                        D
                      </button>
                      <button
                        type="button"
                        className={`toggle-btn ${atual[ex.campo] === 'E' ? 'on' : ''}`}
                        onClick={() => onExtra(grupo.chave, ex.campo, atual[ex.campo] === 'E' ? '' : 'E')}
                      >
                        E
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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


export default function AbaAdmissao({ atendimento, autorId }) {
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
  const [grupoAberto, setGrupoAberto] = useState('neurologico')

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

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-clipboard-text" /> Admissão</h2>
          <p>Identificação complementar, sinais vitais e exame físico completo do paciente.</p>
        </div>
      </div>

      <div className="cc-body">
      {jaSalvo && (
        <div className="allergy-alert" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <div className="info" style={{ color: '#1D4ED8' }}>
            <i className="ph ph-info" /> Admissão já registrada — pode ajustar e salvar de novo.
          </div>
        </div>
      )}

      <div className="form-section-box">
        <div className="form-section-box-title"><i className="ph ph-identification-card" /> Identificação complementar</div>
        <div className="assess-grid">
          <div className="form-group"><label>Alergia medicamentosa</label><input type="text" value={cab.alergia_medicamentosa} onChange={(e) => setC('alergia_medicamentosa', e.target.value)} /></div>
          <div className="form-group"><label>Alergia alimentar</label><input type="text" value={cab.alergia_alimentar} onChange={(e) => setC('alergia_alimentar', e.target.value)} /></div>
          <div className="form-group"><label>Cidade onde reside</label><input type="text" value={cab.cidade_reside} onChange={(e) => setC('cidade_reside', e.target.value)} /></div>
          <div className="form-group"><label>Acompanhante</label><input type="text" value={cab.acompanhante} onChange={(e) => setC('acompanhante', e.target.value)} /></div>
        </div>
        <div className="form-group">
          <label>Medicamentos controlados</label>
          <div className="checkbox-group" style={{ flexDirection: 'row' }}>
            <label className="checkbox-item"><input type="radio" name="admissao-medcontrolados" checked={cab.medicamentos_controlados === false} onChange={() => setC('medicamentos_controlados', false)} /> Não</label>
            <label className="checkbox-item"><input type="radio" name="admissao-medcontrolados" checked={cab.medicamentos_controlados === true} onChange={() => setC('medicamentos_controlados', true)} /> Sim</label>
          </div>
        </div>
        {cab.medicamentos_controlados && (
          <div className="form-group"><label>Quais</label><input type="text" value={cab.medicamentos_controlados_quais} onChange={(e) => setC('medicamentos_controlados_quais', e.target.value)} /></div>
        )}
        <div className="form-group"><label>Hipótese diagnóstica</label><input type="text" value={cab.hipotese_diagnostica} onChange={(e) => setC('hipotese_diagnostica', e.target.value)} /></div>
      </div>

      <div className="form-section-box">
        <div className="form-section-box-title"><i className="ph ph-heartbeat" /> Sinais vitais da admissão</div>
        <div className="assess-grid">
          <div className="form-group"><label>PA sistólica</label><input type="number" value={svAdmissao.pa_sistolica} onChange={(e) => setSvAdmissao((p) => ({ ...p, pa_sistolica: e.target.value }))} /></div>
          <div className="form-group"><label>PA diastólica</label><input type="number" value={svAdmissao.pa_diastolica} onChange={(e) => setSvAdmissao((p) => ({ ...p, pa_diastolica: e.target.value }))} /></div>
          <div className="form-group"><label>Pulso</label><input type="number" value={svAdmissao.fc} onChange={(e) => setSvAdmissao((p) => ({ ...p, fc: e.target.value }))} /></div>
          <div className="form-group"><label>FR</label><input type="number" value={svAdmissao.fr} onChange={(e) => setSvAdmissao((p) => ({ ...p, fr: e.target.value }))} /></div>
          <div className="form-group"><label>SpO2</label><input type="number" value={svAdmissao.spo2} onChange={(e) => setSvAdmissao((p) => ({ ...p, spo2: e.target.value }))} /></div>
        </div>
      </div>

      <div className="form-section-box-title" style={{ position: 'static', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><i className="ph ph-activity" /> Exame físico (26 grupos)</span>
      </div>

      {(() => {
        const qtdPreenchidos = GRUPOS_EXAME.filter((g) => checarGrupoPreenchido(g, exame[g.chave])).length
        const pctPreenchido = Math.round((qtdPreenchidos / GRUPOS_EXAME.length) * 100)
        return (
          <div className="admissao-progresso-container">
            <div className="admissao-progresso-info">
              <span className="admissao-progresso-label">{qtdPreenchidos} de {GRUPOS_EXAME.length} grupos preenchidos</span>
              <span className="admissao-progresso-pct">{pctPreenchido}%</span>
            </div>
            <div className="admissao-barra-trilho">
              <div className="admissao-barra-fill" style={{ width: `${pctPreenchido}%` }} />
            </div>
          </div>
        )
      })()}

      <div style={{ marginBottom: 20 }}>
        {GRUPOS_EXAME.map((g) => (
          <GrupoExameColapsavel
            key={g.chave}
            grupo={g}
            exame={exame}
            aberto={grupoAberto === g.chave}
            onToggleAberto={() => setGrupoAberto((atual) => (atual === g.chave ? null : g.chave))}
            onToggle={toggleExame}
            onExtra={extraExame}
          />
        ))}
      </div>

      <div className="form-section-box">
        <div className="form-section-box-title"><i className="ph ph-bandaids" /> Integridade física</div>
        <div className="form-group">
          <label>Presença de lesões cutâneas</label>
          <div className="checkbox-group" style={{ flexDirection: 'row' }}>
            <label className="checkbox-item"><input type="radio" name="admissao-lesao" checked={integridade.lesao_cutanea === false} onChange={() => setIntegridade((p) => ({ ...p, lesao_cutanea: false }))} /> Não</label>
            <label className="checkbox-item"><input type="radio" name="admissao-lesao" checked={integridade.lesao_cutanea === true} onChange={() => setIntegridade((p) => ({ ...p, lesao_cutanea: true }))} /> Sim</label>
          </div>
        </div>
        {integridade.lesao_cutanea && (
          <div className="assess-grid">
            <div className="form-group">
              <label>Tipo</label>
              <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {['Ferida operatória', 'Lesão por pressão'].map((t) => (
                  <label key={t} className="checkbox-item">
                    <input type="checkbox" checked={integridade.tipo === t} onChange={() => setIntegridade((p) => ({ ...p, tipo: p.tipo === t ? '' : t }))} /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label>Região e grau</label><input type="text" value={integridade.local_grau} onChange={(e) => setIntegridade((p) => ({ ...p, local_grau: e.target.value }))} /></div>
          </div>
        )}
        <div className="form-group">
          <label>Desenvolvida em</label>
          <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['Casa', 'Enfermaria de origem', 'UTI Adulto/Hospital'].map((t) => (
              <label key={t} className="checkbox-item">
                <input type="checkbox" checked={integridade.desenvolvida_em === t} onChange={() => setIntegridade((p) => ({ ...p, desenvolvida_em: p.desenvolvida_em === t ? '' : t }))} /> {t}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section-box">
        <div className="form-section-box-title"><i className="ph ph-clock-counter-clockwise" /> Antecedentes</div>
        <div className="assess-grid">
          <div className="form-group">
            <label>Doenças da infância</label>
            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {DOENCAS_INFANCIA_OPCOES.map((d) => (
                <label key={d} className="checkbox-item"><input type="checkbox" checked={doencasInfancia.itens.includes(d)} onChange={() => toggleDoenca(doencasInfancia, setDoencasInfancia, d)} /> {d}</label>
              ))}
            </div>
          </div>
          <div className="form-group"><label>Outras (infância)</label><input type="text" value={doencasInfancia.outros} onChange={(e) => setDoencasInfancia((p) => ({ ...p, outros: e.target.value }))} /></div>
        </div>

        <div className="assess-grid" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Doenças crônicas</label>
            <div className="checkbox-group" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {DOENCAS_CRONICAS_OPCOES.map((d) => (
                <label key={d} className="checkbox-item"><input type="checkbox" checked={doencasCronicas.itens.includes(d)} onChange={() => toggleDoenca(doencasCronicas, setDoencasCronicas, d)} /> {d}</label>
              ))}
              <label className="checkbox-item"><input type="checkbox" checked={doencasCronicas.itens.includes('Diabetes')} onChange={() => toggleDoenca(doencasCronicas, setDoencasCronicas, 'Diabetes')} /> Diabetes</label>
            </div>
          </div>
          {doencasCronicas.itens.includes('Diabetes') && (
            <div className="form-group"><label>Diabetes / tipo</label><input type="text" value={doencasCronicas.diabetes_tipo} onChange={(e) => setDoencasCronicas((p) => ({ ...p, diabetes_tipo: e.target.value }))} /></div>
          )}
          <div className="form-group"><label>Outras (crônicas)</label><input type="text" value={doencasCronicas.outros} onChange={(e) => setDoencasCronicas((p) => ({ ...p, outros: e.target.value }))} /></div>
        </div>

        <div className="assess-grid" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Tabagista</label>
            <div className="checkbox-group" style={{ flexDirection: 'row' }}>
              <label className="checkbox-item"><input type="radio" name="admissao-tabagista" checked={cab.tabagista === false} onChange={() => setC('tabagista', false)} /> Não</label>
              <label className="checkbox-item"><input type="radio" name="admissao-tabagista" checked={cab.tabagista === true} onChange={() => setC('tabagista', true)} /> Sim</label>
            </div>
          </div>
          {cab.tabagista && <div className="form-group"><label>Há quanto tempo</label><input type="text" value={cab.tabagista_tempo} onChange={(e) => setC('tabagista_tempo', e.target.value)} /></div>}
          <div className="form-group">
            <label>Etilista</label>
            <div className="checkbox-group" style={{ flexDirection: 'row' }}>
              <label className="checkbox-item"><input type="radio" name="admissao-etilista" checked={cab.etilista === false} onChange={() => setC('etilista', false)} /> Não</label>
              <label className="checkbox-item"><input type="radio" name="admissao-etilista" checked={cab.etilista === true} onChange={() => setC('etilista', true)} /> Sim</label>
            </div>
          </div>
          {cab.etilista && <div className="form-group"><label>Há quanto tempo</label><input type="text" value={cab.etilista_tempo} onChange={(e) => setC('etilista_tempo', e.target.value)} /></div>}
        </div>
      </div>

      <div className="form-group">
        <label><i className="ph ph-note" /> Observações</label>
        <textarea value={cab.observacoes} onChange={(e) => setC('observacoes', e.target.value)} />
      </div>

      {erro && (
        <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
          <div className="info" style={{ color: '#DC2626' }}>
            <i className="ph ph-warning" /> {erro}
          </div>
        </div>
      )}
      {sucesso && (
        <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <div className="info" style={{ color: '#166534' }}>
            <i className="ph ph-check-circle" /> Admissão salva.
          </div>
        </div>
      )}
      </div>

      <div className="cc-footer">
        <span />
        <button className="btn-save-print" onClick={salvar} disabled={salvando}>
          <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar admissão'}
        </button>
      </div>
    </div>
  )
}


