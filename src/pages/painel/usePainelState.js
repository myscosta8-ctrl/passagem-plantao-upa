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

  const { data: painelData, isLoading: carregando, refetch: carregarTudo } = useQuery({
    queryKey: ['painelDados', enfermeiro?.id],
    queryFn: async () => {
      const pepAtivo = await pepEstaAtivo(enfermeiro?.id)
      pepAtivoRef.current = pepAtivo

      const { data: listaSetores } = await supabase.from('setores').select('*').order('ordem')
      const { data: listaLeitos } = await supabase.from('leitos').select('*').eq('ativo', true).order('id')

      const setoresOficiais = (listaSetores ?? []).filter((s) => [1, 2, 3, 4].includes(s.id))
      const finalSetores = setoresOficiais.length > 0 ? setoresOficiais : (listaSetores ?? [])

      if (pepAtivo) {
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

        
  function abrirPassagem(paciente, leito) {
    setModalPassagem({ paciente, leito })
  }

  function fecharPassagem() {
    setModalPassagem(null)
  }

  return {

          setores: finalSetores,
          leitos: leitosFiltrados,
          pacientesPorLeito: mapa || {},
          passagemPorPaciente: passagemMapa || {},
          sinaisVitaisPorPaciente: svMapa || {},
          balancoPorPaciente: balancoMapa || {}
        }
      }

      const { data: listaPacientes } = await supabase
        .from('pacientes')
        .select('*, ultima_alteracao_por_enfermeiro:enfermeiros!ultima_alteracao_por(nome_exibicao, nome)')
        .eq('status', 'internado')

      const mapa = {}
      for (const p of listaPacientes ?? []) {
        if (p.leito_atual_id) mapa[p.leito_atual_id] = p
      }

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

      let passagemMapa = {}
      const ids = (listaPacientes ?? []).map((p) => p.id)
      if (ids.length > 0) {
        const { data: passagens } = await supabase
          .from('passagens')
          .select('*, enfermeiros!passagens_criado_por_fkey(nome_exibicao, nome)')
          .in('paciente_id', ids)
          .order('criado_em', { ascending: false })
        for (const p of passagens ?? []) {
          if (!passagemMapa[p.paciente_id]) passagemMapa[p.paciente_id] = p
        }
      }

      return {
        setores: finalSetores,
        leitos: leitosFiltrados,
        pacientesPorLeito: mapa || {},
        passagemPorPaciente: passagemMapa || {},
        sinaisVitaisPorPaciente: {},
        balancoPorPaciente: {}
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
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

    if (pepAtivoRef.current) {
      const { novo, error } = await internarPacientePep({ leito, dados, enfermeiroId: enfermeiro?.id })
      if (!error) {
        queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, pacientesPorLeito: { ...(old?.pacientesPorLeito || {}), [leito.id]: novo } }))
        setModalLeito(null)
      } else {
        setErroInternar('Não foi possível internar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
        console.error('Erro ao internar paciente (PEP):', error)
      }
      return
    }

    const { data: novo, error } = await supabase
      .from('pacientes')
      .insert({
        nome: dados.nome,
        diagnostico: dados.diagnostico,
        data_admissao: dados.dataAdmissao,
        data_nascimento: dados.dataNascimento,
        classificacao_manchester: dados.classificacaoManchester,
        leito_atual_id: leito.id,
        status: 'internado',
        status_internacao: dados.status,
        ultima_alteracao_por: enfermeiro?.id,
        ultima_alteracao_em: new Date().toISOString(),
      })
      .select()
      .single()
    if (!error) {
      queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, pacientesPorLeito: { ...(old?.pacientesPorLeito || {}), [leito.id]: novo } }))
      setModalLeito(null)
    } else {
      setErroInternar('Não foi possível internar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao internar paciente:', error)
    }
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
    erroGeral,
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
