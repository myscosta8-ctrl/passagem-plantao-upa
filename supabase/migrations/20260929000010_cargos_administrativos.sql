-- Cargos administrativos + permissões por pessoa (modelo A+C).
-- Administrador geral = role 'admin' (só o dono do sistema): tem tudo e é o único que define cargos.
-- Demais pessoas: cargo pronto (cargos_admin) + permissões extras/removidas por pessoa.

create table if not exists public.cargos_admin (
  chave text primary key,
  nome text not null,
  descricao text not null,
  permissoes text[] not null default '{}',
  ordem int not null default 0
);
alter table public.cargos_admin enable row level security;
drop policy if exists somente_usuarios_autorizados on public.cargos_admin;
create policy somente_usuarios_autorizados on public.cargos_admin as restrictive for all using (public.usuario_autorizado()) with check (public.usuario_autorizado());
drop policy if exists cargos_leitura on public.cargos_admin;
create policy cargos_leitura on public.cargos_admin for select to authenticated using (true);

insert into public.cargos_admin (chave, nome, descricao, permissoes, ordem) values
 ('gestao_pessoal','Gestão de pessoal','Cadastra funcionários, edita cadastros, reseta senhas, ativa/desativa acessos e vê a equipe.', array['cadastrar_funcionarios','editar_cadastro','resetar_senha','ativar_desativar','ver_equipe'], 1),
 ('cadastro_funcionarios','Cadastro de funcionários','Cria logins e edita cadastros; vê a equipe. Não reseta senha nem desativa acessos.', array['cadastrar_funcionarios','editar_cadastro','ver_equipe'], 2),
 ('consulta_equipe','Consulta da equipe','Apenas visualiza o Painel de Equipe.', array['ver_equipe'], 3)
on conflict (chave) do update set nome=excluded.nome, descricao=excluded.descricao, permissoes=excluded.permissoes, ordem=excluded.ordem;

alter table public.enfermeiros
  add column if not exists cargo_admin text references public.cargos_admin(chave) on update cascade,
  add column if not exists permissoes_extra text[] not null default '{}',
  add column if not exists permissoes_removidas text[] not null default '{}';

create or replace function public.tem_permissao(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.usuario_autorizado() and (
    public.is_admin()
    or exists (
      select 1 from public.enfermeiros e left join public.cargos_admin c on c.chave = e.cargo_admin
      where e.id = auth.uid() and coalesce(e.ativo, true)
        and p = any (array['cadastrar_funcionarios','editar_cadastro','resetar_senha','ativar_desativar','ver_equipe'])
        and (p = any (coalesce(c.permissoes, '{}')) or p = any (e.permissoes_extra))
        and not (p = any (e.permissoes_removidas))
    )
  );
$$;

create or replace function public.minhas_permissoes() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(x order by x), '{}')
  from unnest(array['cadastrar_funcionarios','editar_cadastro','resetar_senha','ativar_desativar','ver_equipe']) x
  where public.tem_permissao(x);
$$;

