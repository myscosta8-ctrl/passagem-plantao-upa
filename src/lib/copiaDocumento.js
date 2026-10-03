// Duplicar documento pelo Histórico Clínico: monta, a partir do registro gravado, o formulário
// da aba (as mesmas chaves que o "Salvar Rascunho" guarda) para começar um documento NOVO.
// Nunca é copiado: data do registro, sinais vitais (são do momento), dados de autorização,
// coleta e conferência (são de cada solicitação), checklist de transferência.
// Evolução do enfermeiro, evolução médica e prescrição têm cópia própria (duplicarPendente.js).

// Documentos que cada ficha pode duplicar (além das evoluções e da prescrição).
export const COPIAVEIS = {
  enfermagem: ['transferencias_sbar', 'eventos_adversos'],
  medico: ['regulacao_atualizacoes', 'notas_intercorrencia_medica', 'tfd_solicitacoes', 'consultas_medicas', 'exames_solicitados',
    'receitas_medicas', 'atestados_medicos', 'aih_solicitacoes', 'apac_solicitacoes', 'solicitacoes_atm', 'solicitacoes_sangue'],
  multi: ['registros_nutricao', 'registros_servico_social'],
}

// Aba da ficha de cada documento que não tem "Editar rascunho" (as demais seguem ABA_EDICAO).
export const ABA_DA_COPIA = { exames_solicitados: 'exames' }

const vazio = (v) => v === null || v === undefined
// Valor pronto para o campo da tela: null vira '', número vira texto (campos de texto).
const campo = (v) => (vazio(v) ? '' : typeof v === 'number' ? String(v) : v)
const objeto = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})
// Junta colunas e o jsonb de campos extras, sem as chaves proibidas.
function juntar(fontes, proibido = () => false) {
  const r = {}
  for (const f of fontes) for (const [k, v] of Object.entries(objeto(f))) if (!proibido(k) && !vazio(v)) r[k] = campo(v)
  return r
}
const pegar = (reg, chaves) => Object.fromEntries(chaves.filter((k) => !vazio(reg[k])).map((k) => [k, campo(reg[k])]))

const SV_TFD = /^sv_/
const AUTORIZACAO_AIH = /^(numero_autorizacao|data_autorizacao|autorizador_|profissional_nome_aih$|data_solicitacao_aih$)/
const CONFERENCIA_SANGUE = /^(coletado_|hemopa_|responsavel_hemopa$|pai_i$|pai_ii$|ac$|cd$)/

