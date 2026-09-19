# Especificação de Evolução — Passagem de Plantão → PEP com Contexto Clínico

Este documento consolida tudo que foi definido e aprovado, pra servir de guia único de implementação. Nenhuma alteração de arquitetura aqui contradiz o que já existe — é evolução em cima da base real do projeto, confirmada linha por linha no código e no banco antes de escrever isto.

---

## 0. CORREÇÃO CRÍTICA — fazer antes de qualquer coisa visual

**O problema:** hoje, o botão "📋 Ficha clínica" dentro de `PassagemForm.jsx` abre a tela `FichaClinica`, mas passa um objeto falso:

```js
atendimento={{ atendimento_id: paciente.id, pessoa_id: paciente.pessoa_id, nome: paciente.nome }}
```

Isso está quebrado de duas formas:
- `paciente.pessoa_id` **não existe** — a tabela `pacientes` não tem essa coluna. Sempre chega `undefined`.
- `atendimento_id: paciente.id` está usando o ID da tabela antiga (`pacientes`) como se fosse ID da tabela nova (`atendimentos`) — são UUIDs de tabelas diferentes, nunca coincidem de verdade.

Ou seja: **hoje, tecnicamente, o que é digitado na Ficha Clínica através desse botão não é salvo em lugar nenhum de forma confiável.**

**A arquitetura certa já existe, só não está sendo usada:**
- `pessoas` já tem a coluna `migrado_de_paciente_id`
- `atendimentos` já tem a coluna `migrado_de_paciente_id` e `pessoa_id`

**O que precisa ser implementado:**

Criar uma função (`obterOuCriarAtendimentoParaPaciente(pacienteId)`) que:
1. Verifica se já existe um `atendimentos` com `migrado_de_paciente_id = pacienteId`. Se existir, reaproveita.
2. Se não existir:
   a. Verifica se já existe uma `pessoas` com `migrado_de_paciente_id = pacienteId`. Se existir, reaproveita essa `pessoa_id`.
   b. Se não existir, cria uma `pessoas` nova, com `nome` (e `data_nascimento` se já tiver sido capturada — ver seção 3), e `migrado_de_paciente_id = pacienteId`.
   c. Cria um `atendimentos` novo, vinculando `pessoa_id` da pessoa (criada ou reaproveitada), `migrado_de_paciente_id = pacienteId`, `setor_id` do leito atual do paciente, `status = 'em_atendimento'`.
3. Retorna o `atendimento_id` real.

O botão "Ficha clínica" (e futuramente todo o pilar de Prontuário) passa a chamar essa função **antes** de abrir `FichaClinica`/`FichaMedica`, em vez de montar o objeto na mão.

**Isso é pré-requisito de tudo abaixo.** Sem isso, qualquer reorganização visual continua guardando dado clínico em lugar nenhum.

---

## 1. Reorganização: Espaço do Paciente em 3 pilares

Ao clicar num leito ocupado (em vez de abrir direto `PassagemForm`), abrir um espaço do paciente com 3 áreas do mesmo nível:

1. **📋 Passagem de Plantão** — o que hoje é `PassagemForm.jsx`, sem alteração de comportamento, só de onde é acessado
2. **🩺 Prontuário de Enfermagem** — o que hoje é `FichaClinica.jsx` (10 abas reais: Admissão, Sinais Vitais, Evolução, Dispositivos, Balanço Hídrico, Escalas, Alergias, Isolamento, Transferência SBAR, Eventos Adversos), agora recebendo o `atendimento_id` real (via a função da seção 0)
3. **⚕️ Prontuário Médico** — o que hoje é `FichaMedica.jsx` (11 abas reais: Consulta, Prescrição, AIH, Exames, Plano Terapêutico, APAC, ATM, TFD, Regulação, Medicações Contínuas, Auditoria), mesma correção de `atendimento_id`

Dentro da aba "Admissão" do Prontuário de Enfermagem, os 26 grupos do exame físico (`GRUPOS_EXAME`) devem virar **seções colapsáveis** (uma aberta por vez, com indicador visual de preenchida/vazia), em vez de tudo achatado numa rolagem só. Usar como referência o protótipo `proposta-ficha-clinica-reorganizada.html`, já com as cores reais do projeto (`--c-primary: #14507D` etc, de `src/index.css`).

---

## 2. Menu lateral hambúrguer

Substituir o menu atual (lista de botões) por uma barra lateral escura, recolhível (ícone ☰, vira só ícones quando fechada), organizada em grupos:

