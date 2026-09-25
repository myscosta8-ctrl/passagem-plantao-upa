-- Adiciona sinais vitais opcionais (puxados/editados a partir da aba de Sinais Vitais
-- da Enfermagem) na Evolução Médica Diária. Aditiva, nullable, sem impacto em dado existente.

ALTER TABLE public.evolucoes_medicas
  ADD COLUMN IF NOT EXISTS sv_pa_sistolica NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_pa_diastolica NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_fc NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_fr NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_temperatura NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS sv_spo2 NUMERIC(5,1);
