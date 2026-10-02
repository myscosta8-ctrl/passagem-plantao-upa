export const VIAS = ['VO', 'IM', 'SC', 'EV', 'INAL', 'SL', 'ID', 'VR'];

// Prescrição médica — opções guiadas
export const UNIDADES_DOSE = ['mg', 'g', 'mcg', 'mL', 'UI', 'gts', 'comp', 'cáps', 'amp', 'FA', 'puff', 'sachê'];
export const FREQUENCIAS = ['1/1h', '2/2h', '4/4h', '6/6h', '8/8h', '12/12h', '24/24h', 'Dose única', 'Agora', 'Contínuo'];
export const CONDICOES_USO = ['SN — Se necessário', 'ACM — A critério médico', 'Se dor ou febre', 'Se náuseas ou vômitos', 'Se alergia'];
export const DILUENTES = ['SF 0,9%', 'SG 5%', 'Água destilada (AD)', 'Ringer Lactato'];
export const TEMPOS_INFUSAO = ['Bolus lento', 'Em 15 min', 'Em 30 min', 'Em 1 h', 'Em 2 h', 'Em 3 h', 'Contínuo em BIC'];

export const AIH_VAZIA = {
  // 1-4 · Identificação do estabelecimento de saúde
  estabelecimento_solicitante_nome: 'UPA 24H BREVES',
  estabelecimento_solicitante_cnes: '2418657',
  estabelecimento_executante_nome: 'UPA 24H BREVES',
  estabelecimento_executante_cnes: '2418657',
  // 10.1 / 13-19 · Identificação do paciente
  etnia: '',
  nome_responsavel: '',
  municipio_residencia_uf: 'PA',
  municipio_residencia_cep: '68800-000',
  municipio_residencia_ibge: '1501808',
  // 20-22 · Justificativa da internação
  sinais_sintomas_clinicos: '',
  condicoes_justificam_internacao: '',
  resultados_provas_diagnosticas: '',
  // 23-26 · Diagnóstico
  diagnostico_inicial_texto: '',
  cid_principal: '',
  cid_secundario: '',
  cid_causas_associadas: '',
  // 27-35 · Procedimento solicitado
  procedimento_principal_nome: '',
  procedimento_principal_codigo: '',
  procedimento_secundario_codigo: '',
  clinica: '',
  carater_internacao: 'URGENCIA',
  profissional_documento_tipo: 'CNS',
  profissional_documento_numero: '',
  // 36-45 · Preencher em caso de causas externas
  causa_externa_transito: false,
  causa_externa_trabalho_tipico: false,
  causa_externa_trabalho_trajeto: false,
  cnpj_seguradora: '',
  numero_bilhete: '',
  serie_bilhete: '',
  cnpj_empresa: '',
  cnae_empresa: '',
  cbor: '',
  vinculo_previdencia: '',
  // 46-52 · Autorização
  autorizador_nome: '',
  autorizador_codigo_orgao_emissor: '',
  autorizador_documento_tipo: 'CNS',
  autorizador_documento_numero: '',
  numero_autorizacao: '',
  data_autorizacao: '',
};

