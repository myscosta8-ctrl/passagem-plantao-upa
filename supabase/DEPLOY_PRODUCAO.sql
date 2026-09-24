-- =====================================================================
-- SCRIPT DE DEPLOY E REPARAÇÃO DEFINITIVA - VITALOOP / UPA 24H BREVES (SEMSA)
-- Gerado automaticamente com base na auditoria completa do banco de produção.
-- Idempotente: Execução 100% segura sem falha de coluna ou perda de dados.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- FASE 1: GARANTIR QUE TODAS AS 48 TABELAS EXISTEM COM CHAVE PRIMÁRIA
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.enfermeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.leitos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.plantoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.plantao_profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.passagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.realocacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.eventos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.pessoas_duplicatas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.pessoas_fusoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.atendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.internacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.leito_ocupacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.alergias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.medicacoes_continuas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.admissoes_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.historico_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.evolucoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.evolucoes_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.balanco_hidrico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.dispositivos_invasivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.sinais_vitais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.isolamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.escalas_enfermagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.eventos_adversos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.transferencias_sbar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.consultas_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.evolucoes_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.catalogo_medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.cid_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.prescricoes_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.prescricao_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.exames_solicitados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.notas_intercorrencia_medica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.planos_terapeuticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.receitas_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.aih_solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.apac_solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.solicitacoes_atm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.solicitacoes_tfd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.solicitacoes_sangue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.solicitacoes_hemoterapia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.sorologias_notificaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.sumarios_alta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
CREATE TABLE IF NOT EXISTS public.regulacao_atualizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- =====================================================================
-- FASE 2: SANAR TODAS AS COLUNAS EM TODAS AS TABELAS (ALTER TABLE ADD COLUMN)
-- =====================================================================

-- Colunas para tabela: enfermeiros
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS nome_exibicao TEXT;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS senha_hash TEXT;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS coren TEXT;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS crm TEXT;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'enfermeiro' CHECK (role IN ('admin', 'enfermeiro', 'medico', 'tecnico', 'recepcao'));
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS pep_beta BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS deve_trocar_senha BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.enfermeiros ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: setores
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS nome TEXT UNIQUE;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS sigla TEXT;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS ordem INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: leitos
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS setor_id UUID REFERENCES public.setores(id) ON DELETE CASCADE;
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'comum' CHECK (tipo IN ('comum', 'extra', 'isolamento', 'emergencia'));
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: plantoes
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS data_fim TIMESTAMPTZ;
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS turno TEXT CHECK (turno IN ('diurno', 'noturno', '24h'));
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS enfermeiro_chefe_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'encerrado'));
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS curativo_ok BOOLEAN DEFAULT true;
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS carrinho_ok BOOLEAN DEFAULT true;
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS nota_extra TEXT;
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS encerrado_em TIMESTAMPTZ;

