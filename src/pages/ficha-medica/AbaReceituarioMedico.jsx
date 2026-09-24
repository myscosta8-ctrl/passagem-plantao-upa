import { useEffect, useState } from 'react';
import { listarReceitasMedicas, criarReceitaMedica } from '../../lib/pepMedico';
import { RECEITA_ITEM_VAZIO, VIAS_RECEITA, TAGS_INSTRUCAO } from './constantes';

export default function AbaReceituarioMedico({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [itens, setItens] = useState([{ ...RECEITA_ITEM_VAZIO }])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarReceitasMedicas(atendimento.atendimento_id)); setCarregando(false) }

  function setItem(i, campo, valor) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }
  function adicionarItem() { setItens((prev) => [...prev, { ...RECEITA_ITEM_VAZIO }]) }
  function removerItem(i) { setItens((prev) => prev.filter((_, idx) => idx !== i)) }

  function appendTag(i, tag) {
    setItens(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      let cur = it.instrucao || '';
      cur = cur.trim();
      const needsSpace = cur.length > 0 && !cur.endsWith(' ');
      const prefix = needsSpace ? (cur.endsWith(',') ? ' ' : ', ') : '';
      let textToAdd = tag;
      if (cur.length === 0) {
        textToAdd = textToAdd.charAt(0).toUpperCase() + textToAdd.slice(1);
      } else {
        textToAdd = textToAdd.toLowerCase();
      }
      return { ...it, instrucao: cur + prefix + textToAdd };
    }));
  }

  async function salvar() {
    const validos = itens.filter((it) => it.medicamento.trim())
    if (validos.length === 0) { setErro('Adicione ao menos um medicamento.'); return }
    setErro('')
    setSalvando(true)
    const { error } = await criarReceitaMedica({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados: { itens: validos },
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    setItens([{ ...RECEITA_ITEM_VAZIO }])
    carregar()
  }

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-file-text" /> Receituário Médico</h2>
          <p>Impressão em 2 vias — paciente e farmácia.</p>
        </div>
      </div>

      <div className="cc-body">
        {itens.map((it, i) => (
          <div key={i} className="form-section-box">
            <div className="form-section-box-title"><i className="ph ph-pill" /> {i + 1}) Medicamento</div>
            <div className="assess-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Medicamento</label>
                <input type="text" placeholder="Ex: Dipirona 1g" value={it.medicamento} onChange={(e) => setItem(i, 'medicamento', e.target.value)} />
              </div>
            </div>
            <div className="assess-grid" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label><i className="ph ph-syringe" /> Via de administração</label>
                <select value={it.via || 'ORAL'} onChange={(e) => setItem(i, 'via', e.target.value)}>
                  {VIAS_RECEITA.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Instrução de uso</label>
                <input type="text" placeholder="Ex: Tomar 1 comprimido ao dia" value={it.instrucao} onChange={(e) => setItem(i, 'instrucao', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>
                <i className="ph ph-magic-wand" /> Construtores rápidos de posologia (clique para preencher)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(TAGS_INSTRUCAO).map(([grupo, tags]) => (
                  <div key={grupo} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {tags.map(tag => (
                      <button key={tag} type="button" className="btn-add-chip" style={{ border: '1px solid var(--border-strong)', borderRadius: 12 }} onClick={() => appendTag(i, tag)}>
                        {tag}
                      </button>
                    ))}
                    <span style={{ color: 'var(--border-strong)', marginLeft: 2, marginRight: 2 }}>|</span>
                  </div>
                ))}
              </div>
            </div>

            {itens.length > 1 && (
              <button type="button" className="btn-cancel" style={{ marginTop: 12 }} onClick={() => removerItem(i)}>
                <i className="ph ph-trash" /> Remover item
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-add-chip" onClick={adicionarItem}>
          <i className="ph ph-plus" /> Adicionar medicamento
        </button>

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
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum receituário registrado ainda.</p>
          ) : historico.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 4px' }}>{(r.itens || []).map((it) => it.medicamento).join(', ')}</p>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {r.enfermeiros?.nome_exibicao || r.enfermeiros?.nome} · {new Date(r.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
                <button type="button" className="btn-save-draft" onClick={() => onImprimir(r)}>
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
          <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Registrar receituário'}
        </button>
      </div>
    </div>
  )
}
