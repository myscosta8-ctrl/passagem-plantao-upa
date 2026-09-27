import { useEffect, useState } from 'react';
import { listarReceitasMedicas, criarReceitaMedica, listarCatalogoMedicamentos, buscarCabecalhoImpressao } from '../../lib/pepMedico';
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
                {m.controlado ? ' · Controlado (Lista C1)' : ''}
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
  if (itens.some((it) => it.antimicrobiano)) return 'antimicrobiano'
  return 'simples'
}

export default function AbaReceituarioMedico({ atendimento, medicoId, onImprimir, onFechar, subTabExterno, onSubTab, onPulseControle }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [subTabInterno, setSubTabInterno] = useState('simples') // 'simples' | 'controle'
  const controlado = subTabExterno !== undefined
  const subTab = controlado ? subTabExterno : subTabInterno
  const setSubTab = controlado ? onSubTab : setSubTabInterno
  const [itensSimples, setItensSimples] = useState([{ ...RECEITA_ITEM_VAZIO }])
  const [itensControle, setItensControle] = useState([])
  const [enderecoPaciente, setEnderecoPaciente] = useState('')
  const [pulseControle, setPulseControle] = useState(false)
  const [aviso, setAviso] = useState(null) // { medicamento }
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [catalogo, setCatalogo] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('todas')

  useEffect(() => { carregar() }, [])
  useEffect(() => { listarCatalogoMedicamentos().then(setCatalogo) }, [])
  useEffect(() => {
    buscarCabecalhoImpressao(atendimento.atendimento_id).then(({ pessoa }) => {
      const partes = [pessoa?.endereco, pessoa?.endereco_numero, pessoa?.bairro, pessoa?.cidade].filter(Boolean)
      if (partes.length > 0) setEnderecoPaciente(partes.join(', '))
    }).catch(() => {})
  }, [atendimento.atendimento_id])

  async function carregar() { setCarregando(true); setHistorico(await listarReceitasMedicas(atendimento.atendimento_id)); setCarregando(false) }

  const itensAtivos = subTab === 'simples' ? itensSimples : itensControle
  const setItensAtivos = subTab === 'simples' ? setItensSimples : setItensControle

  function setItem(i, campo, valor) {
    setItensAtivos((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }

  function selecionarMedicamento(i, m) {
    const dadosMed = { medicamento: m.nome, via: m.via_padrao || 'ORAL', controlado: !!m.controlado, antimicrobiano: !!m.antimicrobiano }

    if (subTab === 'simples' && m.controlado) {
      // Bloqueio de mistura (Portaria 344/98): medicamento de Lista C1 não pode
      // entrar na receita comum — move automaticamente para o Controle Especial.
      setItensSimples((prev) => {
        const resto = prev.filter((_, idx) => idx !== i)
        return resto.length > 0 ? resto : [{ ...RECEITA_ITEM_VAZIO }]
      })
      setItensControle((prev) => [...prev, { ...RECEITA_ITEM_VAZIO, ...dadosMed }])
      setAviso({ medicamento: m.nome })
      setPulseControle(true)
      onPulseControle?.(true)
      setTimeout(() => setAviso(null), 5000)
      setTimeout(() => { setPulseControle(false); onPulseControle?.(false) }, 3000)
      setTimeout(() => setSubTab('controle'), 1500)
      return
    }

    setItensAtivos((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...dadosMed } : it)))
  }

  function adicionarItem() { setItensAtivos((prev) => [...prev, { ...RECEITA_ITEM_VAZIO }]) }
  function removerItem(i) { setItensAtivos((prev) => prev.filter((_, idx) => idx !== i)) }

  const tipoClassificado = subTab === 'controle' ? 'controle_especial' : classificarReceita(itensSimples)
  const historicoFiltrado = filtroTipo === 'todas' ? historico : historico.filter((r) => r.tipo === filtroTipo)

  function appendTag(i, tag) {
    setItensAtivos(prev => prev.map((it, idx) => {
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

  async function salvar(imprimir = false) {
    const validos = itensAtivos.filter((it) => it.medicamento.trim())
    if (validos.length === 0) { setErro('Adicione ao menos um medicamento.'); return }
    if (subTab === 'controle' && !enderecoPaciente.trim()) {
      setErro('Endereço do paciente é obrigatório para o receituário de Controle Especial (Portaria 344/98).')
      return
    }
    setErro('')
    setSalvando(true)
    const dados = { itens: validos, tipo: subTab === 'controle' ? 'controle_especial' : classificarReceita(validos) }
    // A tabela receitas_medicas não tem coluna própria de endereço; guardamos
    // no campo livre orientacoes_gerais para não exigir migration de schema.
    if (subTab === 'controle') dados.orientacoes_gerais = `Endereço do paciente: ${enderecoPaciente}`
    const { data, error } = await criarReceitaMedica({
      atendimentoId: atendimento.atendimento_id, criadoPor: medicoId,
      dados,
    })
    setSalvando(false)
    if (error) { setErro('Não foi possível salvar. Tente de novo.'); console.error(error); return }
    if (imprimir && data) onImprimir(data)
    if (subTab === 'simples') setItensSimples([{ ...RECEITA_ITEM_VAZIO }])
    else setItensControle([])
    carregar()
  }

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-body">
        {aviso && (
          <div className="allergy-alert" style={{ background: '#FFF7ED', borderColor: '#FDE68A' }}>
            <div className="info" style={{ color: '#92400E' }}>
              <i className="ph ph-warning-circle" /> <strong>Bloqueio de Mistura (Portaria 344/98):</strong> {aviso.medicamento} pertence à Lista C1 e não pode ser misturada com a receita comum — movida automaticamente para o Receituário de Controle Especial.
            </div>
          </div>
        )}

        <div className="allergy-alert" style={{
          background: tipoClassificado === 'controle_especial' ? '#FEF2F2' : tipoClassificado === 'antimicrobiano' ? '#FFFBEB' : '#F0FDF4',
          borderColor: tipoClassificado === 'controle_especial' ? '#FECACA' : tipoClassificado === 'antimicrobiano' ? '#FDE68A' : '#BBF7D0',
        }}>
          <div className="info" style={{ color: tipoClassificado === 'controle_especial' ? '#DC2626' : tipoClassificado === 'antimicrobiano' ? '#92400E' : '#166534' }}>
            <i className="ph ph-tag" /> Classificação desta guia: <strong>{RECEITA_TIPO_LABEL[tipoClassificado]}</strong>
            {tipoClassificado === 'controle_especial' && <> — exige receituário de controle especial (Portaria 344/98) <span className="badge-2vias">Imprime em 2 Vias</span></>}
          </div>
        </div>

        {subTab === 'controle' && (
          <div className="form-group" style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid var(--border-light, #E2E8F0)' }}>
            <label>Endereço do Paciente (obrigatório para Receita de Controle Especial) *</label>
            <input type="text" placeholder="Rua, número, bairro, cidade" value={enderecoPaciente} onChange={(e) => setEnderecoPaciente(e.target.value)} />
          </div>
        )}

        {itensAtivos.map((it, i) => (
          <div key={i} className="form-section-box">
            <div className="form-section-box-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="ph ph-pill" /> {i + 1}) Medicamento</span>
              {(it.controlado || it.antimicrobiano) && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: it.controlado ? '#FEE2E2' : '#FEF3C7', color: it.controlado ? '#DC2626' : '#92400E' }}>
                  {it.controlado ? 'Controlado (Lista C1)' : 'Antimicrobiano'}
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
                <label>Posologia / Instrução de uso</label>
                <input type="text" placeholder="Ex: Tomar 1 comprimido ao dia" value={it.instrucao} onChange={(e) => setItem(i, 'instrucao', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input type="text" placeholder="Ex: 01 (um) Frasco" value={it.quantidade || ''} onChange={(e) => setItem(i, 'quantidade', e.target.value)} />
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

            {itensAtivos.length > 1 && (
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
        <div>
          <button type="button" className="btn-cancel" onClick={onFechar}>
            <i className="ph ph-x-circle" /> Cancelar
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
            <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
          </button>
        </div>
      </div>
    </div>
  )
}
