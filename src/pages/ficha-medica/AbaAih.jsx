import { useEffect, useState } from 'react';
import { criarAih, listarConsultas, buscarCabecalhoImpressao, mensagemErroSalvar, listarMedicosAtivos, normalizarCid, cidsExistentes } from '../../lib/pepMedico';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { AIH_VAZIA } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { useRascunho } from '../../hooks/useRascunho';
import { useSalvarDocumento, MSG_RASCUNHO_SALVO } from '../../hooks/useSalvarDocumento';
import { alternarJustificativa, dadosDaAdmissao, separarCids, camposPacienteDoCadastro, preencherVazios, atualizacaoDoCadastro } from './aih/aihRegras';
import { completarCadastroPelaAih } from '../../lib/pepRecepcao';
import PainelRegulacao from './aih/PainelRegulacao';
import EncaminharAih from './aih/EncaminharAih';
import SecaoEstabelecimento from './aih/SecaoEstabelecimento';
import SecaoPaciente from './aih/SecaoPaciente';
import SecaoJustificativa from './aih/SecaoJustificativa';
import SecaoProcedimento from './aih/SecaoProcedimento';
import SecaoCausasExternas from './aih/SecaoCausasExternas';
import SecaoAutorizacao from './aih/SecaoAutorizacao';

// Aba Laudo de AIH: guarda o estado e as regras (encaminhar ao médico, CIDs, salvar).
// Cada seção do formulário oficial fica em ./aih/; as regras sem tela em ./aih/aihRegras.js.

