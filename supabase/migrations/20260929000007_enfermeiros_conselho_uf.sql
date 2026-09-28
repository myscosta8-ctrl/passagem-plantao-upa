-- UF do conselho (COREN/CRM) do profissional; só a direção altera (proteger_campos_perfil)
alter table public.enfermeiros add column if not exists conselho_uf text default 'PA';
