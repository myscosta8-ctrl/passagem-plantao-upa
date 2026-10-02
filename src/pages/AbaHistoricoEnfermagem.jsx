import { avisarErro } from '../lib/erros'
import { useEffect, useState } from 'react'
import { buscarHistoricoEnfermagem, salvarHistoricoEnfermagem } from '../lib/pepMedico'
import { listarEscalas, listarDispositivos, listarAlergias } from '../lib/pepClinico'
import AbaAlergias from './ficha-clinica/AbaAlergias'
import AbaDispositivos from './ficha-clinica/AbaDispositivos'
import AbaEscalas from './ficha-clinica/AbaEscalas'
import CampoDataRegistro from '../components/CampoDataRegistro'
import { metaDoc } from '../lib/documentos'
import { descartarRascunho } from '../lib/documentos'

// ===================== Admissão de Enfermagem (SAE) =====================
// Tela conforme mockups-fase2/08-admissao-enfermagem-design.html; o impresso é
// modelos_impressao_html/01-admissao-enfermagem.html (CorpoHistoricoEnfermagemProjeto).
// Sem migration: os campos novos ficam nas colunas jsonb já existentes de
// historico_enfermagem (info_complementares, exame_fisico — marcado com v: 2).

const SECOES = [
  { chave: 'procedencia', titulo: 'Procedência e Acolhimento', icon: 'ph-ambulance' },
  { chave: 'antecedentes', titulo: 'Antecedentes e Condições Crônicas', rotuloCurto: 'Antecedentes e Riscos', icon: 'ph-clipboard-text' },
  { chave: 'exame', titulo: 'Exame Físico Céfalo-Podálico', icon: 'ph-person' },
  { chave: 'intervencoes', titulo: 'Intervenções Iniciais de Enfermagem', rotuloCurto: 'Intervenções Iniciais', icon: 'ph-first-aid-kit' },
]

const PROCEDENCIAS = ['Demanda Espontânea', 'SAMU 192', 'Resgate Corpo de Bombeiros', 'Transferência Hospitalar']
const MEIOS_CHEGADA = ['Deambulando', 'Cadeira de Rodas', 'Maca']
const ANTECEDENTES = ['Hipertensão Arterial (HAS)', 'Diabetes Mellitus (DM)', 'Cardiopatia / IAM prévio', 'AVE / AVC prévio', 'Insuficiência Renal', 'Tabagismo', 'Etilismo']
const NEURO = ['Consciente / Lúcido', 'Sonolento', 'Torporoso', 'Comatoso', 'Agitado / Confuso']
const PUPILAS = ['Isocóricas e fotorreagentes', 'Anisocóricas (D > E)', 'Anisocóricas (E > D)', 'Midriáticas', 'Mióticas']
const GLASGOW = ['15 (AO: 4, MRV: 5, MRM: 6)', '14 (AO: 4, MRV: 4, MRM: 6)', '13 a 11 (Moderado)', '< 9 (Grave - IOT)']
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

// Converte o registro salvo em historico_enfermagem de volta para o estado do formulário
// (inverso do que salvar() grava).
function deBanco(h) {
  const ic = h.info_complementares || {}
  const ex = h.exame_fisico && h.exame_fisico.v === 2 ? h.exame_fisico : {}
  const meds = Array.isArray(h.medicamentos_uso) && h.medicamentos_uso.length ? h.medicamentos_uso.map((m) => ({ ...MEDICAMENTO_USO_VAZIO, ...m })) : [{ ...MEDICAMENTO_USO_VAZIO }]
  return {
    ...VAZIO,
    procedencia: ic.procedencia || h.procedencia || '',
    acompanhante: ic.acompanhante || '',
    meio_chegada: ic.meio_chegada || '',
    motivo: h.motivo_hospitalizacao || '',
    antecedentes: Array.isArray(ic.antecedentes) ? ic.antecedentes : [],
    antecedentes_outros: ic.antecedentes_outros || h.outros_info || '',
    alergia: !!h.alergia,
    alergia_quais: h.alergia_quais || '',
    medicamentos_uso: meds,
    exame: { ...EXAME_VAZIO, ...ex },
    intervencoes: Array.isArray(ic.intervencoes) ? ic.intervencoes : [],
    observacoes: h.parecer_obs || '',
  }
}

