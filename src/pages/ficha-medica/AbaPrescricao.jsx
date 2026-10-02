import { useEffect, useState } from 'react';
import { listarPrescricoes, criarPrescricao, listarCatalogoMedicamentos } from '../../lib/pepMedico';
import { VIAS, UNIDADES_DOSE, FREQUENCIAS, FREQUENCIAS_CUIDADOS, CONDICOES_USO, DILUENTES, TEMPOS_INFUSAO, exigeAtm, dosesPorDia, atmCobre, textoValidadeAtm } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'
import BotaoInvalidar, { SeloSituacao } from '../../components/InvalidarDocumento';
import { quantidadeDia, APRESENTACOES, apresentacaoDaForma } from '../../lib/frequencia'
import { hojeBelem, somarDias, textoValidade } from '../../lib/prescricaoValidade';
import { filtrarCatalogo, rotuloMedicamento, descricaoMedicamento, detalheMedicamento, ehControlado } from '../../lib/catalogoMedicamentos';
import { precisaAtm, itensControlados } from '../../lib/documentosVinculados';


function AutocompleteMedicamento({ catalogo, valor, onChange, onSelecionar, placeholder }) {
  const [aberto, setAberto] = useState(false)
  const sugestoes = filtrarCatalogo(catalogo, valor)

  return (
    <div className="autocomplete-wrap">
      <input
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setAberto(true) }}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        autoComplete="off"
      />
      {aberto && sugestoes.length > 0 && (
        <div className="autocomplete-lista">
          {sugestoes.map((m) => (
            <button
              key={m.id}
              type="button"
              className="autocomplete-item"
              onMouseDown={(e) => { e.preventDefault(); onSelecionar(m); setAberto(false) }}
            >
              <span className="autocomplete-item-nome">{descricaoMedicamento(m)}</span>
              <span className="autocomplete-item-sub">{detalheMedicamento(m)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ITEM_VAZIO = { medicamento_nome: '', dose: '', dose_unidade: 'mg', via: 'VO', frequencia: '', duracao: '', instrucoes: '', condicao: '', diluente: '', diluente_ml: '', tempo_infusao: '', apresentacao: '', qtd_por_dose: '1' }

// Monta o texto de diluição a partir dos campos guiados (ex.: "Diluir em 100 mL de SF 0,9% — Em 30 min").
function textoDiluicao(it) {
  const partes = []
  if (it.diluente) partes.push(`Diluir em ${it.diluente_ml ? `${it.diluente_ml} mL de ` : ''}${it.diluente}`)
  if (it.tempo_infusao) partes.push(it.tempo_infusao)
  return partes.join(' — ')
}

// Só as colunas de prescricao_itens; a condição (SN/ACM/se dor...) vai em observacoes.
function itemParaBanco(it) {
  return {
    medicamento_nome: it.medicamento_nome.trim(),
    dose: it.dose ? Number(String(it.dose).replace(',', '.')) : null,
    dose_unidade: it.dose ? it.dose_unidade : null,
    via: it.via || null,
    frequencia: it.frequencia || null,
    duracao: it.duracao || null,
    diluicao: textoDiluicao(it) || null,
    velocidade_infusao: it.tempo_infusao || null,
    instrucoes: it.instrucoes || null,
    sn_aplic: !!it.condicao,
    observacoes: it.condicao || null,
    apresentacao: it.apresentacao || null,
    qtd_por_dose: it.qtd_por_dose ? Number(String(it.qtd_por_dose).replace(',', '.')) || 1 : 1,
  }
}
const ORIENTACAO_VAZIA = { texto: '', frequencia: '' }
const HEMO_OPCOES_RAPIDAS = [
  { chave: 'hemacias', label: 'Concentrado de Hemácias', icon: 'ph-drop' },
  { chave: 'plasma', label: 'Plasma Fresco Congelado', icon: 'ph-flask' },
  { chave: 'plaquetas', label: 'Concentrado de Plaquetas', icon: 'ph-circle-dashed' },
  { chave: 'crio', label: 'Crioprecipitado', icon: 'ph-snowflake' },
]
const CALC_VAZIA = { pesoKg: '', doseAlvoMgKg: '', apresentacaoMg: '', diluenteMl: '', soroMl: '', tipoDose: 'dose', frequencia: '', arredondar: '' }
// Arredondamento da dose por tomada, a critério médico.
const ARREDONDAMENTOS = [
  { v: '', r: 'Sem arredondar' },
  { v: '0.1', r: '1 casa decimal (0,1 mg)' },
  { v: '0.5', r: 'Múltiplo de 0,5 mg' },
  { v: '1', r: 'Número inteiro (1 mg)' },
  { v: '5', r: 'Múltiplo de 5 mg' },
  { v: '10', r: 'Múltiplo de 10 mg' },
]
const FREQ_CALC = ['1/1h', '2/2h', '3/3h', '4/4h', '6/6h', '8/8h', '12/12h', '24/24h']

// Aceita vírgula ou ponto como decimal ("12,5" ou "12.5").
const numBR = (v) => { const n = parseFloat(String(v ?? '').trim().replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : 0 }
// Mesma conta na tela da calculadora e no "Aplicar".
function calcularDosePediatrica(calc, pacientePeso) {
  const pesoKg = numBR(calc.pesoKg) || numBR(pacientePeso)
  const doseAlvoMgKg = numBR(calc.doseAlvoMgKg)
  const apresentacaoMg = numBR(calc.apresentacaoMg)
  const diluenteMl = numBR(calc.diluenteMl)
  const soroMl = numBR(calc.soroMl)
  // Dose alvo por tomada (mg/kg/dose) ou diária (mg/kg/dia ÷ nº de doses do horário escolhido: 6/6h → ÷ 4).
  const porDia = calc.tipoDose === 'dia'
  const dosesDia = porDia ? (dosesPorDia(calc.frequencia) || 0) : 1
  const doseDiariaMg = porDia && pesoKg && doseAlvoMgKg ? pesoKg * doseAlvoMgKg : 0
  const doseCalculadaMg = pesoKg && doseAlvoMgKg ? (porDia ? (dosesDia ? doseDiariaMg / dosesDia : 0) : pesoKg * doseAlvoMgKg) : 0
  const passo = numBR(calc.arredondar)
  const doseTotalMg = doseCalculadaMg && passo ? Math.max(passo, Math.round(doseCalculadaMg / passo) * passo) : doseCalculadaMg
  const concentracaoMgMl = apresentacaoMg && diluenteMl ? apresentacaoMg / diluenteMl : 0
  const volumeAspirarMl = doseTotalMg && concentracaoMgMl ? doseTotalMg / concentracaoMgMl : 0
  return { pesoKg, doseAlvoMgKg, apresentacaoMg, diluenteMl, soroMl, doseTotalMg, doseCalculadaMg, doseDiariaMg, dosesDia, porDia, concentracaoMgMl, volumeAspirarMl }
}
const fmtMg = (n) => (Number.isInteger(n) ? String(n) : n >= 10 ? String(Math.round(n * 10) / 10).replace('.', ',') : String(Math.round(n * 100) / 100).replace('.', ','))
const fmtMl = (n) => n.toFixed(1).replace('.', ',')

function CalculadoraDosePediatrica({ item, calc, onChange, onAplicar, onCancelar, pacienteNome, pacientePeso }) {
  const { pesoKg, apresentacaoMg, diluenteMl, soroMl, doseTotalMg, doseCalculadaMg, doseDiariaMg, dosesDia, porDia, concentracaoMgMl, volumeAspirarMl } = calcularDosePediatrica(calc, pacientePeso)
  const faltando = [!pesoKg && 'peso', !numBR(calc.doseAlvoMgKg) && 'dose alvo', porDia && !dosesDia && 'horário de administração', !apresentacaoMg && 'apresentação', !diluenteMl && 'diluente'].filter(Boolean)

  const textoFinal = doseTotalMg && volumeAspirarMl
    ? `${item.medicamento_nome || 'Medicação'} — Diluir em ${diluenteMl} mL (AD/Diluente). Aspirar ${fmtMl(volumeAspirarMl)} mL (${fmtMg(doseTotalMg)} mg)${soroMl ? ` e rediluir em ${soroMl} mL de SF 0,9%` : ''}. ${calc.frequencia ? `Administrar de ${calc.frequencia}.` : 'Administrar conforme via prescrita.'}`
    : ''

  const podeAplicar = doseTotalMg > 0 && volumeAspirarMl > 0

  return (
    <div className="modal-overlay">
      <div className="modal-calc">
        <div className="modal-header">
          <h3><i className="ph ph-calculator"></i> Calculadora Pediátrica Injetável</h3>
          <button type="button" className="modal-close" onClick={onCancelar}><i className="ph ph-x"></i></button>
        </div>
        
        <div className="modal-body">
          <div className="calc-info-bar">
            <div className="calc-info-item">
              <label>Paciente</label>
              <span>{pacienteNome || 'Paciente'}</span>
            </div>
            <div className="calc-info-item" style={{ alignItems: 'flex-end' }}>
              <label>Peso (base de cálculo) *</label>
              <span style={{ fontSize: 18, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input type="text" inputMode="decimal" autoFocus placeholder="ex.: 12,5" aria-label="Peso em kg"
                  style={{ width: 90, border: '2px solid ' + (pesoKg ? '#F5C77E' : '#DC2626'), borderRadius: 6, background: '#fff', textAlign: 'right', fontWeight: 700, color: '#B45309', outline: 'none', padding: '4px 8px', fontSize: 16 }}
                  value={calc.pesoKg !== '' ? calc.pesoKg : (pacientePeso || '')} onChange={(e) => onChange('pesoKg', e.target.value.replace(/[^\d.,]/g, ''))} /> kg
              </span>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-box" style={{ flex: 2 }}>
              <label>Medicação Selecionada</label>
              <input type="text" value={item.medicamento_nome || 'Selecione a medicação'} readOnly style={{ background: '#F8FAFC', fontWeight: 600 }} />
            </div>
            <div className="calc-box" style={{ flex: 1.3 }}>
              <label>Dose Alvo</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" placeholder="ex.: 50" value={calc.doseAlvoMgKg} onChange={(e) => onChange('doseAlvoMgKg', e.target.value.replace(/[^\d.,]/g, ''))} />
                <select value={calc.tipoDose || 'dose'} onChange={(e) => onChange('tipoDose', e.target.value)} style={{ fontSize: 12, fontWeight: 700 }} title="Dose por tomada ou dose diária total">
                  <option value="dose">mg/kg/dose</option>
                  <option value="dia">mg/kg/dia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-box">
              <label>Horário de administração{porDia ? ' *' : ''}</label>
              <select value={calc.frequencia || ''} onChange={(e) => onChange('frequencia', e.target.value)}>
                <option value="">—</option>
                {FREQ_CALC.map((f) => <option key={f} value={f}>{f} ({dosesPorDia(f)}x ao dia)</option>)}
              </select>
            </div>
            <div className="calc-box">
              <label>Arredondar a dose (critério médico)</label>
              <select value={calc.arredondar || ''} onChange={(e) => onChange('arredondar', e.target.value)}>
                {ARREDONDAMENTOS.map((a) => <option key={a.v} value={a.v}>{a.r}</option>)}
              </select>
            </div>
          </div>
          {porDia && doseDiariaMg > 0 && (
            <div style={{ fontSize: 12, color: '#0F766E', fontWeight: 600 }}>
              <i className="ph ph-divide" /> Dose diária {fmtMg(doseDiariaMg)} mg{dosesDia ? ` ÷ ${dosesDia} doses (${calc.frequencia}) = ${fmtMg(doseCalculadaMg)} mg por dose` : ' — escolha o horário de administração para dividir'}
              {doseCalculadaMg > 0 && doseTotalMg !== doseCalculadaMg ? ` → arredondada para ${fmtMg(doseTotalMg)} mg` : ''}
            </div>
          )}
          {!porDia && doseCalculadaMg > 0 && doseTotalMg !== doseCalculadaMg && (
            <div style={{ fontSize: 12, color: '#0F766E', fontWeight: 600 }}><i className="ph ph-arrows-in-line-vertical" /> Dose calculada {fmtMg(doseCalculadaMg)} mg → arredondada para {fmtMg(doseTotalMg)} mg</div>
          )}

          <div className="calc-row">
            <div className="calc-box">
              <label>Apresentação</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" value={calc.apresentacaoMg} onChange={(e) => onChange('apresentacaoMg', e.target.value.replace(/[^\d.,]/g, ''))} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>mg</span>
              </div>
            </div>
            <div className="calc-box">
              <label>Diluente da Ampola</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" value={calc.diluenteMl} onChange={(e) => onChange('diluenteMl', e.target.value.replace(/[^\d.,]/g, ''))} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>mL (AD)</span>
              </div>
            </div>
            <div className="calc-box">
              <label>Soro de Rediluição</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" value={calc.soroMl} onChange={(e) => onChange('soroMl', e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Opcional" />
                <span style={{ fontSize: 12, fontWeight: 700 }}>mL (SF)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="calc-result-highlight" style={{ flex: 1 }}>
              <span>Dose por Administração</span>
              <strong>{doseTotalMg ? `${fmtMg(doseTotalMg)} mg` : '—'}</strong>
            </div>
            <div className="calc-result-highlight" style={{ flex: 1, background: '#FFF1F2', borderColor: '#FECDD3' }}>
              <span style={{ color: '#BE123C' }}>Volume a Aspirar{concentracaoMgMl ? ` (${fmtMg(concentracaoMgMl)} mg/mL)` : ''}</span>
              <strong style={{ color: '#BE123C' }}>{volumeAspirarMl ? `${fmtMl(volumeAspirarMl)} mL` : '—'}</strong>
            </div>
          </div>

          {!textoFinal && faltando.length > 0 && (
            <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}><i className="ph ph-info" /> Para calcular, preencha: {faltando.join(', ')}.</div>
          )}
          {textoFinal && (
            <div className="calc-final-text">
              {textoFinal}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="btn-apply" onClick={onAplicar} disabled={!podeAplicar}>
            <i className="ph ph-check" /> Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}


export default function AbaPrescricao({  atendimento, medicoId, onImprimir, onFinalizada, onReimprimirVinculado, onFechar, onAbrirAtm, onAtualizarAtm, headerTabs, situacaoAtm }) {
  const [historico, setHistorico] = useState([])
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [dieta, setDieta] = useState('')
  const [itens, setItens] = useState([{ ...ITEM_VAZIO }])
  const [orientacaoEnfermagem, setOrientacaoEnfermagem] = useState([{ ...ORIENTACAO_VAZIA }])
  const [hemocomponentes, setHemocomponentes] = useState({})
  const [hemocomponenteObs, setHemocomponenteObs] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [dataReferencia, setDataReferencia] = useState(() => hojeBelem())
  const rascunho = useRascunho({ tabela: 'prescricoes_medicas', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { observacoes: [observacoes, setObservacoes], dataReferencia: [dataReferencia, setDataReferencia], dieta: [dieta, setDieta], itens: [itens, setItens], orientacaoEnfermagem: [orientacaoEnfermagem, setOrientacaoEnfermagem], hemocomponentes: [hemocomponentes, setHemocomponentes], hemocomponenteObs: [hemocomponenteObs, setHemocomponenteObs] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')
  const [catalogo, setCatalogo] = useState([])
  const [calcAberto, setCalcAberto] = useState(null)
  const [calc, setCalc] = useState({ ...CALC_VAZIA })
  const [pesoCalculo, setPesoCalculo] = useState('')
  const [gruposFechados, setGruposFechados] = useState({})
  const [maisOpcoes, setMaisOpcoes] = useState({})
  // ATM só para antimicrobiano da lista restrita prescrito por via intravenosa.
  const itensRestritos = itens.filter((it) => exigeAtm(it.medicamento_nome, it.via))
  // Validade da ATM: com ficha válida no dia desta prescrição, não se emite nem imprime outra.
  const vigenteDe = (it) => situacaoAtm?.vigentes?.get(exigeAtm(it.medicamento_nome, it.via)?.rotulo)
  const restritosCobertos = itensRestritos.filter((it) => atmCobre(vigenteDe(it), dataReferencia))
  const restritosSemAtm = itensRestritos.filter((it) => !atmCobre(vigenteDe(it), dataReferencia))
  const alertasAtm = (situacaoAtm?.alertas || []).filter((a) => !restritosSemAtm.some((it) => exigeAtm(it.medicamento_nome, it.via)?.rotulo === exigeAtm(a.medicamento, 'EV')?.rotulo))

  useEffect(() => { carregar() }, [])
  useEffect(() => { listarCatalogoMedicamentos().then(setCatalogo) }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarPrescricoes(atendimento.atendimento_id))
    setCarregando(false)
  }

  function setItem(i, campo, valor) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }

  function selecionarMedicamento(i, m) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, medicamento_nome: rotuloMedicamento(m), via: VIAS.includes(m.via_padrao) ? m.via_padrao : it.via, apresentacao: apresentacaoDaForma(m.forma_farmaceutica) || it.apresentacao } : it)))
  }

  // O último item de `itens` é sempre o rascunho em edição; os anteriores já
  // foram adicionados e aparecem como lista. "Adicionar" confirma o rascunho.
  function adicionarItem() {
    const rascunho = itens[itens.length - 1]
    if (!rascunho?.medicamento_nome.trim()) {
      setErro('Informe o medicamento antes de adicionar à prescrição.')
      return
    }
    setErro('')
    setItens((prev) => [...prev, { ...ITEM_VAZIO }])
    setCalcAberto(null)
  }

  function editarItem(i) {
    // Leva o item da lista de volta ao rascunho; um rascunho vazio é descartado.
    setItens((prev) => {
      const item = prev[i]
      const resto = prev.filter((_, idx) => idx !== i)
      const ultimo = resto[resto.length - 1]
      const base = ultimo && !ultimo.medicamento_nome.trim() ? resto.slice(0, -1) : resto
      return [...base, item]
    })
    setCalcAberto(null)
  }

  function limparRascunho() {
    setItens((prev) => [...prev.slice(0, -1), { ...ITEM_VAZIO }])
    setCalcAberto(null)
  }

  function removerItem(i) {
    setItens((prev) => prev.filter((_, idx) => idx !== i))
    if (calcAberto === i) setCalcAberto(null)
  }

  // "Editar rascunho" na lista de prescrições: carrega o rascunho no formulário, como na Evolução.
  function editarRascunhoDaLista(p) {
    const e = p.rascunho_estado || {}
    if ('observacoes' in e) setObservacoes(e.observacoes)
    if ('dataReferencia' in e) setDataReferencia(e.dataReferencia || p.data_referencia || hojeBelem())
    if ('dieta' in e) setDieta(e.dieta)
    if ('itens' in e) setItens(e.itens)
    if ('orientacaoEnfermagem' in e) setOrientacaoEnfermagem(e.orientacaoEnfermagem)
    if ('hemocomponentes' in e) setHemocomponentes(e.hemocomponentes)
    if ('hemocomponenteObs' in e) setHemocomponenteObs(e.hemocomponenteObs)
    setEditandoId(p.id)
    setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Finalizar e Imprimir" finaliza; "Cancelar" o descarta.')
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  function abrirCalculadora(i) {
    // O peso informado numa conta continua preenchido nas próximas medicações desta prescrição.
    setCalc({ ...CALC_VAZIA, pesoKg: pesoCalculo, frequencia: FREQ_CALC.includes(itens[i]?.frequencia) ? itens[i].frequencia : '' })
    setCalcAberto(i)
  }

  function fecharCalculadora() {
    setCalcAberto(null)
  }

  function toggleGrupo(chave) {
    setGruposFechados((prev) => ({ ...prev, [chave]: !prev[chave] }))
  }

  function aplicarCalculadora(i) {
    const { pesoKg, doseAlvoMgKg, diluenteMl, soroMl, doseTotalMg, dosesDia, porDia, volumeAspirarMl } = calcularDosePediatrica(calc, atendimento?.paciente?.peso)
    if (!doseTotalMg || !volumeAspirarMl) return
    const base = porDia
      ? `${String(doseAlvoMgKg).replace('.', ',')} mg/kg/dia × ${String(pesoKg).replace('.', ',')} kg ÷ ${dosesDia} doses`
      : `${String(doseAlvoMgKg).replace('.', ',')} mg/kg × ${String(pesoKg).replace('.', ',')} kg`
    const reconstituicao = `Reconstituir em ${diluenteMl} mL de AD e aspirar ${fmtMl(volumeAspirarMl)} mL (${base}${calc.arredondar ? ', arredondado' : ''})`
    setPesoCalculo(String(calc.pesoKg || pesoKg))
    setItens((prev) => prev.map((it, idx) => (idx === i ? {
      ...it,
      dose: fmtMg(doseTotalMg),
      dose_unidade: 'mg',
      ...(calc.frequencia ? { frequencia: calc.frequencia } : {}),
      diluente: soroMl ? 'SF 0,9%' : it.diluente,
      diluente_ml: soroMl ? String(soroMl) : it.diluente_ml,
      instrucoes: reconstituicao,
    } : it)))
    setCalcAberto(null)
  }

  function setOrientacao(i, campo, valor) {
    setOrientacaoEnfermagem((prev) => prev.map((o, idx) => (idx === i ? { ...o, [campo]: valor } : o)))
  }

  function adicionarOrientacao() {
    setOrientacaoEnfermagem((prev) => [...prev, { ...ORIENTACAO_VAZIA }])
  }

  function removerOrientacao(i) {
    setOrientacaoEnfermagem((prev) => prev.filter((_, idx) => idx !== i))
  }

  function toggleHemo(chave) {
    setHemocomponentes((prev) => ({ ...prev, [chave]: { ...prev[chave], marcado: !prev[chave]?.marcado } }))
  }

  function setHemoQtd(chave, valor) {
    setHemocomponentes((prev) => ({ ...prev, [chave]: { ...prev[chave], quantidade: valor } }))
  }

  // Copia uma prescrição anterior para uma nova (data = hoje, alterável).
  function duplicar(p) {
    const temConteudo = itens.some((it) => it.medicamento_nome?.trim())
    if (temConteudo && !window.confirm('Substituir o que já foi preenchido pela cópia desta prescrição?')) return
    const doBanco = (it) => ({
      ...ITEM_VAZIO,
      medicamento_nome: it.medicamento_nome || '',
      dose: it.dose != null ? String(it.dose).replace('.', ',') : '',
      dose_unidade: it.dose_unidade || 'mg',
      via: it.via || 'VO',
      frequencia: it.frequencia || '',
      duracao: it.duracao || '',
      condicao: it.sn_aplic ? (it.observacoes || '') : '',
      tempo_infusao: it.velocidade_infusao || '',
      instrucoes: [it.diluicao, it.instrucoes].filter(Boolean).join(' — '),
      apresentacao: it.apresentacao || '',
      qtd_por_dose: it.qtd_por_dose != null ? String(it.qtd_por_dose).replace('.', ',') : '1',
    })
    const cp = p.campos_prescricao || {}
    setItens([...(p.prescricao_itens || []).map(doBanco), { ...ITEM_VAZIO }])
    setDieta(cp.dieta || '')
    setOrientacaoEnfermagem(cp.orientacao_enfermagem?.length ? cp.orientacao_enfermagem : [{ ...ORIENTACAO_VAZIA }])
    setHemocomponenteObs(cp.hemocomponente_obs || '')
    setObservacoes(p.observacoes || '')
    setDataReferencia(hojeBelem())
    setEditandoId(null)
    setAviso(`Prescrição copiada para hoje (${textoValidade(hojeBelem(), new Date())}). Revise, ajuste a data se precisar e salve.`)
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  async function salvar(imprimir = false) {
    const validos = itens.filter((it) => it.medicamento_nome.trim())
    if (validos.length === 0) {
      setErro('Adicione pelo menos um medicamento.')
      return
    }
    setErro('')
    setSalvando(true)
    const { data, error } = await criarPrescricao({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      medicoId,
      observacoes,
      itens: validos.map(itemParaBanco),
      dataReferencia,
      camposPrescricao: {
        dieta: dieta || null,
        orientacao_enfermagem: orientacaoEnfermagem.filter((o) => o.texto.trim()),
        hemocomponentes: HEMO_OPCOES_RAPIDAS
          .filter((h) => hemocomponentes[h.chave]?.marcado)
          .map((h) => ({ tipo: h.label, quantidade: hemocomponentes[h.chave]?.quantidade || '' })),
        hemocomponente_obs: hemocomponenteObs || null,
      },
    })
    setSalvando(false)
    if (error) {
      // Se o cabeçalho chegou a ser gravado, ele ficou como rascunho: a próxima tentativa atualiza o mesmo registro.
      if (data?.id) setEditandoId(data.id)
      setErro(data?.id
        ? 'A prescrição ficou salva como rascunho, mas não foi possível concluir. Confira a conexão e salve de novo.'
        : 'Não foi possível salvar a prescrição. Tente de novo.')
      return
    }
    // ATM obrigatória: antimicrobiano restrito por via intravenosa → abre a ficha de ATM, já preenchida a partir da prescrição salva.
    const restritos = validos.filter((it) => exigeAtm(it.medicamento_nome, it.via))
    // Prescrição finalizada com ATM e/ou controlado: a ATM e a Receita de Controle Especial saem junto, na mesma impressão.
    const emPacote = imprimir && data && onFinalizada
    if (emPacote) onFinalizada(data, { temAtm: restritos.length > 0, controlados: validos.filter((it) => ehControlado(it.medicamento_nome, catalogo)) })
    else if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); carregar?.(); onAtualizarAtm?.(); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
    setObservacoes('')
    setDieta('')
    setItens([{ ...ITEM_VAZIO }])
    setOrientacaoEnfermagem([{ ...ORIENTACAO_VAZIA }])
    setHemocomponentes({})
    setHemocomponenteObs('')
    carregar()
    if (restritosSemAtm.length > 0 && !emPacote) onAbrirAtm?.()
  }

  return (
    <div className="clinical-split">

      
      <div className="clinical-card" style={{ flex: 1 }}>
        <div className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="cc-title">
              <h2><i className="ph ph-pill" /> Prescrição Médica Hospitalar</h2>
              </div>
              {headerTabs}
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setHistoricoAberto(true)}
              style={{ display: 'flex', gap: 6, alignItems: 'center', height: 36 }}
            >
              <i className="ph ph-clock-counter-clockwise"></i>
              Ver Histórico
            </button>
          </div>

        <div className="cc-body" id="presc-accordion" style={{ padding: 0 }}>
          {restritosSemAtm.length > 0 && (
            <div className="allergy-alert" style={{ background: '#FFF7ED', borderColor: '#FDBA74', margin: '16px 20px 0' }}>
              <div className="info" style={{ color: '#9A3412' }}>
                <i className="ph ph-shield-warning" /> <strong>ATM obrigatória:</strong> {restritosSemAtm.map((it) => {
                  const venc = vigenteDe(it)?.validade
                  return `${it.medicamento_nome}${venc ? ` (ATM anterior ${textoValidadeAtm(venc)} — renovação)` : ''}`
                }).join(', ')} {restritosSemAtm.length > 1 ? 'são antimicrobianos' : 'é antimicrobiano'} de uso restrito por via intravenosa. Ao clicar em "Finalizar e Imprimir", a Solicitação de Uso de Antimicrobiano (ATM) abre já preenchida e sai junto com a prescrição, na mesma impressão.
              </div>
            </div>
          )}
          {restritosCobertos.length > 0 && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', margin: '16px 20px 0' }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-shield-check" /> <strong>ATM em vigor:</strong> {restritosCobertos.map((it) => `${it.medicamento_nome} — ${textoValidadeAtm(vigenteDe(it)?.validade)}`).join('; ')}. A ficha não será emitida nem impressa de novo enquanto estiver válida.
              </div>
            </div>
          )}
          {alertasAtm.length > 0 && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', margin: '16px 20px 0' }}>
              <div className="info" style={{ color: '#B91C1C', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <i className="ph ph-alarm" /> <strong>Validade da ATM:</strong> {alertasAtm.map((a) => `${a.medicamento} — ${a.texto}`).join('; ')}. O uso vai continuar? {alertasAtm.some((a) => a.validade.vencida) ? 'Se sim, emita nova ficha na aba ATM (ao salvar e imprimir esta prescrição ela abre já preenchida); se não, suspenda o antimicrobiano.' : 'Se sim, mantenha o antimicrobiano na prescrição — a nova ficha será pedida quando a atual vencer; se não, suspenda-o.'}
              </div>
            </div>
          )}
          {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}
          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', margin: '16px 20px 0' }}>
              <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
            </div>
          )}

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Dia de validade da prescrição (14h00 do dia até 13h59 do dia seguinte) */}
            <div className="presc-validade">
              <label>
                <i className="ph ph-calendar-check" /> Prescrição para o dia
                <input type="date" value={dataReferencia} onChange={(e) => setDataReferencia(e.target.value || hojeBelem())} />
              </label>
              <span className="presc-validade-texto">Válida {textoValidade(dataReferencia, new Date())}</span>
              <div className="presc-validade-atalhos">
                <button type="button" className={dataReferencia === hojeBelem() ? 'on' : ''} onClick={() => setDataReferencia(hojeBelem())}>Hoje</button>
                <button type="button" className={dataReferencia === somarDias(hojeBelem(), 1) ? 'on' : ''} onClick={() => setDataReferencia(somarDias(hojeBelem(), 1))}>Amanhã</button>
              </div>
            </div>

            {/* GRUPO 1: DIETA */}
            <div className={`presc-group${gruposFechados.dieta ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('dieta')}>
                <h3><i className="ph ph-fork-knife" /> 1. Dieta</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px' }}>
                <input type="text" className="form-control" placeholder="ex: Dieta oral livre, Dieta enteral padrão..." value={dieta} onChange={(e) => setDieta(e.target.value)} />
              </div>
            </div>

            {/* GRUPO 2: MEDICAMENTOS */}
            <div className={`presc-group${gruposFechados.medicamentos ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('medicamentos')}>
                <h3><i className="ph ph-pill" /> 2. Medicamentos</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list">
                {itens.length === 1 && (
                  <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)' }}>Nenhum medicamento adicionado ainda.</div>
                )}
                {itens.slice(0, -1).map((it, i) => (
                  <div key={i} className="presc-item" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div className="item-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="item-details">
                      <div className="item-name">{it.medicamento_nome} {it.dose && `- ${it.dose} ${it.dose_unidade}`}{it.condicao && <span className="badge-2vias" style={{ background: 'var(--c-primary-soft, #CCFBF1)', color: 'var(--c-primary-hover, #0F766E)' }}>{it.condicao}</span>}</div>
                      <div className="item-sub">
                        <span><i className="ph ph-syringe"></i> {it.via || 'Via não def.'}</span>
                        <span><i className="ph ph-clock"></i> {it.frequencia || 'Frequência não def.'}</span>
                        {it.duracao && <span><i className="ph ph-calendar"></i> {it.duracao}</span>}
                        {textoDiluicao(it) && <span><strong>Diluição:</strong> {textoDiluicao(it)}</span>}
                        {it.instrucoes && <span><strong>Obs.:</strong> {it.instrucoes}</span>}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button type="button" onClick={() => editarItem(i)} title="Editar"><i className="ph ph-pencil-simple" /></button>
                      <button type="button" onClick={() => removerItem(i)} title="Remover"><i className="ph ph-trash" /></button>
                    </div>
                  </div>
                ))}

                {(() => {
                  const i = itens.length - 1
                  const it = itens[i]
                  return (
                  <div style={{ background: 'var(--primary-light, var(--c-primary-soft, #F0FDFA))' }}>
                    <div className="presc-input-row presc-input-row-compact">
                      <div className="presc-input-linha1">
                        <div className="item-num">{String(i + 1).padStart(2, '0')}</div>
                        <AutocompleteMedicamento
                          catalogo={catalogo}
                          valor={it.medicamento_nome}
                          onChange={(v) => setItem(i, 'medicamento_nome', v)}
                          onSelecionar={(m) => selecionarMedicamento(i, m)} placeholder="Medicamento — princípio ativo ou nome comercial"
                        />
                        <button type="button" className="btn-calc-ped" onClick={() => abrirCalculadora(i)} title="Calculadora de Dose Pediátrica">
                          <i className="ph ph-calculator" /><i className="ph ph-baby" />
                        </button>
                        <button type="button" onClick={limparRascunho} className="btn-remover-item" title="Limpar campos">
                          <i className="ph ph-eraser" />
                        </button>
                      </div>

                      {/* Linha essencial: dose, via, frequência e uso — o que toda prescrição precisa */}
                      <div className="presc-input-linha2" style={{ gridTemplateColumns: '1.1fr 0.7fr 1fr 1fr 1.1fr' }}>
                        <div className="presc-dose">
                          <input type="text" inputMode="decimal" className="form-control" placeholder="Dose" value={it.dose} onChange={(e) => setItem(i, 'dose', e.target.value)} />
                          <select className="form-control" value={it.dose_unidade} onChange={(e) => setItem(i, 'dose_unidade', e.target.value)} title="Unidade da dose">
                            {UNIDADES_DOSE.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <select className="form-control" value={it.via} onChange={(e) => setItem(i, 'via', e.target.value)} title="Via de administração">
                          {VIAS.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <select className="form-control" value={it.frequencia} onChange={(e) => setItem(i, 'frequencia', e.target.value)} title="Frequência">
                          <option value="">Frequência</option>
                          {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select className="form-control" value={it.condicao} onChange={(e) => setItem(i, 'condicao', e.target.value)} title="Uso">
                          <option value="">Horário fixo</option>
                          {CONDICOES_USO.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="presc-apres" title="Quantidade por dose e apresentação (ampola, frasco, blister...)">
                          <input type="text" inputMode="decimal" className="form-control" value={it.qtd_por_dose} onChange={(e) => setItem(i, 'qtd_por_dose', e.target.value)} placeholder="Qtd" aria-label="Quantidade por dose" />
                          <select className="form-control" value={it.apresentacao} onChange={(e) => setItem(i, 'apresentacao', e.target.value)} aria-label="Apresentação">
                            <option value="">Apres.</option>
                            {APRESENTACOES.map(([sigla, nome]) => <option key={sigla} value={sigla}>{sigla} — {nome}</option>)}
                          </select>
                        </div>
                      </div>
                      {it.apresentacao && <div className="presc-qtd-dia">Quantidade no dia: <b>{quantidadeDia(it)}</b></div>}

                      {/* Diluição só aparece para vias injetáveis (EV/IM/SC) */}
                      {['EV', 'IM', 'SC'].includes(it.via) && (
                        <div className="presc-input-linha3" style={{ gridTemplateColumns: '1.2fr 0.7fr 1.1fr' }}>
                          <select className="form-control" value={it.diluente} onChange={(e) => setItem(i, 'diluente', e.target.value)} title="Diluente">
                            <option value="">Sem diluição</option>
                            {DILUENTES.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <input type="text" inputMode="decimal" className="form-control" placeholder="Volume (mL)" value={it.diluente_ml} disabled={!it.diluente} onChange={(e) => setItem(i, 'diluente_ml', e.target.value)} />
                          <select className="form-control" value={it.tempo_infusao} onChange={(e) => setItem(i, 'tempo_infusao', e.target.value)} title="Tempo de administração">
                            <option value="">Tempo de infusão</option>
                            {TEMPOS_INFUSAO.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      )}

                      {/* Opcionais recolhidos: duração e observações */}
                      {(maisOpcoes[i] || it.duracao || it.instrucoes) ? (
                        <div className="presc-input-linha3" style={{ gridTemplateColumns: '0.8fr 2fr' }}>
                          <input type="text" className="form-control" placeholder="Duração (ex: 7 dias)" value={it.duracao} onChange={(e) => setItem(i, 'duracao', e.target.value)} />
                          <input type="text" className="form-control" placeholder="Observações (ex: aplicar em jejum)" value={it.instrucoes} onChange={(e) => setItem(i, 'instrucoes', e.target.value)} />
                        </div>
                      ) : (
                        <button type="button" className="presc-mais-opcoes" onClick={() => setMaisOpcoes((m) => ({ ...m, [i]: true }))}>
                          <i className="ph ph-plus" /> Duração / observações
                        </button>
                      )}
                      {textoDiluicao(it) && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                          <i className="ph ph-eye" /> Na prescrição: <strong>{textoDiluicao(it)}</strong>
                        </div>
                      )}
                    </div>

                    {calcAberto === i && (
                      <CalculadoraDosePediatrica
                        item={it}
                        calc={calc}
                        pacienteNome={atendimento?.paciente?.nome}
                        pacientePeso={atendimento?.paciente?.peso}
                        onChange={(campo, valor) => setCalc((prev) => ({ ...prev, [campo]: valor }))}
                        onAplicar={() => aplicarCalculadora(i)}
                        onCancelar={fecharCalculadora}
                      />
                    )}
                  </div>
                  )
                })()}
                <div style={{ padding: '10px 16px' }}>
                  <button type="button" className="btn-add-chip" onClick={adicionarItem}>
                    <i className="ph ph-plus" /> Adicionar à prescrição
                  </button>
                </div>
              </div>
            </div>

            {/* GRUPO 3: ORIENTAÇÕES */}
            <div className={`presc-group${gruposFechados.orientacoes ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('orientacoes')}>
                <h3><i className="ph ph-first-aid-kit" /> 3. Cuidados e Orientações de Enfermagem</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {orientacaoEnfermagem.map((o, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'center' }}>
                    <input type="text" className="form-control" placeholder="ex: Monitorização contínua" value={o.texto} onChange={(e) => setOrientacao(i, 'texto', e.target.value)} />
                    <select className="form-control" value={o.frequencia || ''} onChange={(e) => setOrientacao(i, 'frequencia', e.target.value)} title="Horário de aferição/realização">
                      <option value="">Horário</option>
                      {FREQUENCIAS_CUIDADOS.map((f) => <option key={f} value={f}>{f}</option>)}
                      {o.frequencia && !FREQUENCIAS_CUIDADOS.includes(o.frequencia) && <option value={o.frequencia}>{o.frequencia}</option>}
                    </select>
                    {orientacaoEnfermagem.length > 1 && (
                      <button type="button" className="btn-cancel" style={{ padding: '6px 10px' }} onClick={() => removerOrientacao(i)}><i className="ph ph-trash" /></button>
                    )}
                  </div>
                ))}
                <div>
                  <button type="button" className="btn-add-chip" onClick={adicionarOrientacao}>
                    <i className="ph ph-plus" /> Adicionar orientação
                  </button>
                </div>
              </div>
            </div>

            {/* GRUPO 4: HEMOCOMPONENTES E DERIVADOS */}
            <div className={`presc-group${gruposFechados.hemo ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('hemo')}>
                <h3><i className="ph ph-drop" /> 4. Hemocomponentes e Derivados</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="hemo-chips">
                  {HEMO_OPCOES_RAPIDAS.map((h) => {
                    const ativo = !!hemocomponentes[h.chave]?.marcado
                    return (
                      <div key={h.chave} className={`hemo-chip${ativo ? ' ativo' : ''}`}>
                        <button type="button" className="hemo-chip-btn" onClick={() => toggleHemo(h.chave)}>
                          <i className={`ph ${h.icon}`} /> {h.label}
                        </button>
                        {ativo && (
                          <input
                            type="text"
                            className="hemo-chip-qtd"
                            placeholder="Qtd (ex: 2 unid.)"
                            value={hemocomponentes[h.chave]?.quantidade || ''}
                            onChange={(e) => setHemoQtd(h.chave, e.target.value)}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Outro hemocomponente ou observação (opcional)"
                  value={hemocomponenteObs}
                  onChange={(e) => setHemocomponenteObs(e.target.value)}
                />
              </div>
            </div>

            {/* GRUPO 5: OBSERVAÇÕES */}
            <div className={`presc-group${gruposFechados.observacoes ? ' collapsed' : ''}`}>
              <div className="presc-group-header" onClick={() => toggleGrupo('observacoes')}>
                <h3><i className="ph ph-note" /> 5. Observações da Prescrição</h3>
                <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
              </div>
              <div className="presc-list" style={{ padding: '12px 16px' }}>
                <textarea className="form-control-area" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>
            </div>

            {/* HISTÓRICO */}
            {historico.length > 0 && (
              <div className={`presc-group${gruposFechados.historico ? ' collapsed' : ''}`}>
                <div className="presc-group-header" onClick={() => toggleGrupo('historico')}>
                  <h3><i className="ph ph-clock-counter-clockwise" /> Histórico de Prescrições Anteriores</h3>
                  <div className="group-actions"><i className="ph ph-caret-down caret-icon" /></div>
                </div>
                <div className="presc-list" style={{ padding: '12px 16px' }}>
                  {historico.map((p) => (
                    <div key={p.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 12, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>
                          {(p.prescricao_itens ?? []).map((it) => it.medicamento_nome).join(', ')}
                        </span>
                        <span style={{ fontSize: 12, color: p.status === 'cancelada' ? '#DC2626' : 'var(--text-muted)' }}>
                          {p.situacao === 'invalido' ? 'invalidada' : p.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                        Prescrito por {p.enfermeiros?.nome_exibicao || p.enfermeiros?.nome} • {new Date(p.criado_em).toLocaleString('pt-BR')}
                        {p.data_referencia && <> • <strong>Válida {textoValidade(p.data_referencia, p.criado_em)}</strong></>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onImprimir(p)}>
                          <i className="ph ph-printer" /> Reimprimir
                        </button>
                        <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => duplicar(p)} title="Copia medicamentos, dieta e orientações para uma nova prescrição">
                          <i className="ph ph-copy" /> Duplicar
                        </button>
                        {onReimprimirVinculado && p.situacao === 'finalizado' && precisaAtm(p) && (
                          <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onReimprimirVinculado('atm', p)} title="Reimprimir a Ficha de ATM desta prescrição">
                            <i className="ph ph-shield-warning" /> ATM
                          </button>
                        )}
                        {onReimprimirVinculado && p.situacao === 'finalizado' && itensControlados(p, catalogo).length > 0 && (
                          <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onReimprimirVinculado('controle', p)} title="Reimprimir a Receita de Controle Especial desta prescrição">
                            <i className="ph ph-seal-warning" /> Controle Especial
                          </button>
                        )}
                        {p.situacao === 'rascunho' && p.autor_auth === medicoId && (
                          <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => editarRascunhoDaLista(p)} title="Abrir este rascunho no formulário para continuar editando">
                            <i className="ph ph-pencil-simple" /> Editar rascunho
                          </button>
                        )}
                        <SeloSituacao registro={p} />
                        <BotaoInvalidar tabela="prescricoes_medicas" registro={p} meuId={medicoId} onFeito={carregar} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="cc-footer">
          <div>
            <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}>
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Finalizar e Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
