-- Fixa search_path e remove execução pública (anon) das funções SECURITY DEFINER.
alter function public.assumir_plantao(uuid) set search_path = public;
alter function public.encerrar_plantoes_vencidos() set search_path = public;
alter function public.is_admin() set search_path = public;
alter function public.is_marcus_super_admin() set search_path = public;
alter function public.sync_enfermeiro_para_profissionais() set search_path = public;

revoke execute on function public.assumir_plantao(uuid) from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_marcus_super_admin() from public, anon;
revoke execute on function public.encerrar_plantoes_vencidos() from public, anon, authenticated; -- só o pg_cron chama
revoke execute on function public.sync_enfermeiro_para_profissionais() from public, anon, authenticated; -- função de trigger

grant execute on function public.assumir_plantao(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_marcus_super_admin() to authenticated;
