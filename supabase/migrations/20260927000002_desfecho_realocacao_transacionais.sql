-- Desfecho e realocação em transação única (tudo grava junto ou nada grava).
create or replace function public.registrar_desfecho(p_atendimento_id uuid, p_leito_id integer, p_tipo text, p_detalhe text default null, p_dados_obito jsonb default null)
returns void language plpgsql set search_path = public as $$
declare v_agora timestamptz := now(); v_autor uuid;
begin
  select id into v_autor from enfermeiros where id = auth.uid() limit 1;
  update atendimentos set status = 'alta', encerrado_em = v_agora,
    data_conduta_definida = case when status_internacao = 'Em observação' and data_conduta_definida is null then v_agora else data_conduta_definida end
  where id = p_atendimento_id;
  if not found then raise exception 'Atendimento não encontrado'; end if;
  update internacoes set resumo_alta = coalesce(p_detalhe, resumo_alta), encerrado_em = v_agora,
    desfecho_tipo = p_tipo, desfecho_em = v_agora, desfecho_obs = p_detalhe, dados_obito = coalesce(p_dados_obito, dados_obito)
  where atendimento_id = p_atendimento_id;
  update leito_ocupacoes set status = 'encerrado', liberado_em = v_agora, motivo_transferencia = p_tipo
  where atendimento_id = p_atendimento_id and status = 'ativo' and (p_leito_id is null or leito_id = p_leito_id);
  insert into eventos_auditoria (atendimento_id, autor_id, acao, dados)
  values (p_atendimento_id, v_autor, 'desfecho_registrado', jsonb_build_object('tipo', p_tipo, 'detalhe', p_detalhe));
end $$;

create or replace function public.realocar_atendimento(p_atendimento_id uuid, p_leito_origem_id integer, p_leito_destino_id integer, p_setor_destino_id integer)
returns void language plpgsql set search_path = public as $$
declare v_agora timestamptz := now();
begin
  if exists (select 1 from leito_ocupacoes where leito_id = p_leito_destino_id and status = 'ativo') then
    raise exception 'Leito de destino já está ocupado';
  end if;
  update leito_ocupacoes set status = 'encerrado', liberado_em = v_agora, motivo_transferencia = 'realocação'
  where leito_id = p_leito_origem_id and atendimento_id = p_atendimento_id and status = 'ativo';
  insert into leito_ocupacoes (leito_id, atendimento_id, status) values (p_leito_destino_id, p_atendimento_id, 'ativo');
  update atendimentos set setor_id = p_setor_destino_id where id = p_atendimento_id;
end $$;

revoke all on function public.registrar_desfecho(uuid,integer,text,text,jsonb) from public, anon;
revoke all on function public.realocar_atendimento(uuid,integer,integer,integer) from public, anon;
grant execute on function public.registrar_desfecho(uuid,integer,text,text,jsonb) to authenticated;
grant execute on function public.realocar_atendimento(uuid,integer,integer,integer) to authenticated;

-- Correção de dados: data e tipo do desfecho nos atendimentos já encerrados.
update atendimentos a set encerrado_em = i.encerrado_em from internacoes i
 where i.atendimento_id=a.id and a.status='alta' and a.encerrado_em is null and i.encerrado_em is not null;
update internacoes i set desfecho_tipo = p.tipo_desfecho, desfecho_obs = coalesce(i.desfecho_obs, p.desfecho_detalhe), desfecho_em = coalesce(i.desfecho_em, p.data_desfecho, i.encerrado_em)
  from atendimentos a join pacientes p on p.id = a.migrado_de_paciente_id
 where a.id=i.atendimento_id and a.status='alta' and i.desfecho_tipo is null and p.tipo_desfecho is not null;
