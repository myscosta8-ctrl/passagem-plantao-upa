-- Funções profissionais da UPA (catálogo). Cada função aponta para um perfil de acesso base:
--   medico | enfermagem | recepcao | apoio (consulta; sem registrar documentos clínicos).
-- enfermeiros.tipo continua sendo o perfil de acesso (o sistema todo depende dele);
-- enfermeiros.funcao é a função exata (nome, conselho e prefixo dos documentos).

create table if not exists public.funcoes_profissionais (
  chave text primary key,
  nome text not null,
  perfil_base text not null check (perfil_base in ('medico','enfermagem','recepcao','apoio')),
  conselho text,
  prefixo_exibicao text not null default '',
  ordem int not null default 0
);
alter table public.funcoes_profissionais enable row level security;
drop policy if exists somente_usuarios_autorizados on public.funcoes_profissionais;
create policy somente_usuarios_autorizados on public.funcoes_profissionais as restrictive for all using (public.usuario_autorizado()) with check (public.usuario_autorizado());
drop policy if exists funcoes_leitura on public.funcoes_profissionais;
create policy funcoes_leitura on public.funcoes_profissionais for select to authenticated using (true);

insert into public.funcoes_profissionais (chave, nome, perfil_base, conselho, prefixo_exibicao, ordem) values
 ('medico','Médico(a)','medico','CRM','DR.',1),
 ('enfermeiro','Enfermeiro(a)','enfermagem','COREN','ENF.',2),
 ('tecnico_enfermagem','Técnico(a) de enfermagem','enfermagem','COREN','TEC.',3),
 ('recepcao','Recepcionista','recepcao',null,'REC.',4),
 ('farmaceutico','Farmacêutico(a)','apoio','CRF','FARM.',5),
 ('assistente_social','Assistente social','apoio','CRESS','AS.',6),
 ('psicologo','Psicólogo(a)','apoio','CRP','PSI.',7),
 ('fisioterapeuta','Fisioterapeuta','apoio','CREFITO','FISIO.',8),
 ('nutricionista','Nutricionista','apoio','CRN','NUTRI.',9),
 ('biomedico','Biomédico(a) / Laboratório','apoio','CRBM','BIOM.',10),
 ('tecnico_radiologia','Técnico(a) em radiologia','apoio','CRTR','TEC.RX',11),
 ('administrativo','Administrativo / Gestão','apoio',null,'ADM.',12),
 ('apoio_operacional','Apoio operacional (motorista, maqueiro, serviços gerais)','apoio',null,'',13)
on conflict (chave) do update set nome=excluded.nome, perfil_base=excluded.perfil_base, conselho=excluded.conselho, prefixo_exibicao=excluded.prefixo_exibicao, ordem=excluded.ordem;

alter table public.enfermeiros
  add column if not exists funcao text references public.funcoes_profissionais(chave) on update cascade,
  add column if not exists registro_profissional text;

-- Mantém tipo (perfil de acesso) coerente com a função escolhida.
create or replace function public.sincronizar_tipo_funcao() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_base text;
begin
  if new.funcao is not null then
    select perfil_base into v_base from public.funcoes_profissionais where chave = new.funcao;
    if v_base is not null then new.tipo := v_base; end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_a_sync_tipo_funcao on public.enfermeiros;
create trigger trg_a_sync_tipo_funcao before insert or update on public.enfermeiros
  for each row execute function public.sincronizar_tipo_funcao();

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
  if (new.tipo is distinct from old.tipo or new.funcao is distinct from old.funcao) and old.id = auth.uid() then
    raise exception 'Você não pode alterar a própria função';
  end if;
  if new.tipo is distinct from old.tipo or new.funcao is distinct from old.funcao
     or new.crm is distinct from old.crm or new.coren is distinct from old.coren
     or new.registro_profissional is distinct from old.registro_profissional
     or new.conselho_uf is distinct from old.conselho_uf
     or (old.id <> auth.uid() and (new.nome is distinct from old.nome or new.nome_exibicao is distinct from old.nome_exibicao)) then
    if not public.tem_permissao('editar_cadastro') then
      raise exception 'Sem permissão para editar o cadastro profissional';
    end if;
  end if;
  return new;
end $$;

drop function if exists public.painel_equipe();
create function public.painel_equipe()
returns table(id uuid, nome text, nome_exibicao text, tipo text, role text, ativo boolean, crm text, coren text, conselho_uf text,
  deve_trocar_senha boolean, usuario text, criado_em timestamptz, ultimo_login timestamptz, ultimo_acesso_em timestamptz,
  em_plantao boolean, plantao_atual text, ultimo_plantao text, plantoes_30d integer,
  cargo_admin text, permissoes_extra text[], permissoes_removidas text[],
  funcao text, funcao_nome text, funcao_conselho text, registro_profissional text)
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
         e.cargo_admin, e.permissoes_extra, e.permissoes_removidas,
         e.funcao, f.nome, f.conselho, e.registro_profissional
  from enfermeiros e left join auth.users u on u.id = e.id left join funcoes_profissionais f on f.chave = e.funcao
  where public.usuario_autorizado() and public.tem_permissao('ver_equipe')
  order by e.nome;
$$;
revoke all on function public.painel_equipe() from public, anon;
grant execute on function public.painel_equipe() to authenticated;