export const VINCULO_PREVIDENCIA_OPCOES = [
  { valor: 'empregado', rotulo: 'Empregado' },
  { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' },
  { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' },
  { valor: 'nao_segurado', rotulo: 'Não segurado' },
];

export const APAC_VAZIA = {
  procedimento_codigo: '',
  procedimento_nome: '',
  quantidade: '',
  cid_principal: '',
  cid_secundario: '',
  justificativa: '',
  numero_autorizacao: '',
  validade_inicio: '',
  validade_fim: '',
};

export const ATM_VAZIA = {
  medicamento: '',
  posologia: '',
  dose: '',
  intervalo: '',
  tempo_uso_dias: '',
  justificativa_clinica: '',
  diagnostico: '',
  data_internacao: '',
  tratamento_pretendido: '',
  dxixt: '',
  ampolas: '',
  frasco_ampolas: '',
  bolsas: '',
  via: '',
  regime: '',
};

export const CONSULTA_VAZIA = {
  queixa_principal: '',
  antecedentes: '',
  exame_geral: '',
  sv: { pa: '', fc: '', fr: '', spo2: '', temp: '', dor: '' },
};

export const EVOLUCAO_VAZIA = {
  diagnosticos: '',
  historia_doenca_atual: '',
  comorbidades: false,
  comorbidades_texto: '',
  reconciliacao_medicamentosa: false,
  reconciliacao_texto: '',
  alergias: false,
  alergias_texto: '',
  risco_tev: '',
  criterios_sepse: false,
  antibioticoterapia: '',
  evolucao_dia: '',
  exame_fisico: '',
  plano_terapeutico: '',
  exames_laboratorio: '',
  aguarda_exames: false,
  aguarda_exames_texto: '',
  data_prevista_alta: '',
  conduta_medica: '',
  sv_pa_sistolica: '',
  sv_pa_diastolica: '',
  sv_fc: '',
  sv_fr: '',
  sv_temperatura: '',
  sv_spo2: '',
  sv_hgt: '',
};

export const RISCO_TEV_OPCOES = ['Baixo risco', 'Moderado risco', 'Alto risco'];

export const HEMOCOMPONENTES_OPCOES = [
  'Concentrado de hemácias pobre em leucócitos(+ 300 ml/unid)',
  'Concentrado de hemácias (+ 300 ml/unid)',
  'Concentrado de hemácias pobre em leucócitos irradiado(+ 300 ml/unid)',
  'Plasma fresco congelado (+ 200ml/unid)',
  'Concentrado de plaquetas pobre em leucócitos(+ 60 ml/unid)',
  'Concentrado de plaquetas pobre em leucócitos irradiado(+ 60 ml/unid)',
  'Concentrado de plaquetas por aférese (+ 300 ml/unid)',
  'Crioprecipitado (+ 20 ml/unid)',
];

export const URGENCIA_OPCOES = [
  ['urgencia', 'Urgência, a realizar dentro de 3 horas'],
  ['rotina', 'Não urgente (rotina), a realizar dentro de 24h'],
  ['cirurgia', 'Programada — cirurgia eletiva'],
  ['ambulatorial', 'Programada — transfusão em regime ambulatorial'],
  ['residencia', 'Transfusão em residência (Termo de Responsabilidade obrigatório)'],
  ['auto', 'Auto-transfusão'],
];

export const SANGUE_VAZIA = {
  indicacao_clinica: '',
  peso: '',
  hb_ht: '',
  apt: '',
  enf_leito: '',
  registro_hospitalar: '',
  categoria: '',
  recebeu_transfusao: '',
  quando: '',
  onde: '',
  antecedentes_anticorpo: '',
  solicitou_doadores: '',
  hemocomponentes: {},
  outros_hemocomponentes: '',
  urgencia: '',
  cirurgia_data: '',
  cirurgia_hora: '',
  ambulatorial_data: '',
  ambulatorial_hora: '',
  extrema_urgencia: false,
  extrema_urgencia_data: '',
  extrema_urgencia_hora: '',
  coletado_por: '',
  coletado_data: '',
  coletado_hora: '',
  pai_i: '',
  pai_ii: '',
  ac: '',
  cd: '',
  responsavel_hemopa: '',
  hemopa_data: '',
  hemopa_hora: '',
};

// Protocolos institucionais elegíveis — alinhado literalmente com
// mockups-fase2/07-plano-terapeutico-design.html (seção 4).
export const PROTOCOLOS_OPCOES = [
  { nome: 'IDENTIFICAÇÃO SEGURA', descricao: 'Obrigatório a todos os pacientes' },
  { nome: 'PREVENÇÃO DE QUEDA', descricao: 'Leito com grades elevadas' },
  { nome: 'PREVENÇÃO DE LPP', descricao: 'Mudança de decúbito 2/2h e colchão especial' },
  { nome: 'CONTROLE DA DOR', descricao: 'Analgesia e sedação escalonada' },
  { nome: 'TCE GRAVE', descricao: 'Vigilância neurológica contínua e PPC' },
  { nome: 'TEV CLÍNICO / CIRÚRGICO', descricao: 'Profilaxia mecânica/farmacológica' },
  { nome: 'JEJUM / DIETA ZERO', descricao: 'Aguardando abordagem cirúrgica ou instável' },
  { nome: 'CIRURGIA SEGURA', descricao: 'Aplicação de checklist cirúrgico' },
];

// Equipe multiprofissional — alinhado com a seção 5 do mockup.
export const EQUIPE_OPCOES = [
  'Enfermagem',
  'Fisioterapia Resp/Motora',
  'Serviço Social',
  'Nutrição Clínica',
  'Psicologia Hospitalar',
  'Eq. Transporte (SAMU)',
];

// Tempo de permanência previsto — select fixo, igual ao mockup (valor
// numérico de dias armazenado; "5+" é gravado como 5).
export const TEMPO_INTERNACAO_OPCOES = [
  { value: '1', label: '01 DIA (Até 24h)' },
  { value: '2', label: '02 DIAS (Até 48h)' },
  { value: '3', label: '03 DIAS (Até 72h)' },
  { value: '5', label: 'Até 5+ Dias (Depende de Regulação)' },
];

export const PROBLEMA_VAZIO = { descricao: '', prazo: '1' };

export const ACOES_AUDITORIA = {
  diagnostico_cid_atualizado: 'Diagnóstico (CID-10) atualizado',
  desfecho_registrado: 'Desfecho registrado',
  duplicata_fundida: 'Cadastros duplicados fundidos',
};

export const RECEITA_ITEM_VAZIO = { medicamento: '', instrucao: '', quantidade: '', via: 'ORAL', controlado: false, antimicrobiano: false };

export const RECEITA_TIPO_LABEL = {
  simples: 'Receita Simples',
  controle_especial: 'Controle Especial',
  antimicrobiano: 'Antimicrobiano',
};

export const VIAS_RECEITA = [
  'ORAL',
  'INTRAVENOSO (EV)',
  'INTRAMUSCULAR (IM)',
  'SUBCUTÂNEO (SC)',
  'TÓPICO',
  'INALATÓRIO',
  'OFTÁLMICO',
  'OTOLÓGICO',
  'RETAL',
  'VAGINAL',
];

export const TAGS_INSTRUCAO = {
  Verbos: ['Tomar', 'Aplicar', 'Injetar', 'Inalar', 'Pingar'],
  Quantidade: ['01 comp.', '01 cáps.', '01 gota', '01 ampola', '05 mL', '10 mL'],
  Frequencia: ['a cada 4h', 'a cada 6h', 'a cada 8h', 'a cada 12h', '1x ao dia', 'Dose Única'],
  Condicoes: ['se dor ou febre', 'se náusea/vômito', 'em jejum', 'após refeição', 'uso contínuo'],
};

export const TFD_VAZIA = {
  historia_doenca_atual: '',
  exame_fisico: '',
  diagnostico: '',
  exame_complementar: '',
  tratamento_realizado: '',
  tratamento_indicado: '',
  tempo_provavel_dias: '',
  acompanhante_nome: '',
  acompanhante_relacao: '',
  identidade: '',
  profissao: '',
  numero_laudo: '',
  carater: '',
  acompanhante_rg: '',
  sv_pa: '', sv_fc: '', sv_fr: '', sv_spo2: '', sv_tax: '', sv_hgt: '',
  avaliacao_segmentar: '',
  exame_dirigido: '',
  diagnostico_secundario: '',
  justificativa_tfd: '',
  meio_transporte: '',
};

// Antimicrobianos de uso restrito institucional (Controle Obrigatório UPA Breves)
// — seção 6 do formulário oficial de ATM. Prescrever qualquer um exige a
// Solicitação de Uso de Antimicrobiano (ATM).
export const ATM_RESTRITOS = [
  { rotulo: 'CEFEPIME Pó p/ Sol Inj 1 g / 2 g', termos: ['CEFEPIME'] },
  { rotulo: 'MEROPENEM Pó p/ Sol Inj 500 mg / 1 g', termos: ['MEROPENEM'] },
  { rotulo: 'CIPROFLOXACINO Sol Inj Bolsa 200 mg/100 mL', termos: ['CIPROFLOXACIN'] },
  { rotulo: 'METRONIDAZOL Sol Inj Bolsa 500 mg/100 mL', termos: ['METRONIDAZOL'] },
  { rotulo: 'CLINDAMICINA Sol Inj Ampola 600 mg/4 mL', termos: ['CLINDAMICINA'] },
  { rotulo: 'PIPERACILINA + TAZOBACTAM 4,5 g', termos: ['PIPERACILINA', 'TAZOBACTAM'] },
  { rotulo: 'LEVOFLOXACINO Sol Inj Bolsa 500 mg/100 mL', termos: ['LEVOFLOXACIN'] },
  { rotulo: 'VANCOMICINA Pó Liofilizado 500 mg / 1 g', termos: ['VANCOMICINA'] },
];

export function atbRestrito(nome) {
  const n = (nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (!n.trim()) return null;
  return ATM_RESTRITOS.find((a) => a.termos.some((t) => n.includes(t))) || null;
}

// Via intravenosa (EV/IV, endovenosa, intravenosa). A ATM só vale para o antibiótico restrito por essa via.
export function viaIntravenosa(via) {
  const v = (via || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  return /\b(EV|IV)\b/.test(v) || v.includes('ENDOVEN') || v.includes('INTRAVEN');
}

// Item de prescrição que exige ATM: antimicrobiano da lista restrita E por via intravenosa.
export function exigeAtm(nome, via) {
  return viaIntravenosa(via) ? atbRestrito(nome) : null;
}

// Doses por dia a partir do intervalo da prescrição (6/6h → 4; 12/12h → 2; dose única → 1).
export function dosesPorDia(intervalo) {
  const t = (intervalo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (/DOSE UNICA|AGORA/.test(t)) return 1;
  const m = t.match(/(\d+)\s*\/\s*(\d+)\s*H/) || t.match(/(\d+)\s*\/\s*(\d+)/);
  if (m && Number(m[2]) > 0) return Math.round(24 / Number(m[2]));
  const h = t.match(/(\d+)\s*(H|HORAS)/);
  if (h && Number(h[1]) > 0) return Math.round(24 / Number(h[1]));
  return null;
}

// Cálculo DxIxT (doses/dia × dias) em texto, ou '' se faltar intervalo ou tempo de uso.
export function calculoDxIxT(intervalo, dias) {
  const d = dosesPorDia(intervalo); const n = Number(dias);
  if (!d || !n) return '';
  return `${d} dose${d > 1 ? 's' : ''}/dia × ${n} dia${n > 1 ? 's' : ''} = ${d * n} doses`;
}

const ROTULO_VIA = { EV: 'Intravenosa (EV)', IV: 'Intravenosa (EV)' };

// ATMs pendentes do atendimento, a partir do banco (não depende do navegador):
// itens das prescrições não invalidadas (inclusive rascunho) que exigem ATM,
// menos os antimicrobianos que já têm ATM não invalidada.
export function atmPendentes(prescricoes = [], atms = []) {
  const feitos = new Set(atms.filter((a) => a.situacao !== 'invalido').map((a) => atbRestrito(a.medicamento)?.rotulo).filter(Boolean));
  const vistos = new Set();
  const lista = [];
  const ordenadas = [...prescricoes].sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em)));
  for (const p of ordenadas) {
    if (p.situacao === 'invalido' || p.status === 'cancelada') continue;
    for (const it of p.prescricao_itens || []) {
      const r = exigeAtm(it.medicamento_nome, it.via);
      if (!r || feitos.has(r.rotulo) || vistos.has(r.rotulo)) continue;
      vistos.add(r.rotulo);
      const dias = (String(it.duracao || '').match(/\d+/) || [''])[0];
      lista.push({
        medicamento: it.medicamento_nome,
        dose: [it.dose, it.dose_unidade].filter((x) => x !== null && x !== undefined && x !== '').join(' '),
        via: ROTULO_VIA[(it.via || '').toUpperCase()] || it.via || '',
        intervalo: it.frequencia || '',
        posologia: [it.diluicao, it.instrucoes].filter(Boolean).join(' — '),
        tempo_uso_dias: dias,
        dxixt: calculoDxIxT(it.frequencia, dias),
      });
    }
  }
  return lista;
}
