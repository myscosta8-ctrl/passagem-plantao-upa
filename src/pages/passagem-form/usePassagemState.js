import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { pepEstaAtivo } from '../../lib/pepConfig'
import {
  buscarPassagemAtualPep,
  buscarUltimaPassagemPep,
  salvarPassagemPep,
  salvarIdentificacaoPep,
} from '../../lib/pepAtendimentos'
import { PASSAGEM_VAZIA } from './constantes'

export function usePassagemState({ paciente, leito, setorNome, plantaoId, enfermeiroId, onSalvo, onFechar }) {
  const statusTravado = setorNome === 'Internação'
  const [identificacao, setIdentificacao] = useState({
    nome: paciente.nome ?? '',
    diagnostico: paciente.diagnostico ?? '',
    idade: paciente.idade ?? '',
    sexo: paciente.sexo ?? '',
    data_admissao: paciente.data_admissao ?? '',
    alergias: paciente.alergias ?? false,
    alergias_obs: paciente.alergias_obs ?? '',
    status_internacao: statusTravado ? 'Internado' : (paciente.status_internacao ?? 'Em observação'),
  })
  const [passagem, setPassagem] = useState(PASSAGEM_VAZIA)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [sujo, setSujo] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  const [camposFaltando, setCamposFaltando] = useState([])
  const [rascunhoEncontrado, setRascunhoEncontrado] = useState(null)
  const [confirmandoFechar, setConfirmandoFechar] = useState(false)
  const [origemCopia, setOrigemCopia] = useState(null)
  const [pepAtivo, setPepAtivo] = useState(false)

  const chaveRascunho = useCallback(() => {
    return `rascunho_passagem_${plantaoId}_${paciente.id}`
  }, [plantaoId, paciente.id])

  const salvarRascunhoAgora = useCallback(() => {
    if (!sujo || carregando) return
    localStorage.setItem(chaveRascunho(), JSON.stringify({ identificacao, passagem, quando: new Date().toISOString() }))
  }, [sujo, carregando, chaveRascunho, identificacao, passagem])

  function normalizarAvp(dados) {
    const dispositivos = dados.dispositivos ?? []
    if (dados.avp && !dispositivos.includes('AVP')) {
      return { ...dados, dispositivos: [...dispositivos, 'AVP'] }
    }
    return dados
  }

  const carregar = useCallback(async () => {
    setCarregando(true)
    const pep = await pepEstaAtivo(enfermeiroId)
    setPepAtivo(pep)

    const rascunhoBruto = localStorage.getItem(chaveRascunho())
    if (rascunhoBruto) {
      try {
        const rascunho = JSON.parse(rascunhoBruto)
        setRascunhoEncontrado(rascunho)
        setCarregando(false)
        return
      } catch {
        localStorage.removeItem(chaveRascunho())
      }
    }

    const atual = pep
      ? await buscarPassagemAtualPep(plantaoId, paciente.id)
      : (await supabase
          .from('passagens')
          .select('*')
          .eq('plantao_id', plantaoId)
          .eq('paciente_id', paciente.id)
          .maybeSingle()).data

    if (atual) {
      setPassagem(normalizarAvp({ ...PASSAGEM_VAZIA, ...atual }))
      setCarregando(false)
      return
    }

    const anterior = pep
      ? await buscarUltimaPassagemPep(paciente.id)
      : (await supabase
          .from('passagens')
          .select('*')
          .eq('paciente_id', paciente.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle()).data

    if (anterior) {
      setPassagem(normalizarAvp({ ...PASSAGEM_VAZIA, ...anterior }))
      setOrigemCopia(anterior.criado_em)
    }
    setCarregando(false)
  }, [chaveRascunho, enfermeiroId, paciente.id, plantaoId])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    function avisarSaidaComEdicaoPendente(e) {
      if (sujo) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', avisarSaidaComEdicaoPendente)
    return () => window.removeEventListener('beforeunload', avisarSaidaComEdicaoPendente)
  }, [sujo])

  useEffect(() => {
    if (!sujo || carregando) return
    const atraso = setTimeout(salvarRascunhoAgora, 800)
    return () => clearTimeout(atraso)
  }, [salvarRascunhoAgora, sujo, carregando])

  useEffect(() => {
    function aoEsconder() {
      if (document.visibilityState === 'hidden') salvarRascunhoAgora()
    }
    document.addEventListener('visibilitychange', aoEsconder)
    window.addEventListener('pagehide', salvarRascunhoAgora)
    return () => {
      document.removeEventListener('visibilitychange', aoEsconder)
      window.removeEventListener('pagehide', salvarRascunhoAgora)
    }
  }, [salvarRascunhoAgora])

  function continuarRascunho() {
    const dadosPassagem = rascunhoEncontrado.passagem ?? rascunhoEncontrado.dados ?? {}
    setPassagem({ ...PASSAGEM_VAZIA, ...dadosPassagem })
    if (rascunhoEncontrado.identificacao) {
      setIdentificacao((prev) => ({ ...prev, ...rascunhoEncontrado.identificacao }))
    }
    setSujo(true)
    setRascunhoEncontrado(null)
  }

  function descartarRascunho() {
    localStorage.removeItem(chaveRascunho())
    setRascunhoEncontrado(null)
    carregar()
  }

  function set(campo, valor) {
    setPassagem((prev) => ({ ...prev, [campo]: valor }))
    setSalvo(false)
    setSujo(true)
  }

  function setId(campo, valor) {
    setIdentificacao((prev) => ({ ...prev, [campo]: valor }))
    setSalvo(false)
    setSujo(true)
  }

  function toggleDispositivo(d) {
    setSujo(true)
    setPassagem((prev) => {
      const atuais = prev.dispositivos ?? []
      return {
        ...prev,
        dispositivos: atuais.includes(d) ? atuais.filter((x) => x !== d) : [...atuais, d],
      }
    })
    setSalvo(false)
  }

  function validarObrigatorios() {
    const faltando = []
    if (passagem.dispositivos?.includes('AVP') && (!passagem.avp_data_insercao || !passagem.avp_hora_insercao)) {
      faltando.push('Data e hora de inserção do AVP')
    }
    return faltando
  }

  async function salvar() {
    const faltando = validarObrigatorios()
    if (faltando.length > 0) {
      setCamposFaltando(faltando)
      return
    }
    setCamposFaltando([])
    setSalvando(true)
    setErroSalvar('')

    let error
    if (pepAtivo) {
      const statusFinal = statusTravado ? 'Internado' : identificacao.status_internacao
      const { error: erroId } = await salvarIdentificacaoPep({
        atendimentoId: paciente.id,
        pessoaId: paciente.pessoa_id,
        identificacao: { ...identificacao, status_internacao: statusFinal },
      })
      if (erroId) {
        error = erroId
      } else {
        const payload = {
          plantao_id: plantaoId,
          atendimento_id: paciente.id,
          leito_id: leito.id,
          setor_id: leito.setor_id,
          criado_por: enfermeiroId,
          atualizado_em: new Date().toISOString(),
          ...passagem,
        }
        const resultado = await salvarPassagemPep(payload)
        error = resultado.error
      }
    } else {
      const statusInternacaoNovo = statusTravado ? 'Internado' : identificacao.status_internacao
      const saiuDeObservacao = paciente.status_internacao === 'Em observação' && statusInternacaoNovo !== 'Em observação'

      await supabase
        .from('pacientes')
        .update({
          nome: identificacao.nome,
          diagnostico: identificacao.diagnostico,
          idade: identificacao.idade || null,
          sexo: identificacao.sexo || null,
          data_admissao: identificacao.data_admissao || null,
          alergias: identificacao.alergias,
          alergias_obs: identificacao.alergias_obs,
          status_internacao: statusInternacaoNovo,
          ...(saiuDeObservacao ? { data_conduta_definida: new Date().toISOString() } : {}),
          updated_at: new Date().toISOString(),
          ultima_alteracao_por: enfermeiroId,
          ultima_alteracao_em: new Date().toISOString(),
        })
        .eq('id', paciente.id)

      const payload = {
        plantao_id: plantaoId,
        paciente_id: paciente.id,
        leito_id: leito.id,
        setor_id: leito.setor_id,
        criado_por: enfermeiroId,
        atualizado_em: new Date().toISOString(),
        ...passagem,
      }
      for (const chave in payload) {
        if (payload[chave] === '') payload[chave] = null
      }

      const resultado = await supabase
        .from('passagens')
        .upsert(payload, { onConflict: 'plantao_id,paciente_id' })
      error = resultado.error
    }

    setSalvando(false)
    if (!error) {
      setSalvo(true)
      setSujo(false)
      localStorage.removeItem(chaveRascunho())
      onSalvo?.()
      onFechar?.()
    } else {
      setErroSalvar('Não foi possível salvar. Nada foi perdido do que estava preenchido — tente de novo, e se persistir, avise o suporte.')
      console.error('Erro ao salvar passagem:', error)
    }
  }

  function fecharComConfirmacao() {
    if (sujo) {
      setConfirmandoFechar(true)
      return
    }
    localStorage.removeItem(chaveRascunho())
    onFechar?.()
  }

  function confirmarFecharDescartando() {
    setConfirmandoFechar(false)
    localStorage.removeItem(chaveRascunho())
    onFechar?.()
  }

  return {
    identificacao,
    passagem,
    carregando,
    salvando,
    salvo,
    sujo,
    erroSalvar,
    camposFaltando,
    rascunhoEncontrado,
    confirmandoFechar,
    origemCopia,
    statusTravado,
    setId,
    set,
    toggleDispositivo,
    salvar,
    fecharComConfirmacao,
    confirmarFecharDescartando,
    continuarRascunho,
    descartarRascunho,
    setConfirmandoFechar
  }
}
