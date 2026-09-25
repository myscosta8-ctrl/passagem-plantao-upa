import AbaHistoricoEnfermagem from '../AbaHistoricoEnfermagem';
import AbaSinaisVitais from './AbaSinaisVitais';
import AbaEvolucao from './AbaEvolucao';
import AbaDispositivos from './AbaDispositivos';
import AbaBalancoHidrico from './AbaBalancoHidrico';
import AbaEscalas from './AbaEscalas';
import AbaAlergias from './AbaAlergias';
import AbaIsolamento from './AbaIsolamento';
import AbaSbar from './AbaSbar';
import AbaEventosAdversos from './AbaEventosAdversos';

export default function FichaClinicaConteudo({ atendimento, autorId, aba, onImprimir, onFechar }) {
  if (aba === 'admissaoEnfermagem') {
    return (
      <AbaHistoricoEnfermagem
        atendimento={atendimento}
        medicoId={autorId}
        onImprimir={(registro) => onImprimir({
          tipo: registro._variante === 'projeto' ? 'historico_enfermagem_projeto' : 'historico_enfermagem_fiel',
          registro,
        })}
        onFechar={onFechar}
      />
    );
  }
  if (aba === 'sinaisVitais') {
    return <AbaSinaisVitais atendimento={atendimento} autorId={autorId} onFechar={onFechar} />;
  }
  if (aba === 'evolucao') {
    return <AbaEvolucao atendimento={atendimento} autorId={autorId} onImprimir={(registro) => onImprimir({ tipo: 'evolucao_sae', registro })} onFechar={onFechar} />;
  }
  if (aba === 'dispositivos') {
    return <AbaDispositivos atendimento={atendimento} onFechar={onFechar} />;
  }
  if (aba === 'balanco') {
    return <AbaBalancoHidrico atendimento={atendimento} autorId={autorId} onImprimir={(registro) => onImprimir({ tipo: 'balanco', registro })} onFechar={onFechar} />;
  }
  if (aba === 'escalas') {
    return <AbaEscalas atendimento={atendimento} onFechar={onFechar} />;
  }
  if (aba === 'alergias') {
    return <AbaAlergias atendimento={atendimento} onFechar={onFechar} />;
  }
  if (aba === 'isolamento') {
    return <AbaIsolamento atendimento={atendimento} autorId={autorId} onFechar={onFechar} />;
  }
  if (aba === 'sbar') {
    return <AbaSbar atendimento={atendimento} autorId={autorId} onImprimir={(registro) => onImprimir({ tipo: 'sbar', registro })} onFechar={onFechar} />;
  }
  if (aba === 'eventosAdversos') {
    return <AbaEventosAdversos atendimento={atendimento} autorId={autorId} onImprimir={(registro) => onImprimir({ tipo: 'intercorrencia', registro })} onFechar={onFechar} />;
  }
  return null;
}
