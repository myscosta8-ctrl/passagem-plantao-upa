import { supabase } from './supabaseClient'
import { detectarDuplicatas } from './pepRecepcao'

// Etapa H da Fase 0 do PEP — caminho novo de leitura/escrita, usado só quando
// configuracoes.pep_ativo = true (ver pepConfig.js). Produz objetos com o MESMO
// formato que o Painel/PassagemForm já esperam do caminho antigo (pacientes),
// pra não precisar reescrever a tela — só trocar de onde o dado vem.
//
// Mapeamento importante: cada "paciente" que a tela enxerga passa a ser, por
// baixo, um ATENDIMENTO (o episódio atual) — não a pessoa. Uma pessoa pode ter
// vários atendimentos ao longo da vida; o Painel só mostra o atendimento ativo.

export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null
  const nasc = new Date(dataNascimento + 'T00:00:00')
  if (Number.isNaN(nasc.getTime())) return null
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

// pessoas não guarda "idade" direto — só data_nascimento. Quando ela não é
// conhecida (comum na admissão rápida), usa a idade digitada à mão (idade_informada).
function idadeExibida(pessoa) {
  const porNascimento = calcularIdade(pessoa.data_nascimento)
  return porNascimento ?? pessoa.idade_informada ?? null
}

export async function carregarLeitosOcupadosPep() {
  const { data: ocupacoes } = await supabase
    .from('leito_ocupacoes')
    .select('leito_id, atendimento_id, alocado_em')
    .eq('status', 'ativo')

  const atendimentoIds = (ocupacoes ?? []).map((o) => o.atendimento_id)
  if (atendimentoIds.length === 0) {
    return { pacientesPorLeito: {}, passagemPorPaciente: {} }
  }

  const [{ data: atendimentos }, { data: internacoes }] = await Promise.all([
    supabase.from('atendimentos').select('*').in('id', atendimentoIds),
    supabase.from('internacoes').select('*').in('atendimento_id', atendimentoIds),
  ])

  const pessoaIds = [...new Set((atendimentos ?? []).map((a) => a.pessoa_id))]
  const [{ data: pessoas }, { data: alergiasAtivas }, { data: enfermeirosResp }] = await Promise.all([
    supabase.from('pessoas').select('*').in('id', pessoaIds),
    supabase.from('alergias').select('pessoa_id').eq('status', 'ativa').in('pessoa_id', pessoaIds),
    supabase.from('enfermeiros').select('id, nome_exibicao, nome'),
  ])

  const pessoaPorId = Object.fromEntries((pessoas ?? []).map((p) => [p.id, p]))
  const internacaoPorAtendimento = Object.fromEntries((internacoes ?? []).map((i) => [i.atendimento_id, i]))
  const temAlergiaAtiva = new Set((alergiasAtivas ?? []).map((a) => a.pessoa_id))
  const enfermeiroPorId = Object.fromEntries((enfermeirosResp ?? []).map((e) => [e.id, e]))

  const pacientesPorLeito = {}
  for (const ocupacao of ocupacoes) {
    const atendimento = (atendimentos ?? []).find((a) => a.id === ocupacao.atendimento_id)
    if (!atendimento) continue
    const pessoa = pessoaPorId[atendimento.pessoa_id]
    const internacao = internacaoPorAtendimento[atendimento.id]
    if (!pessoa) continue

    pacientesPorLeito[ocupacao.leito_id] = {
      id: atendimento.id, // o Painel trata isto como "paciente.id" — é o atendimento
      pessoa_id: pessoa.id,
      pep_nativo: true, // id acima já é um atendimento de verdade — nunca passar pela ponte da seção 0
      nome: pessoa.nome,
      diagnostico: internacao?.diagnostico_admissao ?? '',
      idade: idadeExibida(pessoa),
      sexo: pessoa.sexo,
      data_admissao: internacao?.internado_em ? internacao.internado_em.slice(0, 10) : null,
      alergias: temAlergiaAtiva.has(pessoa.id),
      status_internacao: atendimento.status_internacao ?? 'Em observação',
      status: 'internado',
      leito_atual_id: ocupacao.leito_id,
      ultima_alteracao_por: null,
      ultima_alteracao_por_enfermeiro: null,
      ultima_alteracao_em: null,
    }
  }

  const { data: passagens } = await supabase
    .from('passagens')
    .select('*, enfermeiros(nome_exibicao, nome)')
    .in('atendimento_id', atendimentoIds)
    .order('criado_em', { ascending: false })

  const passagemPorPaciente = {}
  for (const p of passagens ?? []) {
    if (!passagemPorPaciente[p.atendimento_id]) passagemPorPaciente[p.atendimento_id] = p
  }

  return { pacientesPorLeito, passagemPorPaciente }
}

