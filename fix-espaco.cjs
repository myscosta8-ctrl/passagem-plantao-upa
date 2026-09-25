const fs = require('fs');
const file = 'src/pages/EspacoPaciente.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`.espaco-paciente-conteudo {
  flex: 1;
  overflow-y: auto;
  background: var(--c-bg);
  padding: 16px 20px 40px;
}`,
`.espaco-paciente-conteudo {
  flex: 1;
  overflow-y: auto;
  background: var(--c-bg);
  padding: 16px 20px 40px;
  display: flex;
  flex-direction: column;
}`);

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced EspacoPaciente CSS");
