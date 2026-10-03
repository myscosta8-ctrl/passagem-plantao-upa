import { useState, lazy, Suspense } from 'react';
import { useAuth } from '../../lib/AuthContext';
import HistoricoClinico from '../HistoricoClinico';
import { definirRascunhoAlvo } from '../../lib/documentos';
import { supabase } from '../../lib/supabaseClient';
import JanelaFormulario from '../../layout/JanelaFormulario';
import AbasRolaveis from '../../components/AbasRolaveis';
import BannerPacienteEnf from '../ficha-clinica/BannerPacienteEnf';
import AbaRegistroMulti from './AbaRegistroMulti';
import ErroAba from '../../components/ErroAba';
import { DOCUMENTOS_MULTI } from './esquemas';
import '../ficha-medica/AtendimentoMedico.css';
import '../ficha-clinica/Enfermagem.css';
import './Multi.css';
const FichaClinicaPrint = lazy(() => import('../FichaClinicaPrint'));

// Prontuário da equipe multiprofissional: Nutrição e Serviço Social.
// Cada profissional registra só os documentos da própria área; os demais consultam.
export default function FichaMulti({ atendimento, onFechar, onTrocarPilar, posAlta }) {
  const { enfermeiro } = useAuth();
  const funcao = enfermeiro?.funcao;
  const abaPadrao = funcao === 'assistente_social' ? 'socialAdmissao' : 'nutricaoAdmissao';
  const [aba, setAba] = useState(abaPadrao);
  const [formAberto, setFormAberto] = useState(false);
  const [imprimindo, setImprimindo] = useState(null);
  const [seq, setSeq] = useState(0);
  const doc = DOCUMENTOS_MULTI[aba];
  const podeCriar = !posAlta && funcao === doc.funcao;

  const limiteRascunho = posAlta?.encerradoEm ? new Date(new Date(posAlta.encerradoEm).getTime() + 24 * 3600 * 1000) : null;
  const rascunhoLiberado = !posAlta || (limiteRascunho && new Date() < limiteRascunho);
  // Histórico → lápis: abre a aba certa (admissão ou evolução) com o rascunho carregado.
  const editarRascunho = async (tabela, id) => {
    const { data } = await supabase.from(tabela).select('tipo').eq('id', id).maybeSingle();
    const chave = Object.keys(DOCUMENTOS_MULTI).find((k) => DOCUMENTOS_MULTI[k].tabela === tabela && DOCUMENTOS_MULTI[k].tipo === data?.tipo);
    if (!chave) return;
    definirRascunhoAlvo(tabela, id); setAba(chave); setFormAberto(true); setSeq((n) => n + 1);
  };
  // Histórico → Duplicar: abre a aba do mesmo documento (admissão ou evolução) já com a cópia.
  const chaveDoItem = (item) => Object.keys(DOCUMENTOS_MULTI).find((k) => DOCUMENTOS_MULTI[k].tabela === item.fonte.tabela && DOCUMENTOS_MULTI[k].tipo === item.registro.tipo);
  const aposDuplicar = (_aba, item) => { const chave = chaveDoItem(item); if (!chave) return; setAba(chave); setFormAberto(true); setSeq((n) => n + 1); };
  // Cada profissional duplica só os documentos da própria área.
  const permiteDuplicar = (item) => DOCUMENTOS_MULTI[chaveDoItem(item)]?.funcao === funcao;
  const escolherAba = (a) => { setAba(a); setFormAberto(true); };

  if (imprimindo) {
    return (
      <Suspense fallback={<div className="print-page" style={{ padding: 20, color: 'var(--c-text-muted)' }}>Carregando visualização de impressão...</div>}>
        <FichaClinicaPrint atendimentoId={atendimento.atendimento_id} tipo={imprimindo.tipo} registro={imprimindo.registro} onVoltar={() => setImprimindo(null)} />
      </Suspense>
    );
  }

  return (
    <div className={'atendimento-medico-container enf-theme mp-theme' + (podeCriar ? '' : ' somente-leitura')} onClick={(e) => e.stopPropagation()}>
      <div className="workspace">
        <BannerPacienteEnf atendimento={atendimento} pilar="multi" onVoltar={onFechar} onTrocarPilar={onTrocarPilar} />
        {posAlta && (
          <div className="aviso-somente-leitura aviso-pos-alta"><i className="ph ph-sign-out" /> {posAlta.tipo || 'Saída'} em {new Date(posAlta.encerradoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — modo consulta: visualize e imprima os documentos pela lupa abaixo.</div>
        )}
        {!posAlta && (
          <div className="fc-tabs-linha">
            <div className="fc-tabs-area">
              <AbasRolaveis ativa={aba}>
                {Object.entries(DOCUMENTOS_MULTI).map(([chave, d]) => (
                  <button key={chave} type="button" className={`tab-btn ${chave === aba ? 'active' : ''}`} onClick={() => escolherAba(chave)}>
                    <i className={`ph ${d.icon}`} />
                    <span>{d.rotulo}</span>
                  </button>
                ))}
              </AbasRolaveis>
            </div>
          </div>
        )}
        <JanelaFormulario ativa aberta={formAberto} onFechar={() => setFormAberto(false)} titulo={doc.titulo} paciente={atendimento?.nome} atendimento={atendimento} categoria="enfermagem"
          vazio={<HistoricoClinico atendimento={atendimento} embutido categoriaDuplicar="multi" onDuplicado={posAlta ? undefined : aposDuplicar} permiteDuplicar={permiteDuplicar} onEditarRascunho={rascunhoLiberado ? editarRascunho : undefined} />}>
          <ErroAba chave={aba}>
            <AbaRegistroMulti key={`${aba}-${seq}`} atendimento={atendimento} autorId={enfermeiro?.id} doc={doc} podeCriar={podeCriar}
              onImprimir={(x) => { setImprimindo(x); setFormAberto(false); }} onFechar={() => setFormAberto(false)} />
          </ErroAba>
        </JanelaFormulario>
      </div>
    </div>
  );
}
