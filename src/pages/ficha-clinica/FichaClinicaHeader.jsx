import { useState, useEffect } from 'react';

export default function FichaClinicaHeader({ onFechar, rotuloAbaAtual, enfermeiroNome, enfermeiroCoren }) {
  const [relogio, setRelogio] = useState('');

  useEffect(() => {
    function atualizar() {
      const agora = new Date();
      setRelogio(agora.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }));
    }
    atualizar();
    const interval = setInterval(atualizar, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="btn-voltar" onClick={onFechar}>
          <i className="ph ph-arrow-left" /> Painel de Leitos
        </button>
        <div className="breadcrumb">
          <i className="ph ph-caret-right" />
          <span>Módulo de Enfermagem</span>
          <i className="ph ph-caret-right" />
          <span className="current">{rotuloAbaAtual}</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="sys-time"><i className="ph ph-clock" /> {relogio}</div>
        {enfermeiroNome && (
          <div className="enf-avatar">
            <i className="ph ph-stethoscope" /> Enf. {enfermeiroNome}{enfermeiroCoren ? ` (COREN/PA ${enfermeiroCoren})` : ''}
          </div>
        )}
      </div>
    </header>
  );
}
