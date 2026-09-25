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

### Fase 0 (fundação do design system) — **✅ CONCLUÍDA (24/09, noite, commit `7a6336a`)**

| Item | Status | Evidência |
|---|---|---|
| Paleta/tokens de cor (Manchester, sombras) | ✅ Feito | `src/index.css` tem `--mc-vermelho/laranja/amarelo/verde/azul` e variações `-bg` |
| Fonte Inter como base da UI | ✅ Feito | `--font-ui: 'Inter'...` importada e aplicada em `body`/inputs; IBM Plex Mono mantida como `--font-mono` pros campos "burocráticos" (parece intencional, não removida) |
| Ícones Phosphor | ✅ Feito (commits `6c971d1`, `7a6336a`) | Pacote `@phosphor-icons/web` instalado localmente (`src/main.jsx`), emoji trocados por `<i className="ph ph-...">` seguindo os nomes exatos usados nos mockups, em `PatientBanner.jsx`, `FichaMedicaHeader/Tabs.jsx`, `AbaConsulta.jsx`, `AbaAih.jsx`, `Sidebar.jsx`. **Ainda faltam** `AbaApac.jsx`/`AbaExames.jsx` (arquivos antigos, fora do escopo de hoje) e os botões de imprimir em `AbaBalancoHidrico/AbaEventosAdversos/AbaEvolucao.jsx` (ficha-clinica) — ficam pro Fase 1 de cada módulo. |
| Sidebar redesenhada | ✅ Feito (commit `7a6336a`) | A estrutura (grupos, colapsar/expandir, hambúrguer mobile, cor `--c-primary-dark`) já implementava fielmente `proposta-menu-hamburguer.html` desde antes de hoje — só faltava trocar os emoji dos itens por Phosphor, feito agora. |
| Componente de app-shell (topbar/banner) | ✅ Feito (commit `6c971d1`) | Prontuário de Enfermagem ganhou `FichaClinicaHeader.jsx`/`FichaClinicaTabs.jsx`/`FichaClinicaConteudo.jsx`, espelhando o padrão do Prontuário Médico e reaproveitando o mesmo `PatientBanner` e a mesma `AtendimentoMedico.css` — nenhuma aba/funcionalidade existente foi removida, só o shell visual mudou. |
| 3 pilares do Espaço do Paciente | ✅ Já existia antes de hoje | Confirmado em `EspacoPaciente.jsx` (não é pendência) |

Próximo passo do plano: **Fase 1**, módulo por módulo, na ordem já listada abaixo.

### Fase 1 (redesenho de conteúdo por módulo) — **11 de 16 módulos feitos**

