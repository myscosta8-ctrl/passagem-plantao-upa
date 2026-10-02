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
            {(registro.reconciliacao_medicamentosa || registro.reconciliacao_texto) && (
              <div style={{ marginTop: '2px', color: '#475569' }}>
                <b>Reconciliação Medicamentosa:</b> {registro.reconciliacao_texto || ''}
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
            {registro.evolucao_dia || registro.historia_doenca_atual || ''}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Exame Físico Dirigido</div>
          <div className="med-secao-body" style={{ minHeight: '24mm', whiteSpace: 'pre-wrap' }}>
            {(() => {
              const sv = [
                (registro.sv_pa_sistolica || registro.sv_pa_diastolica) ? `PA: ${registro.sv_pa_sistolica ?? '—'}x${registro.sv_pa_diastolica ?? '—'} mmHg` : null,
                registro.sv_fc != null ? `FC: ${registro.sv_fc} bpm` : null,
                registro.sv_fr != null ? `FR: ${registro.sv_fr} irpm` : null,
                registro.sv_spo2 != null ? `SpO₂: ${registro.sv_spo2}%` : null,
                registro.sv_temperatura != null ? `Tax: ${registro.sv_temperatura}°C` : null,
                registro.sv_hgt != null ? `HGT: ${registro.sv_hgt} mg/dL` : null,
              ].filter(Boolean)
              return sv.length > 0 ? <div style={{ marginBottom: '3px' }}><b>Sinais Vitais:</b> {sv.join(' · ')}.</div> : null
            })()}
            {registro.exame_fisico || ''}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Avaliação de Risco e Resultados de Exames</div>
          <div className="med-secao-body">
            <div className="med-grid-3">
              <div><b>Risco TEV:</b> {registro.risco_tev || ''}</div>
              <div><b>Sepse (2 critérios):</b> {registro.criterios_sepse ? 'SIM (Protocolo)' : 'NÃO'}</div>
              <div><b>Antibioticoterapia:</b> {registro.antibioticoterapia || ''}</div>
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
            {registro.conduta_medica || registro.plano_terapeutico || ''}
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
            <div className="cidade-data">Breves/PA, {new Date(registro?.data_registro || registro?.criado_em || Date.now()).toLocaleDateString('pt-BR')}</div>
            <div className="hora-envio"><b>Horário do Registro:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-${medico.conselho_uf || 'PA'} ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Plantonista — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves</span>
          <span>Evolução Médica Diária</span>
        </div>
      </div>
    </div>
  )
}
