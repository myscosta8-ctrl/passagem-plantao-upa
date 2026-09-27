const fs = require('fs');

let content = fs.readFileSync('src/pages/CadastroPacientes.jsx', 'utf8');

// Fix the scrolling issue and max-width layout
content = content.replace(
  '<div className="page" style={{ maxWidth: 900 }}>',
  '<div className="page recepcao-page-scroll">'
);

// We'll replace the old form-toolbar with the nice doc-subtabs!
content = content.replace(
  /<div className="form-toolbar"[^>]*>[\s\S]*?<\/div>/m,
  `<div className="doc-subtabs" style={{ marginBottom: 24 }}>
          <button
            className={\`doc-subtab \${aba === 'buscar' ? 'active' : ''}\`}
            onClick={() => { setAba('buscar'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-magnifying-glass" /> Buscar paciente (1º passo)
          </button>
          <button
            className={\`doc-subtab \${aba === 'novo' ? 'active' : ''}\`}
            onClick={() => setAba('novo')}
          >
            <i className="ph ph-user-plus" /> {pessoaParaEditar ? 'Completar dados' : 'Novo cadastro'}
          </button>
          <button
            className={\`doc-subtab \${aba === 'duplicatas' ? 'active' : ''}\`}
            onClick={() => { setAba('duplicatas'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-copy" /> Duplicatas{qtdDuplicatas > 0 ? \` (\${qtdDuplicatas})\` : ''}
          </button>
          <button
            className={\`doc-subtab \${aba === 'desfecho' ? 'active' : ''}\`}
            onClick={() => { setAba('desfecho'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-check-square-offset" /> Desfechos
          </button>
        </div>`
);

fs.writeFileSync('src/pages/CadastroPacientes.jsx', content, 'utf8');

// Now add the CSS for .recepcao-page-scroll to CadastroPacientes.css
const cssAdd = `\n
.recepcao-page-scroll {
  flex: 1;
  overflow-y: auto !important;
  max-width: 1000px !important;
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;
}
@media (min-width: 1200px) {
  .recepcao-page-scroll {
    max-width: 1200px !important;
  }
}
`;
fs.appendFileSync('src/pages/CadastroPacientes.css', cssAdd, 'utf8');
console.log('Fixed CadastroPacientes');
