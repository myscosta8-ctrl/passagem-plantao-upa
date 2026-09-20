import { supabase } from './supabaseClient'
import { calcularIdade, registrarEventoAuditoria } from './pepAtendimentos'

// Camada de dados do módulo médico (Fase 1 do PEP). Só existe sobre a estrutura
// nova (pessoas/atendimentos/leito_ocupacoes) — diferente do resto do app, não
// precisa de caminho duplo porque essas telas nunca existiram no caminho antigo.

export async function listarAtendimentosAtivos() {
  const { data: ocupacoes } = await supabase
    .from('leito_ocupacoes')
    .select('leito_id, atendimento_id, leitos(numero, setor_id, setores(nome))')
    .eq('status', 'ativo')

  const atendimentoIds = (ocupacoes ?? []).map((o) => o.atendimento_id)
  if (atendimentoIds.length === 0) return []

  const { data: atendimentos } = await supabase
    .from('atendimentos')
    .select('*')
    .in('id', atendimentoIds)

  const pessoaIds = [...new Set((atendimentos ?? []).map((a) => a.pessoa_id))]
  const { data: pessoas } = await supabase.from('pessoas').select('*').in('id', pessoaIds)
  const pessoaPorId = Object.fromEntries((pessoas ?? []).map((p) => [p.id, p]))

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
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.setor_nome ?? '').localeCompare(b.setor_nome ?? '') || (a.leito_numero ?? '').localeCompare(b.leito_numero ?? '', undefined, { numeric: true }))
}

