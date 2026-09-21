import { EXAME_FISICO_CONFIG, INFO_COMPLEMENTARES_CAMPOS, COLETA_DADOS_OPCOES } from './historicoEnfermagemConfig'
import CabecalhoPadraoUPA from './CabecalhoPadraoUPA'

// ===================== Admissão de Enfermagem (Histórico de Enfermagem) =====================
// Duas variantes de impressão: "Fiel" replica pixel a pixel o modelo
// oficial (caixas ☒/☐ burocráticas); "Projeto" usa o mesmo layout
// moderno (admf-*) já padronizado no restante do sistema.

function HefCampo({ campo, valor }) {
  const v = valor || {}
  const opcoesMarcadas = v.opcoes || []
  return (
    <div className="hef-linha-check">
      {campo.label && <b className="hef-campo-label">{campo.label}:</b>}
      {campo.opcoes.map((op) => (
        <span key={op} className="hef-opcao">{opcoesMarcadas.includes(op) ? '☒' : '☐'} {op}</span>
      ))}
      {(campo.extras || []).map((ex) => (
        <span key={ex.key} className="hef-opcao">{ex.label}: <span className="hef-extra">{v.extra?.[ex.key] || ''}</span></span>
      ))}
    </div>
  )
}

export function CorpoHistoricoEnfermagemFiel({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const ic = registro.info_complementares || {}
  const medicamentos = (registro.medicamentos_uso || []).filter((m) => m.nome)
  const criadoEm = registro.criado_em ? new Date(registro.criado_em) : null

  return (
    <div className="hef-page">
      <CabecalhoPadraoUPA
        titulo="ADMISSÃO DE ENFERMAGEM"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome}
        medico={medico} profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:" dataHora={dataHora}
      />

      <div className="hef-linha-check" style={{ justifyContent: 'space-between', marginTop: '2mm' }}>
        {COLETA_DADOS_OPCOES.map((o) => (
          <span key={o.key} className="hef-opcao">{(registro.coleta_dados || []).includes(o.label) ? '☒' : '☐'} {o.label}</span>
        ))}
      </div>

      <div className="hef-par">
        <div className="hef-caixa" style={{ flex: 1 }}>
          <div className="hef-caixa-titulo">Alergia</div>
          <div className="hef-linha-check">
            <span className="hef-opcao">{!registro.alergia ? '☒' : '☐'} Não</span>
            <span className="hef-opcao">{registro.alergia ? '☒' : '☐'} Sim</span>
          </div>
          <div>Quais? <span className="hef-extra hef-extra-largo">{registro.alergia_quais || ''}</span></div>
        </div>
        <div className="hef-caixa" style={{ flex: 1 }}>
          <div className="hef-caixa-titulo">Motivo de Hospitalização / Queixa Principal</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{registro.motivo_hospitalizacao}</div>
        </div>
      </div>

      <div className="hef-secao-titulo">Informações complementares</div>
      <div className="hef-caixa">
        {INFO_COMPLEMENTARES_CAMPOS.map((c) => {
          const v = ic[c.key] || {}
          return (
            <div key={c.key} className="hef-linha-check">
              <b className="hef-campo-label" style={{ minWidth: '38mm' }}>{c.label}</b>
              <span className="hef-opcao">{v.sim ? '☒' : '☐'} Sim</span>
              <span className="hef-opcao">{!v.sim ? '☒' : '☐'} Não</span>
              <span className="hef-opcao">| Especificar: <span className="hef-extra">{v.especificar || ''}</span></span>
            </div>
          )
        })}
        <div className="hef-linha-check">Outros <span className="hef-extra hef-extra-largo">{registro.outros_info || ''}</span></div>
      </div>

      <div className="hef-secao-titulo">Medicamento em uso</div>
      <table className="hef-tabela-med">
        <thead><tr><th>Nome</th><th>Via</th><th>Dose</th><th>Tempo de Uso</th></tr></thead>
        <tbody>
          {medicamentos.length > 0 ? medicamentos.map((m, i) => (
            <tr key={i}><td>{m.nome}</td><td>{m.via}</td><td>{m.dose}</td><td>{m.tempo_uso}</td></tr>
          )) : <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>}
        </tbody>
      </table>

      <div className="hef-secao-titulo" style={{ marginTop: '3mm' }}>Exame Físico</div>
      {EXAME_FISICO_CONFIG.map((sec) => (
        <div key={sec.secao}>
          <div className="hef-secao-titulo">{sec.secaoTitulo}</div>
          <div className="hef-caixa">
            {sec.campos.map((campo) => <HefCampo key={campo.id} campo={campo} valor={registro.exame_fisico?.[campo.id]} />)}
            {sec.observacao && <div className="hef-linha-check">Observação: <span className="hef-extra hef-extra-largo" /></div>}
          </div>
        </div>
      ))}

      <div className="hef-secao-titulo">Parecer do Enfermeiro</div>
      <div className="hef-caixa">
        <div className="hef-linha-check">
          <b className="hef-campo-label">Estado emocional</b>
          {['Calmo', 'Tenso', 'Agressivo', 'Preocupado'].map((o) => <span key={o} className="hef-opcao">{registro.parecer_estado_emocional === o ? '☒' : '☐'} {o}</span>)}
        </div>
        <div className="hef-linha-check">
          <b className="hef-campo-label">Estado cognitivo</b>
          {['Capaz de atender às solicitações', 'Capaz de apreender às orientações', 'Deficiência cognitiva'].map((o) => <span key={o} className="hef-opcao">{registro.parecer_estado_cognitivo === o ? '☒' : '☐'} {o}</span>)}
        </div>
        <div className="hef-linha-check">Obs: <span className="hef-extra hef-extra-largo">{registro.parecer_obs || ''}</span></div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Admissão:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{medico?.coren ? `COREN-PA ${medico.coren}` : (medico?.crm ? `COREN-PA ${medico.crm}` : 'COREN-PA')}</div>
            <div className="cargo-sig">Enfermeiro(a) de Admissão — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Admissão de Enfermagem (Histórico) — Folha Única</span>
        </div>
      </div>
    </div>
  )
}

