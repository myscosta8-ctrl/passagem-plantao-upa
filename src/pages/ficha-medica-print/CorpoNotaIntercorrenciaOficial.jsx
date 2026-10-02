import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'
import RodapeAssinatura from '../print/RodapeAssinatura'

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

      <RodapeAssinatura
        data={new Date(registro?.data_registro || registro?.criado_em || Date.now()).toLocaleDateString('pt-BR')}
        rotuloHora='Horário do Registro:'
        hora={dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}
        nome={medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}
        conselho={medico?.crm ? `CRM-${medico.conselho_uf || 'PA'} ${medico.crm}` : 'CRM/UF'}
        cargo='Médico Plantonista — UPA 24h Breves'
        sistema='Prontuário Eletrônico do Paciente — UPA 24h Breves'
        documento='Nota de Intercorrência Médica'
      />
    </div>
  )
}