- **Assistencial:** Painel de Leitos, Recepção *(novo, ver seção 4)*, Histórico, Desfechos, Pendências
- **Indicadores:** Indicadores Clínicos *(novo, ver seção 5)*
- **Equipe:** Compartilhar Plantão, Painel de Equipe, Gerenciar Profissionais
- **Conta:** Minha Conta, Ajuda

Nenhum item existente muda de função — só de onde vive na navegação. Usar como referência `proposta-menu-hamburguer.html`.

---

## 3. Cadastro rápido do enfermeiro (`ModalInternar`, em `Painel.jsx`) — 2 campos novos obrigatórios

Hoje pede: Nome completo, Diagnóstico, Data de admissão. **Adicionar, como obrigatórios:**

1. **Data de nascimento** — grava tanto em `pacientes` (adicionar coluna `data_nascimento date`) quanto, se/quando o atendimento real for criado (seção 0), propaga pra `pessoas.data_nascimento`
2. **Cor da classificação de Manchester** — chip selecionável (Vermelho / Laranja / Amarelo / Verde / Azul). Adicionar coluna `classificacao_manchester text` em `pacientes` (com `check` nas 5 cores), e propagar pra `atendimentos.classificacao_risco_cor` (que já existe) quando o atendimento for criado.

---

## 4. Recepção — nova tela

Hoje só existe a camada de dados (`pepRecepcao.js`, com `pessoas`/`atendimentos`/`pessoas_duplicatas`), sem tela dedicada — o que existe (`CadastroPacientes.jsx`) precisa ser **reposicionado como a tela oficial da Recepção** no menu novo, não mais escondido atrás de "se não for médico, mostra isso" em `Home.jsx`.

Fluxo obrigatório, reforçando o que já existe em `pepRecepcao.js` (`buscarPessoas`, `detectarDuplicatas`): **toda abertura de cadastro deve buscar por nome/data de nascimento primeiro**, oferecendo vincular a um `pessoas` já existente (inclusive um criado via seção 0, a partir do cadastro rápido do enfermeiro) antes de permitir criar um novo.

---

## 5. Indicadores Clínicos — nova tela

Painel com os seguintes indicadores, calculados a partir de `pacientes` (dado atual) e, quando disponível, `atendimentos`:

1. **Pacientes em observação agora** — `count(*) where status='internado' and status_internacao='Em observação'`
2. **Quantos internaram** (dos que passaram por observação) — contagem de pacientes cujo `status_internacao` mudou de `'Em observação'` para `'Internado'` no período filtrado
3. **Internação por diagnóstico** — agrupamento por `diagnostico` (texto livre; agrupar por correspondência exata é aceitável nesta fase, sem normalização de CID)
4. **Tempo médio de internação** — `data_desfecho - data_admissao`, só para `tipo_desfecho` que representam alta após internação
5. **Tempo médio em observação até conduta médica** — tempo entre `data_admissao` e o momento em que uma conduta definitiva foi registrada. **Requer campo novo**: adicionar `data_conduta_definida timestamptz` em `pacientes`, preenchido automaticamente no momento em que `status_internacao` sai de `'Em observação'` (seja virando Internado, seja indo direto pra um desfecho: Alta, Evasão, Óbito)
6. **Leitos ocupados por cor de classificação de Manchester** — `count(*) group by classificacao_manchester where status='internado'` (usa o campo novo da seção 3)

Filtro de período (hoje / últimos 7 dias / últimos 30 dias) no topo da tela.

---

## Ordem de implementação recomendada

1. Seção 0 (correção da ponte de dados) — sem isso, nada do resto tem efeito real
2. Seção 3 (2 campos novos no cadastro rápido) — desbloqueia dado pra seção 5 funcionar desde já
3. Seção 5 (Indicadores Clínicos) — já útil com o dado que passa a existir
4. Seção 1 (3 pilares) e Seção 2 (menu hambúrguer) — podem andar juntas, são só reorganização de navegação
5. Seção 4 (Recepção reposicionada) — por último, já que depende da seção 0 estar sólida

---

## O que NÃO deve mudar

- Nenhum campo, tela ou comportamento da Passagem de Plantão (`PassagemForm.jsx`) muda de função
- Nenhuma das 21 abas já existentes em `FichaClinica`/`FichaMedica` muda de conteúdo — só de onde é acessada e recebe `atendimento_id` correto
- Nenhuma tabela existente é apagada; toda mudança de schema é aditiva (`ALTER TABLE ADD COLUMN`)
- `pg_cron`, RLS existente, triggers de auditoria — intactos
