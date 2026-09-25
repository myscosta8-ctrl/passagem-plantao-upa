export const SV_VAZIO = {
  pa_sistolica: '',
  pa_diastolica: '',
  fc: '',
  fr: '',
  spo2: '',
  temperatura: '',
  glicemia: '',
  dor_escala: '',
};

export const NANDA_OPCOES = [
  'Mobilidade Física Prejudicada',
  'Risco de Queda',
  'Risco de Integridade da Pele Prejudicada',
  'Comunicação Verbal Prejudicada',
  'Risco de Aspiração',
  'Risco de Infecção',
  'Padrão Respiratório Ineficaz',
  'Débito Cardíaco Diminuído',
];

export const NIC_OPCOES = [
  { texto: 'Mudança de decúbito e posicionamento no leito com coxins', frequencia: '2/2 horas' },
  { texto: 'Manter cabeceira elevada a 30° - 45°', frequencia: 'Contínuo' },
  { texto: 'Manter grades laterais do leito sempre elevadas', frequencia: 'Contínuo' },
  { texto: 'Aferir sinais vitais completos e registrar parâmetros', frequencia: '4/4 horas' },
  { texto: 'Avaliar e inspecionar inserção do AVP quanto a sinais de flebite', frequencia: 'Por turno' },
  { texto: 'Balanço hídrico rigoroso (entradas e saídas)', frequencia: '24 horas' },
];

export const VIAS_ENTRADA = ['Oral', 'Dieta enteral', 'EV', 'Outra'];
export const VIAS_SAIDA = ['Diurese', 'Vômito', 'Dreno', 'Evacuação', 'Outra'];

export const TIPOS_ISOLAMENTO = ['Contato', 'Gotículas', 'Aerossol'];

export const NIVEIS_CONSCIENCIA = [
  'Consciente/orientado',
  'Confuso',
  'Sonolento',
  'Sedado',
  'Inconsciente',
];

export function riscoClasse(nivel) {
  const n = (nivel || '').toLowerCase();
  if (n.includes('muito alto') || n.includes('risco alto')) return 'danger';
  if (n.includes('moderado') || n.includes('médio')) return 'warn';
  return 'ok';
}

export const BRADEN_CAMPOS = [
  {
    chave: 'percepcao_sensorial',
    rotulo: 'Percepção sensorial',
    opcoes: [
      { v: 1, t: 'Completamente limitada' },
      { v: 2, t: 'Muito limitada' },
      { v: 3, t: 'Levemente limitada' },
      { v: 4, t: 'Nenhuma limitação' },
    ],
  },
  {
    chave: 'umidade',
    rotulo: 'Umidade',
    opcoes: [
      { v: 1, t: 'Completamente molhada' },
      { v: 2, t: 'Muito molhada' },
      { v: 3, t: 'Ocasionalmente molhada' },
      { v: 4, t: 'Raramente molhada' },
    ],
  },
  {
    chave: 'atividade',
    rotulo: 'Atividade',
    opcoes: [
      { v: 1, t: 'Acamado' },
      { v: 2, t: 'Confinado à cadeira' },
      { v: 3, t: 'Anda ocasionalmente' },
      { v: 4, t: 'Anda frequentemente' },
    ],
  },
  {
    chave: 'mobilidade',
    rotulo: 'Mobilidade',
    opcoes: [
      { v: 1, t: 'Completamente imóvel' },
      { v: 2, t: 'Muito limitada' },
      { v: 3, t: 'Levemente limitada' },
      { v: 4, t: 'Nenhuma limitação' },
    ],
  },
  {
    chave: 'nutricao',
    rotulo: 'Nutrição',
    opcoes: [
      { v: 1, t: 'Muito pobre' },
      { v: 2, t: 'Provavelmente inadequada' },
      { v: 3, t: 'Adequada' },
      { v: 4, t: 'Excelente' },
    ],
  },
  {
    chave: 'friccao_cisalhamento',
    rotulo: 'Fricção e cisalhamento',
    opcoes: [
      { v: 1, t: 'Problema' },
      { v: 2, t: 'Problema em potencial' },
      { v: 3, t: 'Nenhum problema' },
    ],
  },
];

export function riscoBraden(total) {
  if (total <= 9) return 'Risco muito alto';
  if (total <= 12) return 'Risco alto';
  if (total <= 14) return 'Risco moderado';
  if (total <= 18) return 'Risco baixo';
  return 'Sem risco';
}

export const MORSE_CAMPOS = [
  { chave: 'historico_quedas', rotulo: 'Histórico de quedas', opcoes: [{ v: 0, t: 'Não' }, { v: 25, t: 'Sim' }] },
  { chave: 'diagnostico_secundario', rotulo: 'Diagnóstico secundário', opcoes: [{ v: 0, t: 'Não' }, { v: 15, t: 'Sim' }] },
  {
    chave: 'auxilio_locomocao',
    rotulo: 'Auxílio de locomoção',
    opcoes: [
      { v: 0, t: 'Nenhum / leito / cadeira de rodas / enfermeiro' },
      { v: 15, t: 'Muletas / bengala / andador' },
      { v: 30, t: 'Apoia-se em móveis' },
    ],
  },
  { chave: 'terapia_ev', rotulo: 'Terapia endovenosa', opcoes: [{ v: 0, t: 'Não' }, { v: 20, t: 'Sim' }] },
  {
    chave: 'marcha',
    rotulo: 'Marcha',
    opcoes: [
      { v: 0, t: 'Normal / leito / imóvel' },
      { v: 10, t: 'Fraca' },
      { v: 20, t: 'Comprometida' },
    ],
  },
  {
    chave: 'estado_mental',
    rotulo: 'Estado mental',
    opcoes: [
      { v: 0, t: 'Orienta-se quanto à própria capacidade' },
      { v: 15, t: 'Superestima capacidade / esquece limitações' },
    ],
  },
];

export function riscoMorse(total) {
  if (total <= 24) return 'Risco baixo';
  if (total <= 50) return 'Risco médio';
  return 'Risco alto';
}

export const TIPOS_DISPOSITIVO = ['AVP', 'SVD', 'SNE', 'Dreno', 'CVC', 'Traqueostomia', 'O2'];

export const GRAVIDADES = ['Leve', 'Moderada', 'Grave'];

export const CATEGORIAS_EVENTO_ADVERSO = [
  'Queda',
  'Erro de medicação',
  'Reação adversa a medicamento',
  'Falha de equipamento',
  'Quase erro (near miss)',
  'Outro',
];

export const GRAVIDADES_EVENTO_ADVERSO = ['Leve', 'Moderada', 'Grave', 'Óbito'];
