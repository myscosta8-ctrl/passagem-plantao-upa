-- ==============================================================================
-- MIGRAÇÃO 02: NÚCLEO DO PRONTUÁRIO ELETRÔNICO DO PACIENTE (PEP CORE)
-- IDENTIFICAÇÃO DO CIDADÃO, RECEPÇÃO, ATENDIMENTOS E INTERNAÇÕES
-- ==============================================================================

-- 1. REGISTRO GERAL DE PESSOAS (CIDADÃO / PACIENTE SUS)
CREATE TABLE IF NOT EXISTS public.pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prontuario_numero TEXT UNIQUE,
    nome TEXT NOT NULL,
    nome_mae TEXT,
    nome_pai TEXT,
    data_nascimento DATE,
    idade_informada INTEGER,
    sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
    raca_cor TEXT,
    religiao TEXT,
    nacionalidade TEXT DEFAULT 'Brasil',
    naturalidade TEXT,
    rg TEXT,
    cpf TEXT,
    cns TEXT,
    numero_registro_nascimento TEXT,
    telefone TEXT,
    telefone_contato TEXT,
    endereco TEXT,
    endereco_numero TEXT,
    bairro TEXT,
    cidade TEXT DEFAULT 'Breves',
    uf TEXT DEFAULT 'PA',
    cep TEXT DEFAULT '68800-000',
    municipio_ibge TEXT DEFAULT '1501808',
    mesclado_com_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CONTROLE DE DUPLICATAS DE CADASTRO
CREATE TABLE IF NOT EXISTS public.pessoas_duplicatas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_origem_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    pessoa_duplicada_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    similaridade_score NUMERIC(5,2),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'descartado')),
    revisado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    revisado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HISTÓRICO DE FUSÕES DE CADASTROS DUPLICADOS
CREATE TABLE IF NOT EXISTS public.pessoas_fusoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_mantida_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    pessoa_mesclada_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    motivo TEXT,
    realizado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    realizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EPISÓDIOS DE ATENDIMENTO HOSPITALAR (PORTA DE ENTRADA / UPA)
CREATE TABLE IF NOT EXISTS public.atendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_atendimento TEXT UNIQUE,
    pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL DEFAULT 'internacao' CHECK (tipo IN ('urgencia', 'emergencia', 'ambulatorial', 'internacao', 'observacao')),
    carater TEXT NOT NULL DEFAULT 'Urgência',
    convenio TEXT NOT NULL DEFAULT 'SUS',
    tipo_entrada TEXT DEFAULT 'Demanda espontânea',
    status TEXT NOT NULL DEFAULT 'internado' CHECK (status IN ('triagem', 'atendimento', 'internado', 'alta', 'obito', 'transferido', 'evasao')),
    status_internacao TEXT DEFAULT 'Em observação',
    classificacao_risco_cor TEXT CHECK (classificacao_risco_cor IN ('Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul')),
    regulacao_flag BOOLEAN DEFAULT false,
    regulacao_tipo TEXT,
    regulacao_aberta_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    encerrado_em TIMESTAMPTZ
);

-- 5. INTERNAÇÕES ASSOCIADAS AO ATENDIMENTO
CREATE TABLE IF NOT EXISTS public.internacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    internado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diagnostico_admissao TEXT,
    cid_admissao TEXT,
    medico_admissao_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    previsao_alta DATE,
    desfecho_tipo TEXT CHECK (desfecho_tipo IN ('alta_curado', 'alta_melhorado', 'alta_a_pedido', 'transferencia', 'obito', 'evasao')),
    desfecho_em TIMESTAMPTZ,
    desfecho_obs TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. OCUPAÇÃO DE LEITOS EM TEMPO REAL
CREATE TABLE IF NOT EXISTS public.leito_ocupacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leito_id UUID NOT NULL REFERENCES public.leitos(id) ON DELETE CASCADE,
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    alocado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    desocupado_em TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'encerrado', 'transferido')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ALERGIAS DO PACIENTE (NÍVEL DE PESSOA)
CREATE TABLE IF NOT EXISTS public.alergias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    substancia TEXT NOT NULL,
    reacao TEXT,
    gravidade TEXT DEFAULT 'moderada' CHECK (gravidade IN ('leve', 'moderada', 'grave', 'choque_anafilatico')),
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'resolvida')),
    registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MEDICAÇÕES DE USO CONTÍNUO DOMICILIAR
CREATE TABLE IF NOT EXISTS public.medicacoes_continuas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    medicamento TEXT NOT NULL,
    dose TEXT,
    frequencia TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'interrompido')),
    registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    registrado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key adicional de ligação da passagem de plantão com atendimento
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_passagem_atendimento'
    ) THEN
        ALTER TABLE public.passagens 
        ADD CONSTRAINT fk_passagem_atendimento 
        FOREIGN KEY (atendimento_id) REFERENCES public.atendimentos(id) ON DELETE CASCADE;
    END IF;
END $$;
