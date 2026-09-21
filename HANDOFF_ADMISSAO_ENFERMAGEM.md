# Handoff — Admissão de Enfermagem (Histórico de Enfermagem)

Contexto para retomada pelo IDE. Sessão anterior rodou no Claude Code (chat), sem terminal
interativo — todo teste foi feito via browser automatizado. Este arquivo existe só para
handoff; pode ser apagado depois que a continuação for absorvida.

## O que foi feito

### 1. Formulário "Admissão de Enfermagem" (config-driven, ~150 campos de marcação)
Réplica fiel do PDF de referência `pdfs_exemplo/HISTORICO DE ENFERMAGEM NOVO.pdf`, renomeado
na tela para "Admissão de Enfermagem". Dois formatos de impressão: "Fiel" (pixel a pixel,
caixas ☒/☐) e "Projeto" (layout moderno `admf-*` já padrão no sistema).

- `src/pages/historicoEnfermagemConfig.js` — config compartilhada (`EXAME_FISICO_CONFIG`,
  `INFO_COMPLEMENTARES_CAMPOS`, `COLETA_DADOS_OPCOES`). Sem JSX, para evitar import circular
  entre o form e as duas telas de impressão.
- `src/pages/AbaHistoricoEnfermagem.jsx` — o formulário em si (componente de aba). Usa
  checkboxes HTML reais (`<input type="checkbox">`), não botões-toggle — exigência explícita
  do usuário, porque o papel original tem campos de marcar.
- `src/pages/CorpoHistoricoEnfermagem.jsx` — os dois corpos de impressão
  (`CorpoHistoricoEnfermagemFiel`, `CorpoHistoricoEnfermagemProjeto`).
- `src/pages/CabecalhoPadraoUPA.jsx` — cabeçalho padrão extraído para arquivo próprio
  (usado por todo documento do sistema, Prontuário Médico e Enfermagem).
- `src/lib/pepMedico.js` — `buscarHistoricoEnfermagem` / `salvarHistoricoEnfermagem`
  (tabela `historico_enfermagem`, upsert por atendimento — igual ao padrão de Plano
  Terapêutico/Sumário de Alta).

**Padrão de campo condicional** (exigência explícita): uma marcação binária só abre campo de
resposta livre quando a resposta é afirmativa. Ex.: Alergia "Não" → sem campo; "Sim" → abre
"Quais?". Já aplicado em Alergia e nas 7 linhas de Informações Complementares. Nos extras do
Exame Físico, o mecanismo é a propriedade `somenteSe` em `historicoEnfermagemConfig.js`
(ex.: `{ key: 'especificar', label: 'Especificar', somenteSe: 'Com anormalidades' }`) — o
campo só renderiza se aquela opção estiver marcada. **Só foi aplicado a
`membros_superiores`/`membros_inferiores` até agora.** Revisar o restante do
`EXAME_FISICO_CONFIG` para ver se outros `extras` deveriam ganhar `somenteSe` (o usuário
citou "comorbidades, antecedentes familiares, uso de medicamentos" como exemplos do
princípio geral, mas a maior parte disso já está coberta pelas Informações Complementares).

### 2. Realocação de pilar (correção crítica)
O formulário tinha sido construído por engano dentro do **Prontuário Médico**
(`FichaMedica.jsx`/`FichaMedicaPrint.jsx`). Isso é uma falha de arquitetura: "Admissão de
Enfermagem" pertence ao **Prontuário de Enfermagem** (`FichaClinica.jsx`/
`FichaClinicaPrint.jsx`), que é um pilar separado e pré-existente (tem sua própria aba
"Admissão" ligada à tabela legada `admissoes_enfermagem` — não mexer nela, são coisas
diferentes que coexistem).

Movido:
- Removida a aba/rota/imports de `historico_enfermagem` em `FichaMedica.jsx`.
- Adicionada nova aba `admissaoEnfermagem` em `FichaClinica.jsx` (distinta da aba
  `admissao` já existente), renderizando `AbaHistoricoEnfermagem`.
- `FichaClinicaPrint.jsx` ganhou os dois `if (tipo === 'historico_enfermagem_fiel' | '_projeto')`
  roteando para `CorpoHistoricoEnfermagem.jsx`.
