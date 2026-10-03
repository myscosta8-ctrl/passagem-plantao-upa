import { runRegrasClinicasTests } from '../tests/unit/regras-clinicas.test.js';
import { runRegrasPrescricaoTests, runCatalogoSaeTests, runModelosEvolucaoTests, runImpressaoTests, runPadraoVisualTests, runCacheTests, runDivisaoPrescricaoTests, runDivisaoExamesTests, runDivisaoAihTests, runDivisaoColetivaTests, runDivisaoInicioTests, runPadraoImpressoTests, runSinaisVitaisMedicoTests } from '../tests/unit/regras-prescricao.test.js';
import { runModelosImpressaoTests } from '../tests/fidelity/modelos-impressao.test.js';
import { runMockupsFase2Tests } from '../tests/fidelity/mockups-fase2.test.js';
import { runModularizacaoTests } from '../tests/architecture/modularizacao.test.js';
import { runDatabaseMigrationsTests } from '../tests/architecture/database-migrations.test.js';
import { runPwaOfflineTests } from '../tests/unit/pwa-offline.test.js';
import { runTelasTests } from '../tests/ui/telas.test.js';

// Cores ANSI para saída no terminal
const CORES = {
  reset: '\x1b[0m',
  negrito: '\x1b[1m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  ciano: '\x1b[36m',
  cinza: '\x1b[90m',
};

async function main() {
  const inicio = performance.now();
  console.log(`\n${CORES.negrito}${CORES.ciano}🏥 PASSAGEM DE PLANTÃO & PEP - UPA 24H BREVES${CORES.reset}`);
  console.log(`${CORES.cinza}─────────────────────────────────────────────────────────────────${CORES.reset}`);
  console.log(`${CORES.azul}▶ Iniciando Esteira de Testes Automatizados (Node.js Test Runner)...${CORES.reset}\n`);

  let totalTestes = 0;
  let testesPassaram = 0;
  let testesFalharam = 0;
  const falhas = [];
  const pendentes = [];

  function criarSuite(nomeSuite) {
    console.log(`${CORES.negrito}${CORES.amarelo}📂 [SUÍTE] ${nomeSuite}${CORES.reset}`);
    return function registrarTeste(nomeTeste, fn) {
      totalTestes++;
      const passou = () => { testesPassaram++; console.log(`  ${CORES.verde}✔${CORES.reset} ${nomeTeste}`); };
      const falhou = (err) => {
        testesFalharam++;
        falhas.push({ suite: nomeSuite, teste: nomeTeste, erro: err });
        console.log(`  ${CORES.vermelho}✖${CORES.reset} ${nomeTeste}`);
        console.log(`    ${CORES.vermelho}${err.message}${CORES.reset}`);
      };
      try {
        const resultado = fn();
        // Teste assíncrono (ex.: ordem das gravações no banco simulado): conclui antes do resumo final.
        if (resultado instanceof Promise) { pendentes.push(resultado.then(passou, falhou)); return; }
        passou();
      } catch (err) {
        falhou(err);
      }
    };
  }

  // 1. Regras Clínicas e Cálculos Unitários
  const testRegras = criarSuite('Regras Clínicas e Cálculos Unitários (SUS/UPA)');
  runRegrasClinicasTests(testRegras);
  runRegrasPrescricaoTests(criarSuite('Prescrição, ATM, Controle Especial, AIH e Rascunho/Finalização'));
  runCatalogoSaeTests(criarSuite('Catálogo da SAE (diagnósticos e cuidados de enfermagem)'));
  runModelosEvolucaoTests(criarSuite('Modelos de evolução'));
  runImpressaoTests(criarSuite('Impressos: orientação, tamanhos de letra e rodapé'));
  runPadraoVisualTests(criarSuite('Padrão visual único (letras, larguras de tela, cor principal)'));
  runCacheTests(criarSuite('Cache de dados entre abas (item 18)'));
  runDivisaoPrescricaoTests(criarSuite('Prescrição dividida em partes e salvar documento comum (item 17)'));
  runDivisaoExamesTests(criarSuite('Solicitação de Exames dividida em partes (item 17)'));
  runDivisaoAihTests(criarSuite('Laudo de AIH dividido em partes (item 17)'));
  runDivisaoColetivaTests(criarSuite('Passagem Coletiva dividida em partes (item 17)'));
  runDivisaoInicioTests(criarSuite('Início dividido em partes (item 17)'));
  runPadraoImpressoTests(criarSuite('Padrão visual dos documentos impressos'));
  runSinaisVitaisMedicoTests(criarSuite('Sinais vitais na Evolução Médica'));
  console.log('');

  // 2. Fidelidade Absoluta aos Modelos de Impressão HTML
  const testModelos = criarSuite('Fidelidade dos Modelos de Impressão HTML (modelos_impressao_html)');
  runModelosImpressaoTests(testModelos);
  console.log('');

  // 3. Fidelidade aos Mockups da Fase 2
  const testMockups = criarSuite('Integridade dos Mockups de Design da Fase 2 (mockups-fase2)');
  runMockupsFase2Tests(testMockups);
  console.log('');

  // 4. Arquitetura Modular e Otimização do Bundle
  const testArquitetura = criarSuite('Arquitetura Modular, Orquestradores e Configuração de Bundle');
  runModularizacaoTests(testArquitetura);
  console.log('');

  // 5. Versionamento de Schema e Migrações do Banco de Dados (Supabase)
  const testBanco = criarSuite('Versionamento de Schema e Migrações de Banco de Dados (Supabase)');
  runDatabaseMigrationsTests(testBanco);
  console.log('');

  // 6. Resiliência Offline e Estratégia de Cache PWA
  const testPwa = criarSuite('Resiliência Offline e Estratégia de Cache PWA (UPA 24h Breves)');
  runPwaOfflineTests(testPwa);
  runTelasTests(testPwa);
  console.log('');

  await Promise.all(pendentes);
  const fim = performance.now();
  const duracao = ((fim - inicio) / 1000).toFixed(2);

  console.log(`${CORES.cinza}─────────────────────────────────────────────────────────────────${CORES.reset}`);
  if (testesFalharam === 0) {
    console.log(
      `${CORES.negrito}${CORES.verde}🎉 SUCESSO TOTAL: Todos os ${testesPassaram} testes foram executados com êxito! (${duracao}s)${CORES.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `${CORES.negrito}${CORES.vermelho}❌ FALHA: ${testesFalharam} de ${totalTestes} testes falharam. (${duracao}s)${CORES.reset}\n`
    );
    for (const f of falhas) {
      console.log(`${CORES.vermelho}[${f.suite}] ${f.teste}${CORES.reset}`);
      console.log(`${CORES.cinza}${f.erro.stack || f.erro.message}${CORES.reset}\n`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erro fatal no executor de testes:', err);
  process.exit(1);
});
