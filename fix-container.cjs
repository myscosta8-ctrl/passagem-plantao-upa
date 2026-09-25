const fs = require('fs');
const file = 'src/pages/ficha-medica/AtendimentoMedico.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/position:\s*fixed;\s*inset:\s*0;\s*width:\s*100vw;\s*height:\s*100vh;\s*z-index:\s*1000;/g, 'position: relative; width: 100%; height: 100%; flex: 1; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden;');

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced CSS");
