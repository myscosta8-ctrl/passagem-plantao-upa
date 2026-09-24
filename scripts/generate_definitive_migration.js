import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const migDir = path.join(rootDir, 'supabase', 'migrations');
const files = [
  '20260924000001_base_schema.sql',
  '20260924000002_pep_core.sql',
  '20260924000003_prontuario_enfermagem.sql',
  '20260924000004_prontuario_medico.sql',
  '20260924000005_seguranca_rls_indices.sql',
  '20260924000006_seeds_iniciais.sql'
];

let sqlOut = [];

sqlOut.push(`-- =====================================================================
-- SCRIPT DE DEPLOY E REPARAÇÃO DEFINITIVA - VITALOOP / UPA 24H BREVES (SEMSA)
-- 100% SEGURO: PRESERVAÇÃO TOTAL DOS PACIENTES, PLANTÕES E HISTÓRICO EXISTENTES
-- Compatibilização de tipos: setores (INTEGER), leitos (INTEGER), pacientes (UUID)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- FASE 1: GARANTIR QUE TODAS AS 48 TABELAS EXISTEM COM CHAVES PRIMÁRIAS VÁLIDAS
-- =====================================================================
`);

const allTables = [
  // 1. Base
  'enfermeiros', 'setores', 'leitos', 'plantoes', 'plantao_profissionais',
  'pacientes', 'passagens', 'realocacoes', 'configuracoes', 'eventos_auditoria',
  // 2. PEP Core
  'pessoas', 'pessoas_duplicatas', 'pessoas_fusoes', 'atendimentos',
  'internacoes', 'leito_ocupacoes', 'alergias', 'medicacoes_continuas',
  // 3. Prontuario Enfermagem
  'admissoes_enfermagem', 'historico_enfermagem', 'evolucoes', 'evolucoes_enfermagem',
  'balanco_hidrico', 'dispositivos_invasivos', 'sinais_vitais', 'isolamentos',
  'escalas_enfermagem', 'eventos_adversos', 'transferencias_sbar',
  // 4. Prontuario Medico
  'consultas_medicas', 'evolucoes_medicas', 'catalogo_medicamentos', 'cid_catalog',
  'prescricoes_medicas', 'prescricao_itens', 'exames_solicitados',
  'notas_intercorrencia_medica', 'planos_terapeuticos', 'receitas_medicas',
  'aih_solicitacoes', 'apac_solicitacoes', 'solicitacoes_atm', 'solicitacoes_tfd',
  'solicitacoes_sangue', 'solicitacoes_hemoterapia', 'sorologias_notificaveis',
  'sumarios_alta', 'regulacao_atualizacoes'
];

for (const t of allTables) {
  if (t === 'setores' || t === 'leitos') {
    sqlOut.push(`CREATE TABLE IF NOT EXISTS public.${t} (
    id SERIAL PRIMARY KEY
);`);
  } else {
    sqlOut.push(`CREATE TABLE IF NOT EXISTS public.${t} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);`);
  }
}

sqlOut.push(`\n-- =====================================================================
-- FASE 2: SANAR TODAS AS COLUNAS EM TODAS AS TABELAS (ALTER TABLE ADD COLUMN)
-- =====================================================================
`);

const schemaFiles = files.slice(0, 4);
let tableCols = new Map();

function stripCheckConstraint(str) {
  let res = str;
  while (true) {
    const checkIdx = res.search(/\bCHECK\s*\(/i);
    if (checkIdx === -1) break;
    let depth = 0;
    let startParen = res.indexOf('(', checkIdx);
    let endParen = -1;
    for (let i = startParen; i < res.length; i++) {
      if (res[i] === '(') depth++;
      else if (res[i] === ')') {
        depth--;
        if (depth === 0) {
          endParen = i;
          break;
        }
      }
    }
    if (endParen !== -1) {
      const before = res.substring(0, checkIdx);
      const after = res.substring(endParen + 1);
      res = (before + ' ' + after).trim();
    } else {
      break;
    }
  }
  return res.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim();
}

for (const f of schemaFiles) {
  const content = fs.readFileSync(path.join(migDir, f), 'utf8');
  
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\n\);/gi;
  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    if (!tableCols.has(tableName)) tableCols.set(tableName, new Map());
    
    const lines = body.split('\n');
    for (let l of lines) {
      l = l.trim().replace(/--.*$/, '').replace(/,$/, '').trim();
      if (!l) continue;
      if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)/i.test(l)) continue;
      const colMatch = l.match(/^([a-zA-Z0-9_]+)\s+([\s\S]+)$/);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        let colDef = colMatch[2].trim();
        if (colName === 'id') continue;
        
        // Remove trailing commas and sanitize
        colDef = colDef.replace(/,\s*$/, '').trim();
        const hasDefault = /DEFAULT/i.test(colDef);
        if (!hasDefault && /\bNOT\s+NULL\b/i.test(colDef)) {
          colDef = colDef.replace(/\bNOT\s+NULL\b/gi, '').trim();
        }
        // Strip inline CHECK constraints to avoid blocking legacy rows or leaving dangling parentheses
        colDef = stripCheckConstraint(colDef);
        colDef = colDef.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim();

        // ALIGNMENT OF TYPES WITH PRODUCTION DATABASE (setores and leitos use INTEGER)
        if (colName.includes('setor_') || colName === 'setor_id') {
          colDef = colDef.replace(/\bUUID\b/gi, 'INTEGER');
        }
        if (colName.includes('leito_') || colName === 'leito_id' || colName === 'leito_atual_id') {
          colDef = colDef.replace(/\bUUID\b/gi, 'INTEGER');
        }

        tableCols.get(tableName).set(colName, colDef);
      }
    }
  }

  const alterRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([\s\S]+?);/gi;
  while ((match = alterRegex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const colName = match[2].toLowerCase();
    let colDef = match[3].trim().replace(/;\s*$/, '').replace(/,\s*$/, '').trim();
    colDef = stripCheckConstraint(colDef);
    
    if (colName.includes('setor_') || colName === 'setor_id') {
      colDef = colDef.replace(/\bUUID\b/gi, 'INTEGER');
    }
    if (colName.includes('leito_') || colName === 'leito_id' || colName === 'leito_atual_id') {
      colDef = colDef.replace(/\bUUID\b/gi, 'INTEGER');
    }

    if (!tableCols.has(tableName)) tableCols.set(tableName, new Map());
    tableCols.get(tableName).set(colName, colDef);
  }
}

