// Catálogo da SAE da Evolução do Enfermeiro: diagnósticos de enfermagem (títulos resumidos, no
// padrão usado em prontuário — sem as definições do livro NANDA-I) e prescrições/cuidados de
// enfermagem (redação própria), agrupados por necessidade/sistema.
// Os textos já usados em evoluções anteriores foram mantidos exatamente iguais (são gravados como
// texto na evolução e reaproveitados no "Duplicar"). Para incluir um item, basta acrescentá-lo
// no grupo certo; o impresso mostra o texto como está aqui.

export const NANDA_GRUPOS = [
  { grupo: 'Respiratório', itens: [
    'Padrão Respiratório Ineficaz',
    'Desobstrução Ineficaz de Vias Aéreas',
    'Troca de Gases Prejudicada',
    'Ventilação Espontânea Prejudicada',
    'Risco de Aspiração',
  ] },
  { grupo: 'Cardiovascular e circulação', itens: [
    'Débito Cardíaco Diminuído',
    'Risco de Débito Cardíaco Diminuído',
    'Perfusão Tissular Periférica Ineficaz',
    'Risco de Perfusão Tissular Cerebral Ineficaz',
    'Risco de Sangramento',
    'Risco de Choque',
    'Risco de Trombose Venosa',
  ] },
  { grupo: 'Neurológico e cognição', itens: [
    'Confusão Aguda',
    'Risco de Confusão Aguda',
    'Comunicação Verbal Prejudicada',
    'Memória Prejudicada',
    'Capacidade Adaptativa Intracraniana Diminuída',
  ] },
  { grupo: 'Pele, feridas e mucosas', itens: [
    'Risco de Integridade da Pele Prejudicada',
    'Integridade da Pele Prejudicada',
    'Integridade Tissular Prejudicada',
    'Risco de Lesão por Pressão',
    'Mucosa Oral Prejudicada',
  ] },
  { grupo: 'Segurança e proteção', itens: [
    'Risco de Queda',
    'Risco de Infecção',
    'Risco de Lesão',
    'Risco de Trauma Vascular',
    'Risco de Reação Alérgica',
    'Risco de Violência Direcionada a Si Mesmo',
    'Risco de Desequilíbrio na Temperatura Corporal',
    'Hipertermia',
    'Hipotermia',
  ] },
  { grupo: 'Atividade, mobilidade e repouso', itens: [
    'Mobilidade Física Prejudicada',
    'Mobilidade no Leito Prejudicada',
    'Intolerância à Atividade',
    'Fadiga',
    'Padrão de Sono Prejudicado',
    'Déficit no Autocuidado para Banho',
    'Déficit no Autocuidado para Alimentação',
    'Déficit no Autocuidado para Higiene Íntima',
  ] },
  { grupo: 'Nutrição e líquidos', itens: [
    'Nutrição Desequilibrada: Menor que as Necessidades Corporais',
    'Deglutição Prejudicada',
    'Volume de Líquidos Deficiente',
    'Risco de Volume de Líquidos Deficiente',
    'Volume de Líquidos Excessivo',
    'Risco de Desequilíbrio Eletrolítico',
    'Risco de Glicemia Instável',
    'Náusea',
  ] },
  { grupo: 'Eliminações', itens: [
    'Eliminação Urinária Prejudicada',
    'Retenção Urinária',
    'Incontinência Urinária',
    'Constipação',
    'Risco de Constipação',
    'Diarreia',
  ] },
  { grupo: 'Dor e conforto', itens: [
    'Dor Aguda',
    'Dor Crônica',
    'Conforto Prejudicado',
  ] },
  { grupo: 'Psicossocial e família', itens: [
    'Ansiedade',
    'Medo',
    'Enfrentamento Ineficaz',
    'Processos Familiares Interrompidos',
    'Conhecimento Deficiente',
    'Risco de Síndrome do Estresse por Mudança',
  ] },
]

