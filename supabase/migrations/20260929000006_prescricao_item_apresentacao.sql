-- Prescrição: apresentação (sigla AMP/FA/FRS/BLS/CP...) e quantidade por dose de cada item
alter table public.prescricao_itens add column if not exists apresentacao text, add column if not exists qtd_por_dose numeric default 1;
