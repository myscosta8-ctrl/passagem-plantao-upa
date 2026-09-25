const fs = require('fs');
let content = fs.readFileSync('src/pages/ficha-medica/AtendimentoMedico.css', 'utf8');

if (!content.includes('.tab-btn { flex-shrink: 0;')) {
  content = content.replace(
    '.atendimento-medico-container .tab-btn {',
    '.atendimento-medico-container .tab-btn { flex-shrink: 0;'
  );
  fs.writeFileSync('src/pages/ficha-medica/AtendimentoMedico.css', content, 'utf8');
}
console.log("Updated tab-btn CSS");
