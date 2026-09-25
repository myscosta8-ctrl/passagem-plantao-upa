import { useEffect, useState } from 'react';
import { listarExames, criarExame } from '../../lib/pepMedico';

// ==========================================
// CATÁLOGO COMPLETO FIEL AO MOCKUP FASE 2
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
      { nome: 'Radiografia de Tórax no Leito (Incidência Anteroposterior - AP)', label: 'Tórax no Leito (AP)', projecao: 'Decúbito Dorsal no Leito' },
      { nome: 'Rotina Radiológica de Abdome Agudo Completa (Tórax PA em Cúpulas Frênicas + Abdome em Ortostase e Decúbito Dorsal)', label: 'Rotina Radiológica de Abdome Agudo', projecao: 'Ortostático + Decúbito Dorsal', padrao: true },
      { nome: 'Radiografia Simples de Abdome (Incidência Anteroposterior - AP em Decúbito Dorsal)', label: 'Abdome Simples (AP em Decúbito)', projecao: 'Decúbito Dorsal' },
    ]
  },
  {
    grupo: '2. Radiologia Digital — Pelve Óssea & Articulação Coxofemoral',
    itens: [
      { nome: 'Radiografia de Bacia / Pelve Panorâmica (Incidência Anteroposterior - AP)', label: 'Bacia / Pelve Panorâmica (AP)', projecao: 'Decúbito Dorsal / AP' },
      { nome: 'Radiografia de Articulação Coxofemoral / Quadril (Incidências AP e Lowenstein/Rã)', label: 'Articulação Coxofemoral / Quadril (AP e Rã)', projecao: 'AP + Lowenstein' },
    ]
  },
  {
    grupo: '3. Radiologia Digital — Esqueleto Axial, Coluna Vertebral & Crânio',
    itens: [
      { nome: 'Radiografia de Coluna Cervical (Incidências AP, Perfil e Transoral para Odontoide)', label: 'Coluna Cervical (AP, Perfil e Transoral)', projecao: 'AP + Perfil + Transoral' },
      { nome: 'Radiografia de Coluna Torácica / Dorsal (Incidências AP e Perfil)', label: 'Coluna Torácica (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Coluna Lombossacra (Incidências AP e Perfil com Estudo de Transição L5-S1)', label: 'Coluna Lombossacra (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Crânio (Incidências Posteroanterior - PA e Perfil)', label: 'Crânio (PA e Perfil)', projecao: 'PA + Perfil' },
      { nome: 'Radiografia de Seios da Face / Maciço Facial (Incidências de Waters e Caldwell)', label: 'Seios da Face (Incidências de Waters e Caldwell)', projecao: 'Mento-Naso + Fronto-Naso' },
    ]
  },
  {
    grupo: '4. Radiologia Digital — Cintura Escapular & Membro Superior',
    itens: [
      { nome: 'Radiografia de Cintura Escapular & Articulação do Ombro (Incidências AP e Axilar)', label: 'Cintura Escapular & Ombro (AP e Axilar)', projecao: 'AP + Axilar' },
      { nome: 'Radiografia de Clavícula (Incidências AP e Axial com Angulação Cefálica)', label: 'Clavícula (AP e Axial)', projecao: 'AP + Axial' },
      { nome: 'Radiografia de Braço / Úmero (Incidências AP e Perfil)', label: 'Braço / Úmero (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Cotovelo & Antebraço (Incidências AP e Perfil)', label: 'Cotovelo & Antebraço (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Punho e Mão / Quirodáctilos (Incidências PA e Oblíqua)', label: 'Punho e Mão (PA e Oblíqua)', projecao: 'PA + Oblíqua' },
    ]
  },
  {
    grupo: '5. Radiologia Digital — Segmentos do Membro Inferior',
    itens: [
      { nome: 'Radiografia de Coxa / Fêmur (Incidências AP e Perfil)', label: 'Coxa / Fêmur (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Articulação do Joelho (Incidências AP e Perfil com Carga)', label: 'Joelho (AP e Perfil com Carga)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Perna / Tíbia e Fíbula (Incidências AP e Perfil)', label: 'Perna / Tíbia e Fíbula (AP e Perfil)', projecao: 'AP + Perfil' },
      { nome: 'Radiografia de Articulação do Tornozelo e Pé / Pododáctilos (Incidências AP, Perfil e Oblíqua)', label: 'Tornozelo e Pé (AP, Perfil e Oblíqua)', projecao: 'AP + Perfil + Mortise' },
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
      { nome: 'Monitorização Eletrocardiográfica Contínua em Sala de Emergência', label: 'Monitorização Eletrocardiográfica Contínua / Ritmo', projecao: 'Derivação Contínua em Monitor' },
    ]
  }
];

