// Modelos dos documentos da equipe multiprofissional (Nutrição e Serviço Social).
// Cada documento é uma lista de seções; cada campo diz o tipo de entrada.
// O mesmo esquema monta a tela (AbaRegistroMulti) e o impresso (CorpoMultiOficial).
//
// tipos: texto | numero | area | select | chips (várias opções) | calc (calculado, só leitura)
// col: largura em 12 colunas.

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
const alturaM = (v) => { const a = num(v); return a ? (a > 3 ? a / 100 : a) : null }
const fmt = (n, casas = 1) => (n == null ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }))

export function calcularImc(d) {
  const p = num(d.peso_atual); const a = alturaM(d.altura)
  return p && a ? p / (a * a) : null
}
export function classificarImc(imc, idade) {
  if (imc == null) return ''
  if (idade != null && idade < 18) return 'Pediatria: classificar pelo escore-z (OMS)'
  if (idade != null && idade >= 60) return imc < 22 ? 'Baixo peso (idoso)' : imc <= 27 ? 'Eutrofia (idoso)' : 'Sobrepeso (idoso)'
  if (imc < 16) return 'Magreza grau III'
  if (imc < 17) return 'Magreza grau II'
  if (imc < 18.5) return 'Magreza grau I'
  if (imc < 25) return 'Eutrofia'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidade grau I'
  if (imc < 40) return 'Obesidade grau II'
  return 'Obesidade grau III'
}
export function percentualPerda(d) {
  const at = num(d.peso_atual); const hab = num(d.peso_habitual)
  return at && hab && hab > 0 ? ((hab - at) / hab) * 100 : null
}
// NRS-2002 (Kondrup, 2003): estado nutricional (0-3) + gravidade da doença (0-3) + 1 se ≥ 70 anos.
export function pontuarNrs(d, idade) {
  const e = num(String(d.nrs_estado || '').charAt(0)); const g = num(String(d.nrs_gravidade || '').charAt(0))
  if (e == null && g == null) return null
  return (e || 0) + (g || 0) + (idade != null && idade >= 70 ? 1 : 0)
}

const SINTOMAS_GI = ['Sem queixas', 'Inapetência', 'Náuseas', 'Vômitos', 'Diarreia', 'Constipação', 'Distensão abdominal', 'Disfagia', 'Odinofagia', 'Mucosite', 'Xerostomia', 'Pirose']
const VIAS = ['Oral', 'Enteral por SNE', 'Enteral por SNG', 'Enteral por gastrostomia (GTT)', 'Enteral por jejunostomia', 'Parenteral', 'Oral + enteral', 'Dieta zero (jejum)']
const CONSISTENCIAS = ['Geral / livre', 'Branda', 'Pastosa', 'Líquido-pastosa', 'Líquida completa', 'Líquida restrita', 'Não se aplica (enteral/parenteral)']
const CARACTERISTICAS = ['Hipossódica', 'Hipoglicídica (diabética)', 'Hipolipídica', 'Hiperproteica', 'Hipoproteica', 'Hipercalórica', 'Hipocalórica', 'Laxativa', 'Obstipante', 'Para doença renal', 'Hepatoprotetora', 'Sem lactose', 'Sem glúten', 'Pobre em resíduos', 'Rica em fibras']
const DIAG_NUTRI = ['Eutrofia', 'Risco nutricional', 'Desnutrição leve', 'Desnutrição moderada', 'Desnutrição grave', 'Sobrepeso', 'Obesidade grau I', 'Obesidade grau II', 'Obesidade grau III', 'Baixo peso (idoso)']
const REAVALIACAO = ['24 horas', '48 horas', '72 horas', '7 dias', 'Conforme evolução']
const ACEITACAO = ['0 a 25%', '25 a 50%', '50 a 75%', '75 a 100%', 'Em jejum']

