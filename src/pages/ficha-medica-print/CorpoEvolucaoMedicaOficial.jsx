import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoEvolucaoMedicaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  return (
    <div className="evol-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="EVOLUÇÃO MÉDICA DIÁRIA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="med-secao" style={{ marginTop: '2px' }}>
          <div className="med-secao-header">1. Diagnósticos Ativos (CID-10)</div>
          <div className="med-secao-body">
            <div><b>Principal:</b> {registro.diagnosticos || 'Sem diagnóstico ativo informado.'}</div>
            {(registro.comorbidades || registro.comorbidades_texto) && (
              <div style={{ marginTop: '2px', color: '#475569' }}>
                <b>Comorbidades / Antecedentes:</b> {registro.comorbidades_texto || (registro.comorbidades ? 'Presentes' : 'Negadas')}
              </div>
            )}
            {registro.alergias_texto && (
              <div style={{ marginTop: '2px', color: '#b91c1c' }}>
                <b>Alergias Relatadas:</b> {registro.alergias_texto}
              </div>
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Evolução Clínica do Dia e Queixas Atuais</div>
          <div className="med-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.evolucao_dia || registro.historia_doenca_atual || 'Paciente estável em leito de observação, sem queixas agudas no momento.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Exame Físico Dirigido</div>
          <div className="med-secao-body" style={{ minHeight: '24mm', whiteSpace: 'pre-wrap' }}>
            {registro.exame_fisico || 'Bom estado geral, lúcido e orientado, corado, hidratado, anictérico e acianótico. ACV: RCR 2T BNF sem sopros. AR: MVF universalmente audível. Abdome: Plano, flácido e indolor. Extremidades bem perfundidas sem edema.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Avaliação de Risco e Resultados de Exames</div>
          <div className="med-secao-body">
            <div className="med-grid-3">
              <div><b>Risco TEV:</b> {registro.risco_tev || 'Baixo risco'}</div>
              <div><b>Sepse (2 critérios):</b> {registro.criterios_sepse ? 'SIM (Protocolo)' : 'NÃO'}</div>
              <div><b>Antibioticoterapia:</b> {registro.antibioticoterapia || 'Não em uso'}</div>
            </div>
            {(registro.exames_laboratorio || registro.aguarda_exames_texto) && (
              <div style={{ marginTop: '3px', paddingTop: '2px', borderTop: '1px dashed #cbd5e1' }}>
                {registro.exames_laboratorio && <div><b>Exames:</b> {registro.exames_laboratorio}</div>}
                {registro.aguarda_exames_texto && <div style={{ color: '#0369a1' }}><b>Aguarda:</b> {registro.aguarda_exames_texto}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="med-secao med-secao-expansivel">
          <div className="med-secao-header">5. Conduta Médica e Planejamento Terapêutico</div>
          <div className="med-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.conduta_medica || registro.plano_terapeutico || '1. Manter cuidados gerais e prescrição vigente.\n2. Monitorização contínua de sinais vitais.\n3. Reavaliação clínica e laboratorial conforme evolução.'}
            {registro.data_prevista_alta && (
              <div style={{ marginTop: '3px', fontWeight: 700, color: '#15803d' }}>
                Previsão de Alta: {new Date(registro.data_prevista_alta + 'T00:00:00').toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário do Registro:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Plantonista — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves</span>
          <span>Evolução Médica Diária &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
