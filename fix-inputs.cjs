const fs = require('fs');
let content = fs.readFileSync('src/pages/ficha-medica/AtendimentoMedico.css', 'utf8');

content = content.replace(
  /\.atendimento-medico-container \.form-control \{ width: 100%; padding: 10px 14px; border: 1px solid var\(--border-strong, #CBD5E1\); border-radius: 8px; font-size: 14px;/g,
  '.atendimento-medico-container .form-control { width: 100%; padding: 8px 10px; border: 1px solid var(--border-strong, #CBD5E1); border-radius: 6px; font-size: 12px;'
);

content = content.replace(
  /\.atendimento-medico-container \.form-control-area \{ width: 100%; padding: 14px; border: 1px solid var\(--border-strong, #CBD5E1\); border-radius: 8px; font-size: 14px; outline: none; background: #F8FAFC; color: var\(--text-main, #0F172A\); transition: 0\.2s; min-height: 120px;/g,
  '.atendimento-medico-container .form-control-area { width: 100%; padding: 8px 10px; border: 1px solid var(--border-strong, #CBD5E1); border-radius: 6px; font-size: 12px; outline: none; background: #F8FAFC; color: var(--text-main, #0F172A); transition: 0.2s; min-height: 80px;'
);

fs.writeFileSync('src/pages/ficha-medica/AtendimentoMedico.css', content, 'utf8');
console.log("Updated form controls sizes");
