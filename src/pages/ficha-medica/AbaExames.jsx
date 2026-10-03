import { useEffect, useState } from 'react';
import { criarExame, buscarCabecalhoImpressao } from '../../lib/pepMedico';
import AbaApac from './AbaApac';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { useRascunho } from '../../hooks/useRascunho';
import { useSalvarDocumento, MSG_RASCUNHO_SALVO } from '../../hooks/useSalvarDocumento';
import { MODALIDADE_CONFIG, APAC_VAZIA, itensSelecionados, requisicaoParaBanco, protocoloRapido, MSG_SEM_EXAME } from './exames/catalogoExames';
import GradeExames from './exames/GradeExames';
import DadosPedido from './exames/DadosPedido';
import JustificativaExame from './exames/JustificativaExame';
import PainelFerramentas from './exames/PainelFerramentas';
import { espiarCopia } from '../../lib/duplicarPendente';

// Aba Solicitação de Exames: guarda o estado e as regras (protocolos, salvar). Catálogo e regras sem
// tela em ./exames/catalogoExames.js; partes da tela em ./exames/. APAC abre o laudo oficial (AbaApac).
// Cada modalidade (laboratório, imagem, ECG) tem o seu próprio rascunho.

export default function AbaExames({ atendimento, medicoId, medicoNome, medicoCrm, onImprimir, onFechar, abrirApacCompleto = false }) {
  // APAC abre sempre o laudo oficial completo (52 campos), sem tela-resumo.
  const [modalidade, setModalidadeAtual] = useState(abrirApacCompleto ? 'apac' : (espiarCopia('exames_solicitados')?.filtro?.modalidade || 'lab')); // 'lab' | 'img' | 'ecg' | 'apac' (Duplicar abre na modalidade copiada)
  const [labSelecionados, setLabSelecionados] = useState({});
  const [imgSelecionados, setImgSelecionados] = useState({});
  const [ecgSelecionados, setEcgSelecionados] = useState({});

  const [labJustificativa, setLabJustificativa] = useState('');
  const [imgJustificativa, setImgJustificativa] = useState('');
  const [ecgJustificativa, setEcgJustificativa] = useState('');

  const [prioridade, setPrioridade] = useState({ lab: 'urgencia', img: 'urgencia', ecg: 'urgencia' });
  const [apacDados, setApacDados] = useState(APAC_VAZIA);
  const [msgExame, setMsgExame] = useState(null);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [cabecalho, setCabecalho] = useState(null);

  // Estado de cada modalidade: [selecionados, setSelecionados, justificativa, setJustificativa].
  const porModalidade = {
    lab: [labSelecionados, setLabSelecionados, labJustificativa, setLabJustificativa],
    img: [imgSelecionados, setImgSelecionados, imgJustificativa, setImgJustificativa],
    ecg: [ecgSelecionados, setEcgSelecionados, ecgJustificativa, setEcgJustificativa],
  };
  const atual = porModalidade[modalidade];
  const prio = (p) => [prioridade, (v) => setPrioridade((prev) => ({ ...prev, [p]: v }))];

  // Rascunho da modalidade aberta: guarda só os campos dela e reabre ao voltar para ela.
  const camposRascunho = !atual ? {} : {
    selecionados: [atual[0], atual[1]],
    justificativa: [atual[2], atual[3]],
    prioridade: [prioridade[modalidade], prio(modalidade)[1]],
  };
  const rascunho = useRascunho({
    tabela: 'exames_solicitados', atendimentoId: atual ? atendimento?.atendimento_id : null, autorId: medicoId,
    filtro: { modalidade }, campos: camposRascunho, editandoId, setEditandoId, setDataRegistro,
    onCopiado: (m) => setMsgExame({ t: m }), onReaberto: () => setMsgExame({ t: 'Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Finalizar e Imprimir" finaliza.' }),
  });
  const { salvando, salvar: salvarDocumento } = useSalvarDocumento({ rascunho, dataRegistro, editandoId, setEditandoId, setDataRegistro });

  // Trocar de modalidade solta o rascunho da anterior (cada uma grava o seu próprio registro).
  function setModalidade(m) {
    if (m === modalidade) return;
    setEditandoId(null);
    setDataRegistro('');
    setModalidadeAtual(m);
  }

  useEffect(() => {
    buscarCabecalhoImpressao(atendimento.atendimento_id).then(setCabecalho).catch(() => {});
  }, [atendimento.atendimento_id]);

  const countLab = Object.values(labSelecionados).filter(Boolean).length;
  const countImg = Object.values(imgSelecionados).filter(Boolean).length;
  const countEcg = Object.values(ecgSelecionados).filter(Boolean).length;
  const countApac = apacDados.procedimento_nome.trim() ? 1 : 0;

  const localLeito = cabecalho?.setorNome && cabecalho?.leitoNumero
    ? `Beira do Leito (Sala ${cabecalho.setorNome} ${cabecalho.leitoNumero})`
    : 'Beira do Leito (Sala/Leito do paciente)';
  const medicoSolicitante = medicoNome ? `${medicoNome}${medicoCrm ? ` — CRM ${medicoCrm}` : ''}` : 'Médico Solicitante';
  const dataHoraSolicitacao = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  function aplicarProtocolo(tipo) {
    const p = protocoloRapido(tipo);
    if (!p) return;
    setModalidade(p.modalidade);
    if (p.selecionados) porModalidade[p.modalidade][1](p.selecionados);
    if (p.apac) setApacDados((prev) => ({ ...prev, ...p.apac }));
    setMsgExame({ t: p.mensagem });
  }

  function limparModalidadeAtiva() {
    if (!confirm('Limpar as seleções desta modalidade?')) return;
    if (modalidade === 'lab') setLabSelecionados({});
    else if (modalidade === 'img') setImgSelecionados({});
    else if (modalidade === 'ecg') setEcgSelecionados({});
    else if (modalidade === 'apac') setApacDados(APAC_VAZIA);
  }

  async function salvar(imprimir = true) {
    setMsgExame(null);
    const [selecionados, setSelecionados, justificativa, setJustificativa] = atual;
    const itens = itensSelecionados(modalidade, selecionados);
    if (itens.length === 0) { setMsgExame({ erro: true, t: MSG_SEM_EXAME[modalidade] }); return; }
    const req = requisicaoParaBanco(modalidade, { itens, prioridade: prioridade[modalidade], justificativa });
    const tipoImpresso = 'exame_' + modalidade;
    await salvarDocumento(imprimir, ({ id, situacao }) => criarExame({
      id, situacao,
      atendimentoId: atendimento.atendimento_id,
      solicitadoPor: medicoId,
      ...req,
    }), {
      aoFalhar: (erro) => { console.error(erro); setMsgExame({ erro: true, t: 'Não foi possível registrar a requisição. Tente novamente.' }); },
      aoSalvarRascunho: () => setMsgExame({ t: MSG_RASCUNHO_SALVO }),
      aoFinalizar: (reg) => {
        if (reg) onImprimir?.(reg, tipoImpresso);
        // Requisição finalizada: a guia fica limpa para um novo pedido (evita finalizar o mesmo pedido duas vezes).
        setSelecionados({}); setJustificativa('');
        setMsgExame({ t: 'Requisição finalizada.' });
      },
    });
  }

  const cfg = MODALIDADE_CONFIG[modalidade];

  const navModalidades = (
    <div className="modality-nav modality-nav-topo" role="tablist" aria-label="Tipo de pedido">
      {[['lab', 'ph-flask', 'Laboratório', countLab], ['img', 'ph-scan', 'Imagem', countImg], ['ecg', 'ph-heartbeat', 'ECG', countEcg], ['apac', 'ph-file-text', 'APAC', 0]].map(([k, ic, rot, n]) => (
        <button key={k} type="button" role="tab" aria-selected={modalidade === k} className={'modality-btn ' + (modalidade === k ? 'active' : '')} onClick={() => setModalidade(k)}>
          <span><i className={'ph ' + ic} /> {rot}</span>
          {n > 0 && <span className="modality-badge">{n}</span>}
        </button>
      ))}
    </div>
  );

  if (modalidade === 'apac') {
    return (
      <AbaApac
        atendimento={atendimento}
        medicoId={medicoId}
        medicoNome={medicoNome}
        medicoCrm={medicoCrm}
        onImprimir={(registro) => onImprimir?.(registro, 'apac')}
        onFechar={onFechar}
        topo={navModalidades}
        preset={apacDados.procedimento_nome ? apacDados : null}
      />
    );
  }

  return (
    <div className="clinical-split">
      {historicoAberto && (
        <PainelFerramentas modalidade={modalidade} countLab={countLab} countImg={countImg} countEcg={countEcg} countApac={countApac}
          setModalidade={setModalidade} onFechar={() => setHistoricoAberto(false)} limparModalidadeAtiva={limparModalidadeAtiva} aplicarProtocolo={aplicarProtocolo} />
      )}

      <section className="clinical-card">
        <header className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 16 }}><div>
            <h2 id="card-main-title"><i className={cfg.icon} /> {cfg.titulo}</h2>
            
          </div><div style={{display:'flex', gap: 12, alignItems: 'center'}}><span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>Em Aberto - Urgência</span><button type="button" className="btn btn-outline" onClick={() => setHistoricoAberto(true)} style={{ height: 32, fontSize: 'var(--fs-xs)', display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}><i className="ph ph-clock-counter-clockwise"></i> Ver Histórico</button></div></header>

        <div className="cc-body">
          {navModalidades}

          {/* 1. DADOS DO PEDIDO — por modalidade, com identificação real do atendimento/médico */}
          <DadosPedido modalidade={modalidade} cfg={cfg} prioridade={prioridade} setPrioridade={setPrioridade} localLeito={localLeito}
            dataHoraSolicitacao={dataHoraSolicitacao} medicoSolicitante={medicoSolicitante} />

          {/* 2. GRADE DE EXAMES/PROCEDIMENTOS */}
          <GradeExames modalidade={modalidade} selecionados={atual[0]} onAlternar={(nome) => atual[1]((prev) => ({ ...prev, [nome]: !prev[nome] }))} />

          {/* 3. JUSTIFICATIVA CLÍNICA (por último, como no mockup) */}
          <JustificativaExame modalidade={modalidade} cfg={cfg} justificativa={atual[2]} setJustificativa={atual[3]} />

        </div>

        <div className="cc-footer">
          <button type="button" className="btn-cancel" onClick={onFechar}>
            <i className="ph ph-x-circle" /> Cancelar
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            {msgExame && <div className={msgExame.erro ? 'erro-inline' : 'aviso-rascunho'} role="status"><i className={`ph ${msgExame.erro ? 'ph-warning-circle' : 'ph-check-circle'}`} /> {msgExame.t}</div>}
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
              <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Finalizar e Imprimir'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
