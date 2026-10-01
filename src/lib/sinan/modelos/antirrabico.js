// Ficha de Investigação — Atendimento Antirrábico Humano (Sinan NET, SVS 27/09/2005) — anti_rabico_v5.pdf
import { SIM_NAO_IGN, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 445.6, y: 728.7, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 52.2, y: 700.5, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 96, y: 701, w: 384, h: 10 },
  ibge_notificacao: pente(0, [487.6, 502.1, 516.6, 531.0, 545.5], 698.5),
  unidade_notificadora: { p: 0, x: 67, y: 671, w: 265, h: 10 },
  cnes: pente(0, [348.2, 362.7, 377.1, 391.6, 406.0, 420.5], 670),
  data_primeiros_sintomas: { p: 0, x: 442.7, y: 672.5, w: 115.2, h: 11.9 },
  nome: { p: 0, x: 67, y: 643, w: 372, h: 10 },
  data_nascimento: { p: 0, x: 446.4, y: 641.9, w: 113.6, h: 11.9 },
  idade: pente(0, [73.7, 87.3], 612, 9),
  unidade_idade: { p: 0, x: 108.7, y: 619.4, w: 11, h: 11 },
  sexo: { p: 0, x: 231.4, y: 626.6, w: 11, h: 11 },
  gestante: { p: 0, x: 426.0, y: 626.6, w: 11, h: 11 },
  raca: { p: 0, x: 550.8, y: 625.9, w: 11, h: 11 },
  escolaridade: { p: 0, x: 551.5, y: 596.9, w: 11, h: 11 },
  cns: { p: 0, x: 52.7, y: 551.4, w: 175.3, h: 12 },
  nome_mae: { p: 0, x: 245, y: 552, w: 320, h: 10 },
  uf_residencia: { p: 0, x: 52.3, y: 521.3, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 521, w: 230, h: 10 },
  ibge_residencia: pente(0, [336.1, 350.5, 365.0, 379.5, 393.9], 521),
  distrito: { p: 0, x: 425, y: 521, w: 140, h: 10 },
  bairro: { p: 0, x: 56, y: 496, w: 140, h: 10 },
  logradouro: { p: 0, x: 205, y: 496, w: 268, h: 10 },
  logradouro_codigo: pente(0, [489.9, 504.3, 518.7, 533.1, 547.5], 494),
  numero: { p: 0, x: 56, y: 472, w: 54, h: 10 },
  complemento: { p: 0, x: 120, y: 472, w: 290, h: 10 },
  geo1: { p: 0, x: 421, y: 472, w: 144, h: 10 },
  geo2: { p: 0, x: 56, y: 446, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 227, y: 446, w: 218, h: 10 },
  cep: { p: 0, x: 453.9, y: 444.0, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 52.7, y: 419.7, w: 148.1, h: 12.3 },
  zona: { p: 0, x: 331.4, y: 431.8, w: 11, h: 11 },
  pais: { p: 0, x: 366, y: 421, w: 199, h: 10 },
}

const cx = (p, x, y) => ({ p, x, y, w: 11, h: 11 })
const sni = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa, larg: 2, ...extra })
const SIM_NAO = [['1', 'Sim'], ['2', 'Não']]
const ESPECIE = [['1', 'Canina'], ['2', 'Felina'], ['3', 'Quiróptera (morcego)'], ['4', 'Primata (macaco)'], ['5', 'Raposa'], ['6', 'Herbívoro doméstico (especificar)'], ['7', 'Outra (especificar)']]
const doses = (n, y) => ({ n: '47', chave: `data_dose_${n}`, rotulo: `Data da ${n}ª dose (dia e mês)`, tipo: 'data', formato: 'ddmm', caixa: { p: 1, x: y, y: 761.5, w: 56.7, h: 13.2 }, larg: 2 })
const interrompeu = (d) => d.interrupcao === '1'
const soro = (d) => d.indicacao_soro === '1'

