-- =====================================================================
-- SCRIPT DE MIGRAÇÃO CONSOLIDADO - VITALOOP / UPA 24H BREVES (SEMSA)
-- Execução segura com CREATE TABLE IF NOT EXISTS e ADD COLUMN IF NOT EXISTS
-- =====================================================================

-------------------------------------------------------------------------
-- MIGRAÇÃO: 20260924000001_base_schema.sql
-------------------------------------------------------------------------
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


-------------------------------------------------------------------------
-- MIGRAÇÃO: 20260924000002_pep_core.sql
-------------------------------------------------------------------------
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


-------------------------------------------------------------------------
-- MIGRAÇÃO: 20260924000003_prontuario_enfermagem.sql
-------------------------------------------------------------------------
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


-------------------------------------------------------------------------
-- MIGRAÇÃO: 20260924000004_prontuario_medico.sql
-------------------------------------------------------------------------
-- ==============================================================================
-- MIGRAÇÃO 04: PRONTUÁRIO MÉDICO E FORMULÁRIOS OFICIAIS SUS
-- ADMISSÃO MÉDICA, EVOLUÇÃO, PRESCRIÇÃO, EXAMES, AIH, APAC, SANGUE E ALTA
-- ==============================================================================

-- 1. CONSULTA E ADMISSÃO MÉDICA (ANAMNESE E EXAME CLÍNICO INICIAL)
CREATE TABLE IF NOT EXISTS public.consultas_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    queixa_principal TEXT NOT NULL,
    historia_molestia_atual TEXT NOT NULL,
    antecedentes_pessoais TEXT,
    antecedentes_familiares TEXT,
    exame_fisico_geral TEXT,
    hipoteses_diagnosticas TEXT,
    cid_principal TEXT,
    conduta TEXT NOT NULL,
    campos_admissao JSONB, -- 17 seções completas em formato estruturado
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EVOLUÇÃO MÉDICA DIÁRIA
CREATE TABLE IF NOT EXISTS public.evolucoes_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    diagnosticos TEXT,
    historia_doenca_atual TEXT,
    comorbidades BOOLEAN DEFAULT false,
    comorbidades_texto TEXT,
    reconciliacao_medicamentosa BOOLEAN DEFAULT false,
    reconciliacao_texto TEXT,
    alergias BOOLEAN DEFAULT false,
    alergias_texto TEXT,
    risco_tev TEXT,
    criterios_sepse BOOLEAN DEFAULT false,
    antibioticoterapia TEXT,
    evolucao_dia TEXT NOT NULL,
    exame_fisico TEXT,
    plano_terapeutico TEXT,
    exames_laboratorio TEXT,
    aguarda_exames BOOLEAN DEFAULT false,
    aguarda_exames_texto TEXT,
    data_prevista_alta DATE,
    conduta_medica TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATÁLOGO DE MEDICAMENTOS (REMUME / FARMÁCIA HOSPITALAR DA UPA)
CREATE TABLE IF NOT EXISTS public.catalogo_medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    concentracao TEXT,
    forma_farmaceutica TEXT, -- 'Comprimido', 'Ampola', 'Frasco', 'Gota'
    via_padrao TEXT, -- 'VO', 'EV', 'IM', 'SC'
    controlado BOOLEAN DEFAULT false,
    antimicrobiano BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATÁLOGO CID-10 OFICIAL DO SUS
CREATE TABLE IF NOT EXISTS public.cid_catalog (
    codigo TEXT PRIMARY KEY,
    descricao TEXT NOT NULL,
    sexo TEXT,
    agravo BOOLEAN DEFAULT false
);

-- 5. PRESCRIÇÃO MÉDICA ELETRÔNICA DIÁRIA
CREATE TABLE IF NOT EXISTS public.prescricoes_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    data_prescricao DATE NOT NULL DEFAULT CURRENT_DATE,
    validade_horas INTEGER NOT NULL DEFAULT 24,
    dieta TEXT,
    cuidados_gerais TEXT,
    orientacoes_enfermagem JSONB,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'encerrada')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ITENS INDIVIDUAIS DA PRESCRIÇÃO MÉDICA
