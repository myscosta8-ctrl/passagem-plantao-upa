import { numeroLimpo } from '../../lib/numeros'
import { useEffect, useState } from 'react';
import { criarAih, listarConsultas, buscarCabecalhoImpressao, mensagemErroSalvar, listarMedicosAtivos, normalizarCid, cidsExistentes } from '../../lib/pepMedico';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { AIH_VAZIA } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { metaDoc } from '../../lib/documentos';
import { useRascunho } from '../../hooks/useRascunho';

const PROCEDIMENTOS_RAPIDOS = [
  { cod: '0303010190', codFormatado: '03.03.01.019-0', desc: 'TRATAMENTO DE PNEUMONIA OU INFLUENZA (GRIPE)', rotulo: 'Pneumonia / Influenza' },
  { cod: '0303010034', codFormatado: '03.03.01.003-4', desc: 'TRATAMENTO DE OUTRAS DOENCAS DO APARELHO RESPIRATORIO (ASMA/BRONQUITE)', rotulo: 'Doenças Respiratórias (Asma)' },
  { cod: '0303010069', codFormatado: '03.03.01.006-9', desc: 'TRATAMENTO DE TRANSTORNOS DIGESTIVOS / DIARREIA AGUDA', rotulo: 'Transtornos Digestivos' },
];

