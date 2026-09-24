-- ==============================================================================
-- MIGRAÇÃO 01: ESTRUTURA BASE DO SISTEMA E PASSAGEM DE PLANTÃO
-- UPA 24H BREVES — SECRETARIA MUNICIPAL DE SAÚDE (SEMSA)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA DE PROFISSIONAIS E AUTENTICAÇÃO (MÉDICOS, ENFERMEIROS, ADMIN)
CREATE TABLE IF NOT EXISTS public.enfermeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    nome_exibicao TEXT,
    email TEXT UNIQUE,
    senha_hash TEXT,
    coren TEXT,
    crm TEXT,
    role TEXT NOT NULL DEFAULT 'enfermeiro' CHECK (role IN ('admin', 'enfermeiro', 'medico', 'tecnico', 'recepcao')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    pep_beta BOOLEAN NOT NULL DEFAULT true,
    primeiro_acesso BOOLEAN NOT NULL DEFAULT true,
    deve_trocar_senha BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA DE SETORES HOSPITALARES DA UPA
CREATE TABLE IF NOT EXISTS public.setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    sigla TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE LEITOS POR SETOR
CREATE TABLE IF NOT EXISTS public.leitos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setor_id UUID NOT NULL REFERENCES public.setores(id) ON DELETE CASCADE,
    numero TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'comum' CHECK (tipo IN ('comum', 'extra', 'isolamento', 'emergencia')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_leito_setor_numero UNIQUE (setor_id, numero)
);

-- 4. TABELA DE PLANTÕES DE ENFERMAGEM E MÉDICOS (12H / 24H)
CREATE TABLE IF NOT EXISTS public.plantoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_fim TIMESTAMPTZ,
    turno TEXT NOT NULL CHECK (turno IN ('diurno', 'noturno', '24h')),
    enfermeiro_chefe_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'encerrado')),
    observacoes TEXT,
    curativo_ok BOOLEAN DEFAULT true,
    carrinho_ok BOOLEAN DEFAULT true,
    nota_extra TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    encerrado_em TIMESTAMPTZ
);

-- 5. ESCALA DE PROFISSIONAIS POR PLANTÃO
CREATE TABLE IF NOT EXISTS public.plantao_profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plantao_id UUID NOT NULL REFERENCES public.plantoes(id) ON DELETE CASCADE,
    enfermeiro_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE CASCADE,
    funcao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_plantao_profissional UNIQUE (plantao_id, enfermeiro_id)
);

-- 6. REGISTRO LEGADO DE PACIENTES (COMPATIBILIDADE FASE 0)
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    diagnostico TEXT,
    idade INTEGER,
    sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
    data_admissao DATE,
    data_nascimento DATE,
    alergias BOOLEAN DEFAULT false,
    alergias_obs TEXT,
    status_internacao TEXT DEFAULT 'Em observação',
    status TEXT DEFAULT 'internado' CHECK (status IN ('internado', 'alta', 'obito', 'transferido')),
    classificacao_manchester TEXT CHECK (classificacao_manchester IN ('Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul')),
    leito_atual_id UUID REFERENCES public.leitos(id) ON DELETE SET NULL,
    ultima_alteracao_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    ultima_alteracao_em TIMESTAMPTZ DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABELA DE PASSAGENS DE PLANTÃO (POR LEITO / PACIENTE)
CREATE TABLE IF NOT EXISTS public.passagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plantao_id UUID NOT NULL REFERENCES public.plantoes(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    atendimento_id UUID, -- Chave de ligação com o PEP
    leito_id UUID REFERENCES public.leitos(id) ON DELETE SET NULL,
    enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    diagnostico TEXT,
    pendencias TEXT,
    cuidados TEXT,
    intercorrencias TEXT,
    exames_texto TEXT,
    exame_a_realizar_data DATE,
    exame_a_realizar_hora TIME,
    exame_a_realizar_local TEXT,
    alta_sala_vermelha BOOLEAN,
    alta_sala_vermelha_data DATE,
    alta_sala_vermelha_hora TIME,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. HISTÓRICO DE REALOCAÇÃO DE LEITOS
CREATE TABLE IF NOT EXISTS public.realocacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    atendimento_id UUID,
    leito_origem_id UUID REFERENCES public.leitos(id) ON DELETE SET NULL,
    leito_destino_id UUID NOT NULL REFERENCES public.leitos(id) ON DELETE CASCADE,
    enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    motivo TEXT,
    realocado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CONFIGURAÇÕES GLOBAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS public.configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDITORIA E TRILHA DE SEGURANÇA (LGPD / CFM / COFEN)
CREATE TABLE IF NOT EXISTS public.eventos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
