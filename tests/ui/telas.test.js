import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('src');
function arquivos(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? arquivos(p, ext) : ext.some((x) => p.endsWith(x)) ? [p] : [];
  });
}

export function runTelasTests(test) {
  test('Toda variável de cor usada (var(--x)) está definida em algum CSS', () => {
    const todos = arquivos(SRC, ['.css', '.jsx', '.js']).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const usadas = new Set([...todos.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
    const definidas = new Set([...todos.matchAll(/(?:^|[;{\s'"])(--[\w-]+)\s*:/gm)].map((m) => m[1]));
    const faltando = [...usadas].filter((v) => !definidas.has(v));
    assert.deepEqual(faltando, [], `Variáveis sem definição: ${faltando.join(', ')}`);
  });

  test('Tela médica: mesma estrutura do card da enfermagem e ficha abre no lugar da lista', () => {
    const s = fs.readFileSync(path.join(SRC, 'pages/PainelMedico.jsx'), 'utf8');
    assert.match(s, /onClick=\{\(\) => setSelecionado\(a\)\}/, 'card precisa abrir o paciente ao clicar');
    assert.match(s, /PainelCards\.module\.css/, 'usar o mesmo estilo dos cards da enfermagem');
    for (const parte of ['risk-bar', 'leito-status', 'paciente-hd', 'paciente-admissao', 'leito-footer', 'pl-tag alergia']) {
      assert.ok(s.includes(parte), `card médico sem a parte: ${parte}`);
    }
    const iRetorno = s.indexOf('if (selecionado)');
    const iLista = s.indexOf('leitos-grid');
    assert.ok(iRetorno > -1 && iRetorno < iLista, 'a ficha deve substituir a lista, não ser desenhada abaixo dela');
  });
}
