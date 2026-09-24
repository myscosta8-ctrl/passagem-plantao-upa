# Plano de Ação — Fase 2 (Redesign + módulos de enfermagem)

Baseado na avaliação das pastas `mockups-fase2/` (redesign visual, 16 telas + 3 propostas de
shell) e `modelos_impressao_html/` (21 modelos de impressão A4). Este documento é o plano
de execução; a auditoria no final mostra o que já existe no repo hoje vs. o que falta.

## Como ler este plano

Cada fase é um pacote fechado — só avança pra próxima com confirmação explícita do usuário
(mesmo ritmo "um documento/módulo de cada vez" usado a sessão inteira). Dentro de cada fase,
os itens estão ordenados por dependência: o que outros itens precisam vem primeiro.

---

## Fase 0 — Fundação do design system (bloqueia tudo o resto)

Sem isso, cada módulo redesenhado ficaria visualmente desconectado do resto do app (uma
tela nova ao lado de telas antigas, sem coerência).

1. Extrair os tokens de `proposta-design-system-vitaloop.html` (`mockups-fase2/`) para um
   arquivo CSS real do projeto (`src/design-tokens.css` ou similar): paleta, sombras,
   tipografia (Inter substituindo IBM Plex, ou convivendo — decisão a confirmar com o
   usuário, já que IBM Plex Mono é a identidade "burocrática" atual e pode ser proposital).
2. Adicionar Phosphor Icons ao projeto (pacote local, não CDN em produção).
3. Rebuild do `Sidebar.jsx`/`Sidebar.css` conforme `proposta-menu-hamburguer.html`.
4. Rebuild do `EspacoPaciente.jsx` (os "3 pilares") conforme
   `proposta-espaco-paciente-3-pilares.html` — **checar primeiro se isso já não é o que
   existe hoje**, a proposta é antiga e pode já estar implementada (ver auditoria).
5. Componente de app-shell (topbar + breadcrumb) usado em `08-admissao-enfermagem-design.html`
   e replicado nos outros — extrair pra componente React reutilizável antes de aplicar em
   cada tela, não duplicar CSS 16 vezes.

**Critério de saída da Fase 0:** abrir o app e ver a sidebar/topbar novos funcionando, sem
nenhuma tela de conteúdo ainda alterada.

---

## Fase 1 — Redesenho puro (funcionalidade já existe, é só trocar a casca)

Cada item = 1 sessão, testado no browser antes do próximo. Nenhum precisa de migração de
banco.

| Ordem | Módulo | Mockup | Tela atual |
|---|---|---|---|
| 1.1 | Painel de Leitos | `01-painel-leitos-design.html` | `Painel.jsx` |
| 1.2 | Recepção | `02-recepcao-design.html` | `CadastroPacientes.jsx` |
| 1.3 | Prontuário Médico / Evolução | `03-prontuario-medico-design.html` | `FichaMedica.jsx` (aba Evolução) |
| 1.4 | Prescrição Médica | `04-prescricao-medica-design.html` | `FichaMedica.jsx` (aba Prescrição) |
| 1.5 | Receituário / Sumário de Alta | `05-receituario-alta-design.html` | `FichaMedica.jsx` (abas Receituário/Alta) |
| 1.6 | Anamnese/Admissão + AIH | `06-anamnese-admissao-design.html` | `FichaMedica.jsx` (abas Consulta/AIH) |
| 1.7 | Plano Terapêutico | `07-plano-terapeutico-design.html` | `FichaMedica.jsx` (aba Plano) |
| 1.8 | Admissão de Enfermagem | `08-admissao-enfermagem-design.html` | `AbaHistoricoEnfermagem.jsx` (acabou de ser construída — **redesenho vai por cima do que já existe, não recomeçar do zero**) |
| 1.9 | Passagem de Plantão coletiva | `12-passagem-plantao-design.html` | `PassagemForm.jsx` / `CompartilharPlantao.jsx` |
| 1.10 | Solicitação de Hemoterapia | `15-solicitacao-hemoterapia-design.html` | `FichaMedica.jsx` (aba Sangue) |

**Critério de saída da Fase 1:** todas as telas com funcionalidade já existente redesenhadas
e testadas ponta a ponta (preencher → salvar → imprimir).

---

## Fase 2 — Funcionalidade nova + redesenho (precisa de migração de banco)

