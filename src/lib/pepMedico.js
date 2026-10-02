import { supabase } from './supabaseClient.js'
import { calcularIdade } from './pepAtendimentos.js'

import { gravar, MSG_FINALIZADO } from './documentos.js'
import { avisarErro } from './erros.js'
export { invalidarRegistro, MSG_FINALIZADO } from './documentos.js'


// Camada de dados do módulo médico (Fase 1 do PEP). Só existe sobre a estrutura
// nova (pessoas/atendimentos/leito_ocupacoes) — diferente do resto do app, não
// precisa de caminho duplo porque essas telas nunca existiram no caminho antigo.

export async function listarAtendimentosAtivos() {
  const { data: ocupacoes, error: erroConsulta1 } = await supabase
    .from('leito_ocupacoes')
    .select('leito_id, atendimento_id, leitos(numero, setor_id, setores(nome))')
    .eq('status', 'ativo')
  if (erroConsulta1) avisarErro('pepMedico', erroConsulta1)

  const atendimentoIds = (ocupacoes ?? []).map((o) => o.atendimento_id)
  if (atendimentoIds.length === 0) return []

  const { data: atendimentos, error: erroConsulta2 } = await supabase
    .from('atendimentos')
    .select('*')
    .in('id', atendimentoIds)
  if (erroConsulta2) avisarErro('pepMedico', erroConsulta2)

  const pessoaIds = [...new Set((atendimentos ?? []).map((a) => a.pessoa_id))]
  const { data: pessoas, error: erroConsulta3 } = await supabase.from('pessoas').select('*').in('id', pessoaIds)
  if (erroConsulta3) avisarErro('pepMedico', erroConsulta3)
  const pessoaPorId = Object.fromEntries((pessoas ?? []).map((p) => [p.id, p]))

  // Mesmos sinais do card da enfermagem: alergia, isolamento e hipótese diagnóstica.
  const [{ data: alergias }, { data: isolamentos }, { data: consultas }] = await Promise.all([
    supabase.from('alergias').select('pessoa_id, substancia, status').in('pessoa_id', pessoaIds),
    supabase.from('isolamentos').select('atendimento_id, tipo, ativo, fim_em').in('atendimento_id', atendimentoIds),
    supabase.from('consultas_medicas').select('atendimento_id, hipotese_diagnostica, criado_em').in('atendimento_id', atendimentoIds).order('criado_em', { ascending: false }),
  ])
  const alergiaPorPessoa = {}
  for (const x of alergias ?? []) {
    if (x.status && /inativ|descart|resolv/i.test(x.status)) continue
    ;(alergiaPorPessoa[x.pessoa_id] ||= []).push(x.substancia)
  }
  const isolamentoPorAtend = {}
  for (const x of isolamentos ?? []) if (x.ativo !== false && !x.fim_em) isolamentoPorAtend[x.atendimento_id] = x.tipo || 'Isolamento'
  const hdPorAtend = {}
  for (const x of consultas ?? []) if (x.hipotese_diagnostica && !hdPorAtend[x.atendimento_id]) hdPorAtend[x.atendimento_id] = x.hipotese_diagnostica

  return (ocupacoes ?? [])
    .map((oc) => {
      const atendimento = (atendimentos ?? []).find((a) => a.id === oc.atendimento_id)
      const pessoa = atendimento ? pessoaPorId[atendimento.pessoa_id] : null
      if (!atendimento || !pessoa) return null
      return {
        atendimento_id: atendimento.id,
        pessoa_id: pessoa.id,
        nome: pessoa.nome,
        idade: calcularIdade(pessoa.data_nascimento) ?? pessoa.idade_informada ?? null,
        sexo: pessoa.sexo,
        leito_numero: oc.leitos?.numero,
        setor_nome: oc.leitos?.setores?.nome,
        status: atendimento.status,
        classificacao: atendimento.classificacao_risco_cor ?? atendimento.classificacao_manchester ?? null,
        status_internacao: atendimento.status_internacao ?? null,
        diagnostico: hdPorAtend[atendimento.id] || atendimento.queixa_principal || null,
        entrada: atendimento.criado_em,
        alergias: (alergiaPorPessoa[pessoa.id] || []).filter(Boolean),
        isolamento: isolamentoPorAtend[atendimento.id] || null,
        regulacao: !!atendimento.regulacao_flag,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.setor_nome ?? '').localeCompare(b.setor_nome ?? '') || (a.leito_numero ?? '').localeCompare(b.leito_numero ?? '', undefined, { numeric: true }))
}

export async function listarConsultas(atendimentoId) {
  const { data, error: erroConsulta4 } = await supabase
    .from('consultas_medicas')
    .select('*, enfermeiros(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta4) avisarErro('pepMedico', erroConsulta4)
  return data ?? []
}

export async function criarConsulta({ atendimentoId, pessoaId, medicoId,  dados, id, situacao }) {
  // Só os 6 campos originais vivem como coluna própria — o restante do
  // formulário de Admissão Médica (identificação do atendimento, alergias,
  // medicamentos em uso, antecedentes, sinais vitais, exame físico
  // estruturado, hipóteses CID-10, conduta, exames, classificação de risco,
  // destino) fica em campos_admissao (jsonb), mesmo padrão da AIH.
  const {
    queixa_principal, historia_doenca_atual, antecedentes,
    revisao_sistemas, exame_geral, hipotese_diagnostica, conduta_inicial,
    ...extras
  } = dados
  return gravar('consultas_medicas', id, {
    atendimento_id: atendimentoId,
    pessoa_id: pessoaId,
    medico_id: medicoId,
    queixa_principal: queixa_principal || null,
    historia_doenca_atual: historia_doenca_atual || null,
    antecedentes: antecedentes || null,
    revisao_sistemas: revisao_sistemas || null,
    exame_geral: exame_geral || null,
    hipotese_diagnostica: hipotese_diagnostica || null,
    conduta_inicial: conduta_inicial || null,
    campos_admissao: extras,
  }, situacao)
}

export async function listarPrescricoes(atendimentoId) {
  // prescricoes_medicas tem 2 FKs pra enfermeiros (medico_id e cancelado_por) —
  // precisa do hint explícito, senão o PostgREST recusa o embed por ambiguidade
  // e a consulta inteira falha (silenciosamente, porque só usamos `data ?? []`).
  const { data, error } = await supabase
    .from('prescricoes_medicas')
    .select('*, enfermeiros!prescricoes_medicas_medico_id_fkey(nome_exibicao, nome, crm, coren, conselho_uf), prescricao_itens(*)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (error) console.error('Erro ao listar prescrições:', error)
  return data ?? []
}

export async function criarPrescricao({ atendimentoId, pessoaId, medicoId, consultaId, observacoes, itens, camposPrescricao, dataReferencia, id, situacao }) {
  const { data: prescricao, error } = await gravar('prescricoes_medicas', id, {
    atendimento_id: atendimentoId,
    pessoa_id: pessoaId,
    medico_id: medicoId,
    consulta_id: consultaId || null,
    observacoes: observacoes || null,
    campos_prescricao: camposPrescricao || {},
    ...(dataReferencia ? { data_referencia: dataReferencia } : {}),
  }, situacao)
  if (error) return { error }

  // Rascunho reaberto: os itens são regravados (o banco só permite isso
  // enquanto a prescrição está em rascunho).
  if (id) {
    const { error: erroLimpa } = await supabase.from('prescricao_itens').delete().eq('prescricao_id', id)
    if (erroLimpa) return { error: erroLimpa }
  }
  const itensPayload = itens.map((it) => ({ ...it, prescricao_id: prescricao.id }))
  const { data: itensSalvos, error: erroItens } = await supabase.from('prescricao_itens').insert(itensPayload).select()
  if (erroItens) return { error: erroItens }

  // Devolve já com os itens (o impresso lê prescricao_itens).
  return { data: { ...prescricao, prescricao_itens: itensSalvos ?? [] } }
}

export async function listarAih(atendimentoId) {
  // aih_solicitacoes tem 2 FKs pra enfermeiros (solicitante_id e encerrado_por) —
  // mesmo problema de listarPrescricoes, precisa do hint explícito.
  const { data, error } = await supabase
    .from('aih_solicitacoes')
    .select('*, enfermeiros!aih_solicitacoes_solicitante_id_fkey(nome_exibicao, nome, crm, coren, conselho_uf), cid_catalog!aih_solicitacoes_cid_principal_fkey(codigo, descricao)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (error) console.error('Erro ao listar AIH:', error)
  return data ?? []
}

// Cabeçalho completo (pessoa + atendimento + leito atual), padrão de todo documento impresso.
export async function buscarCabecalhoImpressao(atendimentoId) {
  const { data: atendimento, error: erroConsulta5 } = await supabase.from('atendimentos').select('*').eq('id', atendimentoId).single()
  if (erroConsulta5) avisarErro('pepMedico', erroConsulta5)
  const { data: pessoa, error: erroConsulta6 } = await supabase.from('pessoas').select('*').eq('id', atendimento.pessoa_id).single()
  if (erroConsulta6) avisarErro('pepMedico', erroConsulta6)
  const { data: ocupacao, error: erroConsulta7 } = await supabase
    .from('leito_ocupacoes')
    .select('leitos(numero, setores(nome))')
    .eq('atendimento_id', atendimentoId)
    .eq('status', 'ativo')
    .maybeSingle()
  if (erroConsulta7) avisarErro('pepMedico', erroConsulta7)
  const { data: alergias, error: erroConsulta8 } = await supabase.from('alergias').select('substancia').eq('pessoa_id', atendimento.pessoa_id).eq('status', 'ativa')
  if (erroConsulta8) avisarErro('pepMedico', erroConsulta8)
  return {
    pessoa: { ...pessoa, alergias_ativas: (alergias ?? []).map((a) => a.substancia).filter(Boolean) },
    atendimento,
    idade: calcularIdade(pessoa.data_nascimento) ?? pessoa.idade_informada ?? null,
    leitoNumero: ocupacao?.leitos?.numero ?? null,
    setorNome: ocupacao?.leitos?.setores?.nome ?? null,
  }
}

export async function criarAih({ atendimentoId, pessoaId, solicitanteId,  dados, id, situacao, medicoDestinoId, encaminhar = false }) {
  // Só procedimento/CID vivem como coluna própria — o resto dos campos do
  // formulário oficial do SUS (sinais clínicos, diagnóstico inicial, clínica,
  // caráter da internação etc.) fica em campos_formulario (jsonb) pra não
  // precisar de migration a cada campo novo do laudo.
  const {
    procedimento_principal_nome, procedimento_principal_codigo, procedimento_secundario_codigo,
    cid_principal, cid_secundario,
    ...extras
  } = dados
  return gravar('aih_solicitacoes', id, {
    atendimento_id: atendimentoId,
    pessoa_id: pessoaId,
    solicitante_id: solicitanteId,
    procedimento_principal_nome: procedimento_principal_nome || null,
    procedimento_principal_codigo: procedimento_principal_codigo || null,
    procedimento_secundario_codigo: procedimento_secundario_codigo || null,
    cid_principal: cid_principal || null,
    cid_secundario: cid_secundario || null,
    campos_formulario: extras,
    // AIH pré-preenchida pela enfermagem/recepção: vai para o médico que revisa e assina.
    ...(medicoDestinoId ? { medico_destino_id: medicoDestinoId } : {}),
    ...(encaminhar ? { encaminhado_em: new Date().toISOString() } : {}),
  }, situacao)
}

// Médicos ativos (destinatários possíveis de uma AIH pré-preenchida).
export async function listarMedicosAtivos() {
  const { data, error } = await supabase.from('enfermeiros').select('id, nome, nome_exibicao, crm, conselho_uf, ativo').eq('tipo', 'medico')
  if (error) { avisarErro('pepMedico', error); return [] }
  return (data ?? []).filter((m) => m.ativo !== false).sort((a, b) => (a.nome_exibicao || a.nome || '').localeCompare(b.nome_exibicao || b.nome || ''))
}

// Catálogo básico de medicamentos — carregado uma vez (tabela pequena) e
// filtrado no cliente pra dar sugestão instantânea ao digitar, sem round-trip
// por tecla. Ver AutocompleteMedicamento em FichaMedica.jsx.
export async function listarCatalogoMedicamentos() {
  const { data, error: erroConsulta9 } = await supabase
    .from('catalogo_medicamentos')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  if (erroConsulta9) avisarErro('pepMedico', erroConsulta9)
  return data ?? []
}

// Busca no catálogo CID-10 (14 mil códigos) direto no banco — carregar tudo
// de uma vez era cortado em 1.000 linhas pelo servidor e pesava na tela.
export async function pesquisarCid(termo) {
  const t = String(termo || '').trim().replace(/[%,()]/g, ' ')
  if (t.length < 2) return []
  const { data, error: erroConsulta10 } = await supabase.from('cid_catalog').select('codigo, descricao')
    .or(`codigo.ilike.${t}%,descricao.ilike.%${t}%`).order('codigo').limit(30)
  if (erroConsulta10) avisarErro('pepMedico', erroConsulta10)
  return data ?? []
}

// ===================== Exames / sorologias / hemoterapia (multi-item) =====================
// Substituem os antigos campos únicos exame_nome/sorologias/hemo_tipo em
// `passagens` — um atendimento pode ter vários em paralelo.

export async function listarExames(atendimentoId) {
  const { data, error: erroConsulta11 } = await supabase.from('exames_solicitados').select('*, enfermeiros!exames_solicitados_solicitado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false })
  if (erroConsulta11) avisarErro('pepMedico', erroConsulta11)
  return data ?? []
}

export async function criarExame({ atendimentoId, nome, preparo, agendadoPara, local, solicitadoPor, modalidade, exames, justificativa, urgencia, id, situacao }) {
  return gravar('exames_solicitados', id, {
    atendimento_id: atendimentoId, nome, preparo: preparo || null,
    agendado_para: agendadoPara || null, local: local || null, status: 'a_realizar',
    solicitado_por: solicitadoPor || null, modalidade: modalidade || null, tipo: modalidade || null,
    exames: exames || null, justificativa_clinica: justificativa || null, urgencia: urgencia || null,
  }, situacao, '*, enfermeiros!exames_solicitados_solicitado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
}

export async function listarSorologias(atendimentoId) {
  const { data, error: erroConsulta12 } = await supabase.from('sorologias_notificaveis').select('*').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false })
  if (erroConsulta12) avisarErro('pepMedico', erroConsulta12)
  return data ?? []
}

export async function listarHemoterapia(atendimentoId) {
  const { data, error: erroConsulta13 } = await supabase.from('solicitacoes_hemoterapia').select('*').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false })
  if (erroConsulta13) avisarErro('pepMedico', erroConsulta13)
  return data ?? []
}

// ===================== Plano terapêutico (no máximo um por atendimento) =====================

export async function buscarPlanoTerapeutico(atendimentoId) {
  const { data, error: erroConsulta14 } = await supabase
    .from('planos_terapeuticos')
    .select('*, enfermeiros!planos_terapeuticos_criado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .neq('situacao', 'invalido')
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (erroConsulta14) avisarErro('pepMedico', erroConsulta14)
  return data
}

export async function salvarPlanoTerapeutico({ atendimentoId, criadoPor, dados, situacao }) {
  const existente = await buscarPlanoTerapeutico(atendimentoId)
  if (existente?.situacao === 'finalizado') return { data: null, error: { message: MSG_FINALIZADO } }
  if (existente) {
    return gravar('planos_terapeuticos', existente.id, { ...dados }, situacao)
  }
  return gravar('planos_terapeuticos', null, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao)
}

// ===================== Sumário de alta (no máximo um por atendimento) =====================

export async function buscarSumarioAlta(atendimentoId) {
  const { data, error: erroConsulta15 } = await supabase
    .from('sumarios_alta')
    .select('*, enfermeiros!sumarios_alta_criado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .neq('situacao', 'invalido')
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (erroConsulta15) avisarErro('pepMedico', erroConsulta15)
  return data
}

export async function salvarSumarioAlta({ atendimentoId, criadoPor, dados, situacao }) {
  const existente = await buscarSumarioAlta(atendimentoId)
  if (existente?.situacao === 'finalizado') return { data: null, error: { message: MSG_FINALIZADO } }
  if (existente) {
    return gravar('sumarios_alta', existente.id, { ...dados, atualizado_em: new Date().toISOString() }, situacao)
  }
  return gravar('sumarios_alta', null, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao)
}

// ===================== APAC =====================

export async function listarApac(atendimentoId) {
  const { data, error: erroConsulta16 } = await supabase
    .from('apac_solicitacoes')
    .select('*, enfermeiros!apac_solicitacoes_solicitado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('solicitado_em', { ascending: false })
  if (erroConsulta16) avisarErro('pepMedico', erroConsulta16)
  return data ?? []
}

export async function criarApac({ atendimentoId, solicitanteId, dados, id, situacao }) {
  const inserir = (d) => gravar('apac_solicitacoes', id, { atendimento_id: atendimentoId, solicitado_por: solicitanteId, ...d }, situacao)
  const res = await inserir(dados)
  // cid_principal/cid_secundario têm FK para o catálogo de CID; um código fora do
  // catálogo não pode travar o laudo — grava sem a coluna (o CID digitado continua
  // em campos_formulario e sai na impressão).
  if (res.error?.code === '23503' && /cid_/.test(res.error.message || '')) {
    return inserir({ ...dados, cid_principal: null, cid_secundario: null })
  }
  return res
}

// ===================== ATM (antibiótico de uso restrito) =====================

export async function listarAtm(atendimentoId) {
  const { data, error: erroConsulta17 } = await supabase
    .from('solicitacoes_atm')
    .select('*, enfermeiros!solicitacoes_atm_solicitado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta17) avisarErro('pepMedico', erroConsulta17)
  return data ?? []
}

export async function criarAtm({ atendimentoId, solicitanteId, dados, id, situacao }) {
  return gravar('solicitacoes_atm', id, { atendimento_id: atendimentoId, solicitado_por: solicitanteId, ...dados }, situacao, '*')
}

// ===================== TFD (tratamento fora do domicílio) =====================

export async function listarTfd(atendimentoId) {
  const { data, error: erroConsulta18 } = await supabase
    .from('tfd_solicitacoes')
    .select('*, enfermeiros(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta18) avisarErro('pepMedico', erroConsulta18)
  return data ?? []
}

export async function criarTfd({ atendimentoId, profissionalResponsavel, dados, id, situacao }) {
  return gravar('tfd_solicitacoes', id, { atendimento_id: atendimentoId, profissional_responsavel: profissionalResponsavel, ...dados }, situacao, '*')
}

// ===================== Evolução Médica Diária =====================

export async function listarEvolucoesMedicas(atendimentoId) {
  const { data, error: erroConsulta19 } = await supabase
    .from('evolucoes_medicas')
    .select('*, enfermeiros!evolucoes_medicas_criado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta19) avisarErro('pepMedico', erroConsulta19)
  return data ?? []
}

export async function criarEvolucaoMedica({ atendimentoId, criadoPor, dados, id, situacao }) {
  return gravar('evolucoes_medicas', id, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao, '*')
}

// ===================== Admissão de Enfermagem (Histórico de Enfermagem) — no máximo um por atendimento =====================

export async function buscarHistoricoEnfermagem(atendimentoId) {
  const { data, error: erroConsulta20 } = await supabase
    .from('historico_enfermagem')
    .select('*, enfermeiros!historico_enfermagem_criado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .neq('situacao', 'invalido')
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (erroConsulta20) avisarErro('pepMedico', erroConsulta20)
  return data
}

export async function salvarHistoricoEnfermagem({ atendimentoId, criadoPor, dados, situacao }) {
  const existente = await buscarHistoricoEnfermagem(atendimentoId)
  if (existente?.situacao === 'finalizado') return { data: null, error: { message: MSG_FINALIZADO } }
  if (existente) {
    return gravar('historico_enfermagem', existente.id, { ...dados, atualizado_em: new Date().toISOString() }, situacao)
  }
  return gravar('historico_enfermagem', null, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao)
}

// ===================== Nota de Intercorrência Médica =====================

export async function listarNotasIntercorrenciaMedica(atendimentoId) {
  const { data, error: erroConsulta21 } = await supabase
    .from('notas_intercorrencia_medica')
    .select('*, enfermeiros!notas_intercorrencia_medica_criado_por_fkey(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta21) avisarErro('pepMedico', erroConsulta21)
  return data ?? []
}

export async function criarNotaIntercorrenciaMedica({ atendimentoId, criadoPor, dados, id, situacao }) {
  return gravar('notas_intercorrencia_medica', id, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao, '*')
}

// ===================== Receituário Médico =====================

export async function listarReceitasMedicas(atendimentoId) {
  const { data, error: erroConsulta22 } = await supabase
    .from('receitas_medicas')
    .select('*, enfermeiros(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta22) avisarErro('pepMedico', erroConsulta22)
  return data ?? []
}

export async function criarReceitaMedica({ atendimentoId, criadoPor, dados, id, situacao }) {
  return gravar('receitas_medicas', id, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao, '*')
}

// ===================== Atestado Médico =====================

export async function listarAtestadosMedicos(atendimentoId) {
  const { data, error: erroConsulta23 } = await supabase
    .from('atestados_medicos')
    .select('*, enfermeiros(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta23) avisarErro('pepMedico', erroConsulta23)
  return data ?? []
}

export async function criarAtestadoMedico({ atendimentoId, criadoPor, dados, id, situacao }) {
  return gravar('atestados_medicos', id, { atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }, situacao, '*')
}

// ===================== Solicitação de Sangue, Componentes e Derivados (Hemopa) =====================

export async function listarSolicitacoesSangue(atendimentoId) {
  const { data, error: erroConsulta24 } = await supabase
    .from('solicitacoes_sangue')
    .select('*, enfermeiros(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (erroConsulta24) avisarErro('pepMedico', erroConsulta24)
  return data ?? []
}

export async function criarSolicitacaoSangue({ atendimentoId, solicitadoPor, dados, id, situacao }) {
  return gravar('solicitacoes_sangue', id, { atendimento_id: atendimentoId, solicitado_por: solicitadoPor, ...dados }, situacao, '*')
}

// ===================== Atualizações de regulação (SER/SISREG) =====================

export async function listarRegulacao(atendimentoId) {
  const { data, error: erroConsulta25 } = await supabase
    .from('regulacao_atualizacoes')
    .select('*, enfermeiros(nome_exibicao, nome, crm, coren, conselho_uf)')
    .eq('atendimento_id', atendimentoId)
    .order('atualizado_em', { ascending: false })
  if (erroConsulta25) avisarErro('pepMedico', erroConsulta25)
  return data ?? []
}

export async function registrarRegulacao({ atendimentoId, atualizadoPor, dados, id, situacao }) {
  return gravar('regulacao_atualizacoes', id, { atendimento_id: atendimentoId, atualizado_por: atualizadoPor, ...dados }, situacao, '*')
}

// Abertura da regulação (flag + tipo + data) vive em `atendimentos`, separada
// do histórico de atualizações em `regulacao_atualizacoes` — é um status do
// episódio, não uma entrada de log (mesmo padrão de status_internacao e
// classificacao_risco_cor, que também vivem em atendimentos).
export async function buscarAberturaRegulacao(atendimentoId) {
  const { data, error: erroConsulta26 } = await supabase
    .from('atendimentos')
    .select('regulacao_flag, regulacao_tipo, regulacao_aberta_em')
    .eq('id', atendimentoId)
    .maybeSingle()
  if (erroConsulta26) avisarErro('pepMedico', erroConsulta26)
  return data
}

export async function abrirRegulacao(atendimentoId, tipo) {
  return supabase
    .from('atendimentos')
    .update({ regulacao_flag: true, regulacao_tipo: tipo, regulacao_aberta_em: new Date().toISOString() })
    .eq('id', atendimentoId)
}

export async function encerrarRegulacao(atendimentoId) {
  return supabase.from('atendimentos').update({ regulacao_flag: false }).eq('id', atendimentoId)
}

// ===================== Medicações contínuas =====================
// Vive em `pessoas`, não no atendimento — uso contínuo em casa atravessa
// internações diferentes (citado na Evolução Médica real).

// Profissional autor de um registro (quando o registro recém-salvo não veio
// com o join de enfermeiros): procura pela coluna de autoria da tabela.
const COLUNAS_AUTOR = ['autor_id', 'criado_por', 'enfermeiro_entrega', 'transferido_por', 'solicitado_por', 'solicitante_id', 'medico_id', 'relator_id', 'registrado_por', 'enfermeiro_id', 'profissional_responsavel', 'atualizado_por', 'autor_auth']
export async function buscarAutorRegistro(registro) {
  if (!registro) return null
  const id = COLUNAS_AUTOR.map((c) => registro[c]).find((v) => typeof v === 'string' && v.length > 20)
  if (!id) return null
  const { data, error: erroConsulta27 } = await supabase.from('enfermeiros').select('nome_exibicao, nome, crm, coren, conselho_uf, funcao, registro_profissional').eq('id', id).maybeSingle()
  if (erroConsulta27) avisarErro('pepMedico', erroConsulta27)
  return data
}

// Mensagem clara para erro ao salvar (CID fora do catálogo, sessão expirada, etc.).
export function mensagemErroSalvar(error, documento = 'o registro') {
  const txt = `${error?.message || ''} ${error?.details || ''}`
  if (error?.code === '23503' && /cid/i.test(txt)) return 'CID não encontrado na tabela CID-10. Confira o código (ex.: J18.9) e tente de novo.'
  if (error?.code === '42501' || /JWT|permission|row-level/i.test(txt)) return 'Sua sessão expirou ou não tem permissão. Entre novamente no sistema.'
  return `Não foi possível salvar ${documento}. Tente de novo.`
}

// Sugestão para o Sumário de Alta: o que já foi registrado na admissão/AIH.
export async function buscarDadosParaSumario(atendimentoId) {
  const [{ data: atd }, { data: intern }, { data: cons }, { data: aih }] = await Promise.all([
    supabase.from('atendimentos').select('criado_em, queixa_principal').eq('id', atendimentoId).maybeSingle(),
    supabase.from('internacoes').select('internado_em, diagnostico_admissao').eq('atendimento_id', atendimentoId).order('internado_em', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('consultas_medicas').select('hipotese_diagnostica').eq('atendimento_id', atendimentoId).neq('situacao', 'invalido').order('criado_em', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('aih_solicitacoes').select('cid_principal').eq('atendimento_id', atendimentoId).neq('situacao', 'invalido').order('criado_em', { ascending: false }).limit(1).maybeSingle(),
  ])
  const inicio = intern?.internado_em || atd?.criado_em
  return {
    data_internacao: inicio ? String(inicio).slice(0, 10) : '',
    diagnostico_internacao: cons?.hipotese_diagnostica || intern?.diagnostico_admissao || atd?.queixa_principal || '',
    cid_internacao: aih?.cid_principal || '',
  }
}