export const NUTRICAO_ADMISSAO = {
  titulo: 'ADMISSÃO NUTRICIONAL',
  secoes: [
    { titulo: 'Motivo da internação e história', icone: 'ph-clipboard-text', campos: [
      { k: 'diagnostico_clinico', rotulo: 'Diagnóstico clínico / motivo da internação', tipo: 'texto', col: 12 },
      { k: 'historia', rotulo: 'História clínica e nutricional relevante (comorbidades, cirurgias, internações recentes)', tipo: 'area', col: 12 },
    ] },
    { titulo: 'Antropometria', icone: 'ph-ruler', campos: [
      { k: 'peso_atual', rotulo: 'Peso atual', tipo: 'numero', unidade: 'kg', col: 2 },
      { k: 'metodo_peso', rotulo: 'Peso', tipo: 'select', opcoes: ['Aferido', 'Estimado', 'Referido'], col: 2 },
      { k: 'peso_habitual', rotulo: 'Peso habitual', tipo: 'numero', unidade: 'kg', col: 2 },
      { k: 'altura', rotulo: 'Altura', tipo: 'numero', unidade: 'm', ph: 'ex.: 1,65', col: 2 },
      { k: 'imc', rotulo: 'IMC', tipo: 'calc', col: 2, calc: (d) => { const i = calcularImc(d); return i ? `${fmt(i)} kg/m²` : '' } },
      { k: 'imc_class', rotulo: 'Classificação do IMC', tipo: 'calc', col: 2, calc: (d, ctx) => classificarImc(calcularImc(d), ctx.idade) },
      { k: 'perda_peso', rotulo: 'Perda de peso', tipo: 'calc', col: 2, calc: (d) => { const p = percentualPerda(d); return p == null ? '' : p > 0 ? `${fmt(p)}%` : 'Sem perda' } },
      { k: 'tempo_perda', rotulo: 'Em quanto tempo', tipo: 'select', opcoes: ['1 mês', '3 meses', '6 meses', 'Não sabe informar'], col: 2 },
      { k: 'circ_braco', rotulo: 'Circunferência do braço (CB)', tipo: 'numero', unidade: 'cm', col: 3 },
      { k: 'circ_panturrilha', rotulo: 'Circunferência da panturrilha (CP)', tipo: 'numero', unidade: 'cm', col: 3 },
    ] },
    { titulo: 'Triagem de risco nutricional — NRS-2002', icone: 'ph-gauge', campos: [
      { k: 'nrs_estado', rotulo: 'Estado nutricional prejudicado', tipo: 'select', col: 6, opcoes: [
        '0 - Normal',
        '1 - Perda de peso > 5% em 3 meses ou ingestão 50-75% da necessidade na última semana',
        '2 - Perda > 5% em 2 meses, IMC 18,5-20,5 com estado geral comprometido, ou ingestão 25-50%',
        '3 - Perda > 5% em 1 mês, IMC < 18,5 com estado geral comprometido, ou ingestão 0-25%',
      ] },
      { k: 'nrs_gravidade', rotulo: 'Gravidade da doença (aumento da necessidade)', tipo: 'select', col: 6, opcoes: [
        '0 - Necessidades nutricionais normais',
        '1 - Fratura de quadril, doença crônica com complicação aguda, DPOC, hemodiálise, diabetes, oncologia',
        '2 - Cirurgia abdominal de grande porte, AVC, pneumonia grave, neoplasia hematológica',
        '3 - Trauma cranioencefálico, transplante de medula, paciente crítico (APACHE > 10)',
      ] },
      { k: 'nrs_total', rotulo: 'Pontuação (inclui +1 se ≥ 70 anos)', tipo: 'calc', col: 4, calc: (d, ctx) => { const t = pontuarNrs(d, ctx.idade); return t == null ? '' : `${t} ponto(s)` } },
      { k: 'nrs_resultado', rotulo: 'Resultado', tipo: 'calc', col: 8, calc: (d, ctx) => { const t = pontuarNrs(d, ctx.idade); return t == null ? '' : t >= 3 ? 'COM RISCO NUTRICIONAL (≥ 3) — iniciar terapia nutricional' : 'Sem risco no momento — reavaliar semanalmente' } },
    ] },
    { titulo: 'Anamnese alimentar', icone: 'ph-bowl-food', campos: [
      { k: 'apetite', rotulo: 'Apetite', tipo: 'select', opcoes: ['Preservado', 'Aumentado', 'Diminuído', 'Ausente'], col: 3 },
      { k: 'aceitacao', rotulo: 'Aceitação alimentar atual', tipo: 'select', opcoes: ACEITACAO, col: 3 },
      { k: 'mastigacao', rotulo: 'Mastigação / deglutição', tipo: 'select', opcoes: ['Sem alterações', 'Dificuldade de mastigação', 'Disfagia leve', 'Disfagia moderada', 'Disfagia grave', 'Uso de prótese dentária', 'Edêntulo'], col: 3 },
      { k: 'hidratacao', rotulo: 'Ingestão hídrica', tipo: 'select', opcoes: ['Adequada', 'Reduzida', 'Restrição hídrica'], col: 3 },
      { k: 'sintomas_gi', rotulo: 'Sintomas gastrointestinais', tipo: 'chips', opcoes: SINTOMAS_GI, col: 12 },
      { k: 'alergias_alimentares', rotulo: 'Alergias ou intolerâncias alimentares', tipo: 'texto', col: 6 },
      { k: 'restricoes', rotulo: 'Restrições culturais, religiosas ou preferências', tipo: 'texto', col: 6 },
      { k: 'habitos', rotulo: 'Hábitos alimentares (refeições/dia, recordatório resumido)', tipo: 'area', col: 12 },
    ] },
    { titulo: 'Exames e diagnóstico nutricional', icone: 'ph-flask', campos: [
      { k: 'exames', rotulo: 'Exames laboratoriais relevantes (albumina, Hb, glicemia, ureia, creatinina, eletrólitos...)', tipo: 'area', col: 12 },
      { k: 'diagnostico_nutricional', rotulo: 'Diagnóstico nutricional', tipo: 'select', opcoes: DIAG_NUTRI, col: 4 },
      { k: 'diagnostico_obs', rotulo: 'Detalhamento do diagnóstico nutricional', tipo: 'texto', col: 8 },
    ] },
    { titulo: 'Necessidades nutricionais', icone: 'ph-calculator', campos: [
      { k: 'kcal_kg', rotulo: 'Energia', tipo: 'numero', unidade: 'kcal/kg/dia', col: 3 },
      { k: 'vet', rotulo: 'VET (energia total)', tipo: 'calc', col: 3, calc: (d) => { const k = num(d.kcal_kg); const p = num(d.peso_atual); return k && p ? `${Math.round(k * p)} kcal/dia` : '' } },
      { k: 'ptn_kg', rotulo: 'Proteína', tipo: 'numero', unidade: 'g/kg/dia', col: 3 },
      { k: 'ptn_total', rotulo: 'Proteína total', tipo: 'calc', col: 3, calc: (d) => { const k = num(d.ptn_kg); const p = num(d.peso_atual); return k && p ? `${fmt(k * p, 0)} g/dia` : '' } },
      { k: 'hidrica', rotulo: 'Necessidade hídrica', tipo: 'numero', unidade: 'mL/dia', col: 3 },
    ] },
    { titulo: 'Conduta e prescrição dietética', icone: 'ph-note-pencil', campos: [
      { k: 'via', rotulo: 'Via de alimentação', tipo: 'select', opcoes: VIAS, col: 4 },
      { k: 'consistencia', rotulo: 'Consistência', tipo: 'select', opcoes: CONSISTENCIAS, col: 4 },
      { k: 'fracionamento', rotulo: 'Fracionamento', tipo: 'select', opcoes: ['3 refeições/dia', '4 refeições/dia', '5 refeições/dia', '6 refeições/dia', 'De 3 em 3 horas', 'Contínua (bomba de infusão)'], col: 4 },
      { k: 'caracteristicas', rotulo: 'Características da dieta', tipo: 'chips', opcoes: CARACTERISTICAS, col: 12 },
      { k: 'enteral', rotulo: 'Fórmula enteral / volume / velocidade (se houver)', tipo: 'texto', col: 12 },
      { k: 'suplementacao', rotulo: 'Suplementação oral', tipo: 'texto', col: 12 },
      { k: 'conduta', rotulo: 'Conduta e orientações', tipo: 'area', col: 12 },
      { k: 'reavaliacao', rotulo: 'Reavaliação', tipo: 'select', opcoes: REAVALIACAO, col: 4 },
    ] },
  ],
  resumo: (d) => [d.diagnostico_nutricional, d.via && `Via: ${d.via}`, d.consistencia, d.conduta].filter(Boolean).join(' · '),
}

