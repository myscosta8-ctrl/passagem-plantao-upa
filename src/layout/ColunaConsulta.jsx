import { useEffect, useState } from 'react'
import { listarEvolucoes } from '../lib/pepClinico'
import { listarEvolucoesMedicas, listarPrescricoes, listarExames } from '../lib/pepMedico'

// Coluna de consulta à direita da janela flutuante (mockup 02): só leitura.
// Última evolução da categoria, prescrição vigente e exames solicitados.
const fmt = (d) => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')
const nomeProf = (e) => (e ? e.nome_exibicao || e.nome : null)
const finalizado = (r) => (r.situacao || 'finalizado') === 'finalizado'

export default function ColunaConsulta({ atendimentoId, categoria }) {
  const [evo, setEvo] = useState(undefined)
  const [presc, setPresc] = useState(undefined)
  const [exames, setExames] = useState(undefined)

  useEffect(() => {
    if (!atendimentoId) return undefined
    let vivo = true
    const buscaEvo = categoria === 'medico' ? listarEvolucoesMedicas(atendimentoId) : listarEvolucoes(atendimentoId)
    buscaEvo.then((l) => {
      if (!vivo) return
      const validas = l.filter(finalizado).filter((r) => categoria === 'medico' || r.tipo !== 'medico')
      setEvo(validas[0] || null)
    })
    listarPrescricoes(atendimentoId).then((l) => { if (vivo) setPresc(l.filter(finalizado).find((p) => !p.cancelada_em && !p.cancelado_em) || null) })
    listarExames(atendimentoId).then((l) => { if (vivo) setExames(l.filter(finalizado).slice(0, 6)) })
    return () => { vivo = false }
  }, [atendimentoId, categoria])

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