Estes módulos não existem hoje no sistema (dado confirmado na auditoria abaixo). Cada um
precisa: (a) migração de banco confirmada com o usuário antes de aplicar, (b) funções em
`pepClinico.js`/`pepMedico.js`, (c) tela nova, (d) impressão.

| Ordem | Módulo | Mockup | O que falta construir |
|---|---|---|---|
| 2.1 | Evolução de Enfermagem (SAE) | `09-evolucao-enfermagem-sae-design.html` | Catálogo NANDA-I/NIC (dados estáticos), tela com EVA de dor, timeline. Tabela `evolucoes_enfermagem` já existe no banco (0 linhas) mas **não tem função nenhuma em `pepClinico.js`** — provavelmente criada em outra sessão e nunca ligada. |
| 2.2 | Cardex / Aprazamento | `10-checagem-aprazamento-design.html` | Não existe nada — nem tabela, nem tela. Precisa desenhar o modelo de dados (grade horária de administração ligada a `prescricao_itens`). |
| 2.3 | Balanço Hídrico (versão rica) | `11-balanco-hidrico-design.html` | Hoje é só uma lista simples (`balanco_hidrico`, tipo/via/volume). O mockup pede parciais por turno e saldo em tempo real — dá pra fazer só com cálculo no front, sem mudar schema, **ou** migrar pra `balanco_hidrico_periodos`/`balanco_hidrico_registros`, que já existem no banco (0 linhas, não usadas) — parecem ter sido criadas pra isso e abandonadas. Avaliar antes de decidir. |
| 2.4 | Nota de Intercorrência de Enfermagem | `13-nota-intercorrencia-enfermagem-design.html` | Só existe a versão médica (`notas_intercorrencia_medica`). Precisa tabela nova + tela + impressão. |
| 2.5 | Transferência Estruturada (SBAR) | `14-transferencia-paciente-design.html` | Já existe uma versão simples (`transferencias_sbar` + `AbaSbar`). O mockup é mais rico (4 pilares S/B/A/R explícitos) — avaliar se é evolução da mesma tabela ou redesenho de UI só. |
| 2.6 | Exames Internos + Laudo APAC | `16-solicitacao-exames-apac-design.html` | Hoje `AbaExames` é uma lista genérica. O mockup separa Laboratório/Radiologia/ECG em abas com formulário próprio por modalidade. `exames_solicitados` já existe no banco. |

**Critério de saída da Fase 2:** cada migração aplicada só com "sim, pode aplicar" do
usuário (regra de todo o projeto), e cada módulo testado fim a fim antes do próximo.

---

## Fase 3 — Modelos de impressão (`modelos_impressao_html/`)

Os modelos de impressão são **independentes** do redesenho de tela — podem ser feitos em
paralelo ou depois, na ordem que fizer sentido pro módulo que estiver ativo. Regra: sempre
que uma tela ganhar impressão nova, ela substitui a impressão "fiel ao modelo oficial" já
existente (quando houver) — nunca duas versões concorrentes.

**Já têm impressão real implementada hoje** (conferir se o modelo novo é upgrade ou só
redecoração — comparar antes de substituir):
`06-prescricao-medica`, `07-evolucao-medica-diaria`, `08-sumario-de-alta`,
`09-nota-intercorrencia-medica`, `10-consulta-admissao-medica`,
`11-formulario-antimicrobiano-atm`, `12-plano-terapeutico`,
`13-tratamento-fora-domicilio-tfd`, `14-receituario-medico-2vias`,
`16-laudo-aih-internacao`, `17-solicitacao-hemoterapicos`,
`18-laudo-apac-procedimento-ambulatorial`, `01-admissao-enfermagem` (acabou de ser feita).

**Não têm impressão hoje** (dependem da Fase 2 estar pronta antes, exceto a 15 que pode vir
antes):
`02-evolucao-enfermagem-sae`, `03-transferencia-paciente-sbar` (upgrade da atual),
`04-nota-intercorrencia-enfermagem`, `05-balanco-hidrico-24h`,
`15-passagem-plantao-coletiva`, `19-solicitacao-exames-laboratoriais`,
`20-solicitacao-exames-imagem-rx`, `21-solicitacao-eletrocardiograma-ecg`.

---

## Auditoria do repo em produção — o que já está implementado

### Telas (pilares e abas)

