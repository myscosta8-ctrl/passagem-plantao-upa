import { useState, useEffect } from 'react';

export default function FichaClinicaHeader({ onFechar, rotuloAbaAtual, enfermeiroNome }) {
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
          ← Painel de Leitos
        </button>
        <div className="breadcrumb">
          <span>Prontuário Eletrônico</span>
          <span>&gt;</span>
          <span>Atendimento de Enfermagem</span>
          <span>&gt;</span>
          <span className="current">{rotuloAbaAtual}</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="sys-time">
          <i className="ph ph-clock" /> {relogio}
        </div>
        <div className="top-avatar">
          {enfermeiroNome?.slice(0, 2)?.toUpperCase() || 'EN'}
        </div>
      </div>
    </header>
  );
}