export async function internarPacientePep({ leito, dados, enfermeiroId }) {
  const { data: pessoa, error: erroPessoa } = await supabase
    .from('pessoas')
    .insert({ nome: dados.nome })
    .select()
    .single()
  if (erroPessoa) return { error: erroPessoa }
  detectarDuplicatas(pessoa.id, { nome: dados.nome })

  const { data: atendimento, error: erroAtendimento } = await supabase
    .from('atendimentos')
    .insert({
      pessoa_id: pessoa.id,
      setor_id: leito.setor_id,
      tipo: 'internacao',
      status: 'internado',
      status_internacao: dados.status,
    })
    .select()
    .single()
  if (erroAtendimento) return { error: erroAtendimento }

  const [{ error: erroInternacao }, { error: erroLeito }] = await Promise.all([
    supabase.from('internacoes').insert({
      atendimento_id: atendimento.id,
      diagnostico_admissao: dados.diagnostico,
      internado_em: dados.dataAdmissao ? `${dados.dataAdmissao}T00:00:00` : new Date().toISOString(),
    }),
    supabase.from('leito_ocupacoes').insert({
      leito_id: leito.id,
      atendimento_id: atendimento.id,
      status: 'ativo',
    }),
  ])
  if (erroInternacao) return { error: erroInternacao }
  if (erroLeito) return { error: erroLeito }

  return {
    novo: {
      id: atendimento.id,
      pessoa_id: pessoa.id,
      pep_nativo: true,
      nome: pessoa.nome,
      diagnostico: dados.diagnostico,
      idade: null,
      sexo: null,
      data_admissao: dados.dataAdmissao,
      alergias: false,
      status_internacao: dados.status,
      status: 'internado',
      leito_atual_id: leito.id,
    },
  }
}

