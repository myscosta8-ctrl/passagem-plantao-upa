-- Rascunho: guarda o formulário (rascunho_estado) para reabrir depois; o autor
-- pode descartar o PRÓPRIO rascunho ("Cancelar"), com registro na auditoria.
-- Documento finalizado continua sem exclusão (só invalidação).
create or replace function public.bloquear_exclusao() returns trigger
language plpgsql set search_path = public as $$
begin
  if to_jsonb(old) ? 'situacao' and old.situacao = 'rascunho' and (to_jsonb(old)->>'autor_auth')::uuid = auth.uid() then
    return old;
  end if;
  raise exception 'Exclusão de dados clínicos não é permitida (%). Use "Invalidar".', tg_table_name using errcode = '42501';
end $$;

do $$ declare t text; begin
for t in select table_name from information_schema.columns where table_schema='public' and column_name='situacao'
  and table_name in (select table_name from information_schema.columns where table_schema='public' and column_name='autor_auth') loop
  execute format('alter table public.%I add column if not exists rascunho_estado jsonb', t);
  execute format('drop trigger if exists trg_auditoria_exclusao on public.%I', t);
  execute format('create trigger trg_auditoria_exclusao after delete on public.%I for each row execute function public.auditar_exclusao()', t);
end loop; end $$;

create or replace function public.limpar_estado_rascunho() returns trigger language plpgsql set search_path = public as $$
begin
  if new.situacao <> 'rascunho' then new.rascunho_estado := null; end if;
  return new;
end $$;
do $$ declare t text; begin
for t in select table_name from information_schema.columns where table_schema='public' and column_name='rascunho_estado' loop
  execute format('drop trigger if exists trg_limpar_rascunho on public.%I', t);
  execute format('create trigger trg_limpar_rascunho before insert or update on public.%I for each row execute function public.limpar_estado_rascunho()', t);
end loop; end $$;
