# Handoff — Admissão de Enfermagem (Histórico de Enfermagem)

Contexto para retomada pelo IDE. Sessão anterior rodou no Claude Code (chat), sem terminal
interativo — todo teste foi feito via browser automatizado. Este arquivo existe só para
handoff; pode ser apagado depois que a continuação for absorvida.

## Por onde começar

1. **Leia este arquivo inteiro antes de tocar em código.** Ele substitui o histórico de
   chat que você não tem acesso.
2. **Confira o estado real do git**, não confie só neste texto:
   ```
   git log --oneline -6
   git show --stat HEAD
   git status
   ```
   O commit mais recente deve ser o que começa com "Admissão de Enfermagem: formulário
   completo, realocado para Prontuário de Enfermagem...". Se `git status` mostrar algo
   modificado além do arquivo solto `proposta-design-system-vitaloop.html` (não
   relacionado, ver item 4 de "O que falta"), pare e investigue antes de prosseguir — pode
   ser edição feita fora desta sessão.
3. **Rode o projeto e abra o app** (`npm run dev`, ou o comando configurado no
   `.claude/launch.json` se existir). Entre em qualquer paciente → aba "Prontuário de
   Enfermagem" → "Admissão de Enfermagem". Se essa aba não existir ali, ou existir dentro
   de "Prontuário Médico" em vez de "Prontuário de Enfermagem", a realocação descrita na
   seção 2 abaixo não está no estado esperado — comece por aí.
4. **Leia os 4 arquivos novos nesta ordem** para entender a arquitetura antes de mexer:
   `src/pages/historicoEnfermagemConfig.js` (dados/config) →
   `src/pages/AbaHistoricoEnfermagem.jsx` (formulário) →
   `src/pages/CabecalhoPadraoUPA.jsx` (cabeçalho compartilhado) →
   `src/pages/CorpoHistoricoEnfermagem.jsx` (impressão).
5. **Trate a seção "O que falta" abaixo como o backlog imediato**, na ordem em que está
   listada. Não inicie os documentos de enfermagem do item 3 sem confirmar com o usuário —
   é a mesma regra que valeu a sessão inteira ("um documento de cada vez", só com ok
   explícito).
6. Se o usuário disser algo como "continua de onde parou" sem mais contexto, o próximo
   passo concreto é o item 1 de "O que falta" (revisão do `somenteSe`).

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

0. **[PENDÊNCIA DE COMMIT/PUSH]**: As alterações da etapa 1 (`somenteSe` nos campos de exame físico em `AbaHistoricoEnfermagem.jsx` e `historicoEnfermagemConfig.js`) foram implementadas e validadas com build com sucesso, porém o commit e push para o repositório (`origin/pep/fase-0-fundacao`) estão pendentes a pedido do usuário.

1. **Revisão do `somenteSe`** — **[CONCLUÍDO NO CÓDIGO]**: `CampoExameFisico` em
   `AbaHistoricoEnfermagem.jsx` foi atualizado para suportar string ou array de strings em
   `somenteSe`. Aplicado em `historicoEnfermagemConfig.js`:
   - `padrao_respiratorio`: `expectoracao` condicionado a `['Tosse', 'Traqueostomizado', 'Ventilação mecânica']`.
   - `abdome_2`: `vomitos_dia` condicionado a `['Vômitos', 'Hematêmese']`.
   - `habito_intestinal`: `diarreia_dia` condicionado a `'Diarreia'`.
   - `membros_superiores` e `membros_inferiores`: `especificar` condicionado a `'Com anormalidades'` (já existente).
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
