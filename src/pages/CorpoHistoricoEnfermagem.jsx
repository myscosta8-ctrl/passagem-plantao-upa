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
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
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

      <div className="hef-rodape">
        <span>Data: {criadoEm ? criadoEm.toLocaleDateString('pt-BR') : ''}</span>
        <span>Hora: {criadoEm ? criadoEm.toLocaleTimeString('pt-BR').slice(0, 5) : ''}</span>
        <span>Enfermeiro: {medico?.nome_exibicao || medico?.nome || ''}</span>
      </div>
    </div>
  )
}

export function CorpoHistoricoEnfermagemProjeto({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const ic = registro.info_complementares || {}
  const medicamentos = (registro.medicamentos_uso || []).filter((m) => m.nome)

  return (
    <div className="admf-document admf-document-compacto">
      <header className="admf-header">
        <CabecalhoPadraoUPA
          titulo="ADMISSÃO DE ENFERMAGEM"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />
      </header>

      <section className="admf-section">
        <div className="admf-section-title">Coleta de dados</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{(registro.coleta_dados || []).join(', ')}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Alergia</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">
            <b>{registro.alergia ? 'SIM' : 'NÃO'}</b>{registro.alergia && registro.alergia_quais ? ` — ${registro.alergia_quais}` : ''}
          </div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Motivo de Hospitalização / Queixa Principal</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.motivo_hospitalizacao || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Informações complementares</div>
        <div className="admf-section-body">
          {INFO_COMPLEMENTARES_CAMPOS.map((c) => {
            const v = ic[c.key] || {}
            return (
              <div key={c.key} className="admf-textbox admf-textbox-plano" style={{ marginBottom: '2mm' }}>
                <b>{c.label}:</b> {v.sim ? `SIM${v.especificar ? ` — ${v.especificar}` : ''}` : 'NÃO'}
              </div>
            )
          })}
          {registro.outros_info && <div className="admf-textbox admf-textbox-plano"><b>Outros:</b> {registro.outros_info}</div>}
        </div>
      </section>

      {medicamentos.length > 0 && (
        <section className="admf-section">
          <div className="admf-section-title">Medicamento em uso</div>
          <div className="admf-section-body">
            <table className="admf-tabela-problemas">
              <thead><tr><th>Nome</th><th>Via</th><th>Dose</th><th>Tempo de Uso</th></tr></thead>
              <tbody>{medicamentos.map((m, i) => <tr key={i}><td>{m.nome}</td><td>{m.via}</td><td>{m.dose}</td><td>{m.tempo_uso}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      {EXAME_FISICO_CONFIG.map((sec) => (
        <section className="admf-section" key={sec.secao}>
          <div className="admf-section-title">{sec.secaoTitulo}</div>
          <div className="admf-section-body">
            {sec.campos.map((campo) => {
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
                <div key={campo.id} className="admf-textbox admf-textbox-plano" style={{ marginBottom: '2mm' }}>
                  {campo.label && <b>{campo.label}: </b>}{opcoesTxt}{extrasTxt ? ` — ${extrasTxt}` : ''}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <section className="admf-section">
        <div className="admf-section-title">Parecer do Enfermeiro</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano"><b>Estado emocional:</b> {registro.parecer_estado_emocional || ''}</div>
          <div className="admf-textbox admf-textbox-plano" style={{ marginTop: '2mm' }}><b>Estado cognitivo:</b> {registro.parecer_estado_cognitivo || ''}</div>
          {registro.parecer_obs && <div className="admf-textbox admf-textbox-plano" style={{ marginTop: '2mm' }}><b>Obs:</b> {registro.parecer_obs}</div>}
        </div>
      </section>

      <div className="admf-assinatura">
        <div className="admf-assinatura-texto">Breves/PA, {dataHora.split(',')[0]}.</div>
        <div className="admf-assinatura-caixa">
          <div className="admf-sigline" />
          <div className="admf-sig-caption">{medico?.nome_exibicao || medico?.nome || 'Enfermeiro responsável'}</div>
          <div className="admf-sig-crm">COREN: {medico?.crm || ''}</div>
        </div>
      </div>

      <footer className="admf-footer">
        <span>Admissão de Enfermagem</span>
        <span>Registrado em {dataHora}</span>
      </footer>
    </div>
  )
}
