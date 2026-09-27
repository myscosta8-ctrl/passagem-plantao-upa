const fs = require('fs');

let content = fs.readFileSync('src/pages/Painel.jsx', 'utf8');

// First, wrap the component with PainelProvider
const providerSetup = `import { PainelProvider, usePainel } from './painel/PainelContext'

function PainelInterno({ setoresIds }) {
  const {
    enfermeiro,
    setores,
    pacientesPorLeito,
    modalLeito,
    setModalLeito,
    internarPaciente,
    modalPassagem,
    modalRealocar,
    setModalRealocar,
    carregando,
    visualizacao,
    cancelarModalInternar,
    erroInternar
  } = usePainel()
`;

content = content.replace(
  "export default function Painel({ plantao, setoresIds }) {\n  const {\n    enfermeiro,\n    setores,\n    leitos,\n    pacientesPorLeito,\n    passagemPorPaciente,\n    modalLeito,\n    setModalLeito,\n    cancelarModalInternar,\n    erroInternar,\n    setErroInternar,\n    erroGeral,\n    setErroGeral,\n    modalPassagem,\n    modalRealocar,\n    setModalRealocar,\n    menuAcoesLeitoId,\n    setMenuAcoesLeitoId,\n    carregando,\n    visualizacao,\n    setVisualizacao,\n    buscaTabela,\n    setBuscaTabela,\n    setorFiltro,\n    setSetorFiltro,\n    statusFiltro,\n    setStatusFiltro,\n    abrirPassagem,\n    fecharPassagem,\n    carregarTudo,\n    abrirLeitoExtra,\n    internarPaciente,\n  } = usePainelState({ plantao })",
  providerSetup
);

// We need to keep some local functions, but remove them from prop drilling in PainelControles, PainelCards, PainelTabela
content = content.replace(
  /<PainelControles[\s\S]*?\/>/,
  `<PainelControles
          setoresVisiveis={setoresVisiveis}
        />`
);

content = content.replace(
  /<PainelCards[\s\S]*?\/>/,
  `<PainelCards
            setoresVisiveis={setoresVisiveis}
          />`
);

content = content.replace(
  /<PainelTabela[\s\S]*?\/>/,
  `<PainelTabela
            setoresVisiveis={setoresVisiveis}
            onAbrirLeito={(paciente, leito) => {
              if (paciente) {
                // We'll call the context's abrirPassagem directly or we can grab it from context in the internal component
              }
            }}
          />`
);

// Wait, we need 'abrirPassagem', 'fecharPassagem', 'carregarTudo', 'setErroGeral' from usePainel in PainelInterno.
content = content.replace(
  '    erroInternar\n  } = usePainel()',
  '    erroInternar,\n    abrirPassagem,\n    fecharPassagem,\n    carregarTudo,\n    setErroGeral\n  } = usePainel()'
);

content = content.replace(
  'onAbrirLeito={(paciente, leito) => {',
  'onAbrirLeito={(paciente, leito) => { if (paciente) { abrirPassagem(paciente, leito) } else { setModalLeito(leito) }'
);

content = content.replace(
  '              if (paciente) {',
  ''
);

content = content.replace(
  '                // We\'ll call the context\'s abrirPassagem directly or we can grab it from context in the internal component',
  ''
);

content = content.replace(
  '              }\n            }}',
  '            }}'
);

// Add the wrapper export at the end
content = content.replace(
  '  )\n}\n',
  `  )\n}\n\nexport default function Painel(props) {\n  return (\n    <PainelProvider>\n      <PainelInterno {...props} />\n    </PainelProvider>\n  )\n}\n`
);

fs.writeFileSync('src/pages/Painel.jsx', content, 'utf8');
console.log('Fixed Painel');
