import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

// Espelha literalmente as opções de mockups-fase2/07-plano-terapeutico-design.html
// (seções 4 e 5), para o impresso refletir exatamente o que foi marcado na tela.
const PLANO_PROTOCOLOS_PADRAO = [
  { nome: 'IDENTIFICAÇÃO SEGURA', chave: 'identificação segura' },
  { nome: 'PREVENÇÃO DE QUEDA', chave: 'prevenção de queda' },
  { nome: 'PREVENÇÃO DE LPP', chave: 'prevenção de lpp' },
  { nome: 'CONTROLE DA DOR', chave: 'controle da dor' },
  { nome: 'TCE GRAVE', chave: 'tce grave' },
  { nome: 'TEV CLÍNICO / CIRÚRGICO', chave: 'tev' },
  { nome: 'JEJUM / DIETA ZERO', chave: 'jejum' },
  { nome: 'CIRURGIA SEGURA', chave: 'cirurgia segura' },
]

const PLANO_EQUIPE_PADRAO = [
  { nome: 'ENFERMAGEM', chave: 'enfermagem' },
  { nome: 'FISIOTERAPIA RESP/MOTORA', chave: 'fisioterapia' },
  { nome: 'SERVIÇO SOCIAL', chave: 'serviço social' },
  { nome: 'NUTRIÇÃO CLÍNICA', chave: 'nutrição' },
  { nome: 'PSICOLOGIA HOSPITALAR', chave: 'psicologia' },
  { nome: 'EQ. TRANSPORTE (SAMU)', chave: 'samu' },
]

export default function CorpoPlanoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const extra = registro.campos_extra || {}
  const problemas = extra.problemas_ativos || []
  const protocolosSelecionados = registro.protocolos_elegiveis || []
  const equipeSelecionada = registro.equipe_multidisciplinar || []

  return (
    <div className="plano-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="PLANO TERAPÊUTICO HOSPITALAR"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="med-secao" style={{ marginTop: '2px' }}>
          <div className="med-secao-header">1. Diagnósticos Clínicos e Hipóteses Ativas (Alocando o Principal na 1ª Linha)</div>
          <div className="med-secao-body">
            <div><b>1. PRINCIPAL:</b> {registro.diagnostico_principal_cid || extra.diagnostico_principal || 'Não informado'}</div>
            {extra.diagnosticos_texto && (
              <div style={{ marginTop: '2px' }}><b>2. SECUNDÁRIOS:</b> {extra.diagnosticos_texto}</div>
            )}
            {extra.comorbidades_antecedentes && (
              <div style={{ marginTop: '2px', color: '#475569' }}><b>Comorbidades / Antecedentes:</b> {extra.comorbidades_antecedentes}</div>
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Motivo da Permanência / Internação (Causa-base que justifica a observação)</div>
          <div className="med-secao-body" style={{ minHeight: '14mm', whiteSpace: 'pre-wrap' }}>
            {registro.motivo_internacao || ''}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Objetivos da Terapêutica (Metas com tempo previsto de alcance)</div>
          <div className="med-secao-body">
            {problemas.length > 0 ? (
              <div className="metas-lista">
                {problemas.map((p, i) => (
                  <div key={i} className="metas-item">
                    <span>&bull; {p.descricao}</span>
                    <b>{p.prazo === '1' ? '01 DIA' : p.prazo === '2' ? '02 DIAS' : p.prazo === '3' ? '03 DIAS' : (p.prazo || 'CONTÍNUO')}</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="metas-lista" style={{ minHeight: 40 }} />
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Elegível para Protocolos Institucionais (Obrigatórios e Específicos)</div>
          <div className="med-secao-body">
            <div className="proto-grid">
              {PLANO_PROTOCOLOS_PADRAO.map((p) => {
                const ativo = protocolosSelecionados.some((s) => s.toLowerCase().includes(p.chave))
                return (
                  <div key={p.nome} className={`proto-item ${ativo ? 'ativo' : 'inativo'}`}>
                    <b>{ativo ? '[ X ]' : '[   ]'}</b> {p.nome}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="med-secao med-secao-expansivel">
          <div className="med-secao-header">5. Tempo de Permanência Previsto e Equipe Multidisciplinar</div>
          <div className="med-secao-body">
            <div className="grid-equipe-tempo">
              <div className="box-destaque-tempo">
                <span className="num">
                  {registro.tempo_internacao_previsto_dias ? `${String(registro.tempo_internacao_previsto_dias).padStart(2, '0')} DIAS` : '24 a 48H'}
                </span>
                <span className="sub">Tempo Previsto na UPA</span>
                <span style={{ fontSize: '11pt', color: '#334155', marginTop: '3px' }}>
                  {extra.observacao_alta ? `Condicionante da alta: ${extra.observacao_alta}` : 'Estabilização clínica e definição de desfecho'}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '3px' }}>EQUIPE MULTIPROFISSIONAL ENVOLVIDA:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5px 6px', fontSize: '11pt' }}>
                  {PLANO_EQUIPE_PADRAO.map((eq) => {
                    const ativo = equipeSelecionada.some((s) => s.toLowerCase().includes(eq.chave))
                    return (
                      <div key={eq.nome} style={{ color: ativo ? '#0f172a' : '#64748b', fontWeight: ativo ? 700 : 400 }}>
                        {ativo ? '[ X ]' : '[   ]'} {eq.nome}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {new Date().toLocaleDateString('pt-BR')}</div>
            <div className="hora-envio"><b>Elaborado às:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora} &bull; Prontuário Oficial</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Responsável'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Responsável pelo Plano Terapêutico</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Plano Terapêutico Hospitalar &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
