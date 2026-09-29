import { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import HistoricoClinico from './HistoricoClinico';
const FichaMedicaPrint = lazy(() => import('./FichaMedicaPrint'));
import BannerPacienteEnf from './ficha-clinica/BannerPacienteEnf';
import './ficha-clinica/Enfermagem.css';
import FichaMedicaHeader from './ficha-medica/FichaMedicaHeader';
import FichaMedicaTabs, { ABAS_PRINCIPAIS } from './ficha-medica/FichaMedicaTabs';
import FichaMedicaConteudo from './ficha-medica/FichaMedicaConteudo';
import './ficha-medica/AtendimentoMedico.css';

export default function FichaMedica({ atendimento, onFechar, onTrocarPilar, initialTab = 'consulta' }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState(initialTab);
  const [imprimindo, setImprimindo] = useState(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const areaRef = useRef(null);
  // Mensagem de erro/validação aparece no fim do formulário, longe do botão: rola até ela.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const obs = new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        const alvo = n.matches?.('.allergy-alert, .erro, .form-erro') ? n : n.querySelector?.('.allergy-alert .ph-warning, .erro, .form-erro');
        if (alvo && /ph-warning|erro/.test(alvo.outerHTML.slice(0, 300))) { alvo.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      }
    });
    obs.observe(el, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

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

  const abaAtivaObj = ABAS_PRINCIPAIS.find((a) => a.chave === aba);
  const rotuloAbaAtual = abaAtivaObj ? abaAtivaObj.rotulo : 'Atendimento Médico';

  // Médico só consulta documentos de enfermagem e vice-versa (também bloqueado no banco).
  const perfil = enfermeiro?.role === 'admin' ? 'admin' : (enfermeiro?.tipo || 'enfermagem');
  const podeCriar = ['medico', 'admin'].includes(perfil);

  return (
    <div className={'atendimento-medico-container' + (podeCriar ? '' : ' somente-leitura')} onClick={(e) => e.stopPropagation()}>
      <FichaMedicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        medicoNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
        medicoCrm={enfermeiro?.crm}
        onTrocarPilar={onTrocarPilar}
        onAbrirHistorico={() => setHistoricoAberto(true)}
      />
      <HistoricoClinico atendimento={atendimento} aberto={historicoAberto} onFechar={() => setHistoricoAberto(false)} />
      <div className="workspace" ref={areaRef}>
        <BannerPacienteEnf atendimento={atendimento} />
        {!podeCriar && (
          <div className="aviso-somente-leitura"><i className="ph ph-lock-simple" /> Modo consulta: você pode visualizar e imprimir os documentos médicos, mas não criá-los.</div>
        )}

        <FichaMedicaTabs aba={aba} onSelecionarAba={setAba} />
        <FichaMedicaConteudo
          atendimento={atendimento}
          medicoId={enfermeiro?.id}
          medicoNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
          medicoCrm={enfermeiro?.crm}
          aba={aba}
          onSelecionarAba={setAba}
          onImprimir={setImprimindo}
          onFechar={onFechar}
        />
      </div>
    </div>
  );
}
