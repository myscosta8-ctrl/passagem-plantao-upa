import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
const FichaClinicaPrint = lazy(() => import('./FichaClinicaPrint'));
import PatientBanner from './ficha-medica/PatientBanner';
import ResumoPaciente from './ficha-clinica/ResumoPaciente';
import FichaClinicaHeader from './ficha-clinica/FichaClinicaHeader';
import FichaClinicaTabs, { ABAS_PRINCIPAIS, ABAS_SECUNDARIAS } from './ficha-clinica/FichaClinicaTabs';
import FichaClinicaConteudo from './ficha-clinica/FichaClinicaConteudo';
import './ficha-medica/AtendimentoMedico.css';
import './PassagemForm.css';
import './FichaClinica.css';

export default function FichaClinica({ atendimento, onFechar }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState('admissao');
  const [imprimindo, setImprimindo] = useState(null);

  if (imprimindo) {
    return (
      <Suspense fallback={<div className="print-page" style={{ padding: 20, color: '#94A3B8' }}>Carregando visualização de impressão...</div>}>
        <FichaClinicaPrint
          atendimentoId={atendimento.atendimento_id}
          tipo={imprimindo.tipo}
          registro={imprimindo.registro}
          onVoltar={() => setImprimindo(null)}
        />
      </Suspense>
    );
  }

  const abaAtivaObj = ABAS_PRINCIPAIS.find((a) => a.chave === aba) || ABAS_SECUNDARIAS.find((a) => a.chave === aba);
  const rotuloAbaAtual = abaAtivaObj ? abaAtivaObj.rotulo : 'Atendimento de Enfermagem';

  return (
    <div className="atendimento-medico-container" onClick={(e) => e.stopPropagation()}>
      <FichaClinicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        enfermeiroNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
      />
      <div className="workspace">
        <PatientBanner atendimento={atendimento} />
        <ResumoPaciente atendimento={atendimento} />
        <FichaClinicaTabs aba={aba} onSelecionarAba={setAba} />
        <FichaClinicaConteudo
          atendimento={atendimento}
          autorId={enfermeiro?.id}
          aba={aba}
          onImprimir={setImprimindo}
        />
      </div>
    </div>
  );
}
