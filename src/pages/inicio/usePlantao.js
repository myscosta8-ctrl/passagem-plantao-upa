import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { avisarErro } from '../../lib/erros'
import { recolherLeitosExtras } from '../../lib/leitosExtras'
import { hojeISOLocal, turnoAtualPorHora } from './regrasInicio'

// Leitos extras que não possuem paciente ativo desaparecem automaticamente (regra no banco).
async function limparLeitosExtrasNaoUsados() {
  const { error } = await recolherLeitosExtras()
  if (error) avisarErro('Home', error)
}

// Plantão de enfermagem: retoma a participação aberta ou entra no plantão do dia/turno
// (sem tela de "abrir plantão"); o admin entra direto no plantão atual. Médico, recepção e
// apoio não usam plantão (semPlantao). Encerrar pede confirmação e reabre sozinho.
export function usePlantao({ enfermeiro, isAdmin, semPlantao, setTela, setModalConfirmar }) {
  const [plantao, setPlantao] = useState(null)
  const [setoresIds, setSetoresIds] = useState(null)
  const [verificandoRetomada, setVerificandoRetomada] = useState(true)
  const [encerrando, setEncerrando] = useState(false)

  useEffect(() => {
    if (semPlantao) {
      setVerificandoRetomada(false)
      return
    }
    limparLeitosExtrasNaoUsados()
    if (isAdmin) {
      entrarComoAdmin()
    } else {
      retomarPlantaoAtivo()
    }
  }, [])

  async function carregarTodosSetoresIds() {
    const { data: setores, error: erroConsulta3 } = await supabase.from('setores').select('id').in('id', [1, 2, 3, 4])
    if (erroConsulta3) avisarErro('Home', erroConsulta3)
    if (setores && setores.length > 0) return setores.map((s) => s.id)
    const { data: todos, error: erroConsulta4 } = await supabase.from('setores').select('id')
    if (erroConsulta4) avisarErro('Home', erroConsulta4)
    return (todos ?? []).map((s) => s.id)
  }

  async function buscarOuAbrirPlantao(hoje, turno) {
    const { data: existente, error: erroConsulta5 } = await supabase
      .from('plantoes')
      .select('id, data, turno, status, created_at, enfermeiro_chefe_id')
      .eq('data', hoje)
      .eq('turno', turno)
      .maybeSingle()
    if (erroConsulta5) avisarErro('Home', erroConsulta5)
    if (existente) return existente

    const { data: criado, error: erroConsulta6 } = await supabase.from('plantoes').insert({ data: hoje, turno }).select().single()
    if (erroConsulta6) avisarErro('Home', erroConsulta6)
    return criado
  }

  async function entrarComoAdmin() {
    setSetoresIds(await carregarTodosSetoresIds())
    const plantao = await buscarOuAbrirPlantao(hojeISOLocal(), turnoAtualPorHora())
    if (plantao) setPlantao(plantao)
    setVerificandoRetomada(false)
  }

  // Sem tela de "abrir plantão" — a data/turno são detectados automaticamente
  // (turno pelo horário atual) e a participação é registrada em silêncio.
  // Se já existe uma participação aberta (não encerrada), retoma ela em vez
  // de entrar num plantão novo, mesmo que o turno "natural" já tenha virado.
  async function retomarPlantaoAtivo() {
    if (!enfermeiro?.id) {
      setVerificandoRetomada(false)
      return
    }

    const { data: abertos, error: erroConsulta7 } = await supabase
      .from('plantao_profissionais')
      .select('plantoes!inner(id, data, turno, status, created_at, enfermeiro_chefe_id)')
      .eq('profissional_id', enfermeiro.id)
      .eq('encerrado', false)
      .order('created_at', { foreignTable: 'plantoes', ascending: false })
      .limit(1)
    if (erroConsulta7) avisarErro('Home', erroConsulta7)

    const paraRetomar = abertos?.[0]?.plantoes
    const plantao = paraRetomar || await buscarOuAbrirPlantao(hojeISOLocal(), turnoAtualPorHora())

    if (plantao) {
      if (!paraRetomar) {
        const { error: erroParticipacao } = await supabase
          .from('plantao_profissionais')
          .upsert({ plantao_id: plantao.id, profissional_id: enfermeiro.id, encerrado: false }, { onConflict: 'plantao_id,profissional_id' })
        if (erroParticipacao) avisarErro('Home', erroParticipacao)
      }
      setPlantao(plantao)
      setSetoresIds(await carregarTodosSetoresIds())
    }
    setVerificandoRetomada(false)
  }

  async function encerrarPlantao() {
    if (!plantao?.id) return
    setModalConfirmar({
      titulo: 'Encerrar sua participação?',
      mensagem: 'Isso afeta só a sua sessão — o outro enfermeiro (se houver) continua normalmente até encerrar a dele.',
      confirmarTexto: 'Encerrar',
      onConfirmar: async () => {
        setModalConfirmar(null)
        setEncerrando(true)
        const { error: erroEncerrar } = await supabase
          .from('plantao_profissionais')
          .update({ encerrado: true, encerrado_em: new Date().toISOString() })
          .eq('plantao_id', plantao.id)
          .eq('profissional_id', enfermeiro?.id)
        if (erroEncerrar) avisarErro('Home', erroEncerrar)
        setEncerrando(false)
        setPlantao(null)
        setSetoresIds(null)
        setTela('painel')
        // Sem tela manual de "abrir plantão" pra voltar — reabre sozinho,
        // igual ao que aconteceria se a página fosse recarregada agora.
        setVerificandoRetomada(true)
        await retomarPlantaoAtivo()
      },
    })
  }

  return { plantao, setoresIds, verificandoRetomada, encerrando, encerrarPlantao }
}