export const NUTRICAO_EVOLUCAO = {
  titulo: 'EVOLUÇÃO NUTRICIONAL',
  secoes: [
    { titulo: 'Situação atual', icone: 'ph-activity', campos: [
      { k: 'peso_atual', rotulo: 'Peso atual', tipo: 'numero', unidade: 'kg', col: 3 },
      { k: 'metodo_peso', rotulo: 'Peso', tipo: 'select', opcoes: ['Aferido', 'Estimado', 'Referido', 'Não aferido'], col: 3 },
      { k: 'aceitacao', rotulo: 'Aceitação da dieta', tipo: 'select', opcoes: ACEITACAO, col: 3 },
      { k: 'evacuacao', rotulo: 'Evacuações', tipo: 'select', opcoes: ['Presentes, normais', 'Ausentes', 'Diarreicas', 'Endurecidas'], col: 3 },
      { k: 'via', rotulo: 'Via de alimentação em uso', tipo: 'select', opcoes: VIAS, col: 6 },
      { k: 'consistencia', rotulo: 'Consistência em uso', tipo: 'select', opcoes: CONSISTENCIAS, col: 6 },
      { k: 'sintomas_gi', rotulo: 'Sintomas gastrointestinais', tipo: 'chips', opcoes: SINTOMAS_GI, col: 12 },
    ] },
    { titulo: 'Evolução', icone: 'ph-note', campos: [
      { k: 'evolucao', rotulo: 'Evolução nutricional (subjetivo, objetivo, intercorrências)', tipo: 'area', col: 12 },
      { k: 'exames', rotulo: 'Exames do dia relevantes', tipo: 'area', col: 12 },
      { k: 'diagnostico_nutricional', rotulo: 'Diagnóstico nutricional atual', tipo: 'select', opcoes: DIAG_NUTRI, col: 4 },
      { k: 'meta_atingida', rotulo: 'Meta nutricional atingida?', tipo: 'select', opcoes: ['Sim (≥ 75%)', 'Parcialmente (50-75%)', 'Não (< 50%)'], col: 4 },
    ] },
    { titulo: 'Conduta', icone: 'ph-note-pencil', campos: [
      { k: 'decisao', rotulo: 'Conduta', tipo: 'select', opcoes: ['Manter dieta atual', 'Alterar dieta', 'Progredir consistência', 'Iniciar suplementação', 'Iniciar terapia enteral', 'Suspender dieta (jejum)'], col: 4 },
      { k: 'caracteristicas', rotulo: 'Características da dieta', tipo: 'chips', opcoes: CARACTERISTICAS, col: 12 },
      { k: 'prescricao', rotulo: 'Nova prescrição / ajustes', tipo: 'area', col: 12 },
      { k: 'orientacoes', rotulo: 'Orientações (paciente, acompanhante, equipe)', tipo: 'area', col: 12 },
      { k: 'reavaliacao', rotulo: 'Reavaliação', tipo: 'select', opcoes: REAVALIACAO, col: 4 },
    ] },
  ],
  resumo: (d) => [d.aceitacao && `Aceitação ${d.aceitacao}`, d.decisao, d.evolucao].filter(Boolean).join(' · '),
}

