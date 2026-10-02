// Ficha de Notificação Individual — Violência Interpessoal/Autoprovocada (Sinan, SVS 15.06.2015) — violencia_v5.pdf
// Ficha sigilosa: exibe o aviso de sigilo; visível a todos os profissionais cadastrados (com login).
import { SEXO, UNID_IDADE, GESTANTE, RACA, ESCOLARIDADE, ZONA, soFeminino, pente } from './comum'

const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const SNI = [['1', 'Sim'], ['2', 'Não'], ['9', 'Ignorado']]
const SN8I = [['1', 'Sim'], ['2', 'Não'], ['8', 'Não se aplica'], ['9', 'Ignorado']]
const item = (n, prefixo, op, quando) => ([k, r, x, y]) => ({ n, chave: `${prefixo}_${k}`, rotulo: r, tipo: 'codigo', opcoes: op, caixa: cx(1, x, y), larg: 3, ...(quando ? { quando } : {}) })
const sexual = (d) => d.tipo_sexual === '1'

export default {
  id: 'VIOLENCIA',
  titulo: 'Ficha de Notificação — Violência Interpessoal/Autoprovocada',
  arquivo: 'violencia_v5.pdf',
  sigilosa: true,
  secoes: [
    {
      titulo: 'Dados gerais',
      campos: [
        { n: '3', chave: 'data_notificacao', rotulo: 'Data da notificação', tipo: 'data', caixa: { p: 0, x: 442.1, y: 693.8, w: 116.4, h: 12.2 }, larg: 3 },
        { n: '4', chave: 'uf_notificacao', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 52.6, y: 673.2, w: 26.9, h: 8.6 }, larg: 1 },
        { n: '5', chave: 'municipio_notificacao', rotulo: 'Município de notificação', tipo: 'texto', caixa: { p: 0, x: 100, y: 675, w: 380, h: 9 }, larg: 5 },
        { n: '5', chave: 'ibge_notificacao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [487.7, 502.6, 517.4, 532.3, 547.2], 673), larg: 3 },
        { n: '6', chave: 'tipo_unidade', rotulo: 'Unidade notificadora', tipo: 'codigo', opcoes: [['1', 'Unidade de saúde'], ['2', 'Unidade de assistência social'], ['3', 'Estabelecimento de ensino'], ['4', 'Conselho tutelar'], ['5', 'Unidade de saúde indígena'], ['6', 'Centro especializado de atendimento à mulher'], ['7', 'Outros']], caixa: cx(0, 146.9, 659.8), larg: 4 },
        { n: '7', chave: 'nome_unidade_notificadora', rotulo: 'Nome da unidade notificadora', tipo: 'texto', caixa: { p: 0, x: 64, y: 631, w: 272, h: 9 }, larg: 6 },
        { n: '7', chave: 'codigo_unidade', rotulo: 'Código da unidade', tipo: 'texto', caixa: { p: 0, x: 345, y: 631, w: 90, h: 8 }, larg: 2 },
        { n: '8', chave: 'unidade_notificadora', rotulo: 'Unidade de saúde', tipo: 'texto', caixa: { p: 0, x: 65, y: 610, w: 270, h: 9 }, larg: 6 },
        { n: '8', chave: 'cnes', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [345.6, 360.5, 375.4, 390.2, 405.1, 420.0], 609), larg: 3 },
        { n: '9', chave: 'data_ocorrencia', rotulo: 'Data da ocorrência da violência', tipo: 'data', caixa: { p: 0, x: 441.6, y: 620, w: 115.8, h: 12 }, larg: 3 },
      ],
    },
    {
      titulo: 'Notificação individual',
      campos: [
        { n: '10', chave: 'nome', rotulo: 'Nome do paciente', tipo: 'texto', caixa: { p: 0, x: 64, y: 589, w: 372, h: 10 }, larg: 9 },
        { n: '11', chave: 'data_nascimento', rotulo: 'Data de nascimento', tipo: 'data', caixa: { p: 0, x: 445.9, y: 588.5, w: 114.4, h: 12.2 }, larg: 3 },
        { n: '12', chave: 'idade', rotulo: '(ou) Idade', tipo: 'digitos', digitos: 3, caixa: pente(0, [73.6, 87.8], 559.5, 9), larg: 2 },
        { n: '12', chave: 'unidade_idade', rotulo: 'Unidade da idade', tipo: 'codigo', opcoes: UNID_IDADE, caixa: cx(0, 108.2, 566.4), larg: 2 },
        { n: '13', chave: 'sexo', rotulo: 'Sexo', tipo: 'codigo', opcoes: SEXO, caixa: cx(0, 230.9, 573.6), larg: 2 },
        { n: '14', chave: 'gestante', rotulo: 'Gestante', tipo: 'codigo', opcoes: GESTANTE, caixa: cx(0, 417.8, 574.1), larg: 3, quando: soFeminino, senao: '6' },
        { n: '15', chave: 'raca', rotulo: 'Raça/cor', tipo: 'codigo', opcoes: RACA, caixa: cx(0, 550.3, 572.6), larg: 3 },
        { n: '16', chave: 'escolaridade', rotulo: 'Escolaridade', tipo: 'codigo', opcoes: ESCOLARIDADE, caixa: cx(0, 551.0, 543.6), larg: 5 },
        { n: '17', chave: 'cns', rotulo: 'Número do cartão SUS', tipo: 'digitos', digitos: 15, caixa: { p: 0, x: 52.3, y: 499.0, w: 175.2, h: 12 }, larg: 3 },
        { n: '18', chave: 'nome_mae', rotulo: 'Nome da mãe', tipo: 'texto', caixa: { p: 0, x: 244, y: 500, w: 321, h: 10 }, larg: 4 },
      ],
    },
    {
      titulo: 'Dados de residência',
      campos: [
        { n: '19', chave: 'uf_residencia', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 52.8, y: 469.2, w: 28.1, h: 11.8 }, larg: 1 },
        { n: '20', chave: 'municipio_residencia', rotulo: 'Município de residência', tipo: 'texto', caixa: { p: 0, x: 102, y: 469, w: 225, h: 10 }, larg: 4 },
        { n: '20', chave: 'ibge_residencia', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [337.2, 352.1, 367.0, 381.8, 396.7], 467.5), larg: 3 },
        { n: '21', chave: 'distrito', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 0, x: 426, y: 469, w: 139, h: 10 }, larg: 4 },
        { n: '22', chave: 'bairro', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 0, x: 58, y: 444, w: 138, h: 10 }, larg: 3 },
        { n: '23', chave: 'logradouro', rotulo: 'Logradouro (rua, avenida...)', tipo: 'texto', caixa: { p: 0, x: 210, y: 444, w: 266, h: 10 }, larg: 6 },
        { n: '23', chave: 'logradouro_codigo', rotulo: 'Código do logradouro', tipo: 'digitos', digitos: 6, caixa: pente(0, [491.0, 505.9, 520.8, 535.7, 550.5], 442), larg: 3 },
        { n: '24', chave: 'numero', rotulo: 'Número', tipo: 'texto', caixa: { p: 0, x: 58, y: 420, w: 52, h: 10 }, larg: 2 },
        { n: '25', chave: 'complemento', rotulo: 'Complemento (apto., casa...)', tipo: 'texto', caixa: { p: 0, x: 121, y: 420, w: 290, h: 10 }, larg: 5 },
        { n: '26', chave: 'geo1', rotulo: 'Geo campo 1', tipo: 'texto', caixa: { p: 0, x: 422, y: 420, w: 143, h: 10 }, larg: 2 },
        { n: '27', chave: 'geo2', rotulo: 'Geo campo 2', tipo: 'texto', caixa: { p: 0, x: 58, y: 394, w: 160, h: 10 }, larg: 3 },
        { n: '28', chave: 'ponto_referencia', rotulo: 'Ponto de referência', tipo: 'texto', caixa: { p: 0, x: 231, y: 394, w: 217, h: 10 }, larg: 5 },
        { n: '29', chave: 'cep', rotulo: 'CEP', tipo: 'digitos', digitos: 8, caixa: { p: 0, x: 454.6, y: 392.9, w: 108.5, h: 10.8 }, larg: 3 },
        { n: '30', chave: 'telefone', rotulo: '(DDD) Telefone', tipo: 'digitos', digitos: 10, caixa: { p: 0, x: 53.3, y: 367.4, w: 148.1, h: 12.5 }, larg: 3 },
        { n: '31', chave: 'zona', rotulo: 'Zona', tipo: 'codigo', opcoes: ZONA, caixa: cx(0, 332.2, 379.4), larg: 3 },
        { n: '32', chave: 'pais', rotulo: 'País (se residente fora do Brasil)', tipo: 'texto', caixa: { p: 0, x: 371, y: 369, w: 194, h: 10 }, larg: 6 },
      ],
    },
    {
      titulo: 'Dados da pessoa atendida',
      campos: [
        { n: '33', chave: 'nome_social', rotulo: 'Nome social', tipo: 'texto', caixa: { p: 0, x: 68, y: 325, w: 278, h: 10 }, larg: 6 },
        { n: '34', chave: 'ocupacao', rotulo: 'Ocupação', tipo: 'texto', caixa: { p: 0, x: 365, y: 325, w: 200, h: 10 }, larg: 6 },
        { n: '35', chave: 'situacao_conjugal', rotulo: 'Situação conjugal/estado civil', tipo: 'codigo', opcoes: [['1', 'Solteiro'], ['2', 'Casado/união consensual'], ['3', 'Viúvo'], ['4', 'Separado'], ['8', 'Não se aplica'], ['9', 'Ignorado']], caixa: cx(0, 547.9, 303.1), larg: 4 },
        { n: '36', chave: 'orientacao_sexual', rotulo: 'Orientação sexual', tipo: 'codigo', opcoes: [['1', 'Heterossexual'], ['2', 'Homossexual (gay/lésbica)'], ['3', 'Bissexual'], ['8', 'Não se aplica'], ['9', 'Ignorado']], caixa: cx(0, 289.0, 275.8), larg: 4 },
        { n: '37', chave: 'identidade_genero', rotulo: 'Identidade de gênero', tipo: 'codigo', opcoes: [['1', 'Travesti'], ['2', 'Mulher transexual'], ['3', 'Homem transexual'], ['8', 'Não se aplica'], ['9', 'Ignorado']], caixa: cx(0, 548.9, 273.6), larg: 4 },
        { n: '38', chave: 'deficiencia', rotulo: 'Possui algum tipo de deficiência/transtorno?', tipo: 'codigo', opcoes: SNI, caixa: cx(0, 167.3, 242.2), larg: 4 },
        ...[['fisica', 'Deficiência física', 196.1, 234.7], ['intelectual', 'Deficiência intelectual', 196.1, 222.5], ['visual', 'Deficiência visual', 293.3, 234.2], ['auditiva', 'Deficiência auditiva', 293.3, 222.0],
          ['mental', 'Transtorno mental', 387.6, 233.8], ['comportamento', 'Transtorno de comportamento', 387.6, 221.5], ['outras', 'Outras deficiências', 472.6, 232.6]]
          .map(([k, r, x, y]) => ({ n: '39', chave: `def_${k}`, rotulo: r, tipo: 'codigo', opcoes: SN8I, caixa: cx(0, x, y, 9.7, 9.3), larg: 3, quando: (d) => d.deficiencia === '1' })),
        { n: '39', chave: 'def_outras_espec', rotulo: 'Outras deficiências (especificar)', tipo: 'texto', caixa: { p: 0, x: 512, y: 233, w: 52, h: 7 }, fonte: 5.5, larg: 3, quando: (d) => d.def_outras === '1' },
      ],
    },
    {
      titulo: 'Dados da ocorrência',
      campos: [
        { n: '40', chave: 'uf_ocorrencia', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 54.5, y: 189.6, w: 27.1, h: 12 }, larg: 1 },
        { n: '41', chave: 'municipio_ocorrencia', rotulo: 'Município de ocorrência', tipo: 'texto', caixa: { p: 0, x: 96, y: 191.5, w: 232, h: 10 }, larg: 4 },
        { n: '41', chave: 'ibge_ocorrencia', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [337.2, 352.1, 367.0, 381.8, 396.7], 188.5), larg: 3 },
        { n: '42', chave: 'distrito_ocorrencia', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 0, x: 427, y: 190, w: 138, h: 10 }, larg: 4 },
        { n: '43', chave: 'bairro_ocorrencia', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 0, x: 58, y: 166.5, w: 140, h: 10 }, larg: 3 },
        { n: '44', chave: 'logradouro_ocorrencia', rotulo: 'Logradouro (rua, avenida...)', tipo: 'texto', caixa: { p: 0, x: 210, y: 166.5, w: 268, h: 10 }, larg: 6 },
        { n: '44', chave: 'logradouro_codigo_ocorrencia', rotulo: 'Código do logradouro', tipo: 'digitos', digitos: 6, caixa: pente(0, [492.5, 507.4, 522.2, 537.1, 552.0], 163), larg: 3 },
        { n: '45', chave: 'numero_ocorrencia', rotulo: 'Número', tipo: 'texto', caixa: { p: 0, x: 58, y: 140, w: 54, h: 10 }, larg: 2 },
        { n: '46', chave: 'complemento_ocorrencia', rotulo: 'Complemento (apto., casa...)', tipo: 'texto', caixa: { p: 0, x: 122, y: 140, w: 180, h: 10 }, larg: 4 },
        { n: '47', chave: 'geo3', rotulo: 'Geo campo 3', tipo: 'texto', caixa: { p: 0, x: 314, y: 140, w: 118, h: 10 }, larg: 3 },
        { n: '48', chave: 'geo4', rotulo: 'Geo campo 4', tipo: 'texto', caixa: { p: 0, x: 439, y: 140, w: 126, h: 10 }, larg: 3 },
        { n: '49', chave: 'ponto_referencia_ocorrencia', rotulo: 'Ponto de referência', tipo: 'texto', caixa: { p: 0, x: 58, y: 116, w: 272, h: 10 }, larg: 5 },
        { n: '50', chave: 'zona_ocorrencia', rotulo: 'Zona', tipo: 'codigo', opcoes: ZONA, caixa: cx(0, 332.9, 127.2), larg: 3 },
        { n: '51', chave: 'hora_ocorrencia', rotulo: 'Hora da ocorrência (HHMM, 00:00 a 23:59)', tipo: 'digitos', digitos: 4, caixa: { p: 0, x: 489.8, y: 111.5, w: 53.9, h: 10 }, larg: 3 },
        { n: '52', chave: 'local_ocorrencia', rotulo: 'Local de ocorrência', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Residência'], ['02', 'Habitação coletiva'], ['03', 'Escola'], ['04', 'Local de prática esportiva'], ['05', 'Bar ou similar'], ['06', 'Via pública'], ['07', 'Comércio/serviços'], ['08', 'Indústrias/construção'], ['09', 'Outro'], ['99', 'Ignorado']], caixa: { p: 0, x: 379.4, y: 100.6, w: 24.2, h: 12.7 }, larg: 4 },
        { n: '52', chave: 'local_outro', rotulo: 'Outro local (especificar)', tipo: 'texto', caixa: { p: 0, x: 322, y: 80, w: 52, h: 7 }, fonte: 6, larg: 3, quando: (d) => d.local_ocorrencia === '09' },
        { n: '53', chave: 'outras_vezes', rotulo: 'Ocorreu outras vezes?', tipo: 'codigo', opcoes: SNI, caixa: cx(0, 551.3, 103.0), larg: 3 },
        { n: '54', chave: 'autoprovocada', rotulo: 'A lesão foi autoprovocada?', tipo: 'codigo', opcoes: SNI, caixa: cx(0, 551.3, 76.1), larg: 3 },
      ],
    },
    {
      titulo: 'Violência',
      campos: [
        { n: '55', chave: 'motivacao', rotulo: 'Essa violência foi motivada por', tipo: 'codigo', digitos: 2, opcoes: [['01', 'Sexismo'], ['02', 'Homofobia/lesbofobia/bifobia/transfobia'], ['03', 'Racismo'], ['04', 'Intolerância religiosa'], ['05', 'Xenofobia'], ['06', 'Conflito geracional'], ['07', 'Situação de rua'], ['08', 'Deficiência'], ['09', 'Outros'], ['88', 'Não se aplica'], ['99', 'Ignorado']], caixa: { p: 1, x: 543.1, y: 779.5, w: 21.4, h: 11 }, larg: 5 },
        { n: '55', chave: 'motivacao_outros', rotulo: 'Outra motivação (especificar)', tipo: 'texto', caixa: { p: 1, x: 372, y: 775, w: 48, h: 7 }, fonte: 5.5, larg: 3, quando: (d) => d.motivacao === '09' },
        ...[['fisica', 'Física', 67.4, 746.4], ['psicologica', 'Psicológica/moral', 67.4, 732.7], ['tortura', 'Tortura', 67.9, 720.0], ['sexual', 'Sexual', 67.9, 707.3],
          ['trafico', 'Tráfico de seres humanos', 152.9, 746.9], ['financeira', 'Financeira/econômica', 152.4, 733.0], ['negligencia', 'Negligência/abandono', 152.4, 720.0], ['trabalho_infantil', 'Trabalho infantil', 152.4, 707.3],
          ['intervencao_legal', 'Intervenção legal', 255.6, 734.2], ['outros', 'Outros', 255.6, 718.6]].map(item('56', 'tipo', SNI)),
        { n: '56', chave: 'tipo_outros_espec', rotulo: 'Outro tipo de violência (especificar)', tipo: 'texto', caixa: { p: 1, x: 270, y: 711, w: 70, h: 7 }, fonte: 6, larg: 3, quando: (d) => d.tipo_outros === '1' },
        ...[['forca', 'Força corporal/espancamento', 346.3, 739.4], ['enforcamento', 'Enforcamento', 346.1, 722.9], ['contundente', 'Objeto contundente', 346.3, 707.0],
          ['perfurocortante', 'Objeto pérfuro-cortante', 422.6, 743.3], ['quente', 'Substância/objeto quente', 422.6, 726.7], ['envenenamento', 'Envenenamento, intoxicação', 423.4, 710.9],
          ['arma_fogo', 'Arma de fogo', 495.6, 741.6], ['ameaca', 'Ameaça', 496.1, 729.1], ['outro', 'Outro', 496.3, 716.6]].map(item('57', 'meio', SNI)),
        { n: '57', chave: 'meio_outro_espec', rotulo: 'Outro meio de agressão (especificar)', tipo: 'texto', caixa: { p: 1, x: 535, y: 718.5, w: 30, h: 7 }, fonte: 5, larg: 3, quando: (d) => d.meio_outro === '1' },
        ...[['assedio', 'Assédio sexual', 68.4, 680.4], ['estupro', 'Estupro', 152.2, 681.6], ['pornografia', 'Pornografia infantil', 231.6, 682.3], ['exploracao', 'Exploração sexual', 335.5, 682.8], ['outros', 'Outros', 438.2, 683.5]]
          .map(item('58', 'sexual', SN8I, sexual)),
        { n: '58', chave: 'sexual_outros_espec', rotulo: 'Outro tipo de violência sexual (especificar)', tipo: 'texto', caixa: { p: 1, x: 478, y: 683.5, w: 80, h: 7 }, fonte: 6, larg: 3, quando: (d) => sexual(d) && d.sexual_outros === '1' },
        ...[['dst', 'Profilaxia DST', 67.4, 645.8], ['hiv', 'Profilaxia HIV', 67.2, 632.9], ['hepatite_b', 'Profilaxia hepatite B', 153.6, 646.6], ['coleta_sangue', 'Coleta de sangue', 153.6, 633.6],
          ['coleta_semen', 'Coleta de sêmen', 266.2, 646.6], ['secrecao_vaginal', 'Coleta de secreção vaginal', 266.2, 633.8], ['contracepcao', 'Contracepção de emergência', 407.0, 646.6], ['aborto', 'Aborto previsto em lei', 407.0, 633.1]]
          .map(item('59', 'proc', SN8I, sexual)),
      ],
    },
    {
      titulo: 'Dados do provável autor da violência',
      campos: [
        { n: '60', chave: 'numero_envolvidos', rotulo: 'Número de envolvidos', tipo: 'codigo', opcoes: [['1', 'Um'], ['2', 'Dois ou mais'], ['9', 'Ignorado']], caixa: cx(1, 91.4, 595.0), larg: 3 },
        ...[['pai', 'Pai', 116.4, 603.1], ['mae', 'Mãe', 116.4, 590.4], ['padrasto', 'Padrasto', 116.4, 577.7], ['madrasta', 'Madrasta', 116.4, 565.7], ['conjuge', 'Cônjuge', 116.4, 553.7],
          ['ex_conjuge', 'Ex-cônjuge', 171.1, 603.1], ['namorado', 'Namorado(a)', 171.1, 590.4], ['ex_namorado', 'Ex-namorado(a)', 171.1, 577.7], ['filho', 'Filho(a)', 171.1, 565.7], ['irmao', 'Irmão(ã)', 171.1, 553.7],
          ['amigos', 'Amigos/conhecidos', 250.1, 602.4], ['desconhecido', 'Desconhecido(a)', 250.1, 589.7], ['cuidador', 'Cuidador(a)', 250.1, 577.0], ['patrao', 'Patrão/chefe', 250.1, 565.0], ['institucional', 'Pessoa com relação institucional', 250.1, 553.0],
          ['policial', 'Policial/agente da lei', 338.4, 601.7], ['propria', 'Própria pessoa', 338.4, 576.2], ['outros', 'Outros', 338.4, 564.2]].map(item('61', 'vinculo', SNI)),
        { n: '61', chave: 'vinculo_outros_espec', rotulo: 'Outro vínculo (especificar)', tipo: 'texto', caixa: { p: 1, x: 382, y: 565, w: 50, h: 7 }, fonte: 5.5, larg: 3, quando: (d) => d.vinculo_outros === '1' },
        { n: '62', chave: 'sexo_autor', rotulo: 'Sexo do provável autor', tipo: 'codigo', opcoes: [['1', 'Masculino'], ['2', 'Feminino'], ['3', 'Ambos os sexos'], ['9', 'Ignorado']], caixa: cx(1, 480.7, 593.0), larg: 3 },
        { n: '63', chave: 'suspeita_alcool', rotulo: 'Suspeita de uso de álcool', tipo: 'codigo', opcoes: SNI, caixa: cx(1, 549.6, 596.2), larg: 3 },
        { n: '64', chave: 'ciclo_vida_autor', rotulo: 'Ciclo de vida do provável autor', tipo: 'codigo', opcoes: [['1', 'Criança (0 a 9 anos)'], ['2', 'Adolescente (10 a 19 anos)'], ['3', 'Jovem (20 a 24 anos)'], ['4', 'Pessoa adulta (25 a 59 anos)'], ['5', 'Pessoa idosa (60 anos ou mais)'], ['9', 'Ignorado']], caixa: cx(1, 230.6, 532.6, 11.5, 11.5), larg: 4 },
      ],
    },
    {
      titulo: 'Encaminhamento',
      campos: [
        ...[['saude', 'Rede da saúde', 50.6, 472.3], ['assistencia', 'Rede da assistência social (CRAS, CREAS)', 50.6, 457.9], ['educacao', 'Rede da educação', 50.6, 443.5], ['mulher', 'Rede de atendimento à mulher', 50.9, 429.1], ['conselho_tutelar', 'Conselho tutelar', 50.9, 414.7],
          ['conselho_idoso', 'Conselho do idoso', 283.2, 478.3], ['delegacia_idoso', 'Delegacia de atendimento ao idoso', 283.2, 462.7], ['direitos_humanos', 'Centro de referência dos direitos humanos', 283.2, 448.3], ['mp', 'Ministério Público', 283.2, 433.0], ['delegacia_crianca', 'Delegacia de proteção à criança e adolescente', 283.2, 417.4],
          ['delegacia_mulher', 'Delegacia de atendimento à mulher', 432.5, 481.2], ['outras_delegacias', 'Outras delegacias', 432.5, 464.2], ['justica_infancia', 'Justiça da infância e da juventude', 432.5, 448.6], ['defensoria', 'Defensoria pública', 432.5, 429.8]]
          .map(([k, r, x, y]) => ({ n: '65', chave: `enc_${k}`, rotulo: r, tipo: 'codigo', opcoes: SNI, caixa: cx(1, x, y, 11.5, 11.5), larg: 3 })),
      ],
    },
    {
      titulo: 'Dados finais',
      campos: [
        { n: '66', chave: 'relacionada_trabalho', rotulo: 'Violência relacionada ao trabalho', tipo: 'codigo', opcoes: SNI, caixa: cx(1, 163.4, 384.5, 12.5, 12.5), larg: 3 },
        { n: '67', chave: 'cat', rotulo: 'Se sim, foi emitida a CAT?', tipo: 'codigo', opcoes: SN8I, caixa: cx(1, 353.0, 385.0), larg: 3, quando: (d) => d.relacionada_trabalho === '1' },
        { n: '68', chave: 'circunstancia_cid', rotulo: 'Circunstância da lesão (CID 10, capítulo XX)', tipo: 'digitos', alfa: true, digitos: 4, caixa: { p: 1, x: 501.6, y: 366.5, w: 59.5, h: 11 }, larg: 3 },
        { n: '69', chave: 'data_encerramento', rotulo: 'Data de encerramento', tipo: 'data', caixa: { p: 1, x: 53, y: 324, w: 114, h: 10 }, larg: 3 },
      ],
    },
    {
      titulo: 'Informações complementares e observações',
      campos: [
        { n: '', chave: 'acompanhante_nome', rotulo: 'Nome do acompanhante', tipo: 'texto', caixa: { p: 1, x: 32, y: 283, w: 218, h: 10 }, larg: 5 },
        { n: '', chave: 'acompanhante_vinculo', rotulo: 'Vínculo/grau de parentesco', tipo: 'texto', caixa: { p: 1, x: 253, y: 283, w: 160, h: 10 }, larg: 4 },
        { n: '', chave: 'acompanhante_telefone', rotulo: '(DDD) Telefone', tipo: 'digitos', digitos: 10, caixa: pente(1, [430.8, 445.7, 460.6, 475.4, 490.3, 505.2, 520.1, 534.9, 549.8], 281), larg: 3 },
        { n: '', chave: 'observacoes', rotulo: 'Observações adicionais', tipo: 'texto_longo', linhas: [[254.9, 12.4], [243.8, 11.1], [233.3, 10.5], [222.8, 10.5], [212.4, 10.4]].map(([y, h]) => ({ p: 1, x: 30, y, w: 535, h })), fonte: 7.5, larg: 12 },
      ],
    },
    {
      titulo: 'Notificador',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 1, x: 55, y: 140, w: 385, h: 10 }, larg: 8 },
        { n: '', chave: 'cnes', rotulo: 'Cód. da unidade de saúde/CNES', tipo: 'digitos', digitos: 7, caixa: { p: 1, x: 447.2, y: 134, w: 104.3, h: 10 }, larg: 4, espelho: true },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 1, x: 55, y: 110, w: 195, h: 10 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 1, x: 257, y: 110, w: 198, h: 10 }, larg: 6 },
      ],
    },
  ],
  // Pré-preenche os campos da unidade notificadora (itens 6 e 7).
  inicializar: (dados) => ({ tipo_unidade: '1', nome_unidade_notificadora: dados.unidade_notificadora, ...dados }),
}
