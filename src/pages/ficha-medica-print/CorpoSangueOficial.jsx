// Réplica fiel do formulário oficial da Fundação Hemopa (SOLICITAÇÃO DE
// SANGUE, COMPONENTES E DERIVADOS) — mesmo texto, ordem e agrupamento em
// caixas do modelo em papel. Estilo próprio (prefixo "sg-"), já que este
// documento segue a estética de formulário burocrático clássico (bordas
// finas uniformes, "( )" em vez de checkbox preenchido), não o layout
// moderno em camadas usado pela Admissão/Plano Terapêutico.
const SG_HEMOCOMPONENTES = [
  'Concentrado de hemácias pobre em leucócitos(+ 300 ml/unid)',
  'Concentrado de hemácias (+ 300 ml/unid)',
  'Concentrado de hemácias pobre em leucócitos irradiado(+ 300 ml/unid)',
  'Plasma fresco congelado (+ 200ml/unid)',
  'Concentrado de plaquetas pobre em leucócitos(+ 60 ml/unid)',
  'Concentrado de plaquetas pobre em leucócitos irradiado(+ 60 ml/unid)',
  'Concentrado de plaquetas por aférese (+ 300 ml/unid)',
  'Crioprecipitado (+ 20 ml/unid)',
]

function SgCheck({ marcado, children }) {
  return <span className="sg-check">( {marcado ? 'X' : '\u00A0'} ) {children}</span>
}

