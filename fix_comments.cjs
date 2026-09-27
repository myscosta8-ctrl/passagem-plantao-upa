const fs = require('fs');

function fixComment(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('/*') && !content.includes('*/')) {
    content += '\n*/';
    fs.writeFileSync(file, content, 'utf8');
  }
}

fixComment('src/pages/painel/PainelTabela.jsx');
fixComment('src/pages/painel/PainelCards.jsx');
fixComment('src/pages/painel/PainelControles.jsx');

console.log('Comments fixed');
