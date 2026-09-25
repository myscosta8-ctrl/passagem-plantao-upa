-- Campos extras da Nota de Intercorrência de Enfermagem (mockup 13):
-- comunicação ao médico plantonista + horário, sinais vitais no momento
-- do evento, e desfecho/evolução pós-conduta. Aditiva, nullable, sem
-- impacto em dado existente (tabela sem linhas hoje).

ALTER TABLE public.eventos_adversos
  ADD COLUMN IF NOT EXISTS medico_comunicado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS horario_comunicacao_medico TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sv_pa_sistolica NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_pa_diastolica NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_fc NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_fr NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS sv_temperatura NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS sv_spo2 NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS desfecho_evolucao TEXT;