| Módulo do mockup | Status | Evidência |
|---|---|---|
| 06 — Anamnese/Admissão (aba Consulta) | ✅ Redesenhado | `AbaConsulta.jsx` reescrito, sem classe `form-section` antiga, ícones Phosphor, bug do dado falso corrigido (commit `a3c5953`) |
| 06 — Laudo de AIH | ✅ Redesenhado | `AbaAih.jsx` reescrito, split-view, ícones Phosphor, bug do dado falso corrigido (commit `a3c5953`) |
| 01 — Painel de Leitos | ✅ Concluído (commit `8148de5`) | `Painel.css` já batia com o mockup (cores, risk-bar, grid de cards); faltavam só os ícones — trocados emoji/símbolos unicode por Phosphor em `Painel.jsx`, `PainelCards.jsx`, `ModalInternar.jsx`. Nenhuma funcionalidade alterada. |
| 02 — Recepção | ✅ Concluído (commit `e26a872`) | `CadastroPacientes.css` novo, aplicado na barra de busca e cards de resultado (`AbaBusca.jsx`) e abas/lista de recentes (`CadastroPacientes.jsx`), ícones Phosphor. **Deliberadamente fora do escopo:** os campos internos dos formulários (`CamposIdentidade.jsx`/`CamposAtendimento.jsx`) continuam no padrão `.form-field`/`.form-grid` compartilhado com o resto do sistema — redesenhar esse padrão em si é tarefa maior e transversal a todos os módulos, não específica da Recepção. |
| 03 — Prontuário Médico/Evolução | ✅ Concluído (commit `022fce8`) | `AbaEvolucaoMedica.jsx` reescrito no padrão split-view (timeline + formulário), mesmo framework CSS de AIH/Consulta. Booleanos viraram checkbox real. Fora do escopo: grade de sinais vitais "puxar da enfermagem" do mockup — não existe no modelo de dados hoje, é funcionalidade nova (Fase 2). |
| 04 — Prescrição Médica | ✅ Concluído (commit `54f5cdf`) | `AbaPrescricao.jsx` reescrito com `clinical-card`/`form-section-box`, ícones Phosphor, campo SN virou checkbox real. Fora do escopo: calculadora de dose pediátrica EV/IM do mockup — funcionalidade de cálculo nova, não existe hoje, pertence à Fase 2. |
| 05 — Receituário/Sumário de Alta | ✅ Concluído (commit `be99b7a`) | Ambos reescritos com o framework compartilhado, ícones Phosphor. Fora do escopo: unificação em sub-abas com classificação automática de medicamento controlado (Portaria 344/98) e Atestado Médico — funcionalidade nova, pertence à Fase 2. |
| 07 — Plano Terapêutico | ✅ Concluído (commit `02fa5d3`) | Reescrito com framework compartilhado, protocolos/equipe viraram checkbox real. Fora do escopo: "Kits de auto-preenchimento" (TCE/Sepse/IAM) do mockup — funcionalidade nova, e o kit de exemplo usa texto clínico fabricado como valor automático, o mesmo padrão do bug crítico corrigido antes (commit `a3c5953`). |
| 08 — Admissão de Enfermagem | ✅ Concluído (commit `38a4455`) | Reescrito com o mesmo framework do Prontuário Médico (já disponível, roda dentro do mesmo `.atendimento-medico-container`), ícones Phosphor. Fora do escopo: sub-abas com filtro de seção, expandir/recolher todas, painel lateral com escalas/dispositivos/alergias de outras abas — interação nova, não só visual. |
| 15 — Solicitação de Hemoterapia | ✅ Concluído (commit `e64bb67`) | Reescrito com framework compartilhado; hemocomponentes em tabela real, urgência virou radio, Sim/Não viraram `<select>` (mesma escolha do mockup). Fora do escopo: sidebar com hemograma "puxado" de outra fonte e botões de protocolo transfusional — cruzamento de dados não mapeado hoje, e os textos de indicação clínica dos protocolos são fabricados (mesmo padrão do bug crítico já corrigido). |
| 12 — Passagem de Plantão coletiva | ✅ Primeiro incremento (commit `e67bc7e`) | Usuário escolheu explicitamente construir a grade coletiva nova (não só reskin do formulário existente). Novo componente `PassagemColetiva.jsx` (presentacional, reusa dados já carregados por `usePainelState`, sem duplicar busca), 3º modo de visualização no Painel. Inclui: pills de setor, chips de filtro (todos/pendências/a conferir/conferidos), cards com dados reais reaproveitando `IndicadoresClinicos`, toggle "Conferido" (carimbo de revisão reversível, novas colunas `conferido_por`/`conferido_em` em `passagens`, migração aditiva já aplicada em produção) e botão "Detalhes" que abre o `PassagemForm.jsx`/`EspacoPaciente` existente sem nenhuma alteração. **Nenhum dado de produção foi alterado ou apagado** — só colunas novas, nullable. Fora deste incremento (fica para revisão): chips de pendência rápida, botão "sincronizar sinais vitais", modo tabela/foco, painel lateral com histórico de plantões. |
| 09 a 16 (demais módulos de funcionalidade nova, Fase 2) | ❌ Não iniciado | — |

## 📋 Registro consolidado — funcionalidades deixadas de fora do redesenho (revisar p/ priorizar na Fase 2)

Cada item abaixo é algo que o mockup mostra mas que **não foi implementado** durante o
reskin visual, porque é funcionalidade nova (não redesenho) ou porque reproduz dado clínico
fabricado. Nada disso está em produção ainda — a lista existe pra você decidir o que
priorizar e mandar pra produção primeiro.

