import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  // Colunas reais de eventos_adversos (sv_*); registros antigos podem trazer sinais_vitais.
  const sv = registro.sinais_vitais || { pa_sistolica: registro.sv_pa_sistolica, pa_diastolica: registro.sv_pa_diastolica, fc: registro.sv_fc, fr: registro.sv_fr, temperatura: registro.sv_temperatura, spo2: registro.sv_spo2 }
  const hora = (iso) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'
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
            <div className="not-secao-body">{registro.descricao || registro.texto || ''}</div>
          </div>

          <div className="not-grid-campos">
            <div className="not-card-mini">
              <div className="card-header">Classificação do Evento</div>
              <div className="card-body">{registro.categoria || registro.classificacao || '—'}</div>
            </div>
            <div className="not-card-mini">
              <div className="card-header">Médico Notificado</div>
              <div className="card-body">{registro.medico_comunicado_nome || registro.medico_notificado || (registro.medico_comunicado ? 'Sim' : '—')}</div>
            </div>
            <div className="not-card-mini">
              <div className="card-header">Horário da Notificação</div>
              <div className="card-body">{registro.horario_comunicacao_medico ? hora(registro.horario_comunicacao_medico) : '—'}</div>
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
                    <th>Tax (°C)</th>
                    <th>SpO₂ (%)</th>
                    <th>HGT (mg/dL)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : '—'}</td>
                    <td>{sv.fc ? `${sv.fc} bpm` : '—'}</td>
                    <td>{sv.fr ? `${sv.fr} irpm` : '—'}</td>
                    <td>{sv.temperatura ? `${sv.temperatura} °C` : '—'}</td>
                    <td>{sv.spo2 ? `${sv.spo2} %` : '—'}</td>
                    <td>{sv.hgt ? `${sv.hgt} mg/dL` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">3. Condutas de Enfermagem Adotadas e Medicações Administradas</div>
            <div className="not-secao-body">{registro.acao_imediata || registro.conduta || ''}</div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">4. Resposta do Paciente e Desfecho</div>
            <div className="not-secao-body">{registro.desfecho_evolucao || registro.desfecho || ''}</div>
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
