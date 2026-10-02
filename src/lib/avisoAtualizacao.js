// Aviso de versão nova do sistema (PWA). O app nunca recarrega sozinho: uma faixa no rodapé
// avisa que há atualização e o profissional clica em "Atualizar agora" quando terminar o que
// está registrando. Rascunhos salvos no banco não se perdem; o que estiver só na tela, sim —
// por isso a escolha da hora fica com quem está usando.
let faixa = null

export function mostrarAvisoAtualizacao(atualizar) {
  if (faixa || typeof document === 'undefined') return
  faixa = document.createElement('div')
  faixa.setAttribute('role', 'status')
  faixa.style.cssText = [
    'position:fixed', 'left:50%', 'bottom:16px', 'transform:translateX(-50%)', 'z-index:20000',
    'display:flex', 'align-items:center', 'gap:12px', 'flex-wrap:wrap', 'justify-content:center',
    'max-width:calc(100vw - 32px)', 'padding:10px 14px', 'border-radius:10px',
    'background:#0A1F33', 'color:#fff', 'font:14px/1.3 var(--font-ui, sans-serif)',
    'box-shadow:0 6px 24px rgba(0,0,0,.25)',
  ].join(';')
  const texto = document.createElement('span')
  texto.textContent = 'Nova versão do sistema disponível. Salve o que estiver fazendo e atualize.'
  const botao = document.createElement('button')
  botao.type = 'button'
  botao.textContent = 'Atualizar agora'
  botao.style.cssText = 'border:0;border-radius:8px;padding:6px 12px;background:#14B8A6;color:#062B27;font-weight:700;cursor:pointer'
  botao.onclick = () => { botao.disabled = true; botao.textContent = 'Atualizando...'; atualizar() }
  const depois = document.createElement('button')
  depois.type = 'button'
  depois.textContent = 'Depois'
  depois.style.cssText = 'border:1px solid rgba(255,255,255,.4);border-radius:8px;padding:6px 10px;background:transparent;color:#fff;cursor:pointer'
  depois.onclick = () => { faixa?.remove(); faixa = null }
  faixa.append(texto, botao, depois)
  document.body.appendChild(faixa)
}
