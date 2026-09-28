-- Remove índices/constraints duplicados apontados pelo Supabase Advisor.
do $$ declare n text; begin
foreach n in array array['uq_cid_catalog_codigo','uq_configuracoes_chave','uq_enfermeiros_email','idx_passagens_paciente','idx_passagens_plantao'] loop
  if exists (select 1 from pg_constraint where conname=n) then
    execute format('alter table %s drop constraint %I', (select conrelid::regclass from pg_constraint where conname=n), n);
  elsif exists (select 1 from pg_class where relname=n and relkind='i') then
    execute format('drop index public.%I', n);
  end if;
end loop; end $$;