const ENCAMINHAMENTOS = ['CRAS', 'CREAS', 'UBS / ESF', 'CAPS', 'Conselho Tutelar', 'Ministério Público', 'Defensoria Pública', 'INSS / Previdência', 'TFD', 'Abrigo / acolhimento institucional', 'Família / rede de apoio', 'Delegacia / rede de proteção', 'Assistência jurídica', 'Cartório (documentação)']
const BENEFICIOS = ['Nenhum', 'Bolsa Família', 'BPC / LOAS', 'Aposentadoria', 'Pensão', 'Auxílio-doença', 'Seguro-defeso', 'Outro']
const VULNERABILIDADES = ['Idoso sem acompanhante', 'Criança ou adolescente', 'Gestante', 'Pessoa com deficiência', 'Sem acompanhante', 'Sem documentos', 'Situação de rua', 'Insegurança alimentar', 'Dependência de álcool ou outras drogas', 'Suspeita de violência', 'Migrante / outro município', 'Morador ribeirinho / área de difícil acesso', 'Desemprego', 'Sem renda']

export const SOCIAL_ADMISSAO = {
  titulo: 'ADMISSÃO DO SERVIÇO SOCIAL',
  secoes: [
    { titulo: 'Acompanhante / responsável', icone: 'ph-users', campos: [
      { k: 'acompanhante_nome', rotulo: 'Nome do acompanhante / responsável', tipo: 'texto', col: 6 },
      { k: 'acompanhante_parentesco', rotulo: 'Parentesco', tipo: 'texto', col: 3 },
      { k: 'acompanhante_telefone', rotulo: 'Telefone', tipo: 'texto', col: 3 },
      { k: 'procedencia', rotulo: 'Procedência', tipo: 'select', opcoes: ['Demanda espontânea', 'SAMU', 'UBS / ESF', 'Outro município', 'Transferência hospitalar', 'Polícia / Bombeiros'], col: 4 },
    ] },
    { titulo: 'Perfil socioeconômico', icone: 'ph-identification-card', campos: [
      { k: 'estado_civil', rotulo: 'Estado civil', tipo: 'select', opcoes: ['Solteiro(a)', 'Casado(a)', 'União estável', 'Divorciado(a)', 'Viúvo(a)'], col: 3 },
      { k: 'escolaridade', rotulo: 'Escolaridade', tipo: 'select', opcoes: ['Não alfabetizado', 'Fundamental incompleto', 'Fundamental completo', 'Médio incompleto', 'Médio completo', 'Superior incompleto', 'Superior completo', 'Não se aplica (criança)'], col: 3 },
      { k: 'ocupacao', rotulo: 'Ocupação / profissão', tipo: 'texto', col: 3 },
      { k: 'situacao_trabalho', rotulo: 'Situação de trabalho', tipo: 'select', opcoes: ['Empregado formal', 'Trabalho informal', 'Autônomo', 'Desempregado', 'Aposentado', 'Pescador / agricultor', 'Estudante', 'Do lar', 'Não se aplica'], col: 3 },
      { k: 'renda_familiar', rotulo: 'Renda familiar', tipo: 'select', opcoes: ['Sem renda', 'Até 1 salário mínimo', '1 a 2 salários mínimos', '2 a 3 salários mínimos', 'Mais de 3 salários mínimos', 'Não informado'], col: 4 },
      { k: 'cadunico', rotulo: 'Inscrito no CadÚnico', tipo: 'select', opcoes: ['Sim', 'Não', 'Não sabe'], col: 3 },
      { k: 'beneficios', rotulo: 'Benefícios sociais', tipo: 'chips', opcoes: BENEFICIOS, col: 12 },
      { k: 'composicao_familiar', rotulo: 'Composição familiar (quem mora com o paciente)', tipo: 'area', col: 12 },
    ] },
    { titulo: 'Moradia e acesso', icone: 'ph-house-line', campos: [
      { k: 'moradia_condicao', rotulo: 'Moradia', tipo: 'select', opcoes: ['Própria', 'Alugada', 'Cedida', 'Ocupação', 'Instituição', 'Situação de rua'], col: 3 },
      { k: 'moradia_zona', rotulo: 'Localização', tipo: 'select', opcoes: ['Urbana', 'Rural', 'Ribeirinha', 'Ilha / comunidade de difícil acesso'], col: 3 },
      { k: 'moradia_tipo', rotulo: 'Construção', tipo: 'select', opcoes: ['Alvenaria', 'Madeira', 'Palafita', 'Mista', 'Outra'], col: 3 },
      { k: 'transporte', rotulo: 'Como chega à unidade', tipo: 'select', opcoes: ['A pé', 'Bicicleta / moto', 'Ônibus', 'Barco / rabeta', 'Carro', 'Ambulância'], col: 3 },
      { k: 'saneamento', rotulo: 'Saneamento e serviços', tipo: 'chips', opcoes: ['Água encanada', 'Água de poço', 'Água de rio', 'Energia elétrica', 'Rede de esgoto', 'Fossa', 'Coleta de lixo'], col: 12 },
      { k: 'tempo_deslocamento', rotulo: 'Tempo de deslocamento até a unidade', tipo: 'texto', col: 6 },
    ] },
    { titulo: 'Documentação e rede de apoio', icone: 'ph-hand-heart', campos: [
      { k: 'documentos', rotulo: 'Documentos que o paciente possui', tipo: 'chips', opcoes: ['RG', 'CPF', 'Cartão SUS', 'Certidão de nascimento', 'Certidão de casamento', 'Título de eleitor', 'Carteira de trabalho', 'Nenhum'], col: 12 },
      { k: 'rede_apoio', rotulo: 'Rede de apoio', tipo: 'chips', opcoes: ['Família', 'Vizinhos / comunidade', 'Igreja / grupo religioso', 'UBS / ESF', 'CRAS', 'CREAS', 'CAPS', 'Sem rede de apoio'], col: 12 },
      { k: 'rede_obs', rotulo: 'Observações sobre a rede de apoio', tipo: 'texto', col: 12 },
    ] },
    { titulo: 'Avaliação social', icone: 'ph-clipboard-text', campos: [
      { k: 'vulnerabilidades', rotulo: 'Situações de vulnerabilidade identificadas', tipo: 'chips', opcoes: VULNERABILIDADES, col: 12 },
      { k: 'demanda', rotulo: 'Demanda apresentada', tipo: 'area', col: 12 },
      { k: 'parecer', rotulo: 'Avaliação / parecer social', tipo: 'area', col: 12 },
    ] },
    { titulo: 'Plano de intervenção', icone: 'ph-signpost', campos: [
      { k: 'encaminhamentos', rotulo: 'Encaminhamentos', tipo: 'chips', opcoes: ENCAMINHAMENTOS, col: 12 },
      { k: 'plano', rotulo: 'Plano de intervenção e orientações realizadas', tipo: 'area', col: 12 },
      { k: 'notificacao', rotulo: 'Notificação / comunicação obrigatória', tipo: 'select', opcoes: ['Não se aplica', 'Realizada', 'Pendente'], col: 4 },
    ] },
  ],
  resumo: (d) => [Array.isArray(d.vulnerabilidades) && d.vulnerabilidades.join(', '), d.demanda, Array.isArray(d.encaminhamentos) && d.encaminhamentos.length && `Encaminhamentos: ${d.encaminhamentos.join(', ')}`].filter(Boolean).join(' · '),
}

