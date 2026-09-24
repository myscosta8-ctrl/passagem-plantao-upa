import AbaConsulta from './AbaConsulta';
import AbaPrescricao from './AbaPrescricao';
import AbaAih from './AbaAih';
import AbaExames from './AbaExames';
import AbaPlanoTerapeutico from './AbaPlanoTerapeutico';
import AbaEvolucaoMedica from './AbaEvolucaoMedica';
import AbaNotaIntercorrenciaMedica from './AbaNotaIntercorrenciaMedica';
import AbaReceituarioMedico from './AbaReceituarioMedico';
import AbaSumarioAlta from './AbaSumarioAlta';
import AbaApac from './AbaApac';
import AbaAtm from './AbaAtm';
import AbaTfd from './AbaTfd';
import AbaRegulacao from './AbaRegulacao';
import AbaSangue from './AbaSangue';
import AbaMedicacoesContinuas from './AbaMedicacoesContinuas';
import AbaAuditoria from './AbaAuditoria';

export default function FichaMedicaConteudo({ atendimento, medicoId, aba, onSelecionarAba, onImprimir }) {
  if (aba === 'consulta') {
    return (
      <AbaConsulta
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'consulta', registro })}
        onIrParaAih={() => onSelecionarAba('aih')}
      />
    );
  }
  if (aba === 'aih') {
    return (
      <AbaAih
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'aih', registro })}
        onIrParaAdmissao={() => onSelecionarAba('consulta')}
      />
    );
  }
  if (aba === 'plano') {
    return (
      <AbaPlanoTerapeutico
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'plano', registro })}
      />
    );
  }
  if (aba === 'evolucao') {
    return (
      <AbaEvolucaoMedica
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'evolucao', registro })}
      />
    );
  }
  if (aba === 'prescricao') {
    return (
      <AbaPrescricao
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'prescricao', registro })}
      />
    );
  }
  if (aba === 'exames') {
    return <AbaExames atendimento={atendimento} />;
  }
  if (aba === 'sangue') {
    return (
      <AbaSangue
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'sangue', registro })}
      />
    );
  }
  if (aba === 'receituario') {
    return (
      <AbaReceituarioMedico
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'receituario', registro })}
      />
    );
  }
  if (aba === 'alta') {
    return (
      <AbaSumarioAlta
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'alta', registro })}
      />
    );
  }
  if (aba === 'apac') {
    return (
      <AbaApac
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'apac', registro })}
      />
    );
  }
  if (aba === 'atm') {
    return (
      <AbaAtm
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'atm', registro })}
      />
    );
  }
  if (aba === 'tfd') {
    return (
      <AbaTfd
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'tfd', registro })}
      />
    );
  }
  if (aba === 'regulacao') {
    return (
      <AbaRegulacao
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'regulacao', registro })}
      />
    );
  }
  if (aba === 'intercorrencia') {
    return (
      <AbaNotaIntercorrenciaMedica
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'intercorrencia', registro })}
      />
    );
  }
  if (aba === 'medicacoesContinuas') {
    return (
      <AbaMedicacoesContinuas
        atendimento={atendimento}
        medicoId={medicoId}
      />
    );
  }
  if (aba === 'auditoria') {
    return <AbaAuditoria atendimento={atendimento} />;
  }
  return null;
}
