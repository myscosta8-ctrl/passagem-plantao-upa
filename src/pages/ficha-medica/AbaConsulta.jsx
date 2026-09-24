import { useEffect, useState } from 'react';
import { listarConsultas, criarConsulta } from '../../lib/pepMedico';

const MODELOS = {
  pediatria: {
    qp: 'Febre alta, tosse e falta de ar há 3 dias',
    hda: 'Mãe relata que a criança iniciou quadro de febre alta (aferido 39.2ºC na triagem) há 3 dias, responsiva parcialmente a antitérmicos. Evoluiu nas últimas 24h com tosse produtiva e taquipneia. Apresenta recusa alimentar, hipoatividade e prostração.',
    ef: 'Geral: REG, hipoativo, acianótico, anictérico, febril ao toque, taquipneico leve (FR: 28 irpm).\nACV: RCRM em 2T, bulhas normofonéticas, sem sopros. FC: 110 bpm.\nAR: Murmúrio vesicular presente bilateralmente, com estertores crepitantes em base pulmonar direita e tiragem intercostal leve. SpO2: 97% em ar ambiente.\nAbdome: Flácido, indolor à palpação, sem visceromegalias, RHA presentes.\nOroscopia: Sem placas purulentas em amígdalas.',
    cid: 'J15.9 - Pneumonia bacteriana não especificada',
    conduta: 'Paciente admitido em leito de observação pediátrica da UPA 24h Breves. Iniciada antibioticoterapia parenteral (Ampicilina + Sulbactam EV), suporte de O2 sob cateter nasal SN, hidratação venosa e monitorização contínua. Solicitado Laudo de AIH para autorização de leito hospitalar.',
  },
  bronquiolite: {
    qp: 'Cansaço intenso, chiado no peito e tosse seca há 2 dias',
    hda: 'Paciente com quadro de coriza há 4 dias que evoluiu com piora progressiva do padrão respiratório, sibilos audíveis sem estetoscópio e dificuldade para mamar/alimentar-se. Sem melhora após inalação em domicílio.',
    ef: 'Geral: REG, taquidispneico, batimento de asa nasal presente, tiragem subcostal e intercostal moderada. Palidez cutânea leve.\nAR: Murmúrio vesicular difuso com tempo expiratório prolongado e sibilos bilaterais disseminados. SpO2: 93% em ar ambiente.\nACV: Taquicárdico (FC: 140 bpm), bulhas normofonéticas sem sopros.',
    cid: 'J21.9 - Bronquiolite aguda não especificada',
    conduta: 'Internação em leito de observação. Oxigenoterapia sob cateter nasal a 2 L/min para manter SpO2 > 94%. Nebulização com broncodilatador conforme protocolo. Hidratação venosa e cabeceira elevada a 30°.',
  },
  desidratacao: {
    qp: 'Vômitos incoercíveis e diarreia líquida profusa há 24 horas',
    hda: 'Início súbito de episódios frequentes de vômitos (mais de 6 episódios) e evacuações líquidas sem sangue ou muco. Inapetência total, diurese diminuída nas últimas 12 horas. Ausência de febre aferida.',
    ef: 'Geral: REG, sonolento, olhos encovados, mucosas secas, turgor cutâneo diminuído com retorno lento da prega (> 2 seg). Pulso rápido e filiforme.\nAR: Murmúrio vesicular limpo, sem ruídos adventícios.\nAbdome: Semigloboso, doloroso difusamente à palpação leve, ruídos hidroaéreos aumentados.',
    cid: 'A09 - Diarreia e gastroenterite de origem infecciosa presumível',
    conduta: 'Hidratação venosa rápida com Soro Fisiológico 0.9% 20 ml/kg em 30 min (Plano C). Antiemético parenteral. Coleta de eletrólitos (Sódio, Potássio) e glicemia capilar. Reavaliação clínica a cada hora.',
  }
};