CREATE TABLE IF NOT EXISTS public.prescricao_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescricao_id UUID NOT NULL REFERENCES public.prescricoes_medicas(id) ON DELETE CASCADE,
    medicamento_nome TEXT NOT NULL,
    dose TEXT NOT NULL,
    via TEXT NOT NULL, -- 'VO', 'EV', 'IM', 'SC', 'SL', 'INAL', 'TOP'
    frequencia TEXT NOT NULL, -- 'a cada 6h', '1x ao dia', 'se dor ou febre', 'agora'
    diluicao TEXT,
    velocidade_infusao TEXT,
    horarios TEXT[],
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'administrado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. REQUISIÇÕES DE EXAMES (LABORATÓRIO, RADIOLOGIA RX, ECG)
CREATE TABLE IF NOT EXISTS public.exames_solicitados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    solicitado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    tipo TEXT NOT NULL CHECK (tipo IN ('laboratorio', 'imagem', 'ecg', 'outro')),
    exames JSONB NOT NULL, -- Lista com código e nome dos exames selecionados
    justificativa_clinica TEXT NOT NULL,
    urgencia TEXT NOT NULL DEFAULT 'urgencia' CHECK (urgencia IN ('urgencia', 'rotina', 'imediato')),
    status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'coletado', 'em_analise', 'concluido', 'cancelado')),
    laudo_resultado TEXT,
    concluido_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NOTAS DE INTERCORRÊNCIA MÉDICA
CREATE TABLE IF NOT EXISTS public.notas_intercorrencia_medica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    descricao_evento TEXT NOT NULL,
    conduta_tomada TEXT NOT NULL,
    prescricao_urgencia JSONB,
    sinais_vitais_evento JSONB,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PLANOS TERAPÊUTICOS E METAS CLÍNICAS MULTIPROFISSIONAIS
CREATE TABLE IF NOT EXISTS public.planos_terapeuticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    responsavel_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    metas_curto_prazo TEXT NOT NULL,
    metas_medio_prazo TEXT,
    estrategia_ventilatoria TEXT,
    desmame_sedacao TEXT,
    programacao_cirurgica TEXT,
    pareceres_especializados JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. RECEITUÁRIO MÉDICO AMBULATORIAL / ALTA (2 VIAS)
CREATE TABLE IF NOT EXISTS public.receitas_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    criado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    tipo TEXT NOT NULL DEFAULT 'simples' CHECK (tipo IN ('simples', 'controle_especial', 'antimicrobiano')),
    itens JSONB NOT NULL, -- Medicamento, dose, via, quantidade, orientações
    orientacoes_gerais TEXT,
    uso_continuo BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. LAUDO OFICIAL DE AIH (AUTORIZAÇÃO DE INTERNAÇÃO HOSPITALAR - ANEXO I SUS)
CREATE TABLE IF NOT EXISTS public.aih_solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    solicitante_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    numero_aih TEXT,
    carater_internacao TEXT DEFAULT 'URGENCIA',
    procedimento_principal_codigo TEXT,
    procedimento_principal_nome TEXT,
    procedimento_secundario_codigo TEXT,
    cid_principal TEXT,
    cid_secundario TEXT,
    cid_causas_associadas TEXT,
    sinais_sintomas_clinicos TEXT,
    condicoes_justificam_internacao TEXT,
    resultados_provas_diagnosticas TEXT,
    campos_formulario JSONB, -- Todos os 52 campos burocráticos do Anexo I
    status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'autorizado', 'negado', 'cancelado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. LAUDO OFICIAL DE APAC (AUTORIZAÇÃO DE PROCEDIMENTO AMBULATORIAL - 52 CAMPOS)
CREATE TABLE IF NOT EXISTS public.apac_solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    procedimento_codigo TEXT NOT NULL,
    procedimento_nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    cid_principal TEXT NOT NULL,
    cid_secundario TEXT,
    justificativa TEXT NOT NULL,
    numero_autorizacao TEXT,
    campos_formulario JSONB, -- 52 campos correspondentes ao Modelo 18 oficial
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'autorizado', 'executado', 'cancelado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. JUSTIFICATIVA DE ANTIMICROBIANOS RESTRITOS (FORMULÁRIO ATM / CCIH)
CREATE TABLE IF NOT EXISTS public.solicitacoes_atm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    antimicrobiano TEXT NOT NULL,
    dose TEXT NOT NULL,
    tempo_provavel_dias INTEGER NOT NULL,
    foco_infeccioso TEXT NOT NULL,
    indicacao_tipo TEXT NOT NULL CHECK (indicacao_tipo IN ('empirico', 'guiado_cultura', 'profilaxia')),
    germe_isolado TEXT,
    antibiograma JSONB,
    justificativa TEXT NOT NULL,
    parecer_ccih TEXT,
    status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'aprovado', 'reprovado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TRATAMENTO FORA DE DOMICÍLIO (TFD - TRANSPORTE FLUVIAL / AÉREO DE URGÊNCIA)
