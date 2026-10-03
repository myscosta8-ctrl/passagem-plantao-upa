// Regras da Passagem de Plantão Coletiva (sem tela). Usadas pela tela e testadas sem navegador.

export const CHIPS_PENDENCIA_RAPIDA = [
  'Reavaliar sinais vitais',
  'Comunicar médico se alteração',
  'Aguarda resultado de exame',
  'Trocar curativo',
]

export const GRUPOS_IMPRESSAO = [
  { tela: 'print1', setores: ['Sala Vermelha', 'Internação'] },
  { tela: 'print2', setores: ['Pediatria', 'Observação', 'Pediátrico', 'Observação/Internação'] },
]

export function permanencia(paciente) {
  const ini = paciente.internado_em || paciente.data_admissao || paciente.criado_em || paciente.created_at
  if (!ini) return null
  const h = Math.floor((Date.now() - new Date(ini).getTime()) / 3600000)
  if (!Number.isFinite(h) || h < 0) return null
  return h >= 48 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`
}

export function textoAlergia(p) {
  if (p.alergia_substancia) return p.alergia_substancia
  if (p.alergias_obs) return p.alergias_obs
  if (typeof p.alergias === 'string' && p.alergias.trim()) return p.alergias
  return null
}
export const temAlergia = (p) => !!(p.alergias_obs || (typeof p.alergias === 'string' ? p.alergias.trim() : p.alergias))

// Impresso do setor: Sala Vermelha/Internação (print1) ou Pediatria/Observação (print2).
export function telaImpressaoDoSetor(nomeSetor) {
  return (GRUPOS_IMPRESSAO.find((g) => g.setores.includes(nomeSetor)) || GRUPOS_IMPRESSAO[0]).tela
}

// Campos editados de um card, prontos para gravar: texto vazio vira null; _meta (dados da
// passagem nova) sai do objeto.
export function camposParaGravar(campos) {
  const { _meta, ...limpo } = campos
  for (const k of Object.keys(limpo)) if (typeof limpo[k] === 'string') limpo[k] = limpo[k].trim() || null
  return { meta: _meta, limpo }
}

// Junta um atalho ao texto de pendências (separados por " · ").
export const juntarPendencia = (atual, chip) => (atual || '') + ((atual || '').trim() ? ' · ' : '') + chip
