import AbaConsulta from './AbaConsulta';
import AbaAih from './AbaAih';
import AbaExames from './AbaExames';
import AbaPlanoTerapeutico from './AbaPlanoTerapeutico';
import AbaDocumentosAlta from './AbaDocumentosAlta';
import AbaEvolucoesMedicas from './AbaEvolucoesMedicas';
import AbaPrescricaoMedica from './AbaPrescricaoMedica';
import AbaSangue from './AbaSangue';

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
    return <AbaDocumentosAlta key="receituario" atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} docInicial="simples" />;
  }
  if (aba === 'alta') {
    return <AbaDocumentosAlta key="alta" atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} docInicial="sumario" />;
  }
  if (aba === 'atestado') {
    return <AbaDocumentosAlta key="atestado" atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} docInicial="atestado" />;
  }
  // 4. Evoluções Médicas (Evolução Diária, Atualização de Quadro/SISREG, Intercorrência, TFD)
  if (['evolucao', 'regulacao', 'intercorrencia', 'tfd'].includes(aba)) {
    return <AbaEvolucoesMedicas key={aba} atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} docInicial={aba} />;
  }
  // 5. Prescrição Médica (+ ATM escondida, só com antimicrobiano restrito)
  if (aba === 'prescricao' || aba === 'atm') {
    return <AbaPrescricaoMedica key={aba} atendimento={atendimento} medicoId={medicoId} onImprimir={onImprimir} onFechar={onFechar} docInicial={aba} />;
  }
  // 6. Exames & APAC (o laudo completo de APAC abre por botão dentro da guia APAC)
  if (aba === 'exames' || aba === 'apac') {
    return (
      <AbaExames
        key={aba}
        atendimento={atendimento}
        medicoId={medicoId}
        medicoNome={medicoNome}
        medicoCrm={medicoCrm}
        onImprimir={(registro) => onImprimir({ tipo: 'apac', registro })}
        onFechar={onFechar}
        abrirApacCompleto={aba === 'apac'}
      />
    );
  }
  return null;
}
