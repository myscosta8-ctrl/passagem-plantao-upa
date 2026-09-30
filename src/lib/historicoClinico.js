import { supabase } from './supabaseClient.js'
import { avisarErro } from './erros.js'

// Histórico Clínico do paciente — reúne, em ordem cronológica, os registros
// clínicos de todas as passagens do paciente pela unidade. Só a Prescrição
// Médica fica fora (continua na própria aba, por causa do Duplicar).
// Cada fonte diz: tabela, rótulo, área (enfermagem/médico), coluna de data,
// tipo de impresso e como resumir o conteúdo.
const txt = (...v) => v.filter((x) => x !== null && x !== undefined && String(x).trim() !== '').join(' · ')
const urg = (u) => ({ urgencia: 'Urgência', urgente: 'Urgência', emergencia: 'Emergência', rotina: 'Rotina', eletiva: 'Eletiva' }[String(u || '').toLowerCase()] || u)
const lista = (a) => (Array.isArray(a) ? a.join(', ') : '')

export const FONTES = [
  { tabela: 'historico_enfermagem', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,enfermeiro_id,motivo_hospitalizacao,parecer_obs', rotulo: 'Admissão de Enfermagem (Histórico de Enfermagem)', area: 'enfermagem', impresso: 'historico_enfermagem_projeto',
    resumo: (r) => txt(r.motivo_hospitalizacao && `Motivo: ${r.motivo_hospitalizacao}`, r.parecer_obs) },
  { tabela: 'admissoes_enfermagem', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,autor_id,enfermeiro_id,hipotese_diagnostica,motivo_procura,observacoes', rotulo: 'Admissão de Enfermagem (registro anterior)', area: 'enfermagem', impresso: null,
    resumo: (r) => txt(r.hipotese_diagnostica, r.motivo_procura, r.observacoes) },
  { tabela: 'evolucoes', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,autor_id,enfermeiro_id,tipo,autor_tipo,objetivo,texto,diagnosticos_nanda', rotulo: 'Evolução do Enfermeiro (SAE)', area: 'enfermagem', impresso: 'evolucao_sae',
    filtro: (r) => (r.tipo || r.autor_tipo) !== 'medico',
    resumo: (r) => txt(r.objetivo && `SV: ${r.objetivo}`, r.texto, lista(r.diagnosticos_nanda) && `NANDA-I: ${lista(r.diagnosticos_nanda)}`) },
  { tabela: 'transferencias_sbar', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,enfermeiro_entrega,transferido_por,data_hora_transferencia,situacao_atual,impressao_diagnostica,recomendacao,recomendacoes', rotulo: 'Transferência SBAR', area: 'enfermagem', impresso: 'sbar', data: 'data_hora_transferencia',
    resumo: (r) => txt(r.situacao_atual, r.impressao_diagnostica, r.recomendacao || r.recomendacoes) },
  { tabela: 'eventos_adversos', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,relator_id,anonimo,ocorrido_em,categoria,descricao,acao_imediata', rotulo: 'Nota de Intercorrência (Enfermagem)', area: 'enfermagem', impresso: 'intercorrencia', data: 'ocorrido_em',
    resumo: (r) => txt(r.categoria, r.descricao, r.acao_imediata && `Condutas: ${r.acao_imediata}`) },
  { tabela: 'consultas_medicas', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,medico_id,queixa_principal,hipotese_diagnostica,hipoteses_diagnosticas,conduta_inicial,conduta', rotulo: 'Admissão Médica', area: 'medico', impresso: 'consulta',
    resumo: (r) => txt(r.queixa_principal && `QP: ${r.queixa_principal}`, r.hipotese_diagnostica || r.hipoteses_diagnosticas, r.conduta_inicial || r.conduta) },
  { tabela: 'evolucoes_medicas', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,medico_id,diagnosticos,evolucao_dia,conduta_medica', rotulo: 'Evolução Médica', area: 'medico', impresso: 'evolucao',
    resumo: (r) => txt(r.diagnosticos, r.evolucao_dia, r.conduta_medica) },
  { tabela: 'regulacao_atualizacoes', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,atualizado_por,diagnostico_regulado,evolucao,conduta', rotulo: 'Atualização de Quadro Clínico', area: 'medico', impresso: 'regulacao',
    resumo: (r) => txt(r.diagnostico_regulado, r.evolucao, r.conduta) },
  { tabela: 'notas_intercorrencia_medica', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,medico_id,descricao_evento,notas,conduta_tomada', rotulo: 'Nota de Intercorrência Médica', area: 'medico', impresso: 'intercorrencia',
    resumo: (r) => txt(r.descricao_evento || r.notas, r.conduta_tomada) },
  { tabela: 'planos_terapeuticos', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,diagnostico_principal_cid,motivo_internacao', rotulo: 'Plano Terapêutico', area: 'medico', impresso: 'plano',
    resumo: (r) => txt(r.diagnostico_principal_cid && `CID ${r.diagnostico_principal_cid}`, r.motivo_internacao) },
  { tabela: 'tfd_solicitacoes', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,profissional_responsavel,diagnostico,tratamento_indicado', rotulo: 'Tratamento Fora do Domicílio (TFD)', area: 'medico', impresso: 'tfd',
    resumo: (r) => txt(r.diagnostico, r.tratamento_indicado) },
  { tabela: 'atestados_medicos', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,dias_afastamento,cid,texto_livre', rotulo: 'Atestado Médico', area: 'medico', impresso: 'atestado',
    resumo: (r) => txt(r.dias_afastamento && `${r.dias_afastamento} dia(s) de afastamento`, r.cid && `CID ${r.cid}`, r.texto_livre) },
  { tabela: 'sumarios_alta', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,medico_id,diagnostico_alta,diagnostico_internacao,resumo_clinico', rotulo: 'Sumário de Alta', area: 'medico', impresso: 'alta',
    resumo: (r) => txt(r.diagnostico_alta || r.diagnostico_internacao, r.resumo_clinico) },
  { tabela: 'exames_solicitados', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,solicitado_por,modalidade,nome,exames,justificativa_clinica,urgencia', rotulo: 'Solicitação de Exames', area: 'medico',
    impresso: (r) => (Array.isArray(r.exames) && ['lab', 'img', 'ecg'].includes(r.modalidade) ? `exame_${r.modalidade}` : null),
    resumo: (r) => txt({ lab: 'Laboratório', img: 'Imagem', ecg: 'ECG' }[r.modalidade], Array.isArray(r.exames) ? r.exames.map((e) => (typeof e === 'string' ? e : e?.nome)).filter(Boolean).join(', ') : r.nome, r.urgencia && urg(r.urgencia), r.justificativa_clinica) },
  { tabela: 'aih_solicitacoes', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,solicitante_id,procedimento_principal_nome,cid_principal,justificativa_clinica', rotulo: 'Laudo de AIH', area: 'medico', impresso: 'aih',
    selectCompleto: '*, cid_catalog!aih_solicitacoes_cid_principal_fkey(codigo, descricao)',
    resumo: (r) => txt(r.procedimento_principal_nome, r.cid_principal && `CID ${r.cid_principal}`, r.justificativa_clinica) },
  { tabela: 'apac_solicitacoes', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,solicitado_por,medico_id,procedimento_nome,cid_principal,justificativa', rotulo: 'Laudo de APAC', area: 'medico', impresso: 'apac',
    resumo: (r) => txt(r.procedimento_nome, r.cid_principal && `CID ${r.cid_principal}`, r.justificativa) },
  { tabela: 'solicitacoes_atm', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,solicitado_por,medico_id,medicamento,antimicrobiano,foco_infeccioso,parecer_farmaceutico', rotulo: 'Solicitação de Antimicrobiano (ATM)', area: 'medico', impresso: 'atm',
    resumo: (r) => txt(r.antimicrobiano || r.medicamento, r.foco_infeccioso && `Foco: ${r.foco_infeccioso}`, r.parecer_farmaceutico ? `Parecer: ${r.parecer_farmaceutico}` : 'Aguardando parecer') },
  { tabela: 'solicitacoes_sangue', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,solicitado_por,indicacao_clinica,urgencia,hemocomponentes', rotulo: 'Solicitação de Hemocomponentes', area: 'medico', impresso: 'sangue',
    resumo: (r) => txt(r.indicacao_clinica, r.urgencia && urg(r.urgencia)) },
  { tabela: 'receitas_medicas', colunas: 'id,atendimento_id,criado_em,data_registro,situacao,autor_auth,motivo_invalidacao,invalidado_em,criado_por,tipo,itens,orientacoes_gerais', rotulo: 'Receituário', area: 'medico', impresso: 'receituario',
    resumo: (r) => txt({ controle_especial: 'Controle especial', antimicrobiano: 'Antimicrobiano' }[r.tipo], Array.isArray(r.itens) ? r.itens.map((i) => i?.medicamento).filter(Boolean).join(', ') : '', r.orientacoes_gerais) },
]
const COLUNAS_AUTOR = ['autor_id', 'solicitante_id', 'solicitado_por', 'criado_por', 'enfermeiro_entrega', 'transferido_por', 'relator_id', 'medico_id', 'profissional_responsavel', 'atualizado_por', 'enfermeiro_id']

