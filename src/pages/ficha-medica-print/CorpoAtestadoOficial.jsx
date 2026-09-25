import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoAtestadoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const dataInicio = registro.data_inicio ? new Date(registro.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : ''

  return (
    <div className="notm-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="ATESTADO MÉDICO"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="notm-secao notm-secao-expansivel" style={{ marginTop: '2px' }}>
          <div className="notm-secao-header">Atesto para os devidos fins</div>
          <div className="notm-secao-body" style={{ minHeight: '50mm', whiteSpace: 'pre-wrap' }}>
            Atesto, para os devidos fins, que o(a) paciente <b>{pessoa.nome}</b> esteve sob avaliação
            médica nesta unidade em {dataInicio}, necessitando de afastamento de suas atividades
            habituais por <b>{registro.dias_afastamento || '—'}</b> dia(s), a contar desta data.
            {registro.cid && <> CID: <b>{registro.cid}</b>.</>}
            {registro.texto_livre && <><br /><br />{registro.texto_livre}</>}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
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
          <span>Atestado Médico &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
