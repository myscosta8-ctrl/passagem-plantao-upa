import { useState } from 'react';

// Painel com sub-abas (mesmo padrão de "Evoluções Médicas" / "Receituário & Alta").
// docs: [{ chave, rotulo, icon, render: () => JSX, envolver?: bool }]
// `envolver` põe telas antigas (form-section) dentro de um clinical-card padrão.
export default function PainelSubAbas({ titulo, icon, docs, docInicial }) {
  const [doc, setDoc] = useState(docInicial || docs[0].chave);
  const atual = docs.find((d) => d.chave === doc) || docs[0];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, minWidth: 0 }}>
      <div className="clinical-card" style={{ flex: '0 0 auto' }}>
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className={'ph ' + icon} /> {titulo}</h2>
          </div>
          <div className="doc-subtabs">
            {docs.map((d) => (
              <button key={d.chave} type="button" className={'doc-tab' + (doc === d.chave ? ' active' : '')} onClick={() => setDoc(d.chave)}>
                <i className={'ph ' + d.icon} /> {d.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div key={atual.chave} style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
        {atual.envolver ? (
          <div className="clinical-card" style={{ flex: 1 }}>
            <div className="cc-body">{atual.render()}</div>
          </div>
        ) : atual.render()}
      </div>
    </div>
  );
}
