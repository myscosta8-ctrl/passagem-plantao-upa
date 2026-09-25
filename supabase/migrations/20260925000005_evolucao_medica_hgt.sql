-- Adiciona HGT (glicemia capilar) aos sinais vitais da evolução médica diária,
-- alinhando com o campo já existente em sinais_vitais (enfermagem) e com o
-- modelo de tela oficial (mockups-fase2/03-prontuario-medico-evolucao-medica.html).
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS sv_hgt INTEGER;