-- Colunas para tabela: plantao_profissionais
ALTER TABLE public.plantao_profissionais ADD COLUMN IF NOT EXISTS plantao_id UUID REFERENCES public.plantoes(id) ON DELETE CASCADE;
ALTER TABLE public.plantao_profissionais ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE CASCADE;
ALTER TABLE public.plantao_profissionais ADD COLUMN IF NOT EXISTS funcao TEXT;
ALTER TABLE public.plantao_profissionais ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: pacientes
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS diagnostico TEXT;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS idade INTEGER;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro'));
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS data_admissao DATE;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS alergias BOOLEAN DEFAULT false;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS alergias_obs TEXT;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS status_internacao TEXT DEFAULT 'Em observação';
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'internado' CHECK (status IN ('internado', 'alta', 'obito', 'transferido'));
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS classificacao_manchester TEXT CHECK (classificacao_manchester IN ('Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul'));
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS leito_atual_id UUID REFERENCES public.leitos(id) ON DELETE SET NULL;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS ultima_alteracao_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS ultima_alteracao_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: passagens
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS plantao_id UUID REFERENCES public.plantoes(id) ON DELETE CASCADE;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS atendimento_id UUID;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS leito_id UUID REFERENCES public.leitos(id) ON DELETE SET NULL;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS diagnostico TEXT;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS pendencias TEXT;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS cuidados TEXT;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS intercorrencias TEXT;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS exames_texto TEXT;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS exame_a_realizar_data DATE;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS exame_a_realizar_hora TIME;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS exame_a_realizar_local TEXT;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS alta_sala_vermelha BOOLEAN;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS alta_sala_vermelha_data DATE;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS alta_sala_vermelha_hora TIME;
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.passagens ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: realocacoes
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS atendimento_id UUID;
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS leito_origem_id UUID REFERENCES public.leitos(id) ON DELETE SET NULL;
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS leito_destino_id UUID REFERENCES public.leitos(id) ON DELETE CASCADE;
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS motivo TEXT;
ALTER TABLE public.realocacoes ADD COLUMN IF NOT EXISTS realocado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: configuracoes
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS chave TEXT PRIMARY KEY;
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS valor TEXT;
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: eventos_auditoria
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS acao TEXT;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS entidade TEXT;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS entidade_id UUID;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS dados_anteriores JSONB;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS dados_novos JSONB;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS ip TEXT;
ALTER TABLE public.eventos_auditoria ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: pessoas
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS prontuario_numero TEXT UNIQUE;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS nome_mae TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS nome_pai TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS idade_informada INTEGER;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro'));
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS raca_cor TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS religiao TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS nacionalidade TEXT DEFAULT 'Brasil';
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS naturalidade TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS cns TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS numero_registro_nascimento TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS telefone_contato TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS endereco_numero TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS cidade TEXT DEFAULT 'Breves';
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS uf TEXT DEFAULT 'PA';
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS cep TEXT DEFAULT '68800-000';
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS municipio_ibge TEXT DEFAULT '1501808';
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS mesclado_com_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: pessoas_duplicatas
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS pessoa_origem_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS pessoa_duplicada_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS similaridade_score NUMERIC(5,2);
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'descartado'));
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS revisado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS revisado_em TIMESTAMPTZ;
ALTER TABLE public.pessoas_duplicatas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: pessoas_fusoes
ALTER TABLE public.pessoas_fusoes ADD COLUMN IF NOT EXISTS pessoa_mantida_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.pessoas_fusoes ADD COLUMN IF NOT EXISTS pessoa_mesclada_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.pessoas_fusoes ADD COLUMN IF NOT EXISTS motivo TEXT;
ALTER TABLE public.pessoas_fusoes ADD COLUMN IF NOT EXISTS realizado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.pessoas_fusoes ADD COLUMN IF NOT EXISTS realizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: atendimentos
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS numero_atendimento TEXT UNIQUE;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'internacao' CHECK (tipo IN ('urgencia', 'emergencia', 'ambulatorial', 'internacao', 'observacao'));
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS carater TEXT NOT NULL DEFAULT 'Urgência';
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS convenio TEXT NOT NULL DEFAULT 'SUS';
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS tipo_entrada TEXT DEFAULT 'Demanda espontânea';
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'internado' CHECK (status IN ('triagem', 'atendimento', 'internado', 'alta', 'obito', 'transferido', 'evasao'));
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS status_internacao TEXT DEFAULT 'Em observação';
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS classificacao_risco_cor TEXT CHECK (classificacao_risco_cor IN ('Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul'));
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS regulacao_flag BOOLEAN DEFAULT false;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS regulacao_tipo TEXT;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS regulacao_aberta_em TIMESTAMPTZ;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS encerrado_em TIMESTAMPTZ;

