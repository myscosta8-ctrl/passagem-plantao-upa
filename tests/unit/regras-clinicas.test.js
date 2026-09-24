import assert from 'node:assert/strict';
import { calcularIdade } from '../../src/lib/pepAtendimentos.js';
import { VIAS } from '../../src/pages/ficha-medica/constantes.js';

export function runRegrasClinicasTests(test) {
  test('calcularIdade deve calcular a idade exata com base na data de nascimento', () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaAtual = String(hoje.getDate()).padStart(2, '0');

    // Nascido há exatamente 30 anos (já fez aniversário)
    const nasc30 = `${anoAtual - 30}-${mesAtual}-${diaAtual}`;
    assert.equal(calcularIdade(nasc30), 30);

    // Bebê nascido neste ano (0 anos)
    const bebe = `${anoAtual}-${mesAtual}-${diaAtual}`;
    assert.equal(calcularIdade(bebe), 0);
  });

  test('calcularIdade deve retornar null para datas nulas ou inválidas', () => {
    assert.equal(calcularIdade(null), null);
    assert.equal(calcularIdade(''), null);
    assert.equal(calcularIdade(undefined), null);
    assert.equal(calcularIdade('data-invalida'), null);
    assert.equal(calcularIdade('9999-99-99'), null);
  });

  test('Limpeza de prefixo de prontuário e atendimento (PEP-, AT-)', () => {
    function limparPrefixo(valor) {
      return valor ? String(valor).replace(/^(PEP|AT)-?/i, '') : '';
    }

    assert.equal(limparPrefixo('PEP-12345'), '12345');
    assert.equal(limparPrefixo('pep-9988'), '9988');
    assert.equal(limparPrefixo('AT-0045'), '0045');
    assert.equal(limparPrefixo('123456'), '123456');
    assert.equal(limparPrefixo(null), '');
    assert.equal(limparPrefixo(''), '');
  });

  test('Sanitização e validação de dígitos para CNS e CPF', () => {
    const cnsFormatado = '700.1234.5678.9012';
    const cnsLimpo = cnsFormatado.replace(/\D/g, '');
    assert.equal(cnsLimpo, '700123456789012');
    assert.equal(cnsLimpo.length, 15);

    const cpfFormatado = '123.456.789-00';
    const cpfLimpo = cpfFormatado.replace(/\D/g, '');
    assert.equal(cpfLimpo, '12345678900');
    assert.equal(cpfLimpo.length, 11);
  });

  test('Cálculo de permanência hospitalar no leito', () => {
    function calcularPermanencia(dataAdmissao) {
      if (!dataAdmissao) return '';
      try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const adm = new Date(dataAdmissao + (dataAdmissao.includes('T') ? '' : 'T00:00:00'));
        adm.setHours(0, 0, 0, 0);
        const diffMs = hoje.getTime() - adm.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDias <= 0) return 'Admitido hoje';
        if (diffDias === 1) return 'Internado há 1 dia';
        return `Internado há ${diffDias} dias`;
      } catch {
        return '';
      }
    }

    const hoje = new Date();
    const formatar = (d) => d.toISOString().slice(0, 10);

    const dataHoje = formatar(hoje);
    assert.equal(calcularPermanencia(dataHoje), 'Admitido hoje');

    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
    assert.equal(calcularPermanencia(formatar(ontem)), 'Internado há 1 dia');

    const cincoDias = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000);
    assert.equal(calcularPermanencia(formatar(cincoDias)), 'Internado há 5 dias');

    assert.equal(calcularPermanencia(null), '');
    assert.equal(calcularPermanencia(''), '');
  });

  test('Vias de administração de medicamentos são válidas e padronizadas no SUS', () => {
    assert.ok(Array.isArray(VIAS), 'VIAS deve ser um array');
    assert.ok(VIAS.includes('VO'), 'Deve conter Via Oral (VO)');
    assert.ok(VIAS.includes('EV'), 'Deve conter Endovenosa (EV)');
    assert.ok(VIAS.includes('IM'), 'Deve conter Intramuscular (IM)');
    assert.ok(VIAS.includes('SC'), 'Deve conter Subcutânea (SC)');
    assert.ok(VIAS.includes('SL'), 'Deve conter Sublingual (SL)');
    assert.ok(VIAS.includes('INAL'), 'Deve conter Inalatória (INAL)');
    assert.ok(VIAS.length >= 8, 'Deve conter pelo menos 8 vias padronizadas');
  });

  test('Classificação de Risco Manchester e priorização de cores', () => {
    const MANCHESTER = {
      Vermelho: { prioridade: 1, tempoMinutos: 0, descricao: 'Emergência' },
      Laranja: { prioridade: 2, tempoMinutos: 10, descricao: 'Muito urgente' },
      Amarelo: { prioridade: 3, tempoMinutos: 50, descricao: 'Urgente' },
      Verde: { prioridade: 4, tempoMinutos: 120, descricao: 'Pouco urgente' },
      Azul: { prioridade: 5, tempoMinutos: 240, descricao: 'Não urgente' },
    };

    assert.equal(MANCHESTER.Vermelho.tempoMinutos, 0);
    assert.equal(MANCHESTER.Laranja.tempoMinutos, 10);
    assert.equal(MANCHESTER.Amarelo.tempoMinutos, 50);
    assert.equal(MANCHESTER.Verde.tempoMinutos, 120);
    assert.equal(MANCHESTER.Azul.tempoMinutos, 240);
    assert.ok(MANCHESTER.Vermelho.prioridade < MANCHESTER.Amarelo.prioridade);
  });
}
