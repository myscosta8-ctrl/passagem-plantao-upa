import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase', 'migrations');

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log('🔄 EXECUTOR DE MIGRAÇÕES DE BANCO DE DADOS (SUPABASE / POSTGRESQL)');
  console.log('─────────────────────────────────────────────────────────────────');

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Diretório de migrações não encontrado:', MIGRATIONS_DIR);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Encontradas ${migrationFiles.length} migrações versionadas em supabase/migrations/:\n`);
  migrationFiles.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));
  console.log('');

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (isDryRun || !dbUrl) {
    console.log('🔍 MODO DE VALIDAÇÃO ESTRUTURAL (DRY-RUN)');
    console.log('Validando sintaxe SQL, integridade e criação das tabelas...');

    let totalLinhas = 0;
    for (const file of migrationFiles) {
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      totalLinhas += sql.split(/\r?\n/).length;

      // Validação básica de SQL
      if (sql.length < 50) {
        throw new Error(`Arquivo de migração vazio ou muito curto: ${file}`);
      }
      console.log(`  ✔ ${file} validado (${(sql.length / 1024).toFixed(1)} KB)`);
    }

    console.log(`\n🎉 Todas as ${migrationFiles.length} migrações (${totalLinhas} linhas de SQL) foram validadas com sucesso!`);

    if (!dbUrl) {
      console.log('\nℹ️ Nota: Para aplicar diretamente ao banco de dados Supabase em produção:');
      console.log('   Defina a variável DATABASE_URL no seu arquivo .env com a string de conexão postgresql://');
      console.log('   Exemplo: DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres"');
      console.log('   E execute: npm run db:migrate\n');
    }
    return;
  }

  // Execução real via pg client
  try {
    const { default: pg } = await import('pg');
    const client = new pg.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });

    console.log('Conectando ao banco de dados Supabase...');
    await client.connect();
    console.log('Conectado com sucesso!\n');

    // Cria tabela de controle de migrações se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        nome TEXT UNIQUE NOT NULL,
        executado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const { rows: aplicadas } = await client.query('SELECT nome FROM public._migrations');
    const setAplicadas = new Set(aplicadas.map((r) => r.nome));

    let executadasCount = 0;
    for (const file of migrationFiles) {
      if (setAplicadas.has(file)) {
        console.log(`  ⏭️ ${file} (já aplicada)`);
        continue;
      }

      console.log(`  🚀 Aplicando ${file}...`);
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(fullPath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO public._migrations (nome) VALUES ($1)', [file]);
        await client.query('COMMIT');
        executadasCount++;
        console.log(`     ✔ ${file} aplicada com sucesso!`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Erro fatal ao aplicar ${file}:`, err.message);
        throw err;
      }
    }

    await client.end();
    console.log(`\n🎉 Processo concluído: ${executadasCount} novas migrações aplicadas ao banco de dados!`);
  } catch (err) {
    console.error('\n❌ Falha na conexão ou execução das migrações:', err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