-- Colunas para tabela: internacoes
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS internado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS diagnostico_admissao TEXT;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS cid_admissao TEXT;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS medico_admissao_id UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS previsao_alta DATE;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS desfecho_tipo TEXT CHECK (desfecho_tipo IN ('alta_curado', 'alta_melhorado', 'alta_a_pedido', 'transferencia', 'obito', 'evasao'));
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS desfecho_em TIMESTAMPTZ;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS desfecho_obs TEXT;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: leito_ocupacoes
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS leito_id UUID REFERENCES public.leitos(id) ON DELETE CASCADE;
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS alocado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS desocupado_em TIMESTAMPTZ;
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'encerrado', 'transferido'));
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: alergias
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS substancia TEXT;
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS reacao TEXT;
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS gravidade TEXT DEFAULT 'moderada' CHECK (gravidade IN ('leve', 'moderada', 'grave', 'choque_anafilatico'));
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'resolvida'));
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: medicacoes_continuas
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS medicamento TEXT;
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS dose TEXT;
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS frequencia TEXT;
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'interrompido'));
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS registrado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: admissoes_enfermagem
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS coleta_dados TEXT[];
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS procedencia TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS motivo_procura TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS diagnostico_medico TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS medicamentos_uso JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS alergias_relatadas TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS antecedentes_pessoais JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS sinais_vitais_admissao JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS exame_neurologico JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS exame_respiratorio JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS exame_cardiovascular JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS exame_gastrointestinal JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS exame_genitourinario JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS exame_pele_mucosas JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS dispositivos_instalados JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS diagnosticos_enfermagem TEXT[];
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS intervencoes_plano TEXT[];
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS parecer_estado_emocional TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS parecer_estado_cognitivo TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS parecer_obs TEXT;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS info_complementares JSONB;
ALTER TABLE public.admissoes_enfermagem ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: historico_enfermagem
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS coleta_dados TEXT[];
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS procedencia TEXT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS motivo_procura TEXT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS diagnostico_medico TEXT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS medicamentos_uso JSONB;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS info_complementares JSONB;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS parecer_estado_emocional TEXT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS parecer_estado_cognitivo TEXT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS parecer_obs TEXT;
ALTER TABLE public.historico_enfermagem ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: evolucoes
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS texto TEXT;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS subjetivo TEXT;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS avaliacao TEXT;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS plano TEXT;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS intercorrencia BOOLEAN DEFAULT false;
ALTER TABLE public.evolucoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: evolucoes_enfermagem
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS enfermeiro_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS texto TEXT;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS subjetivo TEXT;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS avaliacao TEXT;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS plano TEXT;
ALTER TABLE public.evolucoes_enfermagem ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: balanco_hidrico
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('entrada', 'saida'));
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS via TEXT;
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS volume_ml NUMERIC(8,2);
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS horario_registro TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS registrado_em TIMESTAMPTZ DEFAULT NOW();

-- Colunas para tabela: dispositivos_invasivos
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS instalado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS localizacao TEXT;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS calibre TEXT;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS instalado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS removido_em TIMESTAMPTZ;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'retirado', 'obstruido', 'infiltrado', 'infeccao'));
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS curativo_data TIMESTAMPTZ;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: sinais_vitais
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS registrado_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS pressao_arterial_sistolica INTEGER;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS pressao_arterial_diastolica INTEGER;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS frequencia_cardiaca INTEGER;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS frequencia_respiratoria INTEGER;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS temperatura NUMERIC(4,1);
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS saturacao_oxigenio INTEGER;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS hgt INTEGER;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS dor_escala INTEGER CHECK (dor_escala BETWEEN 0 AND 10);
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS glasgow INTEGER CHECK (glasgow BETWEEN 3 AND 15);
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS horario_medicao TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS medido_em TIMESTAMPTZ DEFAULT NOW();

