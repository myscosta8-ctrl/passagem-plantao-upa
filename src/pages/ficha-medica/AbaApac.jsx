import { useEffect, useState } from 'react';
import { listarApac, criarApac } from '../../lib/pepMedico';

const APAC_VAZIA = {
  // Estabelecimento (1 e 2)
  estabelecimento_solicitante_nome: 'UPA 24 HORAS BREVES',
  estabelecimento_solicitante_cnes: '0296796',

  // Paciente (3 a 14)
  paciente_nome: '',
  prontuario_numero: '',
  paciente_cns: '',
  data_nascimento: '',
  sexo: 'M',
  nome_mae: '',
  telefone: '',
  endereco: '',
  municipio: 'BREVES',
  ibge_municipio: '1501808',
  uf: 'PA',
  cep: '68800-000',

  // Procedimento Principal (15 a 17)
  procedimento_codigo: '',
  procedimento_nome: '',
  quantidade: '1',

  // Procedimentos Secundários opcionais (18 a 32)
  procedimento_secundario_1_cod: '',
  procedimento_secundario_1_nome: '',
  procedimento_secundario_1_qtd: '',
  procedimento_secundario_2_cod: '',
  procedimento_secundario_2_nome: '',
  procedimento_secundario_2_qtd: '',

  // Justificativa e Diagnóstico (33 a 37)
  descricao_diagnostico: '',
  cid_principal: '',
  cid_secundario: '',
  cid_causas_associadas: '',
  justificativa: '',

  // Profissional Solicitante (38 a 42)
  profissional_solicitante_nome: '',
  data_solicitacao: new Date().toISOString().slice(0, 10),
  profissional_documento_tipo: 'CNS',
  profissional_documento_numero: '',
  profissional_crm: '',

  // Autorização (43 a 50)
  autorizador_nome: '',
  autorizador_codigo_orgao_emissor: '',
  autorizador_documento_tipo: 'CNS',
  autorizador_documento_numero: '',
  data_autorizacao: '',
  numero_autorizacao: '',
  validade_inicio: '',
  validade_fim: '',

  // Executante (51 e 52)
  executante_nome: 'CENTRO DE DIAGNÓSTICO POR IMAGEM / REDE REGULADA SUS',
  executante_cnes: '',
};

