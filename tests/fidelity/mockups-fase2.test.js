import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MOCKUPS_DIR = path.resolve(process.cwd(), 'mockups-fase2');

const MOCKUPS_CORE = [
  '01-painel-leitos-design.html',
  '02-recepcao-design.html',
  '03-prontuario-medico-design.html',
  '04-prescricao-medica-design.html',
  '05-receituario-alta-design.html',
  '06-anamnese-admissao-design.html',
  '07-plano-terapeutico-design.html',
  '08-admissao-enfermagem-design.html',
  '09-evolucao-enfermagem-sae-design.html',
  '10-checagem-aprazamento-design.html',
  '11-balanco-hidrico-design.html',
  '12-passagem-plantao-design.html',
  '13-nota-intercorrencia-enfermagem-design.html',
  '14-transferencia-paciente-design.html',
  '15-solicitacao-hemoterapia-design.html',
  '16-solicitacao-exames-apac-design.html',
];

export function runMockupsFase2Tests(test) {
  test('Todos os mockups centrais de design da Fase 2 existem e são válidos', () => {
    assert.ok(fs.existsSync(MOCKUPS_DIR), 'Pasta mockups-fase2 deve existir');

    for (const mockup of MOCKUPS_CORE) {
      const caminho = path.join(MOCKUPS_DIR, mockup);
      assert.ok(fs.existsSync(caminho), `Mockup oficial não encontrado: ${mockup}`);
      const stat = fs.statSync(caminho);
      assert.ok(stat.size > 5000, `Mockup ${mockup} está anormalmente pequeno (${stat.size} bytes)`);

      const conteudo = fs.readFileSync(caminho, 'utf8');
      assert.ok(/<!doctype html>/i.test(conteudo), `Mockup ${mockup} deve iniciar com <!DOCTYPE html>`);
      assert.ok(/<html/i.test(conteudo), `Mockup ${mockup} deve conter elemento html`);
    }
  });

  test('Mockup 16 (Exames & APAC) contém isolamento das 4 modalidades e protocolos rápidos', () => {
    const caminho = path.join(MOCKUPS_DIR, '16-solicitacao-exames-apac-design.html');
    const conteudo = fs.readFileSync(caminho, 'utf8');

    // Modalidades com bloqueio mútuo
    assert.ok(conteudo.includes('btn-mod-lab'), 'Deve conter modalidade de Laboratório');
    assert.ok(conteudo.includes('btn-mod-img'), 'Deve conter modalidade de Imagem RX');
    assert.ok(conteudo.includes('btn-mod-ecg'), 'Deve conter modalidade de ECG');
    assert.ok(conteudo.includes('btn-mod-apac'), 'Deve conter modalidade de APAC');

    // Bundles rápidos
    assert.ok(conteudo.includes('applyQuickBundle'), 'Deve conter função de protocolos rápidos');
    assert.ok(conteudo.includes('Bloqueio Mútuo') || conteudo.includes('Guia Ativa'), 'Deve conter conceito de bloqueio mútuo');
  });

  test('Mockup 08 (Admissão de Enfermagem) contém as seções clínicas padronizadas da UPA', () => {
    const caminho = path.join(MOCKUPS_DIR, '08-admissao-enfermagem-design.html');
    const conteudo = fs.readFileSync(caminho, 'utf8');

    assert.ok(conteudo.includes('Admissão de Enfermagem') || conteudo.includes('ADMISSÃO'), 'Deve ser admissão de enfermagem');
    assert.ok(conteudo.includes('Histórico') || conteudo.includes('Sinais Vitais') || conteudo.includes('Exame Físico'), 'Deve conter histórico/sinais vitais');
  });

  test('Mockup 15 (Hemoterapia) contém especificações da Fundação Hemopa', () => {
    const caminho = path.join(MOCKUPS_DIR, '15-solicitacao-hemoterapia-design.html');
    const conteudo = fs.readFileSync(caminho, 'utf8');

    assert.ok(
      conteudo.includes('HEMOPA') || conteudo.includes('Hemoterápicos') || conteudo.includes('Transfusional'),
      'Mockup 15 deve contemplar requisição de transfusão e hemocomponentes'
    );
  });
}