export const SOCIAL_EVOLUCAO = {
  titulo: 'EVOLUÇÃO DO SERVIÇO SOCIAL',
  secoes: [
    { titulo: 'Atendimento', icone: 'ph-chats', campos: [
      { k: 'atendido', rotulo: 'Atendimento realizado com', tipo: 'chips', opcoes: ['Paciente', 'Acompanhante', 'Familiar', 'Equipe médica', 'Equipe de enfermagem', 'Outra instituição'], col: 12 },
      { k: 'contato_nome', rotulo: 'Nome / vínculo de quem foi atendido', tipo: 'texto', col: 8 },
      { k: 'contato_telefone', rotulo: 'Telefone', tipo: 'texto', col: 4 },
    ] },
    { titulo: 'Evolução', icone: 'ph-note', campos: [
      { k: 'demanda', rotulo: 'Demanda / situação identificada', tipo: 'area', col: 12 },
      { k: 'intervencao', rotulo: 'Intervenção realizada', tipo: 'area', col: 12 },
      { k: 'contatos', rotulo: 'Contatos institucionais realizados (órgão, pessoa, telefone, horário)', tipo: 'area', col: 12 },
      { k: 'encaminhamentos', rotulo: 'Encaminhamentos', tipo: 'chips', opcoes: ENCAMINHAMENTOS, col: 12 },
    ] },
    { titulo: 'Situação e próximos passos', icone: 'ph-signpost', campos: [
      { k: 'situacao_social', rotulo: 'Situação social para a alta', tipo: 'select', opcoes: ['Sem pendências sociais', 'Pendência em andamento', 'Pendência sem solução até o momento'], col: 6 },
      { k: 'parecer', rotulo: 'Parecer social', tipo: 'area', col: 12 },
      { k: 'plano', rotulo: 'Plano / próximos passos', tipo: 'area', col: 12 },
    ] },
  ],
  resumo: (d) => [d.situacao_social, d.intervencao, Array.isArray(d.encaminhamentos) && d.encaminhamentos.length && `Encaminhamentos: ${d.encaminhamentos.join(', ')}`].filter(Boolean).join(' · '),
}