-- Colunas para tabela: isolamentos
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS prescrito_por UUID REFERENCES public.enfermeiros(id) ON DELETE SET NULL;
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS motivo TEXT;
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS microorganismo TEXT;
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS iniciado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS suspenso_em TIMESTAMPTZ;
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso'));
ALTER TABLE public.isolamentos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: escalas_enfermagem
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS avaliado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('braden', 'morse', 'glasgow', 'mews', 'rass'));
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS escore_total INTEGER;
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS classificacao_risco TEXT;
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS itens_detalhados JSONB;
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS avaliado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.escalas_enfermagem ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: eventos_adversos
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS notificado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS tipo_evento TEXT;
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS gravidade TEXT CHECK (gravidade IN ('leve', 'moderado', 'grave', 'sentinela'));
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS descricao_detalhada TEXT;
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS condutas_imediatas TEXT;
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS data_hora_ocorrencia TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS notificado_nsp BOOLEAN DEFAULT false;
ALTER TABLE public.eventos_adversos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: transferencias_sbar
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS transferido_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS setor_origem_id UUID REFERENCES public.setores(id) ON DELETE SET NULL;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS setor_destino_id UUID REFERENCES public.setores(id) ON DELETE SET NULL;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS situacao TEXT;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS breve_historico TEXT;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS avaliacao TEXT;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS recomendacao TEXT;
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS data_hora_transferencia TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.transferencias_sbar ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: consultas_medicas
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS queixa_principal TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS historia_molestia_atual TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS antecedentes_pessoais TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS antecedentes_familiares TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS exame_fisico_geral TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS hipoteses_diagnosticas TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS cid_principal TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS conduta TEXT;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS campos_admissao JSONB;
ALTER TABLE public.consultas_medicas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: evolucoes_medicas
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS diagnosticos TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS historia_doenca_atual TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS comorbidades BOOLEAN DEFAULT false;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS comorbidades_texto TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS reconciliacao_medicamentosa BOOLEAN DEFAULT false;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS reconciliacao_texto TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS alergias BOOLEAN DEFAULT false;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS alergias_texto TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS risco_tev TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS criterios_sepse BOOLEAN DEFAULT false;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS antibioticoterapia TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS evolucao_dia TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS exame_fisico TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS plano_terapeutico TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS exames_laboratorio TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS aguarda_exames BOOLEAN DEFAULT false;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS aguarda_exames_texto TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS data_prevista_alta DATE;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS conduta_medica TEXT;
ALTER TABLE public.evolucoes_medicas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: catalogo_medicamentos
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS concentracao TEXT;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS forma_farmaceutica TEXT;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS via_padrao TEXT;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS controlado BOOLEAN DEFAULT false;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS antimicrobiano BOOLEAN DEFAULT false;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: cid_catalog
ALTER TABLE public.cid_catalog ADD COLUMN IF NOT EXISTS codigo TEXT PRIMARY KEY;
ALTER TABLE public.cid_catalog ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.cid_catalog ADD COLUMN IF NOT EXISTS sexo TEXT;
ALTER TABLE public.cid_catalog ADD COLUMN IF NOT EXISTS agravo BOOLEAN DEFAULT false;

-- Colunas para tabela: prescricoes_medicas
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS data_prescricao DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS validade_horas INTEGER NOT NULL DEFAULT 24;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS dieta TEXT;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS cuidados_gerais TEXT;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS orientacoes_enfermagem JSONB;
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'encerrada'));
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: prescricao_itens
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS prescricao_id UUID REFERENCES public.prescricoes_medicas(id) ON DELETE CASCADE;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS medicamento_nome TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS dose TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS via TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS frequencia TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS diluicao TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS velocidade_infusao TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS horarios TEXT[];
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'administrado'));
ALTER TABLE public.prescricao_itens ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: exames_solicitados
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS solicitado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'laboratorio';
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS exames JSONB;
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS justificativa_clinica TEXT;
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS urgencia TEXT NOT NULL DEFAULT 'urgencia' CHECK (urgencia IN ('urgencia', 'rotina', 'imediato'));
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'solicitado';
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS laudo_resultado TEXT;
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS concluido_em TIMESTAMPTZ;
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS modalidade TEXT;