| # | Módulo | O que é | Por que ficou de fora | Risco de reintroduzir o padrão do bug do dado falso? |
|---|---|---|---|---|
| 1 | Evolução Médica Diária | Grade de sinais vitais com botão "Puxar da Enfermagem" | Não existe no modelo de dados hoje — precisa decidir de onde puxar (Sinais Vitais da enfermagem?) e criar a integração | Não |
| 2 | Prescrição Médica | Calculadora de dose pediátrica EV/IM (diluição, mg/kg, volume a aspirar) | Funcionalidade de cálculo nova, sem lugar no banco pra guardar o resultado ainda | Não |
| 3 | Receituário/Sumário de Alta | Unificação em sub-abas (Receita Simples / Controle Especial / Atestado / Sumário) com classificação automática de medicamento controlado (Portaria 344/98) e redirecionamento com toast | Precisa de uma base de classificação de medicamentos (lista C1/comum/ATB) que não existe hoje; Atestado Médico não existe como documento | Não |
| 4 | Plano Terapêutico | "Kits de auto-preenchimento" (TCE, Sepse, IAM) que preenchem diagnóstico/metas/conduta automaticamente | Funcionalidade nova | **Sim** — o kit de exemplo do mockup usa texto clínico completo fabricado como valor de preenchimento automático |
| 5 | Admissão de Enfermagem | Sub-abas com filtro de seção ("1. Procedência", "2. Antecedentes"...), botão expandir/recolher todas as seções, painel lateral fixo com escalas de risco e dispositivos puxados de outras abas | Interação nova (não é só CSS) — precisa decidir a UX de navegação por sub-seção e a integração cruzada com Escalas/Dispositivos | Não |
| 6 | Solicitação de Hemoterapia | Painel lateral com hemograma "puxado" de exames + botões de protocolo transfusional (anemia grave/choque/plaquetopenia) | Cruzamento de dados com Exames não mapeado hoje | **Sim** — os protocolos de exemplo usam indicação clínica fabricada |
| 7 | Recepção (transversal) | Redesenho do próprio padrão `.form-field`/`.form-grid` usado em quase todo formulário do sistema | Não é específico da Recepção — é um redesenho maior, cross-cutting, que afeta todos os módulos ainda não redesenhados. Já registrado como marco separado acima. | Não |

**Sugestão de prioridade, se ajudar a decidir:** itens 1, 2 e 6 (sinais vitais, calculadora,
hemograma) dependem de decisões de onde buscar o dado — vale conversar antes de construir.
O item 7 (padrão de campo) é o que mais "efeito cascata" tem — beneficia todos os módulos
restantes de uma vez. Os itens 3, 4 e 5 são os mais trabalhosos (nova base de dados ou nova
UX de navegação).

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

## 🚩 Marco: redesenho transversal do padrão `.form-field`/`.form-grid`

Registrado em 24/09 (noite), a pedido explícito do usuário, pra não se perder: o padrão
antigo de campo de formulário (`.form-field`, `.form-grid`, `.toggle-group`, `.chip-group`
— classes globais de `PassagemForm.css`) é usado por **praticamente todo módulo ainda não
redesenhado** (Recepção, Prescrição, Plano Terapêutico, Sumário de Alta, etc.), não é
específico de nenhum um deles. Cada módulo da Fase 1 vem recebendo só o reskin da própria
casca (busca, abas, cards) e deixando esse padrão de campo intacto, deliberadamente, pra
não misturar um redesenho pontual com um redesenho transversal maior.

**Isso não pode ser esquecido no final da Fase 1**: em algum momento (sugestão: depois que
todos os 16 módulos tiverem passado pelo reskin de casca) vale uma rodada dedicada só pra
redesenhar esse padrão de campo de formulário — uma vez, no lugar compartilhado
(`PassagemForm.css`), beneficiando todos os módulos de uma vez, em vez de reinventar campo
por campo em cada um.

## Pendências antigas (ainda não feitas, não esquecer)

- `proposta-design-system-vitaloop.html` duplicado (raiz do projeto + dentro de
  `mockups-fase2/`) — consolidar.
- Revisão do `somenteSe` em `historicoEnfermagemConfig.js`.
- Verificação visual da tela de Abertura de Plantão.
- **CORS do Supabase bloqueando `localhost`** (achado 24/09, noite): o projeto Supabase só
  libera `https://viltaloop.com.br` como origem — qualquer teste em `localhost:5188` (ou
  outra porta local) falha com erro de CORS ao buscar dados. Não é algo desta sessão nem
  relacionado ao redesign; provavelmente um endurecimento de segurança feito em outro
  momento. Sem isso corrigido (adicionar `http://localhost:*` nas origens permitidas do
  projeto Supabase), verificação visual via browser local fica impossível — só dá pra
  confiar em build/lint/testes automatizados, ou testar direto no domínio de produção.

## Nota sobre branch

Este documento e os commits mais recentes estão em `main`, não em `pep/fase-0-fundacao`
(onde a sessão anterior trabalhou). Confirmar com o usuário se `main` é agora a linha de
trabalho ativa antes de abrir PR ou mesclar qualquer coisa.
