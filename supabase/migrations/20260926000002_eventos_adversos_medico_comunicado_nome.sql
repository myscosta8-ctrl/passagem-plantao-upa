-- Nome do médico plantonista comunicado na nota de intercorrência (mockup 13).
alter table public.eventos_adversos add column if not exists medico_comunicado_nome text;
