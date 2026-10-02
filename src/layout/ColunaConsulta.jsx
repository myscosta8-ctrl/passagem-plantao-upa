import { useEvolucoes, useEvolucoesMedicas, usePrescricoes, useExames } from '../lib/consultasPaciente'

// Coluna de consulta à direita da janela flutuante (mockup 02): só leitura.
// Última evolução da categoria, prescrição vigente e exames solicitados.
const fmt = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')
const nomeProf = (e) => (e ? e.nome_exibicao || e.nome : null)
const finalizado = (r) => (r.situacao || 'finalizado') === 'finalizado'

export default function ColunaConsulta({ atendimentoId, categoria }) {
  // Cache entre abas (lib/cache.js): undefined = carregando; gravar um documento atualiza sozinho.
  const medico = categoria === 'medico'
  const qEvoMed = useEvolucoesMedicas(medico ? atendimentoId : null)
  const qEvoEnf = useEvolucoes(medico ? null : atendimentoId)
  const listaEvo = (medico ? qEvoMed : qEvoEnf).data
  const listaPresc = usePrescricoes(atendimentoId).data
  const listaExames = useExames(atendimentoId).data
  const evo = listaEvo === undefined ? undefined : (listaEvo.filter(finalizado).filter((r) => medico || r.tipo !== 'medico')[0] || null)
  const presc = listaPresc === undefined ? undefined : (listaPresc.filter(finalizado).find((p) => !p.cancelada_em && !p.cancelado_em) || null)
  const exames = listaExames === undefined ? undefined : listaExames.filter(finalizado).slice(0, 6)

  const textoEvo = evo ? (categoria === 'medico' ? [evo.evolucao_dia, evo.conduta_medica].filter(Boolean).join(' — ') : evo.texto) : ''
  const itens = (presc?.prescricao_itens || []).filter((i) => i.status !== 'suspenso' && i.status !== 'cancelado')

  return (
    <aside className="cc-col">
      <section className="cc-bloco">
        <h4>Última evolução{evo ? ` · ${fmt(evo.data_registro || evo.criado_em)}` : ''}</h4>
        {evo === undefined ? <p className="cc-vazio">Carregando…</p> : !evo ? <p className="cc-vazio">Nenhuma evolução finalizada.</p> : (
          <>
            <p className="cc-texto">{textoEvo || '—'}</p>
            {nomeProf(evo.enfermeiros) && <p className="cc-autor">{nomeProf(evo.enfermeiros)}</p>}
          </>
        )}
      </section>
      <section className="cc-bloco">
        <h4>Prescrição vigente{presc ? ` · ${fmt(presc.data_registro || presc.criado_em)}` : ''}</h4>
        {presc === undefined ? <p className="cc-vazio">Carregando…</p> : itens.length === 0 ? <p className="cc-vazio">Nenhuma prescrição finalizada.</p> : (
          <ul>{itens.map((i) => <li key={i.id}>{[i.medicamento_nome, [i.dose, i.dose_unidade].filter(Boolean).join(' '), i.via, i.frequencia].filter(Boolean).join(' ')}</li>)}</ul>
        )}
      </section>
      <section className="cc-bloco">
        <h4>Exames solicitados</h4>
        {exames === undefined ? <p className="cc-vazio">Carregando…</p> : exames.length === 0 ? <p className="cc-vazio">Nenhum exame solicitado.</p> : (
          <ul>{exames.map((e) => <li key={e.id}>{e.nome || (Array.isArray(e.exames) ? e.exames.map((x) => (typeof x === 'string' ? x : x?.nome || x?.exame || '')).filter(Boolean).join(', ') : (typeof e.exames === 'string' ? e.exames : '')) || e.modalidade || 'Exame'}<span className={'cc-st ' + (e.concluido_em || e.resultado || e.laudo_resultado ? 'ok' : '')}>{e.concluido_em || e.resultado || e.laudo_resultado ? ' · resultado disponível' : ' · aguardando'}</span></li>)}</ul>
        )}
      </section>
    </aside>
  )
}
