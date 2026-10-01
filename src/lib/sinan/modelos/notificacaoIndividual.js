// Ficha de Notificação Individual (SINAN NET, SVS 17/07/2006) — Notificacao_Individual_v5.pdf
// Serve para qualquer agravo da lista nacional que não tenha ficha própria.
import { SIM_NAO_IGN, SEXO, UNID_IDADE, GESTANTE, RACA, ESCOLARIDADE, ZONA, TIPO_NOTIFICACAO, soFeminino } from './comum'

const surto = (d) => d.tipo_notificacao === '3'

export default {
  id: 'NOTIFICACAO_INDIVIDUAL',
  titulo: 'Ficha de Notificação Individual',
  arquivo: 'Notificacao_Individual_v5.pdf',
  agravoLivre: true, // o agravo é escolhido pelo profissional (campo 2)
  secoes: [
    {
      titulo: 'Dados gerais',
      campos: [
        { n: '1', chave: 'tipo_notificacao', rotulo: 'Tipo de notificação', tipo: 'codigo', opcoes: TIPO_NOTIFICACAO, caixa: { p: 0, x: 545.0, y: 759.6, w: 11, h: 11 }, larg: 12, obrig: true },
        { n: '2', chave: 'agravo', rotulo: 'Agravo/doença', tipo: 'texto', caixa: { p: 0, x: 70, y: 725, w: 360, h: 11 }, larg: 8, obrig: true },
        { n: '3', chave: 'data_notificacao', rotulo: 'Data da notificação', tipo: 'data', caixa: { p: 0, x: 448.5, y: 725.3, w: 115.2, h: 11.9 }, larg: 4, obrig: true },
        { n: '4', chave: 'uf_notificacao', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 53.9, y: 696.0, w: 26.9, h: 11.8 }, larg: 2, obrig: true },
        { n: '5', chave: 'municipio_notificacao', rotulo: 'Município de notificação', tipo: 'texto', caixa: { p: 0, x: 98, y: 696, w: 230, h: 11 }, larg: 6, obrig: true },
        { n: '5', chave: 'ibge_notificacao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: { p: 0, x: 479.5, y: 695.5, w: 86.4, h: 11 }, larg: 4, obrig: true },
        { n: '6', chave: 'unidade_notificadora', rotulo: 'Unidade de saúde (ou outra fonte notificadora)', tipo: 'texto', caixa: { p: 0, x: 70, y: 668, w: 265, h: 11 }, larg: 5, obrig: true },
        { n: '6', chave: 'cnes', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: { p: 0, x: 339.5, y: 668.5, w: 100.8, h: 11 }, larg: 3, obrig: true },
        { n: '7', chave: 'data_primeiros_sintomas', rotulo: 'Data dos primeiros sintomas', tipo: 'data', caixa: { p: 0, x: 445.6, y: 669.0, w: 115.2, h: 11.9 }, larg: 4, obrig: true },
      ],
    },
    {
      titulo: 'Notificação individual',
      campos: [
        { n: '8', chave: 'nome', rotulo: 'Nome do paciente', tipo: 'texto', caixa: { p: 0, x: 68, y: 639, w: 370, h: 11 }, larg: 8, obrig: true },
        { n: '9', chave: 'data_nascimento', rotulo: 'Data de nascimento', tipo: 'data', caixa: { p: 0, x: 446.5, y: 638.1, w: 115.2, h: 12.0 }, larg: 4 },
        { n: '10', chave: 'idade', rotulo: '(ou) Idade', tipo: 'digitos', digitos: 3, caixa: { p: 0, x: 61, y: 607, w: 42, h: 9 }, larg: 2, obrig: true },
        { n: '10', chave: 'unidade_idade', rotulo: 'Unidade da idade', tipo: 'codigo', opcoes: UNID_IDADE, caixa: { p: 0, x: 109.0, y: 615.6, w: 10.8, h: 11 }, larg: 3, obrig: true },
        { n: '11', chave: 'sexo', rotulo: 'Sexo', tipo: 'codigo', opcoes: SEXO, caixa: { p: 0, x: 231.6, y: 622.8, w: 10.8, h: 11 }, larg: 3, obrig: true },
        { n: '12', chave: 'gestante', rotulo: 'Gestante', tipo: 'codigo', opcoes: GESTANTE, caixa: { p: 0, x: 426.0, y: 622.8, w: 11, h: 11 }, larg: 4, obrig: true, quando: soFeminino, senao: '6' },
        { n: '13', chave: 'raca', rotulo: 'Raça/cor', tipo: 'codigo', opcoes: RACA, caixa: { p: 0, x: 551.0, y: 622.1, w: 11, h: 11 }, larg: 3, obrig: true },
        { n: '14', chave: 'escolaridade', rotulo: 'Escolaridade', tipo: 'codigo', opcoes: ESCOLARIDADE, caixa: { p: 0, x: 551.5, y: 593.0, w: 11, h: 10.8 }, larg: 6, obrig: true },
        { n: '15', chave: 'cns', rotulo: 'Número do cartão SUS', tipo: 'digitos', digitos: 15, caixa: { p: 0, x: 52.9, y: 547.6, w: 175.3, h: 11.9 }, larg: 5 },
        { n: '16', chave: 'nome_mae', rotulo: 'Nome da mãe', tipo: 'texto', caixa: { p: 0, x: 245, y: 548, w: 320, h: 11 }, larg: 7 },
      ],
    },
    {
      titulo: 'Notificação de surto',
      aviso: 'Preencher só quando o tipo de notificação for 3 - Surto.',
      campos: [
        { n: '17', chave: 'surto_data_sintomas', rotulo: 'Data dos 1ºs sintomas do 1º caso suspeito', tipo: 'data', caixa: { p: 0, x: 57.7, y: 516.9, w: 115.2, h: 11.9 }, larg: 4, quando: surto },
        { n: '18', chave: 'surto_casos', rotulo: 'Nº de casos suspeitos/expostos', tipo: 'digitos', digitos: 5, caixa: { p: 0, x: 104.8, y: 487.2, w: 71.2, h: 12 }, larg: 3, quando: surto },
        { n: '19', chave: 'surto_local', rotulo: 'Local inicial de ocorrência do surto', tipo: 'codigo', digitos: 2, opcoes: [['1', 'Residência'], ['2', 'Hospital/Unidade de saúde'], ['3', 'Creche/Escola'], ['4', 'Asilo'], ['5', 'Outras instituições (alojamento, trabalho)'], ['6', 'Restaurante/Padaria'], ['7', 'Eventos'], ['8', 'Casos dispersos no bairro'], ['9', 'Casos dispersos pelo município'], ['10', 'Casos dispersos em mais de um município'], ['11', 'Outros']], caixa: { p: 0, x: 539.3, y: 527.0, w: 21.6, h: 11 }, larg: 5, quando: surto },
        { n: '19', chave: 'surto_local_outro', rotulo: 'Especificar (outros)', tipo: 'texto', caixa: { p: 0, x: 465, y: 486.5, w: 95, h: 8 }, fonte: 6, larg: 4, quando: (d) => surto(d) && d.surto_local === '11' },
      ],
    },
    {
      titulo: 'Dados de residência',
      campos: [
        { n: '20', chave: 'uf_residencia', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 50.9, y: 453.0, w: 26.9, h: 11.8 }, larg: 2 },
        { n: '21', chave: 'municipio_residencia', rotulo: 'Município de residência', tipo: 'texto', caixa: { p: 0, x: 92, y: 453, w: 225, h: 11 }, larg: 5 },
        { n: '21', chave: 'ibge_residencia', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: { p: 0, x: 323, y: 453.5, w: 86.4, h: 11 }, larg: 3 },
        { n: '22', chave: 'distrito', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 0, x: 424, y: 452.5, w: 140, h: 10 }, larg: 2 },
        { n: '23', chave: 'bairro', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 0, x: 56, y: 427.5, w: 132, h: 10 }, larg: 3 },
        { n: '24', chave: 'logradouro', rotulo: 'Logradouro (rua, avenida...)', tipo: 'texto', caixa: { p: 0, x: 204, y: 427.5, w: 272, h: 10 }, larg: 6 },
        { n: '24', chave: 'logradouro_codigo', rotulo: 'Código do logradouro', tipo: 'digitos', digitos: 6, caixa: { p: 0, x: 481, y: 427, w: 84, h: 11 }, larg: 3 },
        { n: '25', chave: 'numero', rotulo: 'Número', tipo: 'texto', caixa: { p: 0, x: 56, y: 403, w: 48, h: 10 }, larg: 2 },
        { n: '26', chave: 'complemento', rotulo: 'Complemento (apto., casa...)', tipo: 'texto', caixa: { p: 0, x: 119, y: 402, w: 285, h: 11 }, larg: 5 },
        { n: '27', chave: 'geo1', rotulo: 'Geo campo 1', tipo: 'texto', caixa: { p: 0, x: 420, y: 402, w: 145, h: 11 }, larg: 2 },
        { n: '28', chave: 'geo2', rotulo: 'Geo campo 2', tipo: 'texto', caixa: { p: 0, x: 56, y: 378, w: 154, h: 10 }, larg: 3 },
        { n: '29', chave: 'ponto_referencia', rotulo: 'Ponto de referência', tipo: 'texto', caixa: { p: 0, x: 226, y: 377, w: 222, h: 11 }, larg: 5 },
        { n: '30', chave: 'cep', rotulo: 'CEP', tipo: 'digitos', digitos: 8, caixa: { p: 0, x: 452.4, y: 375.6, w: 113.5, h: 11.9 }, larg: 4 },
        { n: '31', chave: 'telefone', rotulo: '(DDD) Telefone', tipo: 'digitos', digitos: 10, caixa: { p: 0, x: 51.3, y: 351.4, w: 148.1, h: 12.3 }, larg: 4 },
        { n: '32', chave: 'zona', rotulo: 'Zona', tipo: 'codigo', opcoes: ZONA, caixa: { p: 0, x: 330.0, y: 363.4, w: 11, h: 11 }, larg: 4 },
        { n: '33', chave: 'pais', rotulo: 'País (se residente fora do Brasil)', tipo: 'texto', caixa: { p: 0, x: 365, y: 351, w: 200, h: 11 }, larg: 4 },
      ],
    },
    {
      titulo: 'Dados complementares',
      campos: [
        { n: '01', chave: 'data_coleta_sorologia', rotulo: 'Data da coleta da 1ª amostra da sorologia', tipo: 'data', caixa: { p: 1, x: 55.6, y: 723.9, w: 115.1, h: 11.9 }, larg: 4 },
        { n: '02', chave: 'data_coleta_outra', rotulo: 'Data da coleta da 1ª amostra de outra amostra', tipo: 'data', caixa: { p: 1, x: 175.7, y: 722.7, w: 115.2, h: 12.0 }, larg: 4 },
        { n: '03', chave: 'tipo_exame', rotulo: 'Especificar tipo de exame', tipo: 'texto', caixa: { p: 1, x: 312, y: 726, w: 255, h: 11 }, larg: 4 },
        { n: '04', chave: 'obito', rotulo: 'Óbito?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 275.0, y: 706.1, w: 11.5, h: 12.2 }, larg: 3 },
        { n: '05', chave: 'contato_semelhante', rotulo: 'Contato com caso semelhante?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 549.8, y: 706.1, w: 11.5, h: 12.2 }, larg: 3 },
        { n: '06', chave: 'exantema', rotulo: 'Presença de exantema?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 213.4, y: 676.8, w: 11.5, h: 12.5 }, larg: 3 },
        { n: '07', chave: 'data_exantema', rotulo: 'Data do início do exantema', tipo: 'data', caixa: { p: 1, x: 252.3, y: 659.0, w: 115.1, h: 12.0 }, larg: 3, quando: (d) => d.exantema === '1' },
        { n: '08', chave: 'petequias', rotulo: 'Presença de petéquias ou sufusões hemorrágicas?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 558.5, y: 672.2, w: 11.5, h: 12.2 }, larg: 3 },
        { n: '09', chave: 'liquor', rotulo: 'Foi realizado líquor?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 190.1, y: 643.9, w: 11.5, h: 12.2 }, larg: 3 },
        { n: '10', chave: 'bacterioscopia', rotulo: 'Resultado da bacterioscopia', tipo: 'texto', caixa: { p: 1, x: 230, y: 631, w: 335, h: 11 }, larg: 9, quando: (d) => d.liquor === '1' },
        { n: '11', chave: 'vacina', rotulo: 'O paciente tomou vacina contra o agravo notificado?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 192.7, y: 609.4, w: 11.5, h: 12.2 }, larg: 4 },
        { n: '12', chave: 'data_ultima_dose', rotulo: 'Data da última dose tomada', tipo: 'data', caixa: { p: 1, x: 212.6, y: 592.9, w: 115.1, h: 11.9 }, larg: 3, quando: (d) => d.vacina === '1' },
        { n: '13', chave: 'hospitalizacao', rotulo: 'Ocorreu hospitalização?', tipo: 'codigo', opcoes: SIM_NAO_IGN, caixa: { p: 1, x: 442.1, y: 609.4, w: 11.8, h: 12.2 }, larg: 3 },
        { n: '14', chave: 'data_hospitalizacao', rotulo: 'Data da hospitalização', tipo: 'data', caixa: { p: 1, x: 459.2, y: 589.7, w: 115.1, h: 11.9 }, larg: 2, quando: (d) => d.hospitalizacao === '1' },
        { n: '15', chave: 'uf_hospital', rotulo: 'UF do hospital', tipo: 'uf', caixa: { p: 1, x: 57.3, y: 562.1, w: 26.9, h: 11.8 }, larg: 2, quando: (d) => d.hospitalizacao === '1' },
        { n: '16', chave: 'municipio_hospital', rotulo: 'Município do hospital', tipo: 'texto', caixa: { p: 1, x: 90, y: 561, w: 125, h: 11 }, larg: 3, quando: (d) => d.hospitalizacao === '1' },
        { n: '16', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: { p: 1, x: 218.6, y: 560.5, w: 86.4, h: 11 }, larg: 2, quando: (d) => d.hospitalizacao === '1' },
        { n: '17', chave: 'nome_hospital', rotulo: 'Nome do hospital', tipo: 'texto', caixa: { p: 1, x: 327, y: 561, w: 143, h: 11 }, larg: 3, quando: (d) => d.hospitalizacao === '1' },
        { n: '17', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: { p: 1, x: 473.8, y: 560.5, w: 100.8, h: 11 }, larg: 2, quando: (d) => d.hospitalizacao === '1' },
      ],
    },
    {
      titulo: 'Hipóteses diagnósticas e local provável de infecção',
      campos: [
        { n: '18', chave: 'hipotese1', rotulo: '1ª hipótese diagnóstica — CID 10', tipo: 'texto', caixa: { p: 1, x: 205, y: 524, w: 355, h: 10 }, larg: 6 },
        { n: '18', chave: 'hipotese2', rotulo: '2ª hipótese diagnóstica — CID 10', tipo: 'texto', caixa: { p: 1, x: 205, y: 499, w: 355, h: 10 }, larg: 6 },
        { n: '19', chave: 'infeccao_pais', rotulo: 'País', tipo: 'texto', caixa: { p: 1, x: 96, y: 458, w: 200, h: 10 }, larg: 3 },
        { n: '19', chave: 'infeccao_uf', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 313, y: 456, w: 16, h: 9 }, fonte: 7, larg: 2 },
        { n: '19', chave: 'infeccao_municipio', rotulo: 'Município', tipo: 'texto', caixa: { p: 1, x: 400, y: 458, w: 160, h: 10 }, larg: 4 },
        { n: '19', chave: 'infeccao_distrito', rotulo: 'Distrito', tipo: 'texto', caixa: { p: 1, x: 110, y: 433, w: 190, h: 10 }, larg: 3 },
        { n: '19', chave: 'infeccao_bairro', rotulo: 'Bairro', tipo: 'texto', caixa: { p: 1, x: 390, y: 433, w: 170, h: 10 }, larg: 3 },
      ],
    },
    {
      titulo: 'Notificante',
      campos: [
        { n: '', chave: 'notificante_unidade', rotulo: 'Município/Unidade de saúde', tipo: 'texto', caixa: { p: 0, x: 64, y: 317, w: 495, h: 11 }, larg: 12 },
        { n: '', chave: 'notificante_nome', rotulo: 'Nome', tipo: 'texto', caixa: { p: 0, x: 64, y: 286, w: 182, h: 11 }, larg: 6 },
        { n: '', chave: 'notificante_funcao', rotulo: 'Função', tipo: 'texto', caixa: { p: 0, x: 254, y: 286, w: 200, h: 11 }, larg: 6 },
      ],
    },
  ],
}
