import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_migrations'");
    if (res.rowCount > 0) {
      const rows = await client.query("SELECT nome FROM public._migrations");
      console.log('Migrations table exists! Applied migrations:', rows.rows.map(r => r.nome));
    } else {
      console.log('Migrations table DOES NOT exist!');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
