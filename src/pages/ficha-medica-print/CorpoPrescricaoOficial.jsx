import { quantidadeDia } from '../../lib/frequencia'
import { textoValidade } from '../../lib/prescricaoValidade'
import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

// Réplica fiel do modelo de Prescrição aprovado (papel A4 paisagem, timbre
// UPA 24h Breves/SEMSA) — ver pdfs_exemplo/prescricao_preview.html.
// No impresso, "SN — Se necessário" e "ACM — A critério médico" saem só como SN / ACM.
function abreviarCondicao(v) {
  if (!v) return ''
  const t = String(v).trim()
  if (/^SN\b/i.test(t) || /se necess[aá]rio/i.test(t)) return 'SN'
  if (/^ACM\b/i.test(t) || /crit[eé]rio m[eé]dico/i.test(t)) return 'ACM'
  return t
}

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

        {registro.data_referencia && <div className="pr-validade" style={{ fontWeight: 700, margin: '4px 0 6px' }}>Prescrição válida {textoValidade(registro.data_referencia, registro.criado_em)}</div>}
        <div className="pr-secao-titulo">Dieta</div>
        <div className="pr-caixa">{cf.dieta ? <b>1 — {cf.dieta}</b> : ''}</div>

        <table className="pr-tabela pr-tabela-salutem">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>MEDICAMENTOS</th>
              <th style={{ width: '6%', textAlign: 'center' }}>QTD/UND</th>
              <th style={{ width: '7%', textAlign: 'center' }}>SN/ACM</th>
              <th style={{ width: '6%', textAlign: 'center' }}>VIA</th>
              <th style={{ width: '5.5%', textAlign: 'center' }}>FREQ</th>
              <th style={{ width: '37.5%', textAlign: 'center' }}>HORÁRIO DE APLICAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#666', padding: '8px' }}>Nenhum medicamento prescrito.</td></tr>
            ) : itens.map((it, i) => (
              <tr key={it.id || i}>
                <td>
                  <b>{i + (cf.dieta ? 2 : 1)} — {it.medicamento_nome}</b>{it.dose != null && it.dose !== '' && <> — <b>Dose: {String(it.dose).replace('.', ',')} {it.dose_unidade || ''}</b>{Number(it.qtd_por_dose) > 1 && it.apresentacao ? ` (${String(it.qtd_por_dose).replace('.', ',')} ${it.apresentacao})` : ''}</>}
                  {(it.diluicao || it.instrucoes) && (
                    <span className="pr-nota">{[it.diluicao, it.instrucoes].filter(Boolean).join(' — ')}</span>
                  )}
                </td>
                <td className="qtd" style={{ textAlign: 'center' }}>{quantidadeDia(it)}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{abreviarCondicao(it.sn_acm || it.observacoes) || (it.sn_aplic ? 'SN' : '—')}</td>
                <td className="via" style={{ textAlign: 'center' }}>{it.via || ''}</td>
                <td className="freq" style={{ textAlign: 'center' }}>{it.frequencia || ''}{it.duracao ? ` · ${it.duracao}` : ''}</td>
                <td className="horario"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pr-secao-titulo">Orientação enfermagem</div>
        <div className="pr-caixa">
          {orientacoes.length === 0
            ? ''
            : orientacoes.map((o, i) => <div key={i} className="pr-orientacao-item">{i + 1} — {o.texto}{o.frequencia ? ` (${o.frequencia})` : ''}</div>)
          }
        </div>

        <div className="pr-secao-titulo">Hemocomponentes e Derivados</div>
        <div className="pr-caixa">
          {cf.hemocomponentes?.length > 0
            ? cf.hemocomponentes.map((h, i) => `${i + 1} — ${h.tipo}${h.quantidade ? ` (${h.quantidade})` : ''}`).join(' • ') + (cf.hemocomponente_obs ? ` • ${cf.hemocomponente_obs}` : '')
            : (cf.hemocomponente || 'Nenhum hemocomponente prescrito no momento.')}
        </div>

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
            <div>{medico?.crm ? `CRM-${medico.conselho_uf || 'PA'} ${medico.crm} • ` : ''}Médico Plantonista</div>
          </div>
        </div>

        <div className="doc-rodape-sistema">
          <span>Prescrição Médica Hospitalar — Prontuário Eletrônico / UPA 24h Breves</span>
          <span>Validade: 24 Horas &bull; Documento Oficial</span>
        </div>
      </div>
    </div>
  )
}
