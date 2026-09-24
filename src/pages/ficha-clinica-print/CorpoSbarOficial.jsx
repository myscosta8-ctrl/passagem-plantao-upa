import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoSbarOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const sv = registro.sinais_vitais || {}
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
          {/* S — SITUAÇÃO */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">S</span> 1. Situação (Motivo e Diagnóstico da Transferência)
            </div>
            <div className="sbar-secao-body">
              <div><b>Setor de Destino:</b> {registro.setores?.nome || registro.setor_destino || 'Setor de internação / Retaguarda'}</div>
              <div style={{ marginTop: 3 }}><b>Impressão Diagnóstica / Motivo da Transferência:</b> {registro.impressao_diagnostica || 'Transferência para leito de observação / continuidade de assistência.'}</div>
            </div>
          </div>

          {/* B — BREVE HISTÓRICO */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">B</span> 2. Breve Histórico (Background & Condições Clínicas Prévias)
            </div>
            <div className="sbar-secao-body">
              <div className="sbar-grid-3">
                <div className="sbar-card-mini">
                  <div className="card-header">Comorbidades / Antecedentes</div>
                  <div className="card-body">{registro.comorbidades || pessoa.comorbidades || 'Nenhuma comorbidade relatada.'}</div>
                </div>
                <div className="sbar-card-mini">
                  <div className="card-header">Alergias Conhecidas</div>
                  <div className="card-body">
                    <span className="check-item"><span className="check-box-fiel">{!registro.alergia ? 'X' : ''}</span> Nega</span>
                    <span className="check-item"><span className="check-box-fiel">{registro.alergia ? 'X' : ''}</span> Sim: {registro.alergia_quais || 'Não especificada'}</span>
                  </div>
                </div>
                <div className="sbar-card-mini">
                  <div className="card-header">Precaução / Isolamento</div>
                  <div className="card-body">
                    <span className="check-item"><span className="check-box-fiel">{!registro.isolamento ? 'X' : ''}</span> Padrão</span>
                    <span className="check-item"><span className="check-box-fiel">{registro.isolamento ? 'X' : ''}</span> Específico: {registro.isolamento_tipo || 'Contato / Gotículas'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* A — AVALIAÇÃO */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">A</span> 3. Avaliação Clínica Atual (Assessment)
            </div>
            <div className="sbar-secao-body">
              <table className="sbar-tabela-sv">
                <thead>
                  <tr>
                    <th>PA (mmHg)</th>
                    <th>FC (bpm)</th>
                    <th>FR (irpm)</th>
                    <th>Temp (°C)</th>
                    <th>SpO₂ (%)</th>
                    <th>HGT (mg/dL)</th>
                    <th>Escala de Dor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : '120x80'}</td>
                    <td>{sv.fc ? `${sv.fc} bpm` : '78 bpm'}</td>
                    <td>{sv.fr ? `${sv.fr} irpm` : '18 irpm'}</td>
                    <td>{sv.temperatura ? `${sv.temperatura} °C` : '36.5 °C'}</td>
                    <td>{sv.spo2 ? `${sv.spo2} %` : '98 % (AA)'}</td>
                    <td>{sv.hgt ? `${sv.hgt} mg/dL` : '108 mg/dL'}</td>
                    <td>{sv.dor ? `${sv.dor}/10` : '0/10 (Ausente)'}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 5 }}>
                <div><b>Nível de Consciência:</b> {registro.nivel_consciencia || 'Alerta, orientado no tempo e espaço (Glasgow 15).'}</div>
                <div><b>Suporte Ventilatório:</b> {registro.suporte_ventilatorio ? 'Em uso de oxigenoterapia' : 'Ar ambiente (sem suporte).'}</div>
              </div>
              <div style={{ marginTop: 4 }}>
                <b>Dispositivos Invasivos:</b> {registro.dispositivos || 'Acesso venoso periférico em MSE com Jelco 20G pérvio.'}
              </div>
            </div>
          </div>

          {/* R — RECOMENDAÇÕES */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">R</span> 4. Recomendações e Plano Imediato no Destino
            </div>
            <div className="sbar-secao-body">
              <div><b>Plano e Cuidados Imediatos:</b> {registro.recomendacoes || 'Manter monitorização e aguardar reavaliação médica no setor.'}</div>
              <div style={{ marginTop: 4 }}>
                <b>Intercorrências no Transporte:</b>{' '}
                <span className="check-item"><span className="check-box-fiel">{!registro.intercorrencia_transporte ? 'X' : ''}</span> Não houve</span>
                <span className="check-item"><span className="check-box-fiel">{registro.intercorrencia_transporte ? 'X' : ''}</span> Houve intercorrência</span>
              </div>
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
