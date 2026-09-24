import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const url = 'https://fhsyrcksxcdhdbcvjspv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoc3lyY2tzeGNkaGRiY3Zqc3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTczNTAsImV4cCI6MjEwMDk5MzM1MH0.CT1pJUWKk86xH5KO5E5wcKTwX-VayVNVqhS0NdmzmeE';
const supabase = createClient(url, key);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.sql')) {
      results.push(full);
    }
  }
  return results;
}

const migDir = path.join(rootDir, 'supabase', 'migrations');
const migFiles = fs.readdirSync(migDir).filter(f => f.endsWith('.sql')).sort();

let expectedTables = new Map();

for (const file of migFiles) {
  const content = fs.readFileSync(path.join(migDir, file), 'utf8');
  
  const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\n\);/gi;
  let match;
  while ((match = createRegex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    if (!expectedTables.has(tableName)) expectedTables.set(tableName, new Set());
    
    const lines = body.split('\n');
    for (let l of lines) {
      l = l.trim().replace(/--.*$/, '').replace(/,$/, '');
      if (!l) continue;
      if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)/i.test(l)) continue;
      const colMatch = l.match(/^([a-zA-Z0-9_]+)\s+/);
      if (colMatch) {
        expectedTables.get(tableName).add(colMatch[1].toLowerCase());
      }
    }
  }

  const alterRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi;
  while ((match = alterRegex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const colName = match[2].toLowerCase();
    if (!expectedTables.has(tableName)) expectedTables.set(tableName, new Set());
    expectedTables.get(tableName).add(colName);
  }
}

const extraCandidates = [
  'profissionais', 'usuarios', 'users', 'passagem_plantoes', 'passagens_plantao',
  'prontuarios', 'atendimento', 'paciente', 'leito', 'prescricoes', 'prescricao'
];
for (const t of extraCandidates) {
  if (!expectedTables.has(t)) expectedTables.set(t, new Set());
}

async function checkColumn(table, col) {
  const res = await supabase.from(table).select(col).limit(1);
  if (res.error && res.error.code === '42703') {
    return { col, exists: false };
  }
  return { col, exists: true };
}

async function audit() {
  console.log('=== AUDITORIA DE TABELAS E COLUNAS SUPABASE (PRODUÇÃO) ===\n');

  const existing = [];
  const missing = [];

  for (const [table, cols] of expectedTables.entries()) {
    const { data, count, error } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);

    if (error && error.code === 'PGRST205') {
      missing.push(table);
      console.log(`❌ [TABELA INEXISTENTE] ${table}`);
      continue;
    }

    const rowCount = (count !== null && count !== undefined) ? count : (data ? data.length : 0);
    
    // Check columns
    const colList = Array.from(cols);
    let missingCols = [];
    let presentCols = [];

    if (colList.length > 0) {
      // Parallel checks in chunks of 8
      for (let i = 0; i < colList.length; i += 8) {
        const chunk = colList.slice(i, i + 8);
        const results = await Promise.all(chunk.map(c => checkColumn(table, c)));
        for (const r of results) {
          if (r.exists) presentCols.push(r.col);
          else missingCols.push(r.col);
        }
      }
    }

    const status = missingCols.length === 0 ? '✅ TOTALMENTE ALINHADA' : '⚠️ FALTAM COLUNAS';
    console.log(`${status} | Tabela: ${table} | Linhas: ${rowCount} | Presentes: ${presentCols.length} | Faltantes: ${missingCols.length}`);
    if (missingCols.length > 0) {
      console.log(`   ↳ Colunas faltantes: ${missingCols.join(', ')}`);
    }

    existing.push({
      table,
      rowCount,
      totalExpected: colList.length,
      presentCols,
      missingCols
    });
  }

  console.log('\n=============================================');
  console.log(`TOTAL EXISTENTES: ${existing.length}`);
  console.log(`TOTAL A CRIAR (NOVAS): ${missing.length}`);
  console.log('=============================================');

  // Generate output file with the findings
  fs.writeFileSync(
    path.join(rootDir, 'supabase', 'audit_report.json'),
    JSON.stringify({ existing, missing }, null, 2)
  );
  console.log('\nRelatório salvo em supabase/audit_report.json');
}

audit().catch(console.error);