export default function AbaConsulta({ atendimento, medicoId, onImprimir, onIrParaAih }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const paciente = atendimento?.paciente || {};

  const [dados, setDados] = useState({
    queixa_principal: 'Febre alta, tosse e falta de ar há 3 dias',
    historia_doenca_atual: 'Mãe relata que a criança iniciou quadro de febre alta (aferido 39.2ºC na triagem) há 3 dias, responsiva parcialmente a antitérmicos. Evoluiu nas últimas 24h com tosse produtiva e taquipneia. Apresenta recusa alimentar, hipoatividade e prostração.',
    antecedentes: 'Asma Brônquica (CID J45.9); Rinite Alérgica (CID J30.4)',
    exame_geral: 'Geral: REG, hipoativo, acianótico, anictérico, febril ao toque, taquipneico leve (FR: 28 irpm).\nACV: RCRM em 2T, bulhas normofonéticas, sem sopros. FC: 110 bpm.\nAR: Murmúrio vesicular presente bilateralmente, com estertores crepitantes em base pulmonar direita e tiragem intercostal leve. SpO2: 97% em ar ambiente.\nAbdome: Flácido, indolor à palpação, sem visceromegalias, RHA presentes.\nOroscopia: Sem placas purulentas em amígdalas.',
    sv: {
      pa: paciente?.pa || '90x60',
      fc: paciente?.fc || '110',
      fr: paciente?.fr || '28',
      spo2: paciente?.spo2 || '97',
      temp: paciente?.temperatura || '39.2',
      dor: '2',
    },
    hipotese_diagnostica: 'J15.9 - Pneumonia bacteriana não especificada',
    conduta_inicial: 'Paciente admitido em leito de observação pediátrica da UPA 24h Breves. Iniciada antibioticoterapia parenteral (Ampicilina + Sulbactam EV), suporte de O2 sob cateter nasal SN, hidratação venosa e monitorização contínua. Solicitado Laudo de AIH para autorização de leito hospitalar.',
  });

  const [comorbidades, setComorbidades] = useState([
    'Asma Brônquica (CID J45.9)',
    'Rinite Alérgica (CID J30.4)',
  ]);

  useEffect(() => {
    carregar();
  }, [atendimento?.atendimento_id]);

  async function carregar() {
    setCarregando(true);
    const lista = await listarConsultas(atendimento?.atendimento_id);
    setHistorico(lista);
    if (lista && lista.length > 0) {
      const c = lista[0];
      setDados((prev) => ({
        ...prev,
        queixa_principal: c.queixa_principal || prev.queixa_principal,
        historia_doenca_atual: c.historia_doenca_atual || prev.historia_doenca_atual,
        antecedentes: c.antecedentes || prev.antecedentes,
        exame_geral: c.exame_geral || prev.exame_geral,
        hipotese_diagnostica: c.hipotese_diagnostica || prev.hipotese_diagnostica,
        conduta_inicial: c.conduta_inicial || prev.conduta_inicial,
      }));
    }
    setCarregando(false);
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function aplicarModelo(chave) {
    const mod = MODELOS[chave];
    if (!mod) return;
    setDados((prev) => ({
      ...prev,
      queixa_principal: mod.qp,
      historia_doenca_atual: mod.hda,
      exame_geral: mod.ef,
      hipotese_diagnostica: mod.cid,
      conduta_inicial: mod.conduta,
    }));
    setSucesso(`Modelo "${chave}" aplicado!`);
    setTimeout(() => setSucesso(''), 3000);
  }

  function removerComorbidade(index) {
    const nova = comorbidades.filter((_, i) => i !== index);
    setComorbidades(nova);
    set('antecedentes', nova.join('; '));
  }

  function adicionarComorbidade() {
    const nova = window.prompt('Digite a comorbidade e CID-10:', 'Hipertensão Arterial (CID I10)');
    if (nova && nova.trim()) {
      const atual = [...comorbidades, nova.trim()];
      setComorbidades(atual);
      set('antecedentes', atual.join('; '));
    }
  }

  async function salvar(imprimirApos = false) {
    if (!dados.queixa_principal.trim() || !dados.hipotese_diagnostica.trim()) {
      setErro('Preencha ao menos a queixa principal e a hipótese diagnóstica.');
      return;
    }
    setErro('');
    setSalvando(true);
    const { data: novaConsulta, error } = await criarConsulta({
      atendimentoId: atendimento?.atendimento_id,
      pessoaId: atendimento?.pessoa_id,
      medicoId,
      dados,
    });
    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar a consulta médica. Tente novamente.');
      return;
    }
    setSucesso('Consulta de Admissão salva com sucesso!');
    setTimeout(() => setSucesso(''), 4000);
    carregar();

    if (imprimirApos && novaConsulta) {
      onImprimir(novaConsulta);
    }
  }

  return (
    <div className="clinical-split">
      {/* LADO ESQUERDO: TRIAGEM E MODELOS RÁPIDOS */}
      <aside className="tools-pane">
        <div className="pane-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🩺</span> Triagem & Ferramentas
          </span>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>Recepção</span>
        </div>

        <div className="tools-body">
          <div className="triage-card">
            <h3>Sinais Vitais (Triagem na Admissão)</h3>
            <div className="vitals-grid">
              <div className="vital-box">
                <span>Pressão Arterial</span>
                <strong>{dados.sv.pa || '90x60'} mmHg</strong>
              </div>
              <div className="vital-box">
                <span>Freq. Cardíaca</span>
                <strong>{dados.sv.fc || '110'} bpm</strong>
              </div>
              <div className="vital-box alert">
                <span>Temperatura</span>
                <strong>{dados.sv.temp || '39.2'} °C</strong>
              </div>
              <div className="vital-box">
                <span>Saturação (O2)</span>
                <strong>{dados.sv.spo2 || '97'}% em AA</strong>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#475569', lineHeight: 1.3 }}>
              <strong>Queixa na Triagem:</strong> {paciente?.queixa_principal || 'Febre alta há 2 dias, tosse produtiva e cansaço leve. Recusa alimentar.'}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
              🪄 Modelos de Admissão
            </h3>
            <button
              type="button"
              className="template-btn"
              onClick={() => aplicarModelo('pediatria')}
            >
              <div>
                <strong>Pneumonia Pediátrica</strong>
                <span>Preenche HDA + EF completo</span>
              </div>
              <span style={{ color: '#1D4ED8', fontSize: 16 }}>+</span>
            </button>
            <button
              type="button"
              className="template-btn"
              onClick={() => aplicarModelo('bronquiolite')}
            >
              <div>
                <strong>Bronquiolite / Asma Grave</strong>
                <span>Cibrose, sibilos e oxigenoterapia</span>
              </div>
              <span style={{ color: '#1D4ED8', fontSize: 16 }}>+</span>
            </button>
            <button
              type="button"
              className="template-btn"
              onClick={() => aplicarModelo('desidratacao')}
            >
              <div>
                <strong>Gastroenterite + Desidratação</strong>
                <span>Vômitos, diarreia e hidratação EV</span>
              </div>
              <span style={{ color: '#1D4ED8', fontSize: 16 }}>+</span>
            </button>
          </div>

          {/* Histórico compacto */}
          {carregando ? (
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>Carregando consultas...</div>
          ) : historico.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
              <h3 style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                📋 Consultas Registradas ({historico.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {historico.map((h) => (
                  <div key={h.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 8px', fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.hipotese_diagnostica || 'Consulta'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, color: '#64748B', fontSize: 10 }}>
                      <span>{new Date(h.criado_em).toLocaleDateString('pt-BR')}</span>
                      <button
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        onClick={() => onImprimir(h)}
                      >
                        🖨️ Imprimir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* LADO DIREITO: FICHA DE ADMISSÃO MÉDICA */}
      <div className="clinical-card">
        <div className="cc-header">
          <div className="cc-header-info">
            <h2>
              <span>🩺</span> Ficha de Consulta e Admissão Médica
            </h2>
            <span>
              Documento Oficial: Consulta / Admissão Médica (Modelo 10) &bull; UPA 24H BREVES (CNES 0296796)
            </span>
          </div>
        </div>

        <div className="cc-body">
          {erro && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <span>⚠️ {erro}</span>
              </div>
            </div>
          )}

          {sucesso && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="info" style={{ color: '#166534' }}>
                <span>✓ {sucesso}</span>
              </div>
            </div>
          )}

          {/* ALERTA DE ALERGIA */}
          <div className="allergy-alert">
            <div className="info">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span>ALERGIA GRAVE REGISTRADA: {paciente?.alergias_obs || 'DIPIRONA (Risco de Choque Anafilático)'}</span>
            </div>
          </div>

          {/* BLOCO 1: MOTIVO DA CONSULTA E HDA */}
          <div className="form-section-box">
            <div className="form-section-box-title">
              <span>💬</span> 1. Motivo da Consulta e HDA
            </div>

            <div className="form-group" style={{ marginBottom: 12, marginTop: 6 }}>
              <label>
                Queixa Principal (QP) *
                <span className="badge-manual">Preenchimento Clínico</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Febre alta e tosse há 3 dias"
                value={dados.queixa_principal}
                onChange={(e) => set('queixa_principal', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                História da Doença Atual (HDA)
                <span className="badge-auto">Passagem Automática para AIH</span>
              </label>
              <textarea
                rows={4}
                placeholder="Descreva a evolução cronológica dos sintomas..."
                value={dados.historia_doenca_atual}
                onChange={(e) => set('historia_doenca_atual', e.target.value)}
              />
            </div>
          </div>

          {/* BLOCO 2: ANTECEDENTES E COMORBIDADES */}
          <div className="form-section-box">
            <div className="form-section-box-title">
              <span>📁</span> 2. Antecedentes e Comorbidades
            </div>

            <div className="form-group" style={{ marginTop: 6 }}>
              <label>
                Comorbidades / Diagnósticos Secundários
                <span className="badge-auto">Passa para CIDs Secundários da AIH</span>
              </label>
              <div className="chip-container">
                {comorbidades.map((c, i) => (
                  <span key={i} className="chip">
                    {c}
                    <span className="chip-close" onClick={() => removerComorbidade(i)}>×</span>
                  </span>
                ))}
                <button
                  type="button"
                  className="btn-add-chip"
                  onClick={adicionarComorbidade}
                >
                  + Adicionar CID Comorbidade
                </button>
              </div>
            </div>
          </div>

          {/* BLOCO 3: EXAME FÍSICO */}
          <div className="form-section-box">
            <div className="form-section-box-title">
              <span>👤</span> 3. Exame Físico da Admissão
            </div>

            <div className="form-group" style={{ marginTop: 6 }}>
              <label>
                Achados do Exame Físico
                <span className="badge-auto">Sincroniza com Justificativa da AIH</span>
              </label>
              <textarea
                rows={5}
                placeholder="Geral, ACV, AR, Abdome..."
                value={dados.exame_geral}
                onChange={(e) => set('exame_geral', e.target.value)}
              />
            </div>
          </div>

          {/* BLOCO 4: HIPÓTESE DIAGNÓSTICA E CONDUTA */}
          <div className="form-section-box">
            <div className="form-section-box-title">
              <span>🧠</span> 4. Conclusão, Hipótese Diagnóstica & Conduta
            </div>

            <div className="form-group" style={{ marginTop: 6, marginBottom: 12 }}>
              <label>
                Hipótese Diagnóstica Principal (CID-10) *
                <span className="badge-auto">Passagem Automática para AIH</span>
              </label>
              <input
                type="text"
                style={{ fontWeight: 700, color: '#1D4ED8' }}
                value={dados.hipotese_diagnostica}
                onChange={(e) => set('hipotese_diagnostica', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Conduta Inicial de Admissão Médica</label>
              <textarea
                rows={3}
                placeholder="Ex: Internação em leito de observação pediátrica, prescrição..."
                value={dados.conduta_inicial}
                onChange={(e) => set('conduta_inicial', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RODAPÉ DINÂMICO */}
        <div className="cc-footer">
          <div>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => onIrParaAih && onIrParaAih()}
            >
              ✕ Cancelar
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-save-draft"
              onClick={() => salvar(false)}
              disabled={salvando}
            >
              💾 {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="btn-save-print"
              onClick={() => salvar(true)}
              disabled={salvando}
            >
              🖨️ {salvando ? 'Salvando...' : 'Salvar e Imprimir Admissão'}
            </button>
            {onIrParaAih && (
              <button
                type="button"
                className="btn-next-tab"
                onClick={onIrParaAih}
              >
                Ir para Laudo de AIH →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