export default function AbaAih({ atendimento, medicoId, medicoNome, medicoCrm, onImprimir, onFechar }) {
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Quem não é médico (enfermagem/recepção/administrativo) pré-preenche e ENCAMINHA a AIH a um
  // médico; só o médico finaliza (o banco também bloqueia). O médico destinatário encontra a
  // AIH nas Pendências e ao abrir esta aba, revisa e assina com "Finalizar e Imprimir".
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
  // Identificação (5-19): vem do cadastro e é editável; ao salvar, completa o que faltava no cadastro.
  useEffect(() => {
    if (!cabecalho?.pessoa) return;
    const pe = cabecalho.pessoa;
    setDados((prev) => ({
      // Campos 5-9, 11, 12 e 15: começam com o cadastro e podem ser escritos pelo médico.
      ...preencherVazios(prev, camposPacienteDoCadastro(pe)),
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
    clinica: isPediatrico ? 'CLÍNICA PEDIÁTRICA' : 'CLÍNICA MÉDICA',
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
      : 'Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.');
  } });
  const { salvando, salvar: salvarDocumento } = useSalvarDocumento({ rascunho, dataRegistro, editandoId, setEditandoId, setDataRegistro });

  // Ao abrir: puxa da admissão médica só o que ainda está vazio (nunca apaga o rascunho nem o que foi escrito).
  useEffect(() => {
    let vivo = true;
    listarConsultas(atendimento?.atendimento_id)
      .then((consultas) => { if (vivo && consultas?.length) setDados((prev) => dadosDaAdmissao(consultas[0], prev)); })
      .catch(() => {});
    return () => { vivo = false };
  }, [atendimento?.atendimento_id]);

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function selecionarProcRapido(cod, desc) {
    setDados((prev) => ({ ...prev, procedimento_principal_codigo: cod, procedimento_principal_nome: desc }));
  }

  function toggleJustChip(texto) {
    setDados((prev) => ({ ...prev, condicoes_justificam_internacao: alternarJustificativa(prev.condicoes_justificam_internacao, texto) }));
  }

  // "Re-sincronizar Agora": troca sinais/sintomas, diagnóstico e CID pelo que está na admissão.
  async function reSyncAll() {
    try {
      const consultas = await listarConsultas(atendimento?.atendimento_id);
      if (consultas && consultas.length > 0) {
        setDados((prev) => dadosDaAdmissao(consultas[0], prev, true));
        setSucesso('Dados sincronizados da admissão com sucesso!');
      } else {
        setSucesso('Sincronização concluída com os dados de triagem.');
      }
    } catch {
      setSucesso('Dados atualizados.');
    }
    setTimeout(() => setSucesso(''), 3000);
  }

  async function salvar(imprimirApos = false) {
    // Não médico: o 3º botão é "Encaminhar ao médico" — continua rascunho, mas vai para o médico.
    const encaminhar = !ehMedico && imprimirApos;
    const finalizar = ehMedico && imprimirApos;
    if (!ehMedico && !medicoDestino) {
      setErro('Escolha o médico que vai revisar e assinar esta AIH.');
      return;
    }
    // Rascunho ("Salvar Rascunho") grava como estiver; só a finalização/encaminhamento exige o mínimo.
    // Procedimento solicitado (27) e código SIGTAP (28) não são obrigatórios; só os sinais e
    // sintomas clínicos (20) são exigidos para finalizar ou encaminhar.
    if ((finalizar || encaminhar) && !String(dados.sinais_sintomas_clinicos || '').trim()) {
      setErro('Para finalizar, preencha ao menos os sinais e sintomas clínicos (20).');
      return;
    }
    // CID: ajusta o formato e confere no catálogo CID-10. CID fora do catálogo impedia salvar.
    const cid1 = normalizarCid(dados.cid_principal), cid2 = normalizarCid(dados.cid_secundario);
    const existentes = await cidsExistentes([cid1, cid2]);
    const { invalidos, dadosGravar, cidTexto } = separarCids(dados, cid1, cid2, existentes);
    if (invalidos.length && finalizar) {
      setErro(`CID não encontrado na tabela CID-10: ${invalidos.join(', ')}. Confira o código (ex.: J18.9) antes de finalizar.`);
      return;
    }
    setErro('');
    // Caminho de volta: o que o médico escreveu na identificação completa o cadastro do paciente
    // (só o que estava vazio lá; o que a recepção registrou não é trocado).
    const { alterar, preenchidos, divergentes } = atualizacaoDoCadastro(pessoa, dados);
    let avisoCadastro = '';
    if (pessoa.id && preenchidos.length) {
      const { error: erroCad } = await completarCadastroPelaAih(pessoa.id, alterar);
      if (!erroCad) {
        avisoCadastro = ` Cadastro do paciente completado com: ${preenchidos.join(', ')}.`;
        buscarCabecalhoImpressao(atendimento.atendimento_id).then(setCabecalho);
      }
    }
    if (divergentes.length) avisoCadastro += ` Diferente do cadastro (mantido na Recepção, confira): ${divergentes.join(', ')}.`;
    await salvarDocumento(finalizar, ({ id, situacao }) => criarAih({
      cidTexto,
      id, situacao,
      atendimentoId: atendimento?.atendimento_id,
      pessoaId: atendimento?.pessoa_id,
      solicitanteId: ehMedico ? medicoId : medicoDestino,
      medicoDestinoId: ehMedico ? undefined : medicoDestino,
      encaminhar,
      dados: dadosGravar,
    }), {
      aoFalhar: (error) => { console.error(error); setErro(mensagemErroSalvar(error, 'o Laudo de AIH')); },
      aoSalvarRascunho: () => {
        if (encaminhar) {
          setSucesso(`AIH encaminhada a ${nomeMedico(medicoDestino) || 'o médico'}. Ela aparece nas Pendências dele; ele revisa e assina com o próprio login.${avisoCadastro}`);
          return;
        }
        setSucesso(MSG_RASCUNHO_SALVO + (invalidos.length ? ` Atenção: CID ${invalidos.join(', ')} não está na tabela CID-10 — corrija antes de finalizar.` : '') + avisoCadastro);
      },
      aoFinalizar: (novaAih) => {
        setEncaminhada(null);
        setSucesso('Laudo de AIH registrado. O diagnóstico da AIH passou a valer no Painel de Leitos, na Passagem de Plantão e no prontuário, e o paciente ficou como INTERNADO.' + avisoCadastro);
        setTimeout(() => setSucesso(''), 8000);
        if (novaAih) onImprimir(novaAih);
      },
    });
  }

  const dataHoraAtual = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  // Campo 33: o médico que assina (o próprio médico, ou o escolhido no encaminhamento).
  const profissional = ehMedico ? { nome: medicoNome, crm: medicoCrm } : (() => { const x = medicos.find((y) => y.id === medicoDestino); return x ? { nome: x.nome_exibicao || x.nome, crm: x.crm } : {}; })();
  const nomeProfissional = profissional.nome ? `${profissional.nome.toUpperCase()}${profissional.crm ? ` \u2022 CRM-PA ${profissional.crm}` : ''}` : (ehMedico ? 'NÃO INFORMADO' : 'ESCOLHA O MÉDICO ACIMA');

  return (
    <div className="clinical-split">
      {historicoAberto && <PainelRegulacao onFechar={() => setHistoricoAberto(false)} onResincronizar={reSyncAll} onProcedimento={selecionarProcRapido} />}

      {/* LADO DIREITO: CARD PRINCIPAL COM FORMULÁRIO OFICIAL SUS */}
      <div className="clinical-card">
        <div className="cc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 16 }}><div className="cc-header-info">
            <h2>
              <i className="ph ph-hospital" /> Laudo para Solicitação de AIH (SUS) — UPA 24h Breves
            </h2>
            
          </div><button type="button" className="btn btn-outline" onClick={() => setHistoricoAberto(true)} style={{ height: 32, fontSize: 'var(--fs-xs)', display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}><i className="ph ph-clock-counter-clockwise"></i> Ver Histórico</button></div>

        <div className="cc-body">

          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
              </div>
            </div>
          )}

          <EncaminharAih ehMedico={ehMedico} medicos={medicos} medicoDestino={medicoDestino} setMedicoDestino={setMedicoDestino} encaminhada={encaminhada} nomePreenchedor={nomePreenchedor} />

          {sucesso && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-check-circle" /> {sucesso}
              </div>
            </div>
          )}

          <SecaoEstabelecimento dados={dados} set={set} />
          <SecaoPaciente dados={dados} set={set} />
          <SecaoJustificativa dados={dados} set={set} alternarChip={toggleJustChip} />
          <SecaoProcedimento dados={dados} set={set} nomeProfissional={nomeProfissional} dataSolicitacao={ehMedico ? `${dataHoraAtual} (data da assinatura)` : 'Data em que o médico assinar'} />
          <SecaoCausasExternas dados={dados} set={set} />
          <SecaoAutorizacao dados={dados} />
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
              <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button
              type="button"
              className="btn-save-aih"
              onClick={() => salvar(true)}
              disabled={salvando}
            >
              {ehMedico
                ? <><i className="ph ph-printer" /> {salvando ? "Salvando..." : "Finalizar e Imprimir"}</>
                : <><i className="ph ph-paper-plane-tilt" /> {salvando ? "Encaminhando..." : "Encaminhar ao médico"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
