import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { avisarErro } from '../lib/erros'
import './DuplicarEvolucao.css'

// "Duplicar evolução anterior": traz para o formulário o conteúdo de uma
// evolução JÁ FINALIZADA deste atendimento, sempre da mesma categoria
// (enfermagem copia de enfermagem; médico copia de médico). Sinais vitais
// nunca são copiados — precisam ser aferidos de novo. O texto copiado vira
// um documento novo, com o nome de quem salvar, e pode ser editado à vontade.
const CATEGORIAS = {
  enfermagem: {
    tabela: 'evolucoes', autor: 'autor_id',
    filtro: (q) => q.or('tipo.is.null,tipo.neq.medico'),
    resumo: (r) => r.texto || (r.diagnosticos_nanda || []).join(', '),
  },
  medico: {
    tabela: 'evolucoes_medicas', autor: 'criado_por',
    filtro: (q) => q,
    resumo: (r) => [r.diagnosticos, r.evolucao_dia].filter(Boolean).join(' — '),
  },
}

const fmt = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function DuplicarEvolucao({ categoria, atendimentoId, temConteudo, onEscolher }) {
  const cfg = CATEGORIAS[categoria]
  const [aberto, setAberto] = useState(false)
  const [lista, setLista] = useState(null)

  async function abrir() {
    if (aberto) { setAberto(false); return }
    setAberto(true); setLista(null)
    const { data, error } = await cfg.filtro(
      supabase.from(cfg.tabela).select('*').eq('atendimento_id', atendimentoId).eq('situacao', 'finalizado'),
    ).order('criado_em', { ascending: false }).limit(8)
    if (error) avisarErro('DuplicarEvolucao', error)
    const ids = [...new Set((data ?? []).map((r) => r[cfg.autor]).filter(Boolean))]
    let nomes = {}
    if (ids.length) {
      const { data: profs } = await supabase.from('enfermeiros').select('id, nome_exibicao, nome').in('id', ids)
      nomes = Object.fromEntries((profs ?? []).map((p) => [p.id, p.nome_exibicao || p.nome]))
    }
    setLista((data ?? []).map((r) => ({ ...r, _autor: nomes[r[cfg.autor]] || '—', _data: r.data_registro || r.criado_em })))
  }

  function escolher(r) {
    if (temConteudo && !window.confirm('O formulário já tem texto. Substituir pelo conteúdo da evolução escolhida?')) return
    setAberto(false)
    onEscolher(r, `Copiado da evolução de ${fmt(r._data)} (${r._autor}). Revise e atualize tudo antes de salvar — os sinais vitais não são copiados.`)
  }

  return (
    <div className="dup-evo">
      <button type="button" className="dup-evo-btn" onClick={abrir} title="Copiar o texto de uma evolução anterior deste paciente">
        <i className="ph ph-copy" /> Duplicar evolução anterior
      </button>
      {aberto && (
        <div className="dup-evo-painel">
          <div className="dup-evo-topo">
            <b>Escolha a evolução a copiar</b>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar"><i className="ph ph-x" /></button>
          </div>
          {lista === null ? <p className="dup-evo-vazio">Carregando...</p>
            : lista.length === 0 ? <p className="dup-evo-vazio">Nenhuma evolução {categoria === 'medico' ? 'médica' : 'de enfermagem'} finalizada neste atendimento.</p>
            : lista.map((r) => (
              <button key={r.id} type="button" className="dup-evo-item" onClick={() => escolher(r)}>
                <span className="dup-evo-meta">{fmt(r._data)} · {r._autor}</span>
                <span className="dup-evo-resumo">{cfg.resumo(r) || 'Sem texto'}</span>
              </button>
            ))}
          <p className="dup-evo-nota"><i className="ph ph-info" /> Só aparecem evoluções {categoria === 'medico' ? 'médicas' : 'de enfermagem'} finalizadas (Salvar e Imprimir). Sinais vitais não são copiados.</p>
        </div>
      )}
    </div>
  )
}
