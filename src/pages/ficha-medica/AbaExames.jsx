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
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-flask" /> Solicitação de Exames</h2>
        </div>
      </div>

      <div className="cc-body">
        {/* SELETOR DE MODALIDADE (COM BLOQUEIO MÚTUO RIGOROSO) */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className={`btn-add-chip ${modalidade === 'lab' ? 'on' : ''}`} onClick={() => setModalidade('lab')}>
            <i className="ph ph-flask" /> 1. Laboratório Interno
            <span style={{ background: 'rgba(0,0,0,0.12)', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{countLab}</span>
          </button>
          <button type="button" className={`btn-add-chip ${modalidade === 'img' ? 'on' : ''}`} onClick={() => setModalidade('img')}>
            <i className="ph ph-x-ray" /> 2. Imagem & Radiologia (RX)
            <span style={{ background: 'rgba(0,0,0,0.12)', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{countImg}</span>
          </button>
          <button type="button" className={`btn-add-chip ${modalidade === 'ecg' ? 'on' : ''}`} onClick={() => setModalidade('ecg')}>
            <i className="ph ph-heartbeat" /> 3. Eletrocardiograma (ECG)
            <span style={{ background: 'rgba(0,0,0,0.12)', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{countEcg}</span>
          </button>
        </div>

        {/* BLOQUEIO INSTITUCIONAL MÚTUO */}
        <div className="allergy-alert" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="info" style={{ color: '#92400E' }}>
            <i className="ph ph-warning" /> <strong>Regra Institucional de Separação Física:</strong> Laboratório de Análises Clínicas, Radiologia Digital e ECG são setores distintos. Guias mistas são bloqueadas institucionalmente — cada setor recebe sua requisição oficial exclusiva.
          </div>
        </div>

        {/* PROTOCOLOS RÁPIDOS */}
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-lightning" /> Protocolos Rápidos de Emergência (Preenchimento Automático)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn-add-chip" onClick={() => aplicarCombo('sepse')}>
              <i className="ph ph-shield-warning" /> Combo Sepse / IRA (Laboratório)
            </button>
            <button type="button" className="btn-add-chip" onClick={() => aplicarCombo('abdome')}>
              <i className="ph ph-magnifying-glass" /> Rotina Abdome Agudo (Radiologia)
            </button>
            <button type="button" className="btn-add-chip" onClick={() => aplicarCombo('ecg_urgencia')}>
              <i className="ph ph-heart-straight" /> Protocolo ECG 12D (Métodos Gráficos)
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUB-ABA 1: LABORATÓRIO INTERNO */}
        {/* ======================================================== */}
        {modalidade === 'lab' && (
          <>
            <div className="assess-grid">
              <div className="form-group">
                <label>Caráter da Coleta</label>
                <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="urgencia">Urgência / Emergência (Imediata)</option>
                  <option value="rotina">Rotina de Enfermaria</option>
                </select>
              </div>
              <div className="form-group">
                <label>Local de Coleta</label>
                <input type="text" value={`Leito ${atendimento.leito_numero || '—'} · Posto Interno`} readOnly />
              </div>
            </div>

            {EXAMES_LAB_CATALOGO.map((grupo) => (
              <div key={grupo.grupo} className="form-section-box">
                <div className="form-section-box-title">{grupo.grupo}</div>
                <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px 16px' }}>
                  {grupo.itens.map((it) => (
                    <label key={it.nome} className="checkbox-item">
                      <input type="checkbox" checked={!!labSelecionados[it.nome]} onChange={() => toggleLab(it.nome)} /> {it.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="form-group">
              <label>Justificativa Clínica / Hipótese Diagnóstica (Laboratório) *</label>
              <textarea value={labJustificativa} onChange={(e) => setLabJustificativa(e.target.value)} />
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* SUB-ABA 2: RADIOLOGIA DIGITAL (RX) */}
        {/* ======================================================== */}
        {modalidade === 'img' && (
          <>
            <div className="assess-grid">
              <div className="form-group">
                <label>Caráter do Exame</label>
                <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="urgencia">Urgência / Emergência</option>
                  <option value="eletivo">Eletivo Interno</option>
                </select>
              </div>
              <div className="form-group">
                <label>Condição de Mobilidade / Transporte</label>
                <select value={transporte} onChange={(e) => setTransporte(e.target.value)}>
                  <option value="maca">Maca / Leito (Sem deambulação)</option>
                  <option value="cadeira">Cadeira de Rodas</option>
                  <option value="deambulando">Deambulando com auxílio</option>
                </select>
              </div>
            </div>

            {EXAMES_IMG_CATALOGO.map((grupo) => (
              <div key={grupo.grupo} className="form-section-box">
                <div className="form-section-box-title">{grupo.grupo}</div>
                <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px 16px' }}>
                  {grupo.itens.map((it) => (
                    <label key={it.nome} className="checkbox-item">
                      <input type="checkbox" checked={!!imgSelecionados[it.nome]} onChange={() => toggleImg(it.nome)} /> {it.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="form-group">
              <label>Indicação Clínica & Alertas para o Técnico em Radiologia (CRTR) *</label>
              <textarea value={imgJustificativa} onChange={(e) => setImgJustificativa(e.target.value)} />
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* SUB-ABA 3: ELETROCARDIOGRAMA (ECG) */}
        {/* ======================================================== */}
        {modalidade === 'ecg' && (
          <>
            <div className="assess-grid">
              <div className="form-group">
                <label>Caráter do Exame</label>
                <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="urgencia">Urgência / Emergência (Imediato)</option>
                  <option value="rotina">Rotina de Acompanhamento</option>
                </select>
              </div>
              <div className="form-group">
                <label>Local de Realização</label>
                <select defaultValue="leito">
                  <option value="leito">Beira do Leito (Sala Amarela)</option>
                  <option value="sala_ecg">Sala de ECG / Métodos Gráficos</option>
                  <option value="sala_vermelha">Sala Vermelha (Emergência Crítica)</option>
                </select>
              </div>
            </div>

            {EXAMES_ECG_CATALOGO.map((grupo) => (
              <div key={grupo.grupo} className="form-section-box">
                <div className="form-section-box-title">{grupo.grupo}</div>
                <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px 16px' }}>
                  {grupo.itens.map((it) => (
                    <label key={it.nome} className="checkbox-item">
                      <input type="checkbox" checked={!!ecgSelecionados[it.nome]} onChange={() => toggleEcg(it.nome)} /> {it.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="form-group">
              <label>Indicação Clínica & Hipótese Diagnóstica (ECG) *</label>
              <textarea value={ecgJustificativa} onChange={(e) => setEcgJustificativa(e.target.value)} />
            </div>
          </>
        )}

        {/* HISTÓRICO DE EXAMES SOLICITADOS */}
        <div className="form-section-box">
          <div className="form-section-box-title"><i className="ph ph-clock-counter-clockwise" /> Histórico de Exames Deste Atendimento</div>
          {historico.length === 0 ? (
            <p style={{ color: 'var(--c-text-muted)', fontSize: 12.5 }}>Nenhuma requisição emitida anteriormente para este leito.</p>
          ) : (
            historico.map((e) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
                <div>
                  <strong>{e.nome}</strong>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>
                    {e.local || 'UPA 24h'} · {e.preparo || 'Rotina'} · {new Date(e.solicitado_em || e.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--c-surface)', border: '1px solid var(--c-border-light)' }}>
                  {e.status || 'Solicitado'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cc-footer">
        <span />
        <button type="button" className="btn-save-print" onClick={salvarEImprimir} disabled={salvando}>
          <i className="ph ph-printer" />
          {salvando ? 'Emitindo...' : modalidade === 'lab' ? 'Salvar & Imprimir Requisição Laboratorial (Modelo 19)' : modalidade === 'img' ? 'Salvar & Imprimir Requisição de Imagem (Modelo 20)' : 'Salvar & Imprimir Requisição de ECG (Modelo 21)'}
        </button>
      </div>
    </div>
  );
}
