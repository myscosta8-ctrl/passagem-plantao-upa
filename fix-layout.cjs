const fs = require('fs');

// 1. Update EspacoPaciente.css to remove padding and ensure flex layout
let cssEspaco = fs.readFileSync('src/pages/EspacoPaciente.css', 'utf8');
cssEspaco = cssEspaco.replace(
`.espaco-paciente-conteudo {
  flex: 1;
  overflow-y: auto;
  background: var(--c-bg);
  padding: 16px 20px 40px;
  display: flex;
  flex-direction: column;
}`,
`.espaco-paciente-conteudo {
  flex: 1;
  overflow: hidden; /* Let the children handle scroll */
  background: var(--c-bg);
  padding: 0; /* Removed padding so FichaMedica can go edge-to-edge */
  display: flex;
  flex-direction: column;
}`);
// Catch the old version just in case it didn't have display flex
cssEspaco = cssEspaco.replace(
`.espaco-paciente-conteudo {
  flex: 1;
  overflow-y: auto;
  background: var(--c-bg);
  padding: 16px 20px 40px;
}`,
`.espaco-paciente-conteudo {
  flex: 1;
  overflow: hidden;
  background: var(--c-bg);
  padding: 0;
  display: flex;
  flex-direction: column;
}`);
fs.writeFileSync('src/pages/EspacoPaciente.css', cssEspaco, 'utf8');


// 2. Update AtendimentoMedico.css to be fully responsive flex and not squished
let cssAtendimento = fs.readFileSync('src/pages/ficha-medica/AtendimentoMedico.css', 'utf8');

// Fix container
cssAtendimento = cssAtendimento.replace(
`position: relative; width: 100%; height: 100%; flex: 1; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden;`,
`position: relative; width: 100%; height: 100%; flex: 1; display: flex; flex-direction: column; overflow: hidden;`
);

// We need to hide the internal topbar if embedded, because EspacoPaciente already has pillars and close buttons.
// Actually, let's keep it but make sure the workspace takes the remaining height.
if(!cssAtendimento.includes('.workspace { flex: 1')) {
  cssAtendimento = cssAtendimento.replace(
    `.atendimento-medico-container .workspace {`,
    `.atendimento-medico-container .workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden;`
  );
}

if(!cssAtendimento.includes('.clinical-split { flex: 1')) {
  cssAtendimento = cssAtendimento.replace(
    `.atendimento-medico-container .clinical-split {`,
    `.atendimento-medico-container .clinical-split { flex: 1; overflow: hidden; min-height: 0;`
  );
}

// Fix tools-pane scroll
cssAtendimento = cssAtendimento.replace(
  `.atendimento-medico-container .tools-pane {`,
  `.atendimento-medico-container .tools-pane { overflow-y: auto;`
);

// Fix clinical-card scroll
cssAtendimento = cssAtendimento.replace(
  `.atendimento-medico-container .clinical-card {`,
  `.atendimento-medico-container .clinical-card { overflow-y: auto; display: flex; flex-direction: column;`
);

// Prevent tabs from wrapping
if(!cssAtendimento.includes('.atendimento-medico-container .doc-subtabs { flex-wrap: nowrap;')) {
    cssAtendimento = cssAtendimento.replace(
        `.atendimento-medico-container .doc-subtabs { display: flex; gap: 8px; padding: 0 16px; overflow-x: auto; border-bottom: 1px solid var(--border-strong, #CBD5E1); }`,
        `.atendimento-medico-container .doc-subtabs { display: flex; flex-wrap: nowrap; gap: 8px; padding: 0 16px; overflow-x: auto; border-bottom: 1px solid var(--border-strong, #CBD5E1); white-space: nowrap; flex-shrink: 0; }`
    );
}

fs.writeFileSync('src/pages/ficha-medica/AtendimentoMedico.css', cssAtendimento, 'utf8');
console.log("CSS Updated");
