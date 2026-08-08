import { useAuth } from '../lib/AuthContext'
import { PASSOS_GUIA } from './guiaConteudo'

export default function BemVindoModal() {
  const { enfermeiro, marcarIntroducaoVista } = useAuth()

  return (
    <div className="modal-backdrop" style={{ zIndex: 100 }}>
      <div className="modal-card" style={{ maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
        <h2 className="modal-title">
          Bem-vindo(a), {enfermeiro?.nome_exibicao || enfermeiro?.nome}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', marginTop: -10, marginBottom: 18 }}>
          Um resumo rápido de como o app funciona:
        </p>

        {PASSOS_GUIA.map((passo) => (
          <div key={passo.titulo} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--color-primary-dark)', marginBottom: 3 }}>
              {passo.titulo}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>
              {passo.texto}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Você pode rever esse guia a qualquer momento pelo botão "Ajuda" no topo da tela.
        </p>

        <div className="modal-actions">
          <button className="modal-btn-primary" style={{ flex: 1 }} onClick={marcarIntroducaoVista}>
            Entendi, começar
          </button>
        </div>
      </div>
    </div>
  )
}
