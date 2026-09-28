-- plantao_profissionais: cada profissional só insere/atualiza a própria participação
-- (a política genérica "libera tudo" anulava as restrições); sem exclusão.
drop policy if exists "Acesso permitido para usuarios autenticados" on public.plantao_profissionais;
drop policy if exists leitura_geral on public.plantao_profissionais;
drop policy if exists insercao_geral on public.plantao_profissionais;
drop policy if exists exclusao_somente_admin on public.plantao_profissionais;
drop policy if exists atualizacao_propria_ou_super_admin on public.plantao_profissionais;
create policy leitura_autenticada on public.plantao_profissionais for select to authenticated using (true);
create policy insercao_propria on public.plantao_profissionais for insert to authenticated with check (profissional_id = (select auth.uid()));
create policy atualizacao_propria on public.plantao_profissionais for update to authenticated using (profissional_id = (select auth.uid())) with check (profissional_id = (select auth.uid()));
-- assumir_plantao encerrava a participação de TODOS no plantão (SECURITY DEFINER, sem uso no app).
drop function if exists public.assumir_plantao(uuid);
drop function if exists public.is_marcus_super_admin();

-- SBAR: a coluna clínica "situação atual" colidia com a situação do documento.
alter table public.transferencias_sbar add column if not exists situacao_atual text;
update public.transferencias_sbar set situacao_atual = situacao, situacao = 'finalizado' where situacao is null or situacao not in ('rascunho','finalizado','invalido');
alter table public.transferencias_sbar alter column situacao set default 'finalizado', alter column situacao set not null;