export default function AbaExames({ atendimento }) {
  const [modalidade, setModalidade] = useState('lab'); // 'lab' | 'img' | 'ecg'
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

  const [prioridade, setPrioridade] = useState('urgencia');
  const [transporte, setTransporte] = useState('maca');
  const [salvando, setSalvando] = useState(false);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    listarExames(atendimento.atendimento_id).then(setHistorico);
  }, [atendimento.atendimento_id]);

  const countLab = Object.values(labSelecionados).filter(Boolean).length;
  const countImg = Object.values(imgSelecionados).filter(Boolean).length;
  const countEcg = Object.values(ecgSelecionados).filter(Boolean).length;

  function toggleLab(nome) {
    setLabSelecionados(prev => ({ ...prev, [nome]: !prev[nome] }));
  }
  function toggleImg(nome) {
    setImgSelecionados(prev => ({ ...prev, [nome]: !prev[nome] }));
  }
  function toggleEcg(nome) {
    setEcgSelecionados(prev => ({ ...prev, [nome]: !prev[nome] }));
  }

  // Protocolos Rápidos
  function aplicarCombo(tipo) {
    if (tipo === 'sepse') {
      setModalidade('lab');
      const sepsisMatch = ['Hemograma', 'Tipagem', 'Coagulograma', 'Ureia', 'Creatinina', 'Sódio', 'Potássio', 'Glicemia', 'Lactato', 'Gasometria Arterial', 'Troponina', 'Proteína C-Reativa', 'EAS'];
      const novo = {};
      EXAMES_LAB_CATALOGO.forEach(g => g.itens.forEach(it => {
        if (sepsisMatch.some(m => it.nome.includes(m))) novo[it.nome] = true;
      }));
      setLabSelecionados(novo);
      alert('Protocolo Sepse / IRA aplicado com sucesso (Exames essenciais marcados)!');
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
    }
  }

  async function salvarEImprimir() {
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

        // Salva histórico no banco
        await criarExame({
          atendimentoId: atendimento.atendimento_id,
          nome: `Requisição Laboratorial (${itens.length} exames)`,
          preparo: prioridade === 'urgencia' ? 'Urgência' : 'Rotina',
          local: 'Laboratório Interno UPA 24h',
        });

        localStorage.setItem('requisicao_lab_selecionados', JSON.stringify(itens));
        localStorage.setItem('requisicao_lab_justificativa', labJustificativa);
        window.open('./modelos_impressao_html/19-solicitacao-exames-laboratoriais.html', '_blank');

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
          preparo: prioridade === 'urgencia' ? 'Urgência' : 'Eletivo',
          local: 'Radiologia Digital UPA 24h',
        });

        localStorage.setItem('requisicao_img_selecionados', JSON.stringify(itens));
        localStorage.setItem('requisicao_img_justificativa', imgJustificativa);
        window.open('./modelos_impressao_html/20-solicitacao-exames-imagem-rx.html', '_blank');

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
        window.open('./modelos_impressao_html/21-solicitacao-eletrocardiograma-ecg.html', '_blank');
      }

      setHistorico(await listarExames(atendimento.atendimento_id));
    } catch (e) {
      console.error(e);
      alert('Erro ao emitir requisição.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="clinical-split">
      {/* SIDEBAR DE MODALIDADES */}
      <aside className="tools-pane">
        <div className="pane-header">
          <span><i className="ph ph-list-dashes" /> Modalidades</span>
        </div>
        <div className="tools-body">
          <div className="summary-box">
            <h3><i className="ph ph-funnel" /> Selecione o Formulário</h3>
            <div className="modality-nav">
              <button type="button" className={`modality-btn ${modalidade === 'lab' ? 'active' : ''}`} onClick={() => setModalidade('lab')}>
                <span><i className="ph ph-flask" /> 1. Laboratório Interno</span>
                <span className="modality-badge">{countLab} exames</span>
              </button>
              <button type="button" className={`modality-btn ${modalidade === 'img' ? 'active' : ''}`} onClick={() => setModalidade('img')}>
                <span><i className="ph ph-scan" /> 2. Imagem & Radiologia</span>
                <span className="modality-badge">{countImg} exames</span>
              </button>
              <button type="button" className={`modality-btn ${modalidade === 'ecg' ? 'active' : ''}`} onClick={() => setModalidade('ecg')}>
                <span><i className="ph ph-heartbeat" /> 3. Eletrocardiograma</span>
                <span className="modality-badge">{countEcg} traçado</span>
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
              Atalhos Rápidos de Marcação (Bundles Clínicos):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button type="button" className="template-btn" onClick={() => aplicarCombo('sepse')}>
                <div><strong><i className="ph ph-virus" /> Sepse / Choque</strong></div>
              </button>
              <button type="button" className="template-btn" onClick={() => aplicarCombo('abdome')}>
                <div><strong><i className="ph ph-warning" /> Abdome Agudo</strong></div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="clinical-card" style={{ flex: 1 }}>
        <div className="cc-header">
          <div className="cc-title-area">
            <h2>
              {modalidade === 'lab' && <><i className="ph ph-flask" /> Solicitação de Exames Laboratoriais</>}
              {modalidade === 'img' && <><i className="ph ph-x-ray" /> Solicitação de Imagem / Radiografia</>}
              {modalidade === 'ecg' && <><i className="ph ph-heartbeat" /> Eletrocardiograma (ECG)</>}
            </h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Apenas exames essenciais para manejo da emergência.
            </span>
          </div>
        </div>

        <div className="cc-body">
          {/* JUSTIFICATIVA CLINICA GERAL E INFORMAÇÕES ADICIONAIS */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="st-left"><i className="ph ph-file-text" /> 1. Contexto e Justificativa Clínica</span>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Justificativa Clínica / Hipótese Diagnóstica</label>
              {modalidade === 'lab' && <textarea className="form-control-area" rows="3" value={labJustificativa} onChange={e => setLabJustificativa(e.target.value)} />}
              {modalidade === 'img' && <textarea className="form-control-area" rows="3" value={imgJustificativa} onChange={e => setImgJustificativa(e.target.value)} />}
              {modalidade === 'ecg' && <textarea className="form-control-area" rows="3" value={ecgJustificativa} onChange={e => setEcgJustificativa(e.target.value)} />}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Caráter de Solicitação</label>
                <select className="form-control" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                  <option value="urgencia">Urgência / Emergência (Imediato)</option>
                  <option value="rotina">Rotina de Enfermaria (Manhã seguinte)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Condição de Transporte do Paciente</label>
                <select className="form-control" value={transporte} onChange={e => setTransporte(e.target.value)}>
                  <option value="maca">Transporte em Maca (Instável / Risco de Queda)</option>
                  <option value="cadeira">Cadeira de Rodas</option>
                  <option value="ambulante">Ambulante (Deambulando)</option>
                  <option value="leito">Exame no Leito (Leito de Estabilização)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CATALOGO LABORATÓRIO */}
          {modalidade === 'lab' && EXAMES_LAB_CATALOGO.map((grupo, idx) => (
            <div className="form-section" key={idx}>
              <div className="form-section-title">
                <span className="st-left"><i className="ph ph-test-tube" /> {grupo.grupo}</span>
              </div>
              <div className="grid-2">
                {grupo.itens.map((it) => {
                  const checked = !!labSelecionados[it.nome]
                  return (
                    <label key={it.nome} className="check-item" style={{ borderColor: checked ? 'var(--primary)' : 'var(--border-light)' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleLab(it.nome)} />
                      <div>
                        <strong>{it.label}</strong>
                        <span>{it.amostra}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* CATALOGO IMAGEM */}
          {modalidade === 'img' && EXAMES_IMG_CATALOGO.map((grupo, idx) => (
            <div className="form-section" key={idx}>
              <div className="form-section-title">
                <span className="st-left"><i className="ph ph-scan" /> {grupo.grupo}</span>
              </div>
              <div className="grid-2">
                {grupo.itens.map((it) => {
                  const checked = !!imgSelecionados[it.nome]
                  return (
                    <label key={it.nome} className="check-item" style={{ borderColor: checked ? 'var(--primary)' : 'var(--border-light)' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleImg(it.nome)} />
                      <div>
                        <strong>{it.label}</strong>
                        <span>{it.projecao}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* CATALOGO ECG */}
          {modalidade === 'ecg' && EXAMES_ECG_CATALOGO.map((grupo, idx) => (
            <div className="form-section" key={idx}>
              <div className="form-section-title">
                <span className="st-left"><i className="ph ph-heartbeat" /> {grupo.grupo}</span>
              </div>
              <div className="grid-2">
                {grupo.itens.map((it) => {
                  const checked = !!ecgSelecionados[it.nome]
                  return (
                    <label key={it.nome} className="check-item" style={{ borderColor: checked ? 'var(--primary)' : 'var(--border-light)' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleEcg(it.nome)} />
                      <div>
                        <strong>{it.label}</strong>
                        <span>{it.projecao}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* HISTÓRICO RÁPIDO */}
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

        </div>

        <div className="cc-footer">
          <span />
          <button type="button" className="btn-save-print" onClick={salvarEImprimir} disabled={salvando}>
            <i className="ph ph-printer" /> {salvando ? 'Emitindo...' : 'Salvar e Imprimir Requisição (' + (modalidade === 'lab' ? countLab : modalidade === 'img' ? countImg : countEcg) + ' itens)'}
          </button>
        </div>
      </div>
    </div>
  )
}