- Testado fim a fim no browser: preencher, salvar, imprimir os dois formatos — funcionando.

### 3. Bug de alinhamento de checkbox (raiz global, não local)
Usuário reportou checkboxes "desalinhados" e depois "caixa por cima do texto". Causa real:
`src/index.css` tinha uma regra `input, select, textarea { width: 100% !important; ... }`
pensada para inputs de texto, mas sem excluir `type="checkbox"`/`type="radio"`. Isso esticava
cada checkbox para 100% da largura do `<label>` pai (confirmado via
`getBoundingClientRect` — o `<input>` tinha a MESMA largura do `<label>` inteiro), fazendo o
quadrado de marcação (que o navegador desenha centralizado na caixa do elemento) aparecer no
meio do texto em vez de à esquerda dele. Como a regra usa `!important`, nem `style={{}}`
inline conseguia sobrescrever.

**Correção (`src/index.css`, ~linha 184):** a regra de reset de inputs agora exclui
`[type="checkbox"]`/`[type="radio"]` via `:not()`, e uma regra nova e mais específica fixa
esses dois em `width/height: 16px !important`. É uma correção **global** — vale para todo
checkbox do sistema automaticamente, sem precisar editar tela por tela. Auditado
visualmente após a correção em: Admissão de Enfermagem, AIH (causas externas, Prontuário
Médico), Compartilhar Plantão. Não foi possível verificar visualmente a tela de Abertura de
Plantão (só aparece no fluxo de login) — confirmado por leitura de código que o seletor CSS
também cobre `AberturaPlantao.css` (`.profissional-item input[type="checkbox"]`), mas vale um
olhar visual quando for prático.

Reforços pontuais do mesmo tipo de correção (`flex: 0 0 auto` + `white-space: nowrap` nos
`<label>` de grupos de checkbox, pra impedir quebra de texto em várias linhas que também
desalinha visualmente) em:
- `src/pages/AbaHistoricoEnfermagem.jsx` (`ChipMultiEscolha`, `CheckboxUnica`, `CheckboxSimNao`)
- `src/pages/FichaMedica.jsx` (linhas ~766-780, causas externas do AIH)
- `src/pages/CompartilharPlantao.css` (`.compartilhar-check`)

## O que falta

1. **Revisão do `somenteSe`** — passar o `EXAME_FISICO_CONFIG` inteiro
   (`src/pages/historicoEnfermagemConfig.js`) e decidir campo a campo se algum outro `extra`
   deveria só aparecer condicionado a uma opção específica (hoje só
   `membros_superiores`/`membros_inferiores` tem isso). `CampoExameFisico` em
   `AbaHistoricoEnfermagem.jsx` já respeita a propriedade quando ela existe — só falta
   adicionar `somenteSe` nos campos que precisarem.
2. **Verificação visual da tela de Abertura de Plantão** (login/início de turno) — não
   testada nesta sessão por exigir logout. Confirmar que os checkboxes de seleção de
   profissionais também renderizam corretos.
3. **Documentos de enfermagem ainda não construídos** (mencionados como pendentes, não
   iniciados, aguardando ok explícito do usuário antes de começar cada um): Balanço
   Hídrico, Evolução do Enfermeiro (SAE), Nota de Intercorrência de Enfermagem,
   Transferência Interna de Pacientes (SBAR já existe, isso seria algo além do SBAR atual —
   confirmar com o usuário se ainda é pauta).
4. Arquivo solto `proposta-design-system-vitaloop.html` na raiz do projeto — não foi tocado
   nesta sessão, não está relacionado a este trabalho; **não foi incluído no commit**.
   Perguntar ao usuário se é pra manter, mover ou apagar.

## Regras de trabalho que valem pro IDE também

- Nunca apagar dado de teste sem o usuário confirmar que já viu o resultado.
- Responder sempre em pt-BR.
- Ao replicar tela/documento já existente, preservar o CSS original com fidelidade total —
  não inventar estilo próprio.
- Documentos oficiais do SUS: usar o modelo oficial em branco como referência, nunca um PDF
  escaneado de hospital terceiro.
- Migração de banco (Supabase) sempre pede confirmação explícita do usuário antes de aplicar.
