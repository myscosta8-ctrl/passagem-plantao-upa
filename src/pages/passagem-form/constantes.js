export const DISPOSITIVOS_OPCOES = ['AVP', 'SVD', 'SNE', 'Dreno', 'O2']

export const NIVEIS_CONSCIENCIA = [
  'Consciente',
  'Confuso',
  'Sonolento',
  'Sedado',
  'Torporoso',
  'Agitado',
  'Inconsciente'
]

export const PASSAGEM_VAZIA = {
  curativo_realizado: null,
  avp_data_insercao: '',
  avp_hora_insercao: '',
  nivel_consciencia: '',
  dispositivos: [],
  dispositivos_detalhe: '',
  acompanhante: null,

  leito_liberado_outro_hospital: null,
  leito_liberado_hospital: '',
  leito_liberado_transporte: '',
  alta_sala_vermelha: null,
  alta_sala_vermelha_data: '',
  alta_sala_vermelha_hora: '',

  pendencias: '',
}

export const ROTULO_STATUS_EXAME = {
  a_realizar: 'A realizar',
  aguardando_laudo: 'Aguardando laudo',
  resultado_disponivel: 'Resultado disponível'
}

export const ROTULO_STATUS_SOROLOGIA = {
  coleta_pendente: 'Coleta pendente',
  aguardando_resultado: 'Aguardando resultado',
  resultado_disponivel: 'Resultado disponível'
}
