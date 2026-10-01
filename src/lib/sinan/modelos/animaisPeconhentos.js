// Ficha de Investigação — Acidentes por Animais Peçonhentos (Sinan NET, SVS 19/01/2006) — Animais_Peconhentos_v5.pdf
import { SIM_NAO_IGN, ZONA, cabecalhoInvestigacao, pente } from './comum'

const g = {
  data_notificacao: { p: 0, x: 444.0, y: 689.0, w: 115.2, h: 11.9 },
  uf_notificacao: { p: 0, x: 50.7, y: 660.8, w: 26.9, h: 11.8 },
  municipio_notificacao: { p: 0, x: 94, y: 661, w: 384, h: 10 },
  ibge_notificacao: pente(0, [486.1, 500.6, 515.1, 529.5, 544.0], 659),
  unidade_notificadora: { p: 0, x: 65, y: 631, w: 265, h: 10 },
  cnes: pente(0, [346.7, 361.2, 375.6, 390.1, 404.5, 419.0], 631),
  data_primeiros_sintomas: { p: 0, x: 441.2, y: 632.7, w: 115.2, h: 12 },
  nome: { p: 0, x: 66, y: 603, w: 372, h: 10 },
  data_nascimento: { p: 0, x: 444.9, y: 602.2, w: 113.8, h: 11.9 },
  idade: pente(0, [72.2, 85.8], 572, 9),
  unidade_idade: { p: 0, x: 107.3, y: 579.6, w: 11, h: 11 },
  sexo: { p: 0, x: 229.9, y: 586.8, w: 10.8, h: 11 },
  gestante: { p: 0, x: 424.3, y: 586.8, w: 11, h: 11 },
  raca: { p: 0, x: 549.4, y: 586.1, w: 11, h: 11 },
  escolaridade: { p: 0, x: 549.8, y: 557.0, w: 11, h: 11 },
  cns: { p: 0, x: 51.2, y: 511.7, w: 175.3, h: 11.9 },
  nome_mae: { p: 0, x: 243, y: 513, w: 322, h: 10 },
  uf_residencia: { p: 0, x: 51.6, y: 481.5, w: 26.9, h: 11.8 },
  municipio_residencia: { p: 0, x: 92, y: 481, w: 230, h: 10 },
  ibge_residencia: pente(0, [335.4, 349.8, 364.3, 378.7, 393.2], 481),
  distrito: { p: 0, x: 424, y: 481, w: 141, h: 10 },
  bairro: { p: 0, x: 56, y: 456, w: 140, h: 10 },
  logradouro: { p: 0, x: 204, y: 456, w: 270, h: 10 },
  logradouro_codigo: pente(0, [489.2, 503.6, 518.0, 532.4, 546.8], 455),
  numero: { p: 0, x: 56, y: 432, w: 54, h: 10 },
  complemento: { p: 0, x: 119, y: 432, w: 290, h: 10 },
  geo1: { p: 0, x: 420, y: 432, w: 145, h: 10 },
  geo2: { p: 0, x: 56, y: 407, w: 160, h: 10 },
  ponto_referencia: { p: 0, x: 226, y: 407, w: 218, h: 10 },
  cep: { p: 0, x: 453.2, y: 404.3, w: 110.8, h: 11.9 },
  telefone: { p: 0, x: 52.0, y: 380.0, w: 148.1, h: 12.4 },
  zona: { p: 0, x: 330.7, y: 391.9, w: 11, h: 11 },
  pais: { p: 0, x: 366, y: 382, w: 199, h: 10 },
}

const cx = (p, x, y) => ({ p, x, y, w: 11, h: 11 })
const sni = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa, larg: 2, ...extra })
const amp = (chave, rotulo, x, y) => ({ n: '51', chave: `ampolas_${chave}`, rotulo: `Ampolas: ${rotulo}`, tipo: 'digitos', digitos: 2, caixa: { p: 1, x, y, w: 30, h: 10 }, larg: 2, quando: (d) => d.soroterapia === '1' })
const locSim = (d) => d.manifestacoes_locais === '1'
const sisSim = (d) => d.manifestacoes_sistemicas === '1'
const complLoc = (d) => d.complicacoes_locais === '1'
const complSis = (d) => d.complicacoes_sistemicas === '1'

