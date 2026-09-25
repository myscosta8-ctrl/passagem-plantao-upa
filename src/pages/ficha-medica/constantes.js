export const VIAS = ['VO', 'EV', 'IM', 'SC', 'SL', 'INAL', 'TOP', 'RET', 'VAG', 'OFT', 'IN', 'IO', 'Outra'];

export const AIH_VAZIA = {
  // 1-4 · Identificação do estabelecimento de saúde
  estabelecimento_solicitante_nome: 'UPA 24H BREVES',
  estabelecimento_solicitante_cnes: '0296796',
  estabelecimento_executante_nome: 'UPA 24H BREVES',
  estabelecimento_executante_cnes: '0296796',
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

export const PROTOCOLOS_OPCOES = [
  'TEV — Tromboembolismo Venoso',
  'Dor torácica / Síndrome Coronariana Aguda',
  'AVC — Acidente Vascular Cerebral',
  'SEPSE / Choque Séptico',
  'Anafilaxia',
  'Insuficiência Respiratória / Via Aérea',
  'Emergências glicêmicas',
];

export const EQUIPE_OPCOES = ['Enfermagem', 'Fisioterapia', 'Nutrição', 'Serviço Social', 'Psicologia'];

export const PROBLEMA_VAZIO = { descricao: '', meta: '', conduta: '', prazo: '' };

export const ACOES_AUDITORIA = {
  diagnostico_cid_atualizado: 'Diagnóstico (CID-10) atualizado',
  desfecho_registrado: 'Desfecho registrado',
  duplicata_fundida: 'Cadastros duplicados fundidos',
};

export const RECEITA_ITEM_VAZIO = { medicamento: '', instrucao: '', via: 'ORAL', controlado: false, antimicrobiano: false };

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
};
