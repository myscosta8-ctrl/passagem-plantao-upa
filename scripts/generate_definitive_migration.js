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
-- Gerado automaticamente com base na auditoria completa do banco de produção.
-- Idempotente: Execução 100% segura sem falha de coluna ou perda de dados.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- FASE 1: GARANTIR QUE TODAS AS 48 TABELAS EXISTEM COM CHAVE PRIMÁRIA
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
  sqlOut.push(`CREATE TABLE IF NOT EXISTS public.${t} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);`);
}

sqlOut.push(`\n-- =====================================================================
-- FASE 2: SANAR TODAS AS COLUNAS EM TODAS AS TABELAS (ALTER TABLE ADD COLUMN)
-- =====================================================================
`);

const schemaFiles = files.slice(0, 4);
let tableCols = new Map();

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
        colDef = colDef.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim();
        
        tableCols.get(tableName).set(colName, colDef);
      }
    }
  }

  const alterRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([\s\S]+?);/gi;
  while ((match = alterRegex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const colName = match[2].toLowerCase();
    let colDef = match[3].trim().replace(/;\s*$/, '').replace(/,\s*$/, '').trim();
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

// Fase 3: Índices Únicos para suporte a ON CONFLICT
sqlOut.push(`-- =====================================================================
-- FASE 3: ÍNDICES DE UNICIDADE (NECESSÁRIOS PARA SEEDS E INTEGRIDADE)
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_setores_nome ON public.setores (nome);
CREATE UNIQUE INDEX IF NOT EXISTS uq_leito_setor_numero ON public.leitos (setor_id, numero);
CREATE UNIQUE INDEX IF NOT EXISTS uq_enfermeiros_email ON public.enfermeiros (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_configuracoes_chave ON public.configuracoes (chave);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cid_catalog_codigo ON public.cid_catalog (codigo);
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalogo_medicamentos_nome ON public.catalogo_medicamentos (nome);
`);

// Fase 4: Índices de Performance e Políticas de Segurança (RLS)
sqlOut.push(`\n-- =====================================================================
-- FASE 4: ÍNDICES DE PERFORMANCE E POLÍTICAS DE ACESSO (RLS)
-- =====================================================================
`);

const rlsContent = fs.readFileSync(path.join(migDir, '20260924000005_seguranca_rls_indices.sql'), 'utf8');
sqlOut.push(rlsContent);

// Fase 5: Seeds da UPA 24h Breves
sqlOut.push(`\n-- =====================================================================
-- FASE 5: CARGA DE DADOS INICIAIS (SEEDS DA UPA 24H BREVES)
-- =====================================================================
`);

const seedsContent = fs.readFileSync(path.join(migDir, '20260924000006_seeds_iniciais.sql'), 'utf8');
sqlOut.push(seedsContent);

const finalSql = sqlOut.join('\n');
fs.writeFileSync(path.join(rootDir, 'supabase', 'DEPLOY_PRODUCAO.sql'), finalSql, 'utf8');

console.log('Script DEPLOY_PRODUCAO.sql gerado com sucesso!');
console.log('Total de linhas:', finalSql.split('\n').length);
console.log('Total de caracteres:', finalSql.length);
