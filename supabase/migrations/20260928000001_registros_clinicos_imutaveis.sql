-- Registros clínicos: nada é excluído; rascunho editável só pelo autor;
-- "Salvar e Imprimir" finaliza (depois só invalidação, com motivo);
-- toda alteração fica registrada (quem, quando, antes/depois).

create table if not exists public.auditoria_alteracoes (
  id bigserial primary key, tabela text not null, registro_id text, operacao text not null,
  alterado_por uuid, alterado_em timestamptz not null default now(), dados_anteriores jsonb, dados_novos jsonb
);
alter table public.auditoria_alteracoes enable row level security;
drop policy if exists "Leitura autenticada" on public.auditoria_alteracoes;
create policy "Leitura autenticada" on public.auditoria_alteracoes for select to authenticated using (true);
revoke insert, update, delete on public.auditoria_alteracoes from authenticated, anon;
create index if not exists auditoria_alteracoes_tabela_registro_idx on public.auditoria_alteracoes (tabela, registro_id);

create or replace function public.registrar_alteracao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if to_jsonb(new) is distinct from to_jsonb(old) then
    insert into auditoria_alteracoes (tabela, registro_id, operacao, alterado_por, dados_anteriores, dados_novos)
    values (tg_table_name, (to_jsonb(old)->>'id'), tg_op, auth.uid(), to_jsonb(old), to_jsonb(new));
  end if;
  return null;
end $$;

create or replace function public.auditar_exclusao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into auditoria_alteracoes (tabela, registro_id, operacao, alterado_por, dados_anteriores)
  values (tg_table_name, old.id::text, tg_op, auth.uid(), to_jsonb(old));
  return null;
end $$;

create or replace function public.bloquear_exclusao() returns trigger
language plpgsql set search_path = public as $$
begin
  raise exception 'Exclusão de dados clínicos não é permitida (%). Use "Invalidar".', tg_table_name using errcode = '42501';
end $$;

create or replace function public.proteger_documento() returns trigger
language plpgsql set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  livres text[] := array['situacao','invalidado_em','invalidado_por','motivo_invalidacao',
                         'status','cancelado_em','cancelado_por','motivo_cancelamento','atualizado_em'];
begin
  if tg_op = 'INSERT' then
    new.autor_auth := coalesce(v_uid, new.autor_auth);
    new.situacao := coalesce(new.situacao, 'finalizado');
    if new.situacao not in ('rascunho','finalizado') then raise exception 'Situação inválida na criação'; end if;
    if new.situacao = 'finalizado' then new.finalizado_em := now(); end if;
    return new;
  end if;
  new.autor_auth := old.autor_auth;
  if v_uid is null then return new; end if;
  if old.autor_auth is distinct from v_uid then
    raise exception 'Somente o profissional que criou este registro pode alterá-lo.' using errcode = '42501';
  end if;
  if old.situacao = 'invalido' then
    raise exception 'Registro invalidado não pode ser alterado.' using errcode = '42501';
  end if;
  if old.situacao = 'finalizado' then
    if new.situacao is distinct from 'invalido' and new.situacao is distinct from 'finalizado' then
      raise exception 'Registro finalizado (impresso) não volta a rascunho.' using errcode = '42501';
    end if;
    if (to_jsonb(new) - livres) is distinct from (to_jsonb(old) - livres) then
      raise exception 'Registro finalizado (impresso) não pode ser editado — apenas invalidado.' using errcode = '42501';
    end if;
  end if;
  if new.situacao = 'invalido' and old.situacao <> 'invalido' then
    new.invalidado_em := now(); new.invalidado_por := v_uid;
  end if;
  if new.situacao = 'finalizado' and old.situacao = 'rascunho' then new.finalizado_em := now(); end if;
  return new;
end $$;

do $$
declare
  t text; cols text;
  candidatos text[] := array['criado_por','autor_id','medico_id','enfermeiro_id','solicitado_por','solicitante_id','registrado_por','relator_id','notificado_por','transferido_por','profissional_responsavel','avaliado_por','atualizado_por'];
  docs text[] := array['consultas_medicas','aih_solicitacoes','planos_terapeuticos','evolucoes_medicas','regulacao_atualizacoes','notas_intercorrencia_medica','tfd_solicitacoes','solicitacoes_tfd','prescricoes_medicas','solicitacoes_atm','exames_solicitados','apac_solicitacoes','solicitacoes_sangue','solicitacoes_hemoterapia','receitas_medicas','atestados_medicos','sumarios_alta','historico_enfermagem','admissoes_enfermagem','evolucoes','evolucoes_enfermagem','transferencias_sbar','eventos_adversos','escalas_enfermagem','sinais_vitais','balanco_hidrico','sorologias_notificaveis'];
  compartilhadas text[] := array['dispositivos_invasivos','isolamentos','alergias','medicacoes_continuas','internacoes','passagens','balanco_hidrico_periodos','balanco_hidrico_registros','atendimentos','leito_ocupacoes','pessoas'];
