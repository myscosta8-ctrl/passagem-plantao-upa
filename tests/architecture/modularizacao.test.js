import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

const ABAS_MEDICAS = [
  'AbaConsulta.jsx',
  'AbaEvolucaoMedica.jsx',
  'AbaPrescricao.jsx',
  'AbaExames.jsx',
  'AbaNotaIntercorrenciaMedica.jsx',
  'AbaPlanoTerapeutico.jsx',
  'AbaReceituarioMedico.jsx',
  'AbaAih.jsx',
  'AbaApac.jsx',
  'AbaAtm.jsx',
  'AbaTfd.jsx',
  'AbaSumarioAlta.jsx',
  'AbaMedicacoesContinuas.jsx',
  'AbaRegulacao.jsx',
  'AbaSangue.jsx',
  'AbaAuditoria.jsx',
];

const ABAS_CLINICAS = [
  'AbaEvolucao.jsx',
  'AbaBalancoHidrico.jsx',
  'AbaDispositivos.jsx',
  'AbaSinaisVitais.jsx',
  'AbaAlergias.jsx',
  'AbaIsolamento.jsx',
  'AbaEscalas.jsx',
  'AbaEventosAdversos.jsx',
  'AbaSbar.jsx',
  'ResumoPaciente.jsx',
];

