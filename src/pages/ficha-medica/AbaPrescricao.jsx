import { useEffect, useRef, useState } from 'react';
import { retirarDuplicacao } from '../../lib/duplicarPendente';
import { criarPrescricao, listarCatalogoMedicamentos } from '../../lib/pepMedico';
import { doCache } from '../../lib/consultasPaciente';
import { VIAS, exigeAtm, atmCobre } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro'
import { useRascunho } from '../../hooks/useRascunho'
import { useSalvarDocumento, MSG_RASCUNHO_SALVO } from '../../hooks/useSalvarDocumento'
import { apresentacaoDaForma } from '../../lib/frequencia'
import { hojeBelem, somarDias, textoValidade } from '../../lib/prescricaoValidade';
import { rotuloMedicamento, ehControlado } from '../../lib/catalogoMedicamentos';
import { CALC_VAZIA, FREQ_CALC } from '../../lib/calculoPediatrico';
import { ITEM_VAZIO, ORIENTACAO_VAZIA, itemParaBanco, itemDoBanco, camposPrescricaoParaBanco, aplicarCalculoAoItem, hemocomponentesDoBanco } from './prescricao/itemPrescricao';
import CalculadoraDosePediatrica from './prescricao/CalculadoraDosePediatrica';
import AlertasAtm from './prescricao/AlertasAtm';
import GrupoPrescricao from './prescricao/GrupoPrescricao';
import ListaItens from './prescricao/ListaItens';
import EditorItem from './prescricao/EditorItem';
import GrupoOrientacoes from './prescricao/GrupoOrientacoes';
import { alternarCuidado } from './prescricao/catalogoCuidados';
import GrupoHemocomponentes from './prescricao/GrupoHemocomponentes';
import HistoricoPrescricoes from './prescricao/HistoricoPrescricoes';

// Aba Prescrição Médica: guarda o estado do formulário e as regras (ATM, duplicar, salvar).
// Cada parte da tela fica em ./prescricao/ (editor do item, calculadora, cuidados, hemocomponentes,
// histórico); as regras do item sem tela ficam em ./prescricao/itemPrescricao.js.