CREATE TABLE IF NOT EXISTS public.solicitacoes_tfd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    especialidade_destino TEXT NOT NULL,
    municipio_destino TEXT NOT NULL DEFAULT 'Belém',
    resumo_quadro_clinico TEXT NOT NULL,
    justificativa_encaminhamento TEXT NOT NULL,
    tipo_transporte TEXT NOT NULL CHECK (tipo_transporte IN ('aereo', 'ambulancia_fluvial', 'rodoviario')),
    acompanhante_necessario BOOLEAN DEFAULT true,
    justificativa_acompanhante TEXT,
    status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'agendado', 'transferido', 'recusado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. REQUISIÇÃO DE SANGUE E HEMOCOMPONENTES (FUNDAÇÃO HEMOPA)
CREATE TABLE IF NOT EXISTS public.solicitacoes_sangue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    solicitado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    indicacao_clinica TEXT NOT NULL,
    urgencia TEXT NOT NULL CHECK (urgencia IN ('rotina', 'cirurgia', 'ambulatorial', 'extrema_urgencia')),
    hemocomponentes JSONB NOT NULL, -- Concentrado de Hemácias, PFC, Plaquetas, Crio
    peso NUMERIC(5,2),
    hb_ht TEXT,
    antecedentes_transfusionais TEXT,
    campos_extra JSONB,
    status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'enviado_hemopa', 'recebido', 'transfundido', 'cancelado')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.solicitacoes_hemoterapia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    solicitado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    indicacao_clinica TEXT NOT NULL,
    hemocomponentes JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'solicitado',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. DOENÇAS DE NOTIFICAÇÃO COMPULSÓRIA / VIGILÂNCIA EPIDEMIOLÓGICA (SINAN)
CREATE TABLE IF NOT EXISTS public.sorologias_notificaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    notificado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    agravo_nome TEXT NOT NULL,
    cid10 TEXT NOT NULL,
    data_primeiros_sintomas DATE,
    notificado_sinan BOOLEAN DEFAULT false,
    numero_notificacao_sinan TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. SUMÁRIO DE ALTA E FECHAMENTO CLÍNICO DO EPISÓDIO
CREATE TABLE IF NOT EXISTS public.sumarios_alta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    medico_id UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    diagnostico_principal_alta TEXT NOT NULL,
    cid_alta TEXT NOT NULL,
    diagnosticos_secundarios TEXT,
    resumo_evolucao_internacao TEXT NOT NULL,
    procedimentos_realizados TEXT,
    exames_relevantes TEXT,
    condicao_alta TEXT NOT NULL CHECK (condicao_alta IN ('curado', 'melhorado', 'inalterado', 'transferido', 'obito')),
    orientacoes_pos_alta TEXT NOT NULL,
    medicamentos_prescritos_alta JSONB,
    data_alta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ATUALIZAÇÕES DE REGULAÇÃO ESTADUAL (SER / SISREG)
CREATE TABLE IF NOT EXISTS public.regulacao_atualizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    atualizado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    numero_registro_regulacao TEXT,
    status_regulacao TEXT NOT NULL, -- 'Aguardando Vaga', 'Vaga Cedida', 'Recusada', 'Cancelada'
    hospital_destino TEXT,
    observacoes TEXT NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-------------------------------------------------------------------------
-- MIGRAÇÃO: 20260924000005_seguranca_rls_indices.sql
-------------------------------------------------------------------------
-- ==============================================================================
-- MIGRAÇÃO 05: SEGURANÇA (RLS), ÍNDICES DE PERFORMANCE E TRIGGERS
-- POLÍTICAS DE ACESSO, OTIMIZAÇÃO DE BUSCA E ÍNDICES HOSPITALARES
-- ==============================================================================

