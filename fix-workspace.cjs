const fs = require('fs');
let content = fs.readFileSync('src/pages/ficha-medica/AtendimentoMedico.css', 'utf8');

content = content.replace(
  '.atendimento-medico-container .workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; flex: 1; display: flex; flex-direction: column; padding: 14px 20px; gap: 10px; overflow: hidden; }',
  '.atendimento-medico-container .workspace { padding: 16px 24px; flex: 1; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }'
);
// Also catch the single one
content = content.replace(
  '.atendimento-medico-container .workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden;',
  '.atendimento-medico-container .workspace { padding: 16px 24px; flex: 1; display: flex; flex-direction: column; gap: 14px; overflow: hidden;'
);

fs.writeFileSync('src/pages/ficha-medica/AtendimentoMedico.css', content, 'utf8');
console.log("Updated workspace CSS");