create or replace function public.definir_cargo_profissional(p_id uuid, p_cargo text, p_extra text[], p_removidas text[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_role text; v_ant jsonb;
  v_cat text[] := array['cadastrar_funcionarios','editar_cadastro','resetar_senha','ativar_desativar','ver_equipe'];
begin
  if auth.uid() is null or not public.usuario_autorizado() or not public.is_admin() then
    raise exception 'Somente o administrador geral pode definir cargos e permissões' using errcode = '42501';
  end if;
  select role, jsonb_build_object('cargo', cargo_admin, 'extra', permissoes_extra, 'removidas', permissoes_removidas)
    into v_role, v_ant from public.enfermeiros where id = p_id;
  if not found then raise exception 'Profissional não encontrado'; end if;
  if v_role = 'admin' then raise exception 'O administrador geral já tem acesso total'; end if;
  if p_cargo is not null and not exists (select 1 from public.cargos_admin where chave = p_cargo) then raise exception 'Cargo inválido'; end if;
  p_extra := coalesce(p_extra, '{}'); p_removidas := coalesce(p_removidas, '{}');
  if exists (select 1 from unnest(p_extra || p_removidas) x where x <> all (v_cat)) then raise exception 'Permissão inválida'; end if;
  update public.enfermeiros set cargo_admin = p_cargo, permissoes_extra = p_extra, permissoes_removidas = p_removidas where id = p_id;
  insert into public.eventos_auditoria (autor_id, acao, entidade, entidade_id, dados_anteriores, dados_novos)
    values (auth.uid(), 'definir_cargo', 'enfermeiros', p_id, v_ant,
            jsonb_build_object('cargo', p_cargo, 'extra', p_extra, 'removidas', p_removidas));
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.proteger_campos_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  if new.id is distinct from old.id or new.email is distinct from old.email or new.senha_hash is distinct from old.senha_hash
     or new.role is distinct from old.role or new.cargo_admin is distinct from old.cargo_admin
     or new.permissoes_extra is distinct from old.permissoes_extra or new.permissoes_removidas is distinct from old.permissoes_removidas then
    raise exception 'Somente o administrador geral pode alterar cargo, permissões, acesso ou credenciais';
  end if;
  if old.role = 'admin' then
    raise exception 'Somente o administrador geral pode alterar a conta de administrador';
  end if;
  if new.ativo is distinct from old.ativo then
    if old.id = auth.uid() or not public.tem_permissao('ativar_desativar') then
      raise exception 'Sem permissão para ativar ou desativar este acesso';
    end if;
  end if;
  if new.tipo is distinct from old.tipo and old.id = auth.uid() then
    raise exception 'Você não pode alterar o próprio tipo de profissional';
  end if;
  if new.tipo is distinct from old.tipo or new.crm is distinct from old.crm or new.coren is distinct from old.coren
     or new.conselho_uf is distinct from old.conselho_uf
     or (old.id <> auth.uid() and (new.nome is distinct from old.nome or new.nome_exibicao is distinct from old.nome_exibicao)) then
    if not public.tem_permissao('editar_cadastro') then
      raise exception 'Sem permissão para editar o cadastro profissional';
    end if;
  end if;
  return new;
end $$;

drop policy if exists enf_atualiza_proprio_ou_admin on public.enfermeiros;
create policy enf_atualiza_proprio_ou_admin on public.enfermeiros for update
  using (id = auth.uid() or public.is_admin() or public.tem_permissao('editar_cadastro') or public.tem_permissao('ativar_desativar'))
  with check (id = auth.uid() or public.is_admin() or public.tem_permissao('editar_cadastro') or public.tem_permissao('ativar_desativar'));

drop function if exists public.painel_equipe();
create function public.painel_equipe()
returns table(id uuid, nome text, nome_exibicao text, tipo text, role text, ativo boolean, crm text, coren text, conselho_uf text,
  deve_trocar_senha boolean, usuario text, criado_em timestamptz, ultimo_login timestamptz, ultimo_acesso_em timestamptz,
  em_plantao boolean, plantao_atual text, ultimo_plantao text, plantoes_30d integer,
  cargo_admin text, permissoes_extra text[], permissoes_removidas text[])
language sql stable security definer set search_path = public, auth as $$
  select e.id, e.nome, e.nome_exibicao, e.tipo, e.role, coalesce(e.ativo, true),
         e.crm, e.coren, e.conselho_uf, coalesce(e.deve_trocar_senha, false),
         split_part(u.email, '@', 1), u.created_at, u.last_sign_in_at, e.ultimo_acesso_em,
         exists (select 1 from plantao_profissionais pp where pp.enfermeiro_id = e.id and pp.encerrado = false),
         (select p.turno || ' ' || to_char(p.data, 'DD/MM') from plantao_profissionais pp join plantoes p on p.id = pp.plantao_id
            where pp.enfermeiro_id = e.id and pp.encerrado = false order by p.data desc limit 1),
         (select p.turno || ' ' || to_char(p.data, 'DD/MM') from plantao_profissionais pp join plantoes p on p.id = pp.plantao_id
            where pp.enfermeiro_id = e.id order by p.data desc, pp.criado_em desc limit 1),
         (select count(*)::int from plantao_profissionais pp join plantoes p on p.id = pp.plantao_id
            where pp.enfermeiro_id = e.id and p.data >= current_date - 30),
         e.cargo_admin, e.permissoes_extra, e.permissoes_removidas
  from enfermeiros e left join auth.users u on u.id = e.id
  where public.usuario_autorizado() and public.tem_permissao('ver_equipe')
  order by e.nome;
$$;

revoke all on function public.tem_permissao(text), public.minhas_permissoes(), public.painel_equipe(),
  public.definir_cargo_profissional(uuid, text, text[], text[]) from public, anon;
grant execute on function public.tem_permissao(text), public.minhas_permissoes(), public.painel_equipe(),
  public.definir_cargo_profissional(uuid, text, text[], text[]) to authenticated;