export default function CorpoSangueOficial({ registro, pessoa, atendimento, idade: _idade, leitoNumero, setorNome: _setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}
  const hemo = cf.hemocomponentes || {}
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''
  const fmtData = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR').split('/').join(' / ') : '____/____/____')

  return (
    <div className="sg-page">
      <div className="sg-topo">
        <div className="sg-topo-logo"><img src="./logos/upa24h.jpg" alt="UPA 24h" /></div>
        <div className="sg-topo-texto">
          <div className="nome">PREFEITURA MUNICIPAL DE BREVES</div>
          <div>SECRETARIA MUNICIPAL DE SAÚDE - SEMSA</div>
          <div>Travessa Castilhos França - Aeroporto - CNPJ 02.967.963/0001-11</div>
          <div>Breves - Pará - CEP 68.800-000</div>
        </div>
        <div className="sg-topo-aviso">
          Solicitação incompleta, inadequada ou ilegível, não será aceita pelo Serviço de Hemoterapia,
          conforme legislação vigente do Ministério da Saúde.
          <b>Hemopa adicionado às ______________ horas</b>
        </div>
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">SOLICITAÇÃO DE SANGUE, COMPONENTES E DERIVADOS</div>
        <div className="sg-linha"><b>PACIENTE:</b> <i>{pessoa.nome}</i></div>
        <div className="sg-linha">
          <span><b>DATA NASC.:</b> <i>{nascimento}</i></span>
          <span><b>SEXO:</b> <i>{pessoa.sexo === 'F' ? 'FEMININO' : pessoa.sexo === 'M' ? 'MASCULINO' : ''}</i></span>
          <span><b>PESO:</b> {cf.peso}</span>
          <span><b>HB/HT:</b> <i>{cf.hb_ht}</i></span>
        </div>
        <div className="sg-linha">
          <span><b>HOSPITAL:</b> <i>UPA 24h Breves</i></span>
          <span><b>APT:</b> {cf.apt}</span>
          <span><b>ENFª/LEITO:</b> {cf.enf_leito || leitoNumero}</span>
        </div>
        <div className="sg-linha">
          <span><b>REGISTRO HOSPITALAR:</b> {cf.registro_hospitalar || atendimento?.numero_atendimento}</span>
          <span><b>CATEGORIA:</b> {cf.categoria}</span>
        </div>
        <div className="sg-linha">
          <span><b>RECEBEU TRANSFUSÃO:</b> <i>{cf.recebeu_transfusao === 'sim' ? 'SIM' : cf.recebeu_transfusao === 'nao' ? 'NÃO' : ''}</i></span>
          <span><b>QUANDO:</b> {cf.quando ? new Date(cf.quando + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
          <span><b>ONDE:</b> {cf.onde}</span>
        </div>
        <div className="sg-linha">
          <span><b>ANTECEDENTES DE ANTICORPO IRREGULAR?</b> <SgCheck marcado={cf.antecedentes_anticorpo === 'sim'}>SIM</SgCheck> <SgCheck marcado={cf.antecedentes_anticorpo === 'nao'}>NÃO</SgCheck></span>
          <span><b>SOLICITOU DOADORES?</b> {cf.solicitou_doadores}</span>
        </div>
        <div className="sg-linha"><b>INDICAÇÃO CLÍNICA / CIRURGIA PROPOSTA:</b> <i>{registro.indicacao_clinica}</i></div>
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">HEMOCOMPONENTES / HEMODERIVADOS</div>
        <table className="sg-tabela">
          <tbody>
            {SG_HEMOCOMPONENTES.map((item) => (
              <tr key={item}>
                <td>{item}</td>
                <td className="qtd">{hemo[item]?.marcado ? (hemo[item]?.quantidade || 'X') : ''}</td>
              </tr>
            ))}
            <tr><td>Outros: {cf.outros_hemocomponentes}</td><td></td></tr>
          </tbody>
        </table>
      </div>

      <p className="sg-nota">Obrigatório prescrição do produto no prontuário médico do paciente.</p>
      <p className="sg-nota">Devolver até 48h, o(s) produto(s) não transfundido(s).</p>

      <div className="sg-assinatura">
        <span className="sg-assinatura-linha">Médico solicitante: {medico?.nome_exibicao || medico?.nome}</span>
        <span>Data: {dataHora.split(',')[0]}</span>
        <span>Hora: {dataHora.split(', ')[1] || ''}</span>
      </div>
      <div className="sg-assinatura-legenda">Médico / CRM {medico?.crm ? `— ${medico.crm}` : ''}</div>

      <div className="sg-opcoes">
        <p><SgCheck marcado={cf.urgencia === 'urgencia'}>Urgência, a realizar dentro de 3 horas.</SgCheck></p>
        <p><SgCheck marcado={cf.urgencia === 'rotina'}>Não urgente (rotina), a realizar dentro de 24 horas.</SgCheck></p>
        <p>
          <SgCheck marcado={cf.urgencia === 'cirurgia'}>Programada:</SgCheck> - Para cirurgia eletiva em {fmtData(cf.cirurgia_data)}, às {cf.cirurgia_hora || '_______'} horas com possível transfusão.
        </p>
        <p style={{ paddingLeft: '10mm' }}>Para transfusão em regime ambulatorial, dia {fmtData(cf.ambulatorial_data)}, às {cf.ambulatorial_hora || '_____'} horas.</p>
        <p style={{ paddingLeft: '10mm', fontWeight: 700 }}>OBS.: Encaminhar paciente à Fundação Hemopa com antecedência de 3 (três) dias úteis.</p>
        <p>A não observação deste item cancela automaticamente esta solicitação.</p>
        <p><SgCheck marcado={cf.urgencia === 'residencia'}>Transfusão em residência - Obrigatório preenchimento de Termo de Responsabilidade.</SgCheck></p>
        <p><SgCheck marcado={cf.urgencia === 'auto'}>Auto-transfusão</SgCheck></p>
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">TRANSFUSÃO DE EXTREMA URGÊNCIA</div>
        <p className="sg-nota" style={{ padding: '1mm 2mm' }}>Autorizo a transfusão de sangue sem testes pré-transfusionais exigidos por se tratar de risco de vida.</p>
        <div className="sg-linha">
          <span>Médico solicitante: {cf.extrema_urgencia ? (medico?.nome_exibicao || medico?.nome) : ''}</span>
          <span>Data: {fmtData(cf.extrema_urgencia_data)}</span>
          <span>Hora: {cf.extrema_urgencia_hora || '________'}</span>
        </div>
      </div>

      <div className="sg-linha-solta">
        Coletado por: {cf.coletado_por} &nbsp;&nbsp; Data: {fmtData(cf.coletado_data)} &nbsp;&nbsp; Hora: {cf.coletado_hora || '________'}
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">ESPAÇO RESERVADO EXCLUSIVAMENTE PARA USO DA FUNDAÇÃO HEMOPA</div>
        <table className="sg-tabela sg-tabela-hemopa">
          <thead>
            <tr>
              <th>DATA</th><th>PRODUTO</th><th>G.S.</th><th>VOLUME</th><th>COLETA</th><th>TUBO</th><th>RESULTADO</th><th>HORA</th><th>TÉCNICO</th><th>SOLICITAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 10 }).map((_, j) => <td key={j}>&nbsp;</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sg-linha-solta">
        PAI: I {cf.pai_i} &nbsp; II {cf.pai_ii} &nbsp; AC: {cf.ac} &nbsp; CD: {cf.cd} &nbsp; RESPONSÁVEL: {cf.responsavel_hemopa} &nbsp; DATA: {fmtData(cf.hemopa_data)} &nbsp; HORA: {cf.hemopa_hora || '_____'}
      </div>
    </div>
  )
}
