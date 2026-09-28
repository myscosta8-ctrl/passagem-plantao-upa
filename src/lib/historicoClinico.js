import { supabase } from './supabaseClient'

// Histórico Clínico do paciente — reúne, em ordem cronológica, os registros
// clínicos de todas as passagens do paciente pela unidade. Exames, prescrição
// e AIH ficam fora de propósito (continuam no próprio campo de criação).
// Cada fonte diz: tabela, rótulo, área (enfermagem/médico), coluna de data,
// tipo de impresso e como resumir o conteúdo.
const txt = (...v) => v.filter((x) => x !== null && x !== undefined && String(x).trim() !== '').join(' · ')
const lista = (a) => (Array.isArray(a) ? a.join(', ') : '')

export const FONTES = [
  { tabela: 'historico_enfermagem', rotulo: 'Admissão de Enfermagem (Histórico de Enfermagem)', area: 'enfermagem', impresso: 'historico_enfermagem_projeto',
    resumo: (r) => txt(r.motivo_hospitalizacao && `Motivo: ${r.motivo_hospitalizacao}`, r.parecer_obs) },
  { tabela: 'admissoes_enfermagem', rotulo: 'Admissão de Enfermagem (registro anterior)', area: 'enfermagem', impresso: null,
    resumo: (r) => txt(r.hipotese_diagnostica, r.motivo_procura, r.observacoes) },
  { tabela: 'evolucoes', rotulo: 'Evolução do Enfermeiro (SAE)', area: 'enfermagem', impresso: 'evolucao_sae',
    filtro: (r) => (r.tipo || r.autor_tipo) !== 'medico',
    resumo: (r) => txt(r.objetivo && `SV: ${r.objetivo}`, r.texto, lista(r.diagnosticos_nanda) && `NANDA-I: ${lista(r.diagnosticos_nanda)}`) },
  { tabela: 'transferencias_sbar', rotulo: 'Transferência SBAR', area: 'enfermagem', impresso: 'sbar', data: 'data_hora_transferencia',
    resumo: (r) => txt(r.situacao, r.impressao_diagnostica, r.recomendacao || r.recomendacoes) },
  { tabela: 'eventos_adversos', rotulo: 'Nota de Intercorrência (Enfermagem)', area: 'enfermagem', impresso: 'intercorrencia', data: 'ocorrido_em',
    resumo: (r) => txt(r.categoria, r.descricao, r.acao_imediata && `Condutas: ${r.acao_imediata}`) },
  { tabela: 'consultas_medicas', rotulo: 'Admissão Médica', area: 'medico', impresso: 'consulta',
    resumo: (r) => txt(r.queixa_principal && `QP: ${r.queixa_principal}`, r.hipotese_diagnostica || r.hipoteses_diagnosticas, r.conduta_inicial || r.conduta) },
  { tabela: 'evolucoes_medicas', rotulo: 'Evolução Médica', area: 'medico', impresso: 'evolucao',
    resumo: (r) => txt(r.diagnosticos, r.evolucao_dia, r.conduta_medica) },
  { tabela: 'regulacao_atualizacoes', rotulo: 'Atualização de Quadro Clínico (SISREG)', area: 'medico', impresso: 'regulacao',
    resumo: (r) => txt(r.diagnostico_regulado, r.evolucao, r.conduta) },
  { tabela: 'notas_intercorrencia_medica', rotulo: 'Nota de Intercorrência Médica', area: 'medico', impresso: 'intercorrencia',
    resumo: (r) => txt(r.descricao_evento || r.notas, r.conduta_tomada) },
  { tabela: 'planos_terapeuticos', rotulo: 'Plano Terapêutico', area: 'medico', impresso: 'plano',
    resumo: (r) => txt(r.diagnostico_principal_cid && `CID ${r.diagnostico_principal_cid}`, r.motivo_internacao) },
  { tabela: 'tfd_solicitacoes', rotulo: 'Tratamento Fora do Domicílio (TFD)', area: 'medico', impresso: 'tfd',
    resumo: (r) => txt(r.diagnostico, r.tratamento_indicado) },
  { tabela: 'atestados_medicos', rotulo: 'Atestado Médico', area: 'medico', impresso: 'atestado',
    resumo: (r) => txt(r.dias_afastamento && `${r.dias_afastamento} dia(s) de afastamento`, r.cid && `CID ${r.cid}`, r.texto_livre) },
  { tabela: 'sumarios_alta', rotulo: 'Sumário de Alta', area: 'medico', impresso: 'alta',
    resumo: (r) => txt(r.diagnostico_alta || r.diagnostico_internacao, r.resumo_clinico) },
]

const COLUNAS_AUTOR = ['autor_id', 'criado_por', 'enfermeiro_entrega', 'transferido_por', 'relator_id', 'medico_id', 'profissional_responsavel', 'atualizado_por', 'enfermeiro_id']

// Passagens (atendimentos) do paciente, mais recente primeiro.
export async function listarAtendimentosDaPessoa(pessoaId) {
  if (!pessoaId) return []
  const { data } = await supabase
    .from('atendimentos')
    .select('id, numero_atendimento, criado_em, encerrado_em, status, status_internacao, queixa_principal')
    .eq('pessoa_id', pessoaId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

// Todos os registros clínicos dos atendimentos informados, em ordem cronológica.
export async function listarRegistrosClinicos(atendimentoIds) {
  if (!atendimentoIds?.length) return []
  const resultados = await Promise.all(FONTES.map(async (f) => {
    const { data, error } = await supabase.from(f.tabela).select('*').in('atendimento_id', atendimentoIds)
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
    const { data: profs } = await supabase.from('enfermeiros').select('id, nome_exibicao, nome, crm, coren, tipo').in('id', idsAutores)
    const porId = Object.fromEntries((profs ?? []).map((p) => [p.id, p]))
    itens.forEach((i) => { i.autor = porId[i.autorId] || null })
  }
  return itens.sort((a, b) => new Date(a.data) - new Date(b.data))
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
    const { data: profs } = await supabase.from('enfermeiros').select('id, nome_exibicao, nome').in('id', ids)
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
