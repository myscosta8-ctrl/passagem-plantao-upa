import { useState, useEffect } from 'react';

export default function FichaMedicaHeader({ onFechar, rotuloAbaAtual, medicoNome }) {
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
    <header className="topbar no-print">
      <div className="topbar-left">
        <button type="button" className="btn-voltar" onClick={onFechar}>
          <i className="ph ph-arrow-left" /> Painel de Leitos
        </button>
        <div className="breadcrumb">
          <span>Prontuário Eletrônico</span>
          <i className="ph ph-caret-right" />
          <span>Atendimento Médico</span>
          <i className="ph ph-caret-right" />
          <span className="current">{rotuloAbaAtual}</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="sys-time"><i className="ph ph-clock" /> {relogio}</div>
        <div className="top-avatar">AD</div>
      </div>
    </header>
  );
}