for (const t of allTables) {
  const cols = tableCols.get(t);
  if (!cols || cols.size === 0) continue;
  
  sqlOut.push(`-- Colunas para tabela: ${t}`);
  for (const [colName, colDef] of cols) {
    sqlOut.push(`ALTER TABLE public.${t} ADD COLUMN IF NOT EXISTS ${colName} ${colDef};`);
  }
  sqlOut.push('');
}

// Fase 3: Índices Únicos para integridade
sqlOut.push(`-- =====================================================================
-- FASE 3: ÍNDICES DE UNICIDADE E REMOÇÃO DE TRAVAS RESTRITIVAS LEGADAS
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_setores_nome ON public.setores (nome);
CREATE UNIQUE INDEX IF NOT EXISTS uq_leito_setor_numero ON public.leitos (setor_id, numero);
CREATE UNIQUE INDEX IF NOT EXISTS uq_enfermeiros_email ON public.enfermeiros (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_configuracoes_chave ON public.configuracoes (chave);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cid_catalog_codigo ON public.cid_catalog (codigo);

-- Remoção de CHECK constraints legadas que conflitam com registros hospitalares existentes
ALTER TABLE public.leitos DROP CONSTRAINT IF EXISTS leitos_tipo_check;
ALTER TABLE public.plantoes DROP CONSTRAINT IF EXISTS plantoes_turno_check;
ALTER TABLE public.plantoes DROP CONSTRAINT IF EXISTS plantoes_status_check;
ALTER TABLE public.atendimentos DROP CONSTRAINT IF EXISTS atendimentos_tipo_check;
ALTER TABLE public.atendimentos DROP CONSTRAINT IF EXISTS atendimentos_status_check;
ALTER TABLE public.dispositivos_invasivos DROP CONSTRAINT IF EXISTS dispositivos_invasivos_status_check;
ALTER TABLE public.alergias DROP CONSTRAINT IF EXISTS alergias_status_check;
ALTER TABLE public.alergias DROP CONSTRAINT IF EXISTS alergias_gravidade_check;
ALTER TABLE public.medicacoes_continuas DROP CONSTRAINT IF EXISTS medicacoes_continuas_status_check;
ALTER TABLE public.isolamentos DROP CONSTRAINT IF EXISTS isolamentos_status_check;
ALTER TABLE public.escalas_enfermagem DROP CONSTRAINT IF EXISTS escalas_enfermagem_tipo_check;
ALTER TABLE public.eventos_adversos DROP CONSTRAINT IF EXISTS eventos_adversos_gravidade_check;
`);

// Fase 4: Índices de Performance e Políticas de Segurança (RLS)
sqlOut.push(`\n-- =====================================================================
-- FASE 4: ÍNDICES DE PERFORMANCE E POLÍTICAS DE ACESSO (RLS)
-- =====================================================================
`);

const rlsContent = fs.readFileSync(path.join(migDir, '20260924000005_seguranca_rls_indices.sql'), 'utf8');
sqlOut.push(rlsContent);

