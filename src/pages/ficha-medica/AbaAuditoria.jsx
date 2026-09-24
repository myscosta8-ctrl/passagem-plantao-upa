import { useEffect, useState } from 'react';
import { listarEventosAuditoria } from '../../lib/pepAtendimentos';
import { ACOES_AUDITORIA } from './constantes';

export default function AbaAuditoria({ atendimento }) {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    listarEventosAuditoria(atendimento.atendimento_id).then((lista) => { setEventos(lista); setCarregando(false) })
  }, [atendimento.atendimento_id])

  return (
    <div className="form-section">
      <div className="form-section-title">Trilha de auditoria</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Registro somente-leitura das ações mais sensíveis feitas neste atendimento — não cobre tudo, só os pontos de maior impacto (diagnóstico, desfecho, fusão de cadastro).
      </p>
      {carregando ? <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p> : eventos.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum evento registrado ainda.</p>
      ) : eventos.map((e) => (
        <div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{ACOES_AUDITORIA[e.acao] || e.acao}</strong>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{new Date(e.ocorrido_em).toLocaleString('pt-BR')}</span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
            {e.enfermeiros?.nome_exibicao || e.enfermeiros?.nome || 'Autor desconhecido'}
            {e.dados ? ` · ${JSON.stringify(e.dados)}` : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

