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
import PainelSubAbas from './PainelSubAbas';

// Estrutura dos mockups 08–14: Admissão, Evolução SAE, Cardex/Aprazamento,
// Balanço Hídrico 24h, Transferência SBAR e Intercorrências. As telas que não
// têm aba própria no mockup entram como sub-abas do documento a que pertencem.
export default function FichaClinicaConteudo({ atendimento, autorId, aba, onImprimir, onFechar }) {
  const comum = { atendimento, autorId, onFechar };

  if (['admissaoEnfermagem', 'dispositivos', 'escalas', 'alergias'].includes(aba)) {
    return (
      <PainelSubAbas
        key={aba}
        titulo="Admissão de Enfermagem"
        icon="ph-notepad"
        docInicial={aba}
        docs={[
          { chave: 'admissaoEnfermagem', rotulo: 'Admissão (SAE)', icon: 'ph-notepad', render: () => (
            <AbaHistoricoEnfermagem
              atendimento={atendimento}
              medicoId={autorId}
              onImprimir={(registro) => onImprimir({
                tipo: registro._variante === 'projeto' ? 'historico_enfermagem_projeto' : 'historico_enfermagem_fiel',
                registro,
              })}
              onFechar={onFechar}
            />
          ) },
          { chave: 'alergias', rotulo: 'Alergias', icon: 'ph-warning-octagon', envolver: true, render: () => <AbaAlergias {...comum} /> },
          { chave: 'dispositivos', rotulo: 'Dispositivos Invasivos', icon: 'ph-plugs', envolver: true, render: () => <AbaDispositivos {...comum} /> },
          { chave: 'escalas', rotulo: 'Escalas de Risco', icon: 'ph-chart-bar', envolver: true, render: () => <AbaEscalas {...comum} /> },
        ]}
      />
    );
  }
  if (aba === 'evolucao' || aba === 'sinaisVitais') {
    return (
      <PainelSubAbas
        key={aba}
        titulo="Evolução de Enfermagem (SAE)"
        icon="ph-activity"
        docInicial={aba}
        docs={[
          { chave: 'evolucao', rotulo: 'Evolução SAE', icon: 'ph-activity', render: () => <AbaEvolucao {...comum} onImprimir={(registro) => onImprimir({ tipo: 'evolucao_sae', registro })} /> },
          { chave: 'sinaisVitais', rotulo: 'Sinais Vitais', icon: 'ph-heartbeat', envolver: true, render: () => <AbaSinaisVitais {...comum} /> },
        ]}
      />
    );
  }
  if (aba === 'balanco') {
    return <AbaBalancoHidrico {...comum} onImprimir={(registro) => onImprimir({ tipo: 'balanco', registro })} />;
  }
  if (aba === 'sbar') {
    return <AbaSbar {...comum} onImprimir={(registro) => onImprimir({ tipo: 'sbar', registro })} />;
  }
  if (aba === 'intercorrencias' || aba === 'eventosAdversos' || aba === 'isolamento') {
    return (
      <PainelSubAbas
        key={aba}
        titulo="Intercorrências"
        icon="ph-siren"
        docInicial={aba === 'isolamento' ? 'isolamento' : 'eventosAdversos'}
        docs={[
          { chave: 'eventosAdversos', rotulo: 'Nota de Intercorrência / Eventos Adversos', icon: 'ph-siren', render: () => <AbaEventosAdversos {...comum} onImprimir={(registro) => onImprimir({ tipo: 'intercorrencia', registro })} /> },
          { chave: 'isolamento', rotulo: 'Isolamento', icon: 'ph-shield-warning', envolver: true, render: () => <AbaIsolamento {...comum} /> },
        ]}
      />
    );
  }
  return null;
}
