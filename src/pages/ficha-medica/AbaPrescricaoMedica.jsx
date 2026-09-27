import { useEffect, useState } from 'react';
import AbaPrescricao from './AbaPrescricao';
import AbaAtm from './AbaAtm';
import { listarPrescricoes, listarAtm } from '../../lib/pepMedico';
import { atbRestrito, ATM_PENDENTES_KEY } from './constantes';

export default function AbaPrescricaoMedica({ atendimento, medicoId, onImprimir, onFechar, docInicial = 'prescricao' }) {
  const atdId = atendimento.atendimento_id
  const [doc, setDoc] = useState(docInicial)
  const [temAtm, setTemAtm] = useState(docInicial === 'atm')

  async function verificarAtm() {
    let pendente = false
    try { pendente = JSON.parse(sessionStorage.getItem(ATM_PENDENTES_KEY + ':' + atdId) || '[]').length > 0 } catch { /* ignore */ }
    if (pendente) { setTemAtm(true); return }
    const [prescricoes, atms] = await Promise.all([listarPrescricoes(atdId), listarAtm(atdId)])
    const prescrito = prescricoes.some((p) => p.status !== 'cancelada' && (p.prescricao_itens || []).some((it) => atbRestrito(it.medicamento_nome)))
    setTemAtm(prescrito || atms.length > 0)
  }
  useEffect(() => { verificarAtm() }, [atdId])

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
          <AbaAtm atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} headerTabs={subtabs} />
        ) : (
          <AbaPrescricao atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} headerTabs={subtabs} onAbrirAtm={() => { setTemAtm(true); setDoc('atm') }} />
        )}
      </div>
    </div>
  );
}