// Ponte entre o caminho antigo (tabela `pacientes`) e o novo (pessoas/atendimentos),
// pra telas que só existem no caminho novo (Ficha Clínica, Ficha Médica) poderem
// abrir sobre um paciente que ainda só existe no caminho antigo. Idempotente: se
// já existe um atendimento (ou pessoa) migrado desse pacienteId, reaproveita — nunca
// cria duplicata. NUNCA chamar isto com um id que já é `pep_nativo` (já é um
// atendimento de verdade) — só serve pra ids da tabela `pacientes` antiga.
export async function obterOuCriarAtendimentoParaPaciente(pacienteId) {
  const { data: atendimentoExistente } = await supabase
    .from('atendimentos')
    .select('id, pessoa_id')
    .eq('migrado_de_paciente_id', pacienteId)
    .maybeSingle()
  if (atendimentoExistente) {
    return { atendimentoId: atendimentoExistente.id, pessoaId: atendimentoExistente.pessoa_id }
  }

  const { data: pacienteRow, error: erroPaciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', pacienteId)
    .maybeSingle()
  if (erroPaciente || !pacienteRow) return { error: erroPaciente ?? new Error('Paciente não encontrado') }

  let pessoaId
  const { data: pessoaExistente } = await supabase
    .from('pessoas')
    .select('id')
    .eq('migrado_de_paciente_id', pacienteId)
    .maybeSingle()

  if (pessoaExistente) {
    pessoaId = pessoaExistente.id
  } else {
    const { data: pessoaCriada, error: erroPessoa } = await supabase
      .from('pessoas')
      .insert({
        nome: pacienteRow.nome,
        data_nascimento: pacienteRow.data_nascimento ?? null,
        migrado_de_paciente_id: pacienteId,
      })
      .select('id')
      .single()
    if (erroPessoa) return { error: erroPessoa }
    pessoaId = pessoaCriada.id
  }

  const { data: leito } = pacienteRow.leito_atual_id
    ? await supabase.from('leitos').select('setor_id').eq('id', pacienteRow.leito_atual_id).maybeSingle()
    : { data: null }

  const { data: atendimentoCriado, error: erroAtendimento } = await supabase
    .from('atendimentos')
    .insert({
      pessoa_id: pessoaId,
      migrado_de_paciente_id: pacienteId,
      setor_id: leito?.setor_id ?? null,
      tipo: 'internacao',
      status: 'internado',
      status_internacao: pacienteRow.status_internacao ?? 'Em observação',
      classificacao_risco_cor: pacienteRow.classificacao_manchester ?? null,
    })
    .select('id')
    .single()
  if (erroAtendimento) return { error: erroAtendimento }

  return { atendimentoId: atendimentoCriado.id, pessoaId }
}

// Passagem do plantão atual pra esse atendimento, se já existir (equivalente ao
// passo 1 do PassagemForm no caminho antigo).
export async function buscarPassagemAtualPep(plantaoId, atendimentoId) {
  const { data } = await supabase
    .from('passagens')
    .select('*')
    .eq('plantao_id', plantaoId)
    .eq('atendimento_id', atendimentoId)
    .maybeSingle()
  return data
}

// Última passagem desse atendimento em qualquer plantão — usado pra copiar
// automaticamente ao abrir um atendimento sem passagem ainda neste plantão.
export async function buscarUltimaPassagemPep(atendimentoId) {
  const { data } = await supabase
    .from('passagens')
    .select('*')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function salvarPassagemPep(payload) {
  const limpo = { ...payload }
  for (const chave in limpo) {
    if (limpo[chave] === '') limpo[chave] = null
  }
  return supabase.from('passagens').upsert(limpo, { onConflict: 'plantao_id,atendimento_id' })
}

// Identificação, no caminho novo, é espalhada em pessoas (dados fixos da pessoa),
// internacoes (dados do episódio) e atendimentos (status_internacao) — e alergias
// vira uma linha na tabela própria, não um campo solto.
export async function salvarIdentificacaoPep({ atendimentoId, pessoaId, identificacao }) {
  const [{ error: erroPessoa }, { error: erroInternacao }, { error: erroAtendimento }] = await Promise.all([
    supabase
      .from('pessoas')
      .update({
        nome: identificacao.nome,
        sexo: identificacao.sexo || null,
        idade_informada: identificacao.idade ? Number(identificacao.idade) : null,
      })
      .eq('id', pessoaId),
    supabase
      .from('internacoes')
      .update({
        diagnostico_admissao: identificacao.diagnostico,
        internado_em: identificacao.data_admissao ? `${identificacao.data_admissao}T00:00:00` : null,
      })
      .eq('atendimento_id', atendimentoId),
    supabase
      .from('atendimentos')
      .update({ status_internacao: identificacao.status_internacao })
      .eq('id', atendimentoId),
  ])
  if (erroPessoa || erroInternacao || erroAtendimento) {
    return { error: erroPessoa || erroInternacao || erroAtendimento }
  }

  if (identificacao.alergias) {
    // limit(1) em vez de maybeSingle() — desde que a Ficha Clínica permite
    // cadastrar várias alergias ativas por pessoa, mais de uma linha ativa
    // é esperado, e maybeSingle() quebraria com "multiple rows returned".
    const { data: existentes } = await supabase
      .from('alergias')
      .select('id')
      .eq('pessoa_id', pessoaId)
      .eq('status', 'ativa')
      .limit(1)
    const existente = existentes?.[0]
    if (existente) {
      await supabase.from('alergias').update({ substancia: identificacao.alergias_obs || null }).eq('id', existente.id)
    } else {
      await supabase.from('alergias').insert({
        pessoa_id: pessoaId,
        substancia: identificacao.alergias_obs || null,
        status: 'ativa',
      })
    }
  } else {
    await supabase.from('alergias').update({ status: 'inativa' }).eq('pessoa_id', pessoaId).eq('status', 'ativa')
  }

  return { error: null }
}

export async function leitosOcupadosIdsPep() {
  const { data } = await supabase.from('leito_ocupacoes').select('leito_id').eq('status', 'ativo')
  return new Set((data ?? []).map((o) => o.leito_id))
}

// Realocar = encerrar a ocupação do leito de origem e abrir uma nova no destino,
// mantendo o mesmo atendimento (não é um novo episódio, só mudou de leito/setor).
export async function realocarAtendimentoPep({ atendimentoId, leitoOrigemId, leitoDestinoId, setorDestinoId }) {
  const agora = new Date().toISOString()
  const [{ error: erroEncerra }, { error: erroAbre }, { error: erroSetor }] = await Promise.all([
    supabase
      .from('leito_ocupacoes')
      .update({ status: 'encerrado', liberado_em: agora, motivo_transferencia: 'realocação' })
      .eq('leito_id', leitoOrigemId)
      .eq('atendimento_id', atendimentoId)
      .eq('status', 'ativo'),
    supabase.from('leito_ocupacoes').insert({ leito_id: leitoDestinoId, atendimento_id: atendimentoId, status: 'ativo' }),
    supabase.from('atendimentos').update({ setor_id: setorDestinoId }).eq('id', atendimentoId),
  ])
  return { error: erroEncerra || erroAbre || erroSetor }
}

export async function registrarDesfechoPep({ atendimentoId, leitoId, tipo, detalhe, autorId, dadosObito }) {
  const agora = new Date().toISOString()
  const [{ error: erroInternacao }, { error: erroAtendimento }, { error: erroLeito }] = await Promise.all([
    supabase
      .from('internacoes')
      .update({ resumo_alta: detalhe || null, encerrado_em: agora, dados_obito: dadosObito || null })
      .eq('atendimento_id', atendimentoId),
    supabase.from('atendimentos').update({ status: 'alta' }).eq('id', atendimentoId),
    supabase
      .from('leito_ocupacoes')
      .update({ status: 'encerrado', liberado_em: agora, motivo_transferencia: tipo })
      .eq('leito_id', leitoId)
      .eq('atendimento_id', atendimentoId)
      .eq('status', 'ativo'),
  ])
  if (!erroInternacao && !erroAtendimento && !erroLeito) {
    await registrarEventoAuditoria({ atendimentoId, autorId, acao: 'desfecho_registrado', dados: { tipo, detalhe: detalhe || null } })
  }
  return { error: erroInternacao || erroAtendimento || erroLeito }
}

// "Excluir paciente" hoje apaga o cadastro inteiro (erro/duplicidade). No caminho
// novo, apaga o atendimento (e o que depende dele); a pessoa só é apagada junto
// se esse era o único atendimento dela — senão ela fica, com o resto do histórico.
export async function excluirAtendimentoPep(atendimentoId, pessoaId) {
  await supabase.from('passagens').delete().eq('atendimento_id', atendimentoId)
  const { error: erroAtendimento } = await supabase.from('atendimentos').delete().eq('id', atendimentoId)
  if (erroAtendimento) return { error: erroAtendimento }

  const { count } = await supabase
    .from('atendimentos')
    .select('id', { count: 'exact', head: true })
    .eq('pessoa_id', pessoaId)
  if ((count ?? 0) === 0) {
    await supabase.from('alergias').delete().eq('pessoa_id', pessoaId)
    await supabase.from('pessoas').delete().eq('id', pessoaId)
  }
  return { error: null }
}

// ===================== Trilha de auditoria =====================
// Não instrumenta o app inteiro — cobre os pontos de maior risco/impacto
// (diagnóstico, desfecho, fusão de cadastros). atendimento_id é opcional
// porque algumas ações (ex: fusão de duplicatas) não têm um atendimento único.

export async function registrarEventoAuditoria({ atendimentoId, autorId, acao, dados }) {
  return supabase.from('eventos_auditoria').insert({
    atendimento_id: atendimentoId || null,
    autor_id: autorId || null,
    acao,
    dados: dados || null,
  })
}

export async function listarEventosAuditoria(atendimentoId) {
  const { data } = await supabase
    .from('eventos_auditoria')
    .select('*, enfermeiros(nome_exibicao, nome)')
    .eq('atendimento_id', atendimentoId)
    .order('ocorrido_em', { ascending: false })
  return data ?? []
}
