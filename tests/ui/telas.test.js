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

  test('Tela médica usa o mesmo Painel de Leitos da enfermagem (modo consulta)', () => {
    const home = fs.readFileSync(path.join(SRC, 'pages/Home.jsx'), 'utf8');
    assert.match(home, /<Painel modo="medico"/, 'médico deve usar o mesmo componente Painel');
    assert.match(home, /className="breadcrumb"[\s\S]*Prontuário Eletrônico/, 'topo igual ao da enfermagem');
    const cards = fs.readFileSync(path.join(SRC, 'pages/painel/PainelCards.jsx'), 'utf8');
    assert.match(cards, /!ehMedico && <div className=\{cx\('footer-actions-right'\)\}/, 'médico não realoca nem dá desfecho');
    const painel = fs.readFileSync(path.join(SRC, 'pages/Painel.jsx'), 'utf8');
    assert.match(painel, /pilarInicial=\{ehMedico \? 'medico' : 'enfermagem'\}/, 'médico abre direto o prontuário médico');
  });
}
