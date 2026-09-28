import { useEffect, useState } from 'react';
import { listarApac, criarApac, buscarCabecalhoImpressao } from '../../lib/pepMedico';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { metaDoc } from '../../lib/documentos';
import { useRascunho } from '../../hooks/useRascunho';
import BotaoInvalidar, { SeloSituacao } from '../../components/InvalidarDocumento';

// Laudo para Solicitação/Autorização de Procedimento Ambulatorial (APAC) —
// documento oficial do Ministério da Saúde, impresso 18-laudo-apac-procedimento-ambulatorial.html.
// Todos os 52 campos do laudo estão aqui; os que vêm do cadastro são pré-preenchidos
// com os dados reais do paciente e do médico logado, e podem ser corrigidos.
const SECUNDARIOS = [1, 2, 3, 4, 5]; // campos 18-20, 21-23, 24-26, 27-29, 30-32

const APAC_VAZIA = {
  // 1-2 Estabelecimento solicitante
  estabelecimento_solicitante_nome: 'UPA 24 HORAS BREVES',
  estabelecimento_solicitante_cnes: '0296796',
  // 3-14 Paciente
  paciente_nome: '', prontuario_numero: '', paciente_cns: '', data_nascimento: '', sexo: '',
  nome_mae: '', telefone: '', endereco: '', municipio: '', ibge_municipio: '', uf: '', cep: '',
  // 15-17 Procedimento principal
  procedimento_codigo: '', procedimento_nome: '', quantidade: '1',
  // 18-32 Procedimentos secundários
  ...Object.fromEntries(SECUNDARIOS.flatMap((n) => [
    [`procedimento_secundario_${n}_cod`, ''], [`procedimento_secundario_${n}_nome`, ''], [`procedimento_secundario_${n}_qtd`, ''],
  ])),
  // 33-37 Justificativa
  descricao_diagnostico: '', cid_principal: '', cid_secundario: '', cid_causas_associadas: '', justificativa: '',
  // 38-42 Solicitação
  profissional_solicitante_nome: '', data_solicitacao: new Date().toISOString().slice(0, 10),
  profissional_documento_tipo: 'CNS', profissional_documento_numero: '', profissional_crm: '',
  // 43-50 Autorização
  autorizador_nome: '', autorizador_codigo_orgao_emissor: '', autorizador_documento_tipo: '', autorizador_documento_numero: '',
  data_autorizacao: '', numero_autorizacao: '', validade_inicio: '', validade_fim: '',
  // 51-52 Estabelecimento executante
  executante_nome: '', executante_cnes: '',
};

const soDigitos = (v) => String(v || '').replace(/\D/g, '');

