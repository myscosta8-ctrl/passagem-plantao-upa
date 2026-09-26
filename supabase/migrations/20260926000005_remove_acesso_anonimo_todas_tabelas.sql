-- Nenhuma informação acessível sem login: remove todas as políticas e permissões do papel anon.
do $$ declare r record; begin
  for r in select schemaname, tablename, policyname from pg_policies where roles @> '{anon}' and schemaname in ('public','storage') loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from anon;
