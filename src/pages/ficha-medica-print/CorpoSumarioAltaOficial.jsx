import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

function fmtDataAlta(data) {
  if (!data) return null
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

export default function CorpoSumarioAltaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const dtInternacao = fmtDataAlta(registro.data_internacao) || (atendimento?.criado_em ? new Date(atendimento.criado_em).toLocaleDateString('pt-BR') : '—')
  const dtAlta = fmtDataAlta(registro.data_alta) || (atendimento?.encerrado_em ? new Date(atendimento.encerrado_em).toLocaleDateString('pt-BR') : dataHora.split(',')[0])

  return (
    <div className="alta-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="SUMÁRIO DE ALTA HOSPITALAR"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="alta-secao" style={{ marginTop: '2px' }}>
          <div className="alta-secao-header">1. Período de Internação e Tipo de Desfecho</div>
          <div className="alta-secao-body">
            <div className="alta-grid-2">
              <div><b>Data de Admissão:</b> {dtInternacao}</div>
              <div><b>Data de Alta:</b> {dtAlta}</div>
              <div><b>Tipo de Desfecho:</b> {registro.tipo_alta || 'Alta Clínica / Curado / Melhorado'}</div>
              <div><b>Destino:</b> {registro.destino || 'Domicílio com acompanhamento na Atenção Básica'}</div>
            </div>
          </div>
        </div>

        <div className="alta-secao">
          <div className="alta-secao-header">2. Diagnósticos (Admissional e Final)</div>
          <div className="alta-secao-body">
            <div><b>Diagnóstico de Internação:</b> {[registro.diagnostico_internacao, registro.cid_internacao].filter(Boolean).join(' — ') || 'Não especificado'}</div>
            <div style={{ marginTop: '2px' }}><b>Diagnóstico Definitivo de Alta:</b> {[registro.diagnostico_alta, registro.cid_alta].filter(Boolean).join(' — ') || 'Em acompanhamento ambulatorial'}</div>
          </div>
        </div>

        <div className="alta-secao">
          <div className="alta-secao-header">3. Resumo da Evolução Clínica e Tratamento Realizado</div>
          <div className="alta-secao-body" style={{ minHeight: '30mm', whiteSpace: 'pre-wrap' }}>
            {registro.resumo_clinico || 'Paciente permaneceu em leito de observação da UPA 24h recebendo cuidados e suporte clínico. Apresentou melhora do quadro com estabilidade clínica e hemodinâmica, recebendo alta para seguimento domiciliar.'}
          </div>
        </div>

        <div className="alta-secao">
          <div className="alta-secao-header">4. Prescrição de Medicamentos para Domicílio</div>
          <div className="alta-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.prescricao_domicilio || registro.orientacoes_continuidade || 'Conforme orientação e receituário médico anexo.'}
          </div>
        </div>

        <div className="alta-secao alta-secao-expansivel">
          <div className="alta-secao-header">5. Orientações Gerais e Encaminhamentos</div>
          <div className="alta-secao-body" style={{ whiteSpace: 'pre-wrap' }}>
            {registro.orientacoes_alta || (
              <>
                - Manter repouso e hidratação oral adequada.<br />
                - Encaminhado à Unidade Básica de Saúde (UBS) de referência para acompanhamento contínuo.<br />
                - <b>Sinais de alerta para retorno imediato à UPA:</b> Febre persistente, dor intensa súbita, falta de ar, vômitos incoercíveis ou alteração do estado de consciência.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Alta:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Assistente'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Assistente — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Sumário de Alta Hospitalar &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
