import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

// Réplica fiel do modelo de Prescrição aprovado (papel A4 paisagem, timbre
// UPA 24h Breves/SEMSA) — ver pdfs_exemplo/prescricao_preview.html.
export default function CorpoPrescricaoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_prescricao || {}
  const itens = registro.prescricao_itens || []
  const orientacoes = cf.orientacao_enfermagem || []

  return (
    <div className="pr-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="PRESCRIÇÃO MÉDICA HOSPITALAR"
          pessoa={pessoa}
          atendimento={atendimento}
          idade={idade}
          leitoNumero={leitoNumero}
          setorNome={setorNome}
          medico={medico}
          dataHora={dataHora}
        />

        <div className="pr-secao-titulo">Dieta</div>
        <div className="pr-caixa">{cf.dieta || '1 — Dieta oral branda hipossódica / fracionada.'}</div>

        <div className="pr-secao-titulo">Medicamentos</div>
        <table className="pr-tabela pr-tabela-salutem">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>MEDICAMENTOS</th>
              <th style={{ width: '6%', textAlign: 'center' }}>QTD/UND</th>
              <th style={{ width: '7%', textAlign: 'center' }}>SN/ACM</th>
              <th style={{ width: '6%', textAlign: 'center' }}>VIA</th>
              <th style={{ width: '9%', textAlign: 'center' }}>FREQ</th>
              <th style={{ width: '34%', textAlign: 'center' }}>HORÁRIO DE APLICAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#666', padding: '8px' }}>Nenhum medicamento prescrito.</td></tr>
            ) : itens.map((it, i) => (
              <tr key={it.id || i}>
                <td>
                  <b>{i + 1} — {it.medicamento_nome}</b>
                  {(it.diluicao || it.instrucoes) && (
                    <span className="pr-nota">{[it.diluicao, it.instrucoes].filter(Boolean).join(' — ')}</span>
                  )}
                </td>
                <td className="qtd" style={{ textAlign: 'center' }}>{it.dose ? `${it.dose} ${it.dose_unidade || ''}` : ''}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.sn_acm || (it.sn_aplic ? 'SN' : '—')}</td>
                <td className="via" style={{ textAlign: 'center' }}>{it.via || ''}</td>
                <td className="freq" style={{ textAlign: 'center' }}>{it.frequencia || ''}{it.duracao ? ` · ${it.duracao}` : ''}</td>
                <td className="horario" style={{ textAlign: 'center' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pr-secao-titulo">Orientação enfermagem</div>
        <div className="pr-caixa">
          {orientacoes.length === 0
            ? '1 — Monitorização de sinais vitais de 2/2 horas • 2 — Manter cabeceira elevada a 30°-45° e precaução padrão.'
            : orientacoes.map((o, i) => `${i + 1} — ${o.texto}${o.frequencia ? ` (${o.frequencia})` : ''}`).join(' • ')
          }
        </div>

        <div className="pr-secao-titulo">Avaliação multidisciplinar</div>
        <div className="pr-caixa">{cf.avaliacao_multidisciplinar || 'Nenhuma avaliação multidisciplinar registrada no momento.'}</div>

        <div className="pr-secao-titulo">Hemocomponente</div>
        <div className="pr-caixa">{cf.hemocomponente || 'Nenhum hemocomponente prescrito no momento.'}</div>

        {registro.observacoes && (
          <>
            <div className="pr-secao-titulo">Observações</div>
            <div className="pr-caixa">{registro.observacoes}</div>
          </>
        )}

        {registro.status === 'cancelada' && (
          <div className="pr-caixa" style={{ marginTop: 6, borderTop: '1px solid #999', color: '#8A5A00', fontWeight: 700 }}>
            PRESCRIÇÃO CANCELADA{registro.motivo_cancelamento ? ` — ${registro.motivo_cancelamento}` : ''}
          </div>
        )}
      </div>

      <div className="doc-rodape-container">
        <div className="pr-assinaturas-5">
          <div className="bloco"><div className="linha" />Técnico Tarde</div>
          <div className="bloco"><div className="linha" />Técnico Noite</div>
          <div className="bloco"><div className="linha" />Técnico Manhã</div>
          <div className="bloco"><div className="linha" />Enfermeiro Plantonista</div>
          <div className="bloco-medico">
            <div className="linha" />
            <b>{medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}</b>
            <div>{medico?.crm ? `CRM-PA ${medico.crm} • ` : ''}Médico Plantonista</div>
          </div>
        </div>

        <div className="doc-rodape-sistema">
          <span>Prescrição Médica Hospitalar — Sistema Vitaloop / UPA 24h Breves</span>
          <span>Validade: 24 Horas &bull; Documento Oficial &bull; Folha Única (Paisagem) &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
