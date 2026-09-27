const fs = require('fs');

let content = fs.readFileSync('src/pages/painel/PainelCards.jsx', 'utf8');

content = content.replace(
  'export default function PainelCards({',
  "import { usePainel } from './PainelContext'\n\nexport default function PainelCards({\n  setoresVisiveis\n}) {\n  const {\n    leitos,\n    pacientesPorLeito,\n    passagemPorPaciente,\n    buscaTabela: busca,\n    setorFiltro,\n    statusFiltro,\n    menuAcoesLeitoId,\n    setMenuAcoesLeitoId,\n    abrirPassagem: onAbrirPassagem,\n    setModalLeito: onAbrirModalInternar,\n    setModalRealocar: onAbrirRealocar,\n    abrirLeitoExtra: onAbrirLeitoExtra,\n    setModalDesfecho: onAbrirDesfecho\n  } = usePainel();\n\n  // old props were:\n  /*"
);

content = content.replace(
  '  onAbrirDesfecho\n}) {',
  "*/"
);

fs.writeFileSync('src/pages/painel/PainelCards.jsx', content, 'utf8');
console.log('Fixed PainelCards');
