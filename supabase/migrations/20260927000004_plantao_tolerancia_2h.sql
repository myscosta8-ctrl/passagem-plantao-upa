create or replace function public.encerrar_plantoes_vencidos() returns void language plpgsql set search_path = public as $$
begin
  -- Fim do plantão (19h diurno / 7h noturno) + 2h de tolerância.
  update plantao_profissionais pp
  set encerrado = true, encerrado_em = now(), encerrado_por_sistema = true
  from plantoes pl
  where pp.plantao_id = pl.id and pp.encerrado = false
    and now() >= (case when pl.turno = 'Diurno' then (pl.data + time '21:00') at time zone 'America/Belem'
                       else ((pl.data + 1) + time '09:00') at time zone 'America/Belem' end);
end $$;
