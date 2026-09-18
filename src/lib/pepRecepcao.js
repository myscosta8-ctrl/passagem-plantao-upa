import { supabase } from './supabaseClient'

// Camada de dados da Recepção (Fase 1b do PEP) — cadastro de identidade
// completo (Ficha de Identificação do Paciente, UPA Breves) + abertura do
// atendimento administrativo. Não mexe em leito/internação — isso continua
// sendo decisão da equipe assistencial, em outra tela.

export async function buscarPessoas(termo) {
  const t = termo.trim()
  if (!t) return []
  const { data } = await supabase
    .from('pessoas')
    .select('*')
    .or(`nome.ilike.%${t}%,cpf.ilike.%${t}%,cns.ilike.%${t}%,prontuario_numero.ilike.%${t}%`)
    .order('criado_em', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function criarPessoaCompleta(dados) {
  return supabase
    .from('pessoas')
    .insert({
      nome: dados.nome,
      nome_mae: dados.nome_mae || null,
      nome_pai: dados.nome_pai || null,
      data_nascimento: dados.data_nascimento || null,
      sexo: dados.sexo || null,
      raca_cor: dados.raca_cor || null,
      religiao: dados.religiao || null,
      nacionalidade: dados.nacionalidade || null,
      rg: dados.rg || null,
      cpf: dados.cpf || null,
      cns: dados.cns || null,
      numero_registro_nascimento: dados.numero_registro_nascimento || null,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      endereco_numero: dados.endereco_numero || null,
      bairro: dados.bairro || null,
      cidade: dados.cidade || null,
    })
    .select()
    .single()
}

export async function atualizarPessoaCompleta(pessoaId, dados) {
  return supabase
    .from('pessoas')
    .update({
      nome: dados.nome,
      nome_mae: dados.nome_mae || null,
      nome_pai: dados.nome_pai || null,
      data_nascimento: dados.data_nascimento || null,
      sexo: dados.sexo || null,
      raca_cor: dados.raca_cor || null,
      religiao: dados.religiao || null,
      nacionalidade: dados.nacionalidade || null,
      rg: dados.rg || null,
      cpf: dados.cpf || null,
      cns: dados.cns || null,
      numero_registro_nascimento: dados.numero_registro_nascimento || null,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      endereco_numero: dados.endereco_numero || null,
      bairro: dados.bairro || null,
      cidade: dados.cidade || null,
    })
    .eq('id', pessoaId)
}

export async function abrirAtendimento({ pessoaId, setorId, medicoResponsavelNome, responsavel, criadoPor }) {
  return supabase
    .from('atendimentos')
    .insert({
      pessoa_id: pessoaId,
      setor_id: setorId || null,
      tipo: 'recepcao',
      status: 'triagem',
      medico_responsavel_nome: medicoResponsavelNome || null,
      responsavel_nome: responsavel?.nome || null,
      responsavel_rg: responsavel?.rg || null,
      responsavel_relacao: responsavel?.relacao || null,
      responsavel_endereco: responsavel?.endereco || null,
      criado_por: criadoPor || null,
    })
    .select()
    .single()
}

export async function listarCadastrosRecentes() {
  const { data } = await supabase
    .from('atendimentos')
    .select('id, criado_em, numero_atendimento, pessoas(nome, prontuario_numero, cpf)')
    .eq('tipo', 'recepcao')
    .order('criado_em', { ascending: false })
    .limit(15)
  return data ?? []
}
