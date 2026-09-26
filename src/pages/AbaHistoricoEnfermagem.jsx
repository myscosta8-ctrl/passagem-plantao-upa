import { useEffect, useState } from 'react'
import { buscarHistoricoEnfermagem, salvarHistoricoEnfermagem } from '../lib/pepMedico'
import { listarEscalas, listarDispositivos, listarAlergias } from '../lib/pepClinico'

// ===================== Admissão de Enfermagem (SAE) =====================
// Tela conforme mockups-fase2/08-admissao-enfermagem-design.html; o impresso é
// modelos_impressao_html/01-admissao-enfermagem.html (CorpoHistoricoEnfermagemProjeto).
// Sem migration: os campos novos ficam nas colunas jsonb já existentes de
// historico_enfermagem (info_complementares, exame_fisico — marcado com v: 2).

const SECOES = [
  { chave: 'procedencia', titulo: '1. Procedência e Acolhimento', icon: 'ph-ambulance' },
  { chave: 'antecedentes', titulo: '2. Antecedentes e Condições Crônicas', rotuloCurto: '2. Antecedentes e Riscos', icon: 'ph-clipboard-text' },
  { chave: 'exame', titulo: '3. Exame Físico Céfalo-Podálico', icon: 'ph-person' },
  { chave: 'intervencoes', titulo: '4. Intervenções Iniciais de Enfermagem', rotuloCurto: '4. Intervenções Iniciais', icon: 'ph-first-aid-kit' },
]

const PROCEDENCIAS = ['Demanda Espontânea', 'SAMU 192', 'Resgate Corpo de Bombeiros', 'Transferência Hospitalar']
const MEIOS_CHEGADA = ['Deambulando', 'Cadeira de Rodas', 'Maca']
const ANTECEDENTES = ['Hipertensão Arterial (HAS)', 'Diabetes Mellitus (DM)', 'Cardiopatia / IAM prévio', 'AVE / AVC prévio', 'Insuficiência Renal', 'Tabagismo', 'Etilismo']
const NEURO = ['Consciente / Lúcido', 'Sonolento', 'Torporoso', 'Comatoso', 'Agitado / Confuso']
const PUPILAS = ['Isocóricas e fotorreagentes', 'Anisocóricas (D > E)', 'Anisocóricas (E > D)', 'Midriáticas', 'Mióticas']
const GLASGOW = ['15 (AO: 4, MRV: 5, MRM: 6)', '14 (AO: 4, MRV: 4, MRM: 6)', '13 a 11 (Moderado)', '10 a 9 (Moderado)', '≤ 8 (Grave)']
const RESPIRATORIO = ['Eupneico em ar ambiente', 'Dispneico', 'Sob Oxigenoterapia (Cateter/Máscara)', 'Traqueostomizado / Ventilação Mecânica']
const ABDOME = ['Plano', 'Flácido / Indolor', 'Distendido', 'RHA Ausentes']
const URINARIO = ['Espontânea', 'SVD (Foley)', 'Anúria / Oligúria']
const MEMBROS = ['Preservada / Sem anormalidades', 'Com anormalidades (Paresia / Plegia / Edema)']
const PELE = ['Íntegra', 'Corada e Hidratada', 'Cianose', 'Icterícia', 'Lesão por Pressão (LPP)', 'Hematomas / Escoriações']
const INTERVENCOES = ['Acesso Venoso Periférico Calibroso', 'Monitorização Cardíaca Contínua', 'Oximetria de Pulso Contínua', 'HGT Admissional', 'Manter Cabeceira Elevada a 30°', 'Grades de Segurança Elevadas', 'Identificação Alérgica no Leito']

const MEDICAMENTO_USO_VAZIO = { nome: '', via: '', dose: '', tempo_uso: '' }
const EXAME_VAZIO = { v: 2, neuro: '', pupilas: '', glasgow: '', respiratorio: '', respiratorio_obs: '', abdome: [], urinario: '', membros: '', membros_obs: '', pele: [] }
const VAZIO = {
  procedencia: '', acompanhante: '', meio_chegada: '', motivo: '',
  antecedentes: [], antecedentes_outros: '', alergia: false, alergia_quais: '',
  medicamentos_uso: [{ ...MEDICAMENTO_USO_VAZIO }],
  exame: EXAME_VAZIO,
  intervencoes: [], observacoes: '',
}

