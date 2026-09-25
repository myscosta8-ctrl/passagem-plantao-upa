const fs = require('fs');
let content = fs.readFileSync('src/pages/EspacoPaciente.jsx', 'utf8');

if (!content.includes('espaco-paciente-topo" style={{ display: pilarAtivo === \'medico\' ? \'none\' : \'flex\' }}')) {
  content = content.replace(
    '<div className="espaco-paciente-topo">',
    '<div className="espaco-paciente-topo" style={{ display: pilarAtivo === \'medico\' ? \'none\' : \'flex\' }}>'
  );
  fs.writeFileSync('src/pages/EspacoPaciente.jsx', content, 'utf8');
}
console.log("Updated EspacoPaciente header visibility");
