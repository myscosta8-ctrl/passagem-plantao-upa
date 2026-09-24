import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
const FichaMedicaPrint = lazy(() => import('./FichaMedicaPrint'));
import DiagnosticoPrincipal from './ficha-medica/DiagnosticoPrincipal';
import AbaConsulta from './ficha-medica/AbaConsulta';
import AbaPrescricao from './ficha-medica/AbaPrescricao';
import AbaAih from './ficha-medica/AbaAih';
import AbaExames from './ficha-medica/AbaExames';
import AbaPlanoTerapeutico from './ficha-medica/AbaPlanoTerapeutico';
import AbaEvolucaoMedica from './ficha-medica/AbaEvolucaoMedica';
import AbaNotaIntercorrenciaMedica from './ficha-medica/AbaNotaIntercorrenciaMedica';
import AbaReceituarioMedico from './ficha-medica/AbaReceituarioMedico';
import AbaSumarioAlta from './ficha-medica/AbaSumarioAlta';
import AbaApac from './ficha-medica/AbaApac';
import AbaAtm from './ficha-medica/AbaAtm';
import AbaTfd from './ficha-medica/AbaTfd';
import AbaRegulacao from './ficha-medica/AbaRegulacao';
import AbaSangue from './ficha-medica/AbaSangue';
import AbaMedicacoesContinuas from './ficha-medica/AbaMedicacoesContinuas';
import AbaAuditoria from './ficha-medica/AbaAuditoria';
import './PassagemForm.css';

const ABAS = [
  { chave: 'consulta', rotulo: 'Consulta' },
  { chave: 'prescricao', rotulo: 'Prescrição' },
  { chave: 'aih', rotulo: 'AIH' },
  { chave: 'exames', rotulo: 'Exames' },
  { chave: 'plano', rotulo: 'Plano Terapêutico' },
  { chave: 'evolucao', rotulo: 'Evolução Médica Diária' },
  { chave: 'intercorrencia', rotulo: 'Nota de Intercorrência Médica' },
  { chave: 'receituario', rotulo: 'Receituário Médico' },
  { chave: 'apac', rotulo: 'APAC' },
  { chave: 'atm', rotulo: 'ATM' },
  { chave: 'tfd', rotulo: 'TFD' },
  { chave: 'regulacao', rotulo: 'Regulação' },
  { chave: 'sangue', rotulo: 'Solicitação de Sangue' },
  { chave: 'medicacoesContinuas', rotulo: 'Medicações Contínuas' },
  { chave: 'alta', rotulo: 'Sumário de Alta' },
  { chave: 'auditoria', rotulo: 'Auditoria' },
];

export default function FichaMedica({ atendimento, onFechar, embedded = false }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState('consulta');
  const [imprimindo, setImprimindo] = useState(null);

  if (imprimindo) {
    return (
      <Suspense fallback={<div className="print-page" style={{ padding: 20, color: 'var(--color-text-muted)' }}>Carregando visualização de impressão...</div>}>
        <FichaMedicaPrint
          atendimentoId={atendimento.atendimento_id}
          tipo={imprimindo.tipo}
          registro={imprimindo.registro}
          onVoltar={() => setImprimindo(null)}
        />
      </Suspense>
    );
  }

  const corpo = (
    <div className={embedded ? "ficha-clinica-embedded" : "form-panel"} onClick={(e) => e.stopPropagation()}>
      {!embedded && (
        <div className="form-header">
          <span className="form-leito-tag">Leito {atendimento.leito_numero} — {atendimento.nome}</span>
          <button className="form-header-close" onClick={onFechar}>×</button>
        </div>
      )}

      <DiagnosticoPrincipal atendimento={atendimento} medicoId={enfermeiro?.id} />

      <div className="form-toolbar clinical-tabs">
        {ABAS.map((a) => (
          <button
            key={a.chave}
            type="button"
            className={`tab-btn ${a.chave === aba ? 'active' : ''}`}
            onClick={() => setAba(a.chave)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {aba === 'consulta' && <AbaConsulta atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'consulta', registro })} />}
      {aba === 'prescricao' && <AbaPrescricao atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'prescricao', registro })} />}
      {aba === 'aih' && <AbaAih atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'aih', registro })} />}
      {aba === 'exames' && <AbaExames atendimento={atendimento} />}
      {aba === 'plano' && <AbaPlanoTerapeutico atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'plano', registro })} />}
      {aba === 'evolucao' && <AbaEvolucaoMedica atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'evolucao', registro })} />}
      {aba === 'intercorrencia' && <AbaNotaIntercorrenciaMedica atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'intercorrencia', registro })} />}
      {aba === 'receituario' && <AbaReceituarioMedico atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'receituario', registro })} />}
      {aba === 'alta' && <AbaSumarioAlta atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'alta', registro })} />}
      {aba === 'apac' && <AbaApac atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'apac', registro })} />}
      {aba === 'atm' && <AbaAtm atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'atm', registro })} />}
      {aba === 'tfd' && <AbaTfd atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'tfd', registro })} />}
      {aba === 'regulacao' && <AbaRegulacao atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'regulacao', registro })} />}
      {aba === 'sangue' && <AbaSangue atendimento={atendimento} medicoId={enfermeiro?.id} onImprimir={(registro) => setImprimindo({ tipo: 'sangue', registro })} />}
      {aba === 'medicacoesContinuas' && <AbaMedicacoesContinuas atendimento={atendimento} medicoId={enfermeiro?.id} />}
      {aba === 'auditoria' && <AbaAuditoria atendimento={atendimento} />}

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