export function runModularizacaoTests(test) {
  test('Monólitos FichaMedica.jsx e FichaClinica.jsx foram reduzidos a orquestradores leves (< 150 linhas)', () => {
    const fichaMedicaPath = path.join(SRC_DIR, 'pages', 'FichaMedica.jsx');
    const fichaClinicaPath = path.join(SRC_DIR, 'pages', 'FichaClinica.jsx');

    assert.ok(fs.existsSync(fichaMedicaPath), 'FichaMedica.jsx deve existir');
    assert.ok(fs.existsSync(fichaClinicaPath), 'FichaClinica.jsx deve existir');

    const linhasMedica = fs.readFileSync(fichaMedicaPath, 'utf8').split(/\r?\n/).length;
    const linhasClinica = fs.readFileSync(fichaClinicaPath, 'utf8').split(/\r?\n/).length;

    assert.ok(
      linhasMedica < 150,
      `FichaMedica.jsx deve ter menos de 150 linhas (atual: ${linhasMedica} linhas)`
    );
    assert.ok(
      linhasClinica < 150,
      `FichaClinica.jsx deve ter menos de 150 linhas (atual: ${linhasClinica} linhas)`
    );
  });

  test('Todas as sub-abas modulares de Prontuário Médico existem em src/pages/ficha-medica/', () => {
    const dirMedica = path.join(SRC_DIR, 'pages', 'ficha-medica');
    assert.ok(fs.existsSync(dirMedica), 'Diretório src/pages/ficha-medica deve existir');

    for (const aba of ABAS_MEDICAS) {
      const caminho = path.join(dirMedica, aba);
      assert.ok(fs.existsSync(caminho), `Sub-aba médica obrigatória não encontrada: ${aba}`);
      const stat = fs.statSync(caminho);
      assert.ok(stat.size > 200, `Sub-aba médica ${aba} parece vazia (${stat.size} bytes)`);
    }
  });

  test('Todas as sub-abas modulares de Prontuário Clínico/Enfermagem existem em src/pages/ficha-clinica/', () => {
    const dirClinica = path.join(SRC_DIR, 'pages', 'ficha-clinica');
    assert.ok(fs.existsSync(dirClinica), 'Diretório src/pages/ficha-clinica deve existir');

    for (const aba of ABAS_CLINICAS) {
      const caminho = path.join(dirClinica, aba);
      assert.ok(fs.existsSync(caminho), `Sub-aba clínica obrigatória não encontrada: ${aba}`);
      const stat = fs.statSync(caminho);
      assert.ok(stat.size > 200, `Sub-aba clínica ${aba} parece vazia (${stat.size} bytes)`);
    }
  });

  test('Configuração do Vite em vite.config.js possui regras de split e chunkSizeWarningLimit', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.js');
    const conteudo = fs.readFileSync(viteConfigPath, 'utf8');

    assert.ok(conteudo.includes('manualChunks'), 'vite.config.js deve conter estratégia de manualChunks');
    assert.ok(conteudo.includes('vendor-react'), 'manualChunks deve definir vendor-react');
    assert.ok(conteudo.includes('vendor-supabase'), 'manualChunks deve definir vendor-supabase');
    assert.ok(conteudo.includes('chunkSizeWarningLimit'), 'vite.config.js deve definir chunkSizeWarningLimit');
  });

  test('Orquestrador de Impressão FichaMedicaPrint.jsx foi modularizado (< 160 linhas) com corpos em ficha-medica-print/', () => {
    const printPath = path.join(SRC_DIR, 'pages', 'FichaMedicaPrint.jsx');
    assert.ok(fs.existsSync(printPath), 'FichaMedicaPrint.jsx deve existir');

    const linhas = fs.readFileSync(printPath, 'utf8').split(/\r?\n/).length;
    assert.ok(linhas < 160, `FichaMedicaPrint.jsx deve ter menos de 160 linhas (atual: ${linhas})`);

    const dirPrint = path.join(SRC_DIR, 'pages', 'ficha-medica-print');
    assert.ok(fs.existsSync(dirPrint), 'Diretório ficha-medica-print deve existir');

    const corposEsperados = [
      'helpersSus.jsx',
      'CorpoConsultaOficial.jsx',
      'CorpoPrescricaoOficial.jsx',
      'CorpoAihOficial.jsx',
      'CorpoApacOficial.jsx',
      'CorpoAtmOficial.jsx',
      'CorpoTfdOficial.jsx',
      'CorpoPlanoOficial.jsx',
      'CorpoRegulacaoOficial.jsx',
      'CorpoSangueOficial.jsx',
      'CorpoSumarioAltaOficial.jsx',
      'CorpoEvolucaoMedicaOficial.jsx',
      'CorpoNotaIntercorrenciaOficial.jsx',
      'CorpoReceituarioOficial.jsx'
    ];

    for (const c of corposEsperados) {
      assert.ok(fs.existsSync(path.join(dirPrint, c)), `Módulo de impressão oficial não encontrado: ${c}`);
    }
  });

  test('Orquestrador de Impressão FichaClinicaPrint.jsx foi modularizado (< 120 linhas) com corpos em ficha-clinica-print/', () => {
    const printPath = path.join(SRC_DIR, 'pages', 'FichaClinicaPrint.jsx');
    assert.ok(fs.existsSync(printPath), 'FichaClinicaPrint.jsx deve existir');

    const linhas = fs.readFileSync(printPath, 'utf8').split(/\r?\n/).length;
    assert.ok(linhas < 120, `FichaClinicaPrint.jsx deve ter menos de 120 linhas (atual: ${linhas})`);

    const dirPrint = path.join(SRC_DIR, 'pages', 'ficha-clinica-print');
    assert.ok(fs.existsSync(dirPrint), 'Diretório ficha-clinica-print deve existir');

    const corposEsperados = [
      'CorpoSbarOficial.jsx',
      'CorpoEvolucaoSaeOficial.jsx',
      'CorpoIntercorrenciaOficial.jsx',
      'CorpoBalancoHidricoOficial.jsx'
    ];

    for (const c of corposEsperados) {
      assert.ok(fs.existsSync(path.join(dirPrint, c)), `Módulo de impressão clínica não encontrado: ${c}`);
    }
  });

  test('Formulário PassagemForm.jsx foi modularizado (< 300 linhas) com seções em passagem-form/', () => {
    const formPath = path.join(SRC_DIR, 'pages', 'PassagemForm.jsx');
    assert.ok(fs.existsSync(formPath), 'PassagemForm.jsx deve existir');

    const linhas = fs.readFileSync(formPath, 'utf8').split(/\r?\n/).length;
    assert.ok(linhas < 300, `PassagemForm.jsx deve ter menos de 300 linhas (atual: ${linhas})`);

    const dirForm = path.join(SRC_DIR, 'pages', 'passagem-form');
    assert.ok(fs.existsSync(dirForm), 'Diretório passagem-form deve existir');

    const secoesEsperadas = [
      'constantes.js',
      'SimNao.jsx',
      'SecaoIdentificacao.jsx',
      'SecaoAssistencia.jsx',
      'SecaoTransferencia.jsx',
      'SecaoPendencias.jsx',
      'SecaoResumoProntuario.jsx',
      'index.js'
    ];

    for (const s of secoesEsperadas) {
      assert.ok(fs.existsSync(path.join(dirForm, s)), `Módulo de passagem não encontrado: ${s}`);
    }
  });

  test('Página CadastroPacientes.jsx foi modularizada (< 150 linhas) com submódulos em cadastro-pacientes/', () => {
    const cadastroPath = path.join(SRC_DIR, 'pages', 'CadastroPacientes.jsx');
    assert.ok(fs.existsSync(cadastroPath), 'CadastroPacientes.jsx deve existir');

    const linhas = fs.readFileSync(cadastroPath, 'utf8').split(/\r?\n/).length;
    assert.ok(linhas < 150, `CadastroPacientes.jsx deve ter menos de 150 linhas (atual: ${linhas})`);

    const dirCadastro = path.join(SRC_DIR, 'pages', 'cadastro-pacientes');
    assert.ok(fs.existsSync(dirCadastro), 'Diretório cadastro-pacientes deve existir');

    const modulosEsperados = [
      'constantes.js',
      'CamposIdentidade.jsx',
      'CamposAtendimento.jsx',
      'AbaDesfecho.jsx',
      'AbaDuplicatas.jsx',
      'AbaBusca.jsx',
      'AbaFormNovo.jsx',
      'index.js'
    ];

    for (const m of modulosEsperados) {
      assert.ok(fs.existsSync(path.join(dirCadastro, m)), `Submódulo de cadastro de paciente não encontrado: ${m}`);
    }
  });

  test('Página Painel.jsx foi modularizada (< 180 linhas) com submódulos em painel/', () => {
    const painelPath = path.join(SRC_DIR, 'pages', 'Painel.jsx');
    assert.ok(fs.existsSync(painelPath), 'Painel.jsx deve existir');

    const linhas = fs.readFileSync(painelPath, 'utf8').split(/\r?\n/).length;
    assert.ok(linhas < 180, `Painel.jsx deve ter menos de 180 linhas (atual: ${linhas})`);

    const dirPainel = path.join(SRC_DIR, 'pages', 'painel');
    assert.ok(fs.existsSync(dirPainel), 'Diretório painel deve existir');

    const modulosEsperados = [
      'constantes.js',
      'ModalInternar.jsx',
      'PainelTabela.jsx',
      'PainelCards.jsx',
      'usePainelState.js',
      'index.js'
    ];

    for (const m of modulosEsperados) {
      assert.ok(fs.existsSync(path.join(dirPainel, m)), `Submódulo do painel não encontrado: ${m}`);
    }
  });

  test('Folha de Estilos PrintView.css foi modularizada (< 30 linhas) com submódulos em print/', () => {
    const cssPath = path.join(SRC_DIR, 'pages', 'PrintView.css');
    assert.ok(fs.existsSync(cssPath), 'PrintView.css deve existir');

    const linhas = fs.readFileSync(cssPath, 'utf8').split(/\r?\n/).length;
    assert.ok(linhas < 30, `PrintView.css deve ter menos de 30 linhas (atual: ${linhas})`);

    const dirPrint = path.join(SRC_DIR, 'pages', 'print');
    assert.ok(fs.existsSync(dirPrint), 'Diretório print deve existir');

    const modulosEsperados = [
      'print-base.css',
      'print-sus-base.css',
      'print-admissao.css',
      'print-plano-alta.css',
      'print-prescricao.css',
      'print-sangue-atm-tfd.css',
      'print-receituario.css',
      'print-enfermagem.css'
    ];

    for (const m of modulosEsperados) {
      const arquivo = path.join(dirPrint, m);
      assert.ok(fs.existsSync(arquivo), `Submódulo CSS de impressão não encontrado: ${m}`);
      const stat = fs.statSync(arquivo);
      assert.ok(stat.size > 500, `Submódulo CSS ${m} parece vazio ou corrompido (${stat.size} bytes)`);
    }
  });

  test('Todas as constantes clínicas e médicas vazias estão devidamente exportadas em constantes.js', () => {
    const medConstPath = path.join(SRC_DIR, 'pages', 'ficha-medica', 'constantes.js');
    const clinConstPath = path.join(SRC_DIR, 'pages', 'ficha-clinica', 'constantes.js');

    assert.ok(fs.existsSync(medConstPath), 'constantes.js em ficha-medica deve existir');
    assert.ok(fs.existsSync(clinConstPath), 'constantes.js em ficha-clinica deve existir');

    const medContent = fs.readFileSync(medConstPath, 'utf8');
    const clinContent = fs.readFileSync(clinConstPath, 'utf8');

    const medEsperados = ['AIH_VAZIA', 'APAC_VAZIA', 'ATM_VAZIA', 'CONSULTA_VAZIA', 'EVOLUCAO_VAZIA', 'SANGUE_VAZIA', 'TFD_VAZIA', 'VINCULO_PREVIDENCIA_OPCOES'];
    for (const k of medEsperados) {
      assert.ok(medContent.includes(k), `Constante médica obrigatória ausente em constantes.js: ${k}`);
    }

    const clinEsperados = ['SV_VAZIO', 'VIAS_ENTRADA', 'VIAS_SAIDA', 'TIPOS_ISOLAMENTO', 'NIVEIS_CONSCIENCIA', 'BRADEN_CAMPOS', 'MORSE_CAMPOS'];
    for (const k of clinEsperados) {
      assert.ok(clinContent.includes(k), `Constante clínica obrigatória ausente em constantes.js: ${k}`);
    }
  });
}




