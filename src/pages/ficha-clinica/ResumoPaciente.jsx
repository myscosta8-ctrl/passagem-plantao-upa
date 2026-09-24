import { useEffect, useState } from 'react';
import { buscarResumoPaciente } from '../../lib/pepClinico';

function formatarRelativo(iso) {
  if (!iso) return ''
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR')
}

function riscoClasse(nivel) {
  const n = (nivel || '').toLowerCase()
  if (n.includes('muito alto') || n.includes('risco alto')) return 'danger'
  if (n.includes('moderado') || n.includes('médio')) return 'warn'
  return 'ok'
}

// Painel de status no topo da ficha — mostra o essencial de cada aba num
// relance, antes de entrar em qualquer uma delas (proposta de redesign
// aprovada na conversa).

export default function ResumoPaciente({ atendimento }) {
  const [resumo, setResumo] = useState(null)

  useEffect(() => {
    let vivo = true
    buscarResumoPaciente(atendimento.atendimento_id, atendimento.pessoa_id).then((r) => { if (vivo) setResumo(r) })
    return () => { vivo = false }
  }, [atendimento.atendimento_id, atendimento.pessoa_id])

  if (!resumo) return null

  const { ultimoSv, escalaPorTipo, dispositivosAtivos, entradasHoje, saidasHoje, alergiasAtivas, isolamentosAtivos } = resumo
  const temEscalas = Object.keys(escalaPorTipo).length > 0
  const temAlgumDado = ultimoSv || temEscalas || dispositivosAtivos.length > 0 || entradasHoje || saidasHoje || alergiasAtivas.length > 0 || isolamentosAtivos.length > 0
  if (!temAlgumDado) return null

  return (
    <div className="resumo-paciente">
      {isolamentosAtivos.length > 0 && (
        <div className="resumo-bloco" style={{ gridColumn: '1 / -1' }}>
          <div className="resumo-bloco-titulo">⚠ Isolamento</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {isolamentosAtivos.map((i) => (
              <span key={i.id} className="resumo-badge warn">
                {i.tipo}{i.patogeno_suspeito ? ` · ${i.patogeno_suspeito}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {alergiasAtivas.length > 0 && (
        <div className="resumo-bloco" style={{ gridColumn: '1 / -1' }}>
          <div className="resumo-bloco-titulo">⚠ Alergias</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {alergiasAtivas.map((a) => (
              <span key={a.id} className="resumo-badge danger">
                {a.substancia}{a.gravidade ? ` · ${a.gravidade}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Sinais vitais</div>
        {ultimoSv ? (
          <>
            <div className="resumo-bloco-valor">
              PA {ultimoSv.pa_sistolica ?? '—'}/{ultimoSv.pa_diastolica ?? '—'} · FC {ultimoSv.fc ?? '—'}<br />
              FR {ultimoSv.fr ?? '—'} · SpO2 {ultimoSv.spo2 ?? '—'}{ultimoSv.temperatura ? ` · ${ultimoSv.temperatura}°C` : ''}
            </div>
            <div className="resumo-bloco-nota">{formatarRelativo(ultimoSv.registrado_em)}</div>
          </>
        ) : <div className="resumo-bloco-vazio">Sem registro</div>}
      </div>

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Escalas</div>
        {temEscalas ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.values(escalaPorTipo).map((e) => (
              <div key={e.tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ textTransform: 'capitalize', fontSize: 11.5 }}>{e.tipo}</span>
                <span className={`resumo-badge ${riscoClasse(e.nivel_risco)}`}>{e.pontuacao} · {e.nivel_risco}</span>
              </div>
            ))}
          </div>
        ) : <div className="resumo-bloco-vazio">Sem avaliação</div>}
      </div>

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Dispositivos ativos</div>
        {dispositivosAtivos.length > 0 ? (
          <div className="resumo-bloco-valor">{dispositivosAtivos.map((d) => d.tipo).join(', ')}</div>
        ) : <div className="resumo-bloco-vazio">Nenhum ativo</div>}
      </div>

      <div className="resumo-bloco">
        <div className="resumo-bloco-titulo">Balanço hídrico · hoje</div>
        <div className="resumo-bloco-valor">Entradas {entradasHoje} mL · Saídas {saidasHoje} mL</div>
        <div className="resumo-bloco-saldo">Saldo {entradasHoje - saidasHoje >= 0 ? '+' : ''}{entradasHoje - saidasHoje} mL</div>
      </div>
    </div>
  )
}

