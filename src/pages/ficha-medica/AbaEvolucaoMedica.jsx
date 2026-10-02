import { useEffect, useState } from 'react';
import { criarEvolucaoMedica } from '../../lib/pepMedico';
import { listarSinaisVitais } from '../../lib/pepClinico';
import { EVOLUCAO_VAZIA } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { metaDoc } from '../../lib/documentos'
import { useRascunho } from '../../hooks/useRascunho'
import { retirarDuplicacao } from '../../lib/duplicarPendente'
import ModelosEvolucao from '../../components/ModelosEvolucao'

const CAMPOS_MODELO_MEDICO = [
  { chave: 'evolucao_dia', rotulo: 'Evolução do dia' },
  { chave: 'exame_fisico', rotulo: 'Exame físico' },
  { chave: 'conduta_medica', rotulo: 'Conduta' },
]

export default function AbaEvolucaoMedica({  atendimento, medicoId, onImprimir, onFechar }) {
  const [dados, setDados] = useState(EVOLUCAO_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const rascunho = useRascunho({ tabela: 'evolucoes_medicas', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  // Duplicar (escolhido no Histórico Clínico): sinais vitais não são copiados.
  useEffect(() => {
    const d = retirarDuplicacao('medico')
    if (!d) return undefined
    const T = ['diagnosticos', 'historia_doenca_atual', 'comorbidades_texto', 'antibioticoterapia', 'evolucao_dia', 'exame_fisico', 'conduta_medica', 'risco_tev']
    const t = setTimeout(() => {
      setDados((prev) => ({ ...prev, ...Object.fromEntries(T.map((k) => [k, d.registro[k] ?? ''])), criterios_sepse: !!d.registro.criterios_sepse }))
      setAviso(d.mensagem)
    }, 400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [erro, setErro] = useState('')
  const [puxandoSv, setPuxandoSv] = useState(false)
  const [svInfo, setSvInfo] = useState('')

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function puxarSinaisVitaisDaEnfermagem() {
    setPuxandoSv(true)
    setSvInfo('')
    const registros = await listarSinaisVitais(atendimento.atendimento_id)
    setPuxandoSv(false)
    const ultimo = registros[0]
    if (!ultimo) {
      setSvInfo('Nenhum sinal vital registrado pela enfermagem para este atendimento.')
      return
    }
    setDados((prev) => ({
      ...prev,
      sv_pa_sistolica: ultimo.pa_sistolica ?? '',
      sv_pa_diastolica: ultimo.pa_diastolica ?? '',
      sv_fc: ultimo.fc ?? '',
      sv_fr: ultimo.fr ?? '',
      sv_temperatura: ultimo.temperatura ?? '',
      sv_spo2: ultimo.spo2 ?? '',
      sv_hgt: ultimo.hgt ?? '',
    }))
    setSvInfo(`Puxado de ${new Date(ultimo.registrado_em).toLocaleString('pt-BR')} — ${ultimo.enfermeiros?.nome_exibicao || ultimo.enfermeiros?.nome || 'Enfermagem'}. Os campos podem ser editados abaixo.`)
  }

  async function salvar(imprimir = false) {
    if (!dados.evolucao_dia.trim() || !dados.exame_fisico.trim()) {
      setErro('Preencha ao menos a evolução do dia e o exame físico.')
      return
    }
    setErro('')
    setSalvando(true)
    const { data, error } = await criarEvolucaoMedica({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        diagnosticos: dados.diagnosticos || null, historia_doenca_atual: dados.historia_doenca_atual || null,
        comorbidades: !!dados.comorbidades_texto?.trim(), comorbidades_texto: dados.comorbidades_texto || null,
        risco_tev: dados.risco_tev || null, criterios_sepse: dados.criterios_sepse,
        antibioticoterapia: dados.antibioticoterapia || null,
        evolucao_dia: dados.evolucao_dia, exame_fisico: dados.exame_fisico,
        conduta_medica: dados.conduta_medica || null,
        sv_pa_sistolica: dados.sv_pa_sistolica === '' ? null : Number(dados.sv_pa_sistolica),
        sv_pa_diastolica: dados.sv_pa_diastolica === '' ? null : Number(dados.sv_pa_diastolica),
        sv_fc: dados.sv_fc === '' ? null : Number(dados.sv_fc),
        sv_fr: dados.sv_fr === '' ? null : Number(dados.sv_fr),
        sv_temperatura: dados.sv_temperatura === '' ? null : Number(dados.sv_temperatura),
        sv_spo2: dados.sv_spo2 === '' ? null : Number(dados.sv_spo2),
        sv_hgt: dados.sv_hgt === '' ? null : Number(dados.sv_hgt),
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    if (!imprimir) { setEditandoId(data?.id ?? null); setAviso('Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); return }
    setEditandoId(null); setDataRegistro(''); setAviso('')
    setDados(EVOLUCAO_VAZIA)
    setSvInfo('')
  }

  return (
    <div className="clinical-split">
      {/* HISTÓRICO DE EVOLUÇÕES */}
      


      {/* NOVA EVOLUÇÃO */}
      <div className="clinical-card">
        
          <div className="cc-body">
          

          <div className="assess-grid">
            <div className="form-group">
              <label className="bloco-num"><i className="ph ph-virus" /> Diagnósticos Ativos (CID-10 / HD)</label>
              <input type="text" className="form-control" value={dados.diagnosticos} onChange={(e) => set('diagnosticos', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="ph ph-heartbeat" /> Comorbidades / Antecedentes</label>
              <input type="text" className="form-control" value={dados.comorbidades_texto} onChange={(e) => set('comorbidades_texto', e.target.value)} />
            </div>
          </div>

          <div className="checkbox-group">
            <label style={{ fontWeight: 700, color: 'var(--text-main, #0F172A)', fontSize: 'var(--fs-sm)' }}>Risco e Avaliação Rápida:</label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.risco_tev === 'Sim'} onChange={(e) => set('risco_tev', e.target.checked ? 'Sim' : '')} /> Risco TEV
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={dados.criterios_sepse} onChange={(e) => set('criterios_sepse', e.target.checked)} /> Protocolo Sepse (2+ critérios)
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={!!dados.antibioticoterapia} onChange={(e) => set('antibioticoterapia', e.target.checked ? 'Sim' : '')} /> Uso de Antimicrobianos
            </label>
          </div>

          {/* Sinais Vitais */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <h3 className="bloco-num" style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text-main, #0F172A)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <i className="ph ph-thermometer" /> Sinais Vitais Atuais
              </h3>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted, #64748B)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={puxarSinaisVitaisDaEnfermagem}>
                <i className="ph ph-arrows-clockwise" /> {puxandoSv ? 'Buscando...' : 'Puxar da Enfermagem'}
              </span>
            </div>
            {svInfo && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted, #64748B)', margin: '0 0 10px' }}>{svInfo}</p>
            )}
            <div className="vitals-grid">
              <div className="vital-box">
                <label>P. Arterial</label>
                <div className="vital-input-wrapper">
                  <input
                    type="text"
                    placeholder="120/80"
                    value={dados.sv_pa_sistolica === '' && dados.sv_pa_diastolica === '' ? '' : `${dados.sv_pa_sistolica}${dados.sv_pa_diastolica !== '' ? `/${dados.sv_pa_diastolica}` : ''}`}
                    onChange={(e) => {
                      const [sist, diast] = e.target.value.split('/')
                      set('sv_pa_sistolica', sist ?? '')
                      set('sv_pa_diastolica', diast ?? '')
                    }}
                  />
                  <span>mmHg</span>
                </div>
              </div>
              <div className="vital-box"><label>F. Cardíaca</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_fc} onChange={(e) => set('sv_fc', e.target.value)} /><span>bpm</span></div></div>
              <div className="vital-box"><label>F. Respiratória</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_fr} onChange={(e) => set('sv_fr', e.target.value)} /><span>irpm</span></div></div>
              <div className="vital-box"><label>Temperatura</label><div className="vital-input-wrapper"><input type="number" step="0.1" value={dados.sv_temperatura} onChange={(e) => set('sv_temperatura', e.target.value)} /><span>°C</span></div></div>
              <div className="vital-box"><label>SpO₂</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_spo2} onChange={(e) => set('sv_spo2', e.target.value)} /><span>%</span></div></div>
              <div className="vital-box"><label>HGT</label><div className="vital-input-wrapper"><input type="number" value={dados.sv_hgt} onChange={(e) => set('sv_hgt', e.target.value)} /><span>mg/dL</span></div></div>
            </div>
          </div>

          {/* Campos de Texto Oficiais */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <label className="bloco-num" style={{ margin: 0 }}><i className="ph ph-text-align-left" /> Evolução Clínica do Dia e Queixas *</label>
              {/* Modelo preenche evolução, exame físico e conduta; tudo continua editável. */}
              <ModelosEvolucao categoria="medico" campos={CAMPOS_MODELO_MEDICO} autorId={medicoId}
                valores={{ evolucao_dia: dados.evolucao_dia, exame_fisico: dados.exame_fisico, conduta_medica: dados.conduta_medica }}
                onAplicar={(v) => setDados((p) => ({ ...p, ...v }))} />
            </div>
            <textarea className="form-control-area large" placeholder="Descreva o estado geral, queixas, evolução do quadro..." value={dados.evolucao_dia} onChange={(e) => set('evolucao_dia', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="bloco-num"><i className="ph ph-stethoscope" /> Exame Físico Dirigido *</label>
            <textarea className="form-control-area" placeholder="Ex: Bom estado geral, corado, hidratado..." value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="bloco-num"><i className="ph ph-list-checks" /> Conduta Médica / Plano Terapêutico</label>
            <textarea className="form-control-area" placeholder="Conduta, exames solicitados, pendências de leito..." value={dados.conduta_medica} onChange={(e) => set('conduta_medica', e.target.value)} />
          </div>

          {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}
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