export default {
  id: 'ANTIRRABICO',
  titulo: 'Ficha de Investigação — Atendimento Antirrábico Humano',
  arquivo: 'anti_rabico_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g, { rotulo7: 'Data do atendimento' }),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        { n: '31', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 66, y: 372, w: 500, h: 10 }, larg: 12 },
        sni('32', 'exp_contato_indireto', 'Exposição: contato indireto', cx(0, 190.3, 347.3), {}),
        sni('32', 'exp_arranhadura', 'Exposição: arranhadura', cx(0, 268.6, 348.0), {}),
        sni('32', 'exp_lambedura', 'Exposição: lambedura', cx(0, 337.2, 348.0), {}),
        sni('32', 'exp_mordedura', 'Exposição: mordedura', cx(0, 401.8, 348.0), {}),
        sni('32', 'exp_outro', 'Exposição: outro', cx(0, 464.6, 348.0), {}),
        ...[['mucosa', 'Mucosa', 187.2, 318.5], ['cabeca', 'Cabeça/pescoço', 231.1, 319.2], ['maos', 'Mãos/pés', 306.2, 319.9], ['tronco', 'Tronco', 357.8, 319.2], ['msup', 'Membros superiores', 398.6, 319.9], ['minf', 'Membros inferiores', 486.0, 319.2]]
          .map(([k, r, x, y]) => ({ n: '33', chave: `loc_${k}`, rotulo: `Localização: ${r}`, tipo: 'codigo', opcoes: [['1', 'Sim'], ['2', 'Não'], ['3', 'Desconhecida']], caixa: cx(0, x, y), larg: 2 })),
        { n: '34', chave: 'ferimento', rotulo: 'Ferimento', tipo: 'codigo', opcoes: [['1', 'Único'], ['2', 'Múltiplo'], ['3', 'Sem ferimento'], ['9', 'Ignorado']], caixa: cx(0, 201.4, 297.1), larg: 3 },
        sni('35', 'fer_profundo', 'Tipo de ferimento: profundo', cx(0, 354.0, 287.3), { quando: (d) => ['1', '2'].includes(d.ferimento) }),
        sni('35', 'fer_superficial', 'Tipo de ferimento: superficial', cx(0, 422.6, 287.3), { quando: (d) => ['1', '2'].includes(d.ferimento) }),
        sni('35', 'fer_dilacerante', 'Tipo de ferimento: dilacerante', cx(0, 487.4, 288.0), { quando: (d) => ['1', '2'].includes(d.ferimento) }),
        { n: '36', chave: 'data_exposicao', rotulo: 'Data da exposição', tipo: 'data', caixa: { p: 0, x: 60.0, y: 254.8, w: 112.5, h: 11.9 }, larg: 3 },
        sni('37', 'antec_pre', 'Antecedente de tratamento: pré-exposição', cx(0, 351.6, 257.5), { larg: 3 }),
        sni('37', 'antec_pos', 'Antecedente de tratamento: pós-exposição', cx(0, 479.8, 257.5), { larg: 3 }),
        { n: '38', chave: 'antec_concluido', rotulo: 'Se houve, quando foi concluído?', tipo: 'codigo', opcoes: [['1', 'Até 90 dias'], ['2', 'Após 90 dias']], caixa: cx(0, 296.2, 238.8), larg: 3, quando: (d) => d.antec_pre === '1' || d.antec_pos === '1' },
        { n: '39', chave: 'antec_doses', rotulo: 'Nº de doses aplicadas', tipo: 'digitos', digitos: 2, caixa: pente(0, [519.9, 534.3], 226.5), larg: 2, quando: (d) => d.antec_pre === '1' || d.antec_pos === '1' },
        { n: '40', chave: 'especie_animal', rotulo: 'Espécie do animal agressor', tipo: 'codigo', opcoes: ESPECIE, caixa: cx(0, 549.6, 214.1), larg: 4 },
        { n: '40', chave: 'especie_herbivoro', rotulo: 'Herbívoro doméstico (especificar)', tipo: 'texto', caixa: { p: 0, x: 368, y: 204.5, w: 60, h: 8 }, fonte: 7, larg: 4, quando: (d) => d.especie_animal === '6' },
        { n: '40', chave: 'especie_outra', rotulo: 'Outra espécie (especificar)', tipo: 'texto', caixa: { p: 0, x: 462, y: 204.5, w: 96, h: 8 }, fonte: 7, larg: 4, quando: (d) => d.especie_animal === '7' },
        { n: '41', chave: 'condicao_animal', rotulo: 'Condição do animal para fins de conduta do tratamento', tipo: 'codigo', opcoes: [['1', 'Sadio'], ['2', 'Suspeito'], ['3', 'Raivoso'], ['4', 'Morto/desaparecido']], caixa: cx(0, 286.3, 184.3), larg: 6 },
        { n: '42', chave: 'animal_observacao', rotulo: 'Animal passível de observação? (só cão ou gato)', tipo: 'codigo', opcoes: SIM_NAO, caixa: cx(0, 552.0, 185.3), larg: 6, quando: (d) => ['1', '2'].includes(d.especie_animal) },
      ],
    },
    {
      titulo: 'Tratamento atual',
      campos: [
        { n: '43', chave: 'tratamento_indicado', rotulo: 'Tratamento indicado', tipo: 'codigo', opcoes: [['1', 'Pré-exposição'], ['2', 'Dispensa de tratamento'], ['3', 'Observação do animal (se cão ou gato)'], ['4', 'Observação + vacina'], ['5', 'Vacina'], ['6', 'Soro + vacina'], ['7', 'Esquema de reexposição']], caixa: cx(0, 554.6, 147.4), larg: 6 },
        { n: '44', chave: 'lab_vacina', rotulo: 'Laboratório produtor da vacina', tipo: 'codigo', opcoes: [['1', 'Instituto Butantan'], ['2', 'Instituto Vital Brasil'], ['3', 'Aventis Pasteur'], ['4', 'Outro (especificar)']], caixa: cx(0, 556.3, 112.1), larg: 3 },
        { n: '44', chave: 'lab_vacina_outro', rotulo: 'Outro laboratório (especificar)', tipo: 'texto', caixa: { p: 0, x: 452, y: 101.5, w: 108, h: 8 }, fonte: 7, larg: 3, quando: (d) => d.lab_vacina === '4' },
        { n: '45', chave: 'lote_vacina', rotulo: 'Número do lote', tipo: 'texto', caixa: { p: 0, x: 66, y: 70, w: 290, h: 10 }, larg: 3 },
        { n: '46', chave: 'vencimento_vacina', rotulo: 'Data do vencimento', tipo: 'data', caixa: { p: 0, x: 462.6, y: 69.0, w: 101.4, h: 10.5 }, larg: 3 },
        doses(1, 70.2), doses(2, 158.0), doses(3, 247.1), doses(4, 334.9), doses(5, 422.7),
        { n: '48', chave: 'condicao_final_animal', rotulo: 'Condição final do animal (após período de observação)', tipo: 'codigo', opcoes: [['1', 'Negativo para raiva (clínica)'], ['2', 'Negativo para raiva (laboratório)'], ['3', 'Positivo para raiva (clínica)'], ['4', 'Positivo para raiva (laboratório)'], ['5', 'Morto/sacrificado/sem diagnóstico'], ['9', 'Ignorado']], caixa: cx(1, 549.1, 741.6), larg: 6 },
        { n: '49', chave: 'interrupcao', rotulo: 'Houve interrupção do tratamento?', tipo: 'codigo', opcoes: SIM_NAO, caixa: cx(1, 201.1, 699.6), larg: 3 },
        { n: '50', chave: 'motivo_interrupcao', rotulo: 'Motivo da interrupção', tipo: 'codigo', opcoes: [['1', 'Indicação da unidade de saúde'], ['2', 'Abandono'], ['3', 'Transferência']], caixa: cx(1, 546.7, 697.4), larg: 3, quando: interrompeu },
        { n: '51', chave: 'abandono_busca', rotulo: 'Se houve abandono, a unidade procurou o paciente?', tipo: 'codigo', opcoes: SIM_NAO, caixa: cx(1, 405.4, 658.6), larg: 3, quando: (d) => d.motivo_interrupcao === '2' },
        sni('52', 'evento_adverso_vacina', 'Evento adverso à vacina', cx(1, 558.0, 664.6), { larg: 3 }),
        sni('53', 'indicacao_soro', 'Indicação do soro antirrábico', cx(1, 195.6, 629.3), { larg: 3 }),
        { n: '54', chave: 'peso', rotulo: 'Peso do paciente (kg)', tipo: 'digitos', digitos: 3, caixa: pente(1, [256.2, 268.9], 607.5, 9), larg: 2, quando: soro },
        { n: '55', chave: 'soro_ml', rotulo: 'Quantidade de soro aplicada (ml)', tipo: 'digitos', digitos: 3, caixa: pente(1, [357.1, 369.9], 608.5, 9), larg: 2, quando: soro },
        { n: '55', chave: 'soro_tipo', rotulo: 'Tipo de soro', tipo: 'codigo', opcoes: [['1', 'Heterólogo'], ['2', 'Homólogo']], caixa: cx(1, 548.4, 630.0), larg: 2, quando: soro },
        { n: '56', chave: 'infiltracao_total', rotulo: 'Infiltração no(s) local(is) do(s) ferimento(s): total', tipo: 'codigo', opcoes: SIM_NAO, caixa: cx(1, 174.5, 574.3), larg: 3, quando: soro },
        { n: '56', chave: 'infiltracao_parcial', rotulo: 'Infiltração no(s) local(is) do(s) ferimento(s): parcial', tipo: 'codigo', opcoes: SIM_NAO, caixa: cx(1, 225.6, 574.3), larg: 3, quando: soro },
        { n: '57', chave: 'lab_soro', rotulo: 'Laboratório produtor do soro', tipo: 'codigo', opcoes: [['1', 'Instituto Butantan'], ['2', 'Instituto Vital Brasil'], ['3', 'Aventis Pasteur'], ['4', 'Outro (especificar)']], caixa: cx(1, 548.2, 590.4), larg: 3, quando: soro },
        { n: '57', chave: 'lab_soro_outro', rotulo: 'Outro laboratório (especificar)', tipo: 'texto', caixa: { p: 1, x: 490, y: 571.5, w: 74, h: 8 }, fonte: 6, larg: 3, quando: (d) => soro(d) && d.lab_soro === '4' },
        { n: '58', chave: 'partida_soro', rotulo: 'Número da partida', tipo: 'digitos', alfa: true, digitos: 10, caixa: { p: 1, x: 53, y: 537.5, w: 144.7, h: 10 }, larg: 3, quando: soro },
        sni('59', 'evento_adverso_soro', 'Evento adverso ao soro antirrábico', cx(1, 352.3, 544.6), { larg: 3, quando: soro }),
        { n: '60', chave: 'data_encerramento', rotulo: 'Data do encerramento do caso', tipo: 'data', caixa: { p: 1, x: 378.8, y: 537.3, w: 115.2, h: 12 }, larg: 3 },
        { n: '', chave: 'observacoes', rotulo: 'Observações', tipo: 'texto_longo', linhas: [510.2, 498.4, 487.1, 475.5, 463.7, 451.9, 440.1, 428.3, 416.5, 404.7, 392.9, 381.0, 369.3, 357.5, 345.6, 333.9].map((y) => ({ p: 1, x: 32.2, y, w: 536.9, h: 11.6 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 70, y: 299, w: 390, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Cód. da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [476.6, 486.0, 495.4, 504.9, 514.3, 523.7], 297), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 70, y: 267, w: 185, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 270, y: 267, w: 195, h: 10 }, larg: 6 },
      ],
    },
  ],
}
