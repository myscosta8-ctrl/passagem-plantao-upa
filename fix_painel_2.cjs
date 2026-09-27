const fs = require('fs');

let content = fs.readFileSync('src/pages/Painel.jsx', 'utf8');

// The provider
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
    cancelarModalInternar,
    erroInternar,
    abrirPassagem,
    fecharPassagem,
    carregarTudo,
    setErroGeral,
    modalDesfecho,
    setModalDesfecho,
    processandoDesfecho,
    setProcessandoDesfecho,
  } = usePainel()
`;

content = content.replace(
  "export default function Painel({ plantao, setoresIds }) {\n  const {\n    enfermeiro,\n    setores,\n    leitos,\n    pacientesPorLeito,\n    passagemPorPaciente,\n    modalLeito,\n    setModalLeito,\n    cancelarModalInternar,\n    erroInternar,\n    setErroInternar,\n    erroGeral,\n    setErroGeral,\n    modalPassagem,\n    modalRealocar,\n    setModalRealocar,\n    menuAcoesLeitoId,\n    setMenuAcoesLeitoId,\n    carregando,\n    visualizacao,\n    setVisualizacao,\n    buscaTabela,\n    setBuscaTabela,\n    setorFiltro,\n    setSetorFiltro,\n    statusFiltro,\n    setStatusFiltro,\n    abrirPassagem,\n    fecharPassagem,\n    carregarTudo,\n    abrirLeitoExtra,\n    internarPaciente,\n  } = usePainelState({ plantao })\n\n  const [modalDesfecho, setModalDesfecho] = useState(null)\n  const [processandoDesfecho, setProcessandoDesfecho] = useState(false)",
  providerSetup
);

content = content.replace(
  /<PainelControles[\s\S]*?\/>/,
  `<PainelControles setoresVisiveis={setoresVisiveis} />`
);

content = content.replace(
  /<PainelCards[\s\S]*?\/>/,
  `<PainelCards setoresVisiveis={setoresVisiveis} />`
);

content = content.replace(
  /<PainelTabela[\s\S]*?\/>/,
  `<PainelTabela
            setoresVisiveis={setoresVisiveis}
            onAbrirLeito={(paciente, leito) => {
              if (paciente) {
                abrirPassagem(paciente, leito)
              } else {
                setModalLeito(leito)
              }
            }}
          />`
);

content = content.replace(
  '  )\n}\n',
  `  )\n}\n\nexport default function Painel(props) {\n  return (\n    <PainelProvider>\n      <PainelInterno {...props} />\n    </PainelProvider>\n  )\n}\n`
);

fs.writeFileSync('src/pages/Painel.jsx', content, 'utf8');
console.log('Fixed Painel');
