import { usePainel } from './PainelContext'
import { sinaisDoLeito, FILTROS_RESUMO } from './sinaisLeito'

// Faixa de resumo do plantão; cada indicador também filtra os cards.
export default function PainelResumo({ setoresVisiveis }) {
  const { leitos, pacientesPorLeito, passagemPorPaciente, indicadoresPorPaciente, filtroResumo, setFiltroResumo } = usePainel()
  const idsSetores = new Set((setoresVisiveis || []).map((s) => s.id))
  const doSetor = (leitos || []).filter((l) => idsSetores.has(l.setor_id))
  const ocupados = doSetor.filter((l) => pacientesPorLeito[l.id])
  const sinais = ocupados.map((l) => {
    const p = pacientesPorLeito[l.id]
    return sinaisDoLeito(p, passagemPorPaciente[p.id], indicadoresPorPaciente[p.id])
  })
  const conta = (k) => sinais.filter(FILTROS_RESUMO[k]).length

  const itens = [
    { k: null, icone: 'ph-bed', rotulo: `${ocupados.length}/${doSetor.length} ocupados`, tom: 'neutro' },
    { k: 'prescricao', icone: 'ph-prescription', rotulo: `${conta('prescricao')} sem prescrição do dia`, tom: conta('prescricao') ? 'critico' : 'ok' },
    { k: 'alertas', icone: 'ph-warning', rotulo: `${conta('alertas')} com alerta`, tom: conta('alertas') ? 'atencao' : 'ok' },
    { k: 'alergia', icone: 'ph-warning-circle', rotulo: `${conta('alergia')} com alergia`, tom: 'neutro' },
    { k: 'isolamento', icone: 'ph-virus', rotulo: `${conta('isolamento')} em isolamento`, tom: 'neutro' },
    { k: 'regulacao', icone: 'ph-ambulance', rotulo: `${conta('regulacao')} em regulação`, tom: 'neutro' },
    { k: 'pendencias', icone: 'ph-flask', rotulo: `${conta('pendencias')} com exames/pendências`, tom: 'neutro' },
    { k: 'conferir', icone: 'ph-hourglass', rotulo: `${conta('conferir')} passagens a conferir`, tom: 'neutro' },
  ]

  return (
    <div className="pl-resumo no-print">
      {itens.map((it) => (
        <button
          key={it.rotulo}
          type="button"
          className={`pl-resumo-item ${it.tom} ${filtroResumo === it.k && it.k ? 'ativo' : ''}`}
          onClick={() => setFiltroResumo(it.k && filtroResumo !== it.k ? it.k : null)}
          title={it.k ? 'Clique para mostrar só esses leitos' : 'Mostrar todos'}
        >
          <i className={`ph ${it.icone}`} /> {it.rotulo}
        </button>
      ))}
      {filtroResumo && <button type="button" className="pl-resumo-limpar" onClick={() => setFiltroResumo(null)}><i className="ph ph-x" /> Limpar filtro</button>}
    </div>
  )
}
