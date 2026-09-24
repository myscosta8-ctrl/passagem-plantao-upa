import { useEffect, useState } from 'react';
import { listarSolicitacoesSangue, criarSolicitacaoSangue } from '../../lib/pepMedico';
import { SANGUE_VAZIA, HEMOCOMPONENTES_OPCOES, URGENCIA_OPCOES } from './constantes';

export default function AbaSangue({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(SANGUE_VAZIA)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarSolicitacoesSangue(atendimento.atendimento_id)); setCarregando(false) }
  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function setHemo(item, campo, valor) {
    setDados((prev) => ({ ...prev, hemocomponentes: { ...prev.hemocomponentes, [item]: { ...prev.hemocomponentes[item], [campo]: valor } } }))
  }

  async function salvar() {
    if (!dados.indicacao_clinica.trim()) {
      setErro('Preencha ao menos a indicação clínica.')
      return
    }
    setErro('')
    setSalvando(true)
    const { indicacao_clinica, ...extra } = dados
    const { error } = await criarSolicitacaoSangue({
      atendimentoId: atendimento.atendimento_id, solicitadoPor: medicoId,
      dados: { indicacao_clinica, campos_extra: extra },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setDados(SANGUE_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Solicitação de Sangue, Componentes e Derivados</div>
      <div className="form-grid">
        <div className="form-field"><label>Peso</label><input type="text" value={dados.peso} onChange={(e) => set('peso', e.target.value)} /></div>
        <div className="form-field"><label>HB/HT</label><input type="text" placeholder="Ex: 6,4/20,9" value={dados.hb_ht} onChange={(e) => set('hb_ht', e.target.value)} /></div>
        <div className="form-field"><label>APT</label><input type="text" value={dados.apt} onChange={(e) => set('apt', e.target.value)} /></div>
        <div className="form-field"><label>ENFª/Leito</label><input type="text" value={dados.enf_leito} onChange={(e) => set('enf_leito', e.target.value)} /></div>
        <div className="form-field"><label>Registro hospitalar</label><input type="text" value={dados.registro_hospitalar} onChange={(e) => set('registro_hospitalar', e.target.value)} /></div>
        <div className="form-field"><label>Categoria</label><input type="text" value={dados.categoria} onChange={(e) => set('categoria', e.target.value)} /></div>

        <div className="form-field">
          <label>Recebeu transfusão?</label>
          <div className="toggle-group">
            {[['sim', 'Sim'], ['nao', 'Não']].map(([v, r]) => (
              <button key={v} type="button" className={`toggle-btn ${dados.recebeu_transfusao === v ? 'on' : ''}`} onClick={() => set('recebeu_transfusao', v)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="form-field"><label>Quando</label><input type="date" value={dados.quando} onChange={(e) => set('quando', e.target.value)} /></div>
        <div className="form-field"><label>Onde</label><input type="text" value={dados.onde} onChange={(e) => set('onde', e.target.value)} /></div>

        <div className="form-field">
          <label>Antecedentes de anticorpo irregular?</label>
          <div className="toggle-group">
            {[['sim', 'Sim'], ['nao', 'Não']].map(([v, r]) => (
              <button key={v} type="button" className={`toggle-btn ${dados.antecedentes_anticorpo === v ? 'on' : ''}`} onClick={() => set('antecedentes_anticorpo', v)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="form-field span-2"><label>Solicitou doadores?</label><input type="text" value={dados.solicitou_doadores} onChange={(e) => set('solicitou_doadores', e.target.value)} /></div>

        <div className="form-field span-3"><label>Indicação clínica / cirurgia proposta *</label><textarea value={dados.indicacao_clinica} onChange={(e) => set('indicacao_clinica', e.target.value)} /></div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Hemocomponentes / hemoderivados</div>
      {HEMOCOMPONENTES_OPCOES.map((item) => (
        <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <input
              type="checkbox"
              checked={!!dados.hemocomponentes[item]?.marcado}
              onChange={(e) => setHemo(item, 'marcado', e.target.checked)}
            />
            {item}
          </label>
          <input
            type="text"
            placeholder="Qtd/unid"
            style={{ width: 100 }}
            value={dados.hemocomponentes[item]?.quantidade || ''}
            onChange={(e) => setHemo(item, 'quantidade', e.target.value)}
          />
        </div>
      ))}
      <div className="form-grid" style={{ marginTop: 6 }}>
        <div className="form-field span-3"><label>Outros</label><input type="text" value={dados.outros_hemocomponentes} onChange={(e) => set('outros_hemocomponentes', e.target.value)} /></div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Urgência da solicitação</div>
      <div className="chip-group">
        {URGENCIA_OPCOES.map(([v, r]) => (
          <button key={v} type="button" className={`chip ${dados.urgencia === v ? 'on' : ''}`} onClick={() => set('urgencia', dados.urgencia === v ? '' : v)}>{r}</button>
        ))}
      </div>
      {dados.urgencia === 'cirurgia' && (
        <div className="form-grid" style={{ marginTop: 6 }}>
          <div className="form-field"><label>Data da cirurgia</label><input type="date" value={dados.cirurgia_data} onChange={(e) => set('cirurgia_data', e.target.value)} /></div>
          <div className="form-field"><label>Hora</label><input type="time" value={dados.cirurgia_hora} onChange={(e) => set('cirurgia_hora', e.target.value)} /></div>
        </div>
      )}
      {dados.urgencia === 'ambulatorial' && (
        <div className="form-grid" style={{ marginTop: 6 }}>
          <div className="form-field"><label>Data da transfusão ambulatorial</label><input type="date" value={dados.ambulatorial_data} onChange={(e) => set('ambulatorial_data', e.target.value)} /></div>
          <div className="form-field"><label>Hora</label><input type="time" value={dados.ambulatorial_hora} onChange={(e) => set('ambulatorial_hora', e.target.value)} /></div>
        </div>
      )}

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Transfusão de extrema urgência</div>
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <input type="checkbox" checked={dados.extrema_urgencia} onChange={(e) => set('extrema_urgencia', e.target.checked)} />
        Autorizo a transfusão sem testes pré-transfusionais, por risco de vida
      </label>
      {dados.extrema_urgencia && (
        <div className="form-grid">
          <div className="form-field"><label>Data</label><input type="date" value={dados.extrema_urgencia_data} onChange={(e) => set('extrema_urgencia_data', e.target.value)} /></div>
          <div className="form-field"><label>Hora</label><input type="time" value={dados.extrema_urgencia_hora} onChange={(e) => set('extrema_urgencia_hora', e.target.value)} /></div>
        </div>
      )}

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Coleta</div>
      <div className="form-grid">
        <div className="form-field span-2"><label>Coletado por</label><input type="text" value={dados.coletado_por} onChange={(e) => set('coletado_por', e.target.value)} /></div>
        <div className="form-field"><label>Data</label><input type="date" value={dados.coletado_data} onChange={(e) => set('coletado_data', e.target.value)} /></div>
        <div className="form-field"><label>Hora</label><input type="time" value={dados.coletado_hora} onChange={(e) => set('coletado_hora', e.target.value)} /></div>
      </div>

      <div className="form-section-title" style={{ fontSize: 12, marginTop: 16 }}>Uso exclusivo da Fundação Hemopa</div>
      <div className="form-grid">
        <div className="form-field"><label>PAI I</label><input type="text" value={dados.pai_i} onChange={(e) => set('pai_i', e.target.value)} /></div>
        <div className="form-field"><label>PAI II</label><input type="text" value={dados.pai_ii} onChange={(e) => set('pai_ii', e.target.value)} /></div>
        <div className="form-field"><label>AC</label><input type="text" value={dados.ac} onChange={(e) => set('ac', e.target.value)} /></div>
        <div className="form-field"><label>CD</label><input type="text" value={dados.cd} onChange={(e) => set('cd', e.target.value)} /></div>
        <div className="form-field span-2"><label>Responsável</label><input type="text" value={dados.responsavel_hemopa} onChange={(e) => set('responsavel_hemopa', e.target.value)} /></div>
        <div className="form-field"><label>Data</label><input type="date" value={dados.hemopa_data} onChange={(e) => set('hemopa_data', e.target.value)} /></div>
        <div className="form-field"><label>Hora</label><input type="time" value={dados.hemopa_hora} onChange={(e) => set('hemopa_hora', e.target.value)} /></div>
      </div>

      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar solicitação'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação registrada ainda.</p>
      ) : historico.map((s) => (
        <div key={s.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{s.indicacao_clinica}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {s.enfermeiros?.nome_exibicao || s.enfermeiros?.nome} · {new Date(s.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(s)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
