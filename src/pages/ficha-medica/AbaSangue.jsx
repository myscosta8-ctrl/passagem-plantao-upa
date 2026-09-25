import { useEffect, useState } from 'react';
import { listarSolicitacoesSangue, criarSolicitacaoSangue } from '../../lib/pepMedico';
import { SANGUE_VAZIA, HEMOCOMPONENTES_OPCOES, URGENCIA_OPCOES } from './constantes';

// Protocolos transfusionais: preenchem SOMENTE o hemocomponente/quantidade
// padrão do bundle e a urgência associada. Nunca escrevem a indicação
// clínica (texto livre) — esse campo descreve o quadro real do paciente e
// deve continuar 100% manual, para não repetir o padrão do bug de dado
// fabricado já corrigido em outras abas (commit a3c5953). A autorização de
// extrema urgência (dispensa de testes pré-transfusionais) também nunca é
// marcada automaticamente, por ser uma decisão legal que exige ação
// deliberada do médico.
const PROTOCOLOS_TRANSFUSIONAIS = [
  { chave: 'anemia-grave', titulo: 'Anemia Aguda Grave', icon: 'ph-drop-half', hemocomponente: 'Concentrado de hemácias (+ 300 ml/unid)', quantidade: '01 UNIDADE', urgencia: 'urgencia' },
  { chave: 'choque-hemorragico', titulo: 'Choque Hemorrágico / Trauma', icon: 'ph-first-aid', hemocomponente: 'Concentrado de hemácias (+ 300 ml/unid)', quantidade: '02 UNIDADES', urgencia: 'urgencia' },
  { chave: 'plaquetopenia', titulo: 'Plaquetopenia Severa', icon: 'ph-warning', hemocomponente: 'Concentrado de plaquetas pobre em leucócitos(+ 60 ml/unid)', quantidade: '05 UNIDADES', urgencia: 'urgencia' },
]

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

  function aplicarProtocolo(protocolo) {
    setDados((prev) => ({
      ...prev,
      urgencia: protocolo.urgencia,
      hemocomponentes: {
        ...prev.hemocomponentes,
        [protocolo.hemocomponente]: { marcado: true, quantidade: protocolo.quantidade },
      },
    }))
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
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-drop" /> Solicitação de Sangue, Componentes e Derivados</h2>
          <p>Documento Oficial: Modelo 17 · Fundação HEMOPA</p>
        </div>
      </div>

      <div className="cc-body">
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-lightning" /> Protocolos Transfusionais</div>
          <p style={{ fontSize: 11.5, color: '#64748B', margin: '0 0 10px' }}>
            Pré-marca o hemocomponente/quantidade padrão do bundle e a urgência. Indicação clínica continua manual, e a autorização de extrema urgência nunca é marcada automaticamente.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PROTOCOLOS_TRANSFUSIONAIS.map((p) => (
              <button key={p.chave} type="button" className="btn-add-chip" onClick={() => aplicarProtocolo(p)}>
                <i className={`ph ${p.icon}`} /> {p.titulo}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-user" /> 1. Identificação e histórico transfusional</div>
          <div className="assess-grid">
            <div className="form-group"><label>Peso</label><input type="text" value={dados.peso} onChange={(e) => set('peso', e.target.value)} /></div>
            <div className="form-group"><label>HB/HT</label><input type="text" placeholder="Ex: 6,4/20,9" value={dados.hb_ht} onChange={(e) => set('hb_ht', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ marginTop: 12 }}>
            <div className="form-group"><label>APT</label><input type="text" value={dados.apt} onChange={(e) => set('apt', e.target.value)} /></div>
            <div className="form-group"><label>Enfermaria/Leito</label><input type="text" value={dados.enf_leito} onChange={(e) => set('enf_leito', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ marginTop: 12 }}>
            <div className="form-group"><label>Registro hospitalar</label><input type="text" value={dados.registro_hospitalar} onChange={(e) => set('registro_hospitalar', e.target.value)} /></div>
            <div className="form-group"><label>Categoria</label><input type="text" value={dados.categoria} onChange={(e) => set('categoria', e.target.value)} /></div>
          </div>

          <div className="assess-grid" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label>Recebeu transfusão anteriormente?</label>
              <select value={dados.recebeu_transfusao} onChange={(e) => set('recebeu_transfusao', e.target.value)}>
                <option value="">—</option>
                <option value="nao">NÃO</option>
                <option value="sim">SIM</option>
              </select>
            </div>
            <div className="form-group">
              <label>Antecedentes de anticorpo irregular?</label>
              <select value={dados.antecedentes_anticorpo} onChange={(e) => set('antecedentes_anticorpo', e.target.value)}>
                <option value="">—</option>
                <option value="nao">NÃO</option>
                <option value="sim">SIM</option>
              </select>
            </div>
          </div>
          {dados.recebeu_transfusao === 'sim' && (
            <div className="assess-grid" style={{ marginTop: 12 }}>
              <div className="form-group"><label>Quando</label><input type="date" value={dados.quando} onChange={(e) => set('quando', e.target.value)} /></div>
              <div className="form-group"><label>Onde</label><input type="text" value={dados.onde} onChange={(e) => set('onde', e.target.value)} /></div>
            </div>
          )}
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Solicitou doadores à família?</label>
            <input type="text" value={dados.solicitou_doadores} onChange={(e) => set('solicitou_doadores', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Indicação clínica / cirurgia proposta *</label>
            <textarea value={dados.indicacao_clinica} onChange={(e) => set('indicacao_clinica', e.target.value)} />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-drop" /> 2. Hemocomponentes / hemoderivados</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>Descrição</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', width: 140 }}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {HEMOCOMPONENTES_OPCOES.map((item) => (
                <tr key={item}>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-light)' }}>
                    <label className="checkbox-item" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                      <input
                        type="checkbox"
                        checked={!!dados.hemocomponentes[item]?.marcado}
                        onChange={(e) => setHemo(item, 'marcado', e.target.checked)}
                      />
                      {item}
                    </label>
                  </td>
                  <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Qtd/unid"
                      disabled={!dados.hemocomponentes[item]?.marcado}
                      value={dados.hemocomponentes[item]?.quantidade || ''}
                      onChange={(e) => setHemo(item, 'quantidade', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Outros</label>
            <input type="text" value={dados.outros_hemocomponentes} onChange={(e) => set('outros_hemocomponentes', e.target.value)} />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clock" /> 3. Caráter / urgência da transfusão</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {URGENCIA_OPCOES.map(([v, r]) => (
              <label key={v} className="checkbox-item" style={{ justifyContent: 'flex-start' }}>
                <input type="radio" name="urgencia_transfusao" checked={dados.urgencia === v} onChange={() => set('urgencia', v)} /> {r}
              </label>
            ))}
          </div>
          {dados.urgencia === 'cirurgia' && (
            <div className="assess-grid" style={{ marginTop: 12 }}>
              <div className="form-group"><label>Data da cirurgia</label><input type="date" value={dados.cirurgia_data} onChange={(e) => set('cirurgia_data', e.target.value)} /></div>
              <div className="form-group"><label>Hora</label><input type="time" value={dados.cirurgia_hora} onChange={(e) => set('cirurgia_hora', e.target.value)} /></div>
            </div>
          )}
          {dados.urgencia === 'ambulatorial' && (
            <div className="assess-grid" style={{ marginTop: 12 }}>
              <div className="form-group"><label>Data da transfusão ambulatorial</label><input type="date" value={dados.ambulatorial_data} onChange={(e) => set('ambulatorial_data', e.target.value)} /></div>
              <div className="form-group"><label>Hora</label><input type="time" value={dados.ambulatorial_hora} onChange={(e) => set('ambulatorial_hora', e.target.value)} /></div>
            </div>
          )}

          <div style={{ marginTop: 16, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 12 }}>
            <label className="checkbox-item" style={{ background: 'transparent', border: 'none', padding: 0, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={dados.extrema_urgencia} onChange={(e) => set('extrema_urgencia', e.target.checked)} />
              <span><i className="ph ph-warning-octagon" /> <strong>Transfusão de extrema urgência</strong> — autorizo a transfusão sem testes pré-transfusionais, por risco de vida</span>
            </label>
            {dados.extrema_urgencia && (
              <div className="assess-grid" style={{ marginTop: 12 }}>
                <div className="form-group"><label>Data</label><input type="date" value={dados.extrema_urgencia_data} onChange={(e) => set('extrema_urgencia_data', e.target.value)} /></div>
                <div className="form-group"><label>Hora</label><input type="time" value={dados.extrema_urgencia_hora} onChange={(e) => set('extrema_urgencia_hora', e.target.value)} /></div>
              </div>
            )}
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-signature" /> 4. Responsáveis e coleta de amostra</div>
          <div className="assess-grid">
            <div className="form-group"><label>Coletado por</label><input type="text" value={dados.coletado_por} onChange={(e) => set('coletado_por', e.target.value)} /></div>
            <div className="form-group"><label>Data</label><input type="date" value={dados.coletado_data} onChange={(e) => set('coletado_data', e.target.value)} /></div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Hora da coleta</label>
            <input type="time" value={dados.coletado_hora} onChange={(e) => set('coletado_hora', e.target.value)} />
          </div>
        </div>

        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-flask" /> Uso exclusivo da Fundação Hemopa</div>
          <div className="assess-grid">
            <div className="form-group"><label>PAI I</label><input type="text" value={dados.pai_i} onChange={(e) => set('pai_i', e.target.value)} /></div>
            <div className="form-group"><label>PAI II</label><input type="text" value={dados.pai_ii} onChange={(e) => set('pai_ii', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ marginTop: 12 }}>
            <div className="form-group"><label>AC</label><input type="text" value={dados.ac} onChange={(e) => set('ac', e.target.value)} /></div>
            <div className="form-group"><label>CD</label><input type="text" value={dados.cd} onChange={(e) => set('cd', e.target.value)} /></div>
          </div>
          <div className="assess-grid" style={{ marginTop: 12 }}>
            <div className="form-group"><label>Responsável</label><input type="text" value={dados.responsavel_hemopa} onChange={(e) => set('responsavel_hemopa', e.target.value)} /></div>
            <div className="form-group"><label>Data</label><input type="date" value={dados.hemopa_data} onChange={(e) => set('hemopa_data', e.target.value)} /></div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Hora</label>
            <input type="time" value={dados.hemopa_hora} onChange={(e) => set('hemopa_hora', e.target.value)} />
          </div>
        </div>

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}>
              <i className="ph ph-warning" /> {erro}
            </div>
          </div>
        )}

        <div>
          <div className="form-section-box-title" style={{ position: 'static', marginBottom: 8 }}><i className="ph ph-clock-counter-clockwise" /> Histórico</div>
          {carregando ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Carregando...</p>
          ) : historico.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma solicitação registrada ainda.</p>
          ) : historico.map((s) => (
            <div key={s.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.indicacao_clinica}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {s.enfermeiros?.nome_exibicao || s.enfermeiros?.nome} · {new Date(s.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
                <button type="button" className="btn-save-draft" onClick={() => onImprimir(s)}>
                  <i className="ph ph-printer" /> Imprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-footer">
        <span />
        <button className="btn-save-print" onClick={salvar} disabled={salvando}>
          <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Registrar solicitação'}
        </button>
      </div>
    </div>
  )
}
