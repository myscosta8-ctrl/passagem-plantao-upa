import { useEffect, useState } from 'react';
import { listarEvolucoesMedicas, criarEvolucaoMedica } from '../../lib/pepMedico';
import { EVOLUCAO_VAZIA, RISCO_TEV_OPCOES } from './constantes';


function CampoSimNao({ label, valor, onChange }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <div className="toggle-group" style={{ maxWidth: 160 }}>
        <button type="button" className={`toggle-btn ${!valor ? 'on' : ''}`} onClick={() => onChange(false)}>Não</button>
        <button type="button" className={`toggle-btn ${valor ? 'on' : ''}`} onClick={() => onChange(true)}>Sim</button>
      </div>
    </div>
  )
}


export default function AbaEvolucaoMedica({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(EVOLUCAO_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarEvolucoesMedicas(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.evolucao_dia.trim() || !dados.exame_fisico.trim()) {
      setErro('Preencha ao menos a evolução do dia e o exame físico.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarEvolucaoMedica({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: {
        diagnosticos: dados.diagnosticos || null, historia_doenca_atual: dados.historia_doenca_atual || null,
        comorbidades: dados.comorbidades, comorbidades_texto: dados.comorbidades ? (dados.comorbidades_texto || null) : null,
        reconciliacao_medicamentosa: dados.reconciliacao_medicamentosa, reconciliacao_texto: dados.reconciliacao_medicamentosa ? (dados.reconciliacao_texto || null) : null,
        alergias: dados.alergias, alergias_texto: dados.alergias ? (dados.alergias_texto || null) : null,
        risco_tev: dados.risco_tev || null, criterios_sepse: dados.criterios_sepse,
        antibioticoterapia: dados.antibioticoterapia || null,
        evolucao_dia: dados.evolucao_dia, exame_fisico: dados.exame_fisico,
        plano_terapeutico: dados.plano_terapeutico || null,
        exames_laboratorio: dados.exames_laboratorio || null,
        aguarda_exames: dados.aguarda_exames, aguarda_exames_texto: dados.aguarda_exames ? (dados.aguarda_exames_texto || null) : null,
        data_prevista_alta: dados.data_prevista_alta || null,
        conduta_medica: dados.conduta_medica || null,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(EVOLUCAO_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova evolução médica diária</div>
      <div className="form-grid">
        <div className="form-field span-3"><label>Diagnósticos (incluir todos, o principal na primeira linha)</label><textarea value={dados.diagnosticos} onChange={(e) => set('diagnosticos', e.target.value)} /></div>
        <div className="form-field span-3"><label>História da doença atual</label><textarea value={dados.historia_doenca_atual} onChange={(e) => set('historia_doenca_atual', e.target.value)} /></div>

        <CampoSimNao label="Comorbidades?" valor={dados.comorbidades} onChange={(v) => set('comorbidades', v)} />
        {dados.comorbidades && <div className="form-field span-2"><label>Especificar comorbidades</label><input type="text" value={dados.comorbidades_texto} onChange={(e) => set('comorbidades_texto', e.target.value)} /></div>}

        <CampoSimNao label="Reconciliação medicamentosa?" valor={dados.reconciliacao_medicamentosa} onChange={(v) => set('reconciliacao_medicamentosa', v)} />
        {dados.reconciliacao_medicamentosa && <div className="form-field span-2"><label>Itens reconciliados em prescrição</label><input type="text" value={dados.reconciliacao_texto} onChange={(e) => set('reconciliacao_texto', e.target.value)} /></div>}

        <CampoSimNao label="Alergias?" valor={dados.alergias} onChange={(v) => set('alergias', v)} />
        {dados.alergias && <div className="form-field span-2"><label>Qual medicação</label><input type="text" value={dados.alergias_texto} onChange={(e) => set('alergias_texto', e.target.value)} /></div>}

        <div className="form-field">
          <label>Risco para TEV</label>
          <select value={dados.risco_tev} onChange={(e) => set('risco_tev', e.target.value)}>
            <option value="">—</option>
            {RISCO_TEV_OPCOES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <CampoSimNao label="2 critérios para protocolo de sepse?" valor={dados.criterios_sepse} onChange={(v) => set('criterios_sepse', v)} />
        <div className="form-field"><label>Antibioticoterapia atual (nome, início, duração)</label><input type="text" value={dados.antibioticoterapia} onChange={(e) => set('antibioticoterapia', e.target.value)} /></div>

        <div className="form-field span-3"><label>Evolução do dia *</label><textarea value={dados.evolucao_dia} onChange={(e) => set('evolucao_dia', e.target.value)} /></div>
        <div className="form-field span-3"><label>Exame físico *</label><textarea value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} /></div>
        <div className="form-field span-3"><label>Plano terapêutico (objetivos da terapêutica, atualizados)</label><textarea value={dados.plano_terapeutico} onChange={(e) => set('plano_terapeutico', e.target.value)} /></div>
        <div className="form-field span-3"><label>Laboratório / cultura / exames de imagem</label><textarea value={dados.exames_laboratorio} onChange={(e) => set('exames_laboratorio', e.target.value)} /></div>

        <CampoSimNao label="Aguarda exames?" valor={dados.aguarda_exames} onChange={(v) => set('aguarda_exames', v)} />
        {dados.aguarda_exames && <div className="form-field span-2"><label>Especificar</label><input type="text" value={dados.aguarda_exames_texto} onChange={(e) => set('aguarda_exames_texto', e.target.value)} /></div>}

        <div className="form-field"><label>Data prevista da alta hospitalar</label><input type="date" value={dados.data_prevista_alta} onChange={(e) => set('data_prevista_alta', e.target.value)} /></div>
        <div className="form-field span-3"><label>Conduta médica</label><textarea value={dados.conduta_medica} onChange={(e) => set('conduta_medica', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar evolução'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma evolução registrada ainda.</p>
      ) : historico.map((e) => (
        <div key={e.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{e.evolucao_dia}</p>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {e.enfermeiros?.nome_exibicao || e.enfermeiros?.nome} · {new Date(e.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(e)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
