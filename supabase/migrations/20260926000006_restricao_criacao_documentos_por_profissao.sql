-- Médico cria só documentos médicos; enfermagem só documentos de enfermagem.
-- Ambos continuam lendo tudo (políticas de leitura inalteradas). Admin cria ambos.
create or replace function public.perfil_profissional()
returns text language sql stable security definer set search_path = public as $$
  select case when e.role = 'admin' then 'admin' else coalesce(e.tipo, 'enfermagem') end
  from enfermeiros e where e.id = auth.uid()
$$;
revoke execute on function public.perfil_profissional() from public, anon;
grant execute on function public.perfil_profissional() to authenticated;

do $$
declare t text;
  medicas text[] := array['consultas_medicas','aih_solicitacoes','planos_terapeuticos','evolucoes_medicas','regulacao_atualizacoes','notas_intercorrencia_medica','tfd_solicitacoes','solicitacoes_tfd','prescricoes_medicas','prescricao_itens','solicitacoes_atm','exames_solicitados','apac_solicitacoes','solicitacoes_sangue','solicitacoes_hemoterapia','receitas_medicas','atestados_medicos','sumarios_alta'];
  enfermagem text[] := array['historico_enfermagem','admissoes_enfermagem','evolucoes','evolucoes_enfermagem','balanco_hidrico','balanco_hidrico_registros','balanco_hidrico_periodos','transferencias_sbar','eventos_adversos','isolamentos','escalas_enfermagem','dispositivos_invasivos','passagens'];
  op text;
begin
  foreach t in array medicas loop
    foreach op in array array['insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', 'somente_medico_'||op, t);
      if op = 'insert' then
        execute format('create policy %I on public.%I as restrictive for insert to authenticated with check (public.perfil_profissional() in (''medico'',''admin''))', 'somente_medico_'||op, t);
      else
        execute format('create policy %I on public.%I as restrictive for %s to authenticated using (public.perfil_profissional() in (''medico'',''admin''))', 'somente_medico_'||op, t, op);
      end if;
    end loop;
  end loop;
  foreach t in array enfermagem loop
    foreach op in array array['insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', 'somente_enfermagem_'||op, t);
      if op = 'insert' then
        execute format('create policy %I on public.%I as restrictive for insert to authenticated with check (public.perfil_profissional() in (''enfermagem'',''admin''))', 'somente_enfermagem_'||op, t);
      else
        execute format('create policy %I on public.%I as restrictive for %s to authenticated using (public.perfil_profissional() in (''enfermagem'',''admin''))', 'somente_enfermagem_'||op, t, op);
      end if;
    end loop;
  end loop;
end $$;
