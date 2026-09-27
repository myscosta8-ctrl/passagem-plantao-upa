const fs = require('fs');

let content = fs.readFileSync('src/pages/painel/PainelTabela.jsx', 'utf8');

content = content.replace(
  'export default function PainelTabela({',
  "import { usePainel } from './PainelContext'\n\nexport default function PainelTabela({\n  setoresVisiveis,\n  onAbrirLeito\n}) {\n  const {\n    leitos,\n    pacientesPorLeito,\n    buscaTabela: busca,\n    setorFiltro,\n    statusFiltro\n  } = usePainel();\n\n  /*"
);

content = content.replace(
  '  statusFiltro,\n  onAbrirLeito,\n}) {',
  "*/"
);

fs.writeFileSync('src/pages/painel/PainelTabela.jsx', content, 'utf8');
console.log('Fixed PainelTabela');
