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
    <div className="form-section">
      <div className="form-section-title">Novo receituário</div>
      {itens.map((it, i) => (
        <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <div className="form-grid" style={{ marginBottom: 8 }}>
            <div className="form-field span-4"><label>{i + 1}) Medicamento</label><input type="text" placeholder="Ex: Dipirona 1g" value={it.medicamento} onChange={(e) => setItem(i, 'medicamento', e.target.value)} /></div>
            <div className="form-field span-2">
              <label>Via de Administração</label>
              <select value={it.via || 'ORAL'} onChange={(e) => setItem(i, 'via', e.target.value)}>
                {VIAS_RECEITA.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-field span-6"><label>Instrução de uso</label><input type="text" placeholder="Ex: Tomar 1 comprimido ao dia" value={it.instrucao} onChange={(e) => setItem(i, 'instrucao', e.target.value)} /></div>
          </div>
          
          <div style={{ backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 11 }}>
             <div style={{ marginBottom: 4, fontWeight: 600, color: '#475569' }}>Construtores Rápidos de Posologia (Clique para preencher)</div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
               {Object.entries(TAGS_INSTRUCAO).map(([grupo, tags]) => (
                 <div key={grupo} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                   {tags.map(tag => (
                     <button key={tag} type="button" onClick={() => appendTag(i, tag)}
                        style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '3px 8px', borderRadius: 12, cursor: 'pointer', fontSize: 11, color: '#334155' }}>
                        {tag}
                     </button>
                   ))}
                   <span style={{ color: '#cbd5e1', marginLeft: 2, marginRight: 2 }}>|</span>
                 </div>
               ))}
             </div>
          </div>

          {itens.length > 1 && <div style={{ marginTop: 8 }}><button type="button" className="modal-btn-secondary" onClick={() => removerItem(i)}>Remover item</button></div>}
        </div>
      ))}
      <button type="button" className="modal-btn-secondary" onClick={adicionarItem}>+ Adicionar medicamento</button>

      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Registrar receituário'}</button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum receituário registrado ainda.</p>
      ) : historico.map((r) => (
        <div key={r.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px' }}>{(r.itens || []).map((it) => it.medicamento).join(', ')}</p>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {r.enfermeiros?.nome_exibicao || r.enfermeiros?.nome} · {new Date(r.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>
            <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(r)}>Imprimir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
