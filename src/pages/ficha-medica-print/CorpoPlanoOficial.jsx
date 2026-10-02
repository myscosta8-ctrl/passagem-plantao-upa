import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'
import RodapeAssinatura from '../print/RodapeAssinatura'

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
                <span style={{ fontSize: '8px', color: '#334155', marginTop: '3px' }}>
                  {extra.observacao_alta ? `Condicionante da alta: ${extra.observacao_alta}` : 'Estabilização clínica e definição de desfecho'}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '3px' }}>EQUIPE MULTIPROFISSIONAL ENVOLVIDA:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5px 6px', fontSize: '8.5px' }}>
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

      <RodapeAssinatura
        data={new Date(registro?.data_registro || registro?.criado_em || Date.now()).toLocaleDateString('pt-BR')}
        rotuloHora='Elaborado às:'
        hora={dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}
        sufixoHora=' • Prontuário Oficial'
        nome={medico?.nome_exibicao || medico?.nome || 'Médico Responsável'}
        conselho={medico?.crm ? `CRM-${medico.conselho_uf || 'PA'} ${medico.crm}` : 'CRM/UF'}
        cargo='Médico Responsável pelo Plano Terapêutico'
        sistema='Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA'
        documento='Plano Terapêutico Hospitalar'
      />
    </div>
  )
}
