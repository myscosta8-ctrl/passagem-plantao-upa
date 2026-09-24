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
