import { useEffect, useState } from 'react';
import { buscarOcupacaoAtiva, listarTransferenciasSbar, registrarTransferenciaSbar, listarAlergias, listarSinaisVitais } from '../../lib/pepClinico';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { metaDoc } from '../../lib/documentos';
import { useRascunho } from '../../hooks/useRascunho';

// Transferência Estruturada do Paciente (SBAR) — mockups-fase2/14-transferencia-paciente-design.html,
// impresso modelos_impressao_html/03-transferencia-paciente-sbar.html.
// Colunas próprias: impressao_diagnostica (S), situacao, breve_historico (B), avaliacao (A),
// dispositivos, sinais_vitais, recomendacoes (R). Logística, motivo, condutas e checklist em campos_extra.
const TRANSPORTES = ['USA — Suporte Avançado (UTI Móvel Samu)', 'USB — Suporte Básico', 'Aeromédico (Helicóptero / Avião)', 'Ambulância Branca UPA', 'Fluvial (Ambulancha)'];
const CHECKLIST = [
  'Cópia Integral do Prontuário e Ficha de Admissão',
  'CD / Laudos dos Exames de Imagem',
  'Resultados Impressos dos Exames Laboratoriais',
  'Pertences Pessoais e Documentos entregues ao familiar/transporte',
  'Termo de Consentimento e Transferência Assinado',
  'Pulseira de Identificação e Alergia Conferidas no Leito',
];
const SECOES = [
  { chave: 'reg', rotulo: '1. Regulação & Transporte', icon: 'ph-ambulance' },
  { chave: 's', rotulo: '2. Situação (S)', icon: 'ph-letter-circle-s' },
  { chave: 'b', rotulo: '3. Breve Histórico (B)', icon: 'ph-letter-circle-b' },
  { chave: 'a', rotulo: '4. Avaliação de Embarque (A)', icon: 'ph-letter-circle-a' },
  { chave: 'r', rotulo: '5. Recomendações & Pertences (R)', icon: 'ph-letter-circle-r' },
];
const VAZIO = {
  hospital_destino: '', setor_destino: '', protocolo: '', transporte: '', medico_transporte: '', enfermeiro_transporte: '',
  diagnostico: '', motivo: '', situacao: '',
  antecedentes: '', condutas: '',
  pa: '', fc: '', spo2: '', hgt: '', neuro: '', acessos: '',
  cuidados: '', checklist: [],
};