export default function AbaPrescricao({  atendimento, medicoId, onImprimir, onFinalizada, onReimprimirVinculado, onFechar, onAbrirAtm, onAtualizarAtm, headerTabs, situacaoAtm }) {
  const [historico, setHistorico] = useState([])
  const [observacoes, setObservacoes] = useState('')
  const [dieta, setDieta] = useState('')
  const [itens, setItens] = useState([{ ...ITEM_VAZIO }])
  const [orientacaoEnfermagem, setOrientacaoEnfermagem] = useState([{ ...ORIENTACAO_VAZIA }])
  const [hemocomponentes, setHemocomponentes] = useState({})
  const [hemocomponenteObs, setHemocomponenteObs] = useState('')
  const [dataRegistro, setDataRegistro] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [dataReferencia, setDataReferencia] = useState(() => hojeBelem())
  const rascunho = useRascunho({ tabela: 'prescricoes_medicas', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { observacoes: [observacoes, setObservacoes], dataReferencia: [dataReferencia, setDataReferencia], dieta: [dieta, setDieta], itens: [itens, setItens], orientacaoEnfermagem: [orientacaoEnfermagem, setOrientacaoEnfermagem], hemocomponentes: [hemocomponentes, setHemocomponentes], hemocomponenteObs: [hemocomponenteObs, setHemocomponenteObs] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.') })
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')
  const [catalogo, setCatalogo] = useState([])
  const [calcAberto, setCalcAberto] = useState(null)
  const [calc, setCalc] = useState({ ...CALC_VAZIA })
  const [pesoCalculo, setPesoCalculo] = useState('')
  const [gruposFechados, setGruposFechados] = useState({})
  const [maisOpcoes, setMaisOpcoes] = useState({})
  // ATM só para antimicrobiano da lista restrita prescrito por via intravenosa.
  const itensRestritos = itens.filter((it) => exigeAtm(it.medicamento_nome, it.via))
  // Validade da ATM: com ficha válida no dia desta prescrição, não se emite nem imprime outra.
  const vigenteDe = (it) => situacaoAtm?.vigentes?.get(exigeAtm(it.medicamento_nome, it.via)?.rotulo)
  const restritosCobertos = itensRestritos.filter((it) => atmCobre(vigenteDe(it), dataReferencia))
  const restritosSemAtm = itensRestritos.filter((it) => !atmCobre(vigenteDe(it), dataReferencia))
  const alertasAtm = (situacaoAtm?.alertas || []).filter((a) => !restritosSemAtm.some((it) => exigeAtm(it.medicamento_nome, it.via)?.rotulo === exigeAtm(a.medicamento, 'EV')?.rotulo))

  const { salvando, salvar: salvarDocumento } = useSalvarDocumento({ rascunho, dataRegistro, editandoId, setEditandoId, setDataRegistro })

  useEffect(() => { carregar() }, [])
  // "Duplicar" escolhido no Histórico Clínico: a aba abre já com a cópia (depois do rascunho, se houver).
  useEffect(() => {
    const d = retirarDuplicacao('prescricao')
    if (!d) return undefined
    const t = setTimeout(() => duplicar(d.registro, d.mensagem), 400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const topoRef = useRef(null)
  // Última prescrição válida do atendimento (para o botão "Duplicar última" no topo).
  const ultimaPrescricao = historico.find((p) => p.situacao !== 'invalido' && p.status !== 'cancelada' && (p.prescricao_itens || []).length > 0)
  useEffect(() => { listarCatalogoMedicamentos().then(setCatalogo) }, [])

  async function carregar() {
    setHistorico(await doCache('prescricoes', atendimento.atendimento_id)) // cache entre abas; salvar atualiza
  }

  // "Ver Histórico": abre o bloco de prescrições anteriores e leva a tela até ele.
  function verHistorico() {
    setGruposFechados((prev) => ({ ...prev, historico: false }))
    setTimeout(() => document.getElementById('presc-historico')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0)
  }

  function setItem(i, campo, valor) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)))
  }

  function selecionarMedicamento(i, m) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, medicamento_nome: rotuloMedicamento(m), via: VIAS.includes(m.via_padrao) ? m.via_padrao : it.via, apresentacao: apresentacaoDaForma(m.forma_farmaceutica) || it.apresentacao } : it)))
  }

  // O último item de `itens` é sempre o rascunho em edição; os anteriores já
  // foram adicionados e aparecem como lista. "Adicionar" confirma o rascunho.
  function adicionarItem() {
    const rascunho = itens[itens.length - 1]
    if (!rascunho?.medicamento_nome.trim()) {
      setErro('Informe o medicamento antes de adicionar à prescrição.')
      return
    }
    setErro('')
    setItens((prev) => [...prev, { ...ITEM_VAZIO }])
    setCalcAberto(null)
  }

  function editarItem(i) {
    // Leva o item da lista de volta ao rascunho; um rascunho vazio é descartado.
    setItens((prev) => {
      const item = prev[i]
      const resto = prev.filter((_, idx) => idx !== i)
      const ultimo = resto[resto.length - 1]
      const base = ultimo && !ultimo.medicamento_nome.trim() ? resto.slice(0, -1) : resto
      return [...base, item]
    })
    setCalcAberto(null)
  }

  function limparRascunho() {
    setItens((prev) => [...prev.slice(0, -1), { ...ITEM_VAZIO }])
    setCalcAberto(null)
  }

  function removerItem(i) {
    setItens((prev) => prev.filter((_, idx) => idx !== i))
    if (calcAberto === i) setCalcAberto(null)
  }

  // "Editar rascunho" na lista de prescrições: carrega o rascunho no formulário, como na Evolução.
  function editarRascunhoDaLista(p) {
    const e = p.rascunho_estado || {}
    if ('observacoes' in e) setObservacoes(e.observacoes)
    if ('dataReferencia' in e) setDataReferencia(e.dataReferencia || p.data_referencia || hojeBelem())
    if ('dieta' in e) setDieta(e.dieta)
    if ('itens' in e) setItens(e.itens)
    if ('orientacaoEnfermagem' in e) setOrientacaoEnfermagem(e.orientacaoEnfermagem)
    if ('hemocomponentes' in e) setHemocomponentes(e.hemocomponentes)
    if ('hemocomponenteObs' in e) setHemocomponenteObs(e.hemocomponenteObs)
    setEditandoId(p.id)
    setAviso('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Finalizar e Imprimir" finaliza; "Cancelar" o descarta.')
    setTimeout(() => topoRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0)
  }

  function abrirCalculadora(i) {
    // O peso informado numa conta continua preenchido nas próximas medicações desta prescrição.
    setCalc({ ...CALC_VAZIA, pesoKg: pesoCalculo, frequencia: FREQ_CALC.includes(itens[i]?.frequencia) ? itens[i].frequencia : '' })
    setCalcAberto(i)
  }

  function fecharCalculadora() {
    setCalcAberto(null)
  }

  function toggleGrupo(chave) {
    setGruposFechados((prev) => ({ ...prev, [chave]: !prev[chave] }))
  }

  function aplicarCalculadora(i) {
    const r = aplicarCalculoAoItem(itens[i], calc, atendimento?.paciente?.peso)
    if (!r) return
    setPesoCalculo(r.pesoUsado)
    setItens((prev) => prev.map((it, idx) => (idx === i ? r.item : it)))
    setCalcAberto(null)
  }

  function setOrientacao(i, campo, valor) {
    setOrientacaoEnfermagem((prev) => prev.map((o, idx) => (idx === i ? { ...o, [campo]: valor } : o)))
  }

  // Escolher na lista de cuidados (ou texto livre): entra na prescrição ou sai, se já estava.
  function alternarOrientacao(opcao) {
    setOrientacaoEnfermagem((prev) => alternarCuidado(prev, opcao))
  }

  function removerOrientacao(i) {
    setOrientacaoEnfermagem((prev) => prev.filter((_, idx) => idx !== i))
  }

  function toggleHemo(chave) {
    setHemocomponentes((prev) => ({ ...prev, [chave]: { ...prev[chave], marcado: !prev[chave]?.marcado } }))
  }

  function setHemoQtd(chave, valor) {
    setHemocomponentes((prev) => ({ ...prev, [chave]: { ...prev[chave], quantidade: valor } }))
  }

  // Copia uma prescrição anterior para uma nova (data = hoje, alterável).
  function duplicar(p, origem = '') {
    const temConteudo = itens.some((it) => it.medicamento_nome?.trim())
    if (temConteudo && !window.confirm('Substituir o que já foi preenchido pela cópia desta prescrição?')) return
    const cp = p.campos_prescricao || {}
    setItens([...(p.prescricao_itens || []).map(itemDoBanco), { ...ITEM_VAZIO }])
    setDieta(cp.dieta || '')
    setOrientacaoEnfermagem(cp.orientacao_enfermagem?.length ? cp.orientacao_enfermagem : [{ ...ORIENTACAO_VAZIA }])
    setHemocomponentes(hemocomponentesDoBanco(cp.hemocomponentes))
    setHemocomponenteObs(cp.hemocomponente_obs || '')
    setObservacoes(p.observacoes || '')
    setDataReferencia(hojeBelem())
    setEditandoId(null)
    setAviso(`${origem ? `${origem} ` : ''}Prescrição copiada para hoje (${textoValidade(hojeBelem(), new Date())}). Revise, ajuste a data se precisar e salve.`)
    // A aba fica numa janela com rolagem própria: leva o topo do formulário à vista.
    setTimeout(() => topoRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0)
  }

  function limparFormulario() {
    setAviso('')
    setObservacoes('')
    setDieta('')
    setItens([{ ...ITEM_VAZIO }])
    setOrientacaoEnfermagem([{ ...ORIENTACAO_VAZIA }])
    setHemocomponentes({})
    setHemocomponenteObs('')
  }

  async function salvar(imprimir = false) {
    const validos = itens.filter((it) => it.medicamento_nome.trim())
    if (validos.length === 0) {
      setErro('Adicione pelo menos um medicamento.')
      return
    }
    setErro('')
    // ATM obrigatória: antimicrobiano restrito por via intravenosa → abre a ficha de ATM, já preenchida a partir da prescrição salva.
    const restritos = validos.filter((it) => exigeAtm(it.medicamento_nome, it.via))
    const semAtm = restritosSemAtm.length > 0
    await salvarDocumento(imprimir, ({ id, situacao }) => criarPrescricao({
      id, situacao,
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      medicoId,
      observacoes,
      itens: validos.map(itemParaBanco),
      dataReferencia,
      camposPrescricao: camposPrescricaoParaBanco({ dieta, orientacaoEnfermagem, hemocomponentes, hemocomponenteObs }),
    }), {
      aoFalhar: (_erro, data) => {
        // Se o cabeçalho chegou a ser gravado, ele ficou como rascunho: a próxima tentativa atualiza o mesmo registro.
        if (data?.id) setEditandoId(data.id)
        setErro(data?.id
          ? 'A prescrição ficou salva como rascunho, mas não foi possível concluir. Confira a conexão e salve de novo.'
          : 'Não foi possível salvar a prescrição. Tente de novo.')
      },
      aoSalvarRascunho: () => { setAviso(MSG_RASCUNHO_SALVO); carregar(); onAtualizarAtm?.() },
      aoFinalizar: (data) => {
        // Prescrição finalizada com ATM e/ou controlado: a ATM e a Receita de Controle Especial saem junto, na mesma impressão.
        const emPacote = data && onFinalizada
        if (emPacote) onFinalizada(data, { temAtm: restritos.length > 0, controlados: validos.filter((it) => ehControlado(it.medicamento_nome, catalogo)) })
        else if (data) onImprimir(data)
        limparFormulario()
        carregar()
        if (semAtm && !emPacote) onAbrirAtm?.()
      },
    })
  }

  return (
    <div className="clinical-split">

      
      <div className="clinical-card" style={{ flex: 1 }} ref={topoRef}>
        <div className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="cc-title">
              <h2><i className="ph ph-pill" /> Prescrição Médica Hospitalar</h2>
              </div>
              {headerTabs}
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={verHistorico}
              style={{ display: 'flex', gap: 6, alignItems: 'center', height: 36 }}
            >
              <i className="ph ph-clock-counter-clockwise"></i>
              Ver Histórico
            </button>
            {ultimaPrescricao && (
              <button type="button" className="btn btn-outline" onClick={() => duplicar(ultimaPrescricao)}
                title="Copia medicamentos, dieta, cuidados e hemocomponentes da última prescrição para uma nova"
                style={{ display: 'flex', gap: 6, alignItems: 'center', height: 36, marginLeft: 8 }}>
                <i className="ph ph-copy"></i>
                Duplicar última
              </button>
            )}
          </div>

        <div className="cc-body" id="presc-accordion" style={{ padding: 0 }}>
          <AlertasAtm restritosSemAtm={restritosSemAtm} restritosCobertos={restritosCobertos} alertasAtm={alertasAtm} vigenteDe={vigenteDe} />
          {aviso && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {aviso}</div>}
          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', margin: '16px 20px 0' }}>
              <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
            </div>
          )}

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Dia de validade da prescrição (14h00 do dia até 13h59 do dia seguinte) */}
            <div className="presc-validade">
              <label>
                <i className="ph ph-calendar-check" /> Prescrição para o dia
                <input type="date" value={dataReferencia} onChange={(e) => setDataReferencia(e.target.value || hojeBelem())} />
              </label>
              <span className="presc-validade-texto">Válida {textoValidade(dataReferencia, new Date())}</span>
              <div className="presc-validade-atalhos">
                <button type="button" className={dataReferencia === hojeBelem() ? 'on' : ''} onClick={() => setDataReferencia(hojeBelem())}>Hoje</button>
                <button type="button" className={dataReferencia === somarDias(hojeBelem(), 1) ? 'on' : ''} onClick={() => setDataReferencia(somarDias(hojeBelem(), 1))}>Amanhã</button>
              </div>
            </div>

            <GrupoPrescricao titulo="1. Dieta" icone="ph-fork-knife" fechado={gruposFechados.dieta} onAlternar={() => toggleGrupo('dieta')} estiloLista={{ padding: '12px 16px' }}>
              <input type="text" className="form-control" placeholder="ex: Dieta oral livre, Dieta enteral padrão..." value={dieta} onChange={(e) => setDieta(e.target.value)} />
            </GrupoPrescricao>

            <GrupoPrescricao titulo="2. Medicamentos" icone="ph-pill" fechado={gruposFechados.medicamentos} onAlternar={() => toggleGrupo('medicamentos')}>
              <ListaItens itens={itens} onEditar={editarItem} onRemover={removerItem} />
              {(() => {
                const i = itens.length - 1
                const it = itens[i]
                return (
                  <EditorItem
                    it={it} i={i} catalogo={catalogo} maisOpcoes={!!maisOpcoes[i]}
                    onCampo={(campo, valor) => setItem(i, campo, valor)}
                    onSelecionarMedicamento={(m) => selecionarMedicamento(i, m)}
                    onAbrirCalculadora={() => abrirCalculadora(i)}
                    onLimpar={limparRascunho}
                    onMaisOpcoes={() => setMaisOpcoes((m) => ({ ...m, [i]: true }))}
                    calculadora={calcAberto === i && (
                      <CalculadoraDosePediatrica
                        item={it}
                        calc={calc}
                        pacienteNome={atendimento?.paciente?.nome}
                        pacientePeso={atendimento?.paciente?.peso}
                        onChange={(campo, valor) => setCalc((prev) => ({ ...prev, [campo]: valor }))}
                        onAplicar={() => aplicarCalculadora(i)}
                        onCancelar={fecharCalculadora}
                      />
                    )}
                  />
                )
              })()}
              <div style={{ padding: '10px 16px' }}>
                <button type="button" className="btn-add-chip" onClick={adicionarItem}>
                  <i className="ph ph-plus" /> Adicionar à prescrição
                </button>
              </div>
            </GrupoPrescricao>

            <GrupoPrescricao titulo="3. Cuidados e Orientações de Enfermagem" icone="ph-first-aid-kit" fechado={gruposFechados.orientacoes} onAlternar={() => toggleGrupo('orientacoes')} estiloLista={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <GrupoOrientacoes orientacoes={orientacaoEnfermagem} onCampo={setOrientacao} onAlternar={alternarOrientacao} onRemover={removerOrientacao} />
            </GrupoPrescricao>

            <GrupoPrescricao titulo="4. Hemocomponentes e Derivados" icone="ph-drop" fechado={gruposFechados.hemo} onAlternar={() => toggleGrupo('hemo')} estiloLista={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <GrupoHemocomponentes hemocomponentes={hemocomponentes} observacao={hemocomponenteObs} onAlternar={toggleHemo} onQuantidade={setHemoQtd} onObservacao={setHemocomponenteObs} />
            </GrupoPrescricao>

            <GrupoPrescricao titulo="5. Observações da Prescrição" icone="ph-note" fechado={gruposFechados.observacoes} onAlternar={() => toggleGrupo('observacoes')} estiloLista={{ padding: '12px 16px' }}>
              <textarea className="form-control-area" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </GrupoPrescricao>

            {historico.length > 0 && (
              <GrupoPrescricao id="presc-historico" titulo="Histórico de Prescrições Anteriores" icone="ph-clock-counter-clockwise" fechado={gruposFechados.historico} onAlternar={() => toggleGrupo('historico')} estiloLista={{ padding: '12px 16px' }}>
                <HistoricoPrescricoes historico={historico} catalogo={catalogo} medicoId={medicoId} onImprimir={onImprimir} onDuplicar={duplicar} onReimprimirVinculado={onReimprimirVinculado} onEditarRascunho={editarRascunhoDaLista} onAtualizar={carregar} />
              </GrupoPrescricao>
            )}

          </div>
        </div>

        <div className="cc-footer">
          <div>
            <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}>
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Finalizar e Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
