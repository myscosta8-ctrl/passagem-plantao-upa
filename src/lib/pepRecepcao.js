import { supabase } from './supabaseClient.js'
import { registrarEventoAuditoria } from './pepAtendimentos.js'

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
    .is('mesclado_com_id', null)
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

function normalizarNome(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

// Roda logo depois de criar uma pessoa (cadastro completo da Recepção OU
// internação rápida da Sala Vermelha) — procura outra pessoa já cadastrada
// com o mesmo nome normalizado e registra o candidato pra revisão humana.
// Nunca bloqueia o cadastro, só sinaliza.
export async function detectarDuplicatas(pessoaId, dados) {
  const nomeNorm = normalizarNome(dados?.nome)
  if (!nomeNorm) return
  const primeiraPalavra = nomeNorm.split(' ')[0]
  if (primeiraPalavra.length < 3) return

  const { data: candidatas } = await supabase
    .from('pessoas')
    .select('id, nome, data_nascimento, cpf, cns')
    .ilike('nome', `%${primeiraPalavra}%`)
    .neq('id', pessoaId)
    .is('mesclado_com_id', null)

  const linhas = []
  for (const c of candidatas ?? []) {
    if (normalizarNome(c.nome) !== nomeNorm) continue
    const camposBatidos = ['nome']
    if (dados.data_nascimento && c.data_nascimento === dados.data_nascimento) camposBatidos.push('data_nascimento')
    if (dados.cpf && c.cpf && c.cpf === dados.cpf) camposBatidos.push('cpf')
    if (dados.cns && c.cns && c.cns === dados.cns) camposBatidos.push('cns')
    linhas.push({
      pessoa_id: pessoaId,
      pessoa_candidata_id: c.id,
      match_forca: camposBatidos.length > 1 ? 'forte' : 'fraco',
      campos_batidos: camposBatidos,
    })
  }
  if (linhas.length > 0) {
    await supabase.from('pessoas_duplicatas').insert(linhas)
  }
}

export async function listarDuplicatasPendentes() {
  const { data } = await supabase
    .from('pessoas_duplicatas')
    .select(`
      *,
      pessoa:pessoa_id (id, nome, data_nascimento, cpf, cns, prontuario_numero, criado_em),
      candidata:pessoa_candidata_id (id, nome, data_nascimento, cpf, cns, prontuario_numero, criado_em)
    `)
    .eq('status', 'pendente')
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function descartarDuplicata(duplicataId, revisadoPor) {
  return supabase
    .from('pessoas_duplicatas')
    .update({ status: 'descartada', revisado_por: revisadoPor, revisado_em: new Date().toISOString() })
    .eq('id', duplicataId)
}

// Confirma que são a mesma pessoa e já executa a fusão num passo só —
// nunca apaga o registro removido, só marca mesclado_com_id (fusão
// reversível, nada de FK de atendimento é reapontada).
export async function confirmarEFundirDuplicata({ duplicataId, pessoaMantidaId, pessoaRemovidaId, motivo, executadoPor }) {
  const agora = new Date().toISOString()

  const { error: erroPessoa } = await supabase
    .from('pessoas')
    .update({ mesclado_com_id: pessoaMantidaId, mesclado_em: agora })
    .eq('id', pessoaRemovidaId)
  if (erroPessoa) return { error: erroPessoa }

  const { error: erroDuplicata } = await supabase
    .from('pessoas_duplicatas')
    .update({ status: 'confirmada', revisado_por: executadoPor, revisado_em: agora })
    .eq('id', duplicataId)
  if (erroDuplicata) return { error: erroDuplicata }

  const resultado = await supabase.from('pessoas_fusoes').insert({
    duplicata_id: duplicataId,
    pessoa_mantida_id: pessoaMantidaId,
    pessoa_removida_id: pessoaRemovidaId,
    motivo: motivo || null,
    solicitado_por: executadoPor,
    status: 'executada',
    executado_por: executadoPor,
    executado_em: agora,
  })
  if (!resultado.error) {
    await registrarEventoAuditoria({
      autorId: executadoPor,
      acao: 'duplicata_fundida',
      dados: { pessoaMantidaId, pessoaRemovidaId, motivo: motivo || null },
    })
  }
  return resultado
}
