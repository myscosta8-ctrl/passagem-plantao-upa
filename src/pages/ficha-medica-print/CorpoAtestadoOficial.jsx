import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'
import RodapeAssinatura from '../print/RodapeAssinatura'

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

      <RodapeAssinatura
        data={new Date(registro?.data_registro || registro?.criado_em || Date.now()).toLocaleDateString('pt-BR')}
        nome={medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}
        conselho={medico?.crm ? `CRM-${medico.conselho_uf || 'PA'} ${medico.crm}` : 'CRM/UF'}
        cargo='Médico Plantonista — UPA 24h Breves'
        sistema='Prontuário Eletrônico do Paciente — UPA 24h Breves'
        documento='Atestado Médico'
      />
    </div>
  )
}
