import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
const FichaClinicaPrint = lazy(() => import('./FichaClinicaPrint'));
import BannerPacienteEnf from './ficha-clinica/BannerPacienteEnf';
import FichaClinicaHeader from './ficha-clinica/FichaClinicaHeader';
import FichaClinicaTabs, { ABAS_PRINCIPAIS } from './ficha-clinica/FichaClinicaTabs';
import FichaClinicaConteudo from './ficha-clinica/FichaClinicaConteudo';
import './ficha-medica/AtendimentoMedico.css';
import './PassagemForm.css';
import './FichaClinica.css';
import './ficha-clinica/Enfermagem.css';

export default function FichaClinica({ atendimento, onFechar, onTrocarPilar }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState('admissaoEnfermagem');
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

  const abaAtivaObj = ABAS_PRINCIPAIS.find((a) => a.chave === aba);
  const rotuloAbaAtual = abaAtivaObj ? (abaAtivaObj.titulo || abaAtivaObj.rotulo) : 'Atendimento de Enfermagem';

  return (
    <div className="atendimento-medico-container enf-theme" onClick={(e) => e.stopPropagation()}>
      <FichaClinicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        enfermeiroNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
        enfermeiroCoren={enfermeiro?.coren}
        onTrocarPilar={onTrocarPilar}
      />
      <div className="workspace">
        <BannerPacienteEnf atendimento={atendimento} />
        <FichaClinicaTabs aba={aba} onSelecionarAba={setAba} />
        <FichaClinicaConteudo
          atendimento={atendimento}
          autorId={enfermeiro?.id}
          aba={aba}
          onImprimir={setImprimindo}
          onFechar={onFechar}
        />
      </div>
    </div>
  );
}
