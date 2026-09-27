const fs = require('fs');

let content = fs.readFileSync('src/pages/painel/PainelCards.jsx', 'utf8');

content = content.replace(
  'modalDesfecho: onAbrirDesfecho',
  'setModalDesfecho: onAbrirDesfecho'
);

fs.writeFileSync('src/pages/painel/PainelCards.jsx', content, 'utf8');
console.log('Fixed PainelCards');
