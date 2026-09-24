-- ==============================================================================
-- MIGRAÇÃO 03: PRONTUÁRIO DE ENFERMAGEM (FICHA CLÍNICA ASSISTENCIAL)
-- SISTEMATIZAÇÃO DA ASSISTÊNCIA DE ENFERMAGEM (SAE) — UPA 24H BREVES
-- ==============================================================================

-- 1. ADMISSÃO E HISTÓRICO DE ENFERMAGEM (ANAMNESE ASSISTENCIAL COMPLETA)
CREATE TABLE IF NOT EXISTS public.admissoes_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    enfermeiro_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    coleta_dados TEXT[],
    procedencia TEXT,
    motivo_procura TEXT,
    diagnostico_medico TEXT,
    medicamentos_uso JSONB,
    alergias_relatadas TEXT,
    antecedentes_pessoais JSONB,
    sinais_vitais_admissao JSONB,
    exame_neurologico JSONB,
    exame_respiratorio JSONB,
    exame_cardiovascular JSONB,
    exame_gastrointestinal JSONB,
    exame_genitourinario JSONB,
    exame_pele_mucosas JSONB,
    dispositivos_instalados JSONB,
    diagnosticos_enfermagem TEXT[],
    intervencoes_plano TEXT[],
    parecer_estado_emocional TEXT,
    parecer_estado_cognitivo TEXT,
    parecer_obs TEXT,
    info_complementares JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alias/view de compatibilidade para historico_enfermagem se referenciado
CREATE TABLE IF NOT EXISTS public.historico_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    enfermeiro_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    coleta_dados TEXT[],
    procedencia TEXT,
    motivo_procura TEXT,
    diagnostico_medico TEXT,
    medicamentos_uso JSONB,
    info_complementares JSONB,
    parecer_estado_emocional TEXT,
    parecer_estado_cognitivo TEXT,
    parecer_obs TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EVOLUÇÃO DIÁRIA DE ENFERMAGEM (SAE)
CREATE TABLE IF NOT EXISTS public.evolucoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    enfermeiro_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    texto TEXT NOT NULL,
    subjetivo TEXT,
    objetivo TEXT,
    avaliacao TEXT,
    plano TEXT,
    intercorrencia BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evolucoes_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    enfermeiro_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    texto TEXT NOT NULL,
    subjetivo TEXT,
    objetivo TEXT,
    avaliacao TEXT,
    plano TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BALANÇO HÍDRICO 24 HORAS (ENTRADAS E PERDAS)
CREATE TABLE IF NOT EXISTS public.balanco_hidrico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    registrado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    via TEXT NOT NULL, -- 'VO', 'SNG', 'SNE', 'Parenteral', 'Diurese', 'Dreno', 'Vomito', 'Evacuacao'
    volume_ml NUMERIC(8,2) NOT NULL,
    descricao TEXT,
    horario_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DISPOSITIVOS INVASIVOS E ACESSOS
CREATE TABLE IF NOT EXISTS public.dispositivos_invasivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    instalado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- 'AVP', 'CVC', 'SVD', 'SNG', 'SNE', 'TOT', 'Traqueostomia', 'Dreno de Torax'
    localizacao TEXT, -- 'MSE', 'MSD', 'Subclavia D', 'Jugular E'
    calibre TEXT, -- '18G', '20G', '16Fr'
    instalado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    removido_em TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'retirado', 'obstruido', 'infiltrado', 'infeccao')),
    curativo_data TIMESTAMPTZ,
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REGISTRO FREQUENTE DE SINAIS VITAIS
CREATE TABLE IF NOT EXISTS public.sinais_vitais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    pressao_arterial_sistolica INTEGER,
    pressao_arterial_diastolica INTEGER,
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    temperatura NUMERIC(4,1),
    saturacao_oxigenio INTEGER,
    hgt INTEGER, -- Glicemia capilar (mg/dL)
    dor_escala INTEGER CHECK (dor_escala BETWEEN 0 AND 10),
    glasgow INTEGER CHECK (glasgow BETWEEN 3 AND 15),
    horario_medicao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRECAUÇÕES E ISOLAMENTO
CREATE TABLE IF NOT EXISTS public.isolamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    prescrito_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- 'padrao', 'contato', 'goticulas', 'aerossol', 'reverso'
    motivo TEXT NOT NULL,
    microorganismo TEXT,
    iniciado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    suspenso_em TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ESCALAS DE AVALIAÇÃO DE RISCO (BRADEN, MORSE, GLASGOW, ETC)
CREATE TABLE IF NOT EXISTS public.escalas_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    avaliado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    tipo TEXT NOT NULL CHECK (tipo IN ('braden', 'morse', 'glasgow', 'mews', 'rass')),
    escore_total INTEGER NOT NULL,
    classificacao_risco TEXT NOT NULL,
    itens_detalhados JSONB NOT NULL,
    avaliado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NOTIFICAÇÃO DE EVENTOS ADVERSOS / QUALIDADE E SEGURANÇA DO PACIENTE
CREATE TABLE IF NOT EXISTS public.eventos_adversos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    notificado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    tipo_evento TEXT NOT NULL, -- 'queda', 'lesao_pressao', 'flebite', 'erro_medicacao', 'extubacao_acidental', 'perda_sonda'
    gravidade TEXT NOT NULL CHECK (gravidade IN ('leve', 'moderado', 'grave', 'sentinela')),
    descricao_detalhada TEXT NOT NULL,
    condutas_imediatas TEXT NOT NULL,
    data_hora_ocorrencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notificado_nsp BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TRANSFERÊNCIA ESTRUTURADA DE PACIENTE (FORMATO SBAR)
CREATE TABLE IF NOT EXISTS public.transferencias_sbar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    transferido_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    setor_origem_id UUID REFERENCES public.setores(id) ON DELETE SET NULL,
    setor_destino_id UUID REFERENCES public.setores(id) ON DELETE SET NULL,
    situacao TEXT NOT NULL,
    breve_historico TEXT NOT NULL,
    avaliacao TEXT NOT NULL,
    recomendacao TEXT NOT NULL,
    data_hora_transferencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
