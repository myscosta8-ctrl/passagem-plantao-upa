import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './CompartilharPlantao.css'

// Mapeamento entre o nome real do setor no sistema e como ele aparece
// na mensagem do WhatsApp — não muda o nome do setor, só como é exibido aqui.
// Ordem da lista = ordem que aparece na mensagem.
const SETORES_MENSAGEM = [
  { nomeReal: 'Sala Vermelha', label: 'Sala vermelha🔴', temObservacao: true },
  { nomeReal: 'Internação', label: 'Sala amarela adulto 🟢', temObservacao: false },
  { nomeReal: 'Pediátrico', label: 'Sala amarela pediatria 🟡', temObservacao: true },
  { nomeReal: 'Observação/Internação', label: 'Observação Porta: ⚪️', temObservacao: true },
]

function hojeISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export default function CompartilharPlantao({ plantao, onVoltar }) {
  const [carregando, setCarregando] = useState(true)
  const [contagemPorSetor, setContagemPorSetor] = useState({})
  const [setorPorNome, setSetorPorNome] = useState({})
  const [exames, setExames] = useState([])
  const [curativoOk, setCurativoOk] = useState(true)
  const [carrinhoOk, setCarrinhoOk] = useState(true)
  const [notaExtra, setNotaExtra] = useState('')
  const [incluirExamesFuturos, setIncluirExamesFuturos] = useState(true)
  const [copiado, setCopiado] = useState('')

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function carregar() {
    setCarregando(true)

    const { data: setoresData } = await supabase.from('setores').select('id, nome')
    const mapaSetorPorNome = {}
    for (const s of setoresData ?? []) mapaSetorPorNome[s.nome] = s.id
    setSetorPorNome(mapaSetorPorNome)

    const { data: leitosData } = await supabase.from('leitos').select('id, setor_id').eq('ativo', true)
    const { data: pacientesData } = await supabase.from('pacientes').select('leito_atual_id, status_internacao').eq('status', 'internado')

    const mapaOcupado = {}
    for (const p of pacientesData ?? []) {
      if (p.leito_atual_id) mapaOcupado[p.leito_atual_id] = p.status_internacao
    }

    const contagem = {}
    for (const s of SETORES_MENSAGEM) {
      const setorReal = (setoresData ?? []).find((x) => x.nome === s.nomeReal)
      if (!setorReal) continue
      const leitosDoSetor = (leitosData ?? []).filter((l) => l.setor_id === setorReal.id)
      let internados = 0, observacao = 0
      for (const l of leitosDoSetor) {
        const status = mapaOcupado[l.id]
        if (status === 'Internado') internados++
        else if (status === 'Em observação') observacao++
      }
      contagem[s.nomeReal] = {
        internados,
        observacao,
        vagos: leitosDoSetor.length - internados - observacao,
      }
    }
    setContagemPorSetor(contagem)

    // Exames "a realizar", de hoje em diante
    const { data: passagensExame } = await supabase
      .from('passagens')
      .select('*, pacientes(nome, leito_atual_id)')
      .eq('exame_status', 'A realizar')
      .not('exame_a_realizar_data', 'is', null)
      .gte('exame_a_realizar_data', hojeISO())
      .order('criado_em', { ascending: false })

    // Fica só com a passagem mais recente por paciente (evita duplicar se salvou mais de uma vez)
    const porPaciente = {}
    for (const p of passagensExame ?? []) {
      if (!porPaciente[p.paciente_id]) porPaciente[p.paciente_id] = p
    }

    // Junta o leito (número + setor) de cada paciente com exame pendente
    const listaExames = Object.values(porPaciente)
    const idsLeitosComExame = listaExames.map((e) => e.pacientes?.leito_atual_id).filter(Boolean)
    let leitosComExame = []
    if (idsLeitosComExame.length > 0) {
      const { data } = await supabase.from('leitos').select('id, numero, setor_id').in('id', idsLeitosComExame)
      leitosComExame = data ?? []
    }
    const mapaLeitoInfo = {}
    for (const l of leitosComExame) mapaLeitoInfo[l.id] = l

    const examesComLeito = listaExames.map((e) => ({
      ...e,
      leitoInfo: mapaLeitoInfo[e.pacientes?.leito_atual_id] ?? null,
    }))

    setExames(examesComLeito)
    setCarregando(false)
  }

  function gerarMensagemLotacao() {
    const turno = plantao?.turno === 'Diurno' ? 'diurno' : 'noturno'
    let msg = `*PLANTAO 12h* ${turno}\n\n`
    for (const s of SETORES_MENSAGEM) {
      const c = contagemPorSetor[s.nomeReal] ?? { internados: 0, observacao: 0, vagos: 0 }
      msg += `*${s.label}*\n`
      msg += `Internado${c.internados === 1 ? '' : 's'}: ${String(c.internados).padStart(2, '0')}\n`
      if (s.temObservacao) msg += `Observação: ${String(c.observacao).padStart(2, '0')}\n`
      msg += `Leitos Vagos: ${String(Math.max(c.vagos, 0)).padStart(2, '0')}\n\n`
    }
    if (notaExtra.trim()) msg += `*${notaExtra.trim()}\n\n`
    msg += `Sala de curativo ${curativoOk ? '✅' : '❌'}\n`
    msg += `Carrinho de parada lacrado ${carrinhoOk ? '✅' : '❌'}`
    return msg
  }

  function gerarMensagemExames() {
    if (exames.length === 0) return '*EXAMES*\n\nNenhum exame agendado no momento.'

    const grupos = {}
    for (const e of exames) {
      const setorId = e.leitoInfo?.setor_id
      const setorInfo = SETORES_MENSAGEM.find((s) => setorPorNome[s.nomeReal] === setorId)
      const chave = setorInfo?.label ?? 'Outro setor'
      if (!grupos[chave]) grupos[chave] = []
      grupos[chave].push(e)
    }

    let msg = '*EXAMES*\n\n'
    for (const [setorLabel, lista] of Object.entries(grupos)) {
      msg += `*${setorLabel.replace(/[🔴🟢🟡⚪️:]/g, '').trim().toUpperCase()}*\n`
      for (const e of lista) {
        const numLeito = e.leitoInfo?.numero ?? '?'
        const dataFmt = e.exame_a_realizar_data ? new Date(e.exame_a_realizar_data + 'T00:00:00').toLocaleDateString('pt-BR') : '(sem data)'
        const horaFmt = e.exame_a_realizar_hora ? ` ${e.exame_a_realizar_hora.slice(0, 5)}h` : ''
        const localFmt = e.exame_a_realizar_local ? `\n${e.exame_a_realizar_local}` : '\n(Aguardando horário e local)'
        msg += `L${numLeito}  ${(e.pacientes?.nome ?? '').toUpperCase()}\n${e.exames_texto || 'Exame'}\n${dataFmt}${horaFmt}${localFmt}\n\n`
      }
    }
    return msg.trim()
  }

  async function copiar(texto, qual) {
    await navigator.clipboard.writeText(texto)
    setCopiado(qual)
    setTimeout(() => setCopiado(''), 2000)
  }

  function abrirWhatsapp(texto) {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const mensagemLotacao = gerarMensagemLotacao()
  const mensagemExames = gerarMensagemExames()

  return (
    <div className="page">
      <button className="voltar-topo" onClick={onVoltar}>← Voltar ao painel</button>
      <h1 className="page-title">Compartilhar plantão</h1>
      <p className="page-subtitle">Gera as mensagens prontas, no mesmo formato que já é usado no grupo do WhatsApp.</p>

      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : (
        <>
          <div className="card">
            <h2 className="card-titulo">Lotação</h2>
            <div className="compartilhar-opcoes">
              <label className="compartilhar-check">
                <input type="checkbox" checked={curativoOk} onChange={(e) => setCurativoOk(e.target.checked)} />
                Sala de curativo OK
              </label>
              <label className="compartilhar-check">
                <input type="checkbox" checked={carrinhoOk} onChange={(e) => setCarrinhoOk(e.target.checked)} />
                Carrinho de parada lacrado
              </label>
              <input
                type="text"
                className="compartilhar-nota-extra"
                placeholder="Nota extra, ex: 4 pacientes de observação na medicação..."
                value={notaExtra}
                onChange={(e) => setNotaExtra(e.target.value)}
              />
            </div>
            <pre className="compartilhar-preview">{mensagemLotacao}</pre>
            <div className="compartilhar-acoes">
              <button className="btn-salvar" onClick={() => copiar(mensagemLotacao, 'lotacao')}>
                {copiado === 'lotacao' ? '✓ Copiado' : 'Copiar'}
              </button>
              <button className="btn-salvar" onClick={() => abrirWhatsapp(mensagemLotacao)}>Abrir no WhatsApp</button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h2 className="card-titulo">Exames</h2>
            <pre className="compartilhar-preview">{mensagemExames}</pre>
            <div className="compartilhar-acoes">
              <button className="btn-salvar" onClick={() => copiar(mensagemExames, 'exames')}>
                {copiado === 'exames' ? '✓ Copiado' : 'Copiar'}
              </button>
              <button className="btn-salvar" onClick={() => abrirWhatsapp(mensagemExames)}>Abrir no WhatsApp</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
