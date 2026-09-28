import { useState } from 'react';
import AbaEvolucaoMedica from './AbaEvolucaoMedica';
import AbaRegulacao from './AbaRegulacao';
import AbaNotaIntercorrenciaMedica from './AbaNotaIntercorrenciaMedica';
import AbaTfd from './AbaTfd';

// "4. Evoluções Médicas": todos os documentos médicos do dia a dia numa tela só.
const DOCS = [
  { chave: 'evolucao', rotulo: 'Evolução Diária', icon: 'ph-activity', tipo: 'evolucao', C: AbaEvolucaoMedica },
  { chave: 'regulacao', rotulo: 'Atualização de Quadro Clínico', icon: 'ph-broadcast', tipo: 'regulacao', C: AbaRegulacao },
  { chave: 'intercorrencia', rotulo: 'Nota de Intercorrência', icon: 'ph-siren', tipo: 'intercorrencia', C: AbaNotaIntercorrenciaMedica },
  { chave: 'tfd', rotulo: 'TFD', icon: 'ph-boat', tipo: 'tfd', C: AbaTfd },
];

export default function AbaEvolucoesMedicas({  atendimento, medicoId, onImprimir, onFechar, docInicial = 'evolucao'  }) {
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [doc, setDoc] = useState(docInicial);
  const atual = DOCS.find((d) => d.chave === doc) || DOCS[0];
  const C = atual.C;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, minWidth: 0 }}>
      <div className="clinical-card" style={{ flex: '0 0 auto' }}>
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-files" /> Evoluções Médicas</h2>
          </div>
          <div className="doc-subtabs" style={{ flex: 1 }}>
            {DOCS.map((d) => (
              <button key={d.chave} type="button" className={'doc-tab' + (doc === d.chave ? ' active' : '')} onClick={() => setDoc(d.chave)}>
                <i className={'ph ' + d.icon} /> {d.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
        <C
          key={atual.chave}
          atendimento={atendimento}
          medicoId={medicoId}
          onImprimir={(registro) => onImprimir({ tipo: atual.tipo, registro })}
          onFechar={onFechar}
        historicoAberto={historicoAberto}
          onSetHistoricoAberto={setHistoricoAberto}
        />
      </div>
    </div>
  );
}