function Checks({ opcoes, valor, onChange }) {
  const sel = valor || []
  const toggle = (op) => onChange(sel.includes(op) ? sel.filter((x) => x !== op) : [...sel, op])
  return (
    <div className="adm-checks">
      {opcoes.map((op) => (
        <label key={op} className={'adm-check' + (sel.includes(op) ? ' on' : '')}>
          <input type="checkbox" checked={sel.includes(op)} onChange={() => toggle(op)} /> {op}
        </label>
      ))}
    </div>
  )
}

function Radios({ nome, opcoes, valor, onChange }) {
  return (
    <div className="adm-checks">
      {opcoes.map((op) => (
        <label key={op} className={'adm-check' + (valor === op ? ' on' : '')}>
          <input type="radio" name={nome} checked={valor === op} onChange={() => onChange(op)} /> {op}
        </label>
      ))}
    </div>
  )
}

function Select({ opcoes, valor, onChange }) {
  return (
    <select value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function deBanco(h) {
  const ic = h.info_complementares || {}
  const ef = h.exame_fisico?.v === 2 ? h.exame_fisico : EXAME_VAZIO
  return {
    procedencia: ic.procedencia || '', acompanhante: ic.acompanhante || '', meio_chegada: ic.meio_chegada || '',
    motivo: h.motivo_hospitalizacao || '',
    antecedentes: ic.antecedentes || [], antecedentes_outros: ic.antecedentes_outros || h.outros_info || '',
    alergia: !!h.alergia, alergia_quais: h.alergia_quais || '',
    medicamentos_uso: h.medicamentos_uso?.length ? h.medicamentos_uso : [{ ...MEDICAMENTO_USO_VAZIO }],
    exame: { ...EXAME_VAZIO, ...ef },
    intervencoes: ic.intervencoes || [], observacoes: h.parecer_obs || '',
  }
}

export default function AbaHistoricoEnfermagem({ atendimento, medicoId, onImprimir, onFechar }) {
  const [d, setD] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [recolhidas, setRecolhidas] = useState(() => new Set())
  const [painelAberto, setPainelAberto] = useState(true)
  const [escalas, setEscalas] = useState([])
  const [dispositivos, setDispositivos] = useState([])
  const [alergias, setAlergias] = useState([])

  useEffect(() => {
    buscarHistoricoEnfermagem(atendimento.atendimento_id).then((h) => {
      if (h) setD(deBanco(h))
      setCarregando(false)
    })
    listarEscalas(atendimento.atendimento_id).then(setEscalas)
    listarDispositivos(atendimento.atendimento_id).then(setDispositivos)
    if (atendimento.pessoa_id) listarAlergias(atendimento.pessoa_id).then(setAlergias)
  }, [atendimento.atendimento_id])

  const set = (campo, valor) => setD((p) => ({ ...p, [campo]: valor }))
  const setEx = (campo, valor) => setD((p) => ({ ...p, exame: { ...p.exame, [campo]: valor } }))
  const setMed = (i, campo, valor) => setD((p) => ({ ...p, medicamentos_uso: p.medicamentos_uso.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)) }))

  const visivel = (c) => filtro === 'todas' || filtro === c
  const aberta = (c) => filtro === c || !recolhidas.has(c)
  const toggle = (c) => setRecolhidas((prev) => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n })
  const recolherTodos = () => setRecolhidas(new Set(SECOES.map((s) => s.chave)))
  const irPara = (c) => { setFiltro(c); setRecolhidas(new Set()) }

  async function salvar(imprimir = false) {
    setSalvando(true)
    setMensagem(null)
    const { data, error } = await salvarHistoricoEnfermagem({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        coleta_dados: [d.procedencia, d.meio_chegada].filter(Boolean),
        motivo_hospitalizacao: d.motivo || null,
        alergia: d.alergia, alergia_quais: d.alergia ? (d.alergia_quais || null) : null,
        info_complementares: {
          procedencia: d.procedencia, acompanhante: d.acompanhante, meio_chegada: d.meio_chegada,
          antecedentes: d.antecedentes, antecedentes_outros: d.antecedentes_outros, intervencoes: d.intervencoes,
        },
        outros_info: d.antecedentes_outros || null,
        medicamentos_uso: d.medicamentos_uso.filter((m) => m.nome.trim()),
        exame_fisico: { ...d.exame, v: 2 },
        parecer_estado_emocional: null, parecer_estado_cognitivo: null,
        parecer_obs: d.observacoes || null,
      },
    })
    setSalvando(false)
    if (error) { console.error(error); setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar a admissão. Tente de novo.' }); return }
    setMensagem({ tipo: 'ok', texto: 'Admissão de enfermagem salva.' })
    if (imprimir && data) onImprimir({ ...data, _variante: 'projeto' })
  }

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  const secao = (s, conteudo, nav) => visivel(s.chave) && (
    <div key={s.chave} className="form-section-box">
      <div className="form-section-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><i className={'ph ' + s.icon} /> {s.titulo}</span>
        <button type="button" className="btn-add-chip" onClick={() => toggle(s.chave)}>
          <i className={'ph ph-caret-' + (aberta(s.chave) ? 'up' : 'down')} /> {aberta(s.chave) ? 'Recolher' : 'Expandir'}
        </button>
      </div>
      {aberta(s.chave) && (
        <>
          {conteudo}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <span>{nav.voltar && <button type="button" className="btn-add-chip" onClick={() => irPara(nav.voltar[0])}><i className="ph ph-arrow-left" /> Voltar: {nav.voltar[1]}</button>}</span>
            <span>{nav.avancar && <button type="button" className="btn-save-draft" onClick={() => irPara(nav.avancar[0])}>Avançar para {nav.avancar[1]} <i className="ph ph-arrow-right" /></button>}</span>
          </div>
        </>
      )}
    </div>
  )

  const escalaMaisRecente = (tipo) => escalas.find((e) => (e.tipo || '').toLowerCase().includes(tipo))
  const braden = escalaMaisRecente('braden')
  const morse = escalaMaisRecente('morse')

  return (
    <div className="clinical-split">
      {painelAberto && (
        <aside className="tools-pane">
          <div className="pane-header"><span><i className="ph ph-shield-check" /> Escalas e Protocolos</span></div>
          <div className="tools-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
            <div className="adm-side-card">
              <div className="adm-side-title"><i className="ph ph-shield-warning" /> Segurança</div>
              {[['Escala de Braden', braden], ['Escala de Morse (Queda)', morse]].map(([rotulo, e]) => (
                <div key={rotulo} className="adm-side-item">
                  <strong>{rotulo}</strong>
                  {e ? <span className="adm-side-badge">Score {e.pontuacao}{e.nivel_risco ? ` (${e.nivel_risco})` : ''}</span> : <span className="adm-side-vazio">Não avaliada</span>}
                  {e?.observacoes && <p>{e.observacoes}</p>}
                </div>
              ))}
            </div>
            <div className="adm-side-card">
              <div className="adm-side-title"><i className="ph ph-plugs" /> Dispositivos Invasivos</div>
              {dispositivos.length === 0 ? <span className="adm-side-vazio">Nenhum registrado.</span> : dispositivos.map((x) => (
                <div key={x.id} className="adm-side-item">
                  <strong>{x.tipo}{x.local_insercao ? ` ${x.local_insercao}` : ''}</strong>
                  {x.inserido_em && <span className="adm-side-vazio">Inserção: {new Date(x.inserido_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              ))}
            </div>
            <div className="adm-side-card adm-side-alerta">
              <div className="adm-side-title"><i className="ph ph-warning-octagon" /> Alergias e Restrições</div>
              {alergias.length === 0 ? <span className="adm-side-vazio">Nenhuma registrada.</span> : alergias.map((a) => (
                <div key={a.id} className="adm-side-item"><strong>{a.substancia}</strong>{a.reacao ? `: ${a.reacao}` : a.gravidade ? ` — ${a.gravidade}` : ''}</div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-clipboard-text" /> Admissão de Enfermagem</h2>
            <p>Instrumento de sistematização SAE baseado no modelo oficial da UPA 24h Breves.</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" className="btn-add-chip" onClick={recolherTodos}><i className="ph ph-arrows-in-line-vertical" /> Recolher Todos</button>
            <button type="button" className="btn-add-chip" onClick={() => setPainelAberto((v) => !v)}><i className="ph ph-sidebar" /> {painelAberto ? 'Recolher Painel' : 'Mostrar Painel'}</button>
          </div>
          <div className="doc-subtabs">
            <button type="button" className={'doc-tab' + (filtro === 'todas' ? ' active' : '')} onClick={() => setFiltro('todas')}><i className="ph ph-list" /> Ficha Completa (Todas)</button>
            {SECOES.map((s) => (
              <button key={s.chave} type="button" className={'doc-tab' + (filtro === s.chave ? ' active' : '')} onClick={() => irPara(s.chave)}>
                {s.rotuloCurto || s.titulo}
              </button>
            ))}
          </div>
        </div>

        <div className="cc-body">
          {secao(SECOES[0], (
            <>
              <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="form-group"><label><i className="ph ph-map-pin" /> Procedência</label><Select opcoes={PROCEDENCIAS} valor={d.procedencia} onChange={(v) => set('procedencia', v)} /></div>
                <div className="form-group"><label><i className="ph ph-users" /> Acompanhante Presente</label><input type="text" placeholder="Ex: Sim (Filha: Ana)" value={d.acompanhante} onChange={(e) => set('acompanhante', e.target.value)} /></div>
                <div className="form-group"><label><i className="ph ph-wheelchair" /> Meio de Chegada</label><Select opcoes={MEIOS_CHEGADA} valor={d.meio_chegada} onChange={(v) => set('meio_chegada', v)} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Motivo da Admissão / Queixa Principal (informada pelo paciente/familiar)</label>
                <textarea className="form-control-area" rows="3" value={d.motivo} onChange={(e) => set('motivo', e.target.value)} />
              </div>
            </>
          ), { avancar: ['antecedentes', 'Antecedentes'] })}

          {secao(SECOES[1], (
            <>
              <Checks opcoes={ANTECEDENTES} valor={d.antecedentes} onChange={(v) => set('antecedentes', v)} />
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Cirurgias prévias / outros antecedentes</label>
                <input type="text" value={d.antecedentes_outros} onChange={(e) => set('antecedentes_outros', e.target.value)} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className={'adm-check' + (d.alergia ? ' on alerta' : '')} style={{ display: 'inline-flex' }}>
                  <input type="checkbox" checked={d.alergia} onChange={(e) => set('alergia', e.target.checked)} /> Possui Alergias?
                </label>
              </div>
              {d.alergia && (
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label>Especificar Alergias Conhecidas (Medicamentos, Alimentos, Látex):</label>
                  <input type="text" value={d.alergia_quais} onChange={(e) => set('alergia_quais', e.target.value)} />
                </div>
              )}
              <div className="form-group" style={{ marginTop: 14 }}>
                <label><i className="ph ph-pill" /> Medicamentos em Uso Domiciliar</label>
                {d.medicamentos_uso.map((m, i) => (
                  <div key={i} className="assess-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginTop: i ? 6 : 0 }}>
                    <input type="text" placeholder="Medicamento" value={m.nome} onChange={(e) => setMed(i, 'nome', e.target.value)} />
                    <input type="text" placeholder="Via" value={m.via} onChange={(e) => setMed(i, 'via', e.target.value)} />
                    <input type="text" placeholder="Dose / posologia" value={m.dose} onChange={(e) => setMed(i, 'dose', e.target.value)} />
                    <input type="text" placeholder="Tempo de uso" value={m.tempo_uso} onChange={(e) => setMed(i, 'tempo_uso', e.target.value)} />
                    <button type="button" className="btn-cancel" style={{ padding: '6px 10px' }} title="Remover" disabled={d.medicamentos_uso.length === 1}
                      onClick={() => set('medicamentos_uso', d.medicamentos_uso.filter((_, idx) => idx !== i))}><i className="ph ph-trash" /></button>
                  </div>
                ))}
                <div><button type="button" className="btn-add-chip" style={{ marginTop: 8 }} onClick={() => set('medicamentos_uso', [...d.medicamentos_uso, { ...MEDICAMENTO_USO_VAZIO }])}><i className="ph ph-plus" /> Adicionar medicamento</button></div>
              </div>
            </>
          ), { voltar: ['procedencia', 'Procedência'], avancar: ['exame', 'Exame Físico'] })}

          {secao(SECOES[2], (
            <>
              <div className="form-group"><label>Estado Neurológico e Nível de Consciência:</label><Radios nome="adm-neuro" opcoes={NEURO} valor={d.exame.neuro} onChange={(v) => setEx('neuro', v)} /></div>
              <div className="assess-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 12 }}>
                <div className="form-group"><label>Pupilas</label><Select opcoes={PUPILAS} valor={d.exame.pupilas} onChange={(v) => setEx('pupilas', v)} /></div>
                <div className="form-group"><label>Escala de Coma de Glasgow</label><Select opcoes={GLASGOW} valor={d.exame.glasgow} onChange={(v) => setEx('glasgow', v)} /></div>
                <div className="form-group"><label>Padrão Respiratório</label><Select opcoes={RESPIRATORIO} valor={d.exame.respiratorio} onChange={(v) => setEx('respiratorio', v)} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label><i className="ph ph-info" /> Especificar Parâmetros Respiratórios / Suporte O₂:</label>
                <input type="text" placeholder="Ex: Cateter O2 a 2L/min, SatO2 97%..." value={d.exame.respiratorio_obs} onChange={(e) => setEx('respiratorio_obs', e.target.value)} />
              </div>
              <div className="assess-grid" style={{ marginTop: 12 }}>
                <div className="form-group"><label>Abdome</label><Checks opcoes={ABDOME} valor={d.exame.abdome} onChange={(v) => setEx('abdome', v)} /></div>
                <div className="form-group"><label>Eliminações Urinárias</label><Radios nome="adm-urinario" opcoes={URINARIO} valor={d.exame.urinario} onChange={(v) => setEx('urinario', v)} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}><label>Motilidade e Membros:</label><Radios nome="adm-membros" opcoes={MEMBROS} valor={d.exame.membros} onChange={(v) => setEx('membros', v)} /></div>
              {d.exame.membros === MEMBROS[1] && (
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label>Especificar déficit motor e lateralidade:</label>
                  <textarea className="form-control-area" rows="2" value={d.exame.membros_obs} onChange={(e) => setEx('membros_obs', e.target.value)} />
                </div>
              )}
              <div className="form-group" style={{ marginTop: 12 }}><label>Pele e Mucosas:</label><Checks opcoes={PELE} valor={d.exame.pele} onChange={(v) => setEx('pele', v)} /></div>
            </>
          ), { voltar: ['antecedentes', 'Antecedentes'], avancar: ['intervencoes', 'Intervenções'] })}

          {secao(SECOES[3], (
            <>
              <Checks opcoes={INTERVENCOES} valor={d.intervencoes} onChange={(v) => set('intervencoes', v)} />
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Observações Complementares da Admissão</label>
                <textarea className="form-control-area" rows="3" value={d.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
              </div>
            </>
          ), { voltar: ['exame', 'Exame Físico'] })}

          {mensagem && (
            <div className="allergy-alert" style={mensagem.tipo === 'erro' ? { background: '#FEF2F2', borderColor: '#FECACA' } : { background: '#ECFDF5', borderColor: '#A7F3D0' }}>
              <div className="info" style={{ color: mensagem.tipo === 'erro' ? '#DC2626' : '#065F46' }}>
                <i className={'ph ' + (mensagem.tipo === 'erro' ? 'ph-warning' : 'ph-check-circle')} /> {mensagem.texto}
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <button type="button" className="btn-cancel" onClick={onFechar}><i className="ph ph-x-circle" /> Cancelar</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
