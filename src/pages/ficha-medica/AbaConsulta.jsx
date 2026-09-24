import { useEffect, useState } from 'react';
import { listarConsultas, criarConsulta } from '../../lib/pepMedico';

const CONSULTA_VAZIA = {
  queixa_principal: '',
  antecedentes: '',
  exame_geral: '',
  sv: { pa: '', fc: '', fr: '', spo2: '', temp: '', dor: '' },
  sv_registrado_por: '',
  hipotese_diagnostica: '',
  cidade_uf: '', data_assinatura: '',
}

export default function AbaConsulta({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(CONSULTA_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarConsultas(atendimento.atendimento_id))
    setCarregando(false)
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }))
  }

  async function salvar() {
    if (!dados.queixa_principal.trim() || !dados.hipotese_diagnostica.trim()) {
      setErro('Preencha ao menos a queixa principal e a hipótese diagnóstica.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarConsulta({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      medicoId,
      dados,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar. Tente de novo.')
      return
    }
    setDados(CONSULTA_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova consulta (Admissão Médica)</div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 4 }}>Queixa principal e história da doença atual (HDA)</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Queixa principal, início, evolução, características e informações clínicas relevantes *</label>
          <textarea value={dados.queixa_principal} onChange={(e) => set('queixa_principal', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Antecedentes relevantes</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Doenças prévias, cirurgias, internações, alergias e medicamentos em uso</label>
          <textarea value={dados.antecedentes} onChange={(e) => set('antecedentes', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Exame físico e sinais vitais</div>
      <div className="form-grid">
        <div className="form-field span-3"><label>Exame físico</label><textarea value={dados.exame_geral} onChange={(e) => set('exame_geral', e.target.value)} /></div>
        {[['pa', 'PA (mmHg)'], ['fc', 'FC (bpm)'], ['fr', 'FR (irpm)'], ['spo2', 'SpO2 (%)'], ['temp', 'Temp. (°C)'], ['dor', 'Dor (0-10)']].map(([k, r]) => (
          <div className="form-field" key={k}><label>{r}</label><input type="text" value={dados.sv[k]} onChange={(e) => set('sv', { ...dados.sv, [k]: e.target.value })} /></div>
        ))}
        <div className="form-field"><label>Registrado por</label><input type="text" value={dados.sv_registrado_por} onChange={(e) => set('sv_registrado_por', e.target.value)} /></div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Impressão diagnóstica e conduta</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Hipótese/avaliação diagnóstica, conduta inicial, medicamentos, exames, observação e orientações *</label>
          <textarea value={dados.hipotese_diagnostica} onChange={(e) => set('hipotese_diagnostica', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 12 }}>Assinatura médica</div>
      <div className="form-grid">
        <div className="form-field"><label>Cidade/UF</label><input type="text" value={dados.cidade_uf} onChange={(e) => set('cidade_uf', e.target.value)} /></div>
        <div className="form-field"><label>Data</label><input type="date" value={dados.data_assinatura} onChange={(e) => set('data_assinatura', e.target.value)} /></div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
        Nome e CRM/UF do médico são preenchidos automaticamente pelo cadastro no impresso — só fica o espaço para assinatura/carimbo manual.
      </p>

      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Registrar consulta'}
        </button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma consulta registrada ainda.</p>
      ) : (
        historico.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.hipotese_diagnostica}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {c.queixa_principal} — {c.enfermeiros?.nome_exibicao || c.enfermeiros?.nome} · {new Date(c.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>
              <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(c)}>Imprimir</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
