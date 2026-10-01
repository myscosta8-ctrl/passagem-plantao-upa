import { lazy, Suspense } from 'react';
const AbaHistoricoEnfermagem = lazy(() => import('../AbaHistoricoEnfermagem'));
const AbaEvolucao = lazy(() => import('./AbaEvolucao'));
const AbaBalancoHidrico = lazy(() => import('./AbaBalancoHidrico'));
const AbaIsolamento = lazy(() => import('./AbaIsolamento'));
const AbaSbar = lazy(() => import('./AbaSbar'));
const AbaEventosAdversos = lazy(() => import('./AbaEventosAdversos'));
const PainelSubAbas = lazy(() => import('./PainelSubAbas'));
const AbaEscalas = lazy(() => import('./AbaEscalas'));
const AbaDispositivos = lazy(() => import('./AbaDispositivos'));
const AbaAlergias = lazy(() => import('./AbaAlergias'));
const AbaNotificacaoSinan = lazy(() => import('../sinan/AbaNotificacaoSinan'));

// Estrutura dos mockups 08–14: Admissão, Evolução SAE, Cardex/Aprazamento,
// Balanço Hídrico 24h, Transferência SBAR e Intercorrências. As telas que não
// têm aba própria no mockup entram como sub-abas do documento a que pertencem.
function ConteudoAba({ atendimento, autorId, aba, onImprimir, onFechar }) {
  const comum = { atendimento, autorId, onFechar };

  // Admissão (mockup 08): alergias, dispositivos e escalas ficam no painel lateral da própria tela.
  if (['escalasProtocolos', 'dispositivos', 'escalas', 'alergias'].includes(aba)) {
    return (
      <PainelSubAbas titulo="Escalas e Protocolos" icon="ph-gauge"
        docInicial={['dispositivos', 'alergias'].includes(aba) ? aba : 'escalas'}
        docs={[
          { chave: 'escalas', rotulo: 'Escalas (Braden, Morse e outras)', icon: 'ph-gauge', render: () => <AbaEscalas atendimento={atendimento} onFechar={onFechar} /> },
          { chave: 'dispositivos', rotulo: 'Dispositivos Invasivos', icon: 'ph-needle', render: () => <AbaDispositivos atendimento={atendimento} onFechar={onFechar} /> },
          { chave: 'alergias', rotulo: 'Alergias e Restrições', icon: 'ph-shield-warning', render: () => <AbaAlergias atendimento={atendimento} onFechar={onFechar} /> },
        ]} />
    );
  }
  if (aba === 'sinan') {
    return <AbaNotificacaoSinan atendimento={atendimento} onFechar={onFechar} />;
  }
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
  // Evolução SAE (mockup 09): os sinais vitais do turno ficam dentro da própria evolução.
  if (aba === 'evolucao' || aba === 'sinaisVitais') {
    return <AbaEvolucao {...comum} onImprimir={(registro) => onImprimir({ tipo: 'evolucao_sae', registro })} />;
  }
  if (aba === 'balanco') {
    return <AbaBalancoHidrico {...comum} onImprimir={(registro) => onImprimir({ tipo: 'balanco', registro })} />;
  }
  if (aba === 'sbar') {
    return <AbaSbar {...comum} onImprimir={(registro) => onImprimir({ tipo: 'sbar', registro })} />;
  }
  if (aba === 'intercorrencias' || aba === 'eventosAdversos') {
      return <AbaEventosAdversos {...comum} onImprimir={(registro) => onImprimir({ tipo: 'intercorrencia', registro })} />;
    }
    if (aba === 'isolamento') {
      return (
        <div className="clinical-card" style={{ flex: 1 }}>
          <div className="cc-body"><AbaIsolamento {...comum} /></div>
        </div>
      );
    }
    return null;
}

export default function FichaClinicaConteudo(props) {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: '#64748B', fontSize: 14 }}>Carregando...</div>}>
      <ConteudoAba {...props} />
    </Suspense>
  );
}