export default function AbaSbar({ atendimento, autorId, onImprimir, onFechar }) {
  const [d, setD] = useState(VAZIO);
  const [historico, setHistorico] = useState([]);
  const [ocupacao, setOcupacao] = useState(null);
  const [alergias, setAlergias] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [recolhidas, setRecolhidas] = useState(() => new Set());
  const [salvando, setSalvando] = useState(false);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const rascunho = useRascunho({ tabela: 'transferencias_sbar', atendimentoId: atendimento?.atendimento_id, autorId: autorId, campos: { d: [d, setD] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setMsg({ t: 'Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.' }) });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    buscarOcupacaoAtiva(atendimento.atendimento_id).then(setOcupacao);
    listarTransferenciasSbar(atendimento.atendimento_id).then(setHistorico);
    if (atendimento.pessoa_id) listarAlergias(atendimento.pessoa_id).then((l) => setAlergias(l.filter((a) => a.status !== 'inativa')));
    // Pré-preenche o embarque com a última aferição (editável).
    listarSinaisVitais(atendimento.atendimento_id).then((l) => {
      const s = l[0]; if (!s) return;
      setD((p) => ({
        ...p,
        pa: p.pa || (s.pa_sistolica && s.pa_diastolica ? `${s.pa_sistolica}/${s.pa_diastolica}` : ''),
        fc: p.fc || (s.fc ?? ''), spo2: p.spo2 || (s.spo2 ?? ''), hgt: p.hgt || (s.glicemia ?? ''),
      }));
    });
  }, [atendimento.atendimento_id]);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const visivel = (c) => filtro === 'todas' || filtro === c;
  const recolhida = (c) => recolhidas.has(c);
  const toggle = (c) => setRecolhidas((prev) => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const todasRecolhidas = SECOES.every((s) => recolhidas.has(s.chave));
  const toggleTodas = () => setRecolhidas(todasRecolhidas ? new Set() : new Set(SECOES.map((s) => s.chave)));
  const alergiaTxt = alergias.map((a) => `${String(a.substancia).toUpperCase()}${a.reacao ? ` (${a.reacao})` : ''}`).join('; ');

  async function salvar(imprimir = false) {
    if (!d.hospital_destino.trim() || !d.diagnostico.trim()) { setMsg({ erro: true, t: 'Preencha ao menos o hospital/serviço de destino e o diagnóstico principal de saída.' }); return; }
    setMsg(null); setSalvando(true);
    const [pas, pad] = String(d.pa).split(/[x/]/i).map((x) => x.trim());
    const { data, error } = await registrarTransferenciaSbar({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      leitoOcupacaoId: ocupacao?.id || null, setorDestinoId: null, enfermeiroEntrega: autorId, enfermeiroRecebe: null,
      dados: {
        atendimento_id: atendimento.atendimento_id,
        impressao_diagnostica: d.diagnostico.trim(), situacao: d.situacao || null,
        breve_historico: d.antecedentes || null,
        alergia: alergias.length > 0,
        avaliacao: d.neuro || null, dispositivos: d.acessos || null,
        sinais_vitais: { pa_sistolica: pas || null, pa_diastolica: pad || null, fc: d.fc || null, spo2: d.spo2 || null, hgt: d.hgt || null },
        recomendacoes: d.cuidados || null,
        campos_extra: {
          hospital_destino: d.hospital_destino, setor_destino: d.setor_destino, protocolo: d.protocolo, transporte: d.transporte,
          medico_transporte: d.medico_transporte, enfermeiro_transporte: d.enfermeiro_transporte,
          motivo: d.motivo, condutas: d.condutas, alergias: alergiaTxt, checklist: d.checklist,
        },
      },
    });
    setSalvando(false);
    if (error) { console.error(error); setMsg({ erro: true, t: 'Não foi possível salvar a transferência. Tente de novo.' }); return; }
    setEditandoId(imprimir ? null : (data?.id ?? null));
    setMsg({ t: imprimir ? 'Transferência SBAR finalizada.' : 'Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.' });
    listarTransferenciasSbar(atendimento.atendimento_id).then(setHistorico);
    if (imprimir && data) onImprimir(data);
  }

  const campo = (k, rotulo, icon, props = {}) => (
    <div className="enf-group">
      <label>{icon && <i className={'ph ' + icon} />} {rotulo}</label>
      {props.area
        ? <textarea className="enf-control" rows={props.rows || 2} value={d[k]} onChange={(e) => set(k, e.target.value)} />
        : <input className="enf-control" type="text" style={props.style} placeholder={props.ph || ''} value={d[k]} onChange={(e) => set(k, e.target.value)} />}
    </div>
  );
  const pilar = (chave, classe, badge, titulo, corpo) => visivel(chave) && (
    <section key={chave} className={'sbar-section' + (recolhida(chave) ? ' collapsed' : '')}>
      <div className={'pillar-header ' + classe} onClick={() => toggle(chave)}>
        <div className="ph-left"><div className="pillar-badge">{badge}</div><span>{titulo}</span></div>
        <div className="ph-right"><span>{recolhida(chave) ? 'Expandir' : 'Recolher'}</span><i className="ph ph-caret-down" /></div>
      </div>
      {!recolhida(chave) && <div className="pillar-body">{corpo}</div>}
    </section>
  );
  const ultima = historico[0];

  return (
    <div className="transfer-card">
      <div className="tc-header">
        <div className="tc-title">
          <h2><i className="ph ph-arrows-left-right" /> Transferência Externa</h2>
        </div>
        <div className="ac-actions">
          <button type="button" className="btn-toggle-sidebar" onClick={toggleTodas}>
            <i className={'ph ' + (todasRecolhidas ? 'ph-arrows-out-line-horizontal' : 'ph-arrows-in-line-horizontal')} /> {todasRecolhidas ? 'Expandir Todos' : 'Recolher Todos'}
          </button>
          <button type="button" className="btn-toggle-sidebar" disabled={!ultima} title={ultima ? `Última: ${new Date(ultima.criado_em).toLocaleString('pt-BR')}` : 'Nenhuma transferência registrada'} onClick={() => ultima && onImprimir(ultima)}>
            <i className="ph ph-printer" /> Visualizar Impresso SBAR Oficial
          </button>
        </div>
      </div>

      <div className="transfer-subtabs">
        <button type="button" className={'transfer-tab' + (filtro === 'todas' ? ' active' : '')} onClick={() => setFiltro('todas')}><i className="ph ph-list-dashes" /> Formulário SBAR Completo</button>
        {SECOES.map((s) => (
          <button key={s.chave} type="button" className={'transfer-tab' + (filtro === s.chave ? ' active' : '')} onClick={() => { setFiltro(s.chave); setRecolhidas(new Set()); }}>
            <i className={'ph ' + s.icon} /> {s.rotulo}
          </button>
        ))}
      </div>

      <div className="tc-body">
        {pilar('reg', 'reg', <i className="ph ph-ambulance" />, 'LOGÍSTICA DA TRANSFERÊNCIA — Regulação SUS e Transporte', (
          <>
            <div className="grid-3">
              {campo('hospital_destino', 'Hospital / Serviço de Destino *', 'ph-buildings')}
              {campo('setor_destino', 'Hospital de Destino', 'ph-door')}
              {campo('protocolo', 'Protocolo SUS Fácil / Regulação', 'ph-barcode', { style: { fontWeight: 700, color: '#0284C7' } })}
            </div>
            <div className="grid-3">
              <div className="enf-group">
                <label><i className="ph ph-truck" /> Tipo de Transporte</label>
                <select className="enf-control" value={d.transporte} onChange={(e) => set('transporte', e.target.value)}>
                  <option value="">Selecione...</option>
                  {TRANSPORTES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              {campo('medico_transporte', 'Médico(a) do Transporte', 'ph-user-gear', { ph: 'Nome (CRM)' })}
              {campo('enfermeiro_transporte', 'Enfermeiro(a) do Transporte', 'ph-stethoscope', { ph: 'Nome (COREN)' })}
            </div>
          </>
        ))}

        {pilar('s', 's', 'S', 'SITUAÇÃO (Situation) — Identificação e Motivo Imediato', (
          <>
            <div className="grid-2">
              {campo('diagnostico', 'Diagnóstico Principal de Saída *')}
              {campo('motivo', 'Motivo da Solicitação da Vaga / Transferência')}
            </div>
            {campo('situacao', 'Tempo de Admissão na UPA e Situação Atual', null, { area: true })}
          </>
        ))}

        {pilar('b', 'b', 'B', 'BREVE HISTÓRICO (Background) — Antecedentes e Condutas Realizadas na UPA', (
          <>
            {campo('antecedentes', 'Antecedentes Pessoais, Comorbidades e Cirurgias', null, { area: true })}
            {alergias.length > 0 ? (
              <div className="alergia-box"><strong><i className="ph ph-warning" /> ALERGIA CONFIRMADA:</strong> {alergiaTxt}</div>
            ) : (
              <div className="qs-vazio">Nenhuma alergia registrada no cadastro do paciente.</div>
            )}
            {campo('condutas', 'Condutas e Procedimentos já Executados na UPA', null, { area: true })}
          </>
        ))}

        {pilar('a', 'a', 'A', 'AVALIAÇÃO (Assessment) — Exame Clínico no Momento do Embarque', (
          <>
            <div className="grid-4">
              {campo('pa', 'PA de Embarque', null, { ph: '120/80', style: { fontWeight: 700 } })}
              {campo('fc', 'FC de Embarque', null, { ph: 'bpm', style: { fontWeight: 700 } })}
              {campo('spo2', 'SpO₂ / Suporte', null, { ph: '% (suporte)', style: { fontWeight: 700 } })}
              {campo('hgt', 'Glicemia (HGT)', null, { ph: 'mg/dL', style: { fontWeight: 700 } })}
            </div>
            <div className="grid-2">
              {campo('neuro', 'Avaliação Neurológica', 'ph-brain', { area: true })}
              {campo('acessos', 'Acessos e Drogas em Infusão', 'ph-needle', { area: true })}
            </div>
          </>
        ))}

        {pilar('r', 'r', 'R', 'RECOMENDAÇÕES (Recommendation) — Orientações de Transporte & Checklist', (
          <>
            {campo('cuidados', 'Cuidados Críticos e Metas Durante o Transporte', null, { area: true })}
            <div>
              <label className="enf-label forte">Checklist de Conferência e Pertences de Saída:</label>
              <div className="grid-2">
                {CHECKLIST.map((c) => {
                  const on = d.checklist.includes(c);
                  return (
                    <label key={c} className={'check-item' + (on ? ' active' : '')}>
                      <input type="checkbox" checked={on} onChange={() => set('checklist', on ? d.checklist.filter((x) => x !== c) : [...d.checklist, c])} /> {c}
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        ))}

        {msg && (
          <div className="condicional-box" style={msg.erro ? { background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' } : undefined}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}><i className={'ph ' + (msg.erro ? 'ph-warning' : 'ph-check-circle')} /> {msg.t}</span>
          </div>
        )}
      </div>

      <div className="tc-footer">
        <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> Cancelar</button>
        <div style={{ display: 'flex', gap: 12 }}>
          <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir SBAR'}</button>
        </div>
      </div>
    </div>
  );
}
