import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  const sv = registro.sinais_vitais || {}
  return (
    <div className="note-page">
      <CabecalhoPadraoUPA
        titulo="NOTA DE INTERCORRÊNCIA DE ENFERMAGEM"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={enf}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        <div className="not-corpo">
          <div className="not-secao">
            <div className="not-secao-header">1. Descrição do Evento / Intercorrência</div>
            <div className="not-secao-body">{registro.descricao || registro.texto || 'Paciente apresentou episódio de intercorrência clínica durante o plantão.'}</div>
          </div>

          <div className="not-grid-campos">
            <div className="not-card-mini">
              <div className="card-header">Classificação do Evento</div>
              <div className="card-body">{registro.classificacao || 'Intercorrência Clínica Aguda'}</div>
            </div>
            <div className="not-card-mini">
              <div className="card-header">Médico Notificado</div>
              <div className="card-body">{registro.medico_notificado || 'Médico Plantonista da UPA'}</div>
            </div>
            <div className="not-card-mini">
              <div className="card-header">Horário da Notificação</div>
              <div className="card-body">{registro.horario_notificacao || (dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora) || 'Imediato'}</div>
            </div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">2. Sinais Vitais no Momento da Intercorrência</div>
            <div className="not-secao-body" style={{ padding: 4 }}>
              <table className="not-tabela-sv">
                <thead>
                  <tr>
                    <th>PA (mmHg)</th>
                    <th>FC (bpm)</th>
                    <th>FR (irpm)</th>
                    <th>Temp (°C)</th>
                    <th>SpO₂ (%)</th>
                    <th>HGT (mg/dL)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : (registro.pa || '120x80')}</td>
                    <td>{sv.fc || registro.fc || '80'} bpm</td>
                    <td>{sv.fr || registro.fr || '18'} irpm</td>
                    <td>{sv.temperatura || registro.temperatura || '36.5'} °C</td>
                    <td>{sv.spo2 || registro.spo2 || '98'} %</td>
                    <td>{sv.hgt || registro.hgt || '110'} mg/dL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">3. Condutas de Enfermagem Adotadas e Medicações Administradas</div>
            <div className="not-secao-body">{registro.conduta || 'Realizada aferição de sinais vitais, posicionamento do paciente em decúbito elevado, comunicado médico plantonista e administrada medicação conforme prescrição médica imediata.'}</div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">4. Resposta do Paciente e Desfecho</div>
            <div className="not-secao-body">{registro.desfecho || 'Paciente estável após medidas tomadas, sem queixas no momento, sob monitorização contínua pela equipe de enfermagem.'}</div>
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
            <div className="nome-sig">{enf.nome_exibicao || enf.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{enf.coren ? `COREN-PA ${enf.coren}` : (enf.crm ? `COREN-PA ${enf.crm}` : 'COREN-PA')}</div>
            <div className="cargo-sig">Enfermeiro(a) de Plantão — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Nota de Intercorrência de Enfermagem — Folha Única — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
