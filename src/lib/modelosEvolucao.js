import { supabase } from './supabaseClient.js'
import { avisarErro } from './erros.js'

// Modelos prontos de evolução (tabela modelos_evolucao). "unidade" = da UPA (só o admin altera);
// "pessoal" = do próprio profissional. Excluir = desativar (nada é apagado).
export async function listarModelosEvolucao(categoria) {
  const { data, error } = await supabase
    .from('modelos_evolucao')
    .select('id, categoria, escopo, titulo, campos, autor_auth, ordem')
    .eq('categoria', categoria).eq('ativo', true)
    .order('escopo', { ascending: false }) // unidade antes de pessoal
    .order('ordem').order('titulo')
  if (error) { avisarErro('Modelos de evolução', error); return [] }
  return data ?? []
}

export async function salvarModeloPessoal({ categoria, titulo, campos }) {
  return supabase.from('modelos_evolucao')
    .insert({ categoria, escopo: 'pessoal', titulo: titulo.trim(), campos })
    .select('id, categoria, escopo, titulo, campos, autor_auth, ordem').single()
}

export async function desativarModelo(id) {
  return supabase.from('modelos_evolucao').update({ ativo: false, atualizado_em: new Date().toISOString() }).eq('id', id)
}

// Junta o modelo ao que já está escrito: substitui ou acrescenta ao final (linha em branco entre os dois).
export function aplicarModelo(atuais, campos, modo) {
  const novos = { ...atuais }
  for (const [chave, texto] of Object.entries(campos || {})) {
    if (!(chave in atuais) || !texto) continue
    const atual = String(atuais[chave] || '').trim()
    novos[chave] = modo === 'acrescentar' && atual ? `${atual}\n\n${texto}` : texto
  }
  return novos
}
