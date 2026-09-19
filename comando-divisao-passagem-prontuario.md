# Comando — Divisão Passagem × Prontuário

Leia `divisao-passagem-prontuario.md` inteiro antes de tocar em qualquer
código. Ele já tem o levantamento campo a campo, feito direto no código e no
schema do banco — não refaça esse levantamento, use como está.

**Execute as 4 etapas abaixo, uma de cada vez, nessa ordem exata.** Depois de
cada etapa, rode `npm run build`, teste ao vivo no navegador, mostre o
resultado e espere confirmação antes de seguir pra próxima. Não implemente
tudo de uma vez.

Qualquer coluna nova no banco deve ser migration aditiva (`ALTER TABLE ADD
COLUMN`, nunca apagar/alterar coluna existente) — mostre o SQL antes de
aplicar. Se encontrar qualquer ambiguidade não coberta aqui ou no documento de
divisão, pare e pergunte antes de decidir sozinho.

---

## Etapa 1 — Sorologia completa

Campos já batem 1:1 entre Passagem e Prontuário (ver tabela). Não precisa de
migration. O trabalho aqui é só de UI: confirme que `SecaoSorologias` (dentro
da aba Exames do Prontuário Médico) permite o ciclo completo sem sair da tela:

1. Criar sorologia (agravo + data de coleta)
2. Marcar como "Aguardando resultado"
3. Marcar como "Resultado disponível" + registrar data de notificação

Se algum desses passos não existir na UI hoje, complete. Não mude o schema.

## Etapa 2 — Hemoterapia completa

Gap real: `solicitado_em` e `transfundido_em` são gravados automaticamente
como `now()` e não são editáveis. Adicione a capacidade de informar/editar
essas datas manualmente (retroativo), tanto na criação quanto depois — igual
a Passagem já permitia com `hemo_data_solicitacao`/`hemo_data_transfusao`.
Não precisa de migration (as colunas já existem como `timestamptz`, só não
são expostas como editáveis na função/UI).

## Etapa 3 — Confirmar equivalência de Exames e Regulação

**Exames:** falta o campo "local" (onde o exame foi/será realizado — ex:
HRPM, laboratório externo). Proponha e mostre a migration:
`ALTER TABLE exames_solicitados ADD COLUMN local text;` — depois de aprovada,
adicione o campo na função `criarExame`/`atualizarExame` e na UI.

**Regulação:** não são a mesma coisa (ver documento de divisão — Passagem tem
um flag de abertura, Prontuário só loga atualizações de quem já está
regulado). Decida e proponha explicitamente antes de mexer: onde a abertura
(flag + tipo SER/SISREG + data de cadastro) passa a morar — como a primeira
linha de `regulacao_atualizacoes` (precisaria de coluna `tipo` nova) ou como
campo separado em `atendimentos`/`internacoes`. Apresente a opção
recomendada e o porquê antes de implementar.

## Etapa 4 — Só agora, simplificar a Passagem de Plantão

Só depois das etapas 1-3 confirmadas e testadas: remover de
`PassagemForm.jsx` os campos que passaram a ser 100% cobertos pelo
Prontuário (Sorologia, Hemoterapia, Exames, e a parte de Regulação que for
decidida na etapa 3). `leito_liberado_outro_hospital` e `alta_sala_vermelha`
ficam — não têm equivalente, estão fora do escopo.

Ao simplificar, a Passagem passa a **mostrar um resumo somente-leitura**
puxado do Prontuário (não um formulário duplicado) pra quem só quer ver o
status rápido sem entrar no Prontuário inteiro — não apague a visibilidade,
só a duplicação de digitação.
