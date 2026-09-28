-- Auditoria: remove políticas anon residuais, ativa RLS em _migrations,
-- remove políticas permissivas duplicadas e cria índices em FKs sem índice.
do $$ declare r record; begin
for r in select schemaname, tablename, policyname from pg_policies where schemaname='public' and 'anon'=any(roles) loop
  execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
end loop; end $$;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;
alter table public._migrations enable row level security;
do $$ declare r record; begin
for r in select p.tablename, p.policyname from pg_policies p where p.schemaname='public' and p.permissive='PERMISSIVE' and p.policyname<>'Acesso permitido para usuarios autenticados' and p.cmd='ALL'
  and exists(select 1 from pg_policies q where q.schemaname='public' and q.tablename=p.tablename and q.policyname='Acesso permitido para usuarios autenticados' and q.cmd='ALL' and q.qual='true') loop
  execute format('drop policy %I on public.%I', r.policyname, r.tablename);
end loop;
for r in select c.conrelid::regclass::text tbl, a.attname col, c.conrelid::regclass::text||'_'||a.attname||'_fk_idx' nome
  from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=c.conkey[1]
  where c.contype='f' and array_length(c.conkey,1)=1 and c.connamespace='public'::regnamespace
  and not exists(select 1 from pg_index i where i.indrelid=c.conrelid and i.indkey[0]=c.conkey[1]) loop
  execute format('create index if not exists %I on %s (%I)', left(replace(r.nome,'public.',''),63), r.tbl, r.col);
end loop; end $$;
