import { useEffect, useState } from 'react';
import AbaPrescricao from './AbaPrescricao';
import AbaAtm from './AbaAtm';
import { listarPrescricoes, listarAtm } from '../../lib/pepMedico';
import { atbRestrito, ATM_PENDENTES_KEY } from './constantes';

// "5. Prescrição Médica" com a ficha de ATM como sub-aba escondida: ela só
// aparece quando há antimicrobiano de uso restrito prescrito (ou ATM já
// registrada/pendente), e abre sozinha ao salvar a prescrição.
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
      {temAtm && (
        <div className="clinical-card" style={{ flex: '0 0 auto' }}>
          <div className="doc-subtabs" style={{ borderBottom: 'none' }}>
            <button type="button" className={'doc-tab' + (doc === 'prescricao' ? ' active' : '')} onClick={() => setDoc('prescricao')}>
              <i className="ph ph-pill" /> Prescrição Médica
            </button>
            <button type="button" className={'doc-tab' + (doc === 'atm' ? ' active' : '')} onClick={() => setDoc('atm')}>
              <i className="ph ph-shield-warning" /> ATM — Antimicrobiano Restrito
            </button>
          </div>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {doc === 'atm' ? (
          <AbaAtm
            key="atm"
            atendimento={atendimento}
            medicoId={medicoId}
            onImprimir={(registro) => onImprimir({ tipo: 'atm', registro })}
            onFechar={onFechar}
          />
        ) : (
          <AbaPrescricao
            key="prescricao"
            atendimento={atendimento}
            medicoId={medicoId}
            onImprimir={(registro) => onImprimir({ tipo: 'prescricao', registro })}
            onAbrirAtm={() => { setTemAtm(true); setDoc('atm') }}
            onFechar={onFechar}
          />
        )}
      </div>
    </div>
  )
}