export default function AbaApac({ atendimento, medicoId, medicoNome, medicoCrm, onImprimir, onFechar, rotuloFechar = 'Cancelar' }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState(APAC_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const rascunho = useRascunho({ tabela: 'apac_solicitacoes', atendimentoId: atendimento?.atendimento_id, autorId: medicoId, campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setSucesso('Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.') });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => { carregar(); preencherDoCadastro(); }, [atendimento?.atendimento_id]);

  async function carregar() {
    setCarregando(true);
    setHistorico(await listarApac(atendimento.atendimento_id));
    setCarregando(false);
  }

  async function preencherDoCadastro() {
    const base = { ...APAC_VAZIA, profissional_solicitante_nome: medicoNome || '', profissional_crm: medicoCrm ? `CRM ${medicoCrm}` : '' };
    try {
      // O proxy local às vezes devolve 502; tenta de novo antes de desistir.
      const cab = await buscarCabecalhoImpressao(atendimento.atendimento_id)
        .catch(() => new Promise((r) => setTimeout(r, 1500)).then(() => buscarCabecalhoImpressao(atendimento.atendimento_id)));
      const { pessoa: p, atendimento: a } = cab;
      setDados({
        ...base,
        paciente_nome: p?.nome || '',
        prontuario_numero: p?.prontuario_numero || a?.numero_atendimento || '',
        paciente_cns: soDigitos(p?.cns),
        data_nascimento: p?.data_nascimento ? p.data_nascimento.slice(0, 10) : '',
        sexo: ['M', 'F'].includes(String(p?.sexo || '').charAt(0).toUpperCase()) ? String(p.sexo).charAt(0).toUpperCase() : '',
        nome_mae: p?.nome_mae || '',
        telefone: p?.telefone || p?.telefone_contato || '',
        endereco: [p?.endereco, p?.endereco_numero, p?.bairro].filter(Boolean).join(', '),
        municipio: p?.cidade || '',
        ibge_municipio: p?.municipio_ibge || '',
        uf: p?.uf || '',
        cep: soDigitos(p?.cep),
      });
    } catch {
      setDados(base);
    }
  }

  const set = (campo, valor) => setDados((prev) => ({ ...prev, [campo]: valor }));

  async function salvar(imprimir = false) {
    if (!dados.procedimento_nome.trim() || !dados.justificativa.trim()) {
      setErro('Preencha ao menos o procedimento principal (16) e a justificativa clínica (37).');
      return;
    }
    setErro(''); setSucesso(''); setSalvando(true);
    const { data, error } = await criarApac({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id,
      solicitanteId: medicoId,
      dados: {
        procedimento_nome: dados.procedimento_nome,
        procedimento_codigo: dados.procedimento_codigo || null,
        quantidade: dados.quantidade ? Number(dados.quantidade) : 1,
        cid_principal: dados.cid_principal || null,
        cid_secundario: dados.cid_secundario || null,
        justificativa: dados.justificativa,
        numero_autorizacao: dados.numero_autorizacao || null,
        validade_inicio: dados.validade_inicio || null,
        validade_fim: dados.validade_fim || null,
        campos_formulario: dados,
      },
    });
    setSalvando(false);
    if (error) { console.error(error); setErro('Não foi possível registrar a APAC. Verifique os dados e tente novamente.'); return; }
    setEditandoId(imprimir ? null : (data?.id ?? null));
    if (!imprimir) { setSucesso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); carregar(); return; }
    setSucesso('Laudo de APAC registrado.');
    if (imprimir && data) onImprimir?.(data);
    carregar();
  }

  const input = (k, rotulo, props = {}) => (
    <div className="form-group" style={props.span ? { gridColumn: `span ${props.span}` } : undefined}>
      <label>{rotulo}</label>
      <input
        type={props.type || 'text'}
        value={dados[k]}
        placeholder={props.ph || ''}
        readOnly={props.readOnly}
        onChange={(e) => set(k, props.upper ? e.target.value.toUpperCase() : e.target.value)}
      />
    </div>
  );
  const docTipo = (k, rotulo) => (
    <div className="form-group">
      <label>{rotulo}</label>
      <div style={{ display: 'flex', gap: 6 }}>
        {['CNS', 'CPF'].map((t) => (
          <button key={t} type="button" className={'btn-add-chip' + (dados[k] === t ? ' on' : '')} onClick={() => set(k, dados[k] === t ? '' : t)}>{t}</button>
        ))}
      </div>
    </div>
  );
  const secao = (icone, titulo, conteudo) => (
    <div className="form-section-box">
      <div className="form-section-box-title"><i className={'ph ' + icone} /> {titulo}</div>
      {conteudo}
    </div>
  );
  const grade = (cols, filhos, mt) => <div className="assess-grid" style={{ gridTemplateColumns: cols, marginTop: mt ? 12 : 0 }}>{filhos}</div>;

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title">
          <h2><i className="ph ph-file-text" /> Laudo para Solicitação / Autorização de Procedimento Ambulatorial (APAC)</h2>
          
        </div>
      </div>

      <div className="cc-body">
        {secao('ph-buildings', 'Identificação do Estabelecimento de Saúde (Solicitante) — Campos 1 e 2', grade('3fr 1fr', <>
          {input('estabelecimento_solicitante_nome', '1 - Nome do estabelecimento de saúde')}
          {input('estabelecimento_solicitante_cnes', '2 - CNES')}
        </>))}

        {secao('ph-user', 'Identificação do Paciente — Campos 3 a 14', <>
          {grade('3fr 1fr 1.4fr', <>
            {input('paciente_nome', '3 - Nome do paciente', { upper: true })}
            {input('prontuario_numero', '4 - Nº do prontuário')}
            {input('paciente_cns', '5 - Cartão Nacional de Saúde (CNS)')}
          </>)}
          {grade('1fr 1fr 2.4fr 1.4fr', <>
            {input('data_nascimento', '6 - Data de nascimento', { type: 'date' })}
            <div className="form-group"><label>7 - Sexo</label>
              <select value={dados.sexo} onChange={(e) => set('sexo', e.target.value)}>
                <option value="">—</option><option value="M">Masculino</option><option value="F">Feminino</option>
              </select>
            </div>
            {input('nome_mae', '8 - Nome da mãe ou responsável', { upper: true })}
            {input('telefone', '9 - Telefone de contato')}
          </>, true)}
          {grade('2.6fr 1.4fr 1fr 0.6fr 1fr', <>
            {input('endereco', '10 - Endereço (rua, nº, bairro)')}
            {input('municipio', '11 - Município de residência', { upper: true })}
            {input('ibge_municipio', '12 - Cód. IBGE município')}
            {input('uf', '13 - UF', { upper: true })}
            {input('cep', '14 - CEP')}
          </>, true)}
        </>)}

        {secao('ph-list-numbers', 'Procedimento Solicitado — Campos 15 a 32', <>
          {grade('1.2fr 3fr 0.6fr', <>
            {input('procedimento_codigo', '15 - Código (SIGTAP) *', { ph: 'Ex: 02.05.02.004-6' })}
            {input('procedimento_nome', '16 - Nome do procedimento principal *', { upper: true })}
            {input('quantidade', '17 - Qte *', { type: 'number' })}
          </>)}
          {SECUNDARIOS.map((n) => {
            const c = 18 + (n - 1) * 3;
            return (
              <div key={n}>
                {grade('1.2fr 3fr 0.6fr', <>
                  {input(`procedimento_secundario_${n}_cod`, `${c} - Código (secundário ${n})`)}
                  {input(`procedimento_secundario_${n}_nome`, `${c + 1} - Nome do procedimento secundário ${n}`, { upper: true })}
                  {input(`procedimento_secundario_${n}_qtd`, `${c + 2} - Qte`, { type: 'number' })}
                </>, true)}
              </div>
            );
          })}
        </>)}

        {secao('ph-clipboard-text', 'Justificativa do(s) Procedimento(s) Solicitado(s) — Campos 33 a 37', <>
          {grade('2.4fr 1fr 1fr 1fr', <>
            {input('descricao_diagnostico', '33 - Descrição do diagnóstico', { upper: true })}
            {input('cid_principal', '34 - CID-10 principal', { upper: true })}
            {input('cid_secundario', '35 - CID-10 secundário', { upper: true })}
            {input('cid_causas_associadas', '36 - CID-10 causas associadas', { upper: true })}
          </>)}
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>37 - Histórico / justificativa clínica *</label>
            <textarea className="form-control-area" rows="5" value={dados.justificativa} onChange={(e) => set('justificativa', e.target.value)} />
          </div>
        </>)}

        {secao('ph-stethoscope', 'Solicitação — Campos 38 a 42', grade('2.2fr 1fr 0.9fr 1.4fr 1.2fr', <>
          {input('profissional_solicitante_nome', '38 - Nome do profissional solicitante', { upper: true })}
          {input('data_solicitacao', '39 - Data', { type: 'date' })}
          {docTipo('profissional_documento_tipo', '40 - Documento')}
          {input('profissional_documento_numero', '41 - Nº documento (CNS/CPF) do solicitante')}
          {input('profissional_crm', '42 - Registro no conselho (CRM/UF)')}
        </>))}

        {secao('ph-seal-check', 'Autorização — Campos 43 a 50 (preenchido pela regulação)', <>
          {grade('2.2fr 1fr 0.9fr 1.4fr', <>
            {input('autorizador_nome', '43 - Nome do profissional autorizador', { upper: true })}
            {input('autorizador_codigo_orgao_emissor', '44 - Cód. órgão emissor')}
            {docTipo('autorizador_documento_tipo', '45 - Documento')}
            {input('autorizador_documento_numero', '46 - Nº documento do autorizador')}
          </>)}
          {grade('1fr 1.6fr 1fr 1fr', <>
            {input('data_autorizacao', '47 - Data da autorização', { type: 'date' })}
            {input('numero_autorizacao', '49 - Nº da autorização (APAC)')}
            {input('validade_inicio', '50 - Validade: início', { type: 'date' })}
            {input('validade_fim', '50 - Validade: fim', { type: 'date' })}
          </>, true)}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0' }}>48 - Assinatura e carimbo do autorizador: no documento impresso.</p>
        </>)}

        {secao('ph-hospital', 'Identificação do Estabelecimento de Saúde (Executante) — Campos 51 e 52', grade('3fr 1fr', <>
          {input('executante_nome', '51 - Nome fantasia do estabelecimento', { upper: true })}
          {input('executante_cnes', '52 - CNES')}
        </>))}

        {erro && (
          <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
            <div className="info" style={{ color: '#DC2626' }}><i className="ph ph-warning" /> {erro}</div>
          </div>
        )}
        {sucesso && (
          <div className="allergy-alert" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
            <div className="info" style={{ color: '#065F46' }}><i className="ph ph-check-circle" /> {sucesso}</div>
          </div>
        )}

        <div>
          <div className="form-section-box-title" style={{ position: 'static', marginBottom: 8 }}><i className="ph ph-clock-counter-clockwise" /> Histórico de APAC</div>
          {carregando ? <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Carregando...</p> : historico.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhuma APAC registrada ainda.</p>
          ) : historico.map((a) => (
            <div key={a.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0', fontSize: 12.5, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.procedimento_codigo ? `${a.procedimento_codigo} — ` : ''}{a.procedimento_nome}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(a.criado_em).toLocaleString('pt-BR')}{a.numero_autorizacao ? ` · APAC nº ${a.numero_autorizacao}` : ''}</div>
              </div>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}><SeloSituacao registro={a} /><BotaoInvalidar tabela="apac_solicitacoes" registro={a} meuId={medicoId} onFeito={carregar} /></span>
              <button type="button" className="btn-save-draft" onClick={() => onImprimir?.(a)}><i className="ph ph-printer" /> Imprimir</button>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-footer">
        <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> {rotuloFechar}</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
        </div>
      </div>
    </div>
  );
}
