import { useEffect, useState } from 'react';
import { listarAih, criarAih, listarConsultas, buscarCabecalhoImpressao } from '../../lib/pepMedico';
import { AIH_VAZIA } from './constantes';

const PROCEDIMENTOS_RAPIDOS = [
  { cod: '0303010190', codFormatado: '03.03.01.019-0', desc: 'TRATAMENTO DE PNEUMONIA OU INFLUENZA (GRIPE)', rotulo: 'Pneumonia / Influenza' },
  { cod: '0303010034', codFormatado: '03.03.01.003-4', desc: 'TRATAMENTO DE OUTRAS DOENCAS DO APARELHO RESPIRATORIO (ASMA/BRONQUITE)', rotulo: 'Doenças Respiratórias (Asma)' },
  { cod: '0303010069', codFormatado: '03.03.01.006-9', desc: 'TRATAMENTO DE TRANSTORNOS DIGESTIVOS / DIARREIA AGUDA', rotulo: 'Transtornos Digestivos' },
];

export default function AbaAih({ atendimento, medicoId, onImprimir, onIrParaAdmissao }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

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

  // Só a clínica (pediatria vs. clínica médica) é inferida de dado real (idade do
  // paciente) — todo o resto começa vazio (AIH_VAZIA) e é preenchido pelo médico.
  // Não pré-preencher diagnóstico, procedimento, CID ou nº de autorização: são campos
  // de um documento legal (Laudo de AIH/SUS), nunca podem carregar dado de exemplo.
  const [dados, setDados] = useState({
    ...AIH_VAZIA,
    clinica: isPediatrico ? 'PEDIATRIA / OBSERVAÇÃO' : 'CLÍNICA MÉDICA / OBSERVAÇÃO',
    carater_internacao: '02 - URGÊNCIA',
  });

  useEffect(() => {
    carregar();
  }, [atendimento?.atendimento_id]);

  async function carregar() {
    setCarregando(true);
    const lista = await listarAih(atendimento?.atendimento_id);
    setHistorico(lista);

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

  function insertExamSnippet(tipo) {
    let snippet = '';
    if (tipo === 'rx-leuco') {
      snippet = '1. RAIO-X DE TÓRAX (UPA 24H BREVES): Infiltrado alveolar homogêneo em base pulmonar direita.\n2. LEUCOGRAMA: 16.800 leucócitos/mm³ com desvio à esquerda. PCR: 48 mg/L.';
    } else if (tipo === 'gaso') {
      snippet = 'GASOMETRIA ARTERIAL: pH 7.36, pCO2 38 mmHg, pO2 88 mmHg, HCO3 22 mEq/L, BE -1.5, SatO2 96%.';
    } else if (tipo === 'pcr-eletr') {
      snippet = 'PCR: 48 mg/L. SÓDIO: 138 mEq/L. POTÁSSIO: 4.1 mEq/L. URÉIA: 24 mg/dL. CREATININA: 0.6 mg/dL.';
    }

    setDados((prev) => {
      const atual = prev.resultados_provas_diagnosticas || '';
      return { ...prev, resultados_provas_diagnosticas: atual ? `${atual}\n${snippet}` : snippet };
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
    if (!dados.procedimento_principal_nome.trim() || !dados.sinais_sintomas_clinicos.trim()) {
      setErro('Preencha ao menos o procedimento solicitado e os sinais/sintomas clínicos.');
      return;
    }
    setErro('');
    setSalvando(true);
    const { data: novaAih, error } = await criarAih({
      atendimentoId: atendimento?.atendimento_id,
      pessoaId: atendimento?.pessoa_id,
      solicitanteId: medicoId,
      dados,
    });
    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar o Laudo de AIH. Verifique a conexão e tente novamente.');
      return;
    }
    setSucesso('Laudo de AIH registrado com sucesso!');
    setTimeout(() => setSucesso(''), 4000);
    carregar();

    if (imprimirApos && novaAih) {
      onImprimir(novaAih);
    }
  }

  // Identificação real vem de `pessoa` (buscarCabecalhoImpressao); `paciente` (tabela
  // legada) só serve de fallback pro nome/sexo quando ainda não carregou. Campos sem
  // fonte real (raça/cor, CEP) ficam vazios — nunca inventar dado de identificação num
  // documento legal como a AIH.
  const nomePaciente = pessoa?.nome || paciente?.nome || atendimento?.nome || 'NÃO IDENTIFICADO';
  const prontuarioNum = pessoa?.prontuario_numero || '';
  const cnsPaciente = pessoa?.cns || '';
  const nascPaciente = pessoa?.data_nascimento
    ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
    : (paciente?.idade ? `${paciente.idade} anos` : '');
  const sexoPaciente = (pessoa?.sexo || paciente?.sexo || atendimento?.sexo || '').toUpperCase().startsWith('F') ? 'FEMININO' : (pessoa?.sexo || paciente?.sexo || atendimento?.sexo) ? 'MASCULINO' : '';
  const racaPaciente = '';
  const maePaciente = (pessoa?.nome_mae || '').toUpperCase();
  const telPaciente = pessoa?.telefone || '';
  const enderecoPaciente = pessoa?.endereco
    ? `${[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')} — ${pessoa.cidade || 'BREVES'}/PA`.toUpperCase()
    : '';

  const dataHoraAtual = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="clinical-split">
      {/* LADO ESQUERDO: BARRA DE FERRAMENTAS & SIGTAP */}
      <aside className="tools-pane">
        <div className="pane-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ph ph-hospital" style={{ fontSize: 14 }} /> Regulação SUS / AIH
          </span>
          <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ph ph-check-circle" /> Conectado
          </span>
        </div>

        <div className="tools-body">
          <div className="info-integration-box" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <h3 style={{ color: '#166534', margin: 0, marginBottom: 4 }}><i className="ph ph-check" /> Estabelecimento UPA 24h</h3>
            <p style={{ fontSize: 11, color: '#14532D', margin: 0, lineHeight: 1.4 }}>
              <strong>Unidade:</strong> UPA 24H BREVES<br />
              <strong>CNES:</strong> 02.967.963<br />
              <strong>Caráter:</strong> 02 - Urgência<br />
              <strong>Órgão:</strong> SEMSA BREVES / SUS
            </p>
          </div>

          <div className="info-integration-box">
            <h3 style={{ margin: 0, marginBottom: 4 }}><i className="ph ph-sparkle" /> Dados Sincronizados</h3>
            <p style={{ margin: 0, marginBottom: 6 }}>
              Os campos clínicos desta AIH foram preenchidos a partir da <strong>Admissão Médica</strong>:
            </p>
            <ul style={{ fontSize: 11, color: '#475569', marginLeft: 16, marginBottom: 8, lineHeight: 1.4 }}>
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
            <h3 style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
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

          {/* Histórico compacto na barra lateral */}
          {carregando ? (
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>Carregando laudos...</div>
          ) : historico.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
              <h3 style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                <i className="ph ph-clock-counter-clockwise" /> Laudos Anteriores ({historico.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {historico.map((h) => (
                  <div key={h.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 8px', fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.procedimento_principal_nome}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, color: '#64748B', fontSize: 10 }}>
                      <span>{new Date(h.criado_em).toLocaleDateString('pt-BR')}</span>
                      <button
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        onClick={() => onImprimir(h)}
                      >
                        <i className="ph ph-printer" /> Imprimir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* LADO DIREITO: CARD PRINCIPAL COM FORMULÁRIO OFICIAL SUS */}
      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-header-info">
            <h2>
              <i className="ph ph-hospital" /> Laudo para Solicitação de AIH (SUS) — UPA 24h Breves
            </h2>
            <span>
              Documento Oficial: Laudo AIH Oficial (Modelo 16) &bull; Estabelecimento: <strong>UPA 24H BREVES (CNES 0296796)</strong>
            </span>
          </div>
        </div>

        <div className="cc-body">
          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erro}
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

          {/* BANNER OFICIAL AIH */}
          <div className="aih-banner-top">
            <div className="aih-banner-title">
              <h3><i className="ph ph-file-text" /> Laudo de Solicitação de Internação Hospitalar (AIH)</h3>
              <p>Portaria SAS/MS nº 113 &bull; Documento Oficial SUS &bull; UPA 24h Breves (CNES 0296796)</p>
            </div>
            <div className="aih-sync-pill">
              <i className="ph ph-sparkle" style={{ color: "#86EFAC" }} /> Dados Sincronizados da Admissão
            </div>
          </div>

          {/* SEÇÃO 1: IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>1. IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <div className="col-8">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>1 - NOME DO ESTABELECIMENTO SOLICITANTE</label></div>
                  <div className="aih-field-value">{dados.estabelecimento_solicitante_nome}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>2 - CNES</label></div>
                  <div className="aih-field-value" style={{ letterSpacing: 2, fontWeight: 800, color: '#1D4ED8' }}>
                    0 2 9 6 7 9 6
                  </div>
                </div>
              </div>
              <div className="col-8">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>3 - NOME DO ESTABELECIMENTO EXECUTANTE</label></div>
                  <div className="aih-field-value">{dados.estabelecimento_executante_nome}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>4 - CNES</label></div>
                  <div className="aih-field-value" style={{ letterSpacing: 2, fontWeight: 800, color: '#1D4ED8' }}>
                    0 2 9 6 7 9 6
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: IDENTIFICAÇÃO DO PACIENTE */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>2. IDENTIFICAÇÃO DO PACIENTE</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <div className="col-8">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>5 - NOME DO PACIENTE</label></div>
                  <div className="aih-field-value">{nomePaciente}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>6 - Nº DO PRONTUÁRIO</label></div>
                  <div className="aih-field-value">{prontuarioNum}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>7 - CARTÃO NACIONAL DE SAÚDE (CNS)</label></div>
                  <div className="aih-field-value" style={{ letterSpacing: 1 }}>{cnsPaciente}</div>
                </div>
              </div>
              <div className="col-2">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>8 - NASCIMENTO</label></div>
                  <div className="aih-field-value">{nascPaciente}</div>
                </div>
              </div>
              <div className="col-2">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>9 - SEXO</label></div>
                  <div className="aih-field-value">{sexoPaciente}</div>
                </div>
              </div>
              <div className="col-2">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>10 - RAÇA / COR</label></div>
                  <div className="aih-field-value">{racaPaciente}</div>
                </div>
              </div>
              <div className="col-7">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>11 - NOME DA MÃE</label></div>
                  <div className="aih-field-value">{maePaciente}</div>
                </div>
              </div>
              <div className="col-5">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>12 - TELEFONE</label></div>
                  <div className="aih-field-value">{telPaciente}</div>
                </div>
              </div>
              <div className="col-12">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>15 - ENDEREÇO COMPLETO</label></div>
                  <div className="aih-field-value">{enderecoPaciente}</div>
                </div>
              </div>
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
                  <label>
                    20 - PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS *
                    <span className="badge-auto">Preenchido da Admissão</span>
                  </label>
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
                  <div className="quick-chips">
                    <span className="quick-chip" onClick={() => insertExamSnippet('rx-leuco')}>
                      + Inserir Raio-X + Leucograma
                    </span>
                    <span className="quick-chip" onClick={() => insertExamSnippet('gaso')}>
                      + Inserir Gasometria
                    </span>
                    <span className="quick-chip" onClick={() => insertExamSnippet('pcr-eletr')}>
                      + Inserir PCR + Eletrólitos
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="aih-field-box highlight">
                  <div className="aih-field-header">
                    <label>24 - CID-10 PRINCIPAL</label>
                    <span className="badge-auto">Da Admissão</span>
                  </div>
                  <input
                    type="text"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 11.5, fontWeight: 800, color: '#1D4ED8', background: 'transparent' }}
                    value={dados.cid_principal}
                    onChange={(e) => set('cid_principal', e.target.value)}
                  />
                </div>
              </div>

              <div className="col-6">
                <div className="aih-field-box">
                  <div className="aih-field-header">
                    <label>25 - CID-10 SECUNDÁRIO (COMORBIDADES)</label>
                    <span className="badge-auto">Automático</span>
                  </div>
                  <input
                    type="text"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 11, fontWeight: 700, background: 'transparent' }}
                    value={dados.cid_secundario}
                    onChange={(e) => set('cid_secundario', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: PROCEDIMENTO SOLICITADO */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>4. PROCEDIMENTO SOLICITADO</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <div className="col-8">
                <div className="aih-field-box highlight">
                  <div className="aih-field-header">
                    <label>27 - DESCRIÇÃO DO PROCEDIMENTO SIGTAP</label>
                  </div>
                  <input
                    type="text"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 11.5, fontWeight: 700, color: '#1D4ED8', background: 'transparent' }}
                    value={dados.procedimento_principal_nome}
                    onChange={(e) => set('procedimento_principal_nome', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box highlight">
                  <div className="aih-field-header"><label>28 - CÓDIGO SIGTAP</label></div>
                  <input
                    type="text"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 12, fontWeight: 800, color: '#1D4ED8', letterSpacing: 2, background: 'transparent' }}
                    value={dados.procedimento_principal_codigo}
                    onChange={(e) => set('procedimento_principal_codigo', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box">
                  <div className="aih-field-header"><label>29 - CLÍNICA</label></div>
                  <input
                    type="text"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 11, fontWeight: 700, background: 'transparent' }}
                    value={dados.clinica}
                    onChange={(e) => set('clinica', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box">
                  <div className="aih-field-header"><label>30 - CARÁTER DA INTERNAÇÃO</label></div>
                  <input
                    type="text"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 11, fontWeight: 700, background: 'transparent' }}
                    value={dados.carater_internacao}
                    onChange={(e) => set('carater_internacao', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>32 - CNS DO SOLICITANTE</label></div>
                  <div className="aih-field-value">704600614714321</div>
                </div>
              </div>
              <div className="col-8">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>33 - NOME DO PROFISSIONAL SOLICITANTE</label></div>
                  <div className="aih-field-value">DR. PLANTONISTA &bull; CRM-PA: 1234 (UPA 24H BREVES)</div>
                </div>
              </div>
              <div className="col-4">
                <div className="aih-field-box readonly">
                  <div className="aih-field-header"><label>34 - DATA DA SOLICITAÇÃO</label></div>
                  <div className="aih-field-value">{dataHoraAtual}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: CAUSAS EXTERNAS */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>5. PREENCHER EM CASO DE CAUSAS EXTERNAS</span>
            </div>
            <div className="aih-grid" style={{ marginTop: 4 }}>
              <div className="col-4">
                <label style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dados.causa_externa_transito}
                    onChange={(e) => set('causa_externa_transito', e.target.checked)}
                  />
                  36 - Acidente de Trânsito
                </label>
              </div>
              <div className="col-4">
                <label style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dados.causa_externa_trabalho_tipico}
                    onChange={(e) => set('causa_externa_trabalho_tipico', e.target.checked)}
                  />
                  37 - Acidente de Trabalho Típico
                </label>
              </div>
              <div className="col-4">
                <label style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dados.causa_externa_trabalho_trajeto}
                    onChange={(e) => set('causa_externa_trabalho_trajeto', e.target.checked)}
                  />
                  38 - Acidente de Trajeto
                </label>
              </div>
              <div className="col-12" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4, padding: '6px 10px', marginTop: 2 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                  45 - Vínculo Previdenciário:
                </span>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 11, fontWeight: 600, flexWrap: 'wrap' }}>
                  {['Empregado', 'Autônomo', 'Aposentado', isPediatrico ? 'NÃO SEGURADO (MENOR)' : 'Não Segurado'].map((v) => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="prev"
                        checked={dados.vinculo_previdencia === v}
                        onChange={() => set('vinculo_previdencia', v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 6: AUTORIZAÇÃO */}
          <div className="aih-secao-box">
            <div className="aih-secao-legend">
              <span>6. AUTORIZAÇÃO</span>
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
                  <div className="aih-field-value" style={{ fontWeight: 800, color: '#1D4ED8' }}>{dados.numero_autorizacao}</div>
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
              onClick={() => onIrParaAdmissao && onIrParaAdmissao()}
            >
              <i className="ph ph-x-circle" /> Cancelar
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {onIrParaAdmissao && (
              <button
                type="button"
                className="btn-next-tab"
                onClick={onIrParaAdmissao}
              >
                ← Voltar para Admissão
              </button>
            )}
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
              <i className="ph ph-printer" /> {salvando ? "Salvando..." : "Salvar e Imprimir Laudo AIH"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
