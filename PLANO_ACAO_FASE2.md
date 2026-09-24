# Plano de Ação — Fase 2 (Redesign + módulos de enfermagem)

**Revisado em 24/09, à noite, depois de auditar o que o IDE implementou na tarde do mesmo
dia (commits `4cfb21c` e `06ba6cb` na branch `main`).** A versão anterior deste documento
tinha uma auditoria desatualizada (dizia que nada da Fase 0 existia) — corrigida abaixo.

## Confirmado com o usuário (24/09, à noite)

- **A remodelação da Passagem de Plantão AINDA NÃO foi implementada em produção** — existe
  só como proposta em `mockups-fase2/12-passagem-plantao-design.html` (workspace) e
  `modelos_impressao_html/15-passagem-plantao-coletiva.html` (impressão). O que existe hoje
  em produção (`src/pages/passagem-form/`) é só a modularização estrutural do formulário
  antigo — mesma funcionalidade, mesmo visual, só quebrado em arquivos menores.
- **Toda a Passagem de Plantão será remodelada, mas os dados salvos em produção têm que
  sobreviver**, mesmo os incompletos. Nenhuma migração/redesenho desse módulo pode implicar
  perda de registro existente — regra vale pra qualquer módulo, mas o usuário pediu ênfase
  nesse especificamente.
- Confirmado por auditoria própria (não só pelo commit message): nenhum dado foi de fato
  alterado hoje. As 6 migrações novas em `supabase/migrations/20260924*.sql` e o
  `supabase/DEPLOY_PRODUCAO.sql` **nunca foram aplicados no banco real** — `list_migrations`
  no Supabase mostra a última migração real ainda sendo a nossa, de dias atrás
  (`pep_historico_enfermagem`). Contagem de linhas de `pacientes`, `atendimentos`,
  `internacoes`, `leito_ocupacoes`, `realocacoes` idêntica à de antes. Os arquivos são
  aditivos (`CREATE TABLE IF NOT EXISTS`, sem `DROP`/`TRUNCATE`), mas **não devem ser
  rodados (`npm run db:migrate` ou o SQL direto) sem revisão prévia**, exatamente por
  cobrirem tabelas que já têm dado real hoje.

## ✅ Item 0 — Bug crítico do dado falso — CORRIGIDO (24/09, à noite, commit `a3c5953`)

Os 3 arquivos que o IDE reescreveu hoje (`src/pages/ficha-medica/AbaAih.jsx`,
`src/pages/ficha-medica/AbaConsulta.jsx`, `src/pages/ficha-medica/PatientBanner.jsx`)
ficaram com **texto de exemplo do mockup HTML hardcoded como fallback `||`** em vez de
serem removidos ao ligar no dado real. Sempre que o campo vier vazio do banco (situação
normal — nem todo paciente tem CNS, sinais vitais ainda não aferidos etc.), a tela mostrava
**dado inventado como se fosse real**, inclusive na AIH (documento com valor legal):

- Sinais vitais falsos: PA `90x60`, FC `110`, Temp `39.2°C`, SpO2 `97%`
- Alergia grave inventada: `"DIPIRONA (Risco de Choque Anafilático)"`
- CNS `700.1234.5678.9012`, RG/CPF, endereço completo, nome da mãe "Maria Eduarda Silva"
- Queixa da triagem inventada: "Febre alta há 2 dias, tosse produtiva..."
- **O mais grave, encontrado só ao abrir o código pra corrigir**: o formulário inteiro de
  Consulta e o de AIH nasciam **pré-preenchidos com um caso clínico completo de pneumonia**
  (queixa, HDA, exame físico, CID, conduta, até número de autorização SUS fictício) — se o
  profissional não apagasse tudo manualmente, esse caso fake podia ser salvo como se fosse
  o atendimento real do paciente.

