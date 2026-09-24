import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  salvarRascunhoOffline,
  recuperarRascunhoOffline,
  limparRascunhoOffline,
  listarRascunhosPendentes,
  estaOnline
} from '../../src/lib/offlineManager.js';

// Setup de localStorage mock para Node.js
function setupLocalStorageMock() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] || null,
    get length() {
      return store.size;
    }
  };
}

export function runPwaOfflineTests(test) {
  setupLocalStorageMock();

  test('Deve salvar e recuperar rascunho clínico offline com integridade e timestamp', () => {
    localStorage.clear();
    const dadosClinicos = {
      pacienteId: '123-abc',
      queixaPrincipal: 'Dor torácica típica',
      conduta: 'Solicitado ECG e troponina'
    };

    const salvo = salvarRascunhoOffline('ficha_medica_123', dadosClinicos);
    assert.equal(salvo, true);

    const recuperado = recuperarRascunhoOffline('ficha_medica_123');
    assert.ok(recuperado !== null);
    assert.equal(recuperado.dados.queixaPrincipal, 'Dor torácica típica');
    assert.equal(recuperado.dados.conduta, 'Solicitado ECG e troponina');
    assert.equal(typeof recuperado.salvoEm, 'string');
  });

  test('Deve listar rascunhos offline pendentes e permitir limpeza individual', () => {
    localStorage.clear();
    salvarRascunhoOffline('ficha_a', { tipo: 'A' });
    salvarRascunhoOffline('ficha_b', { tipo: 'B' });

    let lista = listarRascunhosPendentes();
    assert.equal(lista.length, 2);

    const limpo = limparRascunhoOffline('ficha_a');
    assert.equal(limpo, true);

    lista = listarRascunhosPendentes();
    assert.equal(lista.length, 1);
    assert.equal(lista[0].chave, 'ficha_b');
  });

  test('Deve reportar status de conectividade padrão com fallback seguro', () => {
    const status = estaOnline();
    assert.equal(typeof status, 'boolean');
  });

  test('Manifesto PWA (public/manifest.json) deve possuir metadados válidos para ambiente hospitalar', () => {
    const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'Arquivo public/manifest.json deve existir');

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.ok(manifestContent.name.includes('UPA 24h Breves'), 'Nome deve citar UPA 24h Breves');
    assert.equal(manifestContent.short_name, 'UPA Breves');
    assert.equal(manifestContent.display, 'standalone');
    assert.ok(manifestContent.start_url === '/' || manifestContent.start_url === './', 'start_url deve ser raiz ou relativo');
    assert.ok(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 2);
    assert.ok(Array.isArray(manifestContent.categories) && manifestContent.categories.includes('medical'));
  });

  test('Configuração do Vite (vite.config.js) deve incluir estratégias Workbox e resiliência', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.js');
    assert.ok(fs.existsSync(viteConfigPath), 'vite.config.js deve existir');

    const configContent = fs.readFileSync(viteConfigPath, 'utf-8');
    assert.ok(configContent.includes('VitePWA'), 'Deve carregar VitePWA');
    assert.ok(configContent.includes('runtimeCaching'), 'Deve configurar runtimeCaching');
    assert.ok(configContent.includes('google-fonts-cache'), 'Deve cachear fontes');
    assert.ok(configContent.includes('hospital-assets'), 'Deve cachear assets hospitalares');
    assert.ok(configContent.includes('navigateFallback'), 'Deve configurar navigateFallback SPA');
  });
}
