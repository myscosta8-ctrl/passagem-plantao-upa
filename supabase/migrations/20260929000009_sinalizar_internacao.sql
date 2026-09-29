-- Aplicada via MCP em 29/09/2026: sinalizar_internacao(atendimento, status)
-- Enfermagem, recepção e admin sinalizam observação <-> internado. Grava auditoria (acao 'sinalizar_internacao')
-- e marca data_conduta_definida uma única vez ao sair de observação.
create or replace function public.sinalizar_internacao(p_atendimento_id uuid, p_novo_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_tipo text; v_atual text; v_status text; v_conduta timestamptz;
begin
  if auth.uid() is null or not public.usuario_autorizado() then raise exception 'Acesso negado' using errcode='42501'; end if;
  select tipo into v_tipo from public.enfermeiros where id = auth.uid();
  if not (v_tipo in ('enfermagem','recepcao') or public.is_admin()) then raise exception 'Só enfermagem ou recepção podem sinalizar internação' using errcode='42501'; end if;
  if p_novo_status not in ('Em observação','Internado') then raise exception 'Status inválido'; end if;
  select status_internacao, status, data_conduta_definida into v_atual, v_status, v_conduta from public.atendimentos where id = p_atendimento_id for update;
  if not found then raise exception 'Atendimento não encontrado'; end if;
  if v_status <> 'internado' then raise exception 'Atendimento já encerrado'; end if;
  if v_atual is not distinct from p_novo_status then return jsonb_build_object('ok', true, 'alterado', false, 'status', v_atual); end if;
  update public.atendimentos set status_internacao = p_novo_status,
    data_conduta_definida = case when v_atual = 'Em observação' and v_conduta is null then now() else v_conduta end where id = p_atendimento_id;
  insert into public.eventos_auditoria (atendimento_id, autor_id, acao, dados) values (p_atendimento_id, auth.uid(), 'sinalizar_internacao', jsonb_build_object('de', v_atual, 'para', p_novo_status, 'perfil', v_tipo));
  return jsonb_build_object('ok', true, 'alterado', true, 'status', p_novo_status);
end $$;
revoke all on function public.sinalizar_internacao(uuid, text) from public, anon;
grant execute on function public.sinalizar_internacao(uuid, text) to authenticated;
