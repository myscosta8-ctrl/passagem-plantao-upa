const fs = require('fs');

let content = fs.readFileSync('src/pages/painel/usePainelState.js', 'utf8');

// Add modalDesfecho and processandoDesfecho to state
content = content.replace(
  "const [statusFiltro, setStatusFiltro] = useState('')",
  "const [statusFiltro, setStatusFiltro] = useState('')\n  const [modalDesfecho, setModalDesfecho] = useState(null)\n  const [processandoDesfecho, setProcessandoDesfecho] = useState(false)"
);

// Add the return values
content = content.replace(
  "internarPaciente,",
  "internarPaciente,\n    modalDesfecho,\n    setModalDesfecho,\n    processandoDesfecho,\n    setProcessandoDesfecho,"
);

fs.writeFileSync('src/pages/painel/usePainelState.js', content, 'utf8');
console.log('Fixed usePainelState');
