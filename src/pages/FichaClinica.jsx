import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
import HistoricoClinico from './HistoricoClinico';
import { definirRascunhoAlvo } from '../lib/documentos';
import JanelaFormulario from '../layout/JanelaFormulario';
const FichaClinicaPrint = lazy(() => import('./FichaClinicaPrint'));
import BannerPacienteEnf from './ficha-clinica/BannerPacienteEnf';
import FichaClinicaHeader from './ficha-clinica/FichaClinicaHeader';
import FichaClinicaTabs, { ABAS_PRINCIPAIS } from './ficha-clinica/FichaClinicaTabs';
import FichaClinicaConteudo from './ficha-clinica/FichaClinicaConteudo';
import './ficha-medica/AtendimentoMedico.css';
import './PassagemForm.css';
import './FichaClinica.css';
import './ficha-clinica/Enfermagem.css';

export default function FichaClinica({ atendimento, onFechar, onTrocarPilar, abaInicial, posAlta }) {
  const { enfermeiro } = useAuth();
  const [aba, setAba] = useState(abaInicial || 'admissaoEnfermagem');
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
  const [formAberto, setFormAberto] = useState(!!abaInicial);
  const escolherAba = (a) => { setAba(a); setFormAberto(true); };

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
      {!novaUI && <FichaClinicaHeader
        onFechar={onFechar}
        rotuloAbaAtual={rotuloAbaAtual}
        enfermeiroNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
        enfermeiroCoren={enfermeiro?.coren}
        onTrocarPilar={onTrocarPilar}
      />}
      <HistoricoClinico atendimento={atendimento} aberto={historicoAberto} onFechar={() => setHistoricoAberto(false)} categoriaDuplicar="enfermagem" onDuplicado={posAlta ? undefined : aposDuplicar} onEditarRascunho={onEditarRascunhoPerm} />
      <div className="workspace">
        <BannerPacienteEnf atendimento={atendimento} pilar="enfermagem" onVoltar={onFechar} onTrocarPilar={onTrocarPilar} />
        {!podeCriar && (
          <div className="aviso-somente-leitura"><i className="ph ph-lock-simple" /> Modo consulta: você pode visualizar e imprimir os documentos de enfermagem, mas não criá-los.</div>
        )}

        {posAlta && (
          <div className="aviso-somente-leitura aviso-pos-alta"><i className="ph ph-sign-out" /> {posAlta.tipo || 'Saída'} em {new Date(posAlta.encerradoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — modo consulta: visualize e imprima os documentos pela lupa abaixo.{rascunhoLiberado ? ` Seus rascunhos podem ser finalizados até ${limiteRascunho.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (lápis).` : ''}</div>
        )}
        {!posAlta && <div className="fc-tabs-linha">
          <div className="fc-tabs-area"><FichaClinicaTabs aba={aba} onSelecionarAba={escolherAba} /></div>
          {!novaUI && (<button type="button" className="btn-historico-clinico" onClick={() => setHistoricoAberto(true)} title="Consultar o histórico clínico do paciente">
            <i className="ph ph-clock-counter-clockwise" /> Histórico Clínico
          </button>)}
        </div>}
        <JanelaFormulario ativa={novaUI || !!posAlta} aberta={formAberto} onFechar={() => setFormAberto(false)} titulo={rotuloAbaAtual} paciente={atendimento?.nome} atendimento={atendimento} categoria="enfermagem"
          vazio={<HistoricoClinico atendimento={atendimento} embutido categoriaDuplicar="enfermagem" onDuplicado={posAlta ? undefined : aposDuplicar} onEditarRascunho={onEditarRascunhoPerm} />}>
        <FichaClinicaConteudo
          key={dupSeq}
          atendimento={atendimento}
          autorId={enfermeiro?.id}
          aba={aba}
          onImprimir={imprimir}
          onFechar={novaUI ? () => setFormAberto(false) : onFechar}
        />
        </JanelaFormulario>
      </div>
    </div>
  );
}
