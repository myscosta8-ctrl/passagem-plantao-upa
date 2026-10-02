import { useEffect, useState } from 'react';
import AbaPrescricao from './AbaPrescricao';
import AbaAtm from './AbaAtm';
import { listarPrescricoes, listarAtm, criarReceitaMedica, buscarCabecalhoImpressao } from '../../lib/pepMedico';
import { atmPendentes, atmsVigentes, alertasAtm } from './constantes';
import { metaDoc } from '../../lib/documentos';
import { itemReceitaControle, impressaoVinculada } from '../../lib/documentosVinculados';

// Receita de Controle Especial (Portaria 344/98) gerada a partir dos itens controlados da prescrição.
async function gerarReceitaControle({ atendimentoId, medicoId, controlados }) {
  const cab = await buscarCabecalhoImpressao(atendimentoId).catch(() => null)
  const p = cab?.pessoa || {}
  const endereco = [[p.endereco, p.endereco_numero].filter(Boolean).join(', '), p.bairro, p.cidade].filter(Boolean).join(' — ')
  const itens = controlados.map(itemReceitaControle)
  const { data, error } = await criarReceitaMedica({
    atendimentoId, criadoPor: medicoId, situacao: metaDoc(true),
    dados: { itens, tipo: 'controle_especial', orientacoes_gerais: `Endereço do paciente: ${endereco || 'não informado no cadastro'}` },
  })
  if (error) { console.error(error); return null }
  return data
}

export default function AbaPrescricaoMedica({ atendimento, medicoId, onImprimir, onFechar, docInicial = 'prescricao' }) {
  const atdId = atendimento.atendimento_id
  const [doc, setDoc] = useState(docInicial)
  const [temAtm, setTemAtm] = useState(docInicial === 'atm')
  // Impressão conjunta: prescrição + ATM(s) + Receita de Controle Especial, quando houver necessidade.
  const [pacote, setPacote] = useState(null) // { prescricao, receita, atms: [] }
  // Validade das ATMs já emitidas: { vigentes: Map(rotulo → { atm, validade }), alertas: [] }
  const [situacaoAtm, setSituacaoAtm] = useState({ vigentes: new Map(), alertas: [] })

  // A sub-aba ATM aparece quando há antimicrobiano restrito EV prescrito (pendente) ou ATM já registrada.
  async function verificarAtm() {
    const [prescricoes, atms] = await Promise.all([listarPrescricoes(atdId), listarAtm(atdId)])
    setTemAtm(atmPendentes(prescricoes, atms).length > 0 || atms.some((a) => a.situacao !== 'invalido'))
    setSituacaoAtm({ vigentes: atmsVigentes(atms), alertas: alertasAtm(prescricoes, atms) })
  }
  useEffect(() => { verificarAtm() }, [atdId, doc]) // eslint-disable-line react-hooks/exhaustive-deps

  function imprimirPacote({ prescricao, receita, atms = [] }) {
    const extras = [...atms.map((a) => ({ tipo: 'atm', registro: a })), ...(receita ? [{ tipo: 'receituario', registro: receita }] : [])]
    setPacote(null)
    onImprimir({ tipo: 'prescricao', registro: prescricao, extras })
  }

  async function prescricaoFinalizada(prescricao, { temAtm: temRestrito, controlados }) {
    const receita = controlados.length ? await gerarReceitaControle({ atendimentoId: atdId, medicoId, controlados }) : null
    // ATM ainda válida (dentro do tempo de uso) não é emitida nem impressa de novo: só entra no
    // pacote a ATM que falta ou a renovação da que venceu.
    const precisaAtm = temRestrito && atmPendentes([prescricao], await listarAtm(atdId)).length > 0
    if (!precisaAtm) { imprimirPacote({ prescricao, receita }); verificarAtm(); return }
    setPacote({ prescricao, receita, atms: [] })
    setTemAtm(true)
    setDoc('atm')
  }

  function atmNoPacote(atm, concluido) {
    const atual = { ...pacote, atms: [...(pacote?.atms || []), atm] }
    if (concluido) imprimirPacote(atual)
    else setPacote(atual)
  }

  const subtabs = temAtm ? (
    <div className="doc-subtabs" style={{ flex: 1, border: 'none', padding: 0, marginLeft: 16 }}>
      <button type="button" className={'doc-tab' + (doc === 'prescricao' ? ' active' : '')} onClick={() => setDoc('prescricao')}>
        <i className="ph ph-pill" /> Prescrição Médica
      </button>
      <button type="button" className={'doc-tab' + (doc === 'atm' ? ' active' : '')} onClick={() => setDoc('atm')}>
        <i className="ph ph-shield-warning" /> ATM - Antimicrobiano Restrito
      </button>
    </div>
  ) : null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, minWidth: 0 }}>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
        {doc === 'atm' ? (
          <AbaAtm atendimento={atendimento} medicoId={medicoId} onImprimir={(registro) => onImprimir({ tipo: 'atm', registro })} onFechar={onFechar} headerTabs={subtabs}
            emPacote={!!pacote} onAtmNoPacote={atmNoPacote} onImprimirPacoteAgora={() => pacote && imprimirPacote(pacote)} />
        ) : (
          <AbaPrescricao atendimento={atendimento} medicoId={medicoId} onImprimir={(registro) => onImprimir({ tipo: 'prescricao', registro })} onFinalizada={prescricaoFinalizada} onReimprimirVinculado={async (qual, p) => { const pedido = await impressaoVinculada(qual, p); if (pedido) onImprimir(pedido) }} onFechar={onFechar} headerTabs={subtabs} situacaoAtm={situacaoAtm} onAbrirAtm={() => { setTemAtm(true); setDoc('atm') }} onAtualizarAtm={verificarAtm} />
        )}
      </div>
    </div>
  );
}
