-- Atestado Médico — documento novo, sem tabela anterior. Campos mínimos
-- usados na prática da UPA: CID opcional, dias de afastamento, data de
-- início e texto livre (motivo/observação). Aditiva, sem impacto em dado existente.

CREATE TABLE IF NOT EXISTS public.atestados_medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
    criado_por UUID NOT NULL REFERENCES public.enfermeiros(id) ON DELETE RESTRICT,
    cid TEXT,
    dias_afastamento INTEGER,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    texto_livre TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atestados_atendimento ON public.atestados_medicos (atendimento_id);

ALTER TABLE public.atestados_medicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso permitido para usuarios autenticados" ON public.atestados_medicos;
CREATE POLICY "Acesso permitido para usuarios autenticados" ON public.atestados_medicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura permitida anon" ON public.atestados_medicos;
CREATE POLICY "Leitura permitida anon" ON public.atestados_medicos FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Gravacao permitida anon" ON public.atestados_medicos;
CREATE POLICY "Gravacao permitida anon" ON public.atestados_medicos FOR ALL TO anon USING (true) WITH CHECK (true);
