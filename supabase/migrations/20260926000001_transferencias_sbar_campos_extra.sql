-- Campos da transferência inter-hospitalar (mockup 14) sem coluna própria:
-- logística (hospital/setor destino, protocolo, transporte, equipe), motivo, condutas, checklist.
alter table public.transferencias_sbar add column if not exists campos_extra jsonb not null default '{}'::jsonb;
