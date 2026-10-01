// Ficha de Registro Individual — SRAG internada ou óbito por SRAG (Sinan Influenza, SVS-MS 22/08/2012) — Srag_v5.pdf
// Numeração própria desta ficha (1 a 52), diferente das fichas de investigação.
import { SEXO, UNID_IDADE, GESTANTE, RACA, ZONA, soFeminino, pente } from './comum'

const SNI = [['1', 'Sim'], ['2', 'Não'], ['9', 'Ignorado']]
const RES = [['1', 'Positivo'], ['2', 'Negativo'], ['3', 'Inconclusivo'], ['4', 'Não realizado']]
const cx = (p, x, y, w = 11, h = 11) => ({ p, x, y, w, h })
const cod = (n, chave, rotulo, op, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'codigo', opcoes: op, caixa, larg: 3, ...extra })
const txt = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'texto', caixa, larg: 4, ...extra })
const data = (n, chave, rotulo, caixa, extra = {}) => ({ n, chave, rotulo, tipo: 'data', caixa, larg: 3, ...extra })
const internou = (d) => d.hospitalizacao === '1'
const uti = (d) => d.uti === '1'
const infA = (d) => d.res_influenza_a === '1'

export default {
  id: 'SRAG',
  titulo: 'Ficha de Registro Individual — SRAG internada ou óbito por SRAG',
  arquivo: 'Srag_v5.pdf',
  secoes: [
    {
      titulo: 'Dados da unidade de saúde, do indivíduo e de sua residência',
      campos: [
        data('1', 'data_notificacao', 'Data do preenchimento', { p: 0, x: 40.6, y: 675.6, w: 113.9, h: 11.8 }, { obrig: true }),
        { n: '2', chave: 'uf_notificacao', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 159.4, y: 675.8, w: 27.1, h: 12 }, larg: 1, obrig: true },
        txt('3', 'municipio_notificacao', 'Município de registro do caso', { p: 0, x: 190, y: 677, w: 290, h: 10 }, { obrig: true }),
        { n: '3', chave: 'ibge_notificacao', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [494.4, 509.3, 524.2, 539.0, 553.9], 675), larg: 3, obrig: true },
        txt('4', 'unidade_notificadora', 'Unidade de saúde de identificação do caso', { p: 0, x: 44, y: 641, w: 290, h: 10 }, { larg: 6, obrig: true }),
        { n: '4', chave: 'cnes', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: pente(0, [349.9, 364.8, 379.7, 394.5, 409.4, 424.3], 641), larg: 3, obrig: true },
        data('5', 'data_primeiros_sintomas', 'Data dos primeiros sintomas', { p: 0, x: 446.6, y: 641.3, w: 114.0, h: 11.8 }, { obrig: true }),
        txt('6', 'nome', 'Nome', { p: 0, x: 44, y: 612, w: 345, h: 10 }, { larg: 8, obrig: true }),
        { n: '7', chave: 'cns', rotulo: 'Número do cartão SUS', tipo: 'digitos', digitos: 15, caixa: { p: 0, x: 391.4, y: 610.3, w: 175.7, h: 12.2 }, larg: 4 },
        data('8', 'data_nascimento', 'Data de nascimento', { p: 0, x: 35.0, y: 578.6, w: 110.9, h: 11.3 }),
        { n: '9', chave: 'idade', rotulo: '(ou) Idade', tipo: 'digitos', digitos: 3, caixa: pente(0, [181.4, 195.5], 578, 10, 14.1), larg: 2, obrig: true },
        cod('9', 'unidade_idade', 'Unidade da idade', UNID_IDADE, cx(0, 209.4, 592, 16, 14), { larg: 2, obrig: true }),
        cod('10', 'sexo', 'Sexo', SEXO, { p: 0, x: 325.2, y: 591.8, w: 20.2, h: 13.4 }, { larg: 2, obrig: true }),
        cod('11', 'gestante', 'Gestante', GESTANTE, cx(0, 541.2, 589.0, 16.6, 14.6), { obrig: true, quando: soFeminino, senao: '6' }),
        cod('12', 'raca', 'Raça/cor', RACA, cx(0, 106.6, 561.4, 15.1, 13.7), { obrig: true }),
        cod('13', 'escolaridade_srag', 'Escolaridade', [['0', 'Analfabeto'], ['1', 'Fundamental (1-9 anos)'], ['2', 'Médio (1-3 anos)'], ['3', 'Superior'], ['9', 'Ignorado'], ['10', 'Não se aplica']], cx(0, 294.2, 560.4, 15.1, 15.6), { obrig: true }),
        txt('14', 'nome_mae', 'Nome da mãe', { p: 0, x: 318, y: 546, w: 247, h: 10 }),
        { n: '15', chave: 'uf_residencia', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 27, y: 516, w: 28, h: 10 }, larg: 1 },
        txt('16', 'municipio_residencia', 'Município de residência', { p: 0, x: 62, y: 516, w: 255, h: 10 }),
        { n: '16', chave: 'ibge_residencia', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [328.3, 343.2, 358.1, 372.9, 387.8], 514), larg: 3 },
        txt('17', 'distrito', 'Distrito', { p: 0, x: 405, y: 516, w: 160, h: 10 }),
        txt('18', 'bairro', 'Bairro', { p: 0, x: 30, y: 489, w: 150, h: 10 }, { larg: 3 }),
        txt('19', 'logradouro', 'Logradouro (rua, avenida...)', { p: 0, x: 186, y: 489, w: 290, h: 10 }, { larg: 6 }),
        { n: '19', chave: 'logradouro_codigo', rotulo: 'Código do logradouro', tipo: 'digitos', digitos: 6, caixa: pente(0, [493.0, 507.8, 522.7, 537.6, 552.5], 489), larg: 3 },
        txt('20', 'numero', 'Número', { p: 0, x: 30, y: 463, w: 50, h: 10 }, { larg: 2 }),
        txt('21', 'complemento', 'Complemento (edifício, apartamento, casa...)', { p: 0, x: 86, y: 463, w: 480, h: 10 }, { larg: 10 }),
        txt('22', 'ponto_referencia', 'Ponto de referência', { p: 0, x: 30, y: 437, w: 405, h: 10 }, { larg: 8 }),
        { n: '23', chave: 'cep', rotulo: 'CEP', tipo: 'digitos', digitos: 8, caixa: { p: 0, x: 442.8, y: 436.6, w: 124.1, h: 14.2 }, larg: 4 },
        { n: '24', chave: 'telefone', rotulo: '(DDD) Telefone', tipo: 'digitos', digitos: 10, caixa: { p: 0, x: 28.3, y: 405.6, w: 141.6, h: 14.6 }, larg: 4 },
        cod('25', 'zona', 'Zona', ZONA, cx(0, 275.3, 417.4, 13.7, 13.4)),
        txt('26', 'pais', 'País (se residente fora do Brasil)', { p: 0, x: 300, y: 408, w: 265, h: 10 }, { larg: 5 }),
      ],
    },
    {
      titulo: 'Antecedentes e histórico da internação ou do óbito',
      campos: [
        cod('27', 'vacina_gripe', 'Recebeu vacina contra gripe nos últimos 12 meses?', SNI, cx(0, 388.8, 363.8, 17.8, 16.3), { larg: 5, obrig: true }),
        data('28', 'data_ultima_dose', 'Se sim, data da última dose', { p: 0, x: 449.5, y: 357.8, w: 115.8, h: 10.8 }, { quando: (d) => d.vacina_gripe === '1' }),
        ...[['febre', 'Febre', 39.1, 326.4], ['tosse', 'Tosse', 124.1, 327.4], ['garganta', 'Dor de garganta', 194.4, 327.4], ['dispneia', 'Dispneia', 294.2, 326.4], ['mialgia', 'Mialgia', 364.3, 326.4],
          ['saturacao', 'Saturação de O2 < 95%', 429.1, 326.4], ['desconforto', 'Desconforto respiratório', 39.1, 312.0], ['outros', 'Outros sinais e sintomas importantes', 194.4, 312.0]]
          .map(([k, r, x, y]) => cod('29', `sinal_${k}`, `Sinal/sintoma: ${r}`, SNI, cx(0, x, y), { obrig: true })),
        txt('29', 'sinal_outros_espec', 'Outros sinais e sintomas (especificar)', { p: 0, x: 347, y: 312, w: 208, h: 8 }, { fonte: 7, quando: (d) => d.sinal_outros === '1' }),
        ...[['pneumopatia', 'Pneumopatias crônicas', 45.8, 277.7], ['neurologica', 'Doença neurológica crônica', 45.8, 263.3], ['puerperio', 'Puerpério (até 42 dias do parto)', 45.8, 249.8], ['outros', 'Outros fatores de risco', 45.8, 235.7],
          ['cardiovascular', 'Doença cardiovascular crônica', 181.0, 279.6], ['renal', 'Doença renal crônica', 181.0, 265.2], ['obesidade', 'Obesidade', 181.0, 250.1],
          ['imunodeficiencia', 'Imunodeficiência/imunodepressão', 313.2, 279.6], ['down', 'Síndrome de Down', 313.2, 265.2], ['hepatica', 'Doença hepática crônica', 456.2, 279.6], ['diabetes', 'Diabetes mellitus', 456.2, 264.2]]
          .map(([k, r, x, y]) => cod('30', `risco_${k}`, `Fator de risco: ${r}`, SNI, cx(0, x, y), { obrig: true })),
        txt('30', 'imc', 'IMC (se obesidade)', { p: 0, x: 345, y: 255, w: 27, h: 8 }, { larg: 2, fonte: 7, quando: (d) => d.risco_obesidade === '1' }),
        txt('30', 'risco_outros_espec', 'Outros fatores de risco (especificar)', { p: 0, x: 241, y: 236, w: 315, h: 8 }, { fonte: 7, quando: (d) => d.risco_outros === '1' }),
        cod('31', 'antiviral', 'Uso de antiviral?', [['1', 'Não usou'], ['2', 'Oseltamivir'], ['3', 'Zanamivir'], ['4', 'Outro'], ['9', 'Ignorado']], cx(0, 414.2, 198.7, 16.6, 15.4), { obrig: true }),
        txt('31', 'antiviral_outro', 'Outro antiviral (especificar)', { p: 0, x: 145, y: 196, w: 95, h: 7 }, { fonte: 6, quando: (d) => d.antiviral === '4' }),
        data('32', 'data_antiviral', 'Data de início do tratamento', { p: 0, x: 449.5, y: 195.6, w: 115.8, h: 11.5 }, { quando: (d) => ['2', '3', '4'].includes(d.antiviral) }),
        cod('33', 'hospitalizacao', 'Ocorreu internação?', SNI, cx(0, 127.0, 170.6), { obrig: true }),
        data('34', 'data_hospitalizacao', 'Data da internação', { p: 0, x: 145.7, y: 160.3, w: 112.6, h: 11.8 }, { quando: internou }),
        { n: '35', chave: 'uf_hospital', rotulo: 'UF', tipo: 'uf', caixa: { p: 0, x: 259, y: 160, w: 28, h: 10 }, larg: 1, quando: internou },
        txt('36', 'municipio_hospital', 'Município da unidade de internação', { p: 0, x: 292, y: 160, w: 190, h: 10 }, { quando: internou }),
        { n: '36', chave: 'ibge_hospital', rotulo: 'Código (IBGE)', tipo: 'digitos', digitos: 6, caixa: pente(0, [493.0, 507.8, 522.7, 537.6, 552.5], 158), larg: 3, quando: internou },
        txt('37', 'nome_hospital', 'Nome da unidade de saúde da internação', { p: 0, x: 44, y: 129, w: 410, h: 10 }, { larg: 8, quando: internou }),
        { n: '37', chave: 'cnes_hospital', rotulo: 'Código (CNES)', tipo: 'digitos', digitos: 7, caixa: { p: 0, x: 461.7, y: 127, w: 104.2, h: 10 }, larg: 3, quando: internou },
        cod('38', 'raio_x', 'Raio X de tórax', [['1', 'Normal'], ['2', 'Infiltrado intersticial'], ['3', 'Consolidação'], ['4', 'Misto'], ['5', 'Outro'], ['6', 'Não realizado'], ['9', 'Ignorado']], cx(0, 409.0, 95.5, 16.3, 16.6), { obrig: true }),
        txt('38', 'raio_x_outro', 'Outro achado (especificar)', { p: 0, x: 96, y: 96, w: 140, h: 6 }, { fonte: 6, quando: (d) => d.raio_x === '5' }),
        data('39', 'data_raio_x', 'Data do raio X', { p: 0, x: 449.5, y: 90.5, w: 115.8, h: 11.8 }, { quando: (d) => d.raio_x && !['6', '9'].includes(d.raio_x) }),
        cod('40', 'suporte_ventilatorio', 'Fez uso de suporte ventilatório?', [['1', 'Não usou'], ['2', 'Sim, invasivo'], ['3', 'Sim, não invasivo'], ['9', 'Ignorado']], cx(0, 408, 65, 17, 17), { obrig: true }),
        cod('41', 'uti', 'Foi internado em Unidade de Terapia Intensiva?', SNI, cx(0, 277.5, 33.5, 17, 17), { larg: 4, obrig: true }),
        data('42', 'data_entrada_uti', 'Data de entrada na UTI', { p: 0, x: 318.5, y: 27.6, w: 115.8, h: 11.8 }, { quando: uti }),
        data('43', 'data_saida_uti', 'Data de saída da UTI', { p: 0, x: 449.5, y: 27.8, w: 115.8, h: 11.5 }, { quando: uti }),
      ],
    },
    {
      titulo: 'Dados laboratoriais',
      campos: [
        cod('44', 'tipo_amostra', 'Coletou que tipo de amostra?', [['1', 'Não coletou'], ['2', 'Secreção de oro e nasofaringe'], ['3', 'Tecido post-mortem'], ['4', 'Lavado broncoalveolar'], ['5', 'Outro'], ['9', 'Ignorado']], cx(1, 38.6, 762.5, 14.9, 14.6), { larg: 5, obrig: true }),
        txt('44', 'tipo_amostra_outro', 'Outro tipo de amostra (especificar)', { p: 1, x: 249, y: 757, w: 180, h: 7 }, { fonte: 6.5, quando: (d) => d.tipo_amostra === '5' }),
        data('45', 'data_coleta', 'Data da coleta', { p: 1, x: 450.0, y: 745.0, w: 114.0, h: 11 }, { quando: (d) => d.tipo_amostra && !['1', '9'].includes(d.tipo_amostra) }),
        cod('46', 'met_ifi', 'Metodologia: IFI', SNI, cx(1, 56.2, 709.0, 14.2, 15.4)),
        data('46', 'data_res_ifi', 'Data do resultado — IFI', { p: 1, x: 41.8, y: 670.3, w: 105.3, h: 10.6 }, { quando: (d) => d.met_ifi === '1' }),
        cod('46', 'met_rtpcr', 'Metodologia: RT-PCR', SNI, cx(1, 172.1, 712.8, 13.9, 15.4)),
        cod('46', 'tipo_rtpcr', 'Tipo de RT-PCR', [['1', 'Convencional'], ['2', 'Em tempo real']], cx(1, 191.8, 700.3, 9.6, 11.5), { quando: (d) => d.met_rtpcr === '1' }),
        data('46', 'data_res_rtpcr', 'Data do resultado — RT-PCR', { p: 1, x: 195.1, y: 669.8, w: 105.4, h: 10.6 }, { quando: (d) => d.met_rtpcr === '1' }),
        cod('46', 'met_outro', 'Metodologia: outro método', SNI, cx(1, 352.1, 713.8, 13.9, 15.4)),
        txt('46', 'met_outro_espec', 'Outro método (especificar, ex.: cultura)', { p: 1, x: 350, y: 690, w: 95, h: 7 }, { fonte: 6.5, quando: (d) => d.met_outro === '1' }),
        data('46', 'data_res_outro', 'Data do resultado do outro método', { p: 1, x: 451.9, y: 668.6, w: 105.1, h: 10.6 }, { quando: (d) => d.met_outro === '1' }),
        cod('47', 'res_influenza_a', 'Diagnóstico etiológico: influenza A', RES, cx(1, 37.0, 611.3, 16.8, 17.3), { obrig: true }),
        cod('47', 'subtipo_influenza_a', 'Se positivo para influenza A, qual subtipo', [['1', 'Influenza A(H1N1)pdm09'], ['2', 'Influenza A/H1 sazonal'], ['3', 'Influenza A/H3 sazonal'], ['4', 'Influenza A não subtipado'], ['5', 'Influenza A/H3N2v'], ['6', 'Outro subtipo']], cx(1, 235.0, 601.2, 13.4, 13.2), { quando: infA }),
        txt('47', 'subtipo_outro', 'Outro subtipo de influenza A (especificar)', { p: 1, x: 416, y: 593, w: 42, h: 7 }, { fonte: 6, quando: (d) => infA(d) && d.subtipo_influenza_a === '6' }),
        cod('47', 'res_influenza_b', 'Diagnóstico etiológico: influenza B', RES, cx(1, 37.0, 586.6, 16.8, 17.0), { obrig: true }),
        cod('47', 'res_vsr', 'Vírus sincicial respiratório (VSR)', RES, cx(1, 37.7, 550.6, 17, 17), { obrig: true }),
        cod('47', 'res_parainfluenza1', 'Parainfluenza 1', RES, cx(1, 189.4, 550.6, 17, 17), { obrig: true }),
        cod('47', 'res_parainfluenza2', 'Parainfluenza 2', RES, cx(1, 272.2, 550.1, 17, 17), { obrig: true }),
        cod('47', 'res_parainfluenza3', 'Parainfluenza 3', RES, cx(1, 360.0, 550.6, 17, 17), { obrig: true }),
        cod('47', 'res_adenovirus', 'Adenovírus', RES, cx(1, 458.2, 549.6, 16.8, 17), { obrig: true }),
        cod('47', 'res_outro_virus', 'Outro vírus ou agente etiológico', RES, cx(1, 37.7, 527.8, 17, 17)),
        txt('47', 'outro_virus_espec', 'Outro vírus/agente (especificar)', { p: 1, x: 220, y: 529, w: 180, h: 7 }, { fonte: 6.5, quando: (d) => d.res_outro_virus === '1' }),
      ],
    },
    {
      titulo: 'Conclusão',
      campos: [
        cod('48', 'classificacao_final', 'Classificação final da SRAG', [['1', 'SRAG por influenza'], ['2', 'SRAG por outros vírus respiratórios'], ['3', 'SRAG por outros agentes etiológicos'], ['4', 'SRAG não especificada']], cx(1, 380, 453, 18, 18), { larg: 5 }),
        txt('48', 'classificacao_outros_agentes', 'Outros agentes etiológicos (especificar)', { p: 1, x: 225, y: 456, w: 150, h: 7 }, { fonte: 6.5, quando: (d) => d.classificacao_final === '3' }),
        cod('49', 'criterio', 'Critério de confirmação', [['1', 'Laboratorial'], ['2', 'Clínico-epidemiológico'], ['3', 'Clínico']], cx(1, 530, 453, 18, 18)),
        cod('50', 'evolucao', 'Evolução clínica', [['1', 'Recebeu alta por cura'], ['2', 'Evoluiu para óbito'], ['9', 'Ignorado']], cx(1, 243, 390, 18, 18)),
        data('51', 'data_alta_obito', 'Data da alta ou óbito', { p: 1, x: 318.2, y: 379.2, w: 114.0, h: 10.8 }, { quando: (d) => ['1', '2'].includes(d.evolucao) }),
        data('52', 'data_encerramento', 'Data do encerramento', { p: 1, x: 446.4, y: 379.2, w: 114.0, h: 11.8 }),
        { n: '', chave: 'observacoes', rotulo: 'Anotações', tipo: 'texto_longo', linhas: [239.3, 228.2, 215.3, 202.3, 189.6, 176.4, 163.7, 150.7, 137.8, 124.8, 111.8, 98.9].map((y) => ({ p: 1, x: 28.1, y, w: 539, h: 12 })), larg: 12 },
      ],
    },
    {
      titulo: 'Dados do responsável pelo preenchimento',
      campos: [
        { n: '', chave: 'uf_notificacao', rotulo: 'UF', tipo: 'uf', caixa: { p: 1, x: 28.1, y: 55.2, w: 27.4, h: 12.2 }, larg: 1, espelho: true },
        { n: '', chave: 'municipio_notificacao', rotulo: 'Município', tipo: 'texto', caixa: { p: 1, x: 60, y: 56, w: 210, h: 10 }, larg: 3, espelho: true },
        { n: '', chave: 'unidade_notificadora', rotulo: 'Nome da unidade', tipo: 'texto', caixa: { p: 1, x: 280, y: 56, w: 185, h: 10 }, larg: 4, espelho: true },
        { n: '', chave: 'cnes', rotulo: 'Código da unidade de saúde', tipo: 'digitos', digitos: 7, caixa: pente(1, [480.5, 495.4, 510.2, 525.1, 540.0, 554.9], 56), larg: 4, espelho: true },
        txt('', 'notificante_nome', 'Nome', { p: 1, x: 30, y: 30, w: 265, h: 10 }, { larg: 6 }),
        txt('', 'notificante_funcao', 'Função', { p: 1, x: 300, y: 30, w: 140, h: 10 }, { larg: 6 }),
      ],
    },
  ],
}
