// Agravos de notificação compulsória disponíveis no programa.
// `modelo` = ficha usada (as que não têm ficha própria saem na Notificação Individual).
// `imediata` = notificação em até 24 horas.
// `sigiloso` = ficha com acesso restrito (só quem notificou e administradores).
// CID-10 conforme a ficha/Lista Nacional; o campo continua editável na tela.
export const AGRAVOS = [
  { nome: 'Dengue e Chikungunya', cid: 'A90 / A92.0', cids: ['A90', 'A91', 'A92.0'], modelo: 'DENGUE_CHIKUNGUNYA' },
  { nome: 'Malária', cid: 'B54', modelo: 'MALARIA', imediata: true, obs: 'Imediata quando fora da região amazônica' },
  { nome: 'Acidente por animal peçonhento', cid: 'X29', modelo: 'ANIMAIS_PECONHENTOS' },
  { nome: 'Atendimento antirrábico humano', cid: 'W64', modelo: 'ANTIRRABICO' },
  { nome: 'Violência interpessoal/autoprovocada', cid: 'Y09', modelo: 'VIOLENCIA', sigiloso: true },
  { nome: 'Acidente de trabalho com exposição a material biológico', cid: 'Z20.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Acidente de trabalho grave, fatal e em crianças e adolescentes', cid: 'Y96', modelo: 'ACIDENTE_TRABALHO' },
  { nome: 'Botulismo', cid: 'A05.1', modelo: 'BOTULISMO', imediata: true },
  { nome: 'Cólera', cid: 'A00.9', modelo: 'COLERA', imediata: true },
  { nome: 'Coqueluche', cid: 'A37.9', modelo: 'COQUELUCHE', imediata: true },
  { nome: 'Doença de Chagas aguda', cid: 'B57.1', modelo: 'CHAGAS', imediata: true },
  { nome: 'Difteria', cid: 'A36.9', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Meningites (doença meningocócica e outras meningites)', cid: 'A39.9 / G03.9', cids: ['A39', 'G00', 'G01', 'G02', 'G03', 'A17.0', 'A87'], modelo: 'MENINGITE', imediata: true },
  { nome: 'Esquistossomose', cid: 'B65.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Evento adverso grave ou óbito pós-vacinação', cid: 'T88.1', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Febre amarela', cid: 'A95.9', modelo: 'FEBRE_AMARELA', imediata: true },
  { nome: 'Febre maculosa e outras riquetsioses', cid: 'A77.9', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Febre tifoide', cid: 'A01.0', modelo: 'FEBRE_TIFOIDE', imediata: true },
  { nome: 'Hanseníase', cid: 'A30.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Hantavirose', cid: 'A98.5', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Hepatites virais', cid: 'B19', modelo: 'HEPATITES_VIRAIS' },
  { nome: 'AIDS (13 anos ou mais)', cid: 'B24', modelo: 'AIDS_ADULTO', sigiloso: true },
  { nome: 'AIDS em menores de 13 anos', cid: 'B24', modelo: 'AIDS_CRIANCA', sigiloso: true },
  { nome: 'Gestante HIV+', cid: 'Z21', modelo: 'GESTANTE_HIV', sigiloso: true },
  { nome: 'Influenza humana produzida por novo subtipo viral', cid: 'J11', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Intoxicação exógena', cid: 'T65.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Leishmaniose tegumentar americana', cid: 'B55.1', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Leishmaniose visceral', cid: 'B55.0', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Leptospirose', cid: 'A27.9', modelo: 'LEPTOSPIROSE', imediata: true },
  { nome: 'Paralisia flácida aguda / Poliomielite', cid: 'A80.9', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Peste', cid: 'A20.9', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Raiva humana', cid: 'A82.9', modelo: 'NOTIFICACAO_INDIVIDUAL', imediata: true },
  { nome: 'Sarampo e Rubéola (doenças exantemáticas)', cid: 'B05.9 / B06.9', cids: ['B05', 'B06'], modelo: 'EXANTEMATICA', imediata: true },
  { nome: 'Sífilis adquirida', cid: 'A53.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Sífilis em gestante', cid: 'O98.1', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Sífilis congênita', cid: 'A50.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Síndrome respiratória aguda grave (SRAG) internada ou óbito', cid: 'J11', modelo: 'SRAG' },
  { nome: 'Síndrome gripal suspeita de COVID-19', cid: 'B34.2', modelo: 'COVID19' },
  { nome: 'Tétano acidental', cid: 'A35', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Tétano neonatal', cid: 'A33', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Toxoplasmose gestacional e congênita', cid: 'O98.6', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Tuberculose', cid: 'A16.9', modelo: 'TUBERCULOSE' },
  { nome: 'Varicela (caso grave internado ou óbito)', cid: 'B01.9', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Zika vírus', cid: 'A92.8', modelo: 'NOTIFICACAO_INDIVIDUAL' },
  { nome: 'Outro agravo (informar)', cid: '', modelo: 'NOTIFICACAO_INDIVIDUAL', livre: true },
  { nome: 'Conclusão de caso — agravo sem ficha de investigação (informar)', cid: '', modelo: 'NOTIFICACAO_CONCLUSAO', livre: true },
]

// Fichas disponíveis (carregadas só quando abertas).
export const MODELOS = {
  NOTIFICACAO_INDIVIDUAL: () => import('./modelos/notificacaoIndividual'),
  DENGUE_CHIKUNGUNYA: () => import('./modelos/dengueChikungunya'),
  MALARIA: () => import('./modelos/malaria'),
  ANIMAIS_PECONHENTOS: () => import('./modelos/animaisPeconhentos'),
  ANTIRRABICO: () => import('./modelos/antirrabico'),
  VIOLENCIA: () => import('./modelos/violencia'),
  TUBERCULOSE: () => import('./modelos/tuberculose'),
  HEPATITES_VIRAIS: () => import('./modelos/hepatitesVirais'),
  LEPTOSPIROSE: () => import('./modelos/leptospirose'),
  SRAG: () => import('./modelos/srag'),
  COVID19: () => import('./modelos/covid19'),
  MENINGITE: () => import('./modelos/meningite'),
  ACIDENTE_TRABALHO: () => import('./modelos/acidenteTrabalho'),
  AIDS_ADULTO: () => import('./modelos/aidsAdulto'),
  AIDS_CRIANCA: () => import('./modelos/aidsCrianca'),
  GESTANTE_HIV: () => import('./modelos/gestanteHiv'),
  CHAGAS: () => import('./modelos/chagas'),
  COQUELUCHE: () => import('./modelos/coqueluche'),
  EXANTEMATICA: () => import('./modelos/exantematica'),
  FEBRE_AMARELA: () => import('./modelos/febreAmarela'),
  BOTULISMO: () => import('./modelos/botulismo'),
  COLERA: () => import('./modelos/colera'),
  FEBRE_TIFOIDE: () => import('./modelos/febreTifoide'),
  NOTIFICACAO_CONCLUSAO: () => import('./modelos/notificacaoConclusao'),
}

export const carregarModelo = async (id) => (await MODELOS[id]()).default

// Sugere agravos pelo CID do diagnóstico (ex.: B54 → Malária).
export function agravosPorCid(cid) {
  const c = String(cid || '').toUpperCase().replace(/\s/g, '')
  if (!c) return []
  const bate = (k) => c.startsWith(k.replace('.', '')) || c.startsWith(k)
  return AGRAVOS.filter((a) => (a.cids || (a.cid ? [a.cid] : [])).some(bate))
}