begin
  foreach t in array docs loop
    execute format('alter table public.%I add column if not exists autor_auth uuid, add column if not exists situacao text not null default ''finalizado'', add column if not exists finalizado_em timestamptz, add column if not exists invalidado_em timestamptz, add column if not exists invalidado_por uuid, add column if not exists motivo_invalidacao text, add column if not exists data_registro timestamptz not null default now()', t);
    execute format('alter table public.%I drop constraint if exists %I, add constraint %I check (situacao in (''rascunho'',''finalizado'',''invalido''))', t, t||'_situacao_chk', t||'_situacao_chk');
    select string_agg(format('%I', c.column_name), ', ' order by array_position(candidatos, c.column_name::text)) into cols
      from information_schema.columns c where c.table_schema='public' and c.table_name=t and c.data_type='uuid' and c.column_name = any(candidatos);
    if cols is not null then execute format('update public.%I set autor_auth = coalesce(%s) where autor_auth is null', t, cols); end if;
    execute format('update public.%I set finalizado_em = coalesce(finalizado_em, criado_em), data_registro = coalesce(criado_em, data_registro) where situacao = ''finalizado'' and finalizado_em is null', t);
    execute format('drop trigger if exists trg_proteger_documento on public.%I', t);
    execute format('create trigger trg_proteger_documento before insert or update on public.%I for each row execute function public.proteger_documento()', t);
    execute format('drop trigger if exists trg_bloquear_exclusao on public.%I', t);
    execute format('create trigger trg_bloquear_exclusao before delete on public.%I for each row execute function public.bloquear_exclusao()', t);
    execute format('drop trigger if exists trg_auditoria on public.%I', t);
    execute format('create trigger trg_auditoria after update on public.%I for each row execute function public.registrar_alteracao()', t);
  end loop;
  foreach t in array compartilhadas loop
    execute format('drop trigger if exists trg_bloquear_exclusao on public.%I', t);
    execute format('create trigger trg_bloquear_exclusao before delete on public.%I for each row execute function public.bloquear_exclusao()', t);
    execute format('drop trigger if exists trg_auditoria on public.%I', t);
    execute format('create trigger trg_auditoria after update on public.%I for each row execute function public.registrar_alteracao()', t);
  end loop;
end $$;

-- Itens de prescrição: só o autor, só em rascunho (regravação dos itens); exclusões auditadas.
create or replace function public.proteger_prescricao_item() returns trigger
language plpgsql set search_path = public as $$
declare v_sit text; v_autor uuid;
begin
  select situacao, autor_auth into v_sit, v_autor from prescricoes_medicas where id = coalesce(old.prescricao_id, new.prescricao_id);
  if auth.uid() is not null and (v_sit is distinct from 'rascunho' or v_autor is distinct from auth.uid()) then
    raise exception 'Itens de prescrição só podem ser alterados pelo autor enquanto a prescrição está em rascunho.' using errcode = '42501';
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists trg_proteger_item on public.prescricao_itens;
create trigger trg_proteger_item before update or delete on public.prescricao_itens for each row execute function public.proteger_prescricao_item();
drop trigger if exists trg_auditoria_exclusao on public.prescricao_itens;
create trigger trg_auditoria_exclusao after delete on public.prescricao_itens for each row execute function public.auditar_exclusao();
drop trigger if exists trg_auditoria on public.prescricao_itens;
create trigger trg_auditoria after update on public.prescricao_itens for each row execute function public.registrar_alteracao();

create or replace function public.invalidar_registro(p_tabela text, p_id uuid, p_motivo text) returns void
language plpgsql set search_path = public as $$
begin
  if coalesce(trim(p_motivo),'') = '' then raise exception 'Informe o motivo da invalidação.'; end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name=p_tabela and column_name='situacao') then
    raise exception 'Tabela não suporta invalidação.';
  end if;
  execute format('update public.%I set situacao = ''invalido'', motivo_invalidacao = $2 where id = $1', p_tabela) using p_id, p_motivo;
end $$;
revoke all on function public.invalidar_registro(text,uuid,text) from public, anon;
grant execute on function public.invalidar_registro(text,uuid,text) to authenticated;

-- Plano terapêutico: um ativo por atendimento (invalidados não contam).
alter table public.planos_terapeuticos drop constraint if exists planos_terapeuticos_atendimento_id_key;
drop index if exists public.planos_terapeuticos_atendimento_id_key;
create unique index if not exists planos_terapeuticos_atendimento_ativo_uq on public.planos_terapeuticos (atendimento_id) where situacao <> 'invalido';

-- Participação no plantão: encerrada 20 min após o fim do turno (a sessão
-- do usuário é encerrada no app após 2h sem uso).
create or replace function public.encerrar_plantoes_vencidos() returns void language plpgsql set search_path = public as $$
begin
  update plantao_profissionais pp
  set encerrado = true, encerrado_em = now(), encerrado_por_sistema = true
  from plantoes pl
  where pp.plantao_id = pl.id and pp.encerrado = false
    and now() >= (case when pl.turno = 'Diurno' then (pl.data + time '19:20') at time zone 'America/Belem'
                       else ((pl.data + 1) + time '07:20') at time zone 'America/Belem' end);
end $$;
