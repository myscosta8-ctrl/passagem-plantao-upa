// Conteúdo da Ajuda. `perfis`: quem vê a seção (enfermagem, medico, recepcao, admin).
// Mantenha os textos curtos, no passo a passo que a equipe usa no plantão.
const TODOS = ['enfermagem', 'medico', 'recepcao', 'admin']
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
      { p: 'Como dou alta, transferência ou óbito?', r: 'No card do paciente toque no botão vermelho "Desfecho" e escolha o tipo. O prontuário continua guardado e pode ser consultado depois em "Desfechos".' },
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
      { p: 'Onde fica?', r: 'Toque no paciente no painel. O prontuário abre na parte de Enfermagem, com as abas: Admissão de Enfermagem, Evolução SAE, Balanço Hídrico 24h, Transferência Externa (SBAR) e Nota de Intercorrência.' },
      { p: 'Evolução SAE', r: 'Registre os sinais vitais do turno, marque os diagnósticos NANDA-I e os cuidados NIC e escreva a evolução (SOAP ou descritiva).' },
      { p: 'Duplicar evolução anterior', r: 'Na Evolução SAE, toque em "Duplicar evolução anterior" e escolha uma evolução de enfermagem já finalizada do paciente. O texto, os diagnósticos NANDA-I e os cuidados NIC vêm para o formulário. Os sinais vitais NÃO são copiados — afira de novo. Revise tudo antes de salvar: o documento novo sai com o seu nome. Enfermagem só duplica evolução de enfermagem.' },
      { p: 'O médico pode escrever aqui?', r: 'Não. O médico consegue ver os registros da enfermagem, mas não criar. O mesmo vale ao contrário.' },
    ],
  },
  {
    id: 'medico', titulo: 'Prontuário Médico', icone: 'ph-stethoscope', perfis: ['medico', 'enfermagem', 'admin'],
    itens: [
      { p: 'Onde fica?', r: 'No prontuário do paciente, toque em "Prontuário Médico" no topo. São 8 abas: Admissão Médica, Laudo de AIH, Plano Terapêutico, Evoluções Médicas, Prescrição Médica, Exames & APAC, Hemoterapia e Receituário & Alta.' },
      { p: 'Duplicar evolução médica', r: 'Em Evoluções Médicas → Evolução Diária, toque em "Duplicar evolução anterior" e escolha uma evolução médica já finalizada. Diagnósticos, história, evolução, exame físico e conduta vêm para o formulário; os sinais vitais NÃO são copiados (use "Puxar da enfermagem" ou digite). Revise antes de salvar. Médico só duplica evolução médica.' },
      { p: 'Duplicar prescrição', r: 'Na Prescrição Médica, no histórico da própria aba, toque em "Duplicar" numa prescrição anterior: medicamentos, dieta e orientações vêm para uma nova prescrição.' },
    ],
  },
  {
    id: 'documentos', titulo: 'Salvar, finalizar e invalidar', icone: 'ph-file-text', perfis: CLINICOS,
    itens: [
      { p: 'Qual a diferença entre "Salvar" e "Salvar e Imprimir"?', r: '"Salvar" guarda um RASCUNHO: só você vê e pode continuar editando depois. "Salvar e Imprimir" FINALIZA o documento: ele entra no prontuário, é impresso e não pode mais ser editado — só invalidado.' },
      { p: 'Onde vejo os documentos que salvei e não finalizei?', r: 'Em Pendências → "Meus documentos não finalizados". Quando houver algum, o item Pendências do menu mostra um número em laranja. Para continuar, abra o paciente e vá na mesma aba: o rascunho reabre sozinho.' },
      { p: 'O que o "Cancelar" faz?', r: 'Com um rascunho aberto, "Cancelar" descarta esse rascunho em definitivo (o sistema pede confirmação). Documentos finalizados nunca são apagados.' },
      { p: 'Onde fica o Histórico Clínico?', r: 'No topo do prontuário, botão "Histórico Clínico". Ele reúne em ordem cronológica todos os registros do paciente, desta internação e das anteriores, com opção de ver/imprimir cada documento e ver o histórico de alterações.' },
      { p: 'Como invalido um documento finalizado?', r: 'Histórico Clínico → toque no registro → "Invalidar" → escreva o motivo → Confirmar. Só quem criou o documento pode invalidar. O documento não é apagado: fica marcado como "Invalidado", com motivo, data e quem invalidou.' },
      { p: 'Posso registrar com data anterior?', r: 'Sim. No rodapé do documento há o campo "Data do registro" para registros retroativos. A data de impressão é sempre a atual.' },
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
