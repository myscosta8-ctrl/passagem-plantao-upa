// Conteúdo da Ajuda. `perfis`: quem vê a seção (enfermagem, medico, recepcao, admin).
// Mantenha os textos curtos, no passo a passo que a equipe usa no plantão.
const TODOS = ['enfermagem', 'medico', 'recepcao', 'apoio', 'admin']
const CLINICOS = ['enfermagem', 'medico', 'admin']

export const SECOES_AJUDA = [
  {
    id: 'inicio', titulo: 'Primeiros passos', icone: 'ph-rocket-launch', perfis: TODOS,
    itens: [
      { p: 'Como entro no sistema?', r: 'Digite seu usuário (ex.: enf.maria) e a senha. Tudo em letras minúsculas — no celular, confira se o teclado não colocou a primeira letra maiúscula sozinho.' },
      { p: 'Recebi uma senha provisória. E agora?', r: 'A senha provisória tem o formato "upa" + 6 números (ex.: upa482915). No primeiro acesso o sistema pede para você criar a sua própria senha. Evite senhas óbvias como 123456 — o sistema recusa senhas fracas. Exemplo de senha aceita: breves2026mar.' },
      { p: 'Esqueci a minha senha.', r: 'Procure o setor administrativo: eles geram uma nova senha provisória. Cada novo reset anula a senha anterior — use sempre a última que recebeu.' },
      { p: 'Por que o sistema me desconectou?', r: 'Por segurança, o login é encerrado após 2 horas sem uso (sem toque, clique ou digitação). Basta entrar de novo.' },
      { p: 'Como instalo no celular?', r: 'Android (Chrome): abra viltaloop.com.br, toque em ⋮ e em "Adicionar à tela inicial" / "Instalar app". iPhone (Safari): toque em Compartilhar e em "Adicionar à Tela de Início".' },
      { p: 'O app parece desatualizado no celular.', r: 'O app se atualiza sozinho ao abrir e ao voltar para a tela. Se ainda assim parecer antigo: feche o app (tire também da lista de apps recentes) e abra de novo. Em último caso, no Chrome: Configurações → Configurações do site → viltaloop.com.br → Limpar e redefinir.' },
    ],
  },
  {
    id: 'painel', titulo: 'Painel de Leitos', icone: 'ph-bed', perfis: CLINICOS,
    itens: [
      { p: 'Como funciona o painel?', r: 'Mostra os setores (Sala Vermelha, Internação, Pediatria e Observação) com seus leitos. O último leito de Internação, Pediatria e Observação é o Isolamento. Use "Grade" ou "Lista" para trocar a visualização.' },
      { p: 'Como interno um paciente?', r: 'Toque num leito livre (ou em "Admitir" na lista), preencha nome, diagnóstico, data de admissão, data de nascimento, classificação de Manchester e status, e toque em "Internar".' },
      { p: 'Como realoco (troco de leito/setor)?', r: 'No card do paciente toque em "Realocar", escolha o setor de destino e depois um leito livre (o isolamento aparece destacado em âmbar como "ISO"). Os dados clínicos são mantidos. Se o setor estiver lotado, dá para abrir um leito extra.' },
      { p: 'Como sinalizo que o paciente foi internado (saiu da observação)?', r: 'Enfermagem: no card do paciente em "Em observação", toque no ícone da cama e confirme. Recepção (e enfermagem, pelo menu Recepção): aba "Sinalizar internação", toque em "Sinalizar internação" ao lado do nome e confirme. O card passa a mostrar "Internado" e fica registrado quem sinalizou, quando e de qual status para qual. Se marcou por engano, na mesma aba use "Voltar p/ observação" — também fica registrado. Em Internação o paciente já entra como Internado.' },
      { p: 'Como dou alta, transferência ou óbito?', r: 'No card do paciente toque no botão vermelho "Desfecho" e escolha o tipo. O prontuário continua guardado e pode ser consultado e impresso depois pelo menu "Desfechos" (veja "Depois da alta: Desfechos").' },
    ],
  },
  {
    id: 'passagem', titulo: 'Passagem de Plantão', icone: 'ph-arrows-left-right', perfis: ['enfermagem', 'admin'],
    itens: [
      { p: 'Abrir o plantão', r: 'Ao entrar, confirme a data e o turno (Diurno ou Noturno), marque os profissionais presentes e os setores que você vai acompanhar. Se forem dois enfermeiros, cada um marca a sua parte.' },
      { p: 'Preencher a passagem', r: 'Menu → Passagem de Plantão. Cada paciente tem seu bloco: estado geral, dispositivos, dieta, exames, pendências e observações. Use "Conferir" (ou "Conferir Todos") quando revisar.' },
      { p: 'Imprimir', r: 'Use os botões "Imprimir Sala Vermelha e Internação" e "Imprimir Pediatria e Observação". A folha sai com a assinatura de quem imprimiu.' },
      { p: 'Compartilhar no WhatsApp', r: 'Dentro da Passagem de Plantão, toque em "Compartilhar Plantão". O sistema monta o resumo do plantão para copiar e enviar no grupo.' },
    ],
  },
  {
    id: 'enfermagem', titulo: 'Prontuário de Enfermagem', icone: 'ph-first-aid-kit', perfis: ['enfermagem', 'medico', 'admin'],
    itens: [
      { p: 'Onde fica?', r: 'Toque no paciente no painel. O prontuário abre na parte de Enfermagem, com as abas: Admissão, Evolução SAE, Escalas e Protocolos, Balanço Hídrico 24h, Transferência Externa (SBAR), Nota de Intercorrência e Notificação Compulsória (SINAN).' },
      { p: 'As abas não cabem na tela. Como vejo as outras?', r: 'Quando as abas não cabem numa linha (comum no celular e no tablet), aparecem setas ‹ e › nas pontas. Toque na seta para deslizar as abas para a direita ou para a esquerda. A aba aberta fica sempre à vista.' },
      { p: 'Evolução SAE', r: 'Registre os sinais vitais do turno, marque os diagnósticos NANDA-I e os cuidados NIC e escreva a evolução (SOAP ou descritiva).' },
      { p: 'Duplicar evolução anterior', r: 'Na Evolução SAE, toque em "Duplicar evolução anterior" e escolha uma evolução de enfermagem já finalizada do paciente. O texto, os diagnósticos NANDA-I e os cuidados NIC vêm para o formulário. Os sinais vitais NÃO são copiados — afira de novo. Revise tudo antes de salvar: o documento novo sai com o seu nome. Enfermagem só duplica evolução de enfermagem.' },
      { p: 'O médico pode escrever aqui?', r: 'Não. O médico consegue ver os registros da enfermagem, mas não criar. O mesmo vale ao contrário.' },
    ],
  },
  {
    id: 'medico', titulo: 'Prontuário Médico', icone: 'ph-stethoscope', perfis: ['medico', 'enfermagem', 'admin'],
    itens: [
      { p: 'Onde fica?', r: 'No prontuário do paciente, toque em "Prontuário Médico" no topo. São 9 abas: Admissão, AIH, Plano Terapêutico, Evoluções, Prescrição, Exames & APAC, Sangue e Derivados, Documentos de Alta e Notificação Compulsória (SINAN). Se não couberem na tela, use as setas ‹ › nas pontas da linha de abas.' },
      { p: 'Duplicar evolução médica', r: 'Em Evoluções Médicas → Evolução Diária, toque em "Duplicar evolução anterior" e escolha uma evolução médica já finalizada. Diagnósticos, história, evolução, exame físico e conduta vêm para o formulário; os sinais vitais NÃO são copiados (use "Puxar da enfermagem" ou digite). Revise antes de salvar. Médico só duplica evolução médica.' },
      { p: 'A enfermagem pode preencher a AIH?', r: 'Pode pré-preencher, mas quem assina é o médico. No Prontuário Médico → aba AIH, a enfermagem (ou a recepção) preenche o laudo, escolhe o médico em "Médico que vai revisar e assinar" e toca em "Encaminhar ao médico". A AIH aparece nas Pendências desse médico. Ele abre o paciente na aba AIH (ou usa o lápis no Histórico Clínico), revisa e toca em "Salvar e Imprimir": o laudo sai com a assinatura dele, e fica registrado quem pré-preencheu. Só o médico finaliza a AIH.' },
      { p: 'Duplicar prescrição', r: 'Na Prescrição Médica, no histórico da própria aba, toque em "Duplicar" numa prescrição anterior: medicamentos, dieta e orientações vêm para uma nova prescrição.' },
      { p: 'Quando preciso preencher a Ficha de ATM?', r: 'Só quando a prescrição tem antimicrobiano de uso restrito por via INTRAVENOSA (EV). Ao salvar uma prescrição assim, o sistema avisa e, dentro da aba Prescrição, aparece a sub-aba "ATM - Antimicrobiano Restrito". O mesmo antibiótico por via oral ou intramuscular não pede ATM — na ficha ele aparece com a marca "Via não intravenosa".' },
      { p: 'Como preencho a Ficha de ATM?', r: 'Prescrição → sub-aba "ATM - Antimicrobiano Restrito". A ficha já vem com os antimicrobianos EV pendentes, o diagnóstico e a data. A dose diária e o cálculo D × I × T são feitos sozinhos a partir da prescrição; confira e complete o que faltar. Depois, "Salvar e Imprimir". A pendência some quando todos os antimicrobianos EV tiverem ATM registrada.' },
    ],
  },
  {
    id: 'documentos', titulo: 'Salvar, finalizar e invalidar', icone: 'ph-file-text', perfis: CLINICOS,
    itens: [
      { p: 'Qual a diferença entre "Salvar" e "Salvar e Imprimir"?', r: '"Salvar" guarda um RASCUNHO: só você vê e pode continuar editando depois. "Salvar e Imprimir" FINALIZA o documento: ele entra no prontuário, é impresso e não pode mais ser editado — só invalidado.' },
      { p: 'Onde vejo os documentos que salvei e não finalizei?', r: 'Em Pendências → "Meus documentos não finalizados". Quando houver algum, o item Pendências do menu mostra um número em laranja. Para continuar, abra o paciente e vá na mesma aba: o rascunho reabre sozinho. Ou use o lápis no Histórico Clínico (veja abaixo).' },
      { p: 'Como edito um rascunho pelo Histórico Clínico?', r: 'Histórico Clínico → no seu rascunho, toque no ícone de lápis (ao lado de Visualizar e Invalidar). O sistema abre a aba certa do prontuário já com aquele rascunho carregado. O lápis só aparece nos rascunhos que você mesmo salvou.' },
      { p: 'O que o "Cancelar" faz?', r: 'Com um rascunho aberto, "Cancelar" descarta esse rascunho em definitivo (o sistema pede confirmação). Documentos finalizados nunca são apagados.' },
      { p: 'Onde fica o Histórico Clínico?', r: 'No topo do prontuário, botão "Histórico Clínico". Ele reúne em ordem cronológica todos os registros do paciente, desta internação e das anteriores, com opção de ver/imprimir cada documento e ver o histórico de alterações.' },
      { p: 'Como invalido um documento finalizado?', r: 'Histórico Clínico → toque no registro → "Invalidar" → escreva o motivo → Confirmar. Só quem criou o documento pode invalidar. O documento não é apagado: fica marcado como "Invalidado", com motivo, data e quem invalidou.' },
      { p: 'Posso registrar com data anterior?', r: 'Sim. No rodapé do documento há o campo "Data do registro" para registros retroativos. A data de impressão é sempre a atual.' },
    ],
  },
  {
    id: 'sinan', titulo: 'Notificação Compulsória (SINAN)', icone: 'ph-megaphone', perfis: CLINICOS,
    itens: [
      { p: 'Onde fica?', r: 'No prontuário, na aba "Notificação Compulsória" — tanto no Prontuário de Enfermagem quanto no Prontuário Médico. A ficha sai impressa no modelo oficial do Ministério da Saúde, para entregar à vigilância epidemiológica.' },
      { p: 'Como faço uma notificação?', r: 'Toque em "Nova notificação" e escolha o agravo. Se o diagnóstico do paciente tiver CID, o sistema sugere o agravo certo no topo. Também dá para buscar pelo nome ou pelo CID (ex.: malária, B54). Doenças sem ficha própria saem na Ficha de Notificação Individual.' },
      { p: 'Dengue e Chikungunya, Meningites, Sarampo e Rubéola', r: 'Usam uma ficha só cada: "Dengue e Chikungunya" (CID A90, A91, A92.0); "Meningites"; "Sarampo e Rubéola (doenças exantemáticas)". Dentro da ficha você marca qual é a suspeita.' },
      { p: 'Quais campos são obrigatórios?', r: 'Só os dados gerais: data da notificação, nome completo, data de nascimento, nome da mãe e endereço completo (UF, município, bairro, logradouro e número). Todos os outros campos são editáveis e opcionais. Se faltar algo obrigatório, o sistema avisa e permite "Imprimir mesmo assim".' },
      { p: 'E os códigos do IBGE e do CNES?', r: 'Não precisa digitar: o sistema preenche sozinho a partir do município e da unidade informados (Breves e a UPA já saem com o código).' },
      { p: 'Os dados do paciente vêm prontos?', r: 'Sim. Nome, nascimento, mãe, endereço, CNS e dados da unidade vêm do cadastro e do atendimento. Confira e corrija na própria ficha se precisar.' },
      { p: 'Salvar, imprimir e entregar', r: '"Salvar" guarda rascunho (depois use "Continuar" na lista). "Salvar e Imprimir" registra e imprime. Na lista dá para reimprimir, marcar "Entregue à vigilância" e invalidar. Notificações marcadas "24h" são de notificação imediata; as "Sigilosas" ficam visíveis a todos os profissionais cadastrados, com o aviso de sigilo — não divulgue o conteúdo fora do cuidado do paciente.' },
    ],
  },
  {
    id: 'desfechos', titulo: 'Depois da alta: Desfechos', icone: 'ph-door-open', perfis: CLINICOS,
    itens: [
      { p: 'Dei alta e esqueci de imprimir a evolução. E agora?', r: 'Menu → Desfechos → ache o paciente → toque no botão da impressora na linha dele. O sistema abre o ÚLTIMO documento que VOCÊ registrou para aquele paciente, pronto para imprimir. Se você não registrou nada nesse atendimento, aparece um aviso na linha.' },
      { p: 'Como encontro um paciente que já saiu?', r: 'Na barra de busca de Desfechos, digite o nome completo ou o número do prontuário. A busca procura em TODAS as altas, sem limite de data, e acha o nome com ou sem acento (ex.: "conceicao" encontra "Conceição"). Use o X para limpar a busca.' },
      { p: 'Como abro o prontuário depois da alta?', r: 'Desfechos → "Abrir prontuário" na linha do paciente. O prontuário abre só para consulta, com um aviso no topo mostrando a data da alta. Pelo Histórico Clínico dá para visualizar e imprimir qualquer documento.' },
      { p: 'Posso registrar algo depois da alta?', r: 'Documento novo, não: as abas de registro ficam escondidas. Mas o seu RASCUNHO pode ser finalizado até 24 horas depois da alta: Histórico Clínico → lápis no rascunho → revise → "Salvar e Imprimir". O aviso no topo mostra até quando. Depois desse prazo, fica só consulta e impressão.' },
      { p: 'Fica registrado?', r: 'Sim. Cada abertura de prontuário e cada impressão feita depois da alta ficam na trilha de auditoria, com quem fez e quando.' },
    ],
  },
  {
    id: 'multi', titulo: 'Nutrição e Serviço Social', icone: 'ph-hand-heart', perfis: TODOS,
    itens: [
      { p: 'Onde ficam?', r: 'No prontuário do paciente, botão "Multiprofissional" no topo (ao lado de Enfermagem e Médico). São 4 abas: Admissão Nutricional, Evolução Nutricional, Admissão do Serviço Social e Evolução do Serviço Social.' },
      { p: 'Quem registra?', r: 'Só o(a) nutricionista registra os documentos de Nutrição e só o(a) assistente social registra os do Serviço Social. Os demais profissionais consultam e imprimem pelo Histórico Clínico (filtro "Multiprofissional").' },
      { p: 'Como o(a) nutricionista ou assistente social entra?', r: 'Ao entrar no sistema, abre o Painel de Leitos. Toque em "Prontuário" no paciente: o prontuário já abre na parte Multiprofissional. O cadastro do profissional precisa estar com a função Nutricionista ou Assistente social (Profissionais → Editar).' },
      { p: 'O que é calculado sozinho?', r: 'Na Nutrição: IMC e classificação (adulto e idoso), percentual de perda de peso, pontuação da triagem NRS-2002 (soma +1 ponto para 70 anos ou mais) com o resultado, VET e proteína total a partir do peso. Confira sempre antes de finalizar.' },
      { p: 'Salvar, finalizar e invalidar', r: 'Igual aos outros documentos: "Salvar" guarda rascunho, "Salvar e Imprimir" finaliza e imprime, e depois só quem registrou pode invalidar. Nada é apagado.' },
    ],
  },
  {
    id: 'recepcao', titulo: 'Recepção', icone: 'ph-identification-card', perfis: ['recepcao', 'admin', 'enfermagem'],
    itens: [
      { p: 'Cadastro do paciente', r: 'Menu → Recepção. Busque primeiro pelo nome, CPF ou CNS para evitar cadastro duplicado. Se não existir, use "Novo cadastro". Em "Duplicatas" dá para revisar cadastros repetidos.' },
      { p: 'Sinalizar internação', r: 'Aba "Sinalizar internação": lista quem está em observação e quem está internado. Toque em "Sinalizar internação" ao lado do paciente que passou a ser internado e confirme. Fica registrado com seu nome, data e hora. A decisão clínica é da equipe assistencial — aqui é só a sinalização.' },
      { p: 'Ficha de identificação', r: 'Depois de salvar o cadastro, a ficha de identificação pode ser impressa pela própria tela da Recepção.' },
    ],
  },
  {
    id: 'administracao', titulo: 'Administração: cargos e permissões', icone: 'ph-shield-check', perfis: ['admin', 'gestao'],
    itens: [
      { p: 'Quem pode cadastrar funcionários?', r: 'O administrador geral (dono do sistema) e quem receber um cargo administrativo. Se a pessoa que costuma cadastrar estiver ausente, o administrador geral pode dar o cargo a outra pessoa na hora.' },
      { p: 'Quais funções posso cadastrar?', r: 'Médico, enfermeiro, técnico de enfermagem, recepção, farmacêutico, assistente social, psicólogo, fisioterapeuta, nutricionista, biomédico, técnico de radiologia, administrativo e apoio operacional. Ao criar o login, escolha a função; o campo do conselho (CRM, COREN, CRF etc.) muda sozinho. Médico, enfermeiro e técnico atuam como antes; as demais funções só consultam e não criam documentos clínicos.' },
      { p: 'Como dou um cargo a alguém?', r: 'Menu → Profissionais → Editar (na pessoa) → em "Cargo administrativo", escolha o cargo e, se quiser, ajuste as permissões uma a uma → Salvar alterações. A pessoa precisa sair e entrar de novo para ver o menu novo.' },
      { p: 'Quais são os cargos prontos?', r: 'Gestão de pessoal (cadastra, edita, reseta senha, ativa/desativa e vê a equipe); Cadastro de funcionários (cria login e edita cadastro, sem resetar senha nem desativar); Consulta da equipe (só vê o Painel de Equipe).' },
      { p: 'Como retiro o cargo?', r: 'Profissionais → Editar → Cargo administrativo → "Nenhum" → Salvar. O acesso administrativo some na próxima vez que a pessoa entrar.' },
      { p: 'O que só o administrador geral faz?', r: 'Definir cargos e permissões, tornar alguém administrador geral e mexer na conta de outro administrador. Ninguém consegue dar permissão a si mesmo.' },
      { p: 'Tudo fica registrado?', r: 'Sim. Criar login, resetar senha e mudar cargo ou permissões ficam na trilha de auditoria, com quem fez e quando.' },
    ],
  },
  {
    id: 'faq', titulo: 'Problemas comuns', icone: 'ph-question', perfis: TODOS,
    itens: [
      { p: 'A tela não rola até o fim no celular.', r: 'Isso foi corrigido. Se ainda acontecer, atualize o app (veja "O app parece desatualizado") e avise o administrativo com um print da tela.' },
      { p: 'Não aparece o botão Invalidar.', r: 'Ele só aparece para quem criou o documento e só em documento finalizado. Quem não é o autor vê a mensagem "Só quem registrou pode invalidar".' },
      { p: 'Não acho o Histórico Clínico no celular.', r: 'Ele está no topo do prontuário, ao lado de "Prontuário Médico", com o ícone de relógio.' },
      { p: 'A senha não funciona.', r: 'Confira letras minúsculas e se você está usando a ÚLTIMA senha recebida (cada reset anula a anterior). Se continuar, peça um novo reset ao administrativo.' },
    ],
  },
  {
    id: 'admin', titulo: 'Administração', icone: 'ph-shield-check', perfis: ['admin'],
    itens: [
      { p: 'Criar login', r: 'Menu → Profissionais → "Criar login". Informe nome completo, usuário, nome de exibição (o que sai nos documentos), tipo e COREN/CRM com a UF. A senha provisória aparece logo em seguida — use o botão de copiar e repasse ao profissional.' },
      { p: 'Resetar senha', r: 'Profissionais → "Resetar senha" no login desejado. Uma nova senha provisória é gerada e a anterior deixa de valer. Faça um único reset e repasse só essa senha.' },
      { p: 'Desativar ou reativar', r: 'Profissionais → "Desativar". O profissional perde o acesso, mas os documentos dele continuam no prontuário. Dá para reativar depois.' },
      { p: 'Painel de Equipe', r: 'Mostra todos os logins: quem está online, quem está em plantão, quem está sem COREN/CRM, quem precisa trocar a senha e quem não acessa há mais de 30 dias. "Editar" leva direto ao cadastro. Só administradores veem essa tela.' },
    ],
  },
]
