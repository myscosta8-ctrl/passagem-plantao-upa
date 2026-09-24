import { useEffect, useState } from 'react';
import { listarAtm, criarAtm } from '../../lib/pepMedico';

export default function AbaAtm({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(ATM_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarAtm(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.medicamento.trim() || !dados.justificativa_clinica.trim()) {
      setErro('Preencha ao menos o medicamento e a justificativa clínica.')
      return
    }
    setErro('')
    setSalvando(true)
    const {
      medicamento, posologia, dose, intervalo, tempo_uso_dias, justificativa_clinica, ...extra
    } = dados
    const { error } = await criarAtm({
      atendimentoId: atendimento.atendimento_id, solicitanteId: medicoId,
      dados: {
        medicamento, posologia, dose, intervalo, justificativa_clinica,
        tempo_uso_dias: tempo_uso_dias ? Number(tempo_uso_dias) : null,
        campos_extra: extra,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(ATM_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova solicitação de ATM</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Liberação de antibiótico de uso restrito — o parecer da farmácia é dado manualmente, fora do sistema. Aqui só registra a solicitação e gera o documento completo pra impressão, parecer, assinatura e carimbo do farmacêutico.
      </p>
      <div className="form-grid">
        <div className="form-field span-2"><label>Diagnóstico</label><input type="text" value={dados.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></div>
        <div className="form-field"><label>Data de internação</label><input type="date" value={dados.data_internacao} onChange={(e) => set('data_internacao', e.target.value)} /></div>
        <div className="form-field span-3"><label>Tratamento pretendido</label><input type="text" value={dados.tratamento_pretendido} onChange={(e) => set('tratamento_pretendido', e.target.value)} /></div>
        <div className="form-field span-2"><label>Medicamento *</label><input type="text" value={dados.medicamento} onChange={(e) => set('medicamento', e.target.value)} /></div>
        <div className="form-field"><label>Dose</label><input type="text" value={dados.dose} onChange={(e) => set('dose', e.target.value)} /></div>
        <div className="form-field"><label>Posologia</label><input type="text" value={dados.posologia} onChange={(e) => set('posologia', e.target.value)} /></div>
        <div className="form-field"><label>Intervalo</label><input type="text" placeholder="ex: 8/8h" value={dados.intervalo} onChange={(e) => set('intervalo', e.target.value)} /></div>
        <div className="form-field"><label>Tempo de uso (dias)</label><input type="number" value={dados.tempo_uso_dias} onChange={(e) => set('tempo_uso_dias', e.target.value)} /></div>
        <div className="form-field"><label>DxIxT</label><input type="text" value={dados.dxixt} onChange={(e) => set('dxixt', e.target.value)} /></div>
        <div className="form-field"><label>Ampolas</label><input type="text" value={dados.ampolas} onChange={(e) => set('ampolas', e.target.value)} /></div>
        <div className="form-field"><label>Frasco-ampolas</label><input type="text" value={dados.frasco_ampolas} onChange={(e) => set('frasco_ampolas', e.target.value)} /></div>
        <div className="form-field"><label>Bolsas</label><input type="text" value={dados.bolsas} onChange={(e) => set('bolsas', e.target.value)} /></div>
        <div className="form-field span-3"><label>Justificativa clínica *</label><textarea value={dados.justificativa_clinica} onChange={(e) => set('justificativa_clinica', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar solicitação'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação registrada ainda.</p>
      ) : historico.map((a) => (
        <div key={a.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{a.medicamento}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {a.parecer_farmaceutico ? `Parecer: ${a.parecer_farmaceutico}` : 'Aguardando parecer'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              {a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome} · {new Date(a.criado_em).toLocaleString('pt-BR')}
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(a)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}