function Checks({ opcoes, valor, onChange, icones = {} }) {
  const sel = valor || []
  const toggle = (op) => onChange(sel.includes(op) ? sel.filter((x) => x !== op) : [...sel, op])
  return (
    <div className="check-row">
      {opcoes.map((op) => (
        <label key={op} className={'check-item' + (sel.includes(op) ? ' active' : '')}>
          <input type="checkbox" checked={sel.includes(op)} onChange={() => toggle(op)} />
          {icones[op] && <i className={'ph ' + icones[op]} style={{ color: icones[op].includes('warning') ? 'var(--danger)' : 'var(--enf-primary)' }} />}
          {op}
        </label>
      ))}
    </div>
  )
}

function Radios({ nome, opcoes, valor, onChange, alerta = [] }) {
  return (
    <div className="check-row">
      {opcoes.map((op) => (
        <label key={op} className={'check-item' + (valor === op ? ' active' : '') + (alerta.includes(op) ? ' alerta' : '')}>
          <input type="radio" name={nome} checked={valor === op} onChange={() => onChange(op)} />
          {alerta.includes(op) ? <strong>{op}</strong> : op}
        </label>
      ))}
    </div>
  )
}

function Select({ opcoes, valor, onChange }) {
  return (
    <select className="enf-control" value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecione...</option>
      {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

// Classifica o risco pelo texto de nivel_risco/classificacao_risco da escala.
function classeRisco(e) {
  const t = String(e?.nivel_risco || e?.classificacao_risco || '').toLowerCase()
  if (!t) return 'sem-dado'
  if (t.includes('alto') || t.includes('grave') || t.includes('elevado')) return 'risco-alto'
  if (t.includes('moder') || t.includes('médio') || t.includes('medio')) return 'risco-medio'
  return 'risco-baixo'
}

const ICONES_INTERV = {
  'Acesso Venoso Periférico Calibroso': 'ph-needle', 'Monitorização Cardíaca Contínua': 'ph-heartbeat', 'Oximetria de Pulso Contínua': 'ph-wave-sine',
  'HGT Admissional': 'ph-drop', 'Manter Cabeceira Elevada a 30°': 'ph-bed', 'Grades de Segurança Elevadas': 'ph-shield-check', 'Identificação Alérgica no Leito': 'ph-warning-circle',
}
const SECAO_ICONE = { procedencia: 'ph-user-circle', antecedentes: 'ph-heartbeat', exame: 'ph-activity', intervencoes: 'ph-check-square' }

export default function AbaHistoricoEnfermagem({ atendimento, medicoId, onImprimir, onFechar }) {
  const [d, setD] = useState(VAZIO)
  const [salvo, setSalvo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const [filtro, setFiltro] = useState('procedencia')
  const [recolhidas, setRecolhidas] = useState(() => new Set())
  const [painelAberto] = useState(false) // escalas/dispositivos/alergias agora têm aba própria no topo
  const [gerenciar, setGerenciar] = useState(null) // 'alergias' | 'dispositivos' | 'escalas'
  const [escalas, setEscalas] = useState([])
  const [dispositivos, setDispositivos] = useState([])
  const [alergias, setAlergias] = useState([])

  function carregarApoio() {
    listarEscalas(atendimento.atendimento_id).then(setEscalas)
    listarDispositivos(atendimento.atendimento_id).then(setDispositivos)
    if (atendimento.pessoa_id) listarAlergias(atendimento.pessoa_id).then(setAlergias)
  }

  useEffect(() => {
    buscarHistoricoEnfermagem(atendimento.atendimento_id).then((h) => {
      if (h) { setD(deBanco(h)); setSalvo(h) }
      setCarregando(false)
    })
    carregarApoio()
  }, [atendimento.atendimento_id])

  const set = (campo, valor) => setD((p) => ({ ...p, [campo]: valor }))
  const setEx = (campo, valor) => setD((p) => ({ ...p, exame: { ...p.exame, [campo]: valor } }))
  const setMed = (i, campo, valor) => setD((p) => ({ ...p, medicamentos_uso: p.medicamentos_uso.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)) }))

  const visivel = (c) => filtro === 'todas' || filtro === c
  const recolhida = (c) => recolhidas.has(c)
  const toggle = (c) => setRecolhidas((prev) => { const n = new Set(prev); if (n.has(c)) n.delete(c); else n.add(c); return n })
      const irPara = (c) => { setFiltro(c); setRecolhidas(new Set()) }

  async function salvar(imprimir = false) {
    setSalvando(true)
    setMensagem(null)
    const { data, error } = await salvarHistoricoEnfermagem({
      situacao: metaDoc(imprimir, dataRegistro),
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        coleta_dados: [d.procedencia, d.meio_chegada].filter(Boolean),
        procedencia: d.procedencia || null,
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
    if (error) { console.error(error); setMensagem({ tipo: 'erro', texto: error.message?.includes('finalizado') ? error.message : 'Não foi possível salvar a admissão. Tente de novo.' }); return }
    setSalvo(data)
    setMensagem({ tipo: 'ok', texto: imprimir ? 'Admissão de enfermagem finalizada.' : 'Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.' })
    if (imprimir && data) onImprimir({ ...data, _variante: 'projeto' })
  }

  if (carregando) return <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>

  // Telas de cadastro de alergias / dispositivos / escalas abrem no lugar do formulário.
  if (gerenciar) {
    const Tela = { alergias: AbaAlergias, dispositivos: AbaDispositivos, escalas: AbaEscalas }[gerenciar]
    const voltar = () => { setGerenciar(null); carregarApoio() }
    return (
      <div className="admissao-card" style={{ flex: 1 }}>
        <div className="ac-header">
          <div className="ac-title"><h2><i className="ph ph-clipboard-text" /> Admissão de Enfermagem</h2></div>
          <button type="button" className="btn-toggle-sidebar" onClick={voltar}><i className="ph ph-arrow-left" /> Voltar para a Admissão</button>
        </div>
        <div className="ac-body"><Tela atendimento={atendimento} autorId={medicoId} onFechar={voltar} /></div>
      </div>
    )
  }

  const secao = (s, conteudo, nav) => visivel(s.chave) && (
    <section key={s.chave} className={'adm-section' + (recolhida(s.chave) ? ' collapsed' : '')}>
      <div className="adm-section-header" onClick={() => toggle(s.chave)} title="Clique para expandir ou recolher esta seção">
        <div className="sh-left bloco-num"><i className={'ph ' + SECAO_ICONE[s.chave]} /><span>{s.titulo}</span></div>
        <div className="sh-right"><span>{recolhida(s.chave) ? 'Expandir' : 'Recolher'}</span><i className="ph ph-caret-down" /></div>
      </div>
      {!recolhida(s.chave) && (
        <div className="adm-section-body">
          {conteudo}
          <div className="adm-nav" style={{ justifyContent: nav.voltar && nav.avancar ? 'space-between' : nav.avancar ? 'flex-end' : 'flex-start' }}>
            {nav.voltar && <button type="button" className="btn-toggle-sidebar" onClick={() => irPara(nav.voltar[0])}><i className="ph ph-arrow-left" /> Voltar: {nav.voltar[1]}</button>}
            {nav.avancar && <button type="button" className="btn-toggle-sidebar enf" onClick={() => irPara(nav.avancar[0])}>Avançar para {nav.avancar[1]} <i className="ph ph-arrow-right" /></button>}
          </div>
        </div>
      )}
    </section>
  )

  const escalaMaisRecente = (tipo) => escalas.find((e) => (e.tipo || '').toLowerCase().includes(tipo))
  const respCondicional = /Oxigenoterapia|Traqueostomizado/.test(d.exame.respiratorio) || !!d.exame.respiratorio_obs

  return (
    <div className="adm-split">
      {painelAberto && (
        <aside className="quick-sidebar">
          <div className="qs-header">
            <span><i className="ph ph-gauge" /> Escalas e Protocolos</span>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Segurança</span>
          </div>
          <div className="qs-body">
            {[['braden', 'Escala de Braden'], ['morse', 'Escala de Morse (Queda)']].map(([tipo, rotulo]) => {
              const e = escalaMaisRecente(tipo)
              const score = e?.pontuacao ?? e?.escore_total
              const nivel = e?.nivel_risco || e?.classificacao_risco
              return (
                <div key={tipo} className="scale-card">
                  <div className="scale-title">
                    <span>{rotulo}</span>
                    <span className={'scale-badge ' + classeRisco(e)}>{e ? `Score ${score ?? '—'}${nivel ? ` (${nivel})` : ''}` : 'Não avaliada'}</span>
                  </div>
                  {e?.avaliado_em && <p className="scale-desc">Avaliada em {new Date(e.avaliado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
              )
            })}
            <button type="button" className="qs-gerenciar" style={{ alignSelf: 'flex-end', marginTop: -6 }} onClick={() => setGerenciar('escalas')}>+ Avaliar escalas</button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="qs-label">
                <span><i className="ph ph-needle" style={{ color: 'var(--enf-primary)', fontSize: 15 }} /> Dispositivos Invasivos</span>
                <button type="button" className="qs-gerenciar" onClick={() => setGerenciar('dispositivos')}>Gerenciar</button>
              </div>
              {dispositivos.filter((x) => !x.removido_em).length === 0 ? <span className="qs-vazio">Nenhum registrado.</span> : dispositivos.filter((x) => !x.removido_em).map((x) => (
                <div key={x.id} className="device-item">
                  <div>
                    <strong>{[x.tipo, x.local_insercao || x.localizacao, x.calibre && `(${x.calibre})`].filter(Boolean).join(' ')}</strong><br />
                    <span className="sub">Inserção: {new Date(x.inserido_em || x.instalado_em || x.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {x.status && <span className="scale-badge risco-baixo">{x.status}</span>}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="qs-label">
                <span><i className="ph ph-shield-warning" style={{ color: 'var(--danger)', fontSize: 15 }} /> Alergias e Restrições</span>
                <button type="button" className="qs-gerenciar" onClick={() => setGerenciar('alergias')}>Gerenciar</button>
              </div>
              {alergias.falhou && alergias.length === 0 ? <span className="qs-vazio" style={{ color: '#B91C1C' }}>Não foi possível carregar (falha de conexão).</span> : alergias.length === 0 ? <span className="qs-vazio">Nenhuma registrada.</span> : alergias.map((a) => (
                <div key={a.id} className="alergia-box"><strong>{String(a.substancia || '').toUpperCase()}</strong>{a.reacao ? `: ${a.reacao}` : a.gravidade ? ` — ${a.gravidade}` : ''}</div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <div className="admissao-card">
        <div className="ac-header">
          <div className="ac-title">
            <h2><i className="ph ph-clipboard-text" /> Admissão de Enfermagem</h2>
            
          </div>
          <div className="ac-actions">
              <button type="button" className="btn-toggle-sidebar" disabled={!salvo} title={salvo ? '' : 'Salve a admissão para visualizar o impresso'} onClick={() => salvo && onImprimir({ ...salvo, _variante: 'projeto' })}>
              <i className="ph ph-printer" /> Visualizar Impresso Oficial
            </button>
          </div>
        </div>

        <div className="adm-subtabs">
          
          {SECOES.map((s) => (
            <button key={s.chave} type="button" className={'adm-tab' + (filtro === s.chave ? ' active' : '')} onClick={() => irPara(s.chave)}>
              <i className={'ph ' + SECAO_ICONE[s.chave]} /> {s.rotuloCurto || s.titulo}
            </button>
          ))}
        </div>

        <div className="ac-body">
          {secao(SECOES[0], (
            <>
              <div className="grid-3">
                <div className="enf-group"><label><i className="ph ph-map-pin" /> Procedência</label><Select opcoes={PROCEDENCIAS} valor={d.procedencia} onChange={(v) => set('procedencia', v)} /></div>
                <div className="enf-group"><label><i className="ph ph-users" /> Acompanhante Presente</label><input className="enf-control" type="text" placeholder="Ex: Sim (Filha: Ana Pereira)" value={d.acompanhante} onChange={(e) => set('acompanhante', e.target.value)} /></div>
                <div className="enf-group"><label><i className="ph ph-wheelchair" /> Meio de Chegada</label><Select opcoes={MEIOS_CHEGADA} valor={d.meio_chegada} onChange={(v) => set('meio_chegada', v)} /></div>
              </div>
              <div className="enf-group">
                <label><i className="ph ph-chats-circle" /> Motivo da Admissão / Queixa Principal (Informada pelo paciente/familiar)</label>
                <textarea className="enf-control" rows="2" placeholder="Descreva a queixa admissional e tempo de início dos sintomas..." value={d.motivo} onChange={(e) => set('motivo', e.target.value)} />
              </div>
            </>
          ), { avancar: ['antecedentes', 'Antecedentes'] })}

          {secao(SECOES[1], (
            <>
              <div className="check-row">
                {ANTECEDENTES.map((op) => {
                  const on = d.antecedentes.includes(op)
                  return (
                    <label key={op} className={'check-item' + (on ? ' active' : '')}>
                      <input type="checkbox" checked={on} onChange={() => set('antecedentes', on ? d.antecedentes.filter((x) => x !== op) : [...d.antecedentes, op])} />
                      {on && <i className="ph ph-check-circle" style={{ color: 'var(--enf-primary)' }} />} {op}
                    </label>
                  )
                })}
                <label className="check-item alerta">
                  <input type="checkbox" checked={d.alergia} onChange={(e) => set('alergia', e.target.checked)} /> <strong><i className="ph ph-warning" /> Possui Alergias?</strong>
                </label>
              </div>
              {d.alergia && (
                <div className="condicional-box">
                  <label><i className="ph ph-warning-octagon" /> Especificar Alergias Conhecidas (Medicamentos, Alimentos, Látex):</label>
                  <input className="enf-control" type="text" value={d.alergia_quais} onChange={(e) => set('alergia_quais', e.target.value)} />
                </div>
              )}
              <div className="enf-group">
                <label><i className="ph ph-scissors" /> Cirurgias Prévias / Outros Antecedentes</label>
                <input className="enf-control" type="text" value={d.antecedentes_outros} onChange={(e) => set('antecedentes_outros', e.target.value)} />
              </div>
              <div className="enf-group">
                <label><i className="ph ph-pill" /> Medicamentos em Uso Domiciliar</label>
                {d.medicamentos_uso.map((m, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr auto', gap: 8 }}>
                    <input className="enf-control" type="text" placeholder="Medicamento" value={m.nome} onChange={(e) => setMed(i, 'nome', e.target.value)} />
                    <input className="enf-control" type="text" placeholder="Via" value={m.via} onChange={(e) => setMed(i, 'via', e.target.value)} />
                    <input className="enf-control" type="text" placeholder="Dose / posologia" value={m.dose} onChange={(e) => setMed(i, 'dose', e.target.value)} />
                    <input className="enf-control" type="text" placeholder="Tempo de uso" value={m.tempo_uso} onChange={(e) => setMed(i, 'tempo_uso', e.target.value)} />
                    <button type="button" className="btn-toggle-sidebar" title="Remover" disabled={d.medicamentos_uso.length === 1}
                      onClick={() => set('medicamentos_uso', d.medicamentos_uso.filter((_, idx) => idx !== i))}><i className="ph ph-trash" /></button>
                  </div>
                ))}
                <div><button type="button" className="btn-toggle-sidebar enf" onClick={() => set('medicamentos_uso', [...d.medicamentos_uso, { ...MEDICAMENTO_USO_VAZIO }])}><i className="ph ph-plus" /> Adicionar medicamento</button></div>
              </div>
            </>
          ), { voltar: ['procedencia', 'Procedência'], avancar: ['exame', 'Exame Físico'] })}

          {secao(SECOES[2], (
            <>
              <div>
                <label className="enf-label forte"><i className="ph ph-brain" style={{ fontSize: 15 }} /> Estado Neurológico e Nível de Consciência:</label>
                <Radios nome="adm-neuro" opcoes={NEURO} valor={d.exame.neuro} onChange={(v) => setEx('neuro', v)} />
              </div>
              <div className="grid-3">
                <div className="enf-group"><label><i className="ph ph-eye" /> Pupilas</label><Select opcoes={PUPILAS} valor={d.exame.pupilas} onChange={(v) => setEx('pupilas', v)} /></div>
                <div className="enf-group"><label><i className="ph ph-gauge" /> Escala de Coma de Glasgow</label><Select opcoes={GLASGOW} valor={d.exame.glasgow} onChange={(v) => setEx('glasgow', v)} /></div>
                <div className="enf-group"><label><i className="ph ph-lungs" /> Padrão Respiratório</label><Select opcoes={RESPIRATORIO} valor={d.exame.respiratorio} onChange={(v) => setEx('respiratorio', v)} /></div>
              </div>
              {respCondicional && (
                <div className="condicional-box">
                  <label><i className="ph ph-info" /> Especificar Parâmetros Respiratórios / Suporte O₂:</label>
                  <input className="enf-control" type="text" placeholder="Ex: Cateter O2 a 2L/min, SpO₂ 97%..." value={d.exame.respiratorio_obs} onChange={(e) => setEx('respiratorio_obs', e.target.value)} />
                </div>
              )}
              <div className="grid-2">
                <div className="enf-group"><label><i className="ph ph-shield" /> Abdome</label><Checks opcoes={ABDOME} valor={d.exame.abdome} onChange={(v) => setEx('abdome', v)} /></div>
                <div className="enf-group"><label><i className="ph ph-drop" /> Eliminações Urinárias</label><Radios nome="adm-urinario" opcoes={URINARIO} valor={d.exame.urinario} onChange={(v) => setEx('urinario', v)} /></div>
              </div>
              <div>
                <label className="enf-label forte"><i className="ph ph-person-simple-walk" style={{ fontSize: 15 }} /> Motilidade e Membros:</label>
                <Radios nome="adm-membros" opcoes={MEMBROS} valor={d.exame.membros} onChange={(v) => setEx('membros', v)} alerta={[MEMBROS[1]]} />
                {d.exame.membros === MEMBROS[1] && (
                  <div className="condicional-box">
                    <label><i className="ph ph-warning" /> Especificar déficit motor e lateralidade:</label>
                    <textarea className="enf-control" rows="2" value={d.exame.membros_obs} onChange={(e) => setEx('membros_obs', e.target.value)} />
                  </div>
                )}
              </div>
              <div>
                <label className="enf-label forte"><i className="ph ph-hand-heart" style={{ fontSize: 15 }} /> Pele e Mucosas:</label>
                <Checks opcoes={PELE} valor={d.exame.pele} onChange={(v) => setEx('pele', v)} />
              </div>
            </>
          ), { voltar: ['antecedentes', 'Antecedentes'], avancar: ['intervencoes', 'Intervenções'] })}

          {secao(SECOES[3], (
            <>
              <Checks opcoes={INTERVENCOES} valor={d.intervencoes} onChange={(v) => set('intervencoes', v)} icones={ICONES_INTERV} />
              <div className="enf-group">
                <label><i className="ph ph-note-pencil" /> Observações Complementares da Admissão</label>
                <textarea className="enf-control" rows="3" value={d.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
              </div>
            </>
          ), { voltar: ['exame', 'Exame Físico'] })}

          {mensagem && (
            <div className="condicional-box" style={mensagem.tipo === 'erro' ? { background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' } : undefined}>
              <span style={{ fontSize: 12, fontWeight: 600 }}><i className={'ph ' + (mensagem.tipo === 'erro' ? 'ph-warning' : 'ph-check-circle')} /> {mensagem.texto}</span>
            </div>
          )}
        </div>

        <div className="ac-footer">
          <button type="button" className="btn-cancel" onClick={async () => { if (salvo?.situacao === 'rascunho') { if (!window.confirm('Cancelar descarta este rascunho em definitivo. Deseja continuar?')) return; const { error } = await descartarRascunho('historico_enfermagem', salvo.id); if (error) { avisarErro('Histórico de enfermagem', error); return } } onFechar?.() }}><i className="ph ph-x-circle" /> Cancelar</button>
          <div style={{ display: 'flex', gap: 12 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
