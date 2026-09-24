import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import FichaClinicaPrint from './FichaClinicaPrint';
import AbaHistoricoEnfermagem from './AbaHistoricoEnfermagem';
import ResumoPaciente from './ficha-clinica/ResumoPaciente';
import AbaAdmissao from './ficha-clinica/AbaAdmissao';
import AbaSinaisVitais from './ficha-clinica/AbaSinaisVitais';
import AbaEvolucao from './ficha-clinica/AbaEvolucao';
import AbaDispositivos from './ficha-clinica/AbaDispositivos';
import AbaBalancoHidrico from './ficha-clinica/AbaBalancoHidrico';
import AbaEscalas from './ficha-clinica/AbaEscalas';
import AbaAlergias from './ficha-clinica/AbaAlergias';
import AbaIsolamento from './ficha-clinica/AbaIsolamento';
import AbaSbar from './ficha-clinica/AbaSbar';
import AbaEventosAdversos from './ficha-clinica/AbaEventosAdversos';
import './PassagemForm.css';
import './FichaClinica.css';

export default function FichaClinica({ atendimento, onFechar, embedded = false }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState('admissao');
  const [imprimindo, setImprimindo] = useState(null);

  if (imprimindo) {
    return (
      <FichaClinicaPrint
        atendimentoId={atendimento.atendimento_id}
        tipo={imprimindo.tipo}
        registro={imprimindo.registro}
        onVoltar={() => setImprimindo(null)}
      />
    );
  }

  const corpo = (
    <div className={embedded ? "ficha-clinica-embedded" : "form-panel"} onClick={(e) => e.stopPropagation()}>
      {!embedded && (
        <div className="form-header">
          <span className="form-leito-tag">Ficha clínica — {atendimento.nome}</span>
          <button className="form-header-close" onClick={onFechar}>×</button>
        </div>
      )}

      <ResumoPaciente atendimento={atendimento} />

      <div className="form-toolbar">
        <button className={aba === 'admissao' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('admissao')}>Admissão</button>
        <button className={aba === 'admissaoEnfermagem' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('admissaoEnfermagem')}>Admissão de Enfermagem</button>
        <button className={aba === 'sinaisVitais' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('sinaisVitais')}>Sinais Vitais</button>
        <button className={aba === 'evolucao' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('evolucao')}>Evolução</button>
        <button className={aba === 'dispositivos' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('dispositivos')}>Dispositivos</button>
        <button className={aba === 'balanco' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('balanco')}>Balanço Hídrico</button>
        <button className={aba === 'escalas' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('escalas')}>Escalas</button>
        <button className={aba === 'alergias' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('alergias')}>Alergias</button>
        <button className={aba === 'isolamento' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('isolamento')}>Isolamento</button>
        <button className={aba === 'sbar' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('sbar')}>Transferência SBAR</button>
        <button className={aba === 'eventosAdversos' ? 'btn-realocar' : 'btn-copiar'} onClick={() => setAba('eventosAdversos')}>Eventos Adversos</button>
      </div>

      {aba === 'admissao' && <AbaAdmissao atendimento={atendimento} autorId={enfermeiro?.id} />}
      {aba === 'admissaoEnfermagem' && (
        <AbaHistoricoEnfermagem
          atendimento={atendimento}
          medicoId={enfermeiro?.id}
          onImprimir={(registro) => setImprimindo({
            tipo: registro._variante === 'projeto' ? 'historico_enfermagem_projeto' : 'historico_enfermagem_fiel',
            registro
          })}
        />
      )}
      {aba === 'sinaisVitais' && <AbaSinaisVitais atendimento={atendimento} autorId={enfermeiro?.id} />}
      {aba === 'evolucao' && <AbaEvolucao atendimento={atendimento} autorId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'evolucao_sae', registro })} />}
      {aba === 'dispositivos' && <AbaDispositivos atendimento={atendimento} />}
      {aba === 'balanco' && <AbaBalancoHidrico atendimento={atendimento} autorId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'balanco', registro })} />}
      {aba === 'escalas' && <AbaEscalas atendimento={atendimento} />}
      {aba === 'alergias' && <AbaAlergias atendimento={atendimento} />}
      {aba === 'isolamento' && <AbaIsolamento atendimento={atendimento} autorId={enfermeiro?.id} />}
      {aba === 'sbar' && <AbaSbar atendimento={atendimento} autorId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'sbar', registro })} />}
      {aba === 'eventosAdversos' && <AbaEventosAdversos atendimento={atendimento} autorId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'intercorrencia', registro })} />}

      {!embedded && (
        <div className="form-footer">
          <button className="btn-fechar" onClick={onFechar}>Fechar</button>
        </div>
      )}
    </div>
  );

  if (embedded) return corpo;
  return <div className="form-overlay">{corpo}</div>;
}