const MAPEADORES = {
  regulacao_atualizacoes: (r) => ({
    evolucao: campo(r.evolucao), pendencias: campo(r.pendencias), conduta: campo(r.conduta),
    destSer: !!r.destino_ser, numeroSer: campo(r.numero_solicitacao_ser),
    destSisreg: !!r.destino_sisreg, numeroSisreg: campo(r.numero_solicitacao_sisreg),
    diagnosticoRegulado: campo(r.diagnostico_regulado),
    mudancaDiagnostico: !!r.mudanca_diagnostico, novoDiagnostico: campo(r.novo_diagnostico_cid),
  }),
  notas_intercorrencia_medica: (r) => ({
    d: { descricao: campo(r.descricao_evento), exame_fisico: campo(objeto(r.sinais_vitais_evento).exame_fisico), condutas: campo(r.conduta_tomada), desfecho: campo(r.notas) },
  }),
  tfd_solicitacoes: (r) => ({
    dados: juntar([pegar(r, ['historia_doenca_atual', 'exame_fisico', 'diagnostico', 'exame_complementar', 'tratamento_realizado', 'tratamento_indicado', 'tempo_provavel_dias', 'acompanhante_nome', 'acompanhante_relacao']), r.campos_extra], (k) => SV_TFD.test(k)),
  }),
  consultas_medicas: (r) => ({
    dados: juntar([pegar(r, ['queixa_principal', 'historia_doenca_atual', 'antecedentes', 'revisao_sistemas', 'exame_geral', 'hipotese_diagnostica', 'conduta_inicial']), r.campos_admissao], (k) => k === 'sv' || k === 'sinais_vitais'),
  }),
  exames_solicitados: (r) => ({
    selecionados: Object.fromEntries((Array.isArray(r.exames) ? r.exames : []).map((e) => [typeof e === 'string' ? e : e?.nome, true]).filter(([n]) => n)),
    justificativa: campo(r.justificativa_clinica),
  }),
  receitas_medicas: (r) => {
    const itens = (Array.isArray(r.itens) ? r.itens : []).filter((i) => i && String(i.medicamento || '').trim()).map((i) => ({ ...i }))
    return r.tipo === 'controle_especial' ? { itensControle: itens } : { itensSimples: itens }
  },
  atestados_medicos: (r) => ({ cid: campo(r.cid), diasAfastamento: campo(r.dias_afastamento), textoLivre: campo(r.texto_livre) }),
  aih_solicitacoes: (r) => ({
    dados: juntar([pegar(r, ['procedimento_principal_nome', 'procedimento_principal_codigo', 'procedimento_secundario_codigo', 'cid_principal', 'cid_secundario', 'carater_internacao', 'cid_causas_associadas', 'sinais_sintomas_clinicos', 'condicoes_justificam_internacao', 'resultados_provas_diagnosticas']), r.campos_formulario], (k) => AUTORIZACAO_AIH.test(k)),
  }),
  apac_solicitacoes: (r) => ({
    dados: juntar([pegar(r, ['procedimento_codigo', 'procedimento_nome', 'quantidade', 'cid_principal', 'cid_secundario', 'justificativa']), r.campos_formulario], (k) => /^(numero_autorizacao|validade_|data_autorizacao|autorizador_|data_solicitacao)/.test(k)),
  }),
  solicitacoes_atm: (r) => ({
    dados: juntar([pegar(r, ['medicamento', 'posologia', 'dose', 'intervalo', 'justificativa_clinica', 'tempo_uso_dias']), r.campos_extra]),
  }),
  solicitacoes_sangue: (r) => ({
    dados: juntar([pegar(r, ['indicacao_clinica']), r.campos_extra], (k) => CONFERENCIA_SANGUE.test(k)),
  }),
  transferencias_sbar: (r) => {
    const ex = objeto(r.campos_extra)
    return {
      d: {
        ...juntar([ex], (k) => k === 'alergias' || k === 'checklist'),
        ...pegar({ diagnostico: r.impressao_diagnostica, situacao: r.situacao_atual, antecedentes: r.breve_historico, neuro: r.avaliacao, acessos: r.dispositivos, cuidados: r.recomendacoes || r.recomendacao }, ['diagnostico', 'situacao', 'antecedentes', 'neuro', 'acessos', 'cuidados']),
      },
    }
  },
  eventos_adversos: (r) => ({
    d: { tipo: campo(r.categoria), descricao: campo(r.descricao), condutas: campo(r.acao_imediata), medico: campo(r.medico_comunicado_nome), desfecho: campo(r.desfecho_evolucao) },
  }),
  registros_nutricao: (r) => ({ dados: juntar([r.dados], (k) => k === 'idade_no_registro') }),
  registros_servico_social: (r) => ({ dados: juntar([r.dados], (k) => k === 'idade_no_registro') }),
}

// Formulário da aba a partir do registro (ou null se a tabela não tem cópia).
export function estadoParaCopia(tabela, registro) {
  const m = MAPEADORES[tabela]
  return m && registro ? m(registro) : null
}

// Documentos que dividem a tabela: a cópia só entra no formulário certo.
export function filtroDaCopia(tabela, registro) {
  if (tabela === 'exames_solicitados') return { modalidade: registro?.modalidade }
  if (tabela === 'registros_nutricao' || tabela === 'registros_servico_social') return { tipo: registro?.tipo }
  return null
}

// Pode duplicar: documento finalizado, do atendimento aberto, da área da ficha.
export function podeCopiar(categoria, tabela, registro, atendimentoId) {
  return (COPIAVEIS[categoria] || []).includes(tabela) && !!MAPEADORES[tabela]
    && registro?.situacao === 'finalizado' && registro?.atendimento_id === atendimentoId
    && (tabela !== 'exames_solicitados' || ['lab', 'img', 'ecg'].includes(registro?.modalidade))
}