// Passagens (atendimentos) do paciente, mais recente primeiro.
export async function listarAtendimentosDaPessoa(pessoaId) {
  if (!pessoaId) return []
  const { data, error: erroConsulta1 } = await supabase
    .from('atendimentos')
    .select('id, numero_atendimento, criado_em, encerrado_em, status, status_internacao, queixa_principal')
    .eq('pessoa_id', pessoaId)
    .order('criado_em', { ascending: false })
  if (erroConsulta1) avisarErro('historicoClinico', erroConsulta1)
  return data ?? []
}

// Todos os registros clínicos dos atendimentos informados, em ordem cronológica.
export async function listarRegistrosClinicos(atendimentoIds) {
  if (!atendimentoIds?.length) return []
  const resultados = await Promise.all(FONTES.map(async (f) => {
    const { data, error } = await supabase.from(f.tabela).select(f.colunas || '*').in('atendimento_id', atendimentoIds).limit(1000)
    if (error) { console.error(`Histórico clínico — ${f.tabela}:`, error); return [] }
    return (data ?? []).filter((r) => (f.filtro ? f.filtro(r) : true)).map((r) => ({
      id: `${f.tabela}:${r.id}`,
      fonte: f,
      registro: r,
      data: r.data_registro || r[f.data || 'criado_em'] || r.criado_em,
      autorId: COLUNAS_AUTOR.map((c) => r[c]).find((v) => typeof v === 'string' && v.length > 20) || null,
      resumo: f.resumo(r),
    }))
  }))
  const itens = resultados.flat()

  const idsAutores = [...new Set(itens.map((i) => i.autorId).filter(Boolean))]
  if (idsAutores.length) {
    const { data: profs, error: erroConsulta2 } = await supabase.from('enfermeiros').select('id, nome_exibicao, nome, crm, coren, tipo').in('id', idsAutores)
    if (erroConsulta2) avisarErro('historicoClinico', erroConsulta2)
    const porId = Object.fromEntries((profs ?? []).map((p) => [p.id, p]))
    itens.forEach((i) => { i.autor = porId[i.autorId] || null })
  }
  return itens.sort((a, b) => new Date(b.data) - new Date(a.data)) // mais recente primeiro
}

