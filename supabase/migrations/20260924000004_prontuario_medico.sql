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
