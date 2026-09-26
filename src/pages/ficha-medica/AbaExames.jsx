import { useEffect, useState } from 'react';
import { listarExames, criarExame, buscarCabecalhoImpressao, criarApac } from '../../lib/pepMedico';

// ==========================================
// CATÁLOGO COMPLETO FIEL AO MOCKUP FASE 2
// (mockups-fase2/16-solicitacao-exames-apac-design.html)
// ==========================================
const EXAMES_LAB_CATALOGO = [
  {
    grupo: '1. Hematologia & Hemostasia',
    itens: [
      { nome: 'Hemograma Completo com Contagem de Plaquetas e Índices Hematimétricos', label: 'Hemograma Completo (Eritrograma + Leucograma + Plaquetas)', amostra: 'Sangue Total (EDTA - Tubo Roxo)', padrao: true },
      { nome: 'Tipagem Sanguínea (Determinação de Grupos ABO e Fator Rh)', label: 'Tipagem Sanguínea (Grupos ABO e Fator Rh)', amostra: 'Sangue Total (EDTA - Tubo Roxo)', padrao: true },
      { nome: 'Coagulograma Completo (Tempo de Protrombina / TP / INR + TTPA)', label: 'Coagulograma Completo (TP / INR + TTPA)', amostra: 'Plasma Citratado (Tubo Azul)', padrao: true },
      { nome: 'D-Dímero Quantitativo de Alta Sensibilidade', label: 'D-Dímero Quantitativo de Alta Sensibilidade', amostra: 'Plasma Citratado (Tubo Azul)' },
      { nome: 'Fibrinogênio Plasmático de Urgência', label: 'Fibrinogênio Plasmático de Urgência', amostra: 'Plasma Citratado (Tubo Azul)' },
      { nome: 'Velocidade de Hemossedimentação (VHS)', label: 'VHS (Velocidade de Hemossedimentação)', amostra: 'Sangue Total (EDTA - Tubo Roxo)' },
      { nome: 'Contagem de Reticulócitos', label: 'Contagem de Reticulócitos', amostra: 'Sangue Total (EDTA - Tubo Roxo)' },
      { nome: 'Tempo de Sangramento (TS) e Tempo de Coagulação (TC)', label: 'Tempo de Sangramento (TS) e Tempo de Coagulação (TC)', amostra: 'In Vivo / Sangue Capilar' },
    ]
  },
  {
    grupo: '2. Bioquímica, Função Renal & Hepática',
    itens: [
      { nome: 'Dosagem de Ureia Sérica', label: 'Ureia Sérica', amostra: 'Soro / Gel Separador (Tubo Amarelo)', padrao: true },
      { nome: 'Dosagem de Creatinina Sérica (com estimativa de TFG)', label: 'Creatinina Sérica (com estimativa de TFG)', amostra: 'Soro / Gel Separador (Tubo Amarelo)', padrao: true },
      { nome: 'Transaminase Oxalacética (TGO / AST)', label: 'TGO / AST (Transaminase Oxalacética)', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Transaminase Pirúvica (TGP / ALT)', label: 'TGP / ALT (Transaminase Pirúvica)', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Bilirrubinas Totais e Frações (Direta e Indireta)', label: 'Bilirrubinas Totais e Frações (Direta e Indireta)', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Gama-Glutamiltransferase (Gama-GT) e Fosfatase Alcalina (FA)', label: 'Fosfatase Alcalina (FA) e Gama-GT', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Amilase Sérica e Lipase Sérica de Urgência', label: 'Amilase Sérica e Lipase Sérica', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Ácido Úrico Sérico', label: 'Ácido Úrico Sérico', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Proteínas Totais e Frações (Albumina e Globulinas)', label: 'Proteínas Totais e Frações (Albumina e Globulinas)', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
    ]
  },
  {
    grupo: '3. Eletrólitos, Metabolismo & Glicemia',
    itens: [
      { nome: 'Dosagem de Sódio Sérico (Na+)', label: 'Sódio Sérico (Na+)', amostra: 'Soro / Gel Separador (Tubo Amarelo)', padrao: true },
      { nome: 'Dosagem de Potássio Sérico (K+)', label: 'Potássio Sérico (K+)', amostra: 'Soro / Gel Separador (Tubo Amarelo)', padrao: true },
      { nome: 'Glicemia de Urgência em Jejum/Casual', label: 'Glicemia de Urgência Casual / Jejum', amostra: 'Fluoreto de Sódio (Tubo Cinza)', padrao: true },
      { nome: 'Dosagem de Ácido Láctico Sérico (Lactato de Urgência)', label: 'Lactato Sérico de Urgência (Ácido Láctico)', amostra: 'Plasma Fluoretado / Soro Gel', padrao: true },
      { nome: 'Dosagem de Cloreto Sérico (Cl-)', label: 'Cloreto Sérico (Cl-)', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Cálcio Total e Cálcio Iônico', label: 'Cálcio Total e Cálcio Iônico', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Dosagem de Magnésio Sérico', label: 'Magnésio Sérico', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Dosagem de Fósforo Sérico', label: 'Fósforo Sérico', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
    ]
  },
  {
    grupo: '4. Gasometria, Marcadores Cardíacos & Inflamatórios',
    itens: [
      { nome: 'Gasometria Arterial Completa (pH, pO2, pCO2, HCO3, BE, SatO2, Eletrólitos e Lactato)', label: 'Gasometria Arterial Completa (com eletrólitos e lactato)', amostra: 'Sangue Arterial (Seringa Heparinizada)', padrao: true },
      { nome: 'Gasometria Venosa (pH, pCO2, HCO3, BE e SatO2 Venosa)', label: 'Gasometria Venosa Central / Periférica', amostra: 'Sangue Venoso (Seringa Heparinizada)' },
      { nome: 'Troponina I de Alta Sensibilidade (Quantitativa)', label: 'Troponina I de Alta Sensibilidade (Quantitativa)', amostra: 'Soro / Plasma Heparinizado', padrao: true },
      { nome: 'CK-MB (Massa / Atividade) e CPK Total', label: 'CK-MB (Massa) e CPK Total', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'Proteína C-Reativa Quantitativa (PCR de Alta Sensibilidade)', label: 'Proteína C-Reativa Quantitativa (PCR-as)', amostra: 'Soro / Gel Separador (Tubo Amarelo)', padrao: true },
      { nome: 'Procalcitonina (PCT) Quantitativa', label: 'Procalcitonina (PCT) Quantitativa', amostra: 'Soro / Gel Separador (Tubo Amarelo)' },
      { nome: 'BNP / NT-proBNP (Peptídeo Natriurético Cerebral)', label: 'BNP / NT-proBNP (Marcador de ICC)', amostra: 'Plasma EDTA (Tubo Roxo)' },
    ]
  },
  {
    grupo: '5. Urinálise & Sedimento Urinário',
    itens: [
      { nome: 'Exame Físico-Químico e Microscópico da Urina (EAS / Sumário de Urina)', label: 'EAS / Sumário de Urina com Sedimento', amostra: 'Urina Jato Médio / Coletor Estéril', padrao: true },
      { nome: 'Proteinúria de Amostra Isolada / Relação Proteína/Creatinina Urinária', label: 'Proteinúria de Amostra Isolada / Relação P/C', amostra: 'Urina Jato Médio' },
      { nome: 'Pesquisa de Corpos Cetônicos na Urina', label: 'Pesquisa de Corpos Cetônicos na Urina', amostra: 'Urina Recente' },
    ]
  },
  {
    grupo: '6. Testes Rápidos Point-of-Care (Triagem UPA)',
    itens: [
      { nome: 'Teste Rápido para Dengue (Antígeno NS1 e Anticorpos IgG/IgM)', label: 'Teste Rápido Dengue (NS1 Ag / IgG / IgM)', amostra: 'Sangue Total / Soro' },
      { nome: 'Teste Rápido / Gota Espessa para Malária (Pan / Plasmodium falciparum)', label: 'Teste Rápido / Gota Espessa para Malária', amostra: 'Sangue Total / Capilar' },
      { nome: 'Teste Rápido Painel Respiratório COVID-19 / Influenza A+B', label: 'Teste Rápido COVID-19 / Influenza A+B', amostra: 'Swab Nasofaríngeo' },
      { nome: 'Teste Rápido de Triagem para HIV 1/2 e Sífilis', label: 'Teste Rápido HIV 1/2 e Sífilis', amostra: 'Sangue Total' },
      { nome: 'Teste Imunológico Rápido de Gravidez (Beta-HCG Qualitativo)', label: 'Beta-HCG Qualitativo de Urgência', amostra: 'Soro / Urina' },
    ]
  }
];

const EXAMES_IMG_CATALOGO = [
  {
    grupo: '1. Radiologia Digital — Tórax & Abdome',
    itens: [
      { nome: 'Radiografia de Tórax (Incidências Posteroanterior - PA e Perfil)', label: 'Tórax (PA e Perfil)', projecao: 'Ortostase / Grade Antidifusora', padrao: true },
      { nome: 'Rotina Radiológica de Abdome Agudo Completa (Tórax PA em Cúpulas Frênicas + Abdome em Ortostase e Decúbito Dorsal)', label: 'Rotina Radiológica de Abdome Agudo Completa (Cúpulas + Abdome em Pé + Decúbito)', projecao: 'Ortostático + Decúbito Dorsal', padrao: true },
      { nome: 'Radiografia de Tórax no Leito (Incidência Anteroposterior - AP)', label: 'Tórax no Leito (Incidência AP)', projecao: 'Leito / Feixe AP Portátil' },
      { nome: 'Radiografia Simples de Abdome (Incidência Anteroposterior - AP em Decúbito Dorsal)', label: 'Abdome Simples (AP em Decúbito Dorsal)', projecao: 'Decúbito Dorsal / AP' },
      { nome: 'Radiografia de Tórax em Decúbito Lateral com Raios Horizontais (Manobra de Laurel)', label: 'Tórax em Decúbito Lateral (Manobra de Laurel)', projecao: 'Decúbito Lateral / Feixe Horizontal' },
      { nome: 'Radiografia de Arcos Costais / Hemitórax (Incidências AP e Oblíquas)', label: 'Arcos Costais / Gradil Costal (AP e Oblíquas)', projecao: 'AP + Oblíqua Específica' },
    ]
  },
  {
    grupo: '2. Radiologia Digital — Pelve Óssea & Articulação Coxofemoral',
    itens: [
      { nome: 'Radiografia de Pelve Óssea Panorâmica (Incidência Anteroposterior - AP)', label: 'Pelve Óssea Panorâmica (Incidência AP)', projecao: 'Decúbito Dorsal / AP Panorâmica' },
      { nome: 'Radiografia de Articulação Coxofemoral / Quadril (Incidências AP e Perfil / Rã)', label: 'Articulação Coxofemoral / Quadril (AP e Perfil / Rã)', projecao: 'AP + Perfil / Posição de Rã (Lauenstein)' },
      { nome: 'Radiografia de Articulações Sacroilíacas (Incidências Oblíquas Bilaterais)', label: 'Articulações Sacroilíacas (Oblíquas)', projecao: 'Oblíquas Direita e Esquerda' },
    ]
  },
  {
    grupo: '3. Radiologia Digital — Coluna Vertebral & Crânio / Face',
    itens: [
      { nome: 'Radiografia de Coluna Cervical (Incidências AP, Perfil e Transoral / Nadador)', label: 'Coluna Cervical (AP, Perfil e Transoral)', projecao: 'AP + Perfil + Transoral' },
      { nome: 'Radiografia de Coluna Torácica / Dorsal (Incidências AP e Perfil)', label: 'Coluna Torácica (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Coluna Lombossacra (Incidências AP, Perfil e Dinâmica)', label: 'Coluna Lombossacra (AP e Perfil)', projecao: 'AP + Perfil com L5-S1' },
      { nome: 'Radiografia de Crânio (Incidências Posteroanterior - PA e Perfil)', label: 'Crânio (PA e Perfil)', projecao: 'PA + Perfil' },
      { nome: 'Radiografia de Seios da Face / Maciço Facial (Incidências de Waters e Caldwell)', label: 'Seios da Face (Incidências de Waters e Caldwell)', projecao: 'Mento-Naso (Waters) + Fronto-Naso (Caldwell)' },
    ]
  },
  {
    grupo: '4. Radiologia Digital — Cintura Escapular & Segmentos do Membro Superior',
    itens: [
      { nome: 'Radiografia de Cintura Escapular & Articulação do Ombro (Incidências AP e Axilar)', label: 'Cintura Escapular & Ombro (AP e Axilar)', projecao: 'AP Verdadeiro + Axilar / Perfil Escapular' },
      { nome: 'Radiografia de Clavícula (Incidências AP e Axial com Angulação Cefálica)', label: 'Clavícula (AP e Axial)', projecao: 'AP + Axial (Angulação de 15-30°)' },
      { nome: 'Radiografia de Braço / Úmero (Incidências AP e Perfil)', label: 'Braço / Úmero (AP e Perfil)', projecao: 'AP + Perfil Incluindo Articulações' },
      { nome: 'Radiografia de Cotovelo & Antebraço (Incidências AP e Perfil)', label: 'Cotovelo & Antebraço (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Punho e Mão / Quirodáctilos (Incidências PA e Oblíqua)', label: 'Punho e Mão (PA e Oblíqua)', projecao: 'PA + Oblíqua / Perfil' },
    ]
  },
  {
    grupo: '5. Radiologia Digital — Segmentos do Membro Inferior',
    itens: [
      { nome: 'Radiografia de Coxa / Fêmur (Incidências AP e Perfil)', label: 'Coxa / Fêmur (AP e Perfil)', projecao: 'AP + Perfil Incluindo Joelho ou Quadril' },
      { nome: 'Radiografia de Articulação do Joelho (Incidências AP e Perfil com Carga)', label: 'Joelho (AP e Perfil com Carga)', projecao: 'AP + Perfil (Bilateral se Indicado)' },
      { nome: 'Radiografia de Perna / Tíbia e Fíbula (Incidências AP e Perfil)', label: 'Perna / Tíbia e Fíbula (AP e Perfil)', projecao: 'AP + Perfil Incluindo Articulações' },
      { nome: 'Radiografia de Articulação do Tornozelo e Pé / Pododáctilos (Incidências AP, Perfil e Oblíqua)', label: 'Tornozelo e Pé (AP, Perfil e Oblíqua)', projecao: 'AP + Perfil + Oblíqua (Mortise)' },
    ]
  }
];

const EXAMES_ECG_CATALOGO = [
  {
    grupo: 'Eletrocardiografia Clínica & Derivações Especiais',
    itens: [
      { nome: 'Eletrocardiograma Convencional de 12 Derivações com Registro Contínuo em DII Longo', label: 'Eletrocardiograma Convencional de 12 Derivações com Registro Contínuo em DII Longo', projecao: '12 Derivações Simultâneas + DII Longo', padrao: true },
      { nome: 'Eletrocardiograma com Derivações Direitas e Posteriores (V3R, V4R, V7, V8 e V9)', label: 'Eletrocardiograma com Derivações Direitas e Posteriores (V3R, V4R, V7, V8 e V9)', projecao: 'Derivações Especiais Direitas e Dorsais' },
      { nome: 'Eletrocardiograma Seriado para Protocolo de Síndrome Coronariana Aguda (SCA)', label: 'Eletrocardiograma Seriado (Protocolo de Dor Torácica / SCA)', projecao: 'Traçados Seriados de 15/30 min' },
      { nome: 'Monitorização Eletrocardiográfica Contínua em Sala de Emergência', label: 'Monitorização Eletrocardiográfica Contínua / Ritmo', projecao: 'Derivação Contínua de Ritmo em Monitor Multiparamétrico' },
    ]
  }
];

// Configuração por modalidade — espelha literalmente as seções e opções do
// mockup (Dados do Pedido → Grade de Exames/Procedimento → Justificativa),
// em vez de um bloco genérico compartilhado entre as 4 guias.
const MODALIDADE_CONFIG = {
  lab: {
    titulo: 'Requisição de Exames Laboratoriais (Laboratório Interno)',
    subtitulo: 'Documento exclusivo para o posto de análises clínicas da UPA 24h Breves · Modelo 19',
    icon: 'ph ph-flask',
    tituloDados: 'Dados da Coleta Laboratorial',
    prioridadeOpcoes: [['urgencia', 'Urgência / Emergência'], ['rotina', 'Rotina de Enfermaria']],
    tituloJustificativa: 'Justificativa Clínica / Hipótese Diagnóstica (Laboratório)',
    labelJustificativa: 'Justificativa Clínica / Hipótese Diagnóstica',
  },
  img: {
    titulo: 'Requisição de Imagem & Radiologia (Setor Interno)',
    subtitulo: 'Documento exclusivo para o setor de Radiologia Digital da UPA 24h Breves · Modelo 20',
    icon: 'ph ph-scan',
    tituloDados: 'Dados do Atendimento Radiológico',
    prioridadeOpcoes: [['urgencia', 'Urgência / Emergência'], ['eletivo', 'Eletivo Interno']],
    tituloJustificativa: 'Indicação Clínica & Alertas para o Técnico em Radiologia',
    labelJustificativa: 'Suspeita Diagnóstica / Justificativa',
  },
  ecg: {
    titulo: 'Requisição de Eletrocardiograma — ECG (Métodos Gráficos)',
    subtitulo: 'Documento exclusivo para o setor de eletrocardiografia e emergência da UPA 24h Breves · Modelo 21',
    icon: 'ph ph-heartbeat',
    tituloDados: 'Dados da Solicitação de Eletrocardiograma (ECG)',
    prioridadeOpcoes: [['urgencia', 'Urgência / Emergência (Imediato)'], ['rotina', 'Rotina de Acompanhamento']],
    tituloJustificativa: 'Indicação Clínica & Hipótese Diagnóstica (ECG)',
    labelJustificativa: 'Suspeita Diagnóstica / Justificativa Cardiológica',
  },
  apac: {
    titulo: 'Laudo APAC — Procedimento Ambulatorial (Regulação SUS)',
    subtitulo: 'Documento oficial do SUS idêntico ao modelo físico (Campos 1 a 52) · Modelo 18',
    icon: 'ph ph-file-text',
  },
};

const MOBILIDADE_OPCOES = [
  ['maca', 'Maca / Leito (Sem deambulação)'],
  ['cadeira', 'Cadeira de Rodas'],
  ['deambulando', 'Deambulando com auxílio'],
];

const APAC_VAZIA = {
  procedimento_codigo: '',
  procedimento_nome: '',
  quantidade: '1',
  descricao_diagnostico: '',
  cid_principal: '',
  cid_secundario: '',
  justificativa: '',
};

export default function AbaExames({ atendimento, medicoId, medicoNome, medicoCrm, onFechar }) {
  const [modalidade, setModalidade] = useState('lab'); // 'lab' | 'img' | 'ecg' | 'apac'
  const [labSelecionados, setLabSelecionados] = useState(() => {
    const init = {};
    EXAMES_LAB_CATALOGO.forEach(g => g.itens.forEach(it => { if (it.padrao) init[it.nome] = true; }));
    return init;
  });
  const [imgSelecionados, setImgSelecionados] = useState(() => {
    const init = {};
    EXAMES_IMG_CATALOGO.forEach(g => g.itens.forEach(it => { if (it.padrao) init[it.nome] = true; }));
    return init;
  });
  const [ecgSelecionados, setEcgSelecionados] = useState(() => {
    const init = {};
    EXAMES_ECG_CATALOGO.forEach(g => g.itens.forEach(it => { if (it.padrao) init[it.nome] = true; }));
    return init;
  });

  const [labJustificativa, setLabJustificativa] = useState(
    'Paciente admitido na Sala Amarela em vigilância clínica intensiva com dor abdominal em flancos, oligúria e instabilidade metabólica. Suspeita clínica de Insuficiência Renal Aguda (CID N17.9) com distúrbio hidroeletrolítico e ácido-básico. Exames solicitados em caráter de URGÊNCIA para definição de conduta imediata.'
  );
  const [imgJustificativa, setImgJustificativa] = useState(
    'Paciente admitido com quadro agudo de dor abdominal difusa com defesa e parada de eliminação de gases, associado a oligúria e instabilidade. Exames solicitados em caráter de URGÊNCIA para descartar pneumoperitônio, níveis hidroaéreos patológicos e repercussão cardiorrespiratória via Radiografia de Tórax e Rotina de Abdome Agudo.'
  );
  const [ecgJustificativa, setEcgJustificativa] = useState(
    'Paciente admitido na Sala Amarela em vigilância clínica intensiva com dor torácica/abdominal e instabilidade metabólica. Exame solicitado com caráter de URGÊNCIA para rastreio de alterações na repolarização ventricular, sobrecarga de câmaras e arritmias secundárias a desequilíbrio eletrolítico.'
  );
  const [radioprotecao, setRadioprotecao] = useState('');
  const [orientacoesEcg, setOrientacoesEcg] = useState('');

  const [prioridade, setPrioridade] = useState({ lab: 'urgencia', img: 'urgencia', ecg: 'urgencia' });
  const [mobilidade, setMobilidade] = useState('maca');
  const [localEcg, setLocalEcg] = useState('leito');
  const [apacDados, setApacDados] = useState(APAC_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [cabecalho, setCabecalho] = useState(null);

  useEffect(() => {
    listarExames(atendimento.atendimento_id).then(setHistorico);
    buscarCabecalhoImpressao(atendimento.atendimento_id).then(setCabecalho).catch(() => {});
  }, [atendimento.atendimento_id]);

  const countLab = Object.values(labSelecionados).filter(Boolean).length;
  const countImg = Object.values(imgSelecionados).filter(Boolean).length;
  const countEcg = Object.values(ecgSelecionados).filter(Boolean).length;
  const countApac = apacDados.procedimento_nome.trim() ? 1 : 0;

  const localLeito = cabecalho?.setorNome && cabecalho?.leitoNumero
    ? `Beira do Leito (Sala ${cabecalho.setorNome} ${cabecalho.leitoNumero})`
    : 'Beira do Leito (Sala/Leito do paciente)';
  const medicoSolicitante = medicoNome ? `${medicoNome}${medicoCrm ? ` — CRM ${medicoCrm}` : ''}` : 'Médico Solicitante';
  const dataHoraSolicitacao = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const dataSolicitacaoIso = new Date().toISOString().slice(0, 10);

  function setApacCampo(campo, valor) {
    setApacDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function toggleLab(nome) {
    setLabSelecionados(prev => ({ ...prev, [nome]: !prev[nome] }));
  }
  function toggleImg(nome) {
    setImgSelecionados(prev => ({ ...prev, [nome]: !prev[nome] }));
  }
  function toggleEcg(nome) {
    setEcgSelecionados(prev => ({ ...prev, [nome]: !prev[nome] }));
  }

  // Protocolos Rápidos — marcam de fato os exames/campos correspondentes
  // (nunca preenchem diagnóstico/motivo com dado fabricado do paciente,
  // apenas os itens de catálogo e, no caso de APAC, o procedimento/CID
  // de um exemplo oficial que o médico ainda revisa antes de salvar).
  function aplicarProtocolo(tipo) {
    if (tipo === 'sepse') {
      setModalidade('lab');
      const sepsisMatch = ['Hemograma', 'Tipagem', 'Coagulograma', 'Ureia', 'Creatinina', 'Sódio', 'Potássio', 'Glicemia', 'Lactato', 'Gasometria Arterial', 'Troponina', 'Proteína C-Reativa', 'EAS'];
      const novo = {};
      EXAMES_LAB_CATALOGO.forEach(g => g.itens.forEach(it => {
        if (sepsisMatch.some(m => it.nome.includes(m))) novo[it.nome] = true;
      }));
      setLabSelecionados(novo);
      alert('Protocolo Sepse / IRA aplicado com sucesso (exames essenciais marcados)!');
    } else if (tipo === 'abdome') {
      setModalidade('img');
      const abdomeMatch = ['Tórax (Incidências Posteroanterior', 'Rotina Radiológica de Abdome'];
      const novo = {};
      EXAMES_IMG_CATALOGO.forEach(g => g.itens.forEach(it => {
        if (abdomeMatch.some(m => it.nome.includes(m))) novo[it.nome] = true;
      }));
      setImgSelecionados(novo);
      alert('Protocolo Abdome Agudo aplicado (Tórax PA/Perfil + Rotina Abdome Agudo)!');
    } else if (tipo === 'ecg_urgencia') {
      setModalidade('ecg');
      const novo = { [EXAMES_ECG_CATALOGO[0].itens[0].nome]: true };
      setEcgSelecionados(novo);
      alert('Protocolo ECG Urgência aplicado (12 Derivações com DII longo marcado)!');
    } else if (tipo === 'apac_usg') {
      setModalidade('apac');
      setApacDados((prev) => ({
        ...prev,
        procedimento_codigo: '02.05.02.004-6',
        procedimento_nome: 'ULTRASSONOGRAFIA DE ABDOME TOTAL',
        quantidade: '1',
      }));
      alert('Modelo de procedimento preenchido (USG de Abdome Total) — revise diagnóstico, CID e justificativa antes de salvar.');
    }
  }

  function limparModalidadeAtiva() {
    if (!confirm('Limpar as seleções desta modalidade?')) return;
    if (modalidade === 'lab') setLabSelecionados({});
    else if (modalidade === 'img') setImgSelecionados({});
    else if (modalidade === 'ecg') setEcgSelecionados({});
    else if (modalidade === 'apac') setApacDados(APAC_VAZIA);
  }

  async function salvar(imprimir = true) {
    setSalvando(true);
    try {
      if (modalidade === 'lab') {
        const itens = [];
        EXAMES_LAB_CATALOGO.forEach(g => g.itens.forEach(it => {
          if (labSelecionados[it.nome]) {
            itens.push({ grupo: g.grupo, nome: it.nome, amostra: it.amostra });
          }
        }));

        if (itens.length === 0) {
          alert('Atenção: Selecione ao menos um exame laboratorial.');
          setSalvando(false);
          return;
        }

        await criarExame({
          atendimentoId: atendimento.atendimento_id,
          nome: `Requisição Laboratorial (${itens.length} exames)`,
          preparo: prioridade.lab === 'urgencia' ? 'Urgência' : 'Rotina',
          local: 'Laboratório Interno UPA 24h',
        });

        localStorage.setItem('requisicao_lab_selecionados', JSON.stringify(itens));
        localStorage.setItem('requisicao_lab_justificativa', labJustificativa);
        if (imprimir) window.open('./modelos_impressao_html/19-solicitacao-exames-laboratoriais.html', '_blank');

      } else if (modalidade === 'img') {
        const itens = [];
        EXAMES_IMG_CATALOGO.forEach(g => g.itens.forEach(it => {
          if (imgSelecionados[it.nome]) {
            itens.push({ grupo: g.grupo, nome: it.nome, projecao: it.projecao });
          }
        }));

        if (itens.length === 0) {
          alert('Atenção: Selecione ao menos um exame radiológico.');
          setSalvando(false);
          return;
        }

        await criarExame({
          atendimentoId: atendimento.atendimento_id,
          nome: `Requisição de Radiologia (${itens.length} exames)`,
          preparo: prioridade.img === 'urgencia' ? 'Urgência' : 'Eletivo',
          local: 'Radiologia Digital UPA 24h',
        });

        localStorage.setItem('requisicao_img_selecionados', JSON.stringify(itens));
        localStorage.setItem('requisicao_img_justificativa', imgJustificativa);
        if (imprimir) window.open('./modelos_impressao_html/20-solicitacao-exames-imagem-rx.html', '_blank');

      } else if (modalidade === 'ecg') {
        const itens = [];
        EXAMES_ECG_CATALOGO.forEach(g => g.itens.forEach(it => {
          if (ecgSelecionados[it.nome]) {
            itens.push({ grupo: g.grupo, nome: it.nome, projecao: it.projecao });
          }
        }));

        if (itens.length === 0) {
          alert('Atenção: Selecione ao menos um procedimento de ECG.');
          setSalvando(false);
          return;
        }

        await criarExame({
          atendimentoId: atendimento.atendimento_id,
          nome: `Requisição de ECG (${itens.length} traçados)`,
          preparo: 'Urgência / Emergência',
          local: 'Métodos Gráficos UPA 24h',
        });

        localStorage.setItem('requisicao_ecg_selecionados', JSON.stringify(itens));
        localStorage.setItem('requisicao_ecg_justificativa', ecgJustificativa);
        if (imprimir) window.open('./modelos_impressao_html/21-solicitacao-eletrocardiograma-ecg.html', '_blank');

      } else if (modalidade === 'apac') {
        if (!apacDados.procedimento_nome.trim() || !apacDados.justificativa.trim()) {
          alert('Atenção: preencha ao menos o procedimento principal e a justificativa clínica da APAC.');
          setSalvando(false);
          return;
        }

        const { error } = await criarApac({
          atendimentoId: atendimento.atendimento_id,
          solicitanteId: medicoId,
          dados: {
            procedimento_nome: apacDados.procedimento_nome,
            procedimento_codigo: apacDados.procedimento_codigo || null,
            quantidade: apacDados.quantidade ? Number(apacDados.quantidade) : 1,
            cid_principal: apacDados.cid_principal || null,
            cid_secundario: apacDados.cid_secundario || null,
            justificativa: apacDados.justificativa,
            campos_formulario: {
              estabelecimento_solicitante_nome: 'UPA 24 HORAS BREVES',
              estabelecimento_solicitante_cnes: '0296796',
              descricao_diagnostico: apacDados.descricao_diagnostico,
              profissional_solicitante_nome: medicoNome || '',
              profissional_crm: medicoCrm || '',
              data_solicitacao: dataSolicitacaoIso,
            },
          },
        });

        if (error) {
          console.error(error);
          alert('Não foi possível registrar a APAC. Verifique os dados e tente novamente.');
          setSalvando(false);
          return;
        }

        localStorage.setItem('requisicao_apac_dados', JSON.stringify(apacDados));
        if (imprimir) window.open('./modelos_impressao_html/18-laudo-apac-procedimento-ambulatorial.html', '_blank');
      }

      setHistorico(await listarExames(atendimento.atendimento_id));
    } catch (e) {
      console.error(e);
      alert('Erro ao emitir requisição.');
    } finally {
      setSalvando(false);
    }
  }

  const cfg = MODALIDADE_CONFIG[modalidade];

  return (
    <div className="clinical-split">
      <aside className="tools-pane">
        <div className="pane-header">
          <span><i className="ph ph-navigation-arrow" /> Modalidade do Pedido</span>
        </div>
        <div className="tools-body">
          <div className="summary-box">
            <h3><i className="ph ph-shield-check" /> Guia Ativa (Bloqueio Mútuo)</h3>
            <div className="modality-nav">
              <button type="button" className={'modality-btn ' + (modalidade === 'lab' ? 'active' : '')} onClick={() => setModalidade('lab')}>
                <span><i className="ph ph-flask" /> 1. Laboratório Interno</span>
                <span className="modality-badge">{countLab} exames</span>
              </button>
              <button type="button" className={'modality-btn ' + (modalidade === 'img' ? 'active' : '')} onClick={() => setModalidade('img')}>
                <span><i className="ph ph-scan" /> 2. Imagem & Radiologia</span>
                <span className="modality-badge">{countImg} exames</span>
              </button>
              <button type="button" className={'modality-btn ' + (modalidade === 'ecg' ? 'active' : '')} onClick={() => setModalidade('ecg')}>
                <span><i className="ph ph-heartbeat" /> 3. Eletrocardiograma (ECG)</span>
                <span className="modality-badge">{countEcg} exame</span>
              </button>
              <button type="button" className={'modality-btn ' + (modalidade === 'apac' ? 'active' : '')} onClick={() => setModalidade('apac')}>
                <span><i className="ph ph-file-text" /> 4. Laudo APAC (Regulação)</span>
                <span className="modality-badge">{countApac} proced.</span>
              </button>
            </div>
            <button type="button" className="btn-cancel" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={limparModalidadeAtiva}>
              <i className="ph ph-trash" /> Limpar Seleção desta Guia
            </button>
          </div>

          <div className="blocking-alert-box">
            <strong><i className="ph ph-lock-key" /> Separação Física Obrigatória</strong>
            O Laboratório de Análises Clínicas, a Radiologia Digital, o Eletrocardiograma (ECG) e a Regulação de APAC são setores/fluxos distintos. Guias mistas são bloqueadas institucionalmente.
          </div>

          <div className="summary-box">
            <h3><i className="ph ph-lightning" /> Protocolos Rápidos de Emergência</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('sepse')}>
                <i className="ph ph-shield-warning" style={{ color: '#d97706' }} /> Combo Sepse / IRA (Lab)
              </button>
              <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('abdome')}>
                <i className="ph ph-scan" style={{ color: '#1d4ed8' }} /> Rotina Abdome Agudo (RX)
              </button>
              <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('ecg_urgencia')}>
                <i className="ph ph-heartbeat" style={{ color: '#dc2626' }} /> Protocolo ECG 12D (ECG)
              </button>
              <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('apac_usg')}>
                <i className="ph ph-file-text" style={{ color: '#059669' }} /> Preencher APAC - USG Total
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="clinical-card">
        <header className="cc-header">
          <div>
            <h2 id="card-main-title"><i className={cfg.icon} /> {cfg.titulo}</h2>
            <span id="card-main-subtitle">{cfg.subtitulo}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Em Aberto · Urgência</span>
        </header>

        <div className="cc-body">
          {/* 1. DADOS DO PEDIDO — por modalidade, com identificação real do atendimento/médico */}
          {(modalidade === 'lab' || modalidade === 'img' || modalidade === 'ecg') && (
            <div className="form-section">
              <div className="form-section-title">
                <span className="st-left"><i className="ph ph-identification-card" /> {cfg.tituloDados}</span>
              </div>
              <div className="grid-4">
                <div className="form-group">
                  <label>Caráter {modalidade === 'lab' ? 'da Coleta' : 'do Exame'}</label>
                  <select className="form-control" value={prioridade[modalidade]} onChange={(e) => setPrioridade(prev => ({ ...prev, [modalidade]: e.target.value }))}>
                    {cfg.prioridadeOpcoes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                {modalidade === 'lab' && (
                  <div className="form-group">
                    <label>Local da Coleta</label>
                    <input type="text" className="form-control" value={localLeito} readOnly />
                  </div>
                )}

                {modalidade === 'img' && (
                  <div className="form-group">
                    <label>Condição de Mobilidade</label>
                    <select className="form-control" value={mobilidade} onChange={(e) => setMobilidade(e.target.value)}>
                      {MOBILIDADE_OPCOES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                )}

                {modalidade === 'ecg' && (
                  <div className="form-group">
                    <label>Local de Realização</label>
                    <select className="form-control" value={localEcg} onChange={(e) => setLocalEcg(e.target.value)}>
                      <option value="leito">{localLeito}</option>
                      <option value="sala_ecg">Sala de Eletrocardiografia / Emergência</option>
                      <option value="vermelha">Sala Vermelha (Emergência Crítica)</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Data/Hora Solicitação</label>
                  <input type="text" className="form-control" value={dataHoraSolicitacao} readOnly />
                </div>
                <div className="form-group">
                  <label>Médico Solicitante</label>
                  <input type="text" className="form-control" value={medicoSolicitante} readOnly />
                </div>
              </div>
            </div>
          )}

          {/* 4ª MODALIDADE: LAUDO APAC — funcional de verdade (salva em apac_solicitacoes) */}
          {modalidade === 'apac' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-section">
                <div className="form-section-title">
                  <span className="st-left"><i className="ph ph-buildings" /> Estabelecimento Solicitante (Campos 1 e 2)</span>
                  <span style={{ fontSize: 11, color: '#1e3a8a', fontWeight: 700 }}>Regulação Externa SUS / SER-PA</span>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>1 - Nome do Estabelecimento de Saúde</label>
                    <input type="text" className="form-control" value="UPA 24 HORAS BREVES" readOnly />
                  </div>
                  <div className="form-group">
                    <label>2 - CNES</label>
                    <input type="text" className="form-control" value="0296796" readOnly />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span className="st-left"><i className="ph ph-list-numbers" /> Procedimento Principal Solicitado (Campos 15, 16 e 17)</span>
                </div>
                <div className="grid-3">
                  <div className="form-group">
                    <label>15 - Código de Procedimento (SIGTAP)</label>
                    <input type="text" className="form-control" placeholder="ex: 02.05.02.004-6" value={apacDados.procedimento_codigo} onChange={(e) => setApacCampo('procedimento_codigo', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label>16 - Nome do Procedimento Principal *</label>
                    <input type="text" className="form-control" placeholder="ex: ULTRASSONOGRAFIA DE ABDOME TOTAL" value={apacDados.procedimento_nome} onChange={(e) => setApacCampo('procedimento_nome', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group">
                    <label>17 - Quantidade</label>
                    <input type="number" min="1" className="form-control" value={apacDados.quantidade} onChange={(e) => setApacCampo('quantidade', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span className="st-left"><i className="ph ph-file-text" /> Justificativa do Procedimento (Campos 33 a 37)</span>
                </div>
                <div className="grid-3" style={{ marginBottom: 10 }}>
                  <div className="form-group">
                    <label>33 - Descrição do Diagnóstico</label>
                    <input type="text" className="form-control" value={apacDados.descricao_diagnostico} onChange={(e) => setApacCampo('descricao_diagnostico', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group">
                    <label>34 - CID-10 Principal</label>
                    <input type="text" className="form-control" placeholder="ex: N17.9" value={apacDados.cid_principal} onChange={(e) => setApacCampo('cid_principal', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group">
                    <label>35 - CID-10 Secundário</label>
                    <input type="text" className="form-control" placeholder="ex: R10.4" value={apacDados.cid_secundario} onChange={(e) => setApacCampo('cid_secundario', e.target.value.toUpperCase())} />
                  </div>
                </div>
                <div className="form-group">
                  <label>37 - Histórico / Justificativa Clínica (Campo Oficial do SUS) *</label>
                  <textarea rows="4" className="form-control-area" placeholder="Descreva o quadro clínico, parâmetros de gravidade e a indicação do procedimento..." value={apacDados.justificativa} onChange={(e) => setApacCampo('justificativa', e.target.value)} />
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span className="st-left"><i className="ph ph-user" /> Solicitação Médica (Campos 38 e 39)</span>
                </div>
                <div className="grid-3">
                  <div className="form-group">
                    <label>38 - Profissional Solicitante</label>
                    <input type="text" className="form-control" value={medicoSolicitante} readOnly />
                  </div>
                  <div className="form-group">
                    <label>39 - Data da Solicitação</label>
                    <input type="text" className="form-control" value={dataHoraSolicitacao.split(',')[0] || dataHoraSolicitacao} readOnly />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Este é um resumo rápido da APAC (campos essenciais). O formulário oficial completo (52 campos, dados do paciente e da autorização) fica na aba "Laudo APAC" do prontuário.
              </p>
            </div>
          )}

          {/* 2. GRADE DE EXAMES/PROCEDIMENTOS */}
          {modalidade === 'lab' && EXAMES_LAB_CATALOGO.map((grupo, idx) => (
            <div className="exam-group-box" key={idx}>
              <div className="exam-group-header">{grupo.grupo}</div>
              <div className="exam-checkbox-grid">
                {grupo.itens.map((it) => {
                  const checked = !!labSelecionados[it.nome]
                  return (
                    <label key={it.nome} className={'exam-check-item ' + (checked ? 'checked' : '')}>
                      <input type="checkbox" checked={checked} onChange={() => toggleLab(it.nome)} />
                      <span><strong>{it.label}</strong> ({it.amostra})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {modalidade === 'img' && EXAMES_IMG_CATALOGO.map((grupo, idx) => (
            <div className="exam-group-box" key={idx}>
              <div className="exam-group-header">{grupo.grupo}</div>
              <div className="exam-checkbox-grid">
                {grupo.itens.map((it) => {
                  const checked = !!imgSelecionados[it.nome]
                  return (
                    <label key={it.nome} className={'exam-check-item ' + (checked ? 'checked' : '')}>
                      <input type="checkbox" checked={checked} onChange={() => toggleImg(it.nome)} />
                      <span><strong>{it.label}</strong> ({it.projecao})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {modalidade === 'ecg' && EXAMES_ECG_CATALOGO.map((grupo, idx) => (
            <div className="exam-group-box" key={idx}>
              <div className="exam-group-header">{grupo.grupo}</div>
              <div className="exam-checkbox-grid">
                {grupo.itens.map((it) => {
                  const checked = !!ecgSelecionados[it.nome]
                  return (
                    <label key={it.nome} className={'exam-check-item ' + (checked ? 'checked' : '')}>
                      <input type="checkbox" checked={checked} onChange={() => toggleEcg(it.nome)} />
                      <span><strong>{it.label}</strong> ({it.projecao})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 3. JUSTIFICATIVA CLÍNICA (por último, como no mockup) — não se aplica à APAC, que já tem a sua própria seção 33-37 acima */}
          {(modalidade === 'lab' || modalidade === 'img' || modalidade === 'ecg') && (
            <div className="form-section">
              <div className="form-section-title">
                <span className="st-left"><i className="ph ph-chat-text" /> {cfg.tituloJustificativa}</span>
              </div>
              <div className="form-group" style={{ marginBottom: modalidade === 'lab' ? 0 : 8 }}>
                <label>{cfg.labelJustificativa}</label>
                {modalidade === 'lab' && <textarea className="form-control-area" rows="3" value={labJustificativa} onChange={e => setLabJustificativa(e.target.value)} />}
                {modalidade === 'img' && <textarea className="form-control-area" rows="3" value={imgJustificativa} onChange={e => setImgJustificativa(e.target.value)} />}
                {modalidade === 'ecg' && <textarea className="form-control-area" rows="3" value={ecgJustificativa} onChange={e => setEcgJustificativa(e.target.value)} />}
              </div>
              {modalidade === 'img' && (
                <div className="form-group">
                  <label>Recomendações Especiais de Radioproteção</label>
                  <input type="text" className="form-control" placeholder="Ex: colimação estrita e proteção gonadal/plumbífera quando indicado..." value={radioprotecao} onChange={(e) => setRadioprotecao(e.target.value)} />
                </div>
              )}
              {modalidade === 'ecg' && (
                <div className="form-group">
                  <label>Orientações ao Técnico / Enfermagem</label>
                  <input type="text" className="form-control" placeholder="Ex: realizar o traçado em repouso absoluto, anexar fita ao prontuário..." value={orientacoesEcg} onChange={(e) => setOrientacoesEcg(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* HISTÓRICO RÁPIDO (Lab/Imagem/ECG) */}
          {(modalidade === 'lab' || modalidade === 'img' || modalidade === 'ecg') && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 13, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
                <i className="ph ph-clock-counter-clockwise" /> Histórico de Solicitações (Este Atendimento)
              </h3>
              {historico.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma solicitação ainda.</p>
              ) : historico.map((h) => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 12 }}>
                  <div>
                    <strong>{h.nome_exame}</strong> <span style={{ color: 'var(--text-muted)' }}>— {h.preparo}</span>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Solicitado por: {h.enfermeiros?.nome_exibicao || h.enfermeiros?.nome} • {new Date(h.criado_em).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cc-footer">
          <button type="button" className="btn-cancel" onClick={onFechar}>
            <i className="ph ph-x-circle" /> Cancelar
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
