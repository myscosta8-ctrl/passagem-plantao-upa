import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
import HistoricoClinico from './HistoricoClinico';
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
  const [historicoAberto, setHistoricoAberto] = useState(false);

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

  // Médico só consulta documentos de enfermagem e vice-versa (também bloqueado no banco).
  const perfil = enfermeiro?.role === 'admin' ? 'admin' : (enfermeiro?.tipo || 'enfermagem');
  const podeCriar = ['enfermagem', 'admin'].includes(perfil);

  return (
    <div className={'atendimento-medico-container enf-theme' + (podeCriar ? '' : ' somente-leitura')} onClick={(e) => e.stopPropagation()}>
      <FichaClinicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        enfermeiroNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
        enfermeiroCoren={enfermeiro?.coren}
        onTrocarPilar={onTrocarPilar}
        onAbrirHistorico={() => setHistoricoAberto(true)}
      />
      <HistoricoClinico atendimento={atendimento} aberto={historicoAberto} onFechar={() => setHistoricoAberto(false)} />
      <div className="workspace">
        <BannerPacienteEnf atendimento={atendimento} />
        {!podeCriar && (
          <div className="aviso-somente-leitura"><i className="ph ph-lock-simple" /> Modo consulta: você pode visualizar e imprimir os documentos de enfermagem, mas não criá-los.</div>
        )}

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