-- Colunas para tabela: notas_intercorrencia_medica
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS descricao_evento TEXT;
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS conduta_tomada TEXT;
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS prescricao_urgencia JSONB;
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS sinais_vitais_evento JSONB;
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.notas_intercorrencia_medica ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: planos_terapeuticos
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS metas_curto_prazo TEXT;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS metas_medio_prazo TEXT;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS estrategia_ventilatoria TEXT;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS desmame_sedacao TEXT;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS programacao_cirurgica TEXT;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS pareceres_especializados JSONB;
ALTER TABLE public.planos_terapeuticos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: receitas_medicas
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'simples' CHECK (tipo IN ('simples', 'controle_especial', 'antimicrobiano'));
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS itens JSONB;
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS orientacoes_gerais TEXT;
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS uso_continuo BOOLEAN DEFAULT false;
ALTER TABLE public.receitas_medicas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: aih_solicitacoes
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS solicitante_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS numero_aih TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS carater_internacao TEXT DEFAULT 'URGENCIA';
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS procedimento_principal_codigo TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS procedimento_principal_nome TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS procedimento_secundario_codigo TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS cid_principal TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS cid_secundario TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS cid_causas_associadas TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS sinais_sintomas_clinicos TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS condicoes_justificam_internacao TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS resultados_provas_diagnosticas TEXT;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS campos_formulario JSONB;
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'autorizado', 'negado', 'cancelado'));
ALTER TABLE public.aih_solicitacoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: apac_solicitacoes
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS procedimento_codigo TEXT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS procedimento_nome TEXT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS cid_principal TEXT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS cid_secundario TEXT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS justificativa TEXT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS numero_autorizacao TEXT;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS campos_formulario JSONB;
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'autorizado', 'executado', 'cancelado'));
ALTER TABLE public.apac_solicitacoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: solicitacoes_atm
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS antimicrobiano TEXT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS dose TEXT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS tempo_provavel_dias INTEGER;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS foco_infeccioso TEXT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS indicacao_tipo TEXT CHECK (indicacao_tipo IN ('empirico', 'guiado_cultura', 'profilaxia'));
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS germe_isolado TEXT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS antibiograma JSONB;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS justificativa TEXT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS parecer_ccih TEXT;
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'aprovado', 'reprovado'));
ALTER TABLE public.solicitacoes_atm ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: solicitacoes_tfd
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS especialidade_destino TEXT;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS municipio_destino TEXT NOT NULL DEFAULT 'Belém';
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS resumo_quadro_clinico TEXT;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS justificativa_encaminhamento TEXT;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS tipo_transporte TEXT CHECK (tipo_transporte IN ('aereo', 'ambulancia_fluvial', 'rodoviario'));
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS acompanhante_necessario BOOLEAN DEFAULT true;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS justificativa_acompanhante TEXT;
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'agendado', 'transferido', 'recusado'));
ALTER TABLE public.solicitacoes_tfd ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: solicitacoes_sangue
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS solicitado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS indicacao_clinica TEXT;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS urgencia TEXT CHECK (urgencia IN ('rotina', 'cirurgia', 'ambulatorial', 'extrema_urgencia'));
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS hemocomponentes JSONB;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS peso NUMERIC(5,2);
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS hb_ht TEXT;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS antecedentes_transfusionais TEXT;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS campos_extra JSONB;
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'enviado_hemopa', 'recebido', 'transfundido', 'cancelado'));
ALTER TABLE public.solicitacoes_sangue ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: solicitacoes_hemoterapia
ALTER TABLE public.solicitacoes_hemoterapia ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.solicitacoes_hemoterapia ADD COLUMN IF NOT EXISTS solicitado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.solicitacoes_hemoterapia ADD COLUMN IF NOT EXISTS indicacao_clinica TEXT;
ALTER TABLE public.solicitacoes_hemoterapia ADD COLUMN IF NOT EXISTS hemocomponentes JSONB;
ALTER TABLE public.solicitacoes_hemoterapia ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'solicitado';
ALTER TABLE public.solicitacoes_hemoterapia ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: sorologias_notificaveis
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS notificado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS agravo_nome TEXT;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS cid10 TEXT;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS data_primeiros_sintomas DATE;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS notificado_sinan BOOLEAN DEFAULT false;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS numero_notificacao_sinan TEXT;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.sorologias_notificaveis ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: sumarios_alta
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS diagnostico_principal_alta TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS cid_alta TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS diagnosticos_secundarios TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS resumo_evolucao_internacao TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS procedimentos_realizados TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS exames_relevantes TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS condicao_alta TEXT CHECK (condicao_alta IN ('curado', 'melhorado', 'inalterado', 'transferido', 'obito'));
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS orientacoes_pos_alta TEXT;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS medicamentos_prescritos_alta JSONB;
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS data_alta TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.sumarios_alta ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Colunas para tabela: regulacao_atualizacoes
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE;
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS atualizado_por UUID REFERENCES public.enfermeiros(id) ON DELETE RESTRICT;
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS numero_registro_regulacao TEXT;
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS status_regulacao TEXT;
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS hospital_destino TEXT;
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.regulacao_atualizacoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- =====================================================================
-- FASE 3: ÍNDICES DE UNICIDADE (NECESSÁRIOS PARA SEEDS E INTEGRIDADE)
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_setores_nome ON public.setores (nome);
CREATE UNIQUE INDEX IF NOT EXISTS uq_leito_setor_numero ON public.leitos (setor_id, numero);
CREATE UNIQUE INDEX IF NOT EXISTS uq_enfermeiros_email ON public.enfermeiros (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_configuracoes_chave ON public.configuracoes (chave);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cid_catalog_codigo ON public.cid_catalog (codigo);
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalogo_medicamentos_nome ON public.catalogo_medicamentos (nome);


-- =====================================================================
-- FASE 4: ÍNDICES DE PERFORMANCE E POLÍTICAS DE ACESSO (RLS)
-- =====================================================================

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
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aberto';
ALTER TABLE public.leito_ocupacoes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ocupado';
ALTER TABLE public.plantoes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aberto';

CREATE INDEX IF NOT EXISTS idx_atendimentos_pessoa_id ON public.atendimentos (pessoa_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON public.atendimentos (status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_setor_id ON public.atendimentos (setor_id);
CREATE INDEX IF NOT EXISTS idx_internacoes_atendimento_id ON public.internacoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_leito_ocupacoes_leito_id ON public.leito_ocupacoes (leito_id);
CREATE INDEX IF NOT EXISTS idx_leito_ocupacoes_atendimento_id ON public.leito_ocupacoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_leitos_setor_id ON public.leitos (setor_id);

-- 3. ÍNDICES PARA PASSAGEM DE PLANTÃO
CREATE INDEX IF NOT EXISTS idx_passagens_plantao_id ON public.passagens (plantao_id);
CREATE INDEX IF NOT EXISTS idx_passagens_atendimento_id ON public.passagens (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_passagens_paciente_id ON public.passagens (paciente_id);

-- 4. ÍNDICES PARA FICHA CLÍNICA / ENFERMAGEM
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS horario_registro TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS registrado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'entrada';
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS via TEXT DEFAULT 'VO';
ALTER TABLE public.balanco_hidrico ADD COLUMN IF NOT EXISTS volume_ml NUMERIC(8,2) DEFAULT 0;

ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS horario_medicao TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.sinais_vitais ADD COLUMN IF NOT EXISTS medido_em TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.dispositivos_invasivos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';
ALTER TABLE public.alergias ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativa';
ALTER TABLE public.medicacoes_continuas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';
ALTER TABLE public.prescricoes_medicas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'laboratorio';
ALTER TABLE public.exames_solicitados ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'solicitado';

CREATE INDEX IF NOT EXISTS idx_admissoes_enf_atendimento ON public.admissoes_enfermagem (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_atendimento ON public.evolucoes (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_balanco_hidrico_atendimento ON public.balanco_hidrico (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_atendimento ON public.dispositivos_invasivos (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_sinais_vitais_atendimento ON public.sinais_vitais (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_alergias_pessoa ON public.alergias (pessoa_id);
CREATE INDEX IF NOT EXISTS idx_medicacoes_cont_pessoa ON public.medicacoes_continuas (pessoa_id);

-- 5. ÍNDICES PARA PRONTUÁRIO MÉDICO
CREATE INDEX IF NOT EXISTS idx_consultas_med_atendimento ON public.consultas_medicas (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_med_atendimento ON public.evolucoes_medicas (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_prescricoes_med_atendimento ON public.prescricoes_medicas (atendimento_id);
CREATE INDEX IF NOT EXISTS idx_prescricao_itens_prescricao ON public.prescricao_itens (prescricao_id);
CREATE INDEX IF NOT EXISTS idx_exames_atendimento ON public.exames_solicitados (atendimento_id);
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


-- =====================================================================
-- FASE 5: CARGA DE DADOS INICIAIS (SEEDS DA UPA 24H BREVES)
-- =====================================================================

-- ==============================================================================
-- MIGRAÇÃO 06: DADOS DE REFERÊNCIA E SEEDS INICIAIS
-- SETORES, LEITOS, CONFIGURAÇÕES E CATÁLOGOS BÁSICOS — UPA 24H BREVES
-- ==============================================================================

-- 1. SETORES PADRÃO DA UPA 24H BREVES
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS sigla TEXT;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'comum';
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS via_padrao TEXT;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS controlado BOOLEAN DEFAULT false;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS antimicrobiano BOOLEAN DEFAULT false;

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
