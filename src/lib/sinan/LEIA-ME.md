# Módulo SINAN — notificação compulsória

Tela: aba "Notificação SINAN" no prontuário (Médico 9, Enfermagem 7) → `src/pages/sinan/AbaNotificacaoSinan.jsx`.

## Como funciona
1. O profissional escolhe o agravo (`agravos.js`). Doenças sem ficha própria saem na Ficha de Notificação Individual.
2. A tela mostra a réplica da ficha (`src/pages/sinan/FichaSinan.jsx`), já preenchida com o que existe no
   cadastro/atendimento (`autoPreencher.js`). Nada clínico é inventado.
3. "Salvar" grava rascunho; "Salvar e Imprimir" registra e abre o PDF oficial preenchido (`imprimirFicha.js`, pdf-lib).
4. Tabela `notificacoes_sinan` (sem DELETE; só invalidação). Fichas sigilosas (violência, HIV/AIDS) mostram o aviso de sigilo, mas são visíveis a todos os profissionais cadastrados (com login).

## Fichas (lote 1) — `modelos/`
Cada arquivo descreve os campos da ficha: número, rótulo, tipo (texto, data, dígitos, código), opções do impresso,
regra de quando o campo se aplica e a posição exata no PDF (pontos, origem no canto inferior esquerdo).
- notificacaoIndividual.js — Notificacao_Individual_v5.pdf
- dengueChikungunya.js — Ficha_DENGCHIK_FINAL.pdf
- malaria.js — Malaria_v5.pdf
- animaisPeconhentos.js — Animais_Peconhentos_v5.pdf
- antirrabico.js — anti_rabico_v5.pdf
- violencia.js — violencia_v5.pdf

## Material herdado do Vitaloop (referência, não usado pela tela)
`fichas.ts`, `schemas/`, `clinical-forms/`, `index.ts`, `rules.ts`, `types.ts`.

## Regras de preenchimento (todas as fichas)

- Todos os campos da ficha ficam abertos para edição na tela; nenhum é escondido por depender de outro.
  `quando` só serve para o código automático do papel (`senao`, ex.: Gestante = 6 - Não se aplica quando o campo fica em branco).
- Obrigatórios, em qualquer ficha, são só: data da notificação, nome, data de nascimento, nome da mãe e endereço
  (UF, município, bairro, logradouro e número) — lista `OBRIGATORIOS` em `modeloUtil.js`. Os modelos não marcam obrigatoriedade: todo o resto (clínica, exames, conclusão) é opcional, porque as análises não são feitas na UPA.
- IBGE, CNES e código do logradouro não aparecem na tela (`ehCodigoOculto`). Breves e a própria UPA recebem o código
  automático no papel; outro município/unidade sai em branco.
- Fichas com duas doenças no campo 2 (Dengue/Chikungunya, Sarampo/Rubéola, Meningites) são um agravo só na lista;
  o campo 2 vem do CID do diagnóstico quando houver.
