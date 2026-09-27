const fs = require('fs');

['src/pages/painel/PainelCards.jsx', 'src/pages/painel/PainelTabela.jsx', 'src/pages/painel/PainelControles.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('usePainel')) {
    content = "import { usePainel } from './PainelContext'\n" + content;
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Imports added');