export default function AbaApac({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState(APAC_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    carregar();
    inicializarComDadosAtendimento();
  }, [atendimento?.atendimento_id]);

  async function carregar() {
    setCarregando(true);
    const lista = await listarApac(atendimento.atendimento_id);
    setHistorico(lista);
    setCarregando(false);
  }

  function inicializarComDadosAtendimento() {
    if (!atendimento) return;
    const p = atendimento.pessoa || atendimento.paciente || {};
    setDados((prev) => ({
      ...prev,
      paciente_nome: p.nome || prev.paciente_nome,
      prontuario_numero: (p.prontuario_numero || atendimento.numero_atendimento || '').replace(/\D/g, ''),
      paciente_cns: (p.cns || '').replace(/\D/g, ''),
      data_nascimento: p.data_nascimento ? p.data_nascimento.slice(0, 10) : prev.data_nascimento,
      sexo: p.sexo || prev.sexo,
      nome_mae: p.nome_mae || prev.nome_mae,
      telefone: p.telefone || prev.telefone,
      endereco: [p.endereco, p.endereco_numero, p.bairro].filter(Boolean).join(', ') || prev.endereco,
      municipio: p.municipio || prev.municipio,
      ibge_municipio: p.ibge_municipio || prev.ibge_municipio,
      uf: p.uf || prev.uf,
      cep: (p.cep || prev.cep).replace(/\D/g, ''),
      profissional_solicitante_nome: prev.profissional_solicitante_nome || 'DR. MARCELO FONTES DA SILVA',
      profissional_documento_numero: prev.profissional_documento_numero || '700123456789012',
      profissional_crm: prev.profissional_crm || 'CRM/PA 12345',
    }));
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function aplicarComboUsg() {
    setDados((prev) => ({
      ...prev,
      procedimento_codigo: '02.05.02.004-6',
      procedimento_nome: 'ULTRASSONOGRAFIA DE ABDOME TOTAL',
      quantidade: '1',
      descricao_diagnostico: 'INSUFICIÊNCIA RENAL AGUDA E DOR ABDOMINAL AGUDA A ESCLARECER',
      cid_principal: 'N17.9',
      cid_secundario: 'R10.4',
      justificativa:
        'PACIENTE APRESENTANDO QUADRO DE INSUFICIÊNCIA RENAL AGUDA COM OLIGÚRIA PERSISTENTE, DOR ABDOMINAL EM FLANCOS E FOSSA ILÍACA, ASSOCIADO A ELEVAÇÃO EXPRESSIVA DE ESCÓRIAS NITROGENADAS (UREIA: 142 mg/dL, CREATININA: 3.4 mg/dL). SOLICITA-SE ULTRASSONOGRAFIA DE ABDOME TOTAL EM CARÁTER DE REGULAÇÃO AMBULATORIAL / URGÊNCIA PARA AVALIAÇÃO DE PARÊNQUIMA RENAL, EXCLUSÃO DE UROPATIA OBSTRUTIVA (HIDRONEFROSE) E OUTRAS CAUSAS DE ABDOME AGUDO. PACIENTE SOB VIGILÂNCIA NA UPA 24H BREVES AGUARDANDO LIBERAÇÃO DO EXAME REGULADO.',
    }));
  }

  async function salvar(imprimir = false) {
    if (!dados.procedimento_nome.trim() || !dados.justificativa.trim()) {
      setErro('Preencha ao menos o procedimento principal e a justificativa clínica oficial.');
      return;
    }
    setErro('');
    setSucesso('');
    setSalvando(true);

    const payload = {
      atendimentoId: atendimento.atendimento_id,
      solicitanteId: medicoId,
      dados: {
        procedimento_nome: dados.procedimento_nome,
        procedimento_codigo: dados.procedimento_codigo,
        quantidade: dados.quantidade ? Number(dados.quantidade) : 1,
        cid_principal: dados.cid_principal || null,
        cid_secundario: dados.cid_secundario || null,
        justificativa: dados.justificativa,
        numero_autorizacao: dados.numero_autorizacao || null,
        validade_inicio: dados.validade_inicio || null,
        validade_fim: dados.validade_fim || null,
        campos_formulario: dados,
      },
    };

    const { data: apacCriada, error } = await criarApac(payload);
    setSalvando(false);

    if (error) {
      console.error(error);
      setErro('Não foi possível registrar a APAC no sistema. Verifique os dados e tente novamente.');
      return;
    }

    setSucesso('Solicitação de APAC registrada com sucesso!');
    localStorage.setItem('requisicao_apac_dados', JSON.stringify(dados));

    if (imprimir) {
      // Dispara impressão pelo modelo 18 oficial em HTML
      window.open('./modelos_impressao_html/18-laudo-apac-procedimento-ambulatorial.html', '_blank');
      if (onImprimir && apacCriada) {
        onImprimir({ ...apacCriada, tipo: 'apac' });
      }
    }

    carregar();
  }

  function descartar() {
    if (window.confirm('Deseja realmente limpar todos os campos do formulário APAC?')) {
      setDados(APAC_VAZIA);
      inicializarComDadosAtendimento();
      setErro('');
      setSucesso('');
    }
  }

  return (
    <div className="clinical-card">
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-clipboard-text" /> Laudo para Solicitação / Autorização de Procedimento Ambulatorial (APAC)</h2>
          <p>Formulário oficial SUS (52 campos) · Modelo 18 · Destinado à Regulação Externa / Exames Especializados</p>
        </div>
        <button
          type="button"
          className="btn-add-chip"
          onClick={aplicarComboUsg}
        >
          <i className="ph ph-lightning" /> Preencher APAC - USG Total (Exemplo Oficial)
        </button>
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
        <div className="allergy-alert" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <div className="info" style={{ color: '#065F46' }}>
            <i className="ph ph-check-circle" /> {sucesso}
          </div>
        </div>
      )}

      {/* SEÇÃO 1: ESTABELECIMENTO SOLICITANTE (CAMPOS 1 E 2) */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          1. Identificação do Estabelecimento de Saúde Solicitante (Campos 1 e 2)
        </div>
        <div className="form-grid">
          <div className="form-field span-3">
            <label>1 - Nome do Estabelecimento de Saúde Solicitante *</label>
            <input
              type="text"
              value={dados.estabelecimento_solicitante_nome}
              onChange={(e) => set('estabelecimento_solicitante_nome', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>2 - CNES Solicitante *</label>
            <input
              type="text"
              value={dados.estabelecimento_solicitante_cnes}
              onChange={(e) => set('estabelecimento_solicitante_cnes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: IDENTIFICAÇÃO DO PACIENTE (CAMPOS 3 A 14) */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          2. Identificação do Paciente (Campos 3 a 14)
        </div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>3 - Nome Completo do Paciente *</label>
            <input
              type="text"
              value={dados.paciente_nome}
              onChange={(e) => set('paciente_nome', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>4 - Nº do Prontuário</label>
            <input
              type="text"
              value={dados.prontuario_numero}
              onChange={(e) => set('prontuario_numero', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>5 - Cartão Nacional de Saúde (CNS) *</label>
            <input
              type="text"
              value={dados.paciente_cns}
              onChange={(e) => set('paciente_cns', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>6 - Data de Nascimento</label>
            <input
              type="date"
              value={dados.data_nascimento}
              onChange={(e) => set('data_nascimento', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>7 - Sexo</label>
            <select value={dados.sexo} onChange={(e) => set('sexo', e.target.value)}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          <div className="form-field span-2">
            <label>8 - Nome da Mãe ou Responsável</label>
            <input
              type="text"
              value={dados.nome_mae}
              onChange={(e) => set('nome_mae', e.target.value)}
            />
          </div>

          <div className="form-field span-2">
            <label>9 - Telefone de Contato</label>
            <input
              type="text"
              value={dados.telefone}
              onChange={(e) => set('telefone', e.target.value)}
              placeholder="(91) 98000-0000"
            />
          </div>
          <div className="form-field span-2">
            <label>10 - Endereço Completo (Rua, Nº, Bairro)</label>
            <input
              type="text"
              value={dados.endereco}
              onChange={(e) => set('endereco', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>11 - Município de Residência</label>
            <input
              type="text"
              value={dados.municipio}
              onChange={(e) => set('municipio', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>12 - Cód. IBGE Município</label>
            <input
              type="text"
              value={dados.ibge_municipio}
              onChange={(e) => set('ibge_municipio', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>13 - UF</label>
            <input
              type="text"
              value={dados.uf}
              onChange={(e) => set('uf', e.target.value)}
              maxLength={2}
            />
          </div>
          <div className="form-field">
            <label>14 - CEP</label>
            <input
              type="text"
              value={dados.cep}
              onChange={(e) => set('cep', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: PROCEDIMENTO SOLICITADO (CAMPOS 15 A 32) */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          3. Procedimento Principal e Secundários Solicitados (Campos 15 a 32)
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>15 - Código do Procedimento (SIGTAP) *</label>
            <input
              type="text"
              value={dados.procedimento_codigo}
              onChange={(e) => set('procedimento_codigo', e.target.value)}
              placeholder="ex: 02.05.02.004-6"
            />
          </div>
          <div className="form-field span-2">
            <label>16 - Nome do Procedimento Principal *</label>
            <input
              type="text"
              value={dados.procedimento_nome}
              onChange={(e) => set('procedimento_nome', e.target.value)}
              placeholder="ex: ULTRASSONOGRAFIA DE ABDOME TOTAL"
            />
          </div>
          <div className="form-field">
            <label>17 - Quantidade *</label>
            <input
              type="number"
              min="1"
              value={dados.quantidade}
              onChange={(e) => set('quantidade', e.target.value)}
            />
          </div>

          {/* Secundário 1 opcional */}
          <div className="form-field">
            <label>18 - Código Secundário 1</label>
            <input
              type="text"
              value={dados.procedimento_secundario_1_cod}
              onChange={(e) => set('procedimento_secundario_1_cod', e.target.value)}
            />
          </div>
          <div className="form-field span-2">
            <label>19 - Nome do Procedimento Secundário 1</label>
            <input
              type="text"
              value={dados.procedimento_secundario_1_nome}
              onChange={(e) => set('procedimento_secundario_1_nome', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>20 - Qtd Sec. 1</label>
            <input
              type="number"
              value={dados.procedimento_secundario_1_qtd}
              onChange={(e) => set('procedimento_secundario_1_qtd', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: JUSTIFICATIVA DO(S) PROCEDIMENTO(S) (CAMPOS 33 A 37) */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          4. Justificativa e Diagnóstico Clínico (Campos 33 a 37)
        </div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>33 - Descrição do Diagnóstico *</label>
            <input
              type="text"
              value={dados.descricao_diagnostico}
              onChange={(e) => set('descricao_diagnostico', e.target.value)}
              placeholder="ex: INSUFICIÊNCIA RENAL AGUDA E DOR ABDOMINAL AGUDA A ESCLARECER"
            />
          </div>
          <div className="form-field">
            <label>34 - CID-10 Principal</label>
            <input
              type="text"
              value={dados.cid_principal}
              onChange={(e) => set('cid_principal', e.target.value.toUpperCase())}
              placeholder="ex: N17.9"
            />
          </div>
          <div className="form-field">
            <label>35 - CID-10 Secundário</label>
            <input
              type="text"
              value={dados.cid_secundario}
              onChange={(e) => set('cid_secundario', e.target.value.toUpperCase())}
              placeholder="ex: R10.4"
            />
          </div>

          <div className="form-field span-4">
            <label>37 - Histórico / Justificativa Clínica Oficial (Campo Obrigatório SUS) *</label>
            <textarea
              rows={4}
              value={dados.justificativa}
              onChange={(e) => set('justificativa', e.target.value)}
              placeholder="Descreva detalhadamente o quadro clínico, parâmetros de gravidade, indicação do exame e necessidade de regulação ambulatorial..."
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 5: PROFISSIONAL SOLICITANTE (CAMPOS 38 A 42) */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          5. Profissional Solicitante (Campos 38 a 42)
        </div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>38 - Nome do Profissional Solicitante</label>
            <input
              type="text"
              value={dados.profissional_solicitante_nome}
              onChange={(e) => set('profissional_solicitante_nome', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>39 - Data da Solicitação</label>
            <input
              type="date"
              value={dados.data_solicitacao}
              onChange={(e) => set('data_solicitacao', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>41 - Documento Profissional (CNS / CPF)</label>
            <input
              type="text"
              value={dados.profissional_documento_numero}
              onChange={(e) => set('profissional_documento_numero', e.target.value)}
            />
          </div>
          <div className="form-field span-2">
            <label>42 - Registro do Conselho (CRM / UF)</label>
            <input
              type="text"
              value={dados.profissional_crm}
              onChange={(e) => set('profissional_crm', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 6 E 7: AUTORIZAÇÃO & ESTABELECIMENTO EXECUTANTE (CAMPOS 43 A 52) */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          6 e 7. Autorização e Estabelecimento Executante (Regulação SUS / Campos 43 a 52)
        </div>
        <div className="form-grid">
          <div className="form-field span-2">
            <label>49 - Nº da Autorização (APAC) (Quando emitido pela regulação)</label>
            <input
              type="text"
              value={dados.numero_autorizacao}
              onChange={(e) => set('numero_autorizacao', e.target.value)}
              placeholder="ex: 1526001234567"
            />
          </div>
          <div className="form-field">
            <label>50 - Validade Início</label>
            <input
              type="date"
              value={dados.validade_inicio}
              onChange={(e) => set('validade_inicio', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>50 - Validade Fim</label>
            <input
              type="date"
              value={dados.validade_fim}
              onChange={(e) => set('validade_fim', e.target.value)}
            />
          </div>

          <div className="form-field span-3">
            <label>51 - Nome Fantasia do Estabelecimento Executante</label>
            <input
              type="text"
              value={dados.executante_nome}
              onChange={(e) => set('executante_nome', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>52 - CNES Executante</label>
            <input
              type="text"
              value={dados.executante_cnes}
              onChange={(e) => set('executante_cnes', e.target.value)}
              placeholder="ex: 2012345"
            />
          </div>
        </div>
      </div>

      {/* HISTÓRICO DE SOLICITAÇÕES APAC */}
      <div className="form-section-box">
        <div className="form-section-box-title">
          <i className="ph ph-clock-counter-clockwise" /> Histórico de Solicitações de APAC deste Atendimento
        </div>

        {carregando ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhuma solicitação de APAC registrada anteriormente para este atendimento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historico.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '10px 14px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    {a.procedimento_nome} {a.procedimento_codigo ? `(${a.procedimento_codigo})` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    Solicitado por: <strong>{a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome || 'Médico'}</strong> · {new Date(a.solicitado_em).toLocaleString('pt-BR')}
                    {a.numero_autorizacao && ` · Autorização: ${a.numero_autorizacao}`}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-add-chip"
                  onClick={() => {
                    localStorage.setItem('requisicao_apac_dados', JSON.stringify({
                      ...dados,
                      procedimento_nome: a.procedimento_nome,
                      procedimento_codigo: a.procedimento_codigo,
                      quantidade: a.quantidade,
                      cid_principal: a.cid_principal,
                      cid_secundario: a.cid_secundario,
                      justificativa: a.justificativa,
                      numero_autorizacao: a.numero_autorizacao,
                      ...a.campos_formulario,
                    }));
                    window.open('./modelos_impressao_html/18-laudo-apac-procedimento-ambulatorial.html', '_blank');
                    if (onImprimir) onImprimir({ ...a, tipo: 'apac' });
                  }}
                >
                  <i className="ph ph-printer" /> Imprimir Modelo 18
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="cc-footer">
        <button type="button" className="btn-cancel" onClick={descartar} disabled={salvando}>
          <i className="ph ph-trash" /> Descartar / Limpar
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
            <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar & Imprimir Laudo APAC (Modelo 18)'}
          </button>
        </div>
      </div>
    </div>
  );
}
