# Os dois contextos do Passagem de Plantão / PEP

Este documento define, de forma definitiva, como as informações se dividem entre **Recepção** e **Equipe Assistencial** dentro do mesmo programa — e como elas se conectam sem gerar retrabalho.

---

## O princípio central: um paciente, um registro, preenchido aos poucos

**Não existem dois cadastros do mesmo paciente.** Existe **um único registro** (a mesma linha na tabela `pacientes`, que já existe hoje), que pode ser **iniciado por qualquer um dos dois contextos** e **completado pelo outro depois** — nunca duplicado.

Isso já tem uma base pronta no sistema: a tela `CadastroPacientes.jsx` já existe, com exatamente os campos completos que a Recepção precisa. O que faltava era deixar claro *para quem* essa tela é, e garantir que o cadastro rápido do enfermeiro e o cadastro completo da recepção **sempre apontem pro mesmo registro**.

---

## Contexto 1 — Cadastral (Recepção)

**Dono da informação:** recepcionista.

**Campos** (já existem em `CadastroPacientes.jsx`):
Nome completo, Data de nascimento, Sexo, CPF, Cartão Nacional de Saúde, RG, Nº de registro de nascimento, Endereço, Número, Bairro, Cidade, Contato, Mãe, Pai, Responsável (nome, RG, endereço, relação com o paciente).

**Quando acontece:** a qualquer momento — antes, durante ou depois do atendimento clínico começar. Não trava nada.

---

## Contexto 2 — Clínico (Equipe Assistencial)

**Dono da informação:** enfermeiro e médico.

**Campos:** diagnóstico, exames, sorologias, hemoterapia, alergias, evolução, sinais vitais, prescrição, AIH, dispositivos, balanço hídrico, escalas, isolamento, transferência SBAR, eventos adversos — tudo que já organizamos nos 3 pilares (Passagem de Plantão / Prontuário de Enfermagem / Prontuário Médico).

**Quando acontece:** desde a chegada do paciente, sem esperar a Recepção — é isso que sua proposta resolve.

---

## A ponte entre os dois: o cadastro mínimo de urgência

**Sua proposta, formalizada:** pra paciente em Observação que precisa de leito *agora*, o enfermeiro preenche um cadastro **mínimo**, só o suficiente pra identificar a pessoa e abrir o atendimento clínico:

- Nome completo
- Data de nascimento *(hoje esse campo não existe no cadastro rápido do enfermeiro — precisa ser adicionado)*
- Diagnóstico (já existe)
- Setor / leito (já existe)

A Recepção, quando conseguir (durante o mesmo plantão ou depois), **abre esse mesmo registro** — não cria um novo — e completa o resto (CPF, CNS, endereço, mãe, responsável, etc.).

**Isso só funciona sem duplicar se a busca por paciente já existente for o primeiro passo, sempre.** O sistema já tem esse mecanismo ("Buscar paciente", visível no `Painel.jsx`) e você já vinha trabalhando em fusão de cadastros duplicados — essa base já existe, só precisa virar hábito assumido: **ninguém cria cadastro novo sem buscar primeiro.**

---

## Como a informação se espalha sozinha (evitando retrabalho)

Como é **um registro só**, qualquer campo preenchido em qualquer lugar aparece automaticamente em todo o resto — isso não é uma sincronização entre telas diferentes, é literalmente a mesma linha de dado sendo lida em lugares diferentes:

- O nome que o enfermeiro digitou no cadastro rápido aparece no cabeçalho da Passagem de Plantão, do Prontuário de Enfermagem e do Prontuário Médico, sem digitar de novo
- Quando a Recepção completa CPF/CNS/endereço depois, isso aparece automaticamente nos mesmos lugares, sem ninguém precisar "atualizar" nada manualmente
- O diagnóstico que o médico registra no Prontuário Médico aparece no card do leito no Painel, sem duplicar campo

---

## Resumo da divisão de responsabilidade

| Quem | O quê | Quando |
|---|---|---|
| Enfermeiro (urgência) | Nome + data de nascimento + diagnóstico + leito | Na admissão, se precisar de leito imediatamente |
| Recepção | Tudo o resto do cadastro (documentos, endereço, filiação, responsável) | A qualquer momento, no mesmo registro |
| Equipe assistencial | Todo o contexto clínico (diagnóstico detalhado, exames, hemoterapia, evolução, sinais vitais, prescrição...) | Contínuo, durante toda a permanência |

---

## O que ainda precisa ser implementado pra isso funcionar de verdade

1. Adicionar **data de nascimento** ao cadastro rápido do enfermeiro (`ModalInternar`, em `Painel.jsx`) — hoje não existe esse campo ali
2. Deixar claro, na navegação, que `CadastroPacientes.jsx` é **a tela da Recepção** — hoje ela aparece meio escondida atrás da lógica de "se não for médico, mostra isso"
3. Reforçar a busca de paciente existente **antes** de qualquer cadastro novo, nos dois fluxos (rápido do enfermeiro e completo da recepção)
