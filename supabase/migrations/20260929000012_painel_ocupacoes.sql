-- Painel: uma única chamada traz ocupação, atendimento, pessoa, internação, alergia e última passagem.
-- SECURITY INVOKER: as regras de acesso (RLS) de cada tabela continuam valendo.
create or replace function public.painel_ocupacoes()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'leito_id', o.leito_id,
    'atendimento', to_jsonb(a),
    'pessoa', to_jsonb(p),
    'internacao', (select to_jsonb(i) from internacoes i where i.atendimento_id = a.id order by i.internado_em desc nulls last limit 1),
    'alergia', (select al.substancia from alergias al where al.pessoa_id = p.id and al.status = 'ativa' limit 1),
    'passagem', (select to_jsonb(ps) || jsonb_build_object('enfermeiros', (select jsonb_build_object('nome_exibicao', e.nome_exibicao, 'nome', e.nome) from enfermeiros e where e.id = ps.criado_por))
                 from passagens ps where ps.atendimento_id = a.id and ps.criado_em >= now() - interval '30 days'
                 order by ps.criado_em desc limit 1)
  )), '[]'::jsonb)
  from leito_ocupacoes o
  join atendimentos a on a.id = o.atendimento_id
  join pessoas p on p.id = a.pessoa_id
  where o.status = 'ativo' and usuario_autorizado();
$$;
revoke execute on function public.painel_ocupacoes() from public, anon;
grant execute on function public.painel_ocupacoes() to authenticated;
