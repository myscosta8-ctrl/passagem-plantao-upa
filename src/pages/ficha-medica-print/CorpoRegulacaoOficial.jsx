import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

function SerCampoVital({ rotulo, valor }) {
  return (
    <div className="serf-vital">
      <div className="serf-vital-rotulo">{rotulo}:</div>
      <div className="serf-vital-caixa">{valor || ''}</div>
    </div>
  )
}

function SerCheck({ marcado }) {
  return <span style={{ fontWeight: 700 }}>{marcado ? 'X' : '\u00A0'}</span>
}

export default function CorpoRegulacaoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const sv = registro.sinais_vitais || {}
  const dataCadastro = dataHora.split(',')[0]

  return (
    <div className="serf-page">
      <CabecalhoPadraoUPA
        titulo="ATUALIZAÇÃO DE QUADRO CLÍNICO DE PACIENTE REGULADO"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
      />

      <div className="doc-corpo">
        {/* Bloco de Identificação da Regulação */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px', background: '#f8fafc', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '3mm', marginBottom: '2mm', fontSize: '9px' }}>
          <div><b>Nº SOLICITAÇÃO NO SER:</b> <span style={{ color: '#0284c7', fontWeight: 700 }}>{registro.numero_solicitacao_ser || 'Em processamento'}</span></div>
          <div><b>DATA DO CADASTRO:</b> {dataCadastro}</div>
          <div style={{ gridColumn: '1 / -1' }}><b>DIAGNÓSTICO REGULADO:</b> {registro.diagnostico_regulado || 'Aguardando parecer/definição'}</div>
          <div style={{ gridColumn: '1 / -1' }}>
            <b>MUDANÇA DE DIAGNÓSTICO?</b> SIM (<SerCheck marcado={registro.mudanca_diagnostico} />) NÃO (<SerCheck marcado={!registro.mudanca_diagnostico} />)
            {registro.mudanca_diagnostico && <span> &nbsp;&nbsp;<b>NOVO DIAGNÓSTICO:</b> {registro.novo_diagnostico_cid || ''}</span>}
          </div>
        </div>

        <div className="serf-vitais">
          <SerCampoVital rotulo="PA" valor={sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica} mmHg` : ''} />
          <SerCampoVital rotulo="FC" valor={sv.fc ? `${sv.fc} bpm` : ''} />
          <SerCampoVital rotulo="FR" valor={sv.fr ? `${sv.fr} irpm` : ''} />
          <SerCampoVital rotulo="T°" valor={sv.temperatura ? `${sv.temperatura} °C` : ''} />
          <SerCampoVital rotulo="SpO₂" valor={sv.spo2 ? `${sv.spo2}%` : ''} />
          <SerCampoVital rotulo="HGT" valor={sv.hgt ? `${sv.hgt} mg/dL` : ''} />
        </div>

        <div className="serf-secao">
          <div className="serf-secao-titulo">1 – EVOLUÇÃO CLÍNICA DIÁRIA / SITUAÇÃO ATUAL</div>
          <div className="serf-secao-corpo">{registro.evolucao || 'Sem alterações registradas no período.'}</div>
        </div>
        <div className="serf-secao">
          <div className="serf-secao-titulo">2 – PENDÊNCIAS / LAUDOS / EXAMES AGUARDADOS</div>
          <div className="serf-secao-corpo">{registro.pendencias || 'Nenhuma pendência diagnóstica relatada.'}</div>
        </div>
        <div className="serf-secao">
          <div className="serf-secao-titulo">3 – CONDUTA MÉDICA / PLANO TERAPÊUTICO</div>
          <div className="serf-secao-corpo">{registro.conduta || 'Mantida conduta prévia e suporte clínico.'}</div>
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
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Regulador / Assistente'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Assistente — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Central de Regulação de Leitos (SER / SISREG)</span>
        </div>
      </div>
    </div>
  )
}