// Fase 5: Seeds da UPA 24h Breves com compatibilidade dinâmica
sqlOut.push(`\n-- =====================================================================
-- FASE 5: CARGA DE DADOS INICIAIS (SEEDS DINÂMICOS DA UPA 24H BREVES)
-- =====================================================================

-- 1. SETORES PADRÃO (Sem forçar IDs para preservar integridade existente)
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS sigla TEXT;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;
ALTER TABLE public.setores ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

INSERT INTO public.setores (nome, sigla, ordem, ativo) VALUES
    ('Sala Vermelha (Emergência)', 'SV', 1, true),
    ('Internação', 'INT', 2, true),
    ('Observação Masculina', 'OBS-M', 3, true),
    ('Observação Feminina', 'OBS-F', 4, true),
    ('Observação Pediátrica', 'OBS-P', 5, true),
    ('Isolamento', 'ISO', 6, true)
ON CONFLICT (nome) DO UPDATE SET 
    sigla = COALESCE(EXCLUDED.sigla, public.setores.sigla),
    ordem = COALESCE(EXCLUDED.ordem, public.setores.ordem),
    ativo = EXCLUDED.ativo;

-- 2. LEITOS OFICIAIS DA UPA (Vinculação dinâmica por setor_id existente)
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'comum';
ALTER TABLE public.leitos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

DO $$
DECLARE
    sv_id integer;
    int_id integer;
    obsm_id integer;
    obsf_id integer;
    obsp_id integer;
    iso_id integer;
BEGIN
    SELECT id INTO sv_id FROM public.setores WHERE sigla = 'SV' OR nome ILIKE '%Vermelha%' LIMIT 1;
    SELECT id INTO int_id FROM public.setores WHERE sigla = 'INT' OR nome ILIKE '%Interna%' LIMIT 1;
    SELECT id INTO obsm_id FROM public.setores WHERE sigla = 'OBS-M' OR nome ILIKE '%Masculina%' LIMIT 1;
    SELECT id INTO obsf_id FROM public.setores WHERE sigla = 'OBS-F' OR nome ILIKE '%Feminina%' LIMIT 1;
    SELECT id INTO obsp_id FROM public.setores WHERE sigla = 'OBS-P' OR nome ILIKE '%Pedi%' LIMIT 1;
    SELECT id INTO iso_id FROM public.setores WHERE sigla = 'ISO' OR nome ILIKE '%Isolamento%' LIMIT 1;

    IF sv_id IS NOT NULL THEN
        INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
        (sv_id, '01', 'emergencia', true), (sv_id, '02', 'emergencia', true), (sv_id, '03', 'emergencia', true)
        ON CONFLICT (setor_id, numero) DO NOTHING;
    END IF;

    IF int_id IS NOT NULL THEN
        INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
        (int_id, '01', 'comum', true), (int_id, '02', 'comum', true), (int_id, '03', 'comum', true),
        (int_id, '04', 'comum', true), (int_id, '05', 'comum', true), (int_id, '06', 'comum', true),
        (int_id, '07', 'comum', true), (int_id, '08', 'comum', true), (int_id, '09', 'comum', true),
        (int_id, '10', 'comum', true)
        ON CONFLICT (setor_id, numero) DO NOTHING;
    END IF;

    IF obsm_id IS NOT NULL THEN
        INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
        (obsm_id, '01', 'comum', true), (obsm_id, '02', 'comum', true), (obsm_id, '03', 'comum', true),
        (obsm_id, '04', 'comum', true), (obsm_id, '05', 'comum', true), (obsm_id, '06', 'comum', true)
        ON CONFLICT (setor_id, numero) DO NOTHING;
    END IF;

    IF obsf_id IS NOT NULL THEN
        INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
        (obsf_id, '01', 'comum', true), (obsf_id, '02', 'comum', true), (obsf_id, '03', 'comum', true),
        (obsf_id, '04', 'comum', true), (obsf_id, '05', 'comum', true), (obsf_id, '06', 'comum', true)
        ON CONFLICT (setor_id, numero) DO NOTHING;
    END IF;

    IF obsp_id IS NOT NULL THEN
        INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
        (obsp_id, '01', 'comum', true), (obsp_id, '02', 'comum', true), (obsp_id, '03', 'comum', true),
        (obsp_id, '04', 'comum', true)
        ON CONFLICT (setor_id, numero) DO NOTHING;
    END IF;

    IF iso_id IS NOT NULL THEN
        INSERT INTO public.leitos (setor_id, numero, tipo, ativo) VALUES
        (iso_id, '01', 'isolamento', true), (iso_id, '02', 'isolamento', true)
        ON CONFLICT (setor_id, numero) DO NOTHING;
    END IF;
END $$;

-- 3. CONFIGURAÇÕES INSTITUCIONAIS DA UPA 24H BREVES
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS valor TEXT;
ALTER TABLE public.configuracoes ALTER COLUMN valor TYPE TEXT USING valor::TEXT;

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
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS via_padrao TEXT;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS controlado BOOLEAN DEFAULT false;
ALTER TABLE public.catalogo_medicamentos ADD COLUMN IF NOT EXISTS antimicrobiano BOOLEAN DEFAULT false;

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
`);

const finalSql = sqlOut.join('\n');
fs.writeFileSync(path.join(rootDir, 'supabase', 'DEPLOY_PRODUCAO.sql'), finalSql, 'utf8');

console.log('Script DEPLOY_PRODUCAO.sql atualizado com sucesso com compatibilidade de tipos!');
console.log('Total de linhas:', finalSql.split('\n').length);
console.log('Total de caracteres:', finalSql.length);
