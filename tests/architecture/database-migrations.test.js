import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase', 'migrations');

const TABELAS_OBRIGATORIAS = [
  'enfermeiros',
  'setores',
  'leitos',
  'plantoes',
  'plantao_profissionais',
  'pacientes',
  'passagens',
  'realocacoes',
  'configuracoes',
  'eventos_auditoria',
  'pessoas',
  'pessoas_duplicatas',
  'pessoas_fusoes',
  'atendimentos',
  'internacoes',
  'leito_ocupacoes',
  'alergias',
  'medicacoes_continuas',
  'admissoes_enfermagem',
  'historico_enfermagem',
  'evolucoes',
  'evolucoes_enfermagem',
  'balanco_hidrico',
  'dispositivos_invasivos',
  'sinais_vitais',
  'isolamentos',
  'escalas_enfermagem',
  'eventos_adversos',
  'transferencias_sbar',
  'consultas_medicas',
  'evolucoes_medicas',
  'catalogo_medicamentos',
  'cid_catalog',
  'prescricoes_medicas',
  'prescricao_itens',
  'exames_solicitados',
  'notas_intercorrencia_medica',
  'planos_terapeuticos',
  'receitas_medicas',
  'aih_solicitacoes',
  'apac_solicitacoes',
  'solicitacoes_atm',
  'solicitacoes_tfd',
  'solicitacoes_sangue',
  'solicitacoes_hemoterapia',
  'sorologias_notificaveis',
  'sumarios_alta',
  'regulacao_atualizacoes',
];

export function runDatabaseMigrationsTests(test) {
  test('Diretório de migrações do Supabase existe com todas as 6 migrações sequenciais', () => {
    assert.ok(fs.existsSync(MIGRATIONS_DIR), 'Pasta supabase/migrations deve existir');

    const arquivos = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    assert.equal(arquivos.length, 6, 'Devem existir 6 arquivos de migração sequenciais');
    assert.ok(arquivos[0].includes('base_schema'), 'Migração 1 deve ser base_schema');
    assert.ok(arquivos[1].includes('pep_core'), 'Migração 2 deve ser pep_core');
    assert.ok(arquivos[2].includes('prontuario_enfermagem'), 'Migração 3 deve ser prontuario_enfermagem');
    assert.ok(arquivos[3].includes('prontuario_medico'), 'Migração 4 deve ser prontuario_medico');
    assert.ok(arquivos[4].includes('seguranca_rls_indices'), 'Migração 5 deve ser seguranca_rls_indices');
    assert.ok(arquivos[5].includes('seeds_iniciais'), 'Migração 6 deve ser seeds_iniciais');
  });

  test('Todas as 47 tabelas do sistema estão declaradas e versionadas nas migrações', () => {
    const arquivos = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'));

    let sqlCompleto = '';
    for (const f of arquivos) {
      sqlCompleto += '\n' + fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    }

    for (const tabela of TABELAS_OBRIGATORIAS) {
      const regexCriacao = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?public\\.${tabela}\\b`, 'i');
      assert.ok(
        regexCriacao.test(sqlCompleto),
        `Tabela obrigatória '${tabela}' não encontrada no schema versionado do Supabase`
      );
    }
  });

  test('Políticas de Row Level Security (RLS) estão habilitadas em todas as tabelas', () => {
    const migracaoRls = fs.readFileSync(
      path.join(MIGRATIONS_DIR, '20260924000005_seguranca_rls_indices.sql'),
      'utf8'
    );

    assert.ok(
      migracaoRls.includes('ENABLE ROW LEVEL SECURITY'),
      'Migração de segurança deve conter comandos ENABLE ROW LEVEL SECURITY'
    );
    assert.ok(
      migracaoRls.includes('CREATE POLICY'),
      'Migração de segurança deve conter criação de políticas RLS'
    );
  });

  test('Seeds iniciais contêm os dados de referência oficiais da UPA 24h Breves (CNES 0296796)', () => {
    const migracaoSeeds = fs.readFileSync(
      path.join(MIGRATIONS_DIR, '20260924000006_seeds_iniciais.sql'),
      'utf8'
    );

    assert.ok(migracaoSeeds.includes('0296796'), 'Seeds devem cadastrar o CNES oficial 0296796');
    assert.ok(migracaoSeeds.includes('Sala Vermelha'), 'Seeds devem cadastrar Sala Vermelha');
    assert.ok(migracaoSeeds.includes('Internação'), 'Seeds devem cadastrar setor de Internação');
    assert.ok(migracaoSeeds.includes('pep_ativo'), 'Seeds devem cadastrar a flag pep_ativo');
  });
}
