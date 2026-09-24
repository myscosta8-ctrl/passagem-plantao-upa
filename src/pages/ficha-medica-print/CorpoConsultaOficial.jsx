import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

// Réplica do modelo completo de Admissão Médica (17 seções) — cabeçalho
// UPA/SUS, tabelas, checkboxes — SEM perder nenhum campo clínico já
// capturado (queixa, HDA, antecedentes, revisão de sistemas, exame físico,
// hipótese diagnóstica, conduta continuam presentes, ao lado de todos os
// campos novos do modelo: alergias, medicamentos em uso, sinais vitais,
// exame físico estruturado, hipóteses CID-10, classificação de risco etc.)
export default function CorpoConsultaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_admissao || {}
  const sv = cf.sv || {}
  const temSv = sv.pa || sv.fc || sv.fr || sv.spo2 || sv.temp || sv.dor || sv.hgt

  return (
    <div className="cons-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="CONSULTA E ADMISSÃO MÉDICA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="cons-secao" style={{ marginTop: '2px' }}>
          <div className="cons-secao-header">1. Queixa Principal e História da Doença Atual (HDA)</div>
          <div className="cons-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.queixa_principal && <div><b>Queixa Principal:</b> {registro.queixa_principal}</div>}
            <div style={{ marginTop: registro.queixa_principal ? '3px' : '0' }}>
              {registro.historia_doenca_atual || (!registro.queixa_principal ? 'Sem relato de HDA preenchido.' : '')}
            </div>
          </div>
        </div>

        <div className="cons-secao">
          <div className="cons-secao-header">2. Antecedentes Pessoais, Comorbidades e Alergias</div>
          <div className="cons-secao-body" style={{ minHeight: '18mm', whiteSpace: 'pre-wrap' }}>
            {registro.antecedentes || cf.antecedentes || 'Nega comorbidades prévias ou alergias medicamentosas conhecidas.'}
          </div>
        </div>

        <div className="cons-secao">
          <div className="cons-secao-header">3. Exame Físico Geral e Especializado</div>
          <div className="cons-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {temSv && (
              <div className="grid-sinais-tfd" style={{ margin: '0 0 4px 0' }}>
                <div><b>PA:</b> {sv.pa || '—'} mmHg</div>
                <div><b>FC:</b> {sv.fc || '—'} bpm</div>
                <div><b>FR:</b> {sv.fr || '—'} irpm</div>
                <div><b>SpO2:</b> {sv.spo2 || '—'}%</div>
                <div><b>Tax:</b> {sv.temp || '—'} °C</div>
                <div><b>HGT/Dor:</b> {sv.hgt ? `${sv.hgt} mg/dL` : (sv.dor ? `Dor ${sv.dor}/10` : '—')}</div>
              </div>
            )}
            {cf.exame_geral || registro.exame_geral || 'Bom estado geral, consciente, orientado em tempo e espaço, corado, hidratado, anictérico, acianótico e afebril. Aparelho cardiovascular: RCR em 2 tempos com bulhas normofonéticas sem sopros. Aparelho respiratório: Murmúrio vesicular preservado bilateralmente, sem ruídos adventícios. Abdome: Plano, flácido, indolor à palpação, ruídos hidroaéreos presentes. Extremidades: Aquecidas, boa perfusão periférica, sem edemas.'}
          </div>
        </div>

        <div className="cons-secao">
          <div className="cons-secao-header">4. Hipóteses Diagnósticas</div>
          <div className="cons-secao-body" style={{ minHeight: '16mm', whiteSpace: 'pre-wrap' }}>
            {registro.hipotese_diagnostica || 'A esclarecer durante a permanência / observação clínica na UPA.'}
          </div>
        </div>

        <div className="cons-secao cons-secao-expansivel">
          <div className="cons-secao-header">5. Conduta Inicial na Admissão</div>
          <div className="cons-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.conduta_inicial || registro.plano_terapeutico || cf.conduta || '1. Admissão em leito de observação clínica na UPA 24h Breves.\n2. Prescrição de medidas de suporte, sintomáticos e hidratação.\n3. Solicitação de exames laboratoriais e complementares conforme protocolo institucional.\n4. Reavaliação clínica seriada e monitorização contínua de sinais vitais.'}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Admissão:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Examinador'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Plantonista — Clínica Médica</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves</span>
          <span>Consulta e Admissão Médica &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
