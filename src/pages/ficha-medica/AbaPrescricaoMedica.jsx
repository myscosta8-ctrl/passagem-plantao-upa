import { useEffect, useState } from 'react';
import AbaPrescricao from './AbaPrescricao';
import AbaAtm from './AbaAtm';
import { listarPrescricoes, listarAtm, criarReceitaMedica, buscarCabecalhoImpressao } from '../../lib/pepMedico';
import { atmPendentes } from './constantes';
import { metaDoc } from '../../lib/documentos';
import { quantidadeDia } from '../../lib/frequencia';

const VIA_RECEITA = { VO: 'ORAL', EV: 'INTRAVENOSO (EV)', IM: 'INTRAMUSCULAR (IM)', SC: 'SUBCUTÂNEO (SC)', INAL: 'INALATÓRIO', SL: 'SUBLINGUAL', VR: 'RETAL', ID: 'INTRADÉRMICO' }

// Receita de Controle Especial (Portaria 344/98) gerada a partir dos itens controlados da prescrição.
async function gerarReceitaControle({ atendimentoId, medicoId, controlados }) {
  const cab = await buscarCabecalhoImpressao(atendimentoId).catch(() => null)
  const p = cab?.pessoa || {}
  const endereco = [[p.endereco, p.endereco_numero].filter(Boolean).join(', '), p.bairro, p.cidade].filter(Boolean).join(' — ')
  const itens = controlados.map((it) => {
    const qtd = quantidadeDia(it)
    return {
      medicamento: it.medicamento_nome.trim(),
      instrucao: [it.dose ? `${it.dose} ${it.dose_unidade || ''}`.trim() : '', it.via, it.frequencia, it.condicao, it.duracao ? `por ${it.duracao}` : '', it.instrucoes].filter(Boolean).join(', '),
      quantidade: qtd ? `${qtd} por dia` : '',
      via: VIA_RECEITA[it.via] || it.via || 'ORAL',
      controlado: true,
      antimicrobiano: false,
    }
  })
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

  // A sub-aba ATM aparece quando há antimicrobiano restrito EV prescrito (pendente) ou ATM já registrada.
  async function verificarAtm() {
    const [prescricoes, atms] = await Promise.all([listarPrescricoes(atdId), listarAtm(atdId)])
    setTemAtm(atmPendentes(prescricoes, atms).length > 0 || atms.some((a) => a.situacao !== 'invalido'))
  }
  useEffect(() => { verificarAtm() }, [atdId])

  function imprimirPacote({ prescricao, receita, atms = [] }) {
    const extras = [...atms.map((a) => ({ tipo: 'atm', registro: a })), ...(receita ? [{ tipo: 'receituario', registro: receita }] : [])]
    setPacote(null)
    onImprimir({ tipo: 'prescricao', registro: prescricao, extras })
  }

  async function prescricaoFinalizada(prescricao, { temAtm: precisaAtm, controlados }) {
    const receita = controlados.length ? await gerarReceitaControle({ atendimentoId: atdId, medicoId, controlados }) : null
    if (!precisaAtm) { imprimirPacote({ prescricao, receita }); return }
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
          <AbaPrescricao atendimento={atendimento} medicoId={medicoId} onImprimir={(registro) => onImprimir({ tipo: 'prescricao', registro })} onFinalizada={prescricaoFinalizada} onFechar={onFechar} headerTabs={subtabs} onAbrirAtm={() => { setTemAtm(true); setDoc('atm') }} onAtualizarAtm={verificarAtm} />
        )}
      </div>
    </div>
  );
}