**Corrigido:** estado inicial dos formulários volta a nascer vazio; identificação do
paciente na AIH e no banner passa a vir de `pessoas` via `buscarCabecalhoImpressao`
(mesma função já usada nas impressões) em vez de inventar CNS/RG/mãe/endereço; alertas de
alergia só aparecem quando há alergia real registrada. Build e lint rodados sem erro.
**Não foi possível fazer verificação visual ao vivo no browser** (sem credenciais de login
neste ambiente) — validado por leitura de código, build limpo e lint limpo. Recomendo um
teste manual rápido na próxima vez que alguém abrir o Prontuário Médico de um paciente
real com campos vazios, só pra confirmar visualmente.

Texto original da ação (referência):
(ou com um placeholder visual tipo "—" / "Não informado") quando o dado real não existir.
Confirmado por grep que o padrão não vazou pro resto do sistema — está isolado nesses 3
arquivos. **Isso é o item 0 do plano, prioridade sobre tudo.**

---

## Como ler este plano

Cada fase é um pacote fechado — só avança pra próxima com confirmação explícita do usuário
(mesmo ritmo "um documento/módulo de cada vez" usado a sessão inteira).

---

## Auditoria real — o que o IDE já implementou hoje (24/09)

Verificado lendo o código atual, não supondo pelas mensagens de commit.

### Fase 0 (fundação do design system) — **parcialmente feita**

| Item | Status | Evidência |
|---|---|---|
| Paleta/tokens de cor (Manchester, sombras) | ✅ Feito | `src/index.css` tem `--mc-vermelho/laranja/amarelo/verde/azul` e variações `-bg` |
| Fonte Inter como base da UI | ✅ Feito | `--font-ui: 'Inter'...` importada e aplicada em `body`/inputs; IBM Plex Mono mantida como `--font-mono` pros campos "burocráticos" (parece intencional, não removida) |
| Ícones Phosphor | ❌ Não feito | Nenhuma ocorrência de `ph ph-` no projeto. `PatientBanner.jsx` usa **emoji** (🪪⚧⚖️🛏️💳⚠️) em vez dos ícones do mockup — inconsistente entre navegadores/SO, e diferente do que o mockup pedia |
| Sidebar redesenhada | ⚠️ Parcial | `Sidebar.css` só teve 3 linhas alteradas — não é o rebuild completo de `proposta-menu-hamburguer.html` |
| Componente de app-shell (topbar/banner) | ⚠️ Só no Prontuário Médico | `FichaMedicaHeader.jsx`, `FichaMedicaTabs.jsx`, `PatientBanner.jsx`, `FichaMedicaConteudo.jsx` criados e em uso — mas **o Prontuário de Enfermagem (`FichaClinica.jsx`) não tem equivalente**, continua com o shell antigo |
| 3 pilares do Espaço do Paciente | ✅ Já existia antes de hoje | Confirmado em `EspacoPaciente.jsx` (não é pendência) |

### Fase 1 (redesenho de conteúdo por módulo) — **2 de 16 módulos feitos**

| Módulo do mockup | Status | Evidência |
|---|---|---|
| 06 — Anamnese/Admissão (aba Consulta) | ✅ Redesenhado | `AbaConsulta.jsx` reescrito (509 linhas), sem classe `form-section` antiga — **mas tem o bug crítico do topo** |
| 06 — Laudo de AIH | ✅ Redesenhado | `AbaAih.jsx` reescrito (924 linhas), split-view — **mas tem o bug crítico do topo** |
| 01 — Painel de Leitos | ⚠️ Só CSS, não a estrutura | `Painel.css` reescrito (469 linhas) mudando cores/espaçamento, mas `Painel.jsx` **não foi tocado** — continua com a estrutura antiga (`.page`, `.visualizacao-toggle`), não o layout de cards do mockup `01-painel-leitos-design.html` |
| 02 — Recepção | ❌ Não iniciado | `CadastroPacientes.jsx` sem alteração |
| 03 — Prontuário Médico/Evolução | ❌ Não iniciado | `AbaEvolucaoMedica.jsx` ainda usa `form-section` |
| 04 — Prescrição Médica | ❌ Não iniciado | `AbaPrescricao.jsx` ainda usa `form-section` |
| 05 — Receituário/Sumário de Alta | ❌ Não iniciado | `AbaReceituarioMedico.jsx`/`AbaSumarioAlta.jsx` ainda usam `form-section` |
| 07 — Plano Terapêutico | ❌ Não iniciado | `AbaPlanoTerapeutico.jsx` ainda usa `form-section` |
| 08 — Admissão de Enfermagem | ❌ Não iniciado | `AbaHistoricoEnfermagem.jsx` continua no formato antigo (nem foi movida pra dentro de `ficha-clinica/`) |
| 09 a 16 (todo o resto) | ❌ Não iniciado | — |

