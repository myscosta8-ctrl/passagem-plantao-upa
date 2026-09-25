import { useEffect, useState } from 'react';
import { listarReceitasMedicas, criarReceitaMedica, listarCatalogoMedicamentos } from '../../lib/pepMedico';
import { RECEITA_ITEM_VAZIO, VIAS_RECEITA, TAGS_INSTRUCAO, RECEITA_TIPO_LABEL } from './constantes';

function AutocompleteMedicamentoReceita({ catalogo, valor, onChange, onSelecionar }) {
  const [aberto, setAberto] = useState(false)
  const termo = valor.trim().toLowerCase()
  const sugestoes = termo.length >= 2
    ? catalogo.filter((m) => m.nome.toLowerCase().includes(termo)).slice(0, 8)
    : []

  return (
    <div className="autocomplete-wrap">
      <input
        type="text"
        placeholder="Ex: Dipirona 1g"
        value={valor}
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
              <span className="autocomplete-item-nome">{m.nome}</span>
              <span className="autocomplete-item-sub">
                {m.forma_farmaceutica}
                {m.controlado ? ' · Controlado' : ''}
                {m.antimicrobiano ? ' · Antimicrobiano' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function classificarReceita(itens) {
  if (itens.some((it) => it.controlado)) return 'controle_especial'
  if (itens.some((it) => it.antimicrobiano)) return 'antimicrobiano'
  return 'simples'
}

export default function AbaReceituarioMedico({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [itens, setItens] = useState([{ ...RECEITA_ITEM_VAZIO }])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [catalogo, setCatalogo] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('todas')

  useEffect(() => { carregar() }, [])
  useEffect(() => { listarCatalogoMedicamentos().then(setCatalogo) }, [])
  async function carregar() { setCarregando(true); setHistorico(await listarReceitasMedicas(atendimento.atendimento_id)); setCarregando(false) }

  function setItem(i, campo, valor) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }
  function selecionarMedicamento(i, m) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, medicamento: m.nome, via: m.via_padrao || it.via, controlado: !!m.controlado, antimicrobiano: !!m.antimicrobiano } : it)))
  }
  function adicionarItem() { setItens((prev) => [...prev, { ...RECEITA_ITEM_VAZIO }]) }
  function removerItem(i) { setItens((prev) => prev.filter((_, idx) => idx !== i)) }

  const tipoClassificado = classificarReceita(itens)
  const historicoFiltrado = filtroTipo === 'todas' ? historico : historico.filter((r) => r.tipo === filtroTipo)

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
      dados: { itens: validos, tipo: classificarReceita(validos) },
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
          <p>Impressão em 2 vias — paciente e farmácia. Classificação de controlado/antimicrobiano é automática, a partir do catálogo.</p>
        </div>
      </div>

      <div className="cc-body">
        <div className="allergy-alert" style={{
          background: tipoClassificado === 'controle_especial' ? '#FEF2F2' : tipoClassificado === 'antimicrobiano' ? '#FFFBEB' : '#F0FDF4',
          borderColor: tipoClassificado === 'controle_especial' ? '#FECACA' : tipoClassificado === 'antimicrobiano' ? '#FDE68A' : '#BBF7D0',
        }}>
          <div className="info" style={{ color: tipoClassificado === 'controle_especial' ? '#DC2626' : tipoClassificado === 'antimicrobiano' ? '#92400E' : '#166534' }}>
            <i className="ph ph-tag" /> Classificação desta receita: <strong>{RECEITA_TIPO_LABEL[tipoClassificado]}</strong>
            {tipoClassificado === 'controle_especial' && ' — exige receituário de controle especial (Portaria 344/98), 2 vias'}
          </div>
        </div>

        {itens.map((it, i) => (
          <div key={i} className="form-section-box">
            <div className="form-section-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="ph ph-pill" /> {i + 1}) Medicamento</span>
              {(it.controlado || it.antimicrobiano) && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: it.controlado ? '#FEE2E2' : '#FEF3C7', color: it.controlado ? '#DC2626' : '#92400E' }}>
                  {it.controlado ? 'Controlado' : 'Antimicrobiano'}
                </span>
              )}
            </div>
            <div className="assess-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Medicamento</label>
                <AutocompleteMedicamentoReceita
                  catalogo={catalogo}
                  valor={it.medicamento}
                  onChange={(v) => setItem(i, 'medicamento', v)}
                  onSelecionar={(m) => selecionarMedicamento(i, m)}
                />
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
          <div className="form-section-box-title" style={{ position: 'static', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span><i className="ph ph-clock-counter-clockwise" /> Histórico</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className={`btn-add-chip ${filtroTipo === 'todas' ? 'on' : ''}`} onClick={() => setFiltroTipo('todas')}>Todas</button>
              {Object.entries(RECEITA_TIPO_LABEL).map(([tipo, label]) => (
                <button key={tipo} type="button" className={`btn-add-chip ${filtroTipo === tipo ? 'on' : ''}`} onClick={() => setFiltroTipo(tipo)}>{label}</button>
              ))}
            </div>
          </div>
          {carregando ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Carregando...</p>
          ) : historicoFiltrado.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum receituário registrado ainda.</p>
          ) : historicoFiltrado.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 4px' }}>
                    {(r.itens || []).map((it) => it.medicamento).join(', ')}
                    {r.tipo && r.tipo !== 'simples' && (
                      <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: r.tipo === 'controle_especial' ? '#FEE2E2' : '#FEF3C7', color: r.tipo === 'controle_especial' ? '#DC2626' : '#92400E' }}>
                        {RECEITA_TIPO_LABEL[r.tipo]}
                      </span>
                    )}
                  </p>
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
