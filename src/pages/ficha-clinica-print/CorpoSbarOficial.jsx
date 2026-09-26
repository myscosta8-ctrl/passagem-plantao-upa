import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoSbarOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const sv = registro.sinais_vitais || {}
  const cf = registro.campos_extra || {}
  const entrega = registro.entrega || medico || {}
  const recebe = registro.recebe || {}

  return (
    <div className="sbar-page">
      <CabecalhoPadraoUPA
        titulo="TRANSFERÊNCIA DE PACIENTE — FORMATO SBAR"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={entrega}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        <div className="sbar-corpo">
          {/* Logística da transferência (mockup 14) — só dados registrados. */}
          <div className="sbar-secao">
            <div className="sbar-secao-header"><span className="sbar-badge">⇄</span> Logística da Transferência — Regulação e Transporte</div>
            <div className="sbar-secao-body">
              <div className="sbar-grid-3">
                <div><b>Destino:</b> {cf.hospital_destino || registro.setores?.nome || '—'}{cf.setor_destino ? ` — ${cf.setor_destino}` : ''}</div>
                <div><b>Protocolo Regulação:</b> {cf.protocolo || '—'}</div>
                <div><b>Transporte:</b> {cf.transporte || '—'}</div>
                <div><b>Médico(a) do Transporte:</b> {cf.medico_transporte || '—'}</div>
                <div><b>Enfermeiro(a) do Transporte:</b> {cf.enfermeiro_transporte || '—'}</div>
              </div>
            </div>
          </div>

          <div className="sbar-secao">
            <div className="sbar-secao-header"><span className="sbar-badge">S</span> 1. Situação (Motivo e Diagnóstico da Transferência)</div>
            <div className="sbar-secao-body">
              <div><b>Diagnóstico Principal de Saída:</b> {registro.impressao_diagnostica || '—'}</div>
              {cf.motivo && <div style={{ marginTop: 3 }}><b>Motivo da Transferência:</b> {cf.motivo}</div>}
              {registro.situacao && <div style={{ marginTop: 3, whiteSpace: 'pre-wrap' }}><b>Situação Atual:</b> {registro.situacao}</div>}
            </div>
          </div>

          <div className="sbar-secao">
            <div className="sbar-secao-header"><span className="sbar-badge">B</span> 2. Breve Histórico (Antecedentes e Condutas na UPA)</div>
            <div className="sbar-secao-body">
              <div style={{ whiteSpace: 'pre-wrap' }}><b>Antecedentes / Comorbidades:</b> {registro.breve_historico || '—'}</div>
              <div style={{ marginTop: 3 }}><b>Alergias:</b> {cf.alergias || (registro.alergia ? 'Sim' : 'Nenhuma registrada')}</div>
              {cf.condutas && <div style={{ marginTop: 3, whiteSpace: 'pre-wrap' }}><b>Condutas Realizadas na UPA:</b> {cf.condutas}</div>}
            </div>
          </div>

          <div className="sbar-secao">
            <div className="sbar-secao-header"><span className="sbar-badge">A</span> 3. Avaliação no Momento do Embarque</div>
            <div className="sbar-secao-body">
              <table className="sbar-tabela-sv">
                <thead><tr><th>PA (mmHg)</th><th>FC (bpm)</th><th>SpO₂ / Suporte</th><th>HGT (mg/dL)</th></tr></thead>
                <tbody>
                  <tr>
                    <td>{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : '—'}</td>
                    <td>{sv.fc || '—'}</td>
                    <td>{sv.spo2 || '—'}</td>
                    <td>{sv.hgt || '—'}</td>
                  </tr>
                </tbody>
              </table>
              {registro.avaliacao && <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}><b>Avaliação Neurológica:</b> {registro.avaliacao}</div>}
              {registro.dispositivos && <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}><b>Acessos e Drogas em Infusão:</b> {registro.dispositivos}</div>}
            </div>
          </div>

          <div className="sbar-secao">
            <div className="sbar-secao-header"><span className="sbar-badge">R</span> 4. Recomendações e Checklist de Saída</div>
            <div className="sbar-secao-body">
              <div style={{ whiteSpace: 'pre-wrap' }}><b>Cuidados Críticos Durante o Transporte:</b> {registro.recomendacoes || '—'}</div>
              {(cf.checklist || []).length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <b>Checklist conferido:</b>
                  {cf.checklist.map((c) => <span key={c} className="check-item"><span className="check-box-fiel">X</span> {c}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ EXTERNO */}
      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Transferência:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
            <div style={{ fontSize: '8px', color: '#64748b', marginTop: 2 }}>Origem: {setorNome || 'Setor de Origem'} &bull; Leito {leitoNumero || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="doc-bloco-assinatura" style={{ minWidth: 190 }}>
              <div className="linha-sig" />
              <div className="nome-sig">{entrega.nome_exibicao || entrega.nome || 'Enfermeiro(a) Responsável'}</div>
              <div className="coren-sig">{entrega.coren ? `COREN-PA ${entrega.coren}` : (entrega.crm ? `COREN-PA ${entrega.crm}` : 'COREN-PA')}</div>
              <div className="cargo-sig">Enfermeiro(a) de Origem</div>
            </div>
            <div className="doc-bloco-assinatura" style={{ minWidth: 190 }}>
              <div className="linha-sig" />
              <div className="nome-sig">{recebe.nome_exibicao || recebe.nome || '(a preencher no destino)'}</div>
              <div className="coren-sig">COREN-PA</div>
              <div className="cargo-sig">Enfermeiro(a) de Destino</div>
            </div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Transferência de Paciente (SBAR) — Folha Única — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
