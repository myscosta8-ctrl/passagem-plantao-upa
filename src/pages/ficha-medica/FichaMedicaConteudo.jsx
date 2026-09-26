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
import AbaAtestadoMedico from './AbaAtestadoMedico';
import AbaAtm from './AbaAtm';
import AbaTfd from './AbaTfd';
import AbaRegulacao from './AbaRegulacao';
import AbaSangue from './AbaSangue';
import AbaMedicacoesContinuas from './AbaMedicacoesContinuas';
import AbaAuditoria from './AbaAuditoria';

export default function FichaMedicaConteudo({ atendimento, medicoId, medicoNome, medicoCrm, aba, onSelecionarAba, onImprimir, onFechar }) {
  if (aba === 'consulta') {
    return (
      <AbaConsulta
        atendimento={atendimento}
        medicoId={medicoId}
        medicoNome={medicoNome}
        medicoCrm={medicoCrm}
        onImprimir={(registro) => onImprimir({ tipo: 'consulta', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'aih') {
    return (
      <AbaAih
        atendimento={atendimento}
        medicoId={medicoId}
        medicoNome={medicoNome}
        medicoCrm={medicoCrm}
        onImprimir={(registro) => onImprimir({ tipo: 'aih', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'plano') {
    return (
      <AbaPlanoTerapeutico
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'plano', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'evolucao') {
    return (
      <AbaEvolucaoMedica
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'evolucao', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'prescricao') {
    return (
      <AbaPrescricao
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'prescricao', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'exames') {
    return <AbaExames atendimento={atendimento} medicoId={medicoId} medicoNome={medicoNome} medicoCrm={medicoCrm} onFechar={onFechar} />;
  }
  if (aba === 'sangue') {
    return (
      <AbaSangue
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'sangue', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'receituario') {
    return (
      <AbaReceituarioMedico
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'receituario', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'alta') {
    return (
      <AbaSumarioAlta
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'alta', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'apac') {
    return (
      <AbaApac
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'apac', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'atestado') {
    return (
      <AbaAtestadoMedico
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'atestado', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'atm') {
    return (
      <AbaAtm
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'atm', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'tfd') {
    return (
      <AbaTfd
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'tfd', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'regulacao') {
    return (
      <AbaRegulacao
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'regulacao', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'intercorrencia') {
    return (
      <AbaNotaIntercorrenciaMedica
        atendimento={atendimento}
        medicoId={medicoId}
        onImprimir={(registro) => onImprimir({ tipo: 'intercorrencia', registro })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'medicacoesContinuas') {
    return (
      <AbaMedicacoesContinuas
        atendimento={atendimento}
        medicoId={medicoId}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'auditoria') {
    return <AbaAuditoria atendimento={atendimento} />;
  }
  return null;
}