export default {
  id: 'ANIMAIS_PECONHENTOS',
  titulo: 'Ficha de Investigação — Acidentes por Animais Peçonhentos',
  arquivo: 'Animais_Peconhentos_v5.pdf',
  secoes: [
    ...cabecalhoInvestigacao(g),
    {
      titulo: 'Antecedentes epidemiológicos',
      campos: [
        { n: '31', chave: 'data_investigacao', rotulo: 'Data da investigação', tipo: 'data', caixa: { p: 0, x: 57.4, y: 330.2, w: 111.4, h: 11.9 }, larg: 3 },
        { n: '32', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 186, y: 331, w: 258, h: 10 }, larg: 6 },
        { n: '33', chave: 'data_acidente', rotulo: 'Data do acidente', tipo: 'data', caixa: { p: 0, x: 453.5, y: 329.9, w: 100.3, h: 11.9 }, larg: 3 },
        { n: '34', chave: 'uf_ocorrencia', rotulo: 'UF de ocorrência', tipo: 'uf', caixa: { p: 0, x: 53.7, y: 302.3, w: 26.9, h: 11.8 }, larg: 1 },
        { n: '35', chave: 'municipio_ocorrencia', rotulo: 'Município de ocorrência do acidente', tipo: 'texto', caixa: { p: 0, x: 90, y: 300, w: 165, h: 9 }, fonte: 7.5, larg: 4 },
        { n: '35', chave: 'ibge_ocorrencia', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [275.4, 289.9, 304.3, 318.8, 333.3], 301), larg: 3 },
        { n: '36', chave: 'localidade_ocorrencia', rotulo: 'Localidade de ocorrência do acidente', tipo: 'texto', caixa: { p: 0, x: 369, y: 300, w: 196, h: 9 }, larg: 4 },
        { n: '37', chave: 'zona_ocorrencia', rotulo: 'Zona de ocorrência', tipo: 'codigo', opcoes: ZONA, caixa: cx(0, 228.2, 288.5), larg: 3 },
        { n: '38', chave: 'tempo_picada', rotulo: 'Tempo decorrido picada/atendimento', tipo: 'codigo', opcoes: [['1', '0 a 1h'], ['2', '1 a 3h'], ['3', '3 a 6h'], ['4', '6 a 12h'], ['5', '12 a 24h'], ['6', '24h ou mais'], ['9', 'Ignorado']], caixa: cx(0, 551.3, 286.8), larg: 3 },
        { n: '39', chave: 'local_picada', rotulo: 'Local da picada', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Cabeça'], ['02', 'Braço'], ['03', 'Antebraço'], ['04', 'Mão'], ['05', 'Dedo da mão'], ['06', 'Tronco'], ['07', 'Coxa'], ['08', 'Perna'], ['09', 'Pé'], ['10', 'Dedo do pé'], ['99', 'Ignorado']], caixa: { p: 0, x: 138.2, y: 253.7, w: 21.4, h: 11 }, larg: 3 },
      ],
    },
    {
      titulo: 'Dados clínicos',
      campos: [
        sni('40', 'manifestacoes_locais', 'Manifestações locais', cx(0, 175.0, 229.2), { larg: 3 }),
        sni('41', 'local_dor', 'Dor', cx(0, 209.8, 214.6), { quando: locSim }),
        sni('41', 'local_edema', 'Edema', cx(0, 249.4, 213.8), { quando: locSim }),
        sni('41', 'local_equimose', 'Equimose', cx(0, 303.4, 214.6), { quando: locSim }),
        sni('41', 'local_necrose', 'Necrose', cx(0, 362.2, 213.8), { quando: locSim }),
        sni('41', 'local_outras', 'Outras manifestações locais', cx(0, 425.3, 213.1), { quando: locSim }),
        { n: '41', chave: 'local_outras_espec', rotulo: 'Outras (especificar)', tipo: 'texto', caixa: { p: 0, x: 497, y: 207, w: 50, h: 8 }, fonte: 6, larg: 3, quando: (d) => locSim(d) && d.local_outras === '1' },
        sni('42', 'manifestacoes_sistemicas', 'Manifestações sistêmicas', cx(0, 120.0, 173.0), { larg: 3 }),
        sni('43', 'sis_neuroparaliticas', 'Neuroparalíticas (ptose palpebral, turvação visual)', cx(0, 152.9, 167.8), { larg: 3, quando: sisSim }),
        sni('43', 'sis_hemorragicas', 'Hemorrágicas (gengivorragia, outros sangramentos)', cx(0, 286.8, 175.9), { larg: 3, quando: sisSim }),
        sni('43', 'sis_vagais', 'Vagais (vômitos, diarreias)', cx(0, 408.2, 174.5), { larg: 3, quando: sisSim }),
        sni('43', 'sis_mioliticas', 'Miolíticas/hemolíticas (mialgia, anemia, urina escura)', cx(0, 153.1, 146.6), { larg: 3, quando: sisSim }),
        sni('43', 'sis_renais', 'Renais (oligúria/anúria)', cx(0, 288.2, 152.4), { larg: 3, quando: sisSim }),
        sni('43', 'sis_outras', 'Outras manifestações sistêmicas', cx(0, 408.0, 154.8), { larg: 3, quando: sisSim }),
        { n: '43', chave: 'sis_outras_espec', rotulo: 'Outras (especificar)', tipo: 'texto', caixa: { p: 0, x: 420, y: 141, w: 78, h: 8 }, fonte: 6, larg: 3, quando: (d) => sisSim(d) && d.sis_outras === '1' },
        { n: '44', chave: 'tempo_coagulacao', rotulo: 'Tempo de coagulação', tipo: 'codigo', opcoes: [['1', 'Normal'], ['2', 'Alterado'], ['9', 'Não realizado']], caixa: cx(0, 552.5, 169.7), larg: 3 },
      ],
    },
    {
      titulo: 'Dados do acidente',
      campos: [
        { n: '45', chave: 'tipo_acidente', rotulo: 'Tipo de acidente', tipo: 'codigo', opcoes: [['1', 'Serpente'], ['2', 'Aranha'], ['3', 'Escorpião'], ['4', 'Lagarta'], ['5', 'Abelha'], ['6', 'Outros'], ['9', 'Ignorado']], caixa: cx(0, 285.6, 123.6), larg: 3 },
        { n: '45', chave: 'tipo_acidente_outro', rotulo: 'Outros (especificar)', tipo: 'texto', caixa: { p: 0, x: 177, y: 107.5, w: 48, h: 8 }, fonte: 6, larg: 3, quando: (d) => d.tipo_acidente === '6' },
        { n: '46', chave: 'serpente', rotulo: 'Serpente — tipo de acidente', tipo: 'codigo', opcoes: [['1', 'Botrópico'], ['2', 'Crotálico'], ['3', 'Elapídico'], ['4', 'Laquético'], ['5', 'Serpente não peçonhenta'], ['9', 'Ignorado']], caixa: cx(0, 536.6, 124.6), larg: 3, quando: (d) => d.tipo_acidente === '1' },
        { n: '47', chave: 'aranha', rotulo: 'Aranha — tipo de acidente', tipo: 'codigo', opcoes: [['1', 'Foneutrismo'], ['2', 'Loxoscelismo'], ['3', 'Latrodectismo'], ['4', 'Outra aranha'], ['9', 'Ignorado']], caixa: cx(0, 283.7, 88.6), larg: 3, quando: (d) => d.tipo_acidente === '2' },
        { n: '48', chave: 'lagarta', rotulo: 'Lagarta — tipo de acidente', tipo: 'codigo', opcoes: [['1', 'Lonomia'], ['2', 'Outra lagarta'], ['9', 'Ignorado']], caixa: cx(0, 541.4, 86.4), larg: 3, quando: (d) => d.tipo_acidente === '4' },
      ],
    },
    {
      titulo: 'Tratamento',
      campos: [
        { n: '49', chave: 'classificacao_caso', rotulo: 'Classificação do caso', tipo: 'codigo', opcoes: [['1', 'Leve'], ['2', 'Moderado'], ['3', 'Grave'], ['9', 'Ignorado']], caixa: cx(1, 332.6, 794.6), larg: 3 },
        sni('50', 'soroterapia', 'Soroterapia', cx(1, 546.2, 796.1), { larg: 3 }),
        amp('sab', 'Antibotrópico (SAB)', 184.6, 761), amp('sabl', 'Antibotrópico-laquético (SABL)', 184.6, 742.5), amp('sabc', 'Antibotrópico-crotálico (SABC)', 184.6, 727.5),
        amp('sac', 'Anticrotálico (SAC)', 353.4, 761), amp('sae', 'Antielapídico (SAE)', 353.4, 742.5), amp('saes', 'Antiescorpiônico (SAEs)', 353.4, 727.5),
        amp('saar', 'Antiaracnídico (SAAr)', 521.6, 761), amp('salox', 'Antiloxoscélico (SALox)', 521.6, 742.5), amp('salon', 'Antilonômico (SALon)', 521.6, 727.5),
        sni('52', 'complicacoes_locais', 'Complicações locais', cx(1, 160.8, 705.1), { larg: 3 }),
        sni('53', 'cl_infeccao', 'Infecção secundária', cx(1, 185.5, 689.8), { quando: complLoc }),
        sni('53', 'cl_necrose', 'Necrose extensa', cx(1, 260.6, 689.8), { quando: complLoc }),
        sni('53', 'cl_compartimental', 'Síndrome compartimental', cx(1, 325.9, 690.0), { quando: complLoc }),
        sni('53', 'cl_deficit', 'Déficit funcional', cx(1, 419.5, 689.3), { quando: complLoc }),
        sni('53', 'cl_amputacao', 'Amputação', cx(1, 503.8, 689.8), { quando: complLoc }),
        sni('54', 'complicacoes_sistemicas', 'Complicações sistêmicas', cx(1, 175.0, 669.1), { larg: 3 }),
        sni('55', 'cs_renal', 'Insuficiência renal', cx(1, 205.7, 654.5), { quando: complSis }),
        sni('55', 'cs_respiratoria', 'Insuficiência respiratória/edema pulmonar agudo', cx(1, 283.7, 654.2), { larg: 3, quando: complSis }),
        sni('55', 'cs_septicemia', 'Septicemia', cx(1, 413.8, 653.5), { quando: complSis }),
        sni('55', 'cs_choque', 'Choque', cx(1, 511.9, 655.2), { quando: complSis }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        { n: '56', chave: 'relacionado_trabalho', rotulo: 'Acidente relacionado ao trabalho', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 135.1, y: 625.7, w: 13, h: 11 }, larg: 3 },
        { n: '57', chave: 'evolucao', rotulo: 'Evolução do caso', tipo: 'codigo', opcoes: [['1', 'Cura'], ['2', 'Óbito por acidente por animal peçonhento'], ['3', 'Óbito por outras causas'], ['9', 'Ignorado']], caixa: cx(1, 277.0, 634.6), larg: 3 },
        { n: '58', chave: 'data_obito', rotulo: 'Data do óbito', tipo: 'data', caixa: { p: 1, x: 326.3, y: 605.6, w: 112.6, h: 12 }, larg: 3, quando: (d) => ['2', '3'].includes(d.evolucao) },
        { n: '59', chave: 'data_encerramento', rotulo: 'Data do encerramento', tipo: 'data', caixa: { p: 1, x: 456.6, y: 606.9, w: 109.7, h: 11.9 }, larg: 3 },
        { n: '', chave: 'observacoes', rotulo: 'Informações complementares e observações', tipo: 'texto_longo', linhas: [146.4, 131.7, 117.0].map((y) => ({ p: 1, x: 32, y, w: 536.8, h: 14 })), larg: 12 },
      ],
    },
    {
      titulo: 'Investigador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 60, y: 96, w: 400, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Cód. da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [479.4, 493.9, 508.3, 522.8, 537.3, 551.7], 94.5), larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 60, y: 71.5, w: 190, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 257, y: 71.5, w: 205, h: 10 }, larg: 6 },
      ],
    },
  ],
}
