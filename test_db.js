import pg from 'pg';
const client = new pg.Client({
  connectionString: 'postgresql://postgres.fhsyrcksxcdhdbcvjspv:37641178mM!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Connected! Result:', res.rows);
  } catch (e) {
    console.error('Error connecting:', e.message);
  } finally {
    await client.end();
  }
}
run();
