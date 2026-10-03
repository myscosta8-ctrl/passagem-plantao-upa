// Faixa de "Falha ao carregar dados" no topo da área de trabalho.
export default function FaixaErroApp({ erroApp, onFechar }) {
  if (!erroApp) return null
  return (
    <div role="alert" className="faixa-erro-app">
      <i className="ph ph-warning-circle" /> Falha ao carregar dados ({erroApp.contexto}). Verifique a conexão — as informações exibidas podem estar incompletas.
      <button type="button" onClick={onFechar}>Fechar</button>
    </div>
  )
}