O que houve hoje foi um **refactor estrutural** (quebrar `FichaMedica.jsx`/`FichaClinica.jsx`
monolíticos em um arquivo por aba, dentro de `src/pages/ficha-medica/` e
`src/pages/ficha-clinica/`) + o redesenho real de **só 2 abas** (Consulta e AIH, ambas do
Prontuário Médico). Isso é uma boa base (deixa mais fácil redesenhar aba por aba depois),
mas não é "aplicação completa do Design System da Fase 2" como o commit diz — é o começo.

### Fase 2 (funcionalidade nova) — **nada iniciado**

Confirmado: nenhuma tabela nova no banco, nenhuma função nova em `pepClinico.js`/
`pepMedico.js` pra Cardex/Aprazamento, SAE com NANDA-I/NIC, Nota de Intercorrência de
Enfermagem, ou Balanço Hídrico por turno. As tabelas órfãs identificadas na auditoria
anterior (`evolucoes_enfermagem`, `balanco_hidrico_periodos`, `balanco_hidrico_registros`)
continuam órfãs.

### Fase 3 (modelos de impressão) — **nada iniciado hoje**

Sem mudança em relação à auditoria anterior: 13 dos 21 modelos já têm impressão real no
sistema (ver lista completa mais abaixo), o resto não.

---

## Plano do que falta — ordem de execução daqui pra frente

### 0. 🚨 Corrigir o bug de dado falso (urgente, antes de tudo)
`AbaAih.jsx`, `AbaConsulta.jsx`, `PatientBanner.jsx` — remover todos os fallbacks com dado
de exemplo. Testar com um paciente real que tenha campos vazios pra confirmar que aparece
vazio/"—", não dado inventado.

### 1. Fechar a Fase 0 de verdade
1.1. Decidir (com o usuário): ícones Phosphor de verdade ou manter emoji como decisão de
     design? Se for Phosphor, trocar nos 3 arquivos que já usam emoji.
1.2. Levar o shell novo (header/tabs/banner) pro Prontuário de Enfermagem — hoje só o
     Prontuário Médico tem. Criar `FichaClinicaHeader.jsx`/`FichaClinicaTabs.jsx`/
     `PatientBanner` compartilhado (não duplicar o componente, reaproveitar o que já existe
     em `ficha-medica/PatientBanner.jsx` — hoje ele está acoplado à pasta médica).
1.3. Rebuild real da Sidebar conforme `proposta-menu-hamburguer.html` (hoje é só ajuste
     cosmético de 3 linhas).

### 2. Fase 1 — módulo por módulo, na ordem abaixo (cada um só avança com sua confirmação)
2.1. Painel de Leitos — precisa da estrutura nova (`Painel.jsx`), não só CSS.
2.2. Recepção
2.3. Evolução Médica Diária
2.4. Prescrição Médica
2.5. Receituário + Sumário de Alta
2.6. Plano Terapêutico
2.7. Admissão de Enfermagem (mover pra `ficha-clinica/`, redesenhar) — **manter os
     checkboxes reais e o padrão de campo condicional já construídos, é só a casca visual**
2.8. Passagem de Plantão coletiva
2.9. Solicitação de Hemoterapia

### 3. Fase 2 — funcionalidade nova (cada migração pede confirmação antes de aplicar)
3.1. Evolução de Enfermagem (SAE) — avaliar se aproveita a tabela órfã `evolucoes_enfermagem`
     ou se o formato mudou o suficiente pra precisar de uma nova.
3.2. Balanço Hídrico por turno — avaliar se aproveita `balanco_hidrico_periodos`/
     `balanco_hidrico_registros` órfãs ou se migra os dados da `balanco_hidrico` atual.
