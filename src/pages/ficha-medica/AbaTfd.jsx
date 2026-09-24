import { useEffect, useState } from 'react';
import { listarTfd, criarTfd } from '../../lib/pepMedico';

export default function AbaTfd({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(TFD_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarTfd(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar() {
    if (!dados.diagnostico.trim() || !dados.tratamento_indicado.trim()) {
      setErro('Preencha ao menos o diagnóstico e o tratamento indicado.')
      return
    }
    setErro('')
    setSalvando(true)
    const {
      historia_doenca_atual, exame_fisico, diagnostico, exame_complementar,
      tratamento_realizado, tratamento_indicado, tempo_provavel_dias,
      acompanhante_nome, acompanhante_relacao, ...extra
    } = dados
    const { error } = await criarTfd({
      atendimentoId: atendimento.atendimento_id, profissionalResponsavel: medicoId,
      dados: {
        historia_doenca_atual, exame_fisico, diagnostico, exame_complementar,
        tratamento_realizado, tratamento_indicado,
        tempo_provavel_dias: tempo_provavel_dias ? Number(tempo_provavel_dias) : null,
        acompanhante_nome, acompanhante_relacao,
        campos_extra: extra,
      },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(TFD_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Novo laudo de TFD</div>
      <div className="form-grid">
        <div className="form-field"><label>Nº do laudo</label><input type="text" value={dados.numero_laudo} onChange={(e) => set('numero_laudo', e.target.value)} /></div>
        <div className="form-field"><label>Identidade (RG)</label><input type="text" value={dados.identidade} onChange={(e) => set('identidade', e.target.value)} /></div>
        <div className="form-field"><label>Profissão</label><input type="text" value={dados.profissao} onChange={(e) => set('profissao', e.target.value)} /></div>
        <div className="form-field span-3"><label>História da doença atual</label><textarea value={dados.historia_doenca_atual} onChange={(e) => set('historia_doenca_atual', e.target.value)} /></div>
        <div className="form-field span-3"><label>Exame físico</label><textarea value={dados.exame_fisico} onChange={(e) => set('exame_fisico', e.target.value)} /></div>
        <div className="form-field span-3"><label>Diagnóstico *</label><input type="text" value={dados.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></div>
        <div className="form-field span-3"><label>Exame complementar</label><input type="text" value={dados.exame_complementar} onChange={(e) => set('exame_complementar', e.target.value)} /></div>
        <div className="form-field span-3"><label>Tratamento realizado</label><textarea value={dados.tratamento_realizado} onChange={(e) => set('tratamento_realizado', e.target.value)} /></div>
        <div className="form-field span-3"><label>Tratamento indicado *</label><textarea value={dados.tratamento_indicado} onChange={(e) => set('tratamento_indicado', e.target.value)} /></div>
        <div className="form-field"><label>Tempo provável (dias)</label><input type="number" value={dados.tempo_provavel_dias} onChange={(e) => set('tempo_provavel_dias', e.target.value)} /></div>
        <div className="form-field"><label>Acompanhante</label><input type="text" value={dados.acompanhante_nome} onChange={(e) => set('acompanhante_nome', e.target.value)} /></div>
        <div className="form-field"><label>Relação</label><input type="text" value={dados.acompanhante_relacao} onChange={(e) => set('acompanhante_relacao', e.target.value)} /></div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar laudo'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum laudo registrado ainda.</p>
      ) : historico.map((t) => (
        <div key={t.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{t.diagnostico}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {t.enfermeiros?.nome_exibicao || t.enfermeiros?.nome} · {new Date(t.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(t)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