export const NIC_GRUPOS = [
  { grupo: 'Monitorização', itens: [
    { texto: 'Aferir sinais vitais completos e registrar parâmetros', frequencia: '4/4 horas' },
    { texto: 'Aferir sinais vitais e comunicar alterações ao médico', frequencia: '2/2 horas' },
    { texto: 'Monitorizar saturação de oxigênio (oximetria contínua)', frequencia: 'Contínuo' },
    { texto: 'Monitorização cardíaca contínua e observação do traçado', frequencia: 'Contínuo' },
    { texto: 'Avaliar nível de consciência (Escala de Glasgow)', frequencia: '4/4 horas' },
    { texto: 'Avaliar pupilas (tamanho, simetria e reatividade)', frequencia: '4/4 horas' },
    { texto: 'Verificar glicemia capilar (HGT) e registrar', frequencia: '6/6 horas' },
    { texto: 'Avaliar dor pela escala numérica (EVA) e registrar', frequencia: '4/4 horas' },
    { texto: 'Avaliar perfusão periférica e tempo de enchimento capilar', frequencia: 'Por turno' },
    { texto: 'Pesar o paciente em jejum, mesma balança', frequencia: '24 horas' },
  ] },
  { grupo: 'Respiratório', itens: [
    { texto: 'Manter cabeceira elevada a 30° - 45°', frequencia: 'Contínuo' },
    { texto: 'Administrar oxigênio conforme prescrição e observar padrão respiratório', frequencia: 'Contínuo' },
    { texto: 'Aspirar vias aéreas (oro/nasotraqueal) quando necessário', frequencia: 'Se necessário' },
    { texto: 'Estimular tosse, respiração profunda e expansão pulmonar', frequencia: '4/4 horas' },
    { texto: 'Realizar nebulização conforme prescrição', frequencia: 'Conforme prescrição' },
    { texto: 'Avaliar ausculta pulmonar e registrar ruídos adventícios', frequencia: 'Por turno' },
    { texto: 'Verificar fixação e posicionamento do tubo orotraqueal / traqueostomia', frequencia: 'Por turno' },
    { texto: 'Higiene oral com clorexidina 0,12% em paciente intubado', frequencia: '12/12 horas' },
    { texto: 'Manter decúbito lateral em paciente com rebaixamento de consciência', frequencia: 'Contínuo' },
  ] },
  { grupo: 'Acesso venoso, sondas e drenos', itens: [
    { texto: 'Avaliar e inspecionar inserção do AVP quanto a sinais de flebite', frequencia: 'Por turno' },
    { texto: 'Trocar curativo do acesso venoso e registrar data', frequencia: 'Conforme protocolo' },
    { texto: 'Salinizar acesso venoso periférico antes e após medicações', frequencia: 'Conforme uso' },
    { texto: 'Identificar equipos e soluções com data, hora e responsável', frequencia: 'A cada troca' },
    { texto: 'Controlar gotejamento / bomba de infusão conforme prescrição', frequencia: '1/1 hora' },
    { texto: 'Verificar posicionamento e fixação da sonda nasoenteral antes da dieta', frequencia: 'Antes de cada dieta' },
    { texto: 'Lavar sonda enteral com água filtrada após dieta e medicações', frequencia: 'Após cada uso' },
    { texto: 'Manter sonda vesical de demora com bolsa abaixo do nível da bexiga', frequencia: 'Contínuo' },
    { texto: 'Realizar higiene do meato urinário em paciente com SVD', frequencia: '12/12 horas' },
    { texto: 'Observar e registrar débito e aspecto de drenos', frequencia: 'Por turno' },
  ] },
  { grupo: 'Pele, feridas e prevenção de lesão por pressão', itens: [
    { texto: 'Mudança de decúbito e posicionamento no leito com coxins', frequencia: '2/2 horas' },
    { texto: 'Inspecionar pele e proeminências ósseas (Escala de Braden)', frequencia: 'Por turno' },
    { texto: 'Hidratar a pele com hidratante / AGE em áreas de risco', frequencia: '12/12 horas' },
    { texto: 'Manter lençóis limpos, secos e sem dobras', frequencia: 'Contínuo' },
    { texto: 'Proteger calcâneos e regiões de apoio com coxins / flutuação', frequencia: 'Contínuo' },
    { texto: 'Realizar curativo da ferida conforme protocolo e descrever aspecto', frequencia: '24 horas' },
    { texto: 'Trocar fralda e realizar higiene íntima após eliminações', frequencia: 'Se necessário' },
    { texto: 'Aplicar creme barreira em região perineal', frequencia: 'A cada troca' },
  ] },
  { grupo: 'Segurança e prevenção de quedas', itens: [
    { texto: 'Manter grades laterais do leito sempre elevadas', frequencia: 'Contínuo' },
    { texto: 'Manter leito na posição mais baixa e travado', frequencia: 'Contínuo' },
    { texto: 'Avaliar risco de queda (Escala de Morse) e sinalizar leito', frequencia: 'Por turno' },
    { texto: 'Manter pulseira de identificação legível e conferir antes de procedimentos', frequencia: 'Por turno' },
    { texto: 'Manter campainha e objetos pessoais ao alcance', frequencia: 'Contínuo' },
    { texto: 'Acompanhar o paciente na deambulação e ida ao banheiro', frequencia: 'Se necessário' },
    { texto: 'Aplicar contenção mecânica conforme prescrição, avaliando perfusão do membro', frequencia: '2/2 horas' },
    { texto: 'Conferir os 9 certos antes de administrar medicamentos', frequencia: 'A cada administração' },
    { texto: 'Verificar e sinalizar alergias no prontuário e na pulseira', frequencia: 'Admissão' },
  ] },
  { grupo: 'Controle de infecção', itens: [
    { texto: 'Higienizar as mãos antes e após contato com o paciente', frequencia: 'Contínuo' },
    { texto: 'Manter precauções de isolamento conforme indicação (contato / gotículas / aerossol)', frequencia: 'Contínuo' },
    { texto: 'Controlar temperatura e comunicar febre', frequencia: '4/4 horas' },
    { texto: 'Coletar culturas conforme prescrição antes do antimicrobiano', frequencia: 'Conforme prescrição' },
    { texto: 'Administrar antimicrobiano no horário, respeitando tempo de infusão', frequencia: 'Conforme prescrição' },
  ] },
  { grupo: 'Nutrição, líquidos e eliminações', itens: [
    { texto: 'Balanço hídrico rigoroso (entradas e saídas)', frequencia: '24 horas' },
    { texto: 'Controlar diurese e registrar volume e aspecto', frequencia: 'Por turno' },
    { texto: 'Controlar diurese horária em paciente com SVD', frequencia: '1/1 hora' },
    { texto: 'Oferecer dieta conforme prescrição e registrar aceitação', frequencia: 'Nas refeições' },
    { texto: 'Auxiliar na alimentação e manter decúbito elevado durante e após', frequencia: 'Nas refeições' },
    { texto: 'Manter jejum conforme prescrição e registrar horário de início', frequencia: 'Contínuo' },
    { texto: 'Estimular ingestão hídrica, se não houver restrição', frequencia: 'Por turno' },
    { texto: 'Observar e registrar evacuações (frequência e aspecto)', frequencia: 'Por turno' },
    { texto: 'Observar edema e distensão abdominal', frequencia: 'Por turno' },
    { texto: 'Observar náuseas e vômitos e registrar volume e aspecto', frequencia: 'Se necessário' },
  ] },
  { grupo: 'Higiene e conforto', itens: [
    { texto: 'Realizar banho no leito / auxiliar no banho de aspersão', frequencia: '24 horas' },
    { texto: 'Realizar higiene oral', frequencia: '12/12 horas' },
    { texto: 'Realizar higiene íntima', frequencia: 'Por turno' },
    { texto: 'Manter ambiente calmo, iluminação adequada e favorecer o sono', frequencia: 'Noturno' },
    { texto: 'Aplicar compressa fria / morna conforme prescrição', frequencia: 'Conforme prescrição' },
    { texto: 'Reavaliar dor 30 a 60 minutos após analgesia', frequencia: 'Após cada analgesia' },
  ] },
  { grupo: 'Mobilidade e reabilitação', itens: [
    { texto: 'Estimular movimentação ativa no leito conforme tolerância', frequencia: 'Por turno' },
    { texto: 'Realizar exercícios passivos de membros', frequencia: 'Por turno' },
    { texto: 'Sentar em poltrona com supervisão, se liberado', frequencia: '24 horas' },
    { texto: 'Manter membro elevado / imobilizado conforme prescrição', frequencia: 'Contínuo' },
    { texto: 'Avaliar sensibilidade, cor e temperatura de membro imobilizado', frequencia: '4/4 horas' },
  ] },
  { grupo: 'Neurológico e comportamento', itens: [
    { texto: 'Reorientar o paciente no tempo e espaço', frequencia: 'Por turno' },
    { texto: 'Observar agitação, confusão e sinais de delirium', frequencia: 'Por turno' },
    { texto: 'Observar crises convulsivas e manter via aérea pérvia durante a crise', frequencia: 'Contínuo' },
    { texto: 'Manter acompanhante / vigilância contínua em risco de autolesão', frequencia: 'Contínuo' },
    { texto: 'Retirar objetos que ofereçam risco do ambiente', frequencia: 'Por turno' },
  ] },
  { grupo: 'Cardiovascular e sangramento', itens: [
    { texto: 'Observar sinais de sangramento (gengivas, urina, fezes, punções)', frequencia: 'Por turno' },
    { texto: 'Comprimir locais de punção por tempo adequado em uso de anticoagulante', frequencia: 'Após punções' },
    { texto: 'Observar dor torácica e realizar ECG conforme protocolo', frequencia: 'Se necessário' },
    { texto: 'Manter meias / compressão pneumática para prevenção de TVP, se prescrito', frequencia: 'Contínuo' },
    { texto: 'Monitorar reação transfusional durante hemotransfusão', frequencia: 'Durante a transfusão' },
  ] },
  { grupo: 'Glicemia', itens: [
    { texto: 'Aplicar insulina conforme esquema prescrito e rodiziar locais', frequencia: 'Conforme prescrição' },
    { texto: 'Observar sinais de hipoglicemia e aplicar protocolo', frequencia: 'Contínuo' },
  ] },
  { grupo: 'Psicossocial, família e orientação', itens: [
    { texto: 'Orientar paciente e família sobre o tratamento e procedimentos', frequencia: '24 horas' },
    { texto: 'Estimular presença de acompanhante e escuta das preocupações', frequencia: 'Por turno' },
    { texto: 'Acionar serviço social / psicologia quando necessário', frequencia: 'Se necessário' },
    { texto: 'Orientar cuidados para a alta (medicações, retorno, sinais de alerta)', frequencia: 'Na alta' },
  ] },
]

// Listas planas (compatibilidade com o código existente).
export const NANDA_OPCOES = NANDA_GRUPOS.flatMap((g) => g.itens)
export const NIC_OPCOES = NIC_GRUPOS.flatMap((g) => g.itens)

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// Busca sem acento, todas as palavras precisam aparecer ("risco pele", "sonda").
export function filtrarSae(texto, busca) {
  const palavras = norm(busca).split(/\s+/).filter(Boolean)
  if (!palavras.length) return true
  const t = norm(texto)
  return palavras.every((p) => t.includes(p))
}
