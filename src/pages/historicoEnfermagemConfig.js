// Configuração compartilhada entre o formulário (FichaMedica.jsx) e a
// impressão (FichaMedicaPrint.jsx) da Admissão de Enfermagem — evita
// import circular entre os dois arquivos.
export const EXAME_FISICO_CONFIG = [
  { secao: 'neurologico', secaoTitulo: 'Neurológico', campos: [
    { id: 'consciente', label: 'Consciente', opcoes: ['Orientado', 'Confuso', 'Agitado', 'Inconsciente', 'Coma'], extras: [{ key: 'outros', label: 'Outros' }] },
    { id: 'pupilas', label: 'Pupilas', opcoes: ['Isocóricas', 'Anisocóricas', 'D > E', 'E > D'], extras: [{ key: 'fotorreagentes', label: 'Fotorreagentes' }] },
  ] },
  { secao: 'cabeca_pescoco', secaoTitulo: 'Cabeça Pescoço', observacao: true, campos: [
    { id: 'couro_cabeludo', label: 'Couro Cabeludo', opcoes: ['Sem Alteração', 'Alopécia', 'Cicatriz', 'Lesão'], extras: [{ key: 'outros', label: 'Outros' }] },
    { id: 'olhos', label: 'Olhos', opcoes: ['Sem Alteração', 'Hiperemia', 'Uso de óculos/Lentes', 'Nistagmo', 'Diplopia', 'Catarata', 'Deficiência Visual'] },
    { id: 'nariz', label: 'Nariz', opcoes: ['Sem Alteração', 'Epistaxe', 'Obstrução', 'Coriza'] },
    { id: 'orofaringe', label: 'Orofaringe', opcoes: ['Sem Alteração', 'Uso de próteses'], extras: [{ key: 'lesao_tipo', label: 'Lesão Tipo' }] },
    { id: 'orofaringe_2', label: '', opcoes: ['Disfagia', 'Dislalia', 'Afasia'], extras: [{ key: 'ganglios_local', label: 'Gânglios Local' }] },
    { id: 'mucosa', label: 'Mucosa', opcoes: ['Corada', 'Descorada', 'Hidratada', 'Desidratada'] },
    { id: 'pescoco', label: 'Pescoço', opcoes: ['Sem Alteração', 'Rigidez de nuca', 'Gânglios', 'Tireoide Aumentada'] },
  ] },
  { secao: 'tegumentar', secaoTitulo: 'Tegumentar', observacao: true, campos: [
    { id: 'tegumentar', label: '', opcoes: ['Sem alteração', 'Ictérica', 'Cianose', 'Palidez', 'Prurido', 'Turgor', 'Edema', 'Hiperemia', 'Hematoma', 'Escoriações', 'Lesão por pressão', 'Queimadura'] },
  ] },
  { secao: 'musculo_esqueletico', secaoTitulo: 'Músculo/Esquelético', observacao: true, campos: [
    { id: 'muscular', label: 'Muscular', opcoes: ['Sem alteração', 'Mialgia', 'Atrofia', 'Deficiência'] },
    { id: 'esqueletico', label: 'Esquelético', opcoes: ['Sem alteração', 'Lordose', 'Cifose', 'Escoliose'], extras: [{ key: 'tracao', label: 'Tração/Placas/Pinos' }, { key: 'locomocao', label: 'Locomoção' }] },
    { id: 'membros_superiores', label: 'Membros Superiores', opcoes: ['Sem anormalidades', 'Com anormalidades'], extras: [{ key: 'especificar', label: 'Especificar', somenteSe: 'Com anormalidades' }] },
    { id: 'membros_inferiores', label: 'Membros Inferiores', opcoes: ['Sem anormalidades', 'Com anormalidades'], extras: [{ key: 'especificar', label: 'Especificar', somenteSe: 'Com anormalidades' }] },
  ] },
  { secao: 'torax_respiratorio', secaoTitulo: 'Tórax/Respiratório', observacao: true, campos: [
    { id: 'torax', label: 'Tórax', opcoes: ['Sem alteração', 'Assimétrico', 'Fratura'], extras: [{ key: 'drenos', label: 'Drenos' }, { key: 'cateter_central', label: 'Cateter central' }] },
    { id: 'mamas', label: 'Mamas', opcoes: ['Sem alteração', 'Presença de nódulos', 'Mastectomia', 'Aumento das mamas'] },
    { id: 'padrao_respiratorio', label: 'Padrão respiratório', opcoes: ['Espontâneo', 'Ventilação mecânica', 'Traqueostomizado', 'Cateter O2', 'Máscara', 'Eupneico', 'Dispneico', 'Taquipneico', 'Bradipneico', 'Tosse'], extras: [{ key: 'expectoracao', label: 'Expectoração — cor/aspecto' }] },
    { id: 'ruidos_adventicios', label: 'Ruídos adventícios', opcoes: ['Pulmões livres', 'Roncos', 'Sibilos', 'Estertores'] },
  ] },
  { secao: 'cardiovascular', secaoTitulo: 'Cardiovascular', observacao: true, campos: [
    { id: 'frequencia_cardiaca', label: 'Frequência cardíaca', opcoes: ['Normocárdico', 'Bradicárdico', 'Taquicárdico', 'Pulso rítmico', 'Pulso arrítmico'], extras: [{ key: 'dor_toracica', label: 'Dor torácica - Tipo' }] },
    { id: 'pulsos_perifericos', label: 'Pulsos periféricos', opcoes: ['Presente', 'Ausente'], extras: [{ key: 'perfusao', label: 'Perfusão' }] },
    { id: 'rede_venosa', label: 'Rede venosa periférica', opcoes: ['Normal', 'Fragilidade capilar'] },
  ] },
  { secao: 'gastrointestinal', secaoTitulo: 'Gastrointestinal', observacao: true, campos: [
    { id: 'abdome', label: 'Abdome', opcoes: ['Plano', 'Distendido', 'Globoso', 'Timpânico', 'RHA presente', 'Doloroso'] },
    { id: 'abdome_2', label: '', opcoes: ['Vômitos', 'Hematêmese', 'Gastrotomia', 'Jejunostomia', 'Colostomia', 'SNG', 'SNE'], extras: [{ key: 'vomitos_dia', label: 'Vômitos / dia' }] },
    { id: 'drenos_gi', label: 'Drenos', opcoes: [], extras: [{ key: 'drenos', label: 'Drenos' }, { key: 'obs', label: 'Obs' }] },
    { id: 'habito_intestinal', label: 'Hábito intestinal', opcoes: ['Flatulência', 'Obstipação', 'Diarreia', 'Melena'], extras: [{ key: 'frequencia_dia', label: 'Frequência / dia' }, { key: 'uso_medicamentos', label: 'Uso de medicamentos' }, { key: 'diarreia_dia', label: 'Diarreia / dia' }] },
  ] },
  { secao: 'urinario', secaoTitulo: 'Urinário', observacao: true, campos: [
    { id: 'urinario', label: '', opcoes: ['Sem alteração', 'Disúria', 'Hematúria', 'Nictúria', 'Poliúria', 'Oligúria', 'Polaciúria', 'Urgência miccional', 'Incontinência', 'SVD'] },
  ] },
  { secao: 'genital', secaoTitulo: 'Genital', observacao: true, campos: [
    { id: 'feminino', label: 'Feminino', opcoes: ['Sem alteração', 'Leucorréia', 'Amenorréia', 'Menopausa'], extras: [{ key: 'dst', label: 'DST' }] },
    { id: 'masculino', label: 'Masculino', opcoes: ['Sem alteração', 'Presença de secreção', 'Edema'], extras: [{ key: 'dst', label: 'DST' }] },
    { id: 'perineo', label: 'Períneo', opcoes: ['Sem alteração', 'Hiperemia'], extras: [{ key: 'lesao', label: 'Lesão' }] },
  ] },
]

export const INFO_COMPLEMENTARES_CAMPOS = [
  { key: 'cirurgias_anteriores', label: 'Cirurgias Anteriores' },
  { key: 'cardiopatias', label: 'Cardiopatias' },
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'tabagismo', label: 'Tabagismo' },
  { key: 'etilismo', label: 'Etilismo' },
  { key: 'dependencia_quimica', label: 'Dependência Química' },
  { key: 'gestante', label: 'Gestante' },
]

export const COLETA_DADOS_OPCOES = [
  { key: 'relato_usuario', label: 'Relato do usuário' },
  { key: 'coleta_familiares', label: 'Coleta de dados junto aos familiares' },
  { key: 'coleta_observacao', label: 'Coleta por observação' },
]
