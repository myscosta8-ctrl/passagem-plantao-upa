import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

// Requisições de exames — modelos_impressao_html/19 (laboratório),
// 20 (imagem/RX) e 21 (ECG). Mesma estrutura dos modelos oficiais, com os
// dados reais da solicitação gravada em exames_solicitados (coluna "exames"
// com os itens escolhidos e "justificativa_clinica").
const CONFIG = {
  lab: {
    titulo: 'REQUISIÇÃO DE EXAMES LABORATORIAIS — LABORATÓRIO INTERNO',
    secao: 'EXAMES SOLICITADOS AO LABORATÓRIO DE ANÁLISES CLÍNICAS (INTERNO)',
    aviso: 'Exclusivo para processamento na unidade UPA 24h',
    colGrupo: 'Grupo / Especialidade',
    colNome: 'Procedimento Diagnóstico Solicitado',
    colExtra: 'Amostra / Tubo de Coleta',
    campoExtra: 'amostra',
    classeExtra: 'td-amostra',
    declaracao: 'Declaro a indicação clínica dos exames solicitados acima para suporte ao atendimento de emergência.',
    setorTitulo: 'RECEBIMENTO — LABORATÓRIO DE ANÁLISES CLÍNICAS',
    setorTexto: <>Data do Recebimento: ____/____/______ &nbsp;&nbsp;&nbsp;&nbsp; Horário: ____:____<br />Amostras: ( &nbsp; ) Tubo EDTA &nbsp;&nbsp; ( &nbsp; ) Soro/Gel &nbsp;&nbsp; ( &nbsp; ) Citrato &nbsp;&nbsp; ( &nbsp; ) Urina</>,
    setorCarimbo: 'Técnico / Biomédico Responsável — CRF/CRBM',
    setorCargo: 'Posto de Coleta / Laboratório Interno UPA Breves',
    rodape: 'LABORATÓRIO DE ANÁLISES CLÍNICAS (INTERNO)',
  },
  img: {
    titulo: 'REQUISIÇÃO DE EXAMES DE IMAGEM & RADIOLOGIA — SETOR INTERNO',
    secao: 'EXAMES DE IMAGEM SOLICITADOS AO SETOR DE RADIOLOGIA DIGITAL',
    aviso: 'Exclusivo para execução na unidade UPA 24h',
    colGrupo: 'Modalidade / Região Anatômica',
    colNome: 'Procedimento Diagnóstico & Incidências Solicitadas',
    colExtra: 'Posicionamento / Incidências',
    campoExtra: 'projecao',
    classeExtra: 'td-projecao',
    declaracao: 'Declaro a indicação clínica e radiológica dos procedimentos solicitados acima para suporte à emergência.',
    setorTitulo: 'CONFIRMAÇÃO — SETOR DE RADIOLOGIA DIGITAL',
    setorTexto: <>Procedimento executado conforme solicitação médica e protocolos de radioproteção.<br />Imagens digitais arquivadas e anexadas ao prontuário eletrônico da UPA.</>,
    setorCarimbo: 'Técnico em Radiologia — CRTR',
    setorCargo: 'Setor de Diagnóstico por Imagem — UPA Breves',
    rodape: 'SETOR DE RADIOLOGIA DIGITAL (INTERNO)',
  },
  ecg: {
    titulo: 'REQUISIÇÃO DE ELETROCARDIOGRAMA (ECG) — MÉTODOS GRÁFICOS',
    secao: 'PROCEDIMENTOS DE ELETROCARDIOGRAFIA SOLICITADOS',
    aviso: 'Exclusivo para execução na unidade UPA 24h',
    colGrupo: 'Modalidade / Método Gráfico',
    colNome: 'Procedimento Diagnóstico & Derivações Solicitadas',
    colExtra: 'Parâmetros de Registro',
    campoExtra: 'projecao',
    classeExtra: 'td-projecao',
    declaracao: 'Declaro a indicação clínica do exame eletrocardiográfico para suporte diagnóstico à emergência.',
    setorTitulo: 'EXECUÇÃO / LAUDO — SETOR DE ECG',
    setorTexto: <>Traçado executado em calibração padrão (10 mm/mV, 25 mm/s).<br />Fita original impressa e rubricada anexada ao prontuário eletrônico.</>,
    setorCarimbo: 'Técnico em Enfermagem / Operador — COREN',
    setorCargo: 'Setor de Métodos Gráficos — UPA Breves',
    rodape: 'SETOR DE MÉTODOS GRÁFICOS & ELETROCARDIOGRAFIA',
  },
}

export default function CorpoRequisicaoExamesOficial({ modalidade, registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const c = CONFIG[modalidade] || CONFIG.lab
  const itens = Array.isArray(registro.exames) ? registro.exames : []
  const urgente = /urg|emerg/i.test(registro.urgencia || registro.preparo || '')

  return (
    <div className="rq-page">
      <CabecalhoPadraoUPA
        titulo={
          <div className="pr-titulo-banner">
            <h2>{c.titulo}</h2>
            <div className="pr-badge-prioridade">{urgente ? 'URGÊNCIA / EMERGÊNCIA' : (registro.urgencia || registro.preparo || 'ROTINA')}</div>
          </div>
        }
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={medico}
        profissionalRotulo="MÉDICO SOLICITANTE:"
      />

      <div>
        <div className="pr-secao-titulo">
          <span>{c.secao}</span>
          <span className="sub-aviso">{c.aviso}</span>
        </div>
        <table className="tbl-exames-solicitados">
          <thead>
            <tr>
              <th className="td-num">Item</th>
              <th className="td-categoria">{c.colGrupo}</th>
              <th className="td-nome">{c.colNome}</th>
              <th className={c.classeExtra}>{c.colExtra}</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((it, i) => (
              <tr key={i}>
                <td className="td-num">{String(i + 1).padStart(2, '0')}</td>
                <td className="td-categoria">{it.grupo}</td>
                <td className="td-nome">{it.nome}</td>
                <td className={c.classeExtra}>{it[c.campoExtra] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="pr-secao-titulo">JUSTIFICATIVA CLÍNICA / HIPÓTESE DIAGNÓSTICA</div>
        <div className="box-justificativa">{registro.justificativa_clinica || ''}</div>
      </div>

      <div className="bloco-assinaturas">
        <div className="card-assinatura">
          <div>
            <div className="card-assinatura-titulo">MÉDICO SOLICITANTE</div>
            <div className="card-assinatura-texto">{c.declaracao}</div>
          </div>
          <div className="espaco-livre-carimbo" />
          <div>
            <div className="linha-carimbo" />
            <div className="sub-carimbo">{[medico?.nome_exibicao || medico?.nome, medico?.crm && `CRM ${medico.crm}`].filter(Boolean).join(' — ').toUpperCase()}</div>
            <div className="cargo-carimbo">Médico Plantonista — UPA 24h Breves</div>
          </div>
        </div>
        <div className="card-assinatura">
          <div>
            <div className="card-assinatura-titulo">{c.setorTitulo}</div>
            <div className="card-assinatura-texto">{c.setorTexto}</div>
          </div>
          <div className="espaco-livre-carimbo" />
          <div>
            <div className="linha-carimbo" />
            <div className="sub-carimbo">{c.setorCarimbo}</div>
            <div className="cargo-carimbo">{c.setorCargo}</div>
          </div>
        </div>
      </div>

      <div className="rq-rodape">
        <div>UPA 24H BREVES — BREVES/PA | {c.rodape}</div>
        <div>EMISSÃO: {new Date().toLocaleString('pt-BR')} — VIA DO SETOR / PRONTUÁRIO</div>
      </div>
    </div>
  )
}
