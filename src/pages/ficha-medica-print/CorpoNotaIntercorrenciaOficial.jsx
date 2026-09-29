import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoNotaIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const sv = registro.sinais_vitais_evento || {}
  const linhaSv = [sv.pa && `PA ${sv.pa} mmHg`, sv.fc && `FC ${sv.fc} bpm`, sv.fr && `FR ${sv.fr} irpm`, sv.spo2 && `SpO₂ ${sv.spo2}%`, sv.temp && `Tax ${sv.temp} °C`, sv.hgt && `HGT ${sv.hgt} mg/dL`].filter(Boolean).join(' • ')

  return (
    <div className="notm-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="NOTA DE INTERCORRÊNCIA MÉDICA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="notm-secao" style={{ marginTop: '2px' }}>
          <div className="notm-secao-header">1. Motivo do Chamado e Descrição da Intercorrência</div>
          <div className="notm-secao-body" style={{ minHeight: '30mm', whiteSpace: 'pre-wrap' }}>
            {registro.descricao_evento || ''}
          </div>
        </div>

        <div className="notm-secao">
          <div className="notm-secao-header">2. Exame Físico no Momento da Avaliação</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {linhaSv && <div style={{ fontWeight: 700, marginBottom: '2px' }}>{linhaSv}</div>}{sv.exame_fisico || ''}
          </div>
        </div>

        <div className="notm-secao">
          <div className="notm-secao-header">3. Condutas Médicas Tomadas</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.conduta_tomada || ''}
          </div>
        </div>

        <div className="notm-secao notm-secao-expansivel">
          <div className="notm-secao-header">4. Reavaliação e Desfecho</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.notas || ''}
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
          <span>Nota de Intercorrência Médica &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
