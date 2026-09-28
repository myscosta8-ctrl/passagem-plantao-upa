-- painel_equipe(): responde só para administradores. Aplicado no Supabase em 28/09/2026.
create or replace function public.painel_equipe()
 returns table(id uuid, nome text, nome_exibicao text, tipo text, role text, ativo boolean, crm text, coren text, conselho_uf text, deve_trocar_senha boolean, usuario text, criado_em timestamptz, ultimo_login timestamptz, ultimo_acesso_em timestamptz, em_plantao boolean, plantao_atual text, ultimo_plantao text, plantoes_30d integer)
 language sql stable security definer set search_path to 'public', 'auth'
as $function$
  select e.id, e.nome, e.nome_exibicao, e.tipo, e.role, coalesce(e.ativo, true),
         e.crm, e.coren, e.conselho_uf, coalesce(e.deve_trocar_senha, false),
         split_part(u.email, '@', 1), u.created_at, u.last_sign_in_at, e.ultimo_acesso_em,
         exists (select 1 from plantao_profissionais pp where pp.enfermeiro_id = e.id and pp.encerrado = false),
         (select p.turno || ' ' || to_char(p.data, 'DD/MM') from plantao_profissionais pp join plantoes p on p.id = pp.plantao_id
            where pp.enfermeiro_id = e.id and pp.encerrado = false order by p.data desc limit 1),
         (select p.turno || ' ' || to_char(p.data, 'DD/MM') from plantao_profissionais pp join plantoes p on p.id = pp.plantao_id
            where pp.enfermeiro_id = e.id order by p.data desc, pp.criado_em desc limit 1),
         (select count(*)::int from plantao_profissionais pp join plantoes p on p.id = pp.plantao_id
            where pp.enfermeiro_id = e.id and p.data >= current_date - 30)
  from enfermeiros e left join auth.users u on u.id = e.id
  where public.usuario_autorizado() and public.is_admin()
  order by e.nome;
$function$;
