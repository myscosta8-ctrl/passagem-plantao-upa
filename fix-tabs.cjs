const fs = require('fs');
let content = fs.readFileSync('src/pages/ficha-medica/AtendimentoMedico.css', 'utf8');

if (!content.includes('.clinical-tabs { display: flex; flex-wrap: nowrap')) {
  content = content.replace(
    '.atendimento-medico-container .clinical-tabs {',
    '.atendimento-medico-container .clinical-tabs { flex-wrap: nowrap; overflow-x: auto; white-space: nowrap;'
  );
  fs.writeFileSync('src/pages/ficha-medica/AtendimentoMedico.css', content, 'utf8');
}
console.log("Updated clinical-tabs CSS");
