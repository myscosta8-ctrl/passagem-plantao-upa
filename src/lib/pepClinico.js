import { supabase } from './supabaseClient.js'

// Fase 2 (piloto Observação/Internação) — ficha clínica contínua do
// enfermeiro: admissão (exame físico por marcação) + sinais vitais em série.
// Só existe sobre a estrutura nova do PEP (pessoas/atendimentos).

export async function listarSinaisVitais(atendimentoId) {
  const { data } = await supabase
    .from('sinais_vitais')
    .select('*, enfermeiros(nome_exibicao, nome)')
    .eq('atendimento_id', atendimentoId)
    .order('registrado_em', { ascending: false })
  return data ?? []
}

export async function registrarSinaisVitais({ atendimentoId, registradoPor, dados }) {
  const limpo = {}
  for (const chave of ['pa_sistolica', 'pa_diastolica', 'fc', 'fr', 'spo2', 'temperatura', 'glicemia', 'dor_escala']) {
    limpo[chave] = dados[chave] === '' || dados[chave] === undefined ? null : Number(dados[chave])
  }
  return supabase
    .from('sinais_vitais')
    .insert({ atendimento_id: atendimentoId, registrado_por: registradoPor, ...limpo })
    .select()
    .single()
}

export async function listarEvolucoes(atendimentoId) {
  const { data } = await supabase
    .from('evolucoes')
    // evolucoes tem 2 FKs para enfermeiros (autor_id e enfermeiro_id): sem o hint o
    // PostgREST recusa o embed (300) e a lista volta vazia.
    .select('*, enfermeiros!evolucoes_autor_id_fkey(nome_exibicao, nome, coren)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function registrarEvolucao({ atendimentoId, autorId, texto, diagnosticosNanda, prescricaoNic, objetivo }) {
  return supabase
    .from('evolucoes')
    .insert({
      atendimento_id: atendimentoId, autor_id: autorId, autor_tipo: 'enfermagem', tipo: 'enfermagem', texto,
      diagnosticos_nanda: diagnosticosNanda?.length ? diagnosticosNanda : null,
      prescricao_nic: prescricaoNic?.length ? prescricaoNic : null,
      objetivo: objetivo || null,
    })
    .select()
    .single()
}

export async function listarDispositivos(atendimentoId) {
  const { data } = await supabase
    .from('dispositivos_invasivos')
    .select('*')
    .eq('atendimento_id', atendimentoId)
    .order('inserido_em', { ascending: false })
  return data ?? []
}

export async function inserirDispositivo({ atendimentoId, tipo, localInsercao, trocaPrevistaEm }) {
  return supabase
    .from('dispositivos_invasivos')
    .insert({
      atendimento_id: atendimentoId,
      tipo,
      local_insercao: localInsercao || null,
      troca_prevista_em: trocaPrevistaEm || null,
    })
    .select()
    .single()
}

export async function removerDispositivo({ id, motivo }) {
  return supabase
    .from('dispositivos_invasivos')
    .update({ removido_em: new Date().toISOString(), motivo_remocao: motivo || null })
    .eq('id', id)
    .select()
    .single()
}

export async function listarBalancoHidrico(atendimentoId) {
  const { data } = await supabase
    .from('balanco_hidrico')
    .select('*')
    .eq('atendimento_id', atendimentoId)
    .order('registrado_em', { ascending: false })
  return data ?? []
}

export async function registrarBalancoHidrico({ atendimentoId, registradoPor, tipo, via, volumeMl, observacao, registradoEm }) {
  return supabase
    .from('balanco_hidrico')
    .insert({
      atendimento_id: atendimentoId,
      registrado_por: registradoPor,
      tipo,
      via,
      volume_ml: Number(volumeMl),
      observacao: observacao || null,
      ...(registradoEm ? { registrado_em: registradoEm } : {}),
    })
    .select()
    .single()
}

export async function listarEscalas(atendimentoId) {
  const { data } = await supabase
    .from('escalas_enfermagem')
    .select('*')
    .eq('atendimento_id', atendimentoId)
    .order('avaliado_em', { ascending: false })
  return data ?? []
}

export async function registrarEscala({ atendimentoId, tipo, pontuacao, nivelRisco, detalhes }) {
  return supabase
    .from('escalas_enfermagem')
    .insert({ atendimento_id: atendimentoId, tipo, pontuacao, nivel_risco: nivelRisco, detalhes })
    .select()
    .single()
}

// Alergias são da PESSOA (atravessam internações diferentes), não do
// atendimento — igual medicações contínuas. Lista de verdade: várias por
// pessoa, cada uma com substância/reação/gravidade, nunca um sim/não só.
export async function listarAlergias(pessoaId) {
  const { data } = await supabase
    .from('alergias')
    .select('*')
    .eq('pessoa_id', pessoaId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function registrarAlergia({ pessoaId, substancia, reacao, gravidade }) {
  return supabase
    .from('alergias')
    .insert({ pessoa_id: pessoaId, substancia, reacao: reacao || null, gravidade: gravidade || null, status: 'ativa' })
    .select()
    .single()
}

export async function inativarAlergia(alergiaId) {
  return supabase.from('alergias').update({ status: 'inativa' }).eq('id', alergiaId)
}

// ===================== Isolamentos =====================
// Formaliza o que só existia informalmente — precaução de contato,
// gotículas ou aerossol, com motivo e patógeno suspeito.

export async function listarIsolamentos(atendimentoId) {
  const { data } = await supabase
    .from('isolamentos')
    .select('*, enfermeiros(nome_exibicao, nome)')
    .eq('atendimento_id', atendimentoId)
    .order('inicio_em', { ascending: false })
  return data ?? []
}

export async function registrarIsolamento({ atendimentoId, tipo, motivo, patogenoSuspeito, prescritoPor }) {
  return supabase
    .from('isolamentos')
    .insert({
      atendimento_id: atendimentoId, tipo, motivo: motivo || null, patogeno_suspeito: patogenoSuspeito || null,
      prescrito_por: prescritoPor || null, inicio_em: new Date().toISOString(), ativo: true,
    })
    .select()
    .single()
}

export async function encerrarIsolamento(id) {
  return supabase.from('isolamentos').update({ ativo: false, fim_em: new Date().toISOString() }).eq('id', id)
}

// ===================== Transferência SBAR (handoff estruturado entre setores) =====================
// Liga a leito_ocupacoes (a ocupação sendo encerrada pela transferência), não
// direto ao atendimento — por isso busca o histórico de ocupações primeiro.

export async function buscarOcupacaoAtiva(atendimentoId) {
  const { data } = await supabase
    .from('leito_ocupacoes')
    .select('id, leito_id, leitos(numero, setor_id, setores(nome))')
    .eq('atendimento_id', atendimentoId)
    .eq('status', 'ativo')
    .maybeSingle()
  return data
}

export async function listarTransferenciasSbar(atendimentoId) {
  // Transferências novas guardam atendimento_id; as antigas só o leito_ocupacao_id.
  const { data: ocupacoes } = await supabase.from('leito_ocupacoes').select('id').eq('atendimento_id', atendimentoId)
  const ids = (ocupacoes ?? []).map((o) => o.id)
  const filtro = ids.length ? `atendimento_id.eq.${atendimentoId},leito_ocupacao_id.in.(${ids.join(',')})` : `atendimento_id.eq.${atendimentoId}`
  const { data, error } = await supabase
    .from('transferencias_sbar')
    .select('*, setores:setor_destino_id(nome), entrega:enfermeiro_entrega(nome_exibicao, nome, coren), recebe:enfermeiro_recebe(nome_exibicao, nome)')
    .or(filtro)
    .order('criado_em', { ascending: false })
  if (error) console.error('Erro ao listar transferências SBAR:', error)
  return data ?? []
}

export async function registrarTransferenciaSbar({ leitoOcupacaoId, setorDestinoId, enfermeiroEntrega, enfermeiroRecebe, dados }) {
  return supabase
    .from('transferencias_sbar')
    .insert({
      leito_ocupacao_id: leitoOcupacaoId || null, setor_destino_id: setorDestinoId || null,
      enfermeiro_entrega: enfermeiroEntrega, enfermeiro_recebe: enfermeiroRecebe || null,
      ...dados,
    })
    .select('*, setores:setor_destino_id(nome), entrega:enfermeiro_entrega(nome_exibicao, nome, coren), recebe:enfermeiro_recebe(nome_exibicao, nome)')
    .single()
}

// ===================== Eventos adversos (notificação de incidentes) =====================
// Relator pode registrar como anônimo — quando anonimo=true, a UI não mostra
// o nome de quem relatou, mesmo que relator_id esteja preenchido no banco
// (auditoria interna continua possível, só não é exposta na tela).

export async function listarEventosAdversos(atendimentoId) {
  const { data } = await supabase
    .from('eventos_adversos')
    // 2 FKs para enfermeiros (relator_id, notificado_por): hint explícito, senão a lista vem vazia.
    .select('*, enfermeiros!eventos_adversos_relator_id_fkey(nome_exibicao, nome, coren)')
    .eq('atendimento_id', atendimentoId)
    .order('ocorrido_em', { ascending: false })
  return data ?? []
}

export async function registrarEventoAdverso({
  atendimentoId, relatorId, anonimo, categoria, gravidade, descricao, acaoImediata,
  ocorridoEm, medicoComunicado, medicoComunicadoNome, horarioComunicacaoMedico, sinaisVitais, desfechoEvolucao,
}) {
  return supabase
    .from('eventos_adversos')
    .insert({
      atendimento_id: atendimentoId,
      relator_id: anonimo ? null : relatorId,
      anonimo: !!anonimo,
      categoria,
      gravidade,
      descricao,
      acao_imediata: acaoImediata || null,
      ocorrido_em: ocorridoEm || new Date().toISOString(),
      medico_comunicado: !!medicoComunicado,
      medico_comunicado_nome: medicoComunicadoNome || null,
      horario_comunicacao_medico: medicoComunicado ? (horarioComunicacaoMedico || null) : null,
      sv_pa_sistolica: sinaisVitais?.pa_sistolica === '' || sinaisVitais?.pa_sistolica == null ? null : Number(sinaisVitais.pa_sistolica),
      sv_pa_diastolica: sinaisVitais?.pa_diastolica === '' || sinaisVitais?.pa_diastolica == null ? null : Number(sinaisVitais.pa_diastolica),
      sv_fc: sinaisVitais?.fc === '' || sinaisVitais?.fc == null ? null : Number(sinaisVitais.fc),
      sv_fr: sinaisVitais?.fr === '' || sinaisVitais?.fr == null ? null : Number(sinaisVitais.fr),
      sv_temperatura: sinaisVitais?.temperatura === '' || sinaisVitais?.temperatura == null ? null : Number(sinaisVitais.temperatura),
      sv_spo2: sinaisVitais?.spo2 === '' || sinaisVitais?.spo2 == null ? null : Number(sinaisVitais.spo2),
      desfecho_evolucao: desfechoEvolucao || null,
    })
    .select()
    .single()
}
