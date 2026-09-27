const fs = require('fs');

function deleteComment(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/\*[\s\S]*?\*\//, '');
  fs.writeFileSync(file, content, 'utf8');
}

deleteComment('src/pages/painel/PainelTabela.jsx');
deleteComment('src/pages/painel/PainelCards.jsx');
deleteComment('src/pages/painel/PainelControles.jsx');

console.log('Comments deleted');
