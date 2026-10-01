// O PEP (pessoas/atendimentos/internacoes/leito_ocupacoes) é a única fonte de
// dados. A antiga chave `configuracoes.pep_ativo` era comparada como boolean,
// mas o banco guarda texto ('true'), então o PEP só ligava para quem tinha
// pep_beta — os demais gravavam na tabela antiga `pacientes`. Agora é fixo.
export async function pepEstaAtivo() {
  return true
}