// Trilha de alterações de um registro (quem alterou, quando e o que estava escrito).
export async function listarAlteracoes(tabela, registroId) {
  const { data, error } = await supabase
    .from('auditoria_alteracoes')
    .select('id, operacao, alterado_por, alterado_em, dados_anteriores, dados_novos')
    .eq('tabela', tabela).eq('registro_id', String(registroId))
    .order('alterado_em', { ascending: false })
  if (error) { console.error('Erro ao listar alterações:', error); return [] }
  const ids = [...new Set((data ?? []).map((a) => a.alterado_por).filter(Boolean))]
  let porId = {}
  if (ids.length) {
    const { data: profs, error: erroConsulta3 } = await supabase.from('enfermeiros').select('id, nome_exibicao, nome').in('id', ids)
    if (erroConsulta3) avisarErro('historicoClinico', erroConsulta3)
    porId = Object.fromEntries((profs ?? []).map((p) => [p.id, p]))
  }
  const ignorar = new Set(['atualizado_em', 'finalizado_em', 'invalidado_em'])
  return (data ?? []).map((a) => ({
    ...a,
    autor: porId[a.alterado_por] || null,
    campos: Object.keys({ ...(a.dados_anteriores || {}), ...(a.dados_novos || {}) })
      .filter((k) => !ignorar.has(k) && JSON.stringify(a.dados_anteriores?.[k]) !== JSON.stringify(a.dados_novos?.[k]))
      .map((k) => ({ campo: k, antes: a.dados_anteriores?.[k], depois: a.dados_novos?.[k] })),
  }))
}

// Documento completo (todas as colunas) — só quando vai imprimir.
export async function buscarRegistroCompleto(tabela, id, select = '*') {
  const { data, error } = await supabase.from(tabela).select(select).eq('id', id).maybeSingle()
  if (error) avisarErro('historicoClinico', error)
  return data
}