-- 1. ÍNDICES DE ALTA PERFORMANCE PARA RECEPÇÃO E BUSCAS DE PACIENTES
CREATE INDEX IF NOT EXISTS idx_pessoas_nome ON public.pessoas USING btree (nome);
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON public.pessoas USING btree (cpf);
CREATE INDEX IF NOT EXISTS idx_pessoas_cns ON public.pessoas USING btree (cns);
CREATE INDEX IF NOT EXISTS idx_pessoas_prontuario ON public.pessoas USING btree (prontuario_numero);

-- 2. ÍNDICES PARA CONTROLE DE ATENDIMENTOS E OCUPAÇÃO DE LEITOS EM TEMPO REAL
CREATE INDEX IF NOT EXISTS idx_atendimentos_pessoa_id ON public.atendimentos (pessoa_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON public.atendimentos (status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_setor_id ON public.atendimentos (setor_id);
CREATE INDEX IF NOT EXISTS idx_internacoes_atendimento_id ON public.internacoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_leito_ocupacoes_leito_status ON public.leito_ocupacoes (leito_id, status);
CREATE INDEX IF NOT EXISTS idx_leito_ocupacoes_atendimento_status ON public.leito_ocupacoes (atendimento_id, status);
CREATE INDEX IF NOT EXISTS idx_leitos_setor_id ON public.leitos (setor_id);

-- 3. ÍNDICES PARA PASSAGEM DE PLANTÃO
CREATE INDEX IF NOT EXISTS idx_passagens_plantao_id ON public.passagens (plantao_id);
CREATE INDEX IF NOT EXISTS idx_passagens_atendimento_id ON public.passagens (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_passagens_paciente_id ON public.passagens (paciente_id);
CREATE INDEX IF NOT EXISTS idx_plantoes_status ON public.plantoes (status);

-- 4. ÍNDICES PARA FICHA CLÍNICA / ENFERMAGEM
CREATE INDEX IF NOT EXISTS idx_admissoes_enf_atendimento ON public.admissoes_enfermagem (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_atendimento ON public.evolucoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_atendimento ON public.balanco_hidrico (atendimento_id, horario_registro);
CREATE INDEX IF NOT EXISTS idx_dispositivos_atendimento_status ON public.dispositivos_invasivos (atendimento_id, status);
CREATE INDEX IF NOT EXISTS idx_sinais_vitais_atendimento ON public.sinais_vitais (atendimento_id, horario_medicao);
CREATE INDEX IF NOT EXISTS idx_alergias_pessoa_status ON public.alergias (pessoa_id, status);
CREATE INDEX IF NOT EXISTS idx_medicacoes_cont_pessoa_status ON public.medicacoes_continuas (pessoa_id, status);

-- 5. ÍNDICES PARA PRONTUÁRIO MÉDICO
CREATE INDEX IF NOT EXISTS idx_consultas_med_atendimento ON public.consultas_medicas (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_med_atendimento ON public.evolucoes_medicas (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_prescricoes_med_atendimento ON public.prescricoes_medicas (atendimento_id, status);
CREATE INDEX IF NOT EXISTS idx_prescricao_itens_prescricao ON public.prescricao_itens (prescricao_id);
CREATE INDEX IF NOT EXISTS idx_exames_atendimento ON public.exames_solicitados (atendimento_id, tipo);
CREATE INDEX IF NOT EXISTS idx_aih_atendimento ON public.aih_solicitacoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_apac_atendimento ON public.apac_solicitacoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_receitas_atendimento ON public.receitas_medicas (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_sumarios_alta_atendimento ON public.sumarios_alta (atendimento_id);

-- 6. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE public.enfermeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantao_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realocacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_auditoria ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas_duplicatas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas_fusoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leito_ocupacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alergias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicacoes_continuas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admissoes_enfermagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_enfermagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes_enfermagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balanco_hidrico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispositivos_invasivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinais_vitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isolamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_enfermagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_adversos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias_sbar ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.consultas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cid_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricao_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames_solicitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_intercorrencia_medica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_terapeuticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aih_solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apac_solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_atm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_tfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_sangue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_hemoterapia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorologias_notificaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sumarios_alta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulacao_atualizacoes ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE ACESSO GERAIS (LEITURA E ESCRITA PARA PROFISSIONAIS AUTENTICADOS)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Acesso permitido para usuarios autenticados" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Acesso permitido para usuarios autenticados" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
        
        -- Permitir também anon para login e leitura do catálogo (conforme setup híbrido do Supabase)
        EXECUTE format('DROP POLICY IF EXISTS "Leitura permitida anon" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Leitura permitida anon" ON public.%I FOR SELECT TO anon USING (true)', tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Gravacao permitida anon" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Gravacao permitida anon" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;


-------------------------------------------------------------------------
-- MIGRAÇÃO: 20260924000006_seeds_iniciais.sql
-------------------------------------------------------------------------
-- ==============================================================================
-- MIGRAÇÃO 06: DADOS DE REFERÊNCIA E SEEDS INICIAIS
-- SETORES, LEITOS, CONFIGURAÇÕES E CATÁLOGOS BÁSICOS — UPA 24H BREVES
-- ==============================================================================

-- 1. SETORES PADRÃO DA UPA 24H BREVES
INSERT INTO public.setores (id, nome, sigla, ordem, ativo) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Sala Vermelha (Emergência)', 'SV', 1, true),
    ('11111111-1111-1111-1111-111111111102', 'Internação', 'INT', 2, true),
    ('11111111-1111-1111-1111-111111111103', 'Observação Masculina', 'OBS-M', 3, true),
    ('11111111-1111-1111-1111-111111111104', 'Observação Feminina', 'OBS-F', 4, true),
    ('11111111-1111-1111-1111-111111111105', 'Observação Pediátrica', 'OBS-P', 5, true),
    ('11111111-1111-1111-1111-111111111106', 'Isolamento', 'ISO', 6, true)
ON CONFLICT (nome) DO UPDATE SET ativo = EXCLUDED.ativo;

-- 2. LEITOS OFICIAIS DA UPA
-- Sala Vermelha (Leitos 1 a 3)
INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
    ('11111111-1111-1111-1111-111111111101', '01', 'emergencia', true),
    ('11111111-1111-1111-1111-111111111101', '02', 'emergencia', true),
    ('11111111-1111-1111-1111-111111111101', '03', 'emergencia', true)
ON CONFLICT (setor_id, numero) DO NOTHING;

-- Internação (Leitos 01 a 10)
INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
    ('11111111-1111-1111-1111-111111111102', '01', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '02', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '03', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '04', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '05', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '06', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '07', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '08', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '09', 'comum', true),
    ('11111111-1111-1111-1111-111111111102', '10', 'comum', true)
ON CONFLICT (setor_id, numero) DO NOTHING;

-- Observação Masculina (Leitos 01 a 06)
INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
    ('11111111-1111-1111-1111-111111111103', '01', 'comum', true),
    ('11111111-1111-1111-1111-111111111103', '02', 'comum', true),
    ('11111111-1111-1111-1111-111111111103', '03', 'comum', true),
    ('11111111-1111-1111-1111-111111111103', '04', 'comum', true),
    ('11111111-1111-1111-1111-111111111103', '05', 'comum', true),
    ('11111111-1111-1111-1111-111111111103', '06', 'comum', true)
ON CONFLICT (setor_id, numero) DO NOTHING;

-- Observação Feminina (Leitos 01 a 06)
INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
    ('11111111-1111-1111-1111-111111111104', '01', 'comum', true),
    ('11111111-1111-1111-1111-111111111104', '02', 'comum', true),
    ('11111111-1111-1111-1111-111111111104', '03', 'comum', true),
    ('11111111-1111-1111-1111-111111111104', '04', 'comum', true),
    ('11111111-1111-1111-1111-111111111104', '05', 'comum', true),
    ('11111111-1111-1111-1111-111111111104', '06', 'comum', true)
ON CONFLICT (setor_id, numero) DO NOTHING;

-- Observação Pediátrica (Leitos 01 a 04)
INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
    ('11111111-1111-1111-1111-111111111105', '01', 'comum', true),
    ('11111111-1111-1111-1111-111111111105', '02', 'comum', true),
    ('11111111-1111-1111-1111-111111111105', '03', 'comum', true),
    ('11111111-1111-1111-1111-111111111105', '04', 'comum', true)
ON CONFLICT (setor_id, numero) DO NOTHING;

-- Isolamento (Leitos 01 e 02)
INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
    ('11111111-1111-1111-1111-111111111106', '01', 'isolamento', true),
    ('11111111-1111-1111-1111-111111111106', '02', 'isolamento', true)
ON CONFLICT (setor_id, numero) DO NOTHING;

-- 3. CONFIGURAÇÕES INSTITUCIONAIS DA UPA 24H BREVES
INSERT INTO public.configuracoes (chave, valor, descricao) VALUES
    ('pep_ativo', 'true', 'Ativação do Prontuário Eletrônico do Paciente'),
    ('hospital_nome', 'PREFEITURA MUNICIPAL DE BREVES — UPA 24H BREVES', 'Razão social e nome da unidade'),
    ('hospital_secretaria', 'SECRETARIA MUNICIPAL DE SAÚDE (SEMSA)', 'Secretaria de vínculo'),
    ('hospital_cnes', '0296796', 'Código Nacional de Estabelecimento de Saúde'),
    ('hospital_cnpj', '02.967.963/0001-11', 'CNPJ da unidade'),
    ('hospital_endereco', 'Travessa Castilhos França, s/n — Breves/PA — CEP: 68.800-000', 'Endereço físico'),
    ('hospital_telefone', '(91) 3783-1279', 'Telefone de urgência'),
    ('hospital_ibge', '1501808', 'Código IBGE de Breves/PA')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- 4. CIDS-10 FREQUENTES EM URGÊNCIA/EMERGÊNCIA
INSERT INTO public.cid_catalog (codigo, descricao, agravo) VALUES
    ('A09', 'Diarreia e gastroenterite de origem infecciosa presumível', false),
    ('B50', 'Malária por Plasmodium falciparum', true),
    ('B51', 'Malária por Plasmodium vivax', true),
    ('I10', 'Hipertensão essencial (primária)', false),
    ('I21.9', 'Infarto agudo do miocárdio não especificado', true),
    ('I50.0', 'Insuficiência cardíaca congestiva', false),
    ('J18.9', 'Pneumonia não especificada', false),
    ('J44.1', 'Doença pulmonar obstrutiva crônica com exacerbação aguda', false),
    ('J45.9', 'Asma não especificada', false),
    ('K35.8', 'Apendicite aguda, outras e as não especificadas', true),
    ('N39.0', 'Infecção do trato urinário de localização não especificada', false),
    ('R10.4', 'Outras dores abdominais e as não especificadas', false),
    ('R50.9', 'Febre não especificada', false),
    ('R55', 'Síncope e colapso', false),
    ('S06.9', 'Traumatismo intracraniano, não especificado', true),
    ('T63.0', 'Efeito tóxico do veneno de serpente (acidente ofídico)', true)
ON CONFLICT (codigo) DO NOTHING;

-- 5. CATÁLOGO INICIAL DE MEDICAMENTOS (FARMÁCIA HOSPITALAR UPA)
INSERT INTO public.catalogo_medicamentos (nome, concentracao, forma_farmaceutica, via_padrao, controlado, antimicrobiano) VALUES
    ('Dipirona Sódica', '500 mg/mL', 'Ampola 2mL', 'EV', false, false),
    ('Ondansetrona', '2 mg/mL', 'Ampola 4mL', 'EV', false, false),
    ('Metoclopramida', '5 mg/mL', 'Ampola 2mL', 'EV', false, false),
    ('Ceftriaxona', '1 g', 'Frasco-ampola', 'EV', false, true),
    ('Oxacilina', '500 mg', 'Frasco-ampola', 'EV', false, true),
    ('Cloreto de Sódio 0,9%', '500 mL', 'Frasco SF 0,9%', 'EV', false, false),
    ('Ringer Lactato', '500 mL', 'Frasco', 'EV', false, false),
    ('Glicose 50%', '50%', 'Ampola 10mL', 'EV', false, false),
    ('Morfina', '10 mg/mL', 'Ampola 1mL', 'EV', true, false),
    ('Diazepam', '5 mg/mL', 'Ampola 2mL', 'EV', true, false),
    ('Salbutamol spray', '100 mcg/dose', 'Frasco 200 doses', 'INAL', false, false),
    ('Brometo de Ipratrópio', '0,25 mg/mL', 'Frasco gotas', 'INAL', false, false),
    ('Hidrocortisona', '500 mg', 'Frasco-ampola', 'EV', false, false),
    ('Furosemida', '10 mg/mL', 'Ampola 2mL', 'EV', false, false),
    ('Insulina Regular', '100 UI/mL', 'Frasco 10mL', 'SC', false, false)
ON CONFLICT DO NOTHING;