| Pilar | Onde vive | Abas hoje |
|---|---|---|
| Passagem de Plantão | `PassagemForm.jsx` | modelo antigo, intacto (não mexer sem pedido explícito) |
| Prontuário de Enfermagem | `FichaClinica.jsx` | Admissão, **Admissão de Enfermagem** (novo, sessão anterior), Sinais Vitais, Evolução, Dispositivos, Balanço Hídrico, Escalas, Alergias, Isolamento, Transferência SBAR, Eventos Adversos |
| Prontuário Médico | `FichaMedica.jsx` | Consulta, Prescrição, AIH, Exames, Plano Terapêutico, Evolução Médica Diária, Nota de Intercorrência Médica, Receituário Médico, APAC, ATM, TFD, Regulação, Solicitação de Sangue, Medicações Contínuas, Sumário de Alta, Auditoria |

A estrutura "3 pilares" da `proposta-espaco-paciente-3-pilares.html` **já está implementada**
em `EspacoPaciente.jsx` — essa proposta específica não é mais pendência de implementação,
só de eventual redesenho visual (Fase 0/1).

### Tabelas no banco (Supabase, projeto `fhsyrcksxcdhdbcvjspv`)

**Usadas e com função correspondente em `pepClinico.js`/`pepMedico.js`** (implementado):
`enfermeiros`, `setores`, `leitos`, `pacientes`, `pessoas`, `atendimentos`, `internacoes`,
`leito_ocupacoes`, `realocacoes`, `plantoes`, `passagens`, `alergias`,
`dispositivos_invasivos`, `balanco_hidrico`, `escalas_enfermagem`, `isolamentos`,
`transferencias_sbar`, `eventos_adversos`, `sinais_vitais`, `evolucoes`,
`admissoes_enfermagem` (legado, tabela separada — não confundir com `historico_enfermagem`),
`historico_enfermagem` (novo, sessão anterior), `consultas_medicas`, `prescricoes_medicas`,
`prescricao_itens`, `aih_solicitacoes`, `planos_terapeuticos`, `evolucoes_medicas`,
`notas_intercorrencia_medica`, `receitas_medicas`, `sumarios_alta`, `apac_solicitacoes`,
`solicitacoes_atm`, `tfd_solicitacoes`, `regulacao_atualizacoes`, `solicitacoes_sangue`,
`medicacoes_continuas`, `exames_solicitados`, `catalogo_medicamentos`, `cid_catalog`,
`configuracoes`.

**Existem no banco mas SEM função de acesso — órfãs, candidatas a reaproveitar na Fase 2**
(0 linhas cada, nenhuma referência em `pepClinico.js`/`pepMedico.js`):
- `evolucoes_enfermagem` — provavelmente reservada pra Evolução SAE (item 2.1).
- `balanco_hidrico_periodos` e `balanco_hidrico_registros` — provavelmente reservadas pra
  Balanço Hídrico por turno (item 2.3).

**Não existem no banco** (precisam de migração nova quando a Fase 2 chegar nelas):
Cardex/Aprazamento (checagem de administração), Nota de Intercorrência de Enfermagem,
qualquer estrutura de NANDA-I/NIC (viraria dado estático no front, não tabela).

### Modelos de impressão

13 dos 21 modelos em `modelos_impressao_html/` já correspondem a documentos com impressão
real e testada no sistema (ver lista completa na Fase 3). Os 8 restantes são documentos que
ainda não têm nenhuma versão de impressão hoje.

### Design system / shell

Hoje: tipografia IBM Plex Mono/Sans, paleta clara com `--c-primary` azul-petróleo, sidebar
escura com identidade própria (`Sidebar.css`) — **diferente** da proposta Inter + Phosphor +
navy `#0B192C` do design system novo. Nenhuma peça da Fase 0 está implementada ainda.

---

## Pendências fora deste plano (não esquecer)

- `proposta-design-system-vitaloop.html` está duplicado: existe uma cópia solta na raiz do
  projeto (`proposta-design-system-vitaloop.html`, não commitada, mencionada no handoff
  anterior) e outra dentro de `mockups-fase2/`. Consolidar em um só lugar antes da Fase 0.
- Revisão do `somenteSe` em `historicoEnfermagemConfig.js` (pendência do handoff anterior,
  ainda não feita).
- Verificação visual da tela de Abertura de Plantão (pendência do handoff anterior).
