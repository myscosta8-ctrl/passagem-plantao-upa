import { useState, useEffect } from 'react';

export default function FichaClinicaHeader({ onFechar, rotuloAbaAtual, enfermeiroNome, enfermeiroCoren, onTrocarPilar, onAbrirHistorico }) {
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
      </div>
      <div className="topbar-right">
        {onTrocarPilar && (
          <button type="button" className="btn-pilar" onClick={onTrocarPilar} title="Abrir o Prontuário Médico deste paciente">
            <i className="ph ph-first-aid-kit" /> Prontuário Médico
          </button>
        )}
        {onAbrirHistorico && (
          <button type="button" className="btn-pilar" onClick={onAbrirHistorico} title="Consultar o histórico clínico do paciente">
            <i className="ph ph-clock-counter-clockwise" /> Histórico Clínico
          </button>
        )}
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
