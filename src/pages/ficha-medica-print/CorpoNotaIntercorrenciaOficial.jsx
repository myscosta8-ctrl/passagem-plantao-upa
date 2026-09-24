import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoNotaIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}

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
            {cf.motivo_chamado || registro.notas || 'Solicitada avaliação médica pela equipe de enfermagem por intercorrência clínica no setor.'}
          </div>
        </div>

        <div className="notm-secao">
          <div className="notm-secao-header">2. Exame Físico no Momento da Avaliação</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {cf.exame_fisico || 'Paciente avaliado à beira do leito. Sinais vitais aferidos, parâmetros hemodinâmicos e ventilatórios monitorizados sem sinais agudos de colapso.'}
          </div>
        </div>

        <div className="notm-secao">
          <div className="notm-secao-header">3. Condutas Médicas Tomadas</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {cf.condutas || 'Instituídas medidas sintomáticas e medicamentosas de urgência para reversão do quadro conforme prescrição médica.'}
          </div>
        </div>

        <div className="notm-secao notm-secao-expansivel">
          <div className="notm-secao-header">4. Reavaliação e Desfecho</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {cf.desfecho || 'Paciente reavaliado após intervenção clínica com resposta favorável, permanecendo em leito sob vigilância da equipe assistencial.'}
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
          <span>Nota de Intercorrência Médica &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
