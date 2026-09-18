import { supabase } from './supabaseClient'

// Fase 2 (piloto Observação/Internação) — ficha clínica contínua do
// enfermeiro: admissão (exame físico por marcação) + sinais vitais em série.
// Só existe sobre a estrutura nova do PEP (pessoas/atendimentos).

export async function buscarAdmissao(atendimentoId) {
  const { data } = await supabase
    .from('admissoes_enfermagem')
    .select('*, enfermeiros(nome_exibicao, nome)')
    .eq('atendimento_id', atendimentoId)
    .maybeSingle()
  return data
}

export async function salvarAdmissao({ atendimentoId, pessoaId, autorId, dados }) {
  return supabase
    .from('admissoes_enfermagem')
    .upsert(
      {
        atendimento_id: atendimentoId,
        pessoa_id: pessoaId,
        autor_id: autorId,
        alergia_medicamentosa: dados.alergia_medicamentosa || null,
        alergia_alimentar: dados.alergia_alimentar || null,
        cidade_reside: dados.cidade_reside || null,
        acompanhante: dados.acompanhante || null,
        medicamentos_controlados: dados.medicamentos_controlados,
        medicamentos_controlados_quais: dados.medicamentos_controlados_quais || null,
        hipotese_diagnostica: dados.hipotese_diagnostica || null,
        exame_fisico: dados.exame_fisico || {},
        tabagista: dados.tabagista,
        tabagista_tempo: dados.tabagista_tempo || null,
        etilista: dados.etilista,
        etilista_tempo: dados.etilista_tempo || null,
        doencas_infancia: dados.doencas_infancia || [],
        doencas_cronicas: dados.doencas_cronicas || [],
        integridade_fisica: dados.integridade_fisica || {},
        observacoes: dados.observacoes || null,
      },
      { onConflict: 'atendimento_id' }
    )
    .select()
    .single()
}

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
    .select('*, enfermeiros(nome_exibicao, nome)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function registrarEvolucao({ atendimentoId, autorId, texto }) {
  return supabase
    .from('evolucoes')
    .insert({ atendimento_id: atendimentoId, autor_id: autorId, autor_tipo: 'enfermagem', tipo: 'enfermagem', texto })
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

export async function registrarBalancoHidrico({ atendimentoId, registradoPor, tipo, via, volumeMl, observacao }) {
  return supabase
    .from('balanco_hidrico')
    .insert({
      atendimento_id: atendimentoId,
      registrado_por: registradoPor,
      tipo,
      via,
      volume_ml: Number(volumeMl),
      observacao: observacao || null,
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

// Resumo compacto pro card de status no topo da Ficha Clínica — último
// sinal vital, escala mais recente de cada tipo, dispositivos ainda
// ativos e balanço hídrico só de hoje.
export async function buscarResumoPaciente(atendimentoId) {
  const [sinaisVitais, escalas, dispositivos, balanco] = await Promise.all([
    listarSinaisVitais(atendimentoId),
    listarEscalas(atendimentoId),
    listarDispositivos(atendimentoId),
    listarBalancoHidrico(atendimentoId),
  ])

  const escalaPorTipo = {}
  for (const e of escalas) {
    if (!escalaPorTipo[e.tipo]) escalaPorTipo[e.tipo] = e
  }

  const dispositivosAtivos = dispositivos.filter((d) => !d.removido_em)

  const hojeISO = new Date().toISOString().slice(0, 10)
  const balancoHoje = balanco.filter((b) => (b.registrado_em || '').slice(0, 10) === hojeISO)
  const entradasHoje = balancoHoje.filter((b) => b.tipo === 'entrada').reduce((s, b) => s + Number(b.volume_ml), 0)
  const saidasHoje = balancoHoje.filter((b) => b.tipo === 'saida').reduce((s, b) => s + Number(b.volume_ml), 0)

  return {
    ultimoSv: sinaisVitais[0] || null,
    escalaPorTipo,
    dispositivosAtivos,
    entradasHoje,
    saidasHoje,
  }
}
