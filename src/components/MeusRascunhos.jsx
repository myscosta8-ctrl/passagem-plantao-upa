import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FONTES } from '../lib/historicoClinico'
import { EVENTO_DOCUMENTOS } from '../lib/documentos'

// Documentos que o profissional salvou com "Salvar" (rascunho) e ainda não
// finalizou com "Salvar e Imprimir". Só o próprio autor vê os seus.
const EXTRA = {
  prescricoes_medicas: { rotulo: 'Prescrição Médica', area: 'medico' },
  balanco_hidrico: { rotulo: 'Balanço Hídrico 24h', area: 'enfermagem' },
  escalas_enfermagem: { rotulo: 'Escalas de Enfermagem', area: 'enfermagem' },
  sinais_vitais: { rotulo: 'Sinais Vitais', area: 'enfermagem' },
  evolucoes_enfermagem: { rotulo: 'Evolução de Enfermagem', area: 'enfermagem' },
  solicitacoes_hemoterapia: { rotulo: 'Solicitação de Hemoterapia', area: 'medico' },
  solicitacoes_tfd: { rotulo: 'TFD', area: 'medico' },
  sorologias_notificaveis: { rotulo: 'Sorologia notificável', area: 'enfermagem' },
  aih_encaminhada: { rotulo: 'Laudo de AIH — encaminhado a você para revisar e assinar', area: 'medico' },
}
export const infoTabela = (t) => { const f = FONTES.find((x) => x.tabela === t); return f ? { rotulo: f.rotulo, area: f.area } : (EXTRA[t] || { rotulo: t, area: '' }) }

export async function listarMeusRascunhos() {
  const { data, error } = await supabase.rpc('meus_rascunhos')
  if (error) { console.error('meus_rascunhos:', error); return [] }
  return (data ?? []).sort((a, b) => new Date(b.salvo_em) - new Date(a.salvo_em))
}

const fmt = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function MeusRascunhos({ compacto = false }) {
  const [lista, setLista] = useState(null)
  useEffect(() => {
    let t
    const atualizar = () => listarMeusRascunhos().then(setLista)
    const aoMudar = () => { clearTimeout(t); t = setTimeout(atualizar, 1000) }
    atualizar()
    window.addEventListener(EVENTO_DOCUMENTOS, aoMudar)
    return () => { clearTimeout(t); window.removeEventListener(EVENTO_DOCUMENTOS, aoMudar) }
  }, [])
  if (!lista || lista.length === 0) return null
  if (compacto) {
    return (
      <div className="pd-card">
        <h4>Meus rascunhos <em>{lista.length}</em></h4>
        {lista.map((r) => {
          const info = infoTabela(r.tabela)
          return (
            <div key={r.tabela + r.registro_id} className="pd-rasc">
              <b>{info.rotulo}</b>
              <small>{r.paciente || 'Paciente'}{r.leito ? ` · Leito ${r.leito}` : ''} · {fmt(r.salvo_em)}</small>
            </div>
          )
        })}
        <p className="pd-dica">Abra o paciente na mesma aba: o rascunho reabre sozinho.</p>
      </div>
    )
  }
  return (
    <div className="mr-bloco">
      <div className="mr-topo">
        <i className="ph ph-pencil-simple-line" />
        <div>
          <b>Meus documentos não finalizados ({lista.length})</b>
          <span>Salvos com "Salvar", mas ainda sem "Salvar e Imprimir". Abra o paciente, vá na mesma aba — o rascunho reabre sozinho — e finalize ou cancele.</span>
        </div>
      </div>
      {lista.map((r) => {
        const info = infoTabela(r.tabela)
        return (
          <div key={r.tabela + r.registro_id} className="mr-item">
            <span className={`mr-area ${info.area}`}>{info.area === 'medico' ? 'Médico' : 'Enfermagem'}</span>
            <div className="mr-info">
              <b>{info.rotulo}</b>
              <span><i className="ph ph-user" /> {r.paciente || 'Paciente'}{r.leito ? ` · Leito ${r.leito}${r.setor ? ` (${r.setor})` : ''}` : ' · sem leito (alta?)'}</span>
            </div>
            <span className="mr-data"><i className="ph ph-clock" /> {fmt(r.salvo_em)}</span>
          </div>
        )
      })}
    </div>
  )
}
