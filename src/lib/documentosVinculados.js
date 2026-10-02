// Documentos que acompanham a Prescrição Médica: Ficha de ATM (antimicrobiano restrito por via EV)
// e Receita de Controle Especial (Portaria 344/98). Usado no "Salvar e Imprimir" da prescrição e
// na reimpressão (ícones no Histórico Clínico e na lista de prescrições).
import { listarAtm, listarReceitasMedicas, buscarDadosParaSumario, listarCatalogoMedicamentos } from './pepMedico'
import { exigeAtm, atbRestrito, atmPendentes } from '../pages/ficha-medica/constantes'
import { ehControlado } from './catalogoMedicamentos'
import { quantidadeDia } from './frequencia'

const VIA_RECEITA = { VO: 'ORAL', EV: 'INTRAVENOSO (EV)', IM: 'INTRAMUSCULAR (IM)', SC: 'SUBCUTÂNEO (SC)', INAL: 'INALATÓRIO', SL: 'SUBLINGUAL', VR: 'RETAL', ID: 'INTRADÉRMICO' }
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim()

// Catálogo carregado uma vez por sessão (marcação de controlados).
let catalogoCache = null
export function carregarCatalogo() {
  if (!catalogoCache) catalogoCache = listarCatalogoMedicamentos().catch(() => { catalogoCache = null; return [] })
  return catalogoCache
}

const itensDe = (p) => p?.prescricao_itens || []
export const precisaAtm = (p) => itensDe(p).some((it) => exigeAtm(it.medicamento_nome, it.via))
export const itensControlados = (p, catalogo) => itensDe(p).filter((it) => ehControlado(it.medicamento_nome, catalogo || []))

// Item da prescrição (tela ou banco) → item da Receita de Controle Especial.
export function itemReceitaControle(it) {
  const qtd = quantidadeDia(it)
  const condicao = it.condicao || (it.sn_aplic ? it.observacoes : '')
  return {
    medicamento: String(it.medicamento_nome || '').trim(),
    instrucao: [it.dose ? `${String(it.dose).replace('.', ',')} ${it.dose_unidade || ''}`.trim() : '', it.via, it.frequencia, condicao, it.duracao ? `por ${it.duracao}` : '', it.instrucoes].filter(Boolean).join(', '),
    quantidade: qtd ? `${qtd} por dia` : '',
    via: VIA_RECEITA[it.via] || it.via || 'ORAL',
    controlado: true,
    antimicrobiano: false,
  }
}

const mesmoDia = (a, b) => a && b && String(a).slice(0, 10) === String(b).slice(0, 10)

// ATM(s) da prescrição: as já registradas para o mesmo antimicrobiano; as que faltam saem
// preenchidas a partir da prescrição, com a justificativa em branco para preencher à mão.
export async function atmsDaPrescricao(p) {
  const restritos = [...new Set(itensDe(p).map((it) => exigeAtm(it.medicamento_nome, it.via)?.rotulo).filter(Boolean))]
  if (!restritos.length) return []
  const [atms, base] = await Promise.all([listarAtm(p.atendimento_id), buscarDadosParaSumario(p.atendimento_id).catch(() => ({}))])
  const validas = atms.filter((a) => a.situacao !== 'invalido' && a.situacao !== 'rascunho')
  const docs = []
  for (const rotulo of restritos) {
    const feita = validas.find((a) => atbRestrito(a.medicamento)?.rotulo === rotulo)
    if (feita) { docs.push(feita); continue }
    const pend = atmPendentes([{ ...p, situacao: 'finalizado' }], []).find((x) => atbRestrito(x.medicamento)?.rotulo === rotulo) || {}
    const { medicamento, dose, intervalo, posologia, tempo_uso_dias, ...extra } = pend
    docs.push({
      id: `atm-prescricao-${p.id}-${rotulo}`, atendimento_id: p.atendimento_id, criado_em: p.finalizado_em || p.criado_em,
      solicitado_por: p.medico_id, enfermeiros: p.enfermeiros,
      medicamento, dose, intervalo, posologia, tempo_uso_dias: tempo_uso_dias ? Number(tempo_uso_dias) : null, justificativa_clinica: '',
      campos_extra: { ...extra, diagnostico: base?.diagnostico_internacao || '', data_internacao: base?.data_internacao || '' },
    })
  }
  return docs
}

// Receita de Controle Especial da prescrição: a gerada junto com ela (mesmo dia, mesmos
// controlados) ou, se não houver, montada a partir dos itens controlados da prescrição.
export async function receitaControleDaPrescricao(p, catalogo) {
  const controlados = itensControlados(p, catalogo)
  if (!controlados.length) return null
  const nomes = new Set(controlados.map((it) => norm(it.medicamento_nome)))
  const receitas = (await listarReceitasMedicas(p.atendimento_id))
    .filter((r) => r.tipo === 'controle_especial' && r.situacao !== 'invalido' && r.situacao !== 'rascunho')
  const gerada = receitas.find((r) => mesmoDia(r.criado_em, p.finalizado_em || p.criado_em) && (r.itens || []).some((i) => nomes.has(norm(i.medicamento))))
  if (gerada) return gerada
  return {
    id: `controle-prescricao-${p.id}`, atendimento_id: p.atendimento_id, criado_em: p.finalizado_em || p.criado_em,
    criado_por: p.medico_id, enfermeiros: p.enfermeiros, tipo: 'controle_especial',
    itens: controlados.map(itemReceitaControle),
  }
}

// Monta o pedido de impressão { tipo, registro, extras } para o ícone de reimpressão.
export async function impressaoVinculada(qual, p) {
  if (qual === 'atm') {
    const docs = await atmsDaPrescricao(p)
    if (!docs.length) return null
    return { tipo: 'atm', registro: docs[0], extras: docs.slice(1).map((r) => ({ tipo: 'atm', registro: r })) }
  }
  const receita = await receitaControleDaPrescricao(p, await carregarCatalogo())
  return receita ? { tipo: 'receituario', registro: receita, extras: [] } : null
}
