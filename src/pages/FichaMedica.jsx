import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
const FichaMedicaPrint = lazy(() => import('./FichaMedicaPrint'));
import PatientBanner from './ficha-medica/PatientBanner';
import FichaMedicaHeader from './ficha-medica/FichaMedicaHeader';
import FichaMedicaTabs, { ABAS_PRINCIPAIS, ABAS_SECUNDARIAS } from './ficha-medica/FichaMedicaTabs';
import FichaMedicaConteudo from './ficha-medica/FichaMedicaConteudo';
import './ficha-medica/AtendimentoMedico.css';

export default function FichaMedica({ atendimento, onFechar, initialTab = 'consulta' }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState(initialTab);
  const [imprimindo, setImprimindo] = useState(null);

  if (imprimindo) {
    return (
      <Suspense fallback={<div className="print-page" style={{ padding: 20, color: '#94A3B8' }}>Carregando visualização de impressão...</div>}>
        <FichaMedicaPrint
          atendimentoId={atendimento?.atendimento_id}
          tipo={imprimindo.tipo}
          registro={imprimindo.registro}
          onVoltar={() => setImprimindo(null)}
        />
      </Suspense>
    );
  }

  const abaAtivaObj = ABAS_PRINCIPAIS.find((a) => a.chave === aba) || ABAS_SECUNDARIAS.find((a) => a.chave === aba);
  const rotuloAbaAtual = abaAtivaObj ? abaAtivaObj.rotulo : 'Atendimento Médico';

  return (
    <div className="atendimento-medico-container" onClick={(e) => e.stopPropagation()}>
      <FichaMedicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        medicoNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
      />
      <div className="workspace">
        <PatientBanner atendimento={atendimento} />
        <FichaMedicaTabs aba={aba} onSelecionarAba={setAba} />
        <FichaMedicaConteudo
          atendimento={atendimento}
          medicoId={enfermeiro?.id}
          aba={aba}
          onSelecionarAba={setAba}
          onImprimir={setImprimindo}
        />
      </div>
    </div>
  );
}
