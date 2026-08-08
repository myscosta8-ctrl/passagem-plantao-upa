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
  const [turno, setTurno] = useState('') // sem padrão — precisa ser escolhido
  const [profissionais, setProfissionais] = useState([])
  const [jaConfirmadosIds, setJaConfirmadosIds] = useState(new Set()) // já vinculados a este plantão por outra pessoa
  const [selecionados, setSelecionados] = useState(new Set())
  const [novoNome, setNovoNome] = useState('')
  const [novaCategoria, setNovaCategoria] = useState('Enfermeiro')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [verificandoEquipe, setVerificandoEquipe] = useState(false)

  useEffect(() => {
    carregarProfissionais()
  }, [])

  useEffect(() => {
    if (data && turno) verificarEquipeJaConfirmada()
    else setJaConfirmadosIds(new Set())
  }, [data, turno])

  async function carregarProfissionais() {
    const { data: lista } = await supabase
      .from('profissionais')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    setProfissionais(lista ?? [])
  }

  // Descobre se já existe um plantão pra essa data/turno, e quem já está confirmado nele
  async function verificarEquipeJaConfirmada() {
    setVerificandoEquipe(true)
    const { data: plantaoExistente } = await supabase
      .from('plantoes')
      .select('id')
      .eq('data', data)
      .eq('turno', turno)
      .maybeSingle()

    if (plantaoExistente) {
      const { data: vinculados } = await supabase
        .from('plantao_profissionais')
        .select('profissional_id')
        .eq('plantao_id', plantaoExistente.id)
      setJaConfirmadosIds(new Set((vinculados ?? []).map((v) => v.profissional_id)))
    } else {
      setJaConfirmadosIds(new Set())
    }
    setVerificandoEquipe(false)
  }

  function toggleSelecionado(id) {
    if (jaConfirmadosIds.has(id)) return // já confirmado por outra pessoa, não mexe
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

  const qtdEnfermeirosExigida = turno === 'Diurno' ? 3 : turno === 'Noturno' ? 2 : null

  const enfermeirosJaConfirmados = profissionais.filter(
    (p) => p.categoria === 'Enfermeiro' && jaConfirmadosIds.has(p.id)
  ).length
  const enfermeirosSelecionadosAgora = Array.from(selecionados).filter(
    (id) => profissionais.find((p) => p.id === id)?.categoria === 'Enfermeiro'
  ).length
  const totalEnfermeiros = enfermeirosJaConfirmados + enfermeirosSelecionadosAgora
  const equipeCompleta = qtdEnfermeirosExigida !== null && enfermeirosJaConfirmados >= qtdEnfermeirosExigida

  async function abrirPlantao() {
    setErro('')
    if (!turno) {
      setErro('Escolha o turno (Diurno ou Noturno) antes de continuar.')
      return
    }
    if (totalEnfermeiros !== qtdEnfermeirosExigida) {
      setErro(
        `O turno ${turno} precisa de exatamente ${qtdEnfermeirosExigida} enfermeiro(s) no total. Hoje esse plantão está com ${totalEnfermeiros}.`
      )
      return
    }
    setCarregando(true)

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

    const linhas = Array.from(selecionados).map((profissional_id) => ({
      plantao_id: plantaoId,
      profissional_id,
      encerrado: false,
    }))
    if (linhas.length > 0) {
      await supabase.from('plantao_profissionais').upsert(linhas, { onConflict: 'plantao_id,profissional_id' })
    }

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
            <label>Turno *</label>
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
            {!turno && <p style={{ fontSize: 12, color: 'var(--color-accent)', marginTop: 6 }}>Obrigatório escolher.</p>}
          </div>
        </div>

        {turno && (
          <>
            <div className="section-label">
              Profissionais presentes
              <span style={{ fontWeight: 400, color: totalEnfermeiros === qtdEnfermeirosExigida ? 'var(--color-success)' : 'var(--color-accent)' }}>
                {' '}— {totalEnfermeiros}/{qtdEnfermeirosExigida} enfermeiros ({turno})
              </span>
            </div>
            {enfermeirosJaConfirmados > 0 && (
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: -8, marginBottom: 10 }}>
                {enfermeirosJaConfirmados} já confirmado(s) por outra pessoa para esse plantão (marcados e travados abaixo).
              </p>
            )}
            <div className="profissionais-lista">
              {verificandoEquipe && (
                <div style={{ padding: 10, color: 'var(--color-text-muted)', fontSize: 13.5 }}>Verificando equipe...</div>
              )}
              {!verificandoEquipe && profissionais.length === 0 && (
                <div style={{ padding: 10, color: 'var(--color-text-muted)', fontSize: 13.5 }}>
                  Nenhum profissional cadastrado ainda. Adicione abaixo.
                </div>
              )}
              {!verificandoEquipe && profissionais.map((p) => {
                const jaConfirmado = jaConfirmadosIds.has(p.id)
                const desabilitadoPorLimite = !jaConfirmado && p.categoria === 'Enfermeiro' && equipeCompleta && !selecionados.has(p.id)
                return (
                  <label
                    className="profissional-item"
                    key={p.id}
                    style={{ opacity: desabilitadoPorLimite ? 0.45 : 1, cursor: jaConfirmado || desabilitadoPorLimite ? 'not-allowed' : 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={jaConfirmado || selecionados.has(p.id)}
                      disabled={jaConfirmado || desabilitadoPorLimite}
                      onChange={() => toggleSelecionado(p.id)}
                    />
                    <span className="profissional-nome">
                      {p.nome} {jaConfirmado && <span style={{ fontSize: 11, color: 'var(--color-success)' }}>(já confirmado)</span>}
                    </span>
                    <span className="profissional-categoria">{p.categoria}</span>
                  </label>
                )
              })}
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
          </>
        )}

        <button className="submit-btn" onClick={abrirPlantao} disabled={carregando || !turno || totalEnfermeiros !== qtdEnfermeirosExigida}>
          {carregando ? 'Abrindo...' : 'Abrir plantão'}
        </button>
        {turno && (
          <p className="hint">
            O turno {turno} exige exatamente {qtdEnfermeirosExigida} enfermeiro(s) no total (contando quem já foi confirmado por outra pessoa). Técnicos não entram nesse número.
          </p>
        )}
      </div>
    </div>
  )
}
