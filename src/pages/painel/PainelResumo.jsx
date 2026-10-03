import { usePainel } from './PainelContext'
import { sinaisDoLeito, FILTROS_RESUMO } from './sinaisLeito'
import { contarSetores } from './setoresPainel.js'

// Topo do painel: escolha do setor (Todos + um botão por setor, com a ocupação de cada um) e,
// logo abaixo, os alertas do plantão em formato compacto. Os alertas contam só o setor
// escolhido e cada um também filtra os cards. Substitui o seletor de setor que ficava dentro
// de "Filtrar".
export default function PainelResumo({ setoresVisiveis }) {
  const { enfermeiro, leitos, pacientesPorLeito, passagemPorPaciente, indicadoresPorPaciente, filtroResumo, setFiltroResumo, setorFiltro, setSetorFiltro } = usePainel()
  const setores = contarSetores(setoresVisiveis, leitos, pacientesPorLeito)
  // Setor escolhido que deixou de existir na lista (ex.: troca de plantão): volta para Todos.
  const setorAtivo = setores.some((s) => s.id === setorFiltro) ? setorFiltro : ''
  const idsSetores = new Set(setorAtivo ? [setorAtivo] : setores.map((s) => s.id))
  const doSetor = (leitos || []).filter((l) => idsSetores.has(l.setor_id))
  const ocupados = doSetor.filter((l) => pacientesPorLeito[l.id])
  const sinais = ocupados.map((l) => {
    const p = pacientesPorLeito[l.id]
    return sinaisDoLeito(p, passagemPorPaciente[p.id], indicadoresPorPaciente[p.id])
  })
  const conta = (k) => sinais.filter(FILTROS_RESUMO[k]).length
  const totalOcupados = setores.reduce((a, s) => a + s.ocupados, 0)
  const totalLeitos = setores.reduce((a, s) => a + s.total, 0)

  const novaUI = enfermeiro?.pep_beta === true
  const alertas = novaUI ? [
    { k: 'prescricao', icone: 'ph-prescription', r: 'sem prescrição do dia', critico: true },
    { k: 'isolamento', icone: 'ph-virus', r: 'em isolamento' },
    { k: 'conferir', icone: 'ph-hourglass', r: 'passagens a conferir' },
  ] : [
    { k: 'prescricao', icone: 'ph-prescription', r: 'sem prescrição do dia', critico: true },
    { k: 'alertas', icone: 'ph-warning', r: 'com alerta' },
    { k: 'alergia', icone: 'ph-warning-circle', r: 'com alergia' },
    { k: 'isolamento', icone: 'ph-virus', r: 'em isolamento' },
    { k: 'conferir', icone: 'ph-hourglass', r: 'passagens a conferir' },
  ]
  const escolherSetor = (id) => { setSetorFiltro(id); setFiltroResumo(null) }
  const p = novaUI ? 'pv' : 'pl'

  return (
    <div className={`${p}-topo-painel no-print`}>
      <div className={`${p}-setores`} role="group" aria-label="Setor">
        <button type="button" className={`${p}-setor-btn ${!setorAtivo ? 'ativo' : ''}`} aria-pressed={!setorAtivo} onClick={() => escolherSetor('')}>
          <span>Todos</span><b>{totalOcupados}/{totalLeitos}</b>
        </button>
        {setores.map((s) => (
          <button key={s.id} type="button" className={`${p}-setor-btn ${setorAtivo === s.id ? 'ativo' : ''}`} aria-pressed={setorAtivo === s.id} onClick={() => escolherSetor(s.id)}>
            <span>{s.nome}</span><b>{s.ocupados}/{s.total}</b>
          </button>
        ))}
      </div>
      <div className={`${p}-avisos`}>
        {alertas.map((a) => {
          const n = conta(a.k)
          return (
            <button key={a.k} type="button" className={`${p}-aviso ${n ? 'tem' : 'zero'} ${a.critico && n ? 'critico' : ''} ${filtroResumo === a.k ? 'ativo' : ''}`}
              onClick={() => setFiltroResumo(filtroResumo !== a.k ? a.k : null)} title="Clique para mostrar só esses leitos">
              <i className={`ph ${a.icone}`} /><b>{n}</b> {a.r}
            </button>
          )
        })}
        {filtroResumo && <button type="button" className={`${p}-aviso limpar`} onClick={() => setFiltroResumo(null)}><i className="ph ph-x" /> Limpar</button>}
      </div>
    </div>
  )
}
