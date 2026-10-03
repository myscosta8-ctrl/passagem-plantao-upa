// Aviso centralizado de carregamento (plantão, módulo da tela).
export const Carregando = ({ texto = 'Carregando...' }) => (
  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>{texto}</div>
)
