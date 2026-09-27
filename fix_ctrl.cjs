const fs = require('fs');

let content = fs.readFileSync('src/pages/painel/PainelControles.jsx', 'utf8');

content = content.replace(
  'export default function PainelControles({',
  "import { usePainel } from './PainelContext'\n\nexport default function PainelControles({\n  setoresVisiveis\n}) {\n  const {\n    buscaTabela: busca,\n    setBuscaTabela: onBusca,\n    setorFiltro,\n    setSetorFiltro: onSetorFiltro,\n    statusFiltro,\n    setStatusFiltro: onStatusFiltro,\n    visualizacao,\n    setVisualizacao: onVisualizacao\n  } = usePainel();\n\n  /*"
);

content = content.replace(
  '  onVisualizacao,\n}) {',
  "*/"
);

fs.writeFileSync('src/pages/painel/PainelControles.jsx', content, 'utf8');
console.log('Fixed PainelControles');