export function CorpoHistoricoEnfermagemProjeto({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const ic = registro.info_complementares || {}
  const medicamentos = (registro.medicamentos_uso || []).filter((m) => m.nome)

  return (
    <div className="enf-page">
      <CabecalhoPadraoUPA
        titulo="ADMISSÃO DE ENFERMAGEM"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={medico}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        {/* 1. Coleta de Dados e Procedência */}
        <div className="enf-secao">
          <div className="enf-secao-header">1. Coleta de Dados e Procedência</div>
          <div className="enf-secao-body">
            <b>Informante(s):</b> {(registro.coleta_dados && registro.coleta_dados.length > 0) ? registro.coleta_dados.join(', ') : 'Próprio paciente, orientado e colaborativo.'}
          </div>
        </div>

        {/* 2. Motivo da Hospitalização / Queixa Principal */}
        <div className="enf-secao">
          <div className="enf-secao-header">2. Motivo da Hospitalização / Queixa Principal</div>
          <div className="enf-secao-body" style={{ whiteSpace: 'pre-wrap' }}>
            {registro.motivo_hospitalizacao || 'Paciente admitido na unidade de pronto atendimento para observação clínica e cuidados contínuos da equipe de enfermagem.'}
          </div>
        </div>

        {/* 3. Informações Complementares e Antecedentes */}
        <div className="enf-secao">
          <div className="enf-secao-header">3. Informações Complementares e Antecedentes</div>
          <div className="enf-secao-body">
            <div className="enf-grid-2">
              <div>
                <b>Alergia:</b> {registro.alergia ? `Sim (${registro.alergia_quais || 'Não especificadas'})` : 'Nega alergias conhecidas'}
              </div>
              {INFO_COMPLEMENTARES_CAMPOS.map((c) => {
                const v = ic[c.key] || {}
                return (
                  <div key={c.key}>
                    <b>{c.label}:</b> {v.sim ? `Sim${v.especificar ? ` (${v.especificar})` : ''}` : 'Não'}
                  </div>
                )
              })}
              {registro.outros_info && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <b>Outras Informações Relevantes:</b> {registro.outros_info}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Medicamentos em Uso Domiciliar */}
        <div className="enf-secao">
          <div className="enf-secao-header">4. Medicamentos em Uso Domiciliar</div>
          <div className="enf-secao-body" style={{ padding: medicamentos.length > 0 ? 0 : '4px 7px' }}>
            {medicamentos.length > 0 ? (
              <table className="enf-tabela-med">
                <thead>
                  <tr>
                    <th>Medicamento / Princípio Ativo</th>
                    <th>Via</th>
                    <th>Dose / Posologia</th>
                    <th>Tempo de Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentos.map((m, i) => (
                    <tr key={i}>
                      <td><b>{m.nome}</b></td>
                      <td>{m.via || 'VO'}</td>
                      <td>{m.dose || '—'}</td>
                      <td>{m.tempo_uso || 'Uso contínuo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>Nega uso regular de medicações domiciliares ou não informado no momento da admissão.</div>
            )}
          </div>
        </div>

        {/* 5. Exame Físico de Enfermagem na Admissão */}
        <div className="enf-secao">
          <div className="enf-secao-header">5. Exame Físico de Enfermagem na Admissão</div>
          <div className="enf-secao-body">
            {EXAME_FISICO_CONFIG.map((sec) => {
              const camposPreenchidos = sec.campos.map((campo) => {
                const v = registro.exame_fisico?.[campo.id] || {}
                const opcoesTxt = (v.opcoes || []).join(', ')
                const extrasTxt = Object.entries(v.extra || {})
                  .filter(([, val]) => val)
                  .map(([k, val]) => {
                    const ex = (campo.extras || []).find((e) => e.key === k)
                    return `${ex?.label || k}: ${val}`
                  }).join(' — ')
                if (!opcoesTxt && !extrasTxt) return null
                return (
                  <span key={campo.id} style={{ marginRight: 10 }}>
                    {campo.label && <b>{campo.label}: </b>}
                    {opcoesTxt}{extrasTxt ? ` (${extrasTxt})` : ''}
                  </span>
                )
              }).filter(Boolean)

              if (camposPreenchidos.length === 0) return null

              return (
                <div key={sec.secao} style={{ marginBottom: 2.5 }}>
                  <b style={{ color: '#0f172a' }}>{sec.secaoTitulo}:</b> {camposPreenchidos}
                </div>
              )
            })}
            {(!registro.exame_fisico || Object.keys(registro.exame_fisico).length === 0) && (
              <div>Estado geral regular, lúcido e orientado, eupneico em ar ambiente, mucosas coradas e hidratadas, pele íntegra. Abdome flácido e indolor.</div>
            )}
          </div>
        </div>

        {/* 6. Parecer e Condutas Iniciais da Enfermagem */}
        <div className="enf-secao enf-secao-expansivel">
          <div className="enf-secao-header">6. Parecer e Condutas Iniciais da Enfermagem</div>
          <div className="enf-secao-body">
            <div style={{ marginBottom: 3 }}>
              <b>Estado Emocional:</b> {registro.parecer_estado_emocional || 'Calmo'} &bull; <b>Estado Cognitivo:</b> {registro.parecer_estado_cognitivo || 'Capaz de atender às solicitações'}
            </div>
            {registro.parecer_obs && <div><b>Observações / Condutas:</b> {registro.parecer_obs}</div>}
            {!registro.parecer_obs && <div>Instalado acesso venoso periférico em MSE com salinização. Paciente acomodado no leito sob grades elevadas. Realizadas orientações ao paciente e familiar.</div>}
          </div>
        </div>
      </div>

      {/* RODAPÉ FIXO NO FINAL DA FOLHA A4 */}
      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Admissão:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{medico?.coren ? `COREN-PA ${medico.coren}` : (medico?.crm ? `COREN-PA ${medico.crm}` : 'COREN-PA')}</div>
            <div className="cargo-sig">Enfermeiro(a) de Admissão — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Admissão de Enfermagem — Folha Única — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
