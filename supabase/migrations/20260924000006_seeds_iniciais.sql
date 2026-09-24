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
