import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import { pepEstaAtivo } from '../../lib/pepConfig'
import {
  carregarLeitosOcupadosPep, internarPacientePep,
  listarUltimosSinaisVitaisPorAtendimentos, listarBalancoPorAtendimentos,
} from '../../lib/pepAtendimentos'

export function usePainelState() {
  const { enfermeiro } = useAuth()
    const [modalLeito, setModalLeito] = useState(null)
  const [erroInternar, setErroInternar] = useState('')
  const [erroGeral, setErroGeral] = useState('')
  const [modalPassagem, setModalPassagem] = useState(null)
  const [modalRealocar, setModalRealocar] = useState(null)
  const [menuAcoesLeitoId, setMenuAcoesLeitoId] = useState(null)
  const [visualizacao, setVisualizacao] = useState('cards')
  const [buscaTabela, setBuscaTabela] = useState('')
  const [setorFiltro, setSetorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [modalDesfecho, setModalDesfecho] = useState(null)
  const [processandoDesfecho, setProcessandoDesfecho] = useState(false)

  const queryClient = useQueryClient()
  const pepAtivoRef = useRef(false)

  const { data: painelData, isLoading: carregando, error: erroCarga, refetch: carregarTudo } = useQuery({
    queryKey: ['painelDados', enfermeiro?.id],
    queryFn: async () => {
      const [pepAtivo, { data: listaSetores }, { data: listaLeitos }] = await Promise.all([
        pepEstaAtivo(enfermeiro?.id),
        supabase.from('setores').select('*').order('ordem'),
        supabase.from('leitos').select('*').eq('ativo', true).order('id'),
      ])
      pepAtivoRef.current = pepAtivo

      const setoresOficiais = (listaSetores ?? []).filter((s) => [1, 2, 3, 4].includes(s.id))
      const finalSetores = setoresOficiais.length > 0 ? setoresOficiais : (listaSetores ?? [])

      {
        const { pacientesPorLeito: mapa, passagemPorPaciente: passagemMapa } = await carregarLeitosOcupadosPep()
        
        const extrasDesocupados = (listaLeitos ?? []).filter((l) => l.tipo === 'extra' && !mapa[l.id])
        if (extrasDesocupados.length > 0) {
          const idsDesocupados = extrasDesocupados.map((l) => l.id)
          await supabase.from('leitos').delete().in('id', idsDesocupados)
        }

        const leitosFiltrados = (listaLeitos ?? []).filter((l) => {
          if (l.id <= 36) return true
          if (l.tipo === 'extra' && mapa[l.id]) return true
          return false
        })

        const atendimentoIds = Object.values(mapa).map((p) => p.id)
        const [svMapa, balancoMapa] = await Promise.all([
          listarUltimosSinaisVitaisPorAtendimentos(atendimentoIds),
          listarBalancoPorAtendimentos(atendimentoIds),
        ])

        return {

          setores: finalSetores,
          leitos: leitosFiltrados,
          pacientesPorLeito: mapa || {},
          passagemPorPaciente: passagemMapa || {},
          sinaisVitaisPorPaciente: svMapa || {},
          balancoPorPaciente: balancoMapa || {}
        }
      }

    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
  })

  const setores = painelData?.setores || []
  const leitos = painelData?.leitos || []
  const pacientesPorLeito = painelData?.pacientesPorLeito || {}
  const passagemPorPaciente = painelData?.passagemPorPaciente || {}
  const sinaisVitaisPorPaciente = painelData?.sinaisVitaisPorPaciente || {}
  const balancoPorPaciente = painelData?.balancoPorPaciente || {}


  

  async function abrirLeitoExtra(setorId) {
    const leitosDoSetor = leitos.filter((l) => l.setor_id === setorId)
    const numeroExtra = leitosDoSetor.filter((l) => l.tipo === 'extra').length + 1
    const { data: novo, error } = await supabase
      .from('leitos')
      .insert({ setor_id: setorId, numero: `Extra ${numeroExtra}`, tipo: 'extra', ativo: true })
      .select()
      .single()
    if (!error && novo) {
      queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, leitos: [...(old?.leitos || []), novo] }))
      // Abre imediatamente o modal de admissão para ocupar o leito extra
      setModalLeito(novo)
    } else {
      setErroGeral('Não foi possível abrir o leito extra. Tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao abrir leito extra:', error)
    }
  }

  async function cancelarModalInternar() {
    if (modalLeito?.tipo === 'extra' && !pacientesPorLeito[modalLeito.id]) {
      const extraId = modalLeito.id
      queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, leitos: (old?.leitos || []).filter(l => l.id !== extraId) }))
      await supabase.from('leitos').delete().eq('id', extraId)
    }
    setModalLeito(null)
    setErroInternar('')
  }

  async function internarPaciente(leito, dados) {
    setErroInternar('')

    const { novo, error } = await internarPacientePep({ leito, dados, enfermeiroId: enfermeiro?.id })
    if (!error) {
      queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, pacientesPorLeito: { ...(old?.pacientesPorLeito || {}), [leito.id]: novo } }))
      setModalLeito(null)
    } else {
      setErroInternar('Não foi possível internar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao internar paciente (PEP):', error)
    }
  }


  function abrirPassagem(paciente, leito) {
    setModalPassagem({ paciente, leito })
  }

  function fecharPassagem() {
    setModalPassagem(null)
  }

  return {

    enfermeiro,
    setores,
    leitos,
    pacientesPorLeito,
    passagemPorPaciente,
    sinaisVitaisPorPaciente,
    balancoPorPaciente,
    modalLeito,
    setModalLeito,
    cancelarModalInternar,
    erroInternar,
    setErroInternar,
    erroGeral: erroGeral || (erroCarga ? 'Não foi possível carregar os leitos (sem conexão?). Os dados exibidos podem estar desatualizados — não interne pacientes até recarregar.' : ''),
    setErroGeral,
    modalPassagem,
    modalRealocar,
    setModalRealocar,
    menuAcoesLeitoId,
    setMenuAcoesLeitoId,
    carregando,
    visualizacao,
    setVisualizacao,
    buscaTabela,
    setBuscaTabela,
    setorFiltro,
    setSetorFiltro,
    statusFiltro,
    setStatusFiltro,
    abrirPassagem,
    fecharPassagem,
    carregarTudo,
    abrirLeitoExtra,
    internarPaciente,
    modalDesfecho,
    setModalDesfecho,
    processandoDesfecho,
    setProcessandoDesfecho,
  }
}

