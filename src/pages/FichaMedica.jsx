import { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import HistoricoClinico from './HistoricoClinico';
import { definirRascunhoAlvo } from '../lib/documentos';
import JanelaFormulario from '../layout/JanelaFormulario';
const FichaMedicaPrint = lazy(() => import('./FichaMedicaPrint'));
import BannerPacienteEnf from './ficha-clinica/BannerPacienteEnf';
import './ficha-clinica/Enfermagem.css';
import FichaMedicaHeader from './ficha-medica/FichaMedicaHeader';
import FichaMedicaTabs, { ABAS_PRINCIPAIS } from './ficha-medica/FichaMedicaTabs';
import FichaMedicaConteudo from './ficha-medica/FichaMedicaConteudo';
import './ficha-medica/AtendimentoMedico.css';

export default function FichaMedica({ atendimento, onFechar, onTrocarPilar, initialTab = 'consulta', abrirFormulario = false, posAlta }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState(initialTab);
  const [imprimindo, setImprimindo] = useState(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  // Nova interface: o formulário da aba abre em janela flutuante (contas com pep_beta).
  const novaUI = enfermeiro?.pep_beta === true;
  const [dupSeq, setDupSeq] = useState(0);
  const aposDuplicar = () => { setHistoricoAberto(false); setAba('evolucao'); setFormAberto(true); setDupSeq((n) => n + 1); };
  // Histórico Clínico → "Editar rascunho": abre a aba do documento já com aquele rascunho carregado.
  const editarRascunho = (tabela, id, abaDestino) => { definirRascunhoAlvo(tabela, id); setHistoricoAberto(false); setAba(abaDestino); setFormAberto(true); setDupSeq((n) => n + 1); };
  // Paciente que já saiu (aberto pela tela Desfechos): só consulta e impressão pelo histórico;
  // o profissional ainda pode finalizar o próprio rascunho até 24 h depois da saída.
  const limiteRascunho = posAlta?.encerradoEm ? new Date(new Date(posAlta.encerradoEm).getTime() + 24 * 3600 * 1000) : null;
  const rascunhoLiberado = !posAlta || (limiteRascunho && new Date() < limiteRascunho);
  const onEditarRascunhoPerm = rascunhoLiberado ? editarRascunho : undefined;
  const imprimir = (x) => { setImprimindo(x); if (posAlta) setFormAberto(false); };
  const [formAberto, setFormAberto] = useState(abrirFormulario);
  const escolherAba = (a) => { setAba(a); setFormAberto(true); };
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
  const rotuloAbaAtual = abaAtivaObj ? (abaAtivaObj.titulo || abaAtivaObj.rotulo) : 'Atendimento Médico';

  // Médico só consulta documentos de enfermagem e vice-versa (também bloqueado no banco).
  const perfil = enfermeiro?.role === 'admin' ? 'admin' : (enfermeiro?.tipo || 'enfermagem');
  const podeCriar = ['medico', 'admin'].includes(perfil);

  return (
    <div className={'atendimento-medico-container' + (podeCriar ? '' : ' somente-leitura')} onClick={(e) => e.stopPropagation()}>
      {!novaUI && <FichaMedicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        medicoNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
        medicoCrm={enfermeiro?.crm}
        onTrocarPilar={onTrocarPilar}
      />}
      <HistoricoClinico atendimento={atendimento} aberto={historicoAberto} onFechar={() => setHistoricoAberto(false)} categoriaDuplicar="medico" onDuplicado={posAlta ? undefined : aposDuplicar} onEditarRascunho={onEditarRascunhoPerm} />
      <div className="workspace" ref={areaRef}>
        <BannerPacienteEnf atendimento={atendimento} pilar="medico" onVoltar={onFechar} onTrocarPilar={onTrocarPilar} />
        {!podeCriar && (
          <div className="aviso-somente-leitura"><i className="ph ph-lock-simple" /> Modo consulta: você pode visualizar e imprimir os documentos médicos, mas não criá-los.</div>
        )}

        {posAlta && (
          <div className="aviso-somente-leitura aviso-pos-alta"><i className="ph ph-sign-out" /> {posAlta.tipo || 'Saída'} em {new Date(posAlta.encerradoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — modo consulta: visualize e imprima os documentos pela lupa abaixo.{rascunhoLiberado ? ` Seus rascunhos podem ser finalizados até ${limiteRascunho.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (lápis).` : ''}</div>
        )}
        {!posAlta && <div className="fc-tabs-linha">
          <div className="fc-tabs-area"><FichaMedicaTabs aba={aba} onSelecionarAba={escolherAba} /></div>
          {!novaUI && (<button type="button" className="btn-historico-clinico" onClick={() => setHistoricoAberto(true)} title="Consultar o histórico clínico do paciente">
            <i className="ph ph-clock-counter-clockwise" /> Histórico Clínico
          </button>)}
        </div>}
        <JanelaFormulario ativa={novaUI || !!posAlta} aberta={formAberto} onFechar={() => setFormAberto(false)} titulo={rotuloAbaAtual} paciente={atendimento?.nome} atendimento={atendimento} categoria="medico"
          vazio={<HistoricoClinico atendimento={atendimento} embutido categoriaDuplicar="medico" onDuplicado={posAlta ? undefined : aposDuplicar} onEditarRascunho={onEditarRascunhoPerm} />}>
        <FichaMedicaConteudo
          key={dupSeq}
          atendimento={atendimento}
          medicoId={enfermeiro?.id}
          medicoNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
          medicoCrm={enfermeiro?.crm}
          aba={aba}
          onSelecionarAba={setAba}
          onImprimir={imprimir}
          onFechar={novaUI ? () => setFormAberto(false) : onFechar}
        />
        </JanelaFormulario>
      </div>
    </div>
  );
}
