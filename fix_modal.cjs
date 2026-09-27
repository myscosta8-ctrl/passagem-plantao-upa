const fs = require('fs');
let content = fs.readFileSync('src/pages/ModalDesfecho.jsx', 'utf8');

// Fix broken encodings
content = content.replace(/'"bito'/g, "'Óbito'");
content = content.replace(/'TransferǦncia'/g, "'Transferência'");
content = content.replace(/'Evasǜo'/g, "'Evasão'");
content = content.replace(/'Alta mǸdica normal'/g, "'Alta médica normal'");
content = content.replace(/tipo === '"bito'/g, "tipo === 'Óbito'");
content = content.replace(/'Foi a bito'/g, "'Foi a óbito'");
content = content.replace(/'Saiu sem alta mǸdica'/g, "'Saiu sem alta médica'");
content = content.replace(/histrico/g, "histórico");
content = content.replace(/prximos/g, "próximos");
content = content.replace(/"bito/g, "Óbito");

fs.writeFileSync('src/pages/ModalDesfecho.jsx', content, 'utf8');
console.log('Fixed ModalDesfecho encodings');
