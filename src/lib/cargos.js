// Catálogo de permissões administrativas (as regras valem no banco; aqui só os rótulos da tela).
export const PERMISSOES = [
  { k: 'cadastrar_funcionarios', nome: 'Cadastrar funcionários', desc: 'Criar login de novos profissionais' },
  { k: 'editar_cadastro', nome: 'Editar cadastros', desc: 'Alterar nome, tipo e COREN/CRM' },
  { k: 'resetar_senha', nome: 'Resetar senhas', desc: 'Gerar nova senha provisória' },
  { k: 'ativar_desativar', nome: 'Ativar e desativar acessos', desc: 'Bloquear ou liberar o login' },
  { k: 'ver_equipe', nome: 'Ver o Painel de Equipe', desc: 'Consultar quem está online e em plantão' },
]

// Nomes dos cargos prontos (o banco é a fonte; isto evita esperar o carregamento para exibir o selo).
export const CARGOS_NOMES = {
  gestao_pessoal: 'Gestão de pessoal',
  cadastro_funcionarios: 'Cadastro de funcionários',
  consulta_equipe: 'Consulta da equipe',
}
export const nomeCargo = (chave, cargos = []) => cargos.find((c) => c.chave === chave)?.nome || CARGOS_NOMES[chave] || chave
