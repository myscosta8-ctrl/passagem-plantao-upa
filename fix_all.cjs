const fs = require('fs');

// 1. Fix PainelCards
let pc = fs.readFileSync('src/pages/painel/PainelCards.jsx', 'utf8');
const oldPcProps = `export default function PainelCards({
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  busca,
  setorFiltro,
  statusFiltro,
  menuAcoesLeitoId,
  setMenuAcoesLeitoId,
  onAbrirPassagem,
  onAbrirModalInternar,
  onAbrirRealocar,
  onAbrirLeitoExtra,
  onAbrirDesfecho,
}) {`;
const newPcProps = `export default function PainelCards({ setoresVisiveis }) {
  const { leitos, pacientesPorLeito, passagemPorPaciente, buscaTabela: busca, setorFiltro, statusFiltro, menuAcoesLeitoId, setMenuAcoesLeitoId, abrirPassagem: onAbrirPassagem, setModalLeito: onAbrirModalInternar, setModalRealocar: onAbrirRealocar, abrirLeitoExtra: onAbrirLeitoExtra, setModalDesfecho: onAbrirDesfecho } = usePainel();`;
pc = pc.replace(oldPcProps, newPcProps);
fs.writeFileSync('src/pages/painel/PainelCards.jsx', pc, 'utf8');

// 2. Fix PainelTabela
let pt = fs.readFileSync('src/pages/painel/PainelTabela.jsx', 'utf8');
const oldPtProps = `export default function PainelTabela({
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  busca,
  setorFiltro,
  statusFiltro,
  onAbrirLeito,
}) {`;
const newPtProps = `export default function PainelTabela({ setoresVisiveis, onAbrirLeito }) {
  const { leitos, pacientesPorLeito, buscaTabela: busca, setorFiltro, statusFiltro } = usePainel();`;
pt = pt.replace(oldPtProps, newPtProps);
fs.writeFileSync('src/pages/painel/PainelTabela.jsx', pt, 'utf8');

// 3. Fix PainelControles
let pctrl = fs.readFileSync('src/pages/painel/PainelControles.jsx', 'utf8');
const oldPctrlProps = `export default function PainelControles({
  setoresVisiveis,
  busca,
  onBusca,
  setorFiltro,
  onSetorFiltro,
  statusFiltro,
  onStatusFiltro,
  visualizacao,
  onVisualizacao,
}) {`;
const newPctrlProps = `export default function PainelControles({ setoresVisiveis }) {
  const { buscaTabela: busca, setBuscaTabela: onBusca, setorFiltro, setSetorFiltro: onSetorFiltro, statusFiltro, setStatusFiltro: onStatusFiltro, visualizacao, setVisualizacao: onVisualizacao } = usePainel();`;
pctrl = pctrl.replace(oldPctrlProps, newPctrlProps);
fs.writeFileSync('src/pages/painel/PainelControles.jsx', pctrl, 'utf8');

console.log('Fixed props correctly');
