import { Component } from 'react'

// Proteção por aba: se uma aba der erro, só ela mostra o aviso com "Tentar de novo" —
// o prontuário, as outras abas e o painel continuam funcionando. Troca de aba (`chave`)
// limpa o erro automaticamente.
const ehVersaoAntiga = (e) => /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|ChunkLoadError|Loading chunk/i.test(String(e?.message || e))

export default class ErroAba extends Component {
  constructor(props) {
    super(props)
    this.state = { erro: null, chave: props.chave, tentativa: 0 }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.chave !== state.chave) return { erro: null, chave: props.chave }
    return null
  }

  componentDidCatch(erro, info) {
    console.error(`Erro na aba ${this.props.chave ?? ''}:`, erro, info)
  }

  render() {
    const { erro, tentativa } = this.state
    if (!erro) return <div key={tentativa} style={{ display: 'contents' }}>{this.props.children}</div>
    const antiga = ehVersaoAntiga(erro)
    return (
      <div role="alert" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
        <i className="ph ph-warning-circle" style={{ fontSize: 'var(--fs-3xl)', color: '#B45309' }} />
        <strong style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text, #143641)' }}>
          {antiga ? 'O sistema foi atualizado' : 'Esta aba encontrou um problema'}
        </strong>
        <p style={{ margin: 0, maxWidth: 440, fontSize: 'var(--fs-sm)', color: 'var(--c-text-muted, #5A6B78)' }}>
          {antiga
            ? 'Há uma versão nova publicada. Recarregue a página para abrir esta aba — o que já foi salvo continua no banco.'
            : 'O que já foi salvo continua no banco. Tente de novo; as outras abas seguem funcionando. Se repetir, avise o suporte com o que estava fazendo.'}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!antiga && (
            <button type="button" className="btn-save-print" onClick={() => this.setState({ erro: null, tentativa: tentativa + 1 })}>
              <i className="ph ph-arrow-clockwise" /> Tentar de novo
            </button>
          )}
          <button type="button" className={antiga ? 'btn-save-print' : 'btn-save-draft'} onClick={() => window.location.reload()}>
            <i className="ph ph-arrows-clockwise" /> Recarregar página
          </button>
        </div>
      </div>
    )
  }
}
