import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MODELOS_DIR = path.resolve(process.cwd(), 'modelos_impressao_html');

const MODELOS_ESPERADOS = [
  '01-admissao-enfermagem.html',
  '02-evolucao-enfermagem-sae.html',
  '03-transferencia-paciente-sbar.html',
  '04-nota-intercorrencia-enfermagem.html',
  '05-balanco-hidrico-24h.html',
  '06-prescricao-medica.html',
  '07-evolucao-medica-diaria.html',
  '08-sumario-de-alta.html',
  '09-nota-intercorrencia-medica.html',
  '10-consulta-admissao-medica.html',
  '11-formulario-antimicrobiano-atm.html',
  '12-plano-terapeutico.html',
  '13-tratamento-fora-domicilio-tfd.html',
  '14-receituario-medico-2vias.html',
  '15-passagem-plantao-coletiva.html',
  '16-laudo-aih-internacao.html',
  '17-solicitacao-hemoterapicos.html',
  '18-laudo-apac-procedimento-ambulatorial.html',
  '19-solicitacao-exames-laboratoriais.html',
  '20-solicitacao-exames-imagem-rx.html',
  '21-solicitacao-eletrocardiograma-ecg.html',
];

export function runModelosImpressaoTests(test) {
  test('Todos os 21 modelos oficiais de impressão HTML existem na pasta modelos_impressao_html/', () => {
    assert.ok(fs.existsSync(MODELOS_DIR), 'Pasta modelos_impressao_html deve existir');

    for (const arquivo of MODELOS_ESPERADOS) {
      const caminho = path.join(MODELOS_DIR, arquivo);
      assert.ok(fs.existsSync(caminho), `Modelo oficial obrigatório não encontrado: ${arquivo}`);
      const stat = fs.statSync(caminho);
      assert.ok(stat.size > 1000, `Arquivo ${arquivo} parece corrompido ou vazio (tamanho: ${stat.size} bytes)`);
    }
  });

  test('Todos os 21 modelos possuem regras de formatação para impressão em folha física', () => {
    for (const arquivo of MODELOS_ESPERADOS) {
      const caminho = path.join(MODELOS_DIR, arquivo);
      const conteudo = fs.readFileSync(caminho, 'utf8');

      const temMediaPrint = /@media\s+print/i.test(conteudo) || /@page/i.test(conteudo) || /print/i.test(conteudo);
      assert.ok(temMediaPrint, `Modelo ${arquivo} deve conter regras de estilização para impressão`);

      const temIdentificacaoHospitalar =
        /BREVES/i.test(conteudo) ||
        /UPA/i.test(conteudo) ||
        /SUS/i.test(conteudo) ||
        /SECRETARIA/i.test(conteudo);
      assert.ok(temIdentificacaoHospitalar, `Modelo ${arquivo} deve conter identificação institucional oficial`);
    }
  });

  test('Modelo 18 (APAC) possui integração com os 52 campos SUS via localStorage', () => {
    const caminho = path.join(MODELOS_DIR, '18-laudo-apac-procedimento-ambulatorial.html');
    const conteudo = fs.readFileSync(caminho, 'utf8');

    assert.ok(
      conteudo.includes('requisicao_apac_dados'),
      'Modelo 18 deve ler a chave requisicao_apac_dados do localStorage'
    );
    assert.ok(
      conteudo.includes('APAC') && conteudo.includes('PROCEDIMENTO AMBULATORIAL'),
      'Modelo 18 deve conter o título oficial do laudo APAC'
    );
    assert.ok(
      conteudo.includes('0296796') || conteudo.includes('CNES'),
      'Modelo 18 deve conter o CNES oficial da UPA 24h Breves'
    );
  });

  test('Modelos de Exames 19 (Laboratório), 20 (Imagem RX) e 21 (ECG) possuem separação e integração dinâmica', () => {
    const m19 = fs.readFileSync(path.join(MODELOS_DIR, '19-solicitacao-exames-laboratoriais.html'), 'utf8');
    const m20 = fs.readFileSync(path.join(MODELOS_DIR, '20-solicitacao-exames-imagem-rx.html'), 'utf8');
    const m21 = fs.readFileSync(path.join(MODELOS_DIR, '21-solicitacao-eletrocardiograma-ecg.html'), 'utf8');

    // M19 - Laboratório
    assert.ok(
      m19.includes('requisicao_lab_selecionados'),
      'M19 deve ler requisicao_lab_selecionados do localStorage'
    );
    assert.ok(m19.includes('LABORAT') || m19.includes('Laboratoriais'), 'M19 deve ter título de laboratório');

    // M20 - Radiologia / RX
    assert.ok(
      m20.includes('requisicao_img_selecionados'),
      'M20 deve ler requisicao_img_selecionados do localStorage'
    );
    assert.ok(m20.includes('RADIOLOGIA') || m20.includes('RAIO-X') || m20.includes('IMAGEM'), 'M20 deve ter foco em imagem/RX');

    // M21 - Eletrocardiograma (ECG)
    assert.ok(
      m21.includes('requisicao_ecg_selecionados'),
      'M21 deve ler requisicao_ecg_selecionados do localStorage'
    );
    assert.ok(m21.includes('ELETROCARDIOGRAMA') || m21.includes('ECG'), 'M21 deve ter foco em eletrocardiograma');
  });

  test('Modelo 14 (Receituário Médico) possui estrutura de 2 vias oficiais', () => {
    const m14 = fs.readFileSync(path.join(MODELOS_DIR, '14-receituario-medico-2vias.html'), 'utf8');
    assert.ok(m14.includes('1ª VIA') || m14.includes('FARMÁCIA') || m14.includes('Via'), 'M14 deve indicar as vias');
    assert.ok(m14.includes('RECEITUÁRIO') || m14.includes('Receituário'), 'M14 deve ser receituário médico');
  });

  test('Modelo 16 (AIH) possui layout de solicitação de internação hospitalar oficial do SUS', () => {
    const m16 = fs.readFileSync(path.join(MODELOS_DIR, '16-laudo-aih-internacao.html'), 'utf8');
    assert.ok(m16.includes('AIH') || m16.includes('Internação Hospitalar'), 'M16 deve conter AIH / Internação Hospitalar');
    assert.ok(m16.includes('AUTORIZAÇÃO') || m16.includes('Autorização'), 'M16 deve conter título da AIH');
  });
}
