import { lazy, Suspense } from 'react';
// Cada aba carrega só quando é aberta (a Ficha Médica abre mais rápido).
const AbaConsulta = lazy(() => import('./AbaConsulta'));
const AbaAih = lazy(() => import('./AbaAih'));
const AbaExames = lazy(() => import('./AbaExames'));
const AbaPlanoTerapeutico = lazy(() => import('./AbaPlanoTerapeutico'));
const AbaDocumentosAlta = lazy(() => import('./AbaDocumentosAlta'));
const AbaEvolucoesMedicas = lazy(() => import('./AbaEvolucoesMedicas'));
const AbaPrescricaoMedica = lazy(() => import('./AbaPrescricaoMedica'));
const AbaSangue = lazy(() => import('./AbaSangue'));
const AbaNotificacaoSinan = lazy(() => import('../sinan/AbaNotificacaoSinan'));

function ConteudoAba({ atendimento, medicoId, medicoNome, medicoCrm, aba, onSelecionarAba, onImprimir, onFechar }) {
  if (aba === 'sinan') {
    return <AbaNotificacaoSinan atendimento={atendimento} onFechar={onFechar} />;
  }
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
        onImprimir={(registro, tipo = 'apac') => onImprimir({ tipo, registro })}
        onFechar={onFechar}
        abrirApacCompleto={aba === 'apac'}
      />
    );
  }
  return null;
}

export default function FichaMedicaConteudo(props) {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: '#64748B', fontSize: 14 }}>Carregando...</div>}>
      <ConteudoAba {...props} />
    </Suspense>
  );
}
