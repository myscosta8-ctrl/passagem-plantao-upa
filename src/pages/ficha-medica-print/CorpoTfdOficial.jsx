import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoTfdOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}

  return (
    <div className="tfdf-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="TRATAMENTO FORA DE DOMICÍLIO — LAUDO MÉDICO (LM/TFD)"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="pr-info" style={{ marginTop: '2px', marginBottom: '3.5px' }}>
          <div className="pr-linha" style={{ background: '#f8fafc' }}>
            <div className="pr-campo" style={{ flexBasis: '35%' }}>
              <b>Nº DO LAUDO MÉDICO:</b> <span className="laudo-badge">{cf.numero_laudo || '—'}</span>
            </div>
            <div className="pr-campo" style={{ flexBasis: '35%' }}>
              <b>PROFISSÃO:</b> {cf.profissao || '—'}
            </div>
            <div className="pr-campo" style={{ flexBasis: '30%' }}>
              <b>CARÁTER:</b> {cf.carater || atendimento?.carater || '—'}
            </div>
          </div>
          {(registro.acompanhante_nome || cf.acompanhante_rg) && (
            <div className="pr-linha" style={{ background: '#faf5ff' }}>
              <div className="pr-campo" style={{ flexBasis: '55%' }}>
                <b>ACOMPANHANTE INDICADO:</b> {registro.acompanhante_nome || '—'}
              </div>
              <div className="pr-campo" style={{ flexBasis: '25%' }}>
                <b>PARENTESCO / RELAÇÃO:</b> {registro.acompanhante_relacao || '—'}
              </div>
              <div className="pr-campo" style={{ flexBasis: '20%' }}>
                <b>RG ACOMPANHANTE:</b> {cf.acompanhante_rg || '—'}
              </div>
            </div>
          )}
        </div>

        <div className="med-secao">
          <div className="med-secao-header">1. História da Doença Atual (HDA) e Justificativa de Deslocamento</div>
          <div className="med-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.historia_doenca_atual || ''}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Exame Físico Geral e Específico Dirigido</div>
          <div className="med-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.exame_fisico && <div><b>Estado Geral:</b> {registro.exame_fisico}</div>}
            {[cf.sv_pa && `PA: ${cf.sv_pa} mmHg`, cf.sv_fc && `FC: ${cf.sv_fc} bpm`, cf.sv_fr && `FR: ${cf.sv_fr} irpm`, cf.sv_spo2 && `SpO₂: ${cf.sv_spo2}%`, cf.sv_tax && `Tax: ${cf.sv_tax} °C`, cf.sv_hgt && `HGT: ${cf.sv_hgt} mg/dL`].filter(Boolean).length > 0 && (
              <div style={{ fontWeight: 700, margin: '2px 0' }}>{[cf.sv_pa && `PA: ${cf.sv_pa} mmHg`, cf.sv_fc && `FC: ${cf.sv_fc} bpm`, cf.sv_fr && `FR: ${cf.sv_fr} irpm`, cf.sv_spo2 && `SpO₂: ${cf.sv_spo2}%`, cf.sv_tax && `Tax: ${cf.sv_tax} °C`, cf.sv_hgt && `HGT: ${cf.sv_hgt} mg/dL`].filter(Boolean).join('   •   ')}</div>
            )}
            {cf.avaliacao_segmentar && <div><b>Avaliação Segmentar:</b> {cf.avaliacao_segmentar}</div>}
            {cf.exame_dirigido && <div><b>Exame Dirigido:</b> {cf.exame_dirigido}</div>}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Hipótese Diagnóstica e Indisponibilidade de Tratamento Local</div>
          <div className="med-secao-body" style={{ minHeight: '16mm', whiteSpace: 'pre-wrap' }}>
            <div><b>DIAGNÓSTICO PRINCIPAL:</b> {registro.diagnostico || '—'}</div>
            {cf.diagnostico_secundario && <div><b>DIAGNÓSTICO SECUNDÁRIO:</b> {cf.diagnostico_secundario}</div>}
            <div style={{ marginTop: '3px' }}>
              <b>JUSTIFICATIVA TFD:</b> {cf.justificativa_tfd || '—'}
            </div>
          </div>
        </div>

        <div className="med-secao med-secao-expansivel">
          <div className="med-secao-header">4. Tratamentos Realizados e Dados do Encaminhamento TFD</div>
          <div className="med-secao-body" style={{ padding: '2px 4px' }}>
            <table className="tabela-tfd">
              <tbody>
                <tr>
                  <td className="rotulo">Exames Complementares:</td>
                  <td>{registro.exame_complementar || '—'}</td>
                </tr>
                <tr>
                  <td className="rotulo">Tratamento Realizado na UPA:</td>
                  <td>{registro.tratamento_realizado || '—'}</td>
                </tr>
                <tr>
                  <td className="rotulo">Tratamento Indicado no Destino:</td>
                  <td>{registro.tratamento_indicado || '—'}</td>
                </tr>
                <tr>
                  <td className="rotulo">Tempo Provável de Tratamento:</td>
                  <td><b>{registro.tempo_provavel_dias ? `${registro.tempo_provavel_dias} DIAS` : '—'}</b></td>
                </tr>
                <tr>
                  <td className="rotulo">Meio de Transporte Recomendado:</td>
                  <td><b>{cf.meio_transporte || '—'}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Emissão Oficial TFD:</b> Secretaria Municipal de Saúde &bull; Regulação SER</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Solicitante'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Solicitante — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Sistema Único de Saúde — Tratamento Fora de Domicílio (TFD) — SEMSA / UPA 24h Breves</span>
          <span>Laudo Médico LM/TFD Oficial &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