// Caixa de campo no padrão do formulário oficial (número + rótulo + valor).
function Campo({ n, rotulo, col = 4, valor, onChange, readOnly, placeholder, destaque, children }) {
  return (
    <div className={`col-${col}`}>
      <div className={'aih-field-box' + (readOnly ? ' readonly' : '') + (destaque ? ' highlight' : '')}>
        <div className="aih-field-header"><label>{n} - {rotulo}</label></div>
        {children || (readOnly
          ? <div className="aih-field-value">{valor || '—'}</div>
          : <input type="text" className="aih-input" value={valor || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />)}
      </div>
    </div>
  );
}

const VINCULOS = [
  { valor: 'empregado', rotulo: 'Empregado' }, { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' }, { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' }, { valor: 'nao_segurado', rotulo: 'Não segurado' },
];
const RACAS = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDÍGENA', 'SEM INFORMAÇÃO'];

export default function AbaAih({ atendimento, medicoId, medicoNome, medicoCrm, onImprimir, onFechar }) {
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Quem não é médico (enfermagem/recepção/administrativo) pré-preenche e ENCAMINHA a AIH a um
  // médico; só o médico finaliza (o banco também bloqueia). O médico destinatário encontra a
  // AIH nas Pendências e ao abrir esta aba, revisa e assina com "Salvar e Imprimir".
  const { enfermeiro } = useAuth();
  const ehMedico = enfermeiro?.tipo === 'medico';
  const [medicos, setMedicos] = useState([]);
  const [medicoDestino, setMedicoDestino] = useState('');
  const [encaminhada, setEncaminhada] = useState(null); // AIH recebida (médico) — { preenchidoPor, em }
  useEffect(() => { listarMedicosAtivos().then(setMedicos); }, []);
  // Campos 31/32 (CNS/CPF do médico): o cadastro do profissional não guarda esse número,
  // então reaproveita o que o mesmo médico informou na última AIH dele.
  const medicoDoc = ehMedico ? medicoId : medicoDestino;
  useEffect(() => {
    if (!medicoDoc) return;
    let vivo = true;
    supabase.from('aih_solicitacoes').select('campos_formulario').eq('solicitante_id', medicoDoc)
      .not('campos_formulario->>profissional_documento_numero', 'is', null)
      .order('criado_em', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => {
        const cf = data?.campos_formulario;
        if (!vivo || !cf?.profissional_documento_numero) return;
        setDados((prev) => (prev.profissional_documento_numero ? prev : { ...prev, profissional_documento_tipo: cf.profissional_documento_tipo || 'CNS', profissional_documento_numero: cf.profissional_documento_numero }));
      });
    return () => { vivo = false };
  }, [medicoDoc]);
  const nomeMedico = (id) => { const m = medicos.find((x) => x.id === id); return m ? (m.nome_exibicao || m.nome) : ''; };
  const [nomePreenchedor, setNomePreenchedor] = useState('');
  useEffect(() => {
    if (!encaminhada?.preenchidoPor) return;
    supabase.from('enfermeiros').select('nome, nome_exibicao').eq('id', encaminhada.preenchidoPor).maybeSingle()
      .then(({ data }) => setNomePreenchedor(data ? (data.nome_exibicao || data.nome) : ''));
  }, [encaminhada?.preenchidoPor]);

  const paciente = atendimento?.paciente || {};
  const isPediatrico = (paciente?.idade && paciente?.idade < 14) || (atendimento?.idade && atendimento?.idade < 14);

  // Prontuário, CNS, mãe, endereço etc. vivem em `pessoas`, não no objeto `paciente`
  // (tabela legada) — buscar pela mesma função usada nas impressões, nunca inventar.
  const [cabecalho, setCabecalho] = useState(null);
  useEffect(() => {
    if (!atendimento?.atendimento_id) return;
    let vivo = true;
    buscarCabecalhoImpressao(atendimento.atendimento_id).then((c) => { if (vivo) setCabecalho(c); });
    return () => { vivo = false };
  }, [atendimento?.atendimento_id]);
  const pessoa = cabecalho?.pessoa || {};
  // Campos 10 e 16-19: vêm do cadastro; editáveis aqui só para este laudo.
  useEffect(() => {
    if (!cabecalho?.pessoa) return;
    const pe = cabecalho.pessoa;
    setDados((prev) => ({
      ...prev,
      raca_cor: prev.raca_cor || (pe.raca_cor || '').toUpperCase(),
      municipio_residencia_nome: prev.municipio_residencia_nome || (pe.cidade || 'BREVES').toUpperCase(),
      municipio_residencia_uf: pe.uf || prev.municipio_residencia_uf,
      municipio_residencia_cep: pe.cep || prev.municipio_residencia_cep,
      municipio_residencia_ibge: pe.municipio_ibge || prev.municipio_residencia_ibge,
    }));
  }, [cabecalho]);

  // Só a clínica (pediatria vs. clínica médica) é inferida de dado real (idade do
  // paciente) — todo o resto começa vazio (AIH_VAZIA) e é preenchido pelo médico.
  // Não pré-preencher diagnóstico, procedimento, CID ou nº de autorização: são campos
  // de um documento legal (Laudo de AIH/SUS), nunca podem carregar dado de exemplo.
  const [dados, setDados] = useState({
    ...AIH_VAZIA,
    clinica: isPediatrico ? 'PEDIATRIA / OBSERVAÇÃO' : 'CLÍNICA MÉDICA / OBSERVAÇÃO',
    carater_internacao: 'URGENCIA',
  });
  const rascunho = useRascunho({ tabela: 'aih_solicitacoes', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro, onReaberto: (r) => {
    if (r?.medico_destino_id) setMedicoDestino(r.medico_destino_id);
    if (r && r.autor_auth !== medicoId && r.medico_destino_id === medicoId) {
      setEncaminhada({ preenchidoPor: r.preenchido_por || r.autor_auth, em: r.encaminhado_em });
      setSucesso('');
      return;
    }
    setSucesso(r?.encaminhado_em && !ehMedico
      ? 'Esta AIH já foi encaminhada ao médico. Enquanto ele não abrir, você ainda pode corrigir e encaminhar de novo.'
      : 'Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.');
  } });

  useEffect(() => {
    carregar();
  }, [atendimento?.atendimento_id]);

  async function carregar() {
    setCarregando(true);

    // Se não há dados preenchidos, sincroniza automaticamente da admissão
    try {
      const consultas = await listarConsultas(atendimento?.atendimento_id);
      if (consultas && consultas.length > 0) {
        const ult = consultas[0];
        setDados((prev) => ({
          ...prev,
          sinais_sintomas_clinicos: ult.queixa_principal ? `PACIENTE ADMITIDO NA UPA 24H BREVES COM HISTÓRIA DE: ${ult.queixa_principal.toUpperCase()}` : prev.sinais_sintomas_clinicos,
          diagnostico_inicial_texto: ult.hipotese_diagnostica || prev.diagnostico_inicial_texto,
          cid_principal: ult.hipotese_diagnostica?.split(' ')[0] || prev.cid_principal,
        }));
      }
    } catch {
      // continua com dados padrão
    }
    setCarregando(false);
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function selecionarProcRapido(cod, desc) {
    setDados((prev) => ({
      ...prev,
      procedimento_principal_codigo: cod,
      procedimento_principal_nome: desc,
    }));
  }

  function toggleJustChip(texto) {
    setDados((prev) => {
      const atual = prev.condicoes_justificam_internacao || '';
      if (atual.includes(texto)) {
        return { ...prev, condicoes_justificam_internacao: atual.replace(texto, '').trim() };
      }
      return { ...prev, condicoes_justificam_internacao: atual ? `${atual}; ${texto}` : texto };
    });
  }



  async function reSyncAll() {
    try {
      const consultas = await listarConsultas(atendimento?.atendimento_id);
      if (consultas && consultas.length > 0) {
        const ult = consultas[0];
        setDados((prev) => ({
          ...prev,
          sinais_sintomas_clinicos: `PACIENTE ADMITIDO NA UPA 24H BREVES COM HISTÓRIA DE: ${(ult.queixa_principal || '').toUpperCase()}. SINAIS VITAIS: PA ${ult.sv?.pa || '—'}, FC ${ult.sv?.fc || '—'}, TEMP ${ult.sv?.temp || '—'}°C, SPO2 ${ult.sv?.spo2 || '—'}%.`,
          diagnostico_inicial_texto: ult.hipotese_diagnostica || prev.diagnostico_inicial_texto,
          cid_principal: ult.hipotese_diagnostica?.split(' ')[0] || prev.cid_principal,
        }));
        setSucesso('Dados sincronizados da admissão com sucesso!');
        setTimeout(() => setSucesso(''), 3000);
      } else {
        setSucesso('Sincronização concluída com os dados de triagem.');
        setTimeout(() => setSucesso(''), 3000);
      }
    } catch {
      setSucesso('Dados atualizados.');
      setTimeout(() => setSucesso(''), 3000);
    }
  }

  async function salvar(imprimirApos = false) {
    // Não médico: o 3º botão é "Encaminhar ao médico" — continua rascunho, mas vai para o médico.
    const encaminhar = !ehMedico && imprimirApos;
    const finalizar = ehMedico && imprimirApos;
    if (!ehMedico && !medicoDestino) {
      setErro('Escolha o médico que vai revisar e assinar esta AIH.');
      return;
    }
    // Rascunho ("Salvar") grava como estiver; só a finalização/encaminhamento exige o mínimo.
    // O código SIGTAP (campo 28) não é obrigatório.
    if ((finalizar || encaminhar) && (!String(dados.procedimento_principal_nome || '').trim() || !String(dados.sinais_sintomas_clinicos || '').trim())) {
      setErro('Para finalizar, preencha ao menos a descrição do procedimento solicitado (27) e os sinais/sintomas clínicos (20).');
      return;
    }
    // CID: ajusta o formato e confere no catálogo CID-10. CID fora do catálogo impedia salvar.
    const cid1 = normalizarCid(dados.cid_principal), cid2 = normalizarCid(dados.cid_secundario);
    const existentes = await cidsExistentes([cid1, cid2]);
    const invalidos = [[dados.cid_principal, cid1], [dados.cid_secundario, cid2]].filter(([orig, c]) => String(orig || '').trim() && !existentes.has(c)).map(([orig]) => orig);
    if (invalidos.length && finalizar) {
      setErro(`CID não encontrado na tabela CID-10: ${invalidos.join(', ')}. Confira o código (ex.: J18.9) antes de finalizar.`);
      return;
    }
    setErro('');
    setSalvando(true);
    const dadosGravar = { ...dados, cid_principal: existentes.has(cid1) ? cid1 : '', cid_secundario: existentes.has(cid2) ? cid2 : '' };
    // No rascunho, CID ainda não conferido fica guardado como texto (não se perde) até ser corrigido.
    const cidTexto = invalidos.length ? { cid_principal_texto: existentes.has(cid1) ? '' : (dados.cid_principal || ''), cid_secundario_texto: existentes.has(cid2) ? '' : (dados.cid_secundario || '') } : null;
    const { data: novaAih, error } = await criarAih({
      cidTexto,
      id: editandoId, situacao: metaDoc(finalizar, dataRegistro, rascunho.estado),
      atendimentoId: atendimento?.atendimento_id,
      pessoaId: atendimento?.pessoa_id,
      solicitanteId: ehMedico ? medicoId : medicoDestino,
      medicoDestinoId: ehMedico ? undefined : medicoDestino,
      encaminhar,
      dados: dadosGravar,
    });
    setSalvando(false);
    if (error) {
      console.error(error);
      setErro(mensagemErroSalvar(error, 'o Laudo de AIH'));
      return;
    }
    if (encaminhar) {
      setEditandoId(novaAih?.id ?? null);
      setSucesso(`AIH encaminhada a ${nomeMedico(medicoDestino) || 'o médico'}. Ela aparece nas Pendências dele; ele revisa e assina com o próprio login.`);
      return;
    }
    if (finalizar) setEncaminhada(null);
    setEditandoId(finalizar ? null : (novaAih?.id ?? null));
    if (!finalizar) { setSucesso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.' + (invalidos.length ? ` Atenção: CID ${invalidos.join(', ')} não está na tabela CID-10 — corrija antes de finalizar.` : '')); carregar(); return; }
    setSucesso('Laudo de AIH registrado. O diagnóstico da AIH passou a valer no Painel de Leitos, na Passagem de Plantão e no prontuário, e o paciente ficou como INTERNADO.');
    setTimeout(() => setSucesso(''), 8000);
    carregar();

    if (finalizar && novaAih) {
      onImprimir(novaAih);
    }
  }

  // Identificação real vem de `pessoa` (buscarCabecalhoImpressao); `paciente` (tabela
  // legada) só serve de fallback pro nome/sexo quando ainda não carregou. Campos sem
  // fonte real (raça/cor, CEP) ficam vazios — nunca inventar dado de identificação num
  // documento legal como a AIH.
  const nomePaciente = pessoa?.nome || paciente?.nome || atendimento?.nome || 'NÃO IDENTIFICADO';
  const prontuarioNum = numeroLimpo(pessoa?.prontuario_numero) || '';
  const cnsPaciente = pessoa?.cns || '';
  const nascPaciente = pessoa?.data_nascimento
    ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
    : (paciente?.idade ? `${paciente.idade} anos` : '');
  const sexoPaciente = (pessoa?.sexo || paciente?.sexo || atendimento?.sexo || '').toUpperCase().startsWith('F') ? 'FEMININO' : (pessoa?.sexo || paciente?.sexo || atendimento?.sexo) ? 'MASCULINO' : '';
  const maePaciente = (pessoa?.nome_mae || '').toUpperCase();
  const telPaciente = pessoa?.telefone || '';
  const enderecoPaciente = pessoa?.endereco
    ? `${[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')} — ${pessoa.cidade || 'BREVES'}/PA`.toUpperCase()
    : '';

  const dataHoraAtual = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="clinical-split">
      {/* LADO ESQUERDO: BARRA DE FERRAMENTAS & SIGTAP */}
      
      {historicoAberto && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} onClick={() => setHistoricoAberto(false)} />
          <aside className="tools-pane" style={{ position: 'fixed', top: 0, right: 0, width: 420, maxWidth: '100vw', height: '100vh', zIndex: 9999, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>
<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}><button type="button" onClick={() => setHistoricoAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}><i className="ph ph-x"></i></button></div>

        <div className="pane-header">
          <span >
            <i className="ph ph-hospital" style={{ fontSize: 14 }} /> Regulação SUS / AIH
          </span>
          <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ph ph-check-circle" /> Conectado
          </span>
        </div>

        <div className="tools-body">
          <div className="info-integration-box" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <h3 style={{ color: '#166534', margin: 0, marginBottom: 4 }}><i className="ph ph-check" /> Estabelecimento UPA 24h</h3>
            <p style={{ fontSize: 12, color: '#14532D', margin: 0, lineHeight: 1.4 }}>
              <strong>Unidade:</strong> UPA 24H BREVES<br />
              <strong>CNES:</strong> 2418657<br />
              <strong>Caráter:</strong> 02 - Urgência<br />
              <strong>Órgão:</strong> SEMSA BREVES / SUS
            </p>
          </div>

          <div className="info-integration-box">
            <h3 style={{ margin: 0, marginBottom: 4 }}><i className="ph ph-sparkle" /> Dados Sincronizados</h3>
            <p style={{ margin: 0, marginBottom: 6 }}>
              Os campos clínicos desta AIH foram preenchidos a partir da <strong>Admissão Médica</strong>:
            </p>
            <ul style={{ fontSize: 12, color: '#475569', marginLeft: 16, marginBottom: 8, lineHeight: 1.4 }}>
              <li>Queixa e HDA &rarr; Sinais e Sintomas</li>
              <li>Comorbidades &rarr; CID Secundário</li>
              <li>Hipótese &rarr; CID-10 Principal</li>
            </ul>
            <button
              type="button"
              className="btn-switch-screen"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={reSyncAll}
            >
              <i className="ph ph-arrows-clockwise" /> Re-sincronizar Agora
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
              <i className="ph ph-needle" /> Procedimentos SIGTAP Frequentes
            </h3>
            {PROCEDIMENTOS_RAPIDOS.map((p) => (
              <button
                key={p.cod}
                type="button"
                className="template-btn"
                onClick={() => selecionarProcRapido(p.cod, p.desc)}
              >
                <div>
                  <strong>{p.rotulo}</strong>
                  <span>{p.codFormatado}</span>
                </div>
                <i className="ph ph-check-circle" style={{ color: "#16A34A", fontSize: 14 }} />
              </button>
            ))}
          </div>

        </div>
      </aside>
        </>
      )}


      {/* LADO DIREITO: CARD PRINCIPAL COM FORMULÁRIO OFICIAL SUS */}
      <div className="clinical-card">
        <div className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 16 }}><div className="cc-header-info">
            <h2>
              <i className="ph ph-hospital" /> Laudo para Solicitação de AIH (SUS) — UPA 24h Breves
            </h2>
            
          </div><button type="button" className="btn btn-outline" onClick={() => setHistoricoAberto(true)} style={{ height: 32, fontSize: 12, display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}><i className="ph ph-clock-counter-clockwise"></i> Ver Histórico</button></div>

        <div className="cc-body">

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}

          {!ehMedico && (
            <div className="aih-encaminhar">
              <div className="aih-encaminhar-txt">
                <i className="ph ph-paper-plane-tilt" />
                <div>
                  <b>Pré-preenchimento da AIH</b>
                  <span>Você preenche e encaminha; o médico escolhido revisa e assina com o login dele. Só o médico finaliza o laudo.</span>
                </div>
              </div>
              <label className="aih-encaminhar-campo">
                Médico que vai revisar e assinar *
                <select value={medicoDestino} onChange={(e) => setMedicoDestino(e.target.value)}>
                  <option value="">Selecione o médico...</option>
                  {medicos.map((m) => <option key={m.id} value={m.id}>{(m.nome_exibicao || m.nome)}{m.crm ? ` · CRM ${m.crm}` : ''}</option>)}
                </select>
              </label>
            </div>
          )}

          {ehMedico && encaminhada && (
            <div className="aih-encaminhar recebida">
              <div className="aih-encaminhar-txt">
                <i className="ph ph-tray-arrow-down" />
                <div>
                  <b>AIH encaminhada a você</b>
                  <span>Pré-preenchida por {nomePreenchedor || 'outro profissional'}{encaminhada.em ? ` em ${new Date(encaminhada.em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}. Revise todos os campos; ao clicar em "Salvar e Imprimir" o laudo sai com a sua assinatura.</span>
                </div>
              </div>
            </div>
          )}

          {sucesso && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-check-circle" /> {sucesso}
              </div>
            </div>
          )}

          

          {/* SEÇÃO 1: IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>1. IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <Campo n="1" rotulo="NOME DO ESTABELECIMENTO SOLICITANTE" col={8} valor={dados.estabelecimento_solicitante_nome} onChange={(v) => set('estabelecimento_solicitante_nome', v.toUpperCase())} />
              <Campo n="2" rotulo="CNES" col={4} valor={dados.estabelecimento_solicitante_cnes} onChange={(v) => set('estabelecimento_solicitante_cnes', v.replace(/\D/g, '').slice(0, 7))} />
              <Campo n="3" rotulo="NOME DO ESTABELECIMENTO EXECUTANTE" col={8} valor={dados.estabelecimento_executante_nome} onChange={(v) => set('estabelecimento_executante_nome', v.toUpperCase())} />
              <Campo n="4" rotulo="CNES" col={4} valor={dados.estabelecimento_executante_cnes} onChange={(v) => set('estabelecimento_executante_cnes', v.replace(/\D/g, '').slice(0, 7))} />
            </div>
          </div>

          {/* SEÇÃO 2: IDENTIFICAÇÃO DO PACIENTE — 5 a 9, 11, 12 e 15 vêm do cadastro (Recepção) */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>2. IDENTIFICAÇÃO DO PACIENTE</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <Campo n="5" rotulo="NOME DO PACIENTE" col={8} readOnly valor={nomePaciente} />
              <Campo n="6" rotulo="Nº DO PRONTUÁRIO" col={4} readOnly valor={prontuarioNum} />
              <Campo n="7" rotulo="CARTÃO NACIONAL DE SAÚDE (CNS)" col={5} readOnly valor={cnsPaciente} />
              <Campo n="8" rotulo="DATA DE NASCIMENTO" col={3} readOnly valor={nascPaciente} />
              <Campo n="9" rotulo="SEXO" col={2} readOnly valor={sexoPaciente} />
              <Campo n="10" rotulo="RAÇA/COR" col={2}>
                <select className="aih-input" value={dados.raca_cor || ''} onChange={(e) => set('raca_cor', e.target.value)}>
                  <option value="">—</option>
                  {RACAS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Campo>
              <Campo n="10.1" rotulo="ETNIA (SE INDÍGENA)" col={3} valor={dados.etnia} onChange={(v) => set('etnia', v.toUpperCase())} />
              <Campo n="11" rotulo="NOME DA MÃE" col={6} readOnly valor={maePaciente} />
              <Campo n="12" rotulo="TELEFONE DE CONTATO" col={3} readOnly valor={telPaciente} />
              <Campo n="13" rotulo="NOME DO RESPONSÁVEL" col={8} valor={dados.nome_responsavel} onChange={(v) => set('nome_responsavel', v.toUpperCase())} />
              <Campo n="14" rotulo="TELEFONE DO RESPONSÁVEL" col={4} valor={dados.telefone_responsavel} onChange={(v) => set('telefone_responsavel', v)} placeholder="(91) 9 0000-0000" />
              <Campo n="15" rotulo="ENDEREÇO (RUA, Nº, BAIRRO)" col={12} readOnly valor={enderecoPaciente} />
              <Campo n="16" rotulo="MUNICÍPIO DE RESIDÊNCIA" col={5} valor={dados.municipio_residencia_nome} onChange={(v) => set('municipio_residencia_nome', v.toUpperCase())} />
              <Campo n="17" rotulo="CÓD. IBGE MUNICÍPIO" col={3} valor={dados.municipio_residencia_ibge} onChange={(v) => set('municipio_residencia_ibge', v.replace(/\D/g, '').slice(0, 7))} />
              <Campo n="18" rotulo="UF" col={1} valor={dados.municipio_residencia_uf} onChange={(v) => set('municipio_residencia_uf', v.toUpperCase().slice(0, 2))} />
              <Campo n="19" rotulo="CEP" col={3} valor={dados.municipio_residencia_cep} onChange={(v) => set('municipio_residencia_cep', v)} />
              <div className="col-12 aih-dica"><i className="ph ph-info" /> Nome, CNS, nascimento, sexo, mãe, telefone e endereço vêm do cadastro do paciente — para corrigir, use Recepção → Completar dados.</div>
            </div>
          </div>

          {/* SEÇÃO 3: JUSTIFICATIVA DA INTERNAÇÃO */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>3. JUSTIFICATIVA DA INTERNAÇÃO</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <div className="col-12">
                <div className="form-group">
                  <label>20 - PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS *</label>
                  <textarea
                    rows={3}
                    style={{ width: '100%' }}
                    value={dados.sinais_sintomas_clinicos}
                    onChange={(e) => set('sinais_sintomas_clinicos', e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="form-group">
                  <label>21 - CONDIÇÕES QUE JUSTIFICAM A INTERNAÇÃO</label>
                  <textarea
                    rows={2}
                    style={{ width: '100%' }}
                    value={dados.condicoes_justificam_internacao}
                    onChange={(e) => set('condicoes_justificam_internacao', e.target.value)}
                  />
                  <div className="quick-chips">
                    <span className="quick-chip" onClick={() => toggleJustChip('Risco iminente de insuficiência respiratória')}>
                      + Insuficiência Respiratória
                    </span>
                    <span className="quick-chip" onClick={() => toggleJustChip('Necessidade de antibioticoterapia parenteral supervisionada')}>
                      + Antibioticoterapia EV
                    </span>
                    <span className="quick-chip" onClick={() => toggleJustChip('Intolerância medicamentosa oral com desidratação')}>
                      + Intolerância VO
                    </span>
                    <span className="quick-chip" onClick={() => toggleJustChip('Refratariedade ao tratamento ambulatorial prévio')}>
                      + Refratariedade Ambulatorial
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="form-group">
                  <label>22 - PRINCIPAIS RESULTADOS DE PROVAS DIAGNÓSTICAS (EXAMES REALIZADOS)</label>
                  <textarea
                    rows={2}
                    style={{ width: '100%' }}
                    value={dados.resultados_provas_diagnosticas}
                    onChange={(e) => set('resultados_provas_diagnosticas', e.target.value)}
                  />
                </div>
              </div>

              <Campo n="23" rotulo="DIAGNÓSTICO INICIAL" col={12} destaque valor={dados.diagnostico_inicial_texto} onChange={(v) => set('diagnostico_inicial_texto', v.toUpperCase())} placeholder="Ex.: ABSCESSO GLÚTEO / INFECÇÃO DE PELE E PARTES MOLES" />
              <Campo n="24" rotulo="CID-10 PRINCIPAL" col={4} destaque valor={dados.cid_principal} onChange={(v) => set('cid_principal', v.toUpperCase().replace(/\s/g, ''))} placeholder="Ex.: L02.3" />
              <Campo n="25" rotulo="CID-10 SECUNDÁRIO" col={4} valor={dados.cid_secundario} onChange={(v) => set('cid_secundario', v.toUpperCase().replace(/\s/g, ''))} />
              <Campo n="26" rotulo="CID-10 CAUSAS ASSOCIADAS" col={4} valor={dados.cid_causas_associadas} onChange={(v) => set('cid_causas_associadas', v.toUpperCase().replace(/\s/g, ''))} />
            </div>
          </div>

          {/* SEÇÃO 4: PROCEDIMENTO SOLICITADO */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>4. PROCEDIMENTO SOLICITADO</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <Campo n="27" rotulo="DESCRIÇÃO DO PROCEDIMENTO SOLICITADO" col={8} destaque valor={dados.procedimento_principal_nome} onChange={(v) => set('procedimento_principal_nome', v.toUpperCase())} />
              <Campo n="28" rotulo="CÓDIGO DO PROCEDIMENTO (SIGTAP) — OPCIONAL" col={4} valor={dados.procedimento_principal_codigo} onChange={(v) => set('procedimento_principal_codigo', v.replace(/\D/g, '').slice(0, 10))} placeholder="10 dígitos" />
              <Campo n="29" rotulo="CLÍNICA" col={4} valor={dados.clinica} onChange={(v) => set('clinica', v.toUpperCase())} />
              <Campo n="30" rotulo="CARÁTER DA INTERNAÇÃO" col={3}>
                <select className="aih-input" value={dados.carater_internacao === 'ELETIVA' ? 'ELETIVA' : 'URGENCIA'} onChange={(e) => set('carater_internacao', e.target.value)}>
                  <option value="URGENCIA">URGÊNCIA</option>
                  <option value="ELETIVA">ELETIVA</option>
                </select>
              </Campo>
              <Campo n="31" rotulo="DOCUMENTO" col={2}>
                <select className="aih-input" value={dados.profissional_documento_tipo || 'CNS'} onChange={(e) => set('profissional_documento_tipo', e.target.value)}>
                  <option value="CNS">CNS</option>
                  <option value="CPF">CPF</option>
                </select>
              </Campo>
              <Campo n="32" rotulo={`Nº DO ${dados.profissional_documento_tipo || 'CNS'} DO PROFISSIONAL SOLICITANTE`} col={3} valor={dados.profissional_documento_numero} onChange={(v) => set('profissional_documento_numero', v.replace(/[^\d.-]/g, ''))} placeholder="do médico que assina" />
              <Campo n="33" rotulo="NOME DO PROFISSIONAL SOLICITANTE" col={8} readOnly valor={(() => {
                const m = ehMedico ? { nome: medicoNome, crm: medicoCrm } : (() => { const x = medicos.find((y) => y.id === medicoDestino); return x ? { nome: x.nome_exibicao || x.nome, crm: x.crm } : {}; })();
                return m.nome ? `${m.nome.toUpperCase()}${m.crm ? ` \u2022 CRM-PA ${m.crm}` : ''}` : (ehMedico ? 'NÃO INFORMADO' : 'ESCOLHA O MÉDICO ACIMA');
              })()} />
              <Campo n="34" rotulo="DATA DA SOLICITAÇÃO" col={4} readOnly valor={ehMedico ? `${dataHoraAtual} (data da assinatura)` : 'Data em que o médico assinar'} />
            </div>
          </div>

          {/* SEÇÃO 5: CAUSAS EXTERNAS (36 a 45) */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>5. PREENCHER EM CASO DE CAUSAS EXTERNAS (ACIDENTES OU VIOLÊNCIAS)</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              {[['causa_externa_transito', '36 - Acidente de trânsito'], ['causa_externa_trabalho_tipico', '37 - Acidente de trabalho típico'], ['causa_externa_trabalho_trajeto', '38 - Acidente de trabalho trajeto']].map(([k, r]) => (
                <div key={k} className="col-4">
                  <label className="aih-check"><input type="checkbox" checked={!!dados[k]} onChange={(e) => set(k, e.target.checked)} /> {r}</label>
                </div>
              ))}
              <Campo n="39" rotulo="CNPJ DA SEGURADORA" col={5} valor={dados.cnpj_seguradora} onChange={(v) => set('cnpj_seguradora', v)} />
              <Campo n="40" rotulo="Nº DO BILHETE" col={4} valor={dados.numero_bilhete} onChange={(v) => set('numero_bilhete', v)} />
              <Campo n="41" rotulo="SÉRIE" col={3} valor={dados.serie_bilhete} onChange={(v) => set('serie_bilhete', v)} />
              <Campo n="42" rotulo="CNPJ DA EMPRESA" col={5} valor={dados.cnpj_empresa} onChange={(v) => set('cnpj_empresa', v)} />
              <Campo n="43" rotulo="CNAE DA EMPRESA" col={4} valor={dados.cnae_empresa} onChange={(v) => set('cnae_empresa', v)} />
              <Campo n="44" rotulo="CBOR" col={3} valor={dados.cbor} onChange={(v) => set('cbor', v)} />
              <div className="col-12 aih-vinculo">
                <span>45 - VÍNCULO COM A PREVIDÊNCIA</span>
                <div>
                  {VINCULOS.map((op) => (
                    <label key={op.valor} className="aih-check">
                      <input type="radio" name="aih-vinculo" checked={dados.vinculo_previdencia === op.valor} onChange={() => set('vinculo_previdencia', op.valor)} /> {op.rotulo}
                    </label>
                  ))}
                  {dados.vinculo_previdencia && <button type="button" className="aih-limpar" onClick={() => set('vinculo_previdencia', '')}>limpar</button>}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 6: AUTORIZAÇÃO */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>6. AUTORIZAÇÃO (46 a 52 — preenchido pela Regulação)</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <div className="col-6">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>46 - NOME DO AUTORIZADOR</label></div>
                  <div className="aih-field-value">{dados.autorizador_nome}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>47 - CÓD. ÓRGÃO EMISSOR</label></div>
                  <div className="aih-field-value" style={{ fontWeight: 800 }}>{dados.autorizador_codigo_orgao_emissor}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>52 - Nº DA AIH</label></div>
                  <div className="aih-field-value" style={{ fontWeight: 800, color: 'var(--c-primary, #0D9488)' }}>{dados.numero_autorizacao}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ DINÂMICO */}
        <div className="cc-footer">
          <div>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => (encaminhada ? onFechar?.() : rascunho.cancelar(onFechar))}
            >
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button
              type="button"
              className="btn-save-draft"
              onClick={() => salvar(false)}
              disabled={salvando}
            >
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="btn-save-aih"
              onClick={() => salvar(true)}
              disabled={salvando}
            >
              {ehMedico
                ? <><i className="ph ph-printer" /> {salvando ? "Salvando..." : "Salvar e Imprimir"}</>
                : <><i className="ph ph-paper-plane-tilt" /> {salvando ? "Encaminhando..." : "Encaminhar ao médico"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
