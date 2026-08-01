import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro capturado pelo ErrorBoundary:', erro, info)
  }

  render() {
    if (this.state.erro) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', padding: 24, textAlign: 'center', gap: 14, fontFamily: 'sans-serif',
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h2 style={{ margin: 0, color: '#143641' }}>Algo deu errado nessa tela</h2>
          <p style={{ color: '#5A6B78', maxWidth: 420, fontSize: 14 }}>
            Nada foi perdido — o que você já salvou continua no banco. Recarregue a página para continuar.
            Se acontecer de novo no mesmo lugar, avise o suporte com o que você estava fazendo.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px', background: '#1F4E5F', color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Recarregar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
