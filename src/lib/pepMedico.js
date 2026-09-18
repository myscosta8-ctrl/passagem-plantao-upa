import { supabase } from './supabaseClient'
import { calcularIdade } from './pepAtendimentos'

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
  return supabase.from('consultas_medicas').insert({
    atendimento_id: atendimentoId,
    pessoa_id: pessoaId,
    medico_id: medicoId,
    ...dados,
  }).select().single()
}

export async function listarPrescricoes(atendimentoId) {
  const { data } = await supabase
    .from('prescricoes_medicas')
    .select('*, enfermeiros(nome_exibicao, nome, crm), prescricao_itens(*)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
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
  const { data } = await supabase
    .from('aih_solicitacoes')
    .select('*, enfermeiros(nome_exibicao, nome, crm), cid_catalog!aih_solicitacoes_cid_principal_fkey(codigo, descricao)')
    .eq('atendimento_id', atendimentoId)
    .order('criado_em', { ascending: false })
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
  return supabase.from('aih_solicitacoes').insert({
    atendimento_id: atendimentoId,
    pessoa_id: pessoaId,
    solicitante_id: solicitanteId,
    ...dados,
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
