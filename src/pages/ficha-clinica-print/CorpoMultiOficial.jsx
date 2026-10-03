import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'
import { DOC_POR_IMPRESSO, CONSELHO_POR_FUNCAO, valorCampo } from '../multi/esquemas'

// Impresso dos documentos de Nutrição e Serviço Social: só os campos preenchidos,
// na mesma ordem e com os mesmos rótulos da tela.
export default function CorpoMultiOficial({ tipo, registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const doc = DOC_POR_IMPRESSO[tipo]
  if (!doc) return null
  const d = registro.dados || {}
  const ctx = { idade: d.idade_no_registro ?? idade }
  const prof = medico || {}
  const conselho = CONSELHO_POR_FUNCAO[prof.funcao] || CONSELHO_POR_FUNCAO[doc.funcao]
  const registroConselho = prof.registro_profissional ? `${conselho} ${prof.registro_profissional}${prof.conselho_uf ? `/${prof.conselho_uf}` : ''}` : ''
  return (
    <div className="note-page">
      <CabecalhoPadraoUPA
        titulo={doc.esquema.titulo}
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        profissional={{ ...prof, crm: null, coren: null }}
        profissionalRotulo={doc.funcao === 'nutricionista' ? 'NUTRICIONISTA:' : 'ASSISTENTE SOCIAL:'}
        dataHora={dataHora}
      />
      <div className="doc-corpo">
        <div className="not-corpo">
          {doc.esquema.secoes.map((s) => {
            const linhas = s.campos.map((c) => [c, valorCampo(c, d, ctx)]).filter(([, v]) => v)
            if (!linhas.length) return null
            return (
              <div key={s.titulo} className="not-secao">
                <div className="not-secao-header">{s.titulo}</div>
                <div className="not-secao-body" style={{ whiteSpace: 'normal' }}>
                  {linhas.map(([c, v]) => (
                    <div key={c.k} style={{ marginBottom: 3, breakInside: 'avoid' }}>
                      <b>{c.rotulo}:</b>{c.tipo === 'area' ? <div style={{ whiteSpace: 'pre-wrap', marginTop: 1 }}>{v}</div> : <> {v}</>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ marginTop: 34, textAlign: 'center', breakInside: 'avoid' }}>
        <div style={{ borderTop: '1px solid #000', width: 320, margin: '0 auto 3px' }} />
        <div style={{ fontWeight: 700, fontSize: 11 }}>{prof.nome_exibicao || prof.nome || ''}</div>
        <div style={{ fontSize: 10 }}>{doc.funcao === 'nutricionista' ? 'Nutricionista' : 'Assistente Social'}{registroConselho ? ` — ${registroConselho}` : ''}</div>
        <div style={{ fontSize: 9, marginTop: 2 }}>Registrado em {dataHora}</div>
      </div>
    </div>
  )
}
