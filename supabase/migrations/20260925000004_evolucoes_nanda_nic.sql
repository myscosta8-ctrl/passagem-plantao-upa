-- Diagnósticos de Enfermagem (NANDA-I) e Prescrição de Cuidados (NIC) na
-- Evolução de Enfermagem (SAE), mockup 09. Catálogos fixos selecionáveis,
-- nenhum marcado por padrão. Aditiva, nullable, sem impacto em dado existente.

ALTER TABLE public.evolucoes
  ADD COLUMN IF NOT EXISTS diagnosticos_nanda TEXT[],
  ADD COLUMN IF NOT EXISTS prescricao_nic TEXT[];
