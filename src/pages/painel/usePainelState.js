import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import { pepEstaAtivo } from '../../lib/pepConfig'
import {
  carregarLeitosOcupadosPep, internarPacientePep,
  listarUltimosSinaisVitaisPorAtendimentos, listarBalancoPorAtendimentos,
} from '../../lib/pepAtendimentos'

export function usePainelState({ plantao }) {
  const { enfermeiro } = useAuth()
  const [setores, setSetores] = useState([])
  const [leitos, setLeitos] = useState([])
  const [pacientesPorLeito, setPacientesPorLeito] = useState({})
  const [passagemPorPaciente, setPassagemPorPaciente] = useState({})
  const [sinaisVitaisPorPaciente, setSinaisVitaisPorPaciente] = useState({})
  const [balancoPorPaciente, setBalancoPorPaciente] = useState({})
  const [modalLeito, setModalLeito] = useState(null) // internar rápido
  const [erroInternar, setErroInternar] = useState('')
  const [erroGeral, setErroGeral] = useState('')
  const [modalPassagem, setModalPassagem] = useState(null) // { paciente, leito }
  const [modalRealocar, setModalRealocar] = useState(null) // { paciente, leitoOrigem }
  const [menuAcoesLeitoId, setMenuAcoesLeitoId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [visualizacao, setVisualizacao] = useState('cards') // 'cards' | 'tabela'
  const [buscaTabela, setBuscaTabela] = useState('')
  const [setorFiltro, setSetorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const restauradoRef = useRef(false)
  const pepAtivoRef = useRef(false)
  const chaveModalAberto = `modal_passagem_aberto_${plantao.id}`

  useEffect(() => {
    carregarTudo()
  }, [])

  function abrirPassagem(paciente, leito) {
    setModalPassagem({ paciente, leito })
    try {
      localStorage.setItem(chaveModalAberto, JSON.stringify({ pacienteId: paciente.id, leitoId: leito.id, quando: Date.now() }))
    } catch {
      // localStorage indisponível
    }
  }

  function fecharPassagem() {
    setModalPassagem(null)
    try {
      localStorage.removeItem(chaveModalAberto)
    } catch {
      // localStorage indisponível
    }
  }

  function restaurarModalSalvo(mapaAtual, listaLeitosAtual) {
    if (restauradoRef.current) return
    restauradoRef.current = true
    try {
      const bruto = localStorage.getItem(chaveModalAberto)
      if (!bruto) return
      const salvo = JSON.parse(bruto)
      const horasPassadas = (Date.now() - salvo.quando) / 3_600_000
      const paciente = mapaAtual[salvo.leitoId]
      const leito = listaLeitosAtual.find((l) => l.id === salvo.leitoId)
      if (horasPassadas <= 4 && paciente?.id === salvo.pacienteId && leito) {
        setModalPassagem({ paciente, leito })
      } else {
        localStorage.removeItem(chaveModalAberto)
      }
    } catch {
      localStorage.removeItem(chaveModalAberto)
    }
  }

  async function carregarTudo() {
    setCarregando(true)
    const pepAtivo = await pepEstaAtivo(enfermeiro?.id)
    pepAtivoRef.current = pepAtivo

    const { data: listaSetores } = await supabase.from('setores').select('*').order('ordem')
    const { data: listaLeitos } = await supabase
      .from('leitos')
      .select('*')
      .eq('ativo', true)
      .order('numero')

    setSetores(listaSetores ?? [])
    setLeitos(listaLeitos ?? [])

    if (pepAtivo) {
      const { pacientesPorLeito: mapa, passagemPorPaciente: passagemMapa } = await carregarLeitosOcupadosPep()
      setPacientesPorLeito(mapa)
      setPassagemPorPaciente(passagemMapa)
      restaurarModalSalvo(mapa, listaLeitos ?? [])
      const atendimentoIds = Object.values(mapa).map((p) => p.id)
      const [svMapa, balancoMapa] = await Promise.all([
        listarUltimosSinaisVitaisPorAtendimentos(atendimentoIds),
        listarBalancoPorAtendimentos(atendimentoIds),
      ])
      setSinaisVitaisPorPaciente(svMapa)
      setBalancoPorPaciente(balancoMapa)
      setCarregando(false)
      return
    }

    const { data: listaPacientes } = await supabase
      .from('pacientes')
      .select('*, ultima_alteracao_por_enfermeiro:enfermeiros!ultima_alteracao_por(nome_exibicao, nome)')
      .eq('status', 'internado')

    const mapa = {}
    for (const p of listaPacientes ?? []) {
      if (p.leito_atual_id) mapa[p.leito_atual_id] = p
    }
    setPacientesPorLeito(mapa)
    restaurarModalSalvo(mapa, listaLeitos ?? [])

    const ids = (listaPacientes ?? []).map((p) => p.id)
    if (ids.length > 0) {
      const { data: passagens } = await supabase
        .from('passagens')
        .select('*, enfermeiros(nome_exibicao, nome)')
        .in('paciente_id', ids)
        .order('criado_em', { ascending: false })
      const ultimaPorPaciente = {}
      for (const p of passagens ?? []) {
        if (!ultimaPorPaciente[p.paciente_id]) ultimaPorPaciente[p.paciente_id] = p
      }
      setPassagemPorPaciente(ultimaPorPaciente)
    } else {
      setPassagemPorPaciente({})
    }

    setCarregando(false)
  }

  async function abrirLeitoExtra(setorId) {
    const leitosDoSetor = leitos.filter((l) => l.setor_id === setorId)
    const numeroExtra = leitosDoSetor.filter((l) => l.tipo === 'extra').length + 1
    const { data: novo, error } = await supabase
      .from('leitos')
      .insert({ setor_id: setorId, numero: `Extra ${numeroExtra}`, tipo: 'extra' })
      .select()
      .single()
    if (!error) {
      setLeitos((prev) => [...prev, novo])
    } else {
      setErroGeral('Não foi possível abrir o leito extra. Tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao abrir leito extra:', error)
    }
  }

  async function internarPaciente(leito, dados) {
    setErroInternar('')

    if (pepAtivoRef.current) {
      const { novo, error } = await internarPacientePep({ leito, dados, enfermeiroId: enfermeiro?.id })
      if (!error) {
        setPacientesPorLeito((prev) => ({ ...prev, [leito.id]: novo }))
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
      setPacientesPorLeito((prev) => ({ ...prev, [leito.id]: novo }))
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
  }
}
