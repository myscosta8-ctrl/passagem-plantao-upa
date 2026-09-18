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
