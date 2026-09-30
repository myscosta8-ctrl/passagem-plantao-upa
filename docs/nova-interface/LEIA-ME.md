# Nova interface — propostas aprovadas

Modelos de referência para o redesign do Passagem de Plantão (dados fictícios).
Regra geral: **mesma organização de informações de hoje; muda só a interface.**

| # | Tela | Situação |
|---|------|----------|
| 01 | Painel de Leitos | Aprovado |
| 02 | Janela flutuante clínica (padrão de TODAS as abas clínicas, inclusive Prescrição) | Aprovado |
| 03 | Passagem de Plantão | Aprovado |
| 04 | Recepção | Aguardando aprovação |

## Decisões de padrão
- Menu fino no topo; sem barra lateral fixa.
- Ícones de traço, na cor do texto — **sem ícones coloridos**.
- Cor só onde informa: risco (faixa no card), alergia, prescrição vencida, valor alterado.
- Ao clicar em "Evoluir" (ou em qualquer aba clínica), abre a janela flutuante ocupando quase toda a tela, com os mesmos campos e a mesma ordem da aba atual.
- Liberação gradual: só contas com `pep_beta = true` veem a nova interface.

Cada tela tem a imagem (.png) e o modelo navegável (.html, abre no navegador).