3.3. Nota de Intercorrência de Enfermagem — tabela nova.
3.4. Cardex/Aprazamento — o mais complexo, desenhar o modelo de dados com calma (grade
     horária ligada a `prescricao_itens`).
3.5. Transferência SBAR (versão rica) — avaliar se é só UI em cima de `transferencias_sbar`
     ou se o formato pede colunas novas.
3.6. Exames Internos + Laudo APAC (Lab/Radiologia/ECG em abas próprias).

### 4. Fase 3 — modelos de impressão
Fazer a impressão de cada módulo junto com o redesenho dele (não como etapa separada no
fim) — ex.: ao redesenhar Prescrição Médica (2.4), já revisar se
`06-prescricao-medica.html` é upgrade da impressão atual ou só redecoração.

---

## Referência — modelos de impressão já implementados vs. pendentes

**Já têm impressão real e testada:** `06-prescricao-medica`, `07-evolucao-medica-diaria`,
`08-sumario-de-alta`, `09-nota-intercorrencia-medica`, `10-consulta-admissao-medica`,
`11-formulario-antimicrobiano-atm`, `12-plano-terapeutico`,
`13-tratamento-fora-domicilio-tfd`, `14-receituario-medico-2vias`,
`16-laudo-aih-internacao`, `17-solicitacao-hemoterapicos`,
`18-laudo-apac-procedimento-ambulatorial`, `01-admissao-enfermagem`.

**Sem impressão nenhuma hoje:** `02-evolucao-enfermagem-sae`,
`03-transferencia-paciente-sbar` (upgrade da atual), `04-nota-intercorrencia-enfermagem`,
`05-balanco-hidrico-24h`, `15-passagem-plantao-coletiva`,
`19-solicitacao-exames-laboratoriais`, `20-solicitacao-exames-imagem-rx`,
`21-solicitacao-eletrocardiograma-ecg`.

---

## Tabelas no banco — referência completa

**Implementadas e em uso:** `enfermeiros`, `setores`, `leitos`, `pacientes`, `pessoas`,
`atendimentos`, `internacoes`, `leito_ocupacoes`, `realocacoes`, `plantoes`, `passagens`,
`alergias`, `dispositivos_invasivos`, `balanco_hidrico`, `escalas_enfermagem`,
`isolamentos`, `transferencias_sbar`, `eventos_adversos`, `sinais_vitais`, `evolucoes`,
`admissoes_enfermagem` (legado), `historico_enfermagem`, `consultas_medicas`,
`prescricoes_medicas`, `prescricao_itens`, `aih_solicitacoes`, `planos_terapeuticos`,
`evolucoes_medicas`, `notas_intercorrencia_medica`, `receitas_medicas`, `sumarios_alta`,
`apac_solicitacoes`, `solicitacoes_atm`, `tfd_solicitacoes`, `regulacao_atualizacoes`,
`solicitacoes_sangue`, `medicacoes_continuas`, `exames_solicitados`,
`catalogo_medicamentos`, `cid_catalog`, `configuracoes`.

**Órfãs (existem, 0 linhas, nenhuma função de acesso) — candidatas a reaproveitar na Fase 2:**
`evolucoes_enfermagem`, `balanco_hidrico_periodos`, `balanco_hidrico_registros`.

**Não existem ainda:** Cardex/Aprazamento, Nota de Intercorrência de Enfermagem (tabela
própria, distinta da médica).

---

## Pendências antigas (ainda não feitas, não esquecer)

- `proposta-design-system-vitaloop.html` duplicado (raiz do projeto + dentro de
  `mockups-fase2/`) — consolidar.
- Revisão do `somenteSe` em `historicoEnfermagemConfig.js`.
- Verificação visual da tela de Abertura de Plantão.

## Nota sobre branch

Este documento e os commits mais recentes estão em `main`, não em `pep/fase-0-fundacao`
(onde a sessão anterior trabalhou). Confirmar com o usuário se `main` é agora a linha de
trabalho ativa antes de abrir PR ou mesclar qualquer coisa.