export async function listarConsultas(atendimentoId) {
  const { data } = await supabase
    .from('consultas_medicas')
    .select('*, enfermeiros(nome_exibicao, nome, crm)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarConsulta({ atendimentoId, pessoaId, medicoId, dados }) {
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
  return supabase.from('consultas_medicas').insert({
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
  }).select().single()
}

export async function listarPrescricoes(atendimentoId) {
  // prescricoes_medicas tem 2 FKs pra enfermeiros (medico_id e cancelado_por) —
  // precisa do hint explícito, senão o PostgREST recusa o embed por ambiguidade
  // e a consulta inteira falha (silenciosamente, porque só usamos `data ?? []`).
  const { data, error } = await supabase
    .from('prescricoes_medicas')
    .select('*, enfermeiros!prescricoes_medicas_medico_id_fkey(nome_exibicao, nome, crm), prescricao_itens(*)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (error) console.error('Erro ao listar prescrições:', error)
  return data ?? []
}

export async function criarPrescricao({ atendimentoId, pessoaId, medicoId, consultaId, observacoes, itens }) {
  const { data: prescricao, error } = await supabase
    .from('prescricoes_medicas')
    .insert({
      atendimento_id: atendimentoId,
      pessoa_id: pessoaId,
      medico_id: medicoId,
      consulta_id: consultaId || null,
      observacoes: observacoes || null,
    })
    .select()
    .single()
  if (error) return { error }

  const itensPayload = itens.map((it) => ({ ...it, prescricao_id: prescricao.id }))
  const { error: erroItens } = await supabase.from('prescricao_itens').insert(itensPayload)
  if (erroItens) return { error: erroItens }

  return { data: prescricao }
}

export async function cancelarPrescricao(prescricaoId, medicoId, motivo) {
  return supabase
    .from('prescricoes_medicas')
    .update({ status: 'cancelada', cancelado_em: new Date().toISOString(), cancelado_por: medicoId, motivo_cancelamento: motivo || null })
    .eq('id', prescricaoId)
}

export async function listarAih(atendimentoId) {
  // aih_solicitacoes tem 2 FKs pra enfermeiros (solicitante_id e encerrado_por) —
  // mesmo problema de listarPrescricoes, precisa do hint explícito.
  const { data, error } = await supabase
    .from('aih_solicitacoes')
    .select('*, enfermeiros!aih_solicitacoes_solicitante_id_fkey(nome_exibicao, nome, crm), cid_catalog!aih_solicitacoes_cid_principal_fkey(codigo, descricao)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  if (error) console.error('Erro ao listar AIH:', error)
  return data ?? []
}

// Cabeçalho completo (pessoa + atendimento + leito atual), padrão de todo documento impresso.
export async function buscarCabecalhoImpressao(atendimentoId) {
  const { data: atendimento } = await supabase.from('atendimentos').select('*').eq('id', atendimentoId).single()
  const { data: pessoa } = await supabase.from('pessoas').select('*').eq('id', atendimento.pessoa_id).single()
  const { data: ocupacao } = await supabase
    .from('leito_ocupacoes')
    .select('leitos(numero, setores(nome))')
    .eq('atendimento_id', atendimentoId)
    .eq('status', 'ativo')
    .maybeSingle()
  return {
    pessoa,
    atendimento,
    idade: calcularIdade(pessoa.data_nascimento) ?? pessoa.idade_informada ?? null,
    leitoNumero: ocupacao?.leitos?.numero ?? null,
    setorNome: ocupacao?.leitos?.setores?.nome ?? null,
  }
}

export async function criarAih({ atendimentoId, pessoaId, solicitanteId, dados }) {
  // Só procedimento/CID vivem como coluna própria — o resto dos campos do
  // formulário oficial do SUS (sinais clínicos, diagnóstico inicial, clínica,
  // caráter da internação etc.) fica em campos_formulario (jsonb) pra não
  // precisar de migration a cada campo novo do laudo.
  const {
    procedimento_principal_nome, procedimento_principal_codigo, procedimento_secundario_codigo,
    cid_principal, cid_secundario,
    ...extras
  } = dados
  return supabase.from('aih_solicitacoes').insert({
    atendimento_id: atendimentoId,
    pessoa_id: pessoaId,
    solicitante_id: solicitanteId,
    procedimento_principal_nome: procedimento_principal_nome || null,
    procedimento_principal_codigo: procedimento_principal_codigo || null,
    procedimento_secundario_codigo: procedimento_secundario_codigo || null,
    cid_principal: cid_principal || null,
    cid_secundario: cid_secundario || null,
    campos_formulario: extras,
  }).select().single()
}

// Catálogo básico de medicamentos — carregado uma vez (tabela pequena) e
// filtrado no cliente pra dar sugestão instantânea ao digitar, sem round-trip
// por tecla. Ver AutocompleteMedicamento em FichaMedica.jsx.
export async function listarCatalogoMedicamentos() {
  const { data } = await supabase
    .from('catalogo_medicamentos')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  return data ?? []
}

export async function listarCatalogoCid() {
  const { data } = await supabase.from('cid_catalog').select('codigo, descricao').order('codigo')
  return data ?? []
}

// Diagnóstico principal codificado da internação (distinto do CID da AIH,
// que é específico do procedimento solicitado).
export async function buscarInternacao(atendimentoId) {
  const { data } = await supabase
    .from('internacoes')
    .select('*, cid_catalog!internacoes_diagnostico_cid_fkey(codigo, descricao)')
    .eq('atendimento_id', atendimentoId)
    .maybeSingle()
  return data
}

export async function atualizarDiagnosticoCid(atendimentoId, cid, autorId) {
  const resultado = await supabase.from('internacoes').update({ diagnostico_cid: cid || null }).eq('atendimento_id', atendimentoId)
  if (!resultado.error) {
    await registrarEventoAuditoria({ atendimentoId, autorId, acao: 'diagnostico_cid_atualizado', dados: { cid: cid || null } })
  }
  return resultado
}

// ===================== Exames / sorologias / hemoterapia (multi-item) =====================
// Substituem os antigos campos únicos exame_nome/sorologias/hemo_tipo em
// `passagens` — um atendimento pode ter vários em paralelo.

export async function listarExames(atendimentoId) {
  const { data } = await supabase.from('exames_solicitados').select('*').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarExame({ atendimentoId, nome, preparo, agendadoPara, local }) {
  return supabase.from('exames_solicitados').insert({
    atendimento_id: atendimentoId, nome, preparo: preparo || null,
    agendado_para: agendadoPara || null, local: local || null, status: 'a_realizar',
  }).select().single()
}

export async function atualizarExame(id, { status, resultado }) {
  return supabase.from('exames_solicitados').update({ status, resultado: resultado || null }).eq('id', id)
}

export async function listarSorologias(atendimentoId) {
  const { data } = await supabase.from('sorologias_notificaveis').select('*').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarSorologia({ atendimentoId, agravo, dataColeta }) {
  return supabase.from('sorologias_notificaveis').insert({
    atendimento_id: atendimentoId, agravo, data_coleta: dataColeta || null, status: 'coleta_pendente',
  }).select().single()
}

export async function atualizarSorologia(id, { status, dataNotificacao }) {
  return supabase.from('sorologias_notificaveis').update({ status, data_notificacao: dataNotificacao || null }).eq('id', id)
}

export async function listarHemoterapia(atendimentoId) {
  const { data } = await supabase.from('solicitacoes_hemoterapia').select('*').eq('atendimento_id', atendimentoId).order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarHemoterapia({ atendimentoId, tipo, quantidade, solicitadoEm }) {
  return supabase.from('solicitacoes_hemoterapia').insert({
    atendimento_id: atendimentoId, tipo, quantidade: quantidade || null,
    solicitado_em: solicitadoEm ? `${solicitadoEm}T00:00:00` : new Date().toISOString(),
  }).select().single()
}

export async function marcarTransfundido(id, transfundidoEm) {
  return supabase.from('solicitacoes_hemoterapia').update({
    transfundido_em: transfundidoEm ? `${transfundidoEm}T00:00:00` : new Date().toISOString(),
  }).eq('id', id)
}

// ===================== Plano terapêutico (no máximo um por atendimento) =====================

export async function buscarPlanoTerapeutico(atendimentoId) {
  const { data } = await supabase
    .from('planos_terapeuticos')
    .select('*, enfermeiros(nome_exibicao, nome, crm)')
    .eq('atendimento_id', atendimentoId)
    .maybeSingle()
  return data
}

export async function salvarPlanoTerapeutico({ atendimentoId, criadoPor, dados }) {
  const existente = await buscarPlanoTerapeutico(atendimentoId)
  if (existente) {
    return supabase.from('planos_terapeuticos').update(dados).eq('id', existente.id).select().single()
  }
  return supabase.from('planos_terapeuticos').insert({ atendimento_id: atendimentoId, criado_por: criadoPor, ...dados }).select().single()
}

// ===================== APAC =====================

export async function listarApac(atendimentoId) {
  const { data } = await supabase
    .from('apac_solicitacoes')
    .select('*, enfermeiros(nome_exibicao, nome, crm)')
    .eq('atendimento_id', atendimentoId)
    .order('solicitado_em', { ascending: false })
  return data ?? []
}

export async function criarApac({ atendimentoId, solicitanteId, dados }) {
  return supabase.from('apac_solicitacoes').insert({ atendimento_id: atendimentoId, solicitado_por: solicitanteId, ...dados }).select().single()
}

// ===================== ATM (antibiótico de uso restrito) =====================

export async function listarAtm(atendimentoId) {
  const { data } = await supabase
    .from('solicitacoes_atm')
    .select('*, enfermeiros!solicitacoes_atm_solicitado_por_fkey(nome_exibicao, nome, crm)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarAtm({ atendimentoId, solicitanteId, dados }) {
  return supabase.from('solicitacoes_atm').insert({ atendimento_id: atendimentoId, solicitado_por: solicitanteId, ...dados }).select().single()
}

// ===================== TFD (tratamento fora do domicílio) =====================

export async function listarTfd(atendimentoId) {
  const { data } = await supabase
    .from('tfd_solicitacoes')
    .select('*, enfermeiros(nome_exibicao, nome, crm)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarTfd({ atendimentoId, profissionalResponsavel, dados }) {
  return supabase.from('tfd_solicitacoes').insert({ atendimento_id: atendimentoId, profissional_responsavel: profissionalResponsavel, ...dados }).select().single()
}

// ===================== Atualizações de regulação (SER/SISREG) =====================

export async function listarRegulacao(atendimentoId) {
  const { data } = await supabase
    .from('regulacao_atualizacoes')
    .select('*, enfermeiros(nome_exibicao, nome, crm)')
    .eq('atendimento_id', atendimentoId)
    .order('atualizado_em', { ascending: false })
  return data ?? []
}

export async function registrarRegulacao({ atendimentoId, atualizadoPor, dados }) {
  return supabase.from('regulacao_atualizacoes').insert({ atendimento_id: atendimentoId, atualizado_por: atualizadoPor, ...dados }).select().single()
}

// Abertura da regulação (flag + tipo + data) vive em `atendimentos`, separada
// do histórico de atualizações em `regulacao_atualizacoes` — é um status do
// episódio, não uma entrada de log (mesmo padrão de status_internacao e
// classificacao_risco_cor, que também vivem em atendimentos).
export async function buscarAberturaRegulacao(atendimentoId) {
  const { data } = await supabase
    .from('atendimentos')
    .select('regulacao_flag, regulacao_tipo, regulacao_aberta_em')
    .eq('id', atendimentoId)
    .maybeSingle()
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

export async function listarMedicacoesContinuas(pessoaId) {
  const { data } = await supabase
    .from('medicacoes_continuas')
    .select('*, enfermeiros(nome_exibicao, nome, crm)')
    .eq('pessoa_id', pessoaId)
    .order('registrado_em', { ascending: false })
  return data ?? []
}

export async function registrarMedicacaoContinua({ pessoaId, medicamento, dose, frequencia, registradoPor }) {
  return supabase
    .from('medicacoes_continuas')
    .insert({ pessoa_id: pessoaId, medicamento, dose: dose || null, frequencia: frequencia || null, registrado_por: registradoPor, status: 'ativo' })
    .select()
    .single()
}

export async function suspenderMedicacaoContinua(id) {
  return supabase.from('medicacoes_continuas').update({ status: 'suspenso' }).eq('id', id)
}
