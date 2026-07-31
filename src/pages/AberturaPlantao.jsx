import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './AberturaPlantao.css'

function hojeISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export default function AberturaPlantao({ onPlantaoAberto }) {
  const [data, setData] = useState(hojeISO())
  const [turno, setTurno] = useState('Diurno')
  const [profissionais, setProfissionais] = useState([])
  const [selecionados, setSelecionados] = useState(new Set())
  const [novoNome, setNovoNome] = useState('')
  const [novaCategoria, setNovaCategoria] = useState('Enfermeiro')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    carregarProfissionais()
  }, [])

  async function carregarProfissionais() {
    const { data: lista } = await supabase
      .from('profissionais')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    setProfissionais(lista ?? [])
  }

  function toggleSelecionado(id) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function adicionarProfissional() {
    const nome = novoNome.trim()
    if (!nome) return
    const { data: novo, error } = await supabase
      .from('profissionais')
      .insert({ nome, categoria: novaCategoria })
      .select()
      .single()
    if (error) {
      setErro('Não foi possível adicionar o profissional.')
      return
    }
    setProfissionais((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)))
    setSelecionados((prev) => new Set(prev).add(novo.id))
    setNovoNome('')
  }

  const qtdEnfermeirosExigida = turno === 'Diurno' ? 3 : 2
  const enfermeirosSelecionados = Array.from(selecionados).filter(
    (id) => profissionais.find((p) => p.id === id)?.categoria === 'Enfermeiro'
  ).length

  async function abrirPlantao() {
    setErro('')
    if (enfermeirosSelecionados !== qtdEnfermeirosExigida) {
      setErro(
        `O turno ${turno} precisa de exatamente ${qtdEnfermeirosExigida} enfermeiro(s) selecionado(s). Você marcou ${enfermeirosSelecionados}.`
      )
      return
    }
    setCarregando(true)

    // Busca plantão existente (data + turno) ou cria um novo
    let plantaoId
    const { data: existente } = await supabase
      .from('plantoes')
      .select('id')
      .eq('data', data)
      .eq('turno', turno)
      .maybeSingle()

    if (existente) {
      plantaoId = existente.id
    } else {
      const { data: criado, error: criarErro } = await supabase
        .from('plantoes')
        .insert({ data, turno })
        .select()
        .single()
      if (criarErro) {
        setErro('Não foi possível abrir o plantão.')
        setCarregando(false)
        return
      }
      plantaoId = criado.id
    }

    // Garante os profissionais marcados vinculados a este plantão (sem duplicar)
    const linhas = Array.from(selecionados).map((profissional_id) => ({
      plantao_id: plantaoId,
      profissional_id,
      encerrado: false,
    }))
    await supabase.from('plantao_profissionais').upsert(linhas, { onConflict: 'plantao_id,profissional_id' })

    setCarregando(false)
    onPlantaoAberto({ id: plantaoId, data, turno })
  }

  return (
    <div className="page">
      <h1 className="page-title">Abrir plantão</h1>
      <p className="page-subtitle">Confirme a data, o turno e quem está presente hoje.</p>

      <div className="card">
        {erro && <div className="error-box">{erro}</div>}

        <div className="field-row">
          <div className="field">
            <label htmlFor="data">Data</label>
            <input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="field">
            <label>Turno</label>
            <div className="turno-toggle">
              {['Diurno', 'Noturno'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`turno-btn ${turno === t ? 'active' : ''}`}
                  onClick={() => setTurno(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="section-label">
          Profissionais presentes
          <span style={{ fontWeight: 400, color: enfermeirosSelecionados === qtdEnfermeirosExigida ? 'var(--color-success)' : 'var(--color-accent)' }}>
            {' '}— {enfermeirosSelecionados}/{qtdEnfermeirosExigida} enfermeiros ({turno})
          </span>
        </div>
        <div className="profissionais-lista">
          {profissionais.length === 0 && (
            <div style={{ padding: 10, color: 'var(--color-text-muted)', fontSize: 13.5 }}>
              Nenhum profissional cadastrado ainda. Adicione abaixo.
            </div>
          )}
          {profissionais.map((p) => (
            <label className="profissional-item" key={p.id}>
              <input
                type="checkbox"
                checked={selecionados.has(p.id)}
                onChange={() => toggleSelecionado(p.id)}
              />
              <span className="profissional-nome">{p.nome}</span>
              <span className="profissional-categoria">{p.categoria}</span>
            </label>
          ))}
        </div>

        <div className="add-profissional">
          <input
            type="text"
            placeholder="Nome do profissional"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarProfissional())}
          />
          <select value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)}>
            <option>Enfermeiro</option>
            <option>Técnico</option>
          </select>
          <button type="button" onClick={adicionarProfissional}>+ Adicionar</button>
        </div>

        <button className="submit-btn" onClick={abrirPlantao} disabled={carregando || enfermeirosSelecionados !== qtdEnfermeirosExigida}>
          {carregando ? 'Abrindo...' : 'Abrir plantão'}
        </button>
        <p className="hint">
          O turno {turno} exige exatamente {qtdEnfermeirosExigida} enfermeiro(s) marcado(s) (técnicos não contam nesse número, mas podem ser adicionados à vontade).
          Se já existe um plantão aberto para essa data e turno, os profissionais marcados são adicionados a ele.
        </p>
      </div>
    </div>
  )
}
