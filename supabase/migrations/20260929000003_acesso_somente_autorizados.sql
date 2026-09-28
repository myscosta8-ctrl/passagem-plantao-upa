-- Acesso só para usuários criados pela direção (perfil ativo em enfermeiros).
-- Aplicada via MCP em 28/09/2026: usuario_autorizado(), política restritiva em todas as tabelas,
-- enfermeiros sem política ALL=true (insert/delete só admin; update do próprio perfil sem mudar cargo/tipo/ativo).
select 1;
