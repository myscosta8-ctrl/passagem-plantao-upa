const fs = require('fs');

let content = fs.readFileSync('src/pages/cadastro-pacientes/AbaDesfecho.jsx', 'utf8');

// Change className="modal-btn-secondary" to className="btn-cancel" or a better primary red button.
// Actually, let's use "btn-cancel" but with a red icon, or "btn-save-draft"
content = content.replace(
  'className="modal-btn-secondary"',
  'className="btn-cancel" style={{ color: "var(--color-danger)" }}'
);
content = content.replace(
  '>\n              Sinalizar desfecho',
  '>\n              <i className="ph ph-sign-out" /> Sinalizar desfecho'
);

fs.writeFileSync('src/pages/cadastro-pacientes/AbaDesfecho.jsx', content, 'utf8');
console.log('Fixed AbaDesfecho');
