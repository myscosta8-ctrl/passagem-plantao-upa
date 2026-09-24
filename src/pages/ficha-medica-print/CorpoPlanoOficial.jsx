import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

const PLANO_PROTOCOLOS_PADRAO = [
  { nome: 'IDENTIFICAÇÃO DO PACIENTE', obrigatorio: true },
  { nome: 'PREVENÇÃO DE QUEDAS (Grades elevadas)', obrigatorio: true },
  { nome: 'PREVENÇÃO DE LPP (Mudança decúbito)', obrigatorio: true },
  { nome: 'CONTROLE DA DOR', chave: 'dor' },
  { nome: 'TEV — TROMBOEMBOLISMO VENOSO', chave: 'tev' },
  { nome: 'SEPSE / CHOQUE SÉPTICO', chave: 'sepse' },
  { nome: 'AVC — ACIDENTE VASCULAR CEREBRAL', chave: 'avc' },
  { nome: 'SÍNDROME CORONARIANA / DOR TORÁCICA', chave: 'coronariana' },
  { nome: 'INSUFICIÊNCIA RESPIRATÓRIA / VIA AÉREA', chave: 'respirat' },
  { nome: 'EMERGÊNCIAS GLICÊMICAS', chave: 'glic' },
]

const PLANO_EQUIPE_PADRAO = [
  { nome: 'ENFERMAGEM', chave: 'enfermagem' },
  { nome: 'FISIOTERAPIA RESPIRATÓRIA', chave: 'fisioterapia' },
  { nome: 'SERVIÇO SOCIAL', chave: 'social' },
  { nome: 'NUTRIÇÃO CLÍNICA', chave: 'nutri' },
  { nome: 'FARMÁCIA CLÍNICA', chave: 'farm' },
  { nome: 'TRANSPORTE / REGULAÇÃO', chave: 'transporte' },
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
            {registro.motivo_internacao || 'Paciente em observação clínica e estabilização na unidade.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Objetivos da Terapêutica (Metas com tempo previsto de alcance)</div>
          <div className="med-secao-body">
            {problemas.length > 0 ? (
              <div className="metas-lista">
                {problemas.map((p, i) => (
                  <div key={i} className="metas-item">
                    <span>&bull; <b>{p.descricao}:</b> {p.meta} {p.conduta ? `(${p.conduta})` : ''}</span>
                    <b>{p.prazo || 'CONTÍNUO'}</b>
                  </div>
                ))}
              </div>
            ) : registro.objetivos_terapeuticos ? (
              <div className="metas-lista">
                {registro.objetivos_terapeuticos.split('\n').filter(Boolean).map((linha, idx) => (
                  <div key={idx} className="metas-item">
                    <span>&bull; {linha}</span>
                    <b>PREVISTO</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="metas-lista">
                <div className="metas-item">
                  <span>&bull; Estabilização hemodinâmica e monitorização de parâmetros vitais</span>
                  <b>CONTÍNUO</b>
                </div>
                <div className="metas-item">
                  <span>&bull; Rastreio propedêutico e resposta clínica às condutas instituídas</span>
                  <b>24 HORAS</b>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Elegível para Protocolos Institucionais (Obrigatórios e Específicos)</div>
          <div className="med-secao-body">
            <div className="proto-grid">
              {PLANO_PROTOCOLOS_PADRAO.map((p) => {
                const ativo = p.obrigatorio || protocolosSelecionados.some((s) => s.toLowerCase().includes(p.chave || p.nome.toLowerCase()))
                return (
                  <div key={p.nome} className={`proto-item ${ativo ? 'ativo' : 'inativo'}`}>
                    <b>{ativo ? '[ X ]' : '[   ]'}</b> {p.nome}
                  </div>
                )
              })}
              {extra.protocolo_outro && (
                <div className="proto-item ativo">
                  <b>[ X ]</b> Outro: {extra.protocolo_outro}
                </div>
              )}
            </div>
            {extra.medidas_seguranca_texto && (
              <div style={{ marginTop: '3px', paddingTop: '2px', borderTop: '1px dashed #e2e8f0', fontSize: '8.2px' }}>
                <b>Medidas de Segurança Assistencial:</b> {extra.medidas_seguranca_texto}
              </div>
            )}
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
                <span style={{ fontSize: '8px', color: '#334155', marginTop: '3px' }}>
                  {extra.criterios_alta ? `Critério de alta: ${extra.criterios_alta}` : 'Estabilização clínica e definição de desfecho'}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '3px' }}>EQUIPE MULTIPROFISSIONAL ENVOLVIDA:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5px 6px', fontSize: '8.5px' }}>
                  {PLANO_EQUIPE_PADRAO.map((eq) => {
                    const ativo = eq.chave === 'enfermagem' || equipeSelecionada.some((s) => s.toLowerCase().includes(eq.chave))
                    return (
                      <div key={eq.nome} style={{ color: ativo ? '#0f172a' : '#64748b', fontWeight: ativo ? 700 : 400 }}>
                        {ativo ? '[ X ]' : '[   ]'} {eq.nome}
                      </div>
                    )
                  })}
                  {extra.equipe_outros && (
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>
                      [ X ] Outro: {extra.equipe_outros}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
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
