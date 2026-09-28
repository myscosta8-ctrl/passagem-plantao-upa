-- meus_rascunhos(): documentos do próprio profissional salvos como rascunho. SECURITY INVOKER (RLS vale).
-- Aplicado no Supabase em 28/09/2026.
create or replace function public.meus_rascunhos()
returns table(tabela text, registro_id uuid, atendimento_id uuid, salvo_em timestamptz, paciente text, leito text, setor text)
language plpgsql stable security invoker set search_path to 'public'
as $$
declare t text;
begin
  if auth.uid() is null or not public.usuario_autorizado() then return; end if;
  for t in
    select c.table_name from information_schema.columns c
    where c.table_schema = 'public' and c.column_name = 'situacao'
      and exists (select 1 from information_schema.columns d where d.table_schema='public' and d.table_name=c.table_name and d.column_name='autor_auth')
      and exists (select 1 from information_schema.columns d where d.table_schema='public' and d.table_name=c.table_name and d.column_name='atendimento_id')
      and exists (select 1 from information_schema.columns d where d.table_schema='public' and d.table_name=c.table_name and d.column_name='id' and d.data_type='uuid')
  loop
    return query execute format(
      'select %L::text, r.id, r.atendimento_id,
              coalesce((to_jsonb(r)->>''atualizado_em'')::timestamptz, (to_jsonb(r)->>''criado_em'')::timestamptz),
              p.nome, l.numero, s.nome
         from public.%I r
         left join public.atendimentos a on a.id = r.atendimento_id
         left join public.pessoas p on p.id = a.pessoa_id
         left join lateral (select lo.leito_id from public.leito_ocupacoes lo where lo.atendimento_id = r.atendimento_id and lo.liberado_em is null and lo.desocupado_em is null order by lo.alocado_em desc limit 1) oc on true
         left join public.leitos l on l.id = oc.leito_id
         left join public.setores s on s.id = l.setor_id
        where r.situacao = ''rascunho'' and r.autor_auth = auth.uid()', t, t);
  end loop;
end $$;
grant execute on function public.meus_rascunhos() to authenticated;
