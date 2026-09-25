const fs = require('fs');
let content = fs.readFileSync('src/pages/EspacoPaciente.jsx', 'utf8');

// Hide the topo
content = content.replace(
  '<div className="espaco-paciente-topo" style={{ display: pilarAtivo === \'medico\' ? \'none\' : \'flex\' }}>',
  '<div className="espaco-paciente-topo">'
);
content = content.replace(
  '<div className="espaco-paciente-topo">',
  '<div className="espaco-paciente-topo" style={{ display: pilarAtivo === \'medico\' ? \'none\' : \'flex\' }}>'
);

// Hide the pilares
if (!content.includes('<div className="espaco-paciente-pilares" style={{ display: pilarAtivo === \'medico\' ? \'none\' : \'flex\' }}>')) {
  content = content.replace(
    '<div className="espaco-paciente-pilares">',
    '<div className="espaco-paciente-pilares" style={{ display: pilarAtivo === \'medico\' ? \'none\' : \'flex\' }}>'
  );
}

fs.writeFileSync('src/pages/EspacoPaciente.jsx', content, 'utf8');
console.log("Updated EspacoPaciente to be fully immersive for Medico");
