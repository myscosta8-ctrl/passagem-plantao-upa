const fs = require('fs');

function applyContext(file, oldDeclarationRegex, newDeclaration) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('usePainel')) {
    content = "import { usePainel } from './PainelContext'\n" + content;
  }
  content = content.replace(oldDeclarationRegex, newDeclaration);
  fs.writeFileSync(file, content, 'utf8');
}

applyContext(
  'src/pages/painel/PainelTabela.jsx',
  /export default function PainelTabela\(\{[\s\S]*?onAbrirLeito,\n\}\) \{/,
  `export default function PainelTabela({ setoresVisiveis, onAbrirLeito }) {\n  const { leitos, pacientesPorLeito, buscaTabela: busca, setorFiltro, statusFiltro } = usePainel();`
);

applyContext(
  'src/pages/painel/PainelControles.jsx',
  /export default function PainelControles\(\{[\s\S]*?onVisualizacao,\n\}\) \{/,
  `export default function PainelControles({ setoresVisiveis }) {\n  const { buscaTabela: busca, setBuscaTabela: onBusca, setorFiltro, setSetorFiltro: onSetorFiltro, statusFiltro, setStatusFiltro: onStatusFiltro, visualizacao, setVisualizacao: onVisualizacao } = usePainel();`
);

applyContext(
  'src/pages/painel/PainelCards.jsx',
  /export default function PainelCards\(\{[\s\S]*?onAbrirDesfecho\n\}\) \{/,
  `export default function PainelCards({ setoresVisiveis }) {\n  const { leitos, pacientesPorLeito, passagemPorPaciente, buscaTabela: busca, setorFiltro, statusFiltro, menuAcoesLeitoId, setMenuAcoesLeitoId, abrirPassagem: onAbrirPassagem, setModalLeito: onAbrirModalInternar, setModalRealocar: onAbrirRealocar, abrirLeitoExtra: onAbrirLeitoExtra, modalDesfecho: onAbrirDesfecho } = usePainel();`
);

console.log('Fixed exactly');
