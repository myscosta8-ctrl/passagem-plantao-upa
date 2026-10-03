import { useEffect, useState } from 'react'
import { marcarPassagemConferida, atualizarCamposPassagem, salvarPassagemPep, carregarResumoProntuario } from '../lib/pepAtendimentos'
import { useAuth } from '../lib/AuthContext'
import { telaImpressaoDoSetor, camposParaGravar, juntarPendencia } from './passagem-coletiva/regrasColetiva'
import BarraSetores from './passagem-coletiva/BarraSetores'
import VistaCards from './passagem-coletiva/VistaCards'
import VistaTabela from './passagem-coletiva/VistaTabela'
import VistaDetalhe from './passagem-coletiva/VistaDetalhe'
import './PassagemColetiva.css'

// Passagem de Plantão Coletiva (mockups-fase2/12-passagem-plantao-design.html): guarda o estado
// (setor, filtro, vista, o que foi editado nos cards) e as regras de conferir e salvar.
// Partes da tela em ./passagem-coletiva/ (barra, grade, tabela, detalhe, campos dos cards).

export default function PassagemColetiva({
  plantao,
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  enfermeiroId,
  onAbrirPassagem,
  onEditarPassagem: _onEditarPassagem, // recebido da tela, não usado aqui
  onRecarregar,
  onImprimir,
  onCompartilhar,
  onVoltar,
}) {
  const [setorAtivoId, setSetorAtivoId] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [modo, setModo] = useState('cards') // cards | table | focus
  const { enfermeiro: usuarioAtual } = useAuth()
  const novaUI = usuarioAtual?.pep_beta === true
  const [menuImprimir, setMenuImprimir] = useState(false)
  const [focoLeitoId, setFocoLeitoId] = useState(null)
  const [conferindoId, setConferindoId] = useState(null)
  const [conferindoTodos, setConferindoTodos] = useState(false)
  const [recolhidos, setRecolhidos] = useState(() => new Set())
  const [rascunhos, setRascunhos] = useState({}) // passagemId -> { pendencias?, dispositivos?, dispositivos_detalhe? }
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState(null)
  const [resumos, setResumos] = useState({})

  const setorAtivo = setoresVisiveis.find((s) => s.id === setorAtivoId) || setoresVisiveis[0]
  const leitosDoSetor = setorAtivo
    ? leitos.filter((l) => l.setor_id === setorAtivo.id).sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10) || String(a.numero).localeCompare(String(b.numero)))
    : []
  const leitosComPaciente = leitosDoSetor.filter((l) => pacientesPorLeito[l.id])
  // Sem passagem neste atendimento ainda: usa uma "passagem virtual" para a
  // equipe poder preencher direto no card; ela é criada ao Salvar.
  const passagemEditavel = (paciente, leito) => passagemPorPaciente[paciente.id]
    || { id: `novo:${paciente.id}`, _novo: true, atendimento_id: paciente.id, leito_id: leito.id, setor_id: leito.setor_id }
  // Exames / sorologias / hemoterapia / regulação do prontuário, de uma vez para o setor.
  const idsAtendimentosSetor = leitosComPaciente.map((l) => pacientesPorLeito[l.id]?.id).filter(Boolean).join(',')
  useEffect(() => {
    if (!idsAtendimentosSetor) return
    carregarResumoProntuario(idsAtendimentosSetor.split(',')).then((m) => setResumos((prev) => ({ ...prev, ...m })))
  }, [idsAtendimentosSetor])

  const passagemDoLeito = (leito) => { const p = pacientesPorLeito[leito.id]; return p ? passagemPorPaciente[p.id] : null }

  // Valor atual de um campo: rascunho se houver, senão o gravado.
  const campo = (ps, k) => (ps && rascunhos[ps.id] && k in rascunhos[ps.id] ? rascunhos[ps.id][k] : ps?.[k])
  const pendenciaDe = (ps) => campo(ps, 'pendencias') || ''
  const dispositivosDe = (ps) => (Array.isArray(campo(ps, 'dispositivos')) ? campo(ps, 'dispositivos') : [])
  const detalheDe = (ps) => campo(ps, 'dispositivos_detalhe') || ''
  const editar = (ps, k, v) => setRascunhos((prev) => ({
    ...prev,
    [ps.id]: { ...prev[ps.id], [k]: v, ...(ps._novo ? { _meta: { atendimento_id: ps.atendimento_id, leito_id: ps.leito_id, setor_id: ps.setor_id } } : {}) },
  }))

  // Pendências contam também o que já foi digitado num leito que ainda não tem passagem gravada.
  const editavelDoLeito = (l) => passagemEditavel(pacientesPorLeito[l.id], l)
  const contagens = {
    todos: leitosComPaciente.length,
    pendencias: leitosComPaciente.filter((l) => pendenciaDe(editavelDoLeito(l)).trim()).length,
    'a-conferir': leitosComPaciente.filter((l) => !passagemDoLeito(l)?.conferido_em).length,
    conferidos: leitosComPaciente.filter((l) => passagemDoLeito(l)?.conferido_em).length,
  }

  const leitosFiltrados = leitosComPaciente.filter((l) => {
    const p = passagemDoLeito(l)
    if (filtro === 'pendencias') return !!pendenciaDe(editavelDoLeito(l)).trim()
    if (filtro === 'a-conferir') return !p?.conferido_em
    if (filtro === 'conferidos') return !!p?.conferido_em
    return true
  })

  async function toggleConferido(passagem) {
    if (!passagem) return
    setConferindoId(passagem.id)
    await marcarPassagemConferida({ passagemId: passagem.id, enfermeiroId, conferido: !passagem.conferido_em })
    await onRecarregar?.()
    setConferindoId(null)
  }

  async function conferirTodos() {
    const pendentes = leitosFiltrados.map(passagemDoLeito).filter((p) => p && !p.conferido_em)
    if (pendentes.length === 0) return
    setConferindoTodos(true)
    await Promise.all(pendentes.map((p) => marcarPassagemConferida({ passagemId: p.id, enfermeiroId, conferido: true })))
    await onRecarregar?.()
    setConferindoTodos(false)
  }

  const toggleRecolhido = (id) => setRecolhidos((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  function adicionarChip(ps, chip) {
    editar(ps, 'pendencias', juntarPendencia(pendenciaDe(ps), chip))
  }
  function toggleDispositivo(ps, d) {
    const atual = dispositivosDe(ps)
    editar(ps, 'dispositivos', atual.includes(d) ? atual.filter((x) => x !== d) : [...atual, d])
  }

  const alterados = Object.keys(rascunhos).length

  // Grava cada card alterado. Se algum falhar, só os que falharam continuam como alterados
  // (os que gravaram não são enviados de novo).
  async function salvarTudo() {
    if (alterados === 0) return true
    setSalvando(true); setMsg(null)
    const entradas = Object.entries(rascunhos)
    const res = await Promise.all(entradas.map(([id, campos]) => {
      const { meta, limpo } = camposParaGravar(campos)
      if (id.startsWith('novo:')) {
        return salvarPassagemPep({ ...meta, plantao_id: plantao.id, enfermeiro_id: enfermeiroId, criado_por: enfermeiroId, ...limpo })
      }
      return atualizarCamposPassagem(id, limpo)
    }))
    setSalvando(false)
    const falharam = new Set(entradas.filter((_, i) => res[i]?.error).map(([id]) => id))
    setRascunhos((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => falharam.has(id) || !entradas.some(([e]) => e === id))))
    await onRecarregar?.()
    if (falharam.size) { setMsg({ erro: true, t: `${falharam.size === 1 ? '1 leito não foi salvo' : `${falharam.size} leitos não foram salvos`}. Tente de novo.` }); return false }
    setMsg({ t: 'Alterações salvas.' })
    return true
  }

  async function salvarEImprimir() {
    if (!(await salvarTudo())) return
    onImprimir?.(telaImpressaoDoSetor(setorAtivo?.nome))
  }

  function abrirFoco(leitoId) { setFocoLeitoId(leitoId); setModo('focus') }
  const leitoFoco = leitosFiltrados.find((l) => l.id === focoLeitoId) || leitosFiltrados[0]

  const resumoDisp = (ps) => [...dispositivosDe(ps), detalheDe(ps)].filter(Boolean).join(' · ')
  const ed = { campo, editar, pendenciaDe, dispositivosDe, detalheDe, adicionarChip, toggleDispositivo }
  // Tudo o que as vistas (grade, tabela, detalhe) usam.
  const c = {
    pacientesPorLeito, passagemPorPaciente, passagemEditavel, ed, resumos, resumoDisp, onAbrirPassagem, abrirFoco,
    leitosDoSetor, leitosFiltrados, filtro, recolhidos, toggleRecolhido, toggleConferido, conferindoId,
    leitoFoco, setFocoLeitoId, setorAtivo,
  }

  return (
    <div className="pc-page">
      <BarraSetores
        novaUI={novaUI} plantao={plantao} setoresVisiveis={setoresVisiveis} leitos={leitos} pacientesPorLeito={pacientesPorLeito}
        setorAtivo={setorAtivo} escolherSetor={(id) => { setSetorAtivoId(id); setFocoLeitoId(null) }}
        modo={modo} setModo={setModo} filtro={filtro} setFiltro={setFiltro} contagens={contagens}
        recolhidos={recolhidos} alternarTodos={() => (recolhidos.size > 0 ? setRecolhidos(new Set()) : setRecolhidos(new Set(leitosFiltrados.map((l) => l.id))))}
        conferirTodos={conferirTodos} conferindoTodos={conferindoTodos}
        onImprimir={onImprimir} onCompartilhar={onCompartilhar} menuImprimir={menuImprimir} setMenuImprimir={setMenuImprimir}
      />

      <div className="main-view-card">
        {modo === 'cards' && <VistaCards c={c} />}
        {modo === 'table' && <VistaTabela c={c} />}
        {modo === 'focus' && <VistaDetalhe c={c} />}

        <footer className="ac-footer">
          <button type="button" className="btn-cancel" onClick={onVoltar}><i className="ph ph-x-circle" /> Cancelar</button>
          {msg && <span className={`pc-msg ${msg.erro ? 'erro' : ''}`}>{msg.t}</span>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-save-draft" onClick={salvarTudo} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : `Salvar${alterados ? ` (${alterados})` : ''}`}
            </button>
            <button type="button" className="btn-save-print" onClick={salvarEImprimir} disabled={salvando}>
              <i className="ph ph-printer" /> Salvar e Imprimir
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
