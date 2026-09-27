import { useState } from 'react';
import AbaReceituarioMedico from './AbaReceituarioMedico';
import AbaAtestadoMedico from './AbaAtestadoMedico';
import AbaSumarioAlta from './AbaSumarioAlta';

// Tela única "Receituário & Alta" (mockup 05-receituario-alta-design.html):
// Receita Simples, Controle Especial, Atestado e Sumário de Alta como
// sub-abas de um mesmo painel de Documentos de Alta.
export default function AbaDocumentosAlta({ atendimento, medicoId, onImprimir, onFechar, docInicial = 'simples' }) {
  const [doc, setDoc] = useState(docInicial);
  const [pulse, setPulse] = useState(false);

  const abas = [
    { chave: 'simples', rotulo: 'Receita Simples (Branca)', icon: 'ph-pill' },
    { chave: 'controle', rotulo: 'Controle Especial (2 Vias)', icon: 'ph-warning-circle' },
    { chave: 'atestado', rotulo: 'Atestado Médico', icon: 'ph-file-text' },
    { chave: 'sumario', rotulo: 'Sumário de Alta', icon: 'ph-clipboard-text' },
  ];

  // Receituário fica montado (só oculto) para não perder os itens das
  // duas receitas ao alternar para Atestado/Sumário.
  const ehReceita = doc === 'simples' || doc === 'controle';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, minWidth: 0 }}>
      <div className="clinical-card" style={{ flex: '0 0 auto' }}>
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-folder-open" style={{ color: 'var(--success, #16A34A)' }} /> Documentos de Alta do Paciente</h2>
          </div>
          <div className="doc-subtabs">
            {abas.map((a) => (
              <button
                key={a.chave}
                type="button"
                className={'doc-tab' + (doc === a.chave ? ' active' : '') + (a.chave === 'controle' && pulse ? ' highlight-pulse' : '')}
                onClick={() => setDoc(a.chave)}
              >
                <i className={'ph ' + a.icon} /> {a.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: ehReceita ? 'flex' : 'none' }}>
        <AbaReceituarioMedico
          atendimento={atendimento}
          medicoId={medicoId}
          onImprimir={(registro) => onImprimir({ tipo: 'receituario', registro })}
          onFechar={onFechar}
          subTabExterno={ehReceita ? doc : 'simples'}
          onSubTab={setDoc}
          onPulseControle={setPulse}
        />
      </div>
      {doc === 'atestado' && (
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
          <AbaAtestadoMedico atendimento={atendimento} medicoId={medicoId} onImprimir={(registro) => onImprimir({ tipo: 'atestado', registro })} onFechar={onFechar} />
        </div>
      )}
      {doc === 'sumario' && (
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
          <AbaSumarioAlta atendimento={atendimento} medicoId={medicoId} onImprimir={(registro) => onImprimir({ tipo: 'alta', registro })} onFechar={onFechar} />
        </div>
      )}
    </div>
  );
}