// Abas do prontuário multiprofissional.
export const DOCUMENTOS_MULTI = {
  nutricaoAdmissao: { tabela: 'registros_nutricao', tipo: 'admissao', esquema: NUTRICAO_ADMISSAO, funcao: 'nutricionista', impresso: 'nutricao_admissao', rotulo: '1. Admissão Nutricional', titulo: 'Admissão Nutricional', icon: 'ph-bowl-food' },
  nutricaoEvolucao: { tabela: 'registros_nutricao', tipo: 'evolucao', esquema: NUTRICAO_EVOLUCAO, funcao: 'nutricionista', impresso: 'nutricao_evolucao', rotulo: '2. Evolução Nutricional', titulo: 'Evolução Nutricional', icon: 'ph-chart-line-up' },
  socialAdmissao: { tabela: 'registros_servico_social', tipo: 'admissao', esquema: SOCIAL_ADMISSAO, funcao: 'assistente_social', impresso: 'social_admissao', rotulo: '3. Admissão Serviço Social', titulo: 'Admissão do Serviço Social', icon: 'ph-hand-heart' },
  socialEvolucao: { tabela: 'registros_servico_social', tipo: 'evolucao', esquema: SOCIAL_EVOLUCAO, funcao: 'assistente_social', impresso: 'social_evolucao', rotulo: '4. Evolução Serviço Social', titulo: 'Evolução do Serviço Social', icon: 'ph-chats-circle' },
}
export const DOC_POR_IMPRESSO = Object.fromEntries(Object.values(DOCUMENTOS_MULTI).map((d) => [d.impresso, d]))
export const CONSELHO_POR_FUNCAO = { nutricionista: 'CRN', assistente_social: 'CRESS' }

// Texto de um campo para o impresso (valores calculados recalculados na hora).
export function valorCampo(campo, d, ctx) {
  if (campo.tipo === 'calc') return campo.calc(d, ctx) || ''
  const v = d[campo.k]
  if (Array.isArray(v)) return v.join(', ')
  if (v == null || v === '') return ''
  return campo.unidade ? `${v} ${campo.unidade}` : String(v)
}
