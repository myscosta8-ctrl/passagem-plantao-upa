# Divisão Passagem de Plantão × Prontuário — proposta

## O problema

A Passagem de Plantão (`PassagemForm.jsx`) nasceu antes do Prontuário estruturado
(`FichaMedica.jsx`) existir, e por isso tem campos rápidos de Exames, Sorologia,
Hemoterapia e Regulação embutidos nela mesma (texto livre, um item por vez).
Hoje esses 4 assuntos **também** têm abas/tabelas próprias, estruturadas e
multi-item, dentro do Prontuário Médico (`atendimento_id` real, Seção 0). Isso
significa que a mesma informação pode ser digitada em dois lugares diferentes,
sem nenhuma ligação entre eles — risco real de divergência (ex: um médico marca
"exame resultado disponível" no Prontuário, mas o campo da Passagem continua
dizendo "aguardando laudo").

A proposta: **o Prontuário estruturado vira a fonte da verdade** pra esses 4
assuntos, e a Passagem de Plantão para de duplicar esses campos — mas só depois
de confirmar, campo a campo, que o Prontuário já cobre tudo que a Passagem
cobria. Levantamento feito direto no código e no schema do banco (não estimado):

## Tabela de decisão, seção por seção

### 1. Sorologia — ✅ paridade completa, pronto pra migrar

| Passagem (`PASSAGEM_VAZIA`) | Prontuário (`sorologias_notificaveis`) |
|---|---|
| `sorologias` (nome do agravo) | `agravo` |
| `sorologia_status` (Coleta pendente / Aguardando resultado / Resultado disponível) | `status` |
| `sorologia_data_coleta` | `data_coleta` |
| `sorologia_data_notificacao` | `data_notificacao` |

**Veredito:** os 4 campos batem 1:1. Não há gap de dado. O que falta confirmar
é só a UI (`SecaoSorologias` dentro da aba Exames) — se ela já permite o ciclo
completo (criar → marcar coletado → marcar notificado) sem precisar reabrir
formulário externo.

### 2. Hemoterapia — ⚠️ gap real: datas não editáveis

| Passagem | Prontuário (`solicitacoes_hemoterapia`) |
|---|---|
| `hemo_tipo` | `tipo` |
| `hemo_quantidade` | `quantidade` |
| `hemo_data_solicitacao` (editável, pode ser retroativa) | `solicitado_em` — **sempre `now()`, gravado automaticamente em `criarHemoterapia`, sem campo pra editar** |
| `hemo_data_transfusao` (editável) | `transfundido_em` — **sempre `now()`, gravado automaticamente em `marcarTransfundido`, sem campo pra editar** |

**Veredito:** faltam os campos de data ajustável. Na prática da UPA, é comum
registrar a solicitação/transfusão depois do fato (documentação retroativa) —
o Prontuário hoje não permite isso, só a Passagem permitia. **Isso precisa ser
construído antes de tirar o campo da Passagem**, senão perde uma capacidade real.

### 3. Exames — ⚠️ gap real: falta o campo "local"

| Passagem | Prontuário (`exames_solicitados`) |
|---|---|
| `exame_nome` | `nome` |
| `exame_status` | `status` |
| `exame_a_realizar_data` + `exame_a_realizar_hora` | `agendado_para` (timestamp único — cobre os dois) |
| `exame_a_realizar_local` | **não existe nenhuma coluna equivalente** |
| `preparo_exame` | `preparo` |
| `exame_resultado` | `resultado` |

**Veredito:** falta só o "local" (ex: HRPM, laboratório externo) — visto em uso
real nos cards de leito do painel ("Realizou Tc de Crânio 17/09 HRPM"). Precisa
de uma migration aditiva (`exames_solicitados.local text`) antes de considerar
essa seção equivalente.

### 4. Regulação — ⚠️ não são a mesma coisa, precisa reconciliar antes

| Passagem (`regulacao_flag/tipo/data_cadastro`) | Prontuário (`regulacao_atualizacoes`) |
|---|---|
| `regulacao_flag` (paciente está em regulação?) | não tem — a tabela assume que já está, só registra atualizações |
| `regulacao_tipo` (SER ou SISREG) | só tem `numero_solicitacao_ser` — **não existe campo genérico "tipo" nem número pro SISREG** |
| `regulacao_data_cadastro` (quando entrou em regulação) | não tem — só `atualizado_em` (timestamp de cada atualização, não da abertura) |
| — | `evolucao`, `sinais_vitais`, `pendencias`, `conduta`, `mudanca_diagnostico`, `novo_diagnostico_cid` — tudo isso é **mais rico** que a Passagem, mas é sobre acompanhamento, não sobre abertura |

**Veredito:** são conceitos diferentes — a Passagem sinaliza "abriu regulação
pra esse paciente" (flag único), o Prontuário registra "atualizações periódicas
de quem já está regulado" (log). Não dá pra simplesmente apagar os 3 campos da
Passagem achando que o Prontuário já cobre — precisa decidir onde a abertura
(flag + tipo + data) passa a viver: como a primeira linha de
`regulacao_atualizacoes`, ou como campo novo em `atendimentos`/`internacoes`.

## Fora do escopo desta migração

`leito_liberado_outro_hospital` / `alta_sala_vermelha` (campos da Passagem)
não têm nenhum equivalente no Prontuário hoje — ficam como estão, não fazem
parte desta divisão.
