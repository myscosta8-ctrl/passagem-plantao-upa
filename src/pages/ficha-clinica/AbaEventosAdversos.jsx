import { useEffect, useState } from 'react';
import { listarEventosAdversos, registrarEventoAdverso } from '../../lib/pepClinico';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { metaDoc } from '../../lib/documentos';
import { useRascunho } from '../../hooks/useRascunho';

// Nota de Intercorrência de Enfermagem — mockups-fase2/13-nota-intercorrencia-enfermagem-design.html,
// impresso modelos_impressao_html/04-nota-intercorrencia-enfermagem.html.
const TIPOS = [
  ['Pico Pressórico', 'ph-heartbeat'],
  ['Dessaturação / Hipóxia', 'ph-drop'],
  ['Febre Súbita / Calafrios', 'ph-thermometer'],
  ['Perda / Obstrução de AVP', 'ph-needle'],
  ['Queda do Leito', 'ph-warning'],
  ['Agitação Psicomotora', 'ph-user-focus'],
  ['Reação Adversa Medicamentosa', 'ph-shield-warning'],
];
const SV = [['pa', 'PA (mmHg)', '120/80'], ['fc', 'FC (bpm)'], ['fr', 'FR (irpm)'], ['spo2', 'SpO₂ (%)'], ['temperatura', 'Tax (°C)']];
const agoraHHMM = () => new Date().toTimeString().slice(0, 5);
const VAZIO = () => ({ tipo: '', hora: agoraHHMM(), medico: '', horaMedico: '', pa: '', fc: '', fr: '', spo2: '', temperatura: '', descricao: '', condutas: '', desfecho: '' });

function isoDeHora(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(); d.setHours(h, m || 0, 0, 0);
  if (d > new Date()) d.setDate(d.getDate() - 1);
  return d.toISOString();
}
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : ''; };

export default function AbaEventosAdversos({ atendimento, autorId, onImprimir, onFechar }) {
  const [d, setD] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const rascunho = useRascunho({ tabela: 'eventos_adversos', atendimentoId: atendimento?.atendimento_id, autorId: autorId, campos: { d: [d, setD] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setMsg({ t: 'Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.' }) });
  const [msg, setMsg] = useState(null);

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  async function registrar(imprimir = false) {
    if (!d.tipo || !d.descricao.trim()) { setMsg({ erro: true, t: 'Selecione o tipo de evento e descreva a intercorrência.' }); return; }
    setMsg(null); setSalvando(true);
    const [pas, pad] = String(d.pa).split(/[x/]/i).map((x) => x.trim());
    const { data, error } = await registrarEventoAdverso({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id, relatorId: autorId, anonimo: false,
      categoria: d.tipo, gravidade: 'Não classificada', descricao: d.descricao.trim(), acaoImediata: d.condutas.trim(),
      ocorridoEm: isoDeHora(d.hora),
      medicoComunicado: !!d.medico.trim(), medicoComunicadoNome: d.medico.trim(), horarioComunicacaoMedico: isoDeHora(d.horaMedico),
      sinaisVitais: { pa_sistolica: num(pas), pa_diastolica: num(pad), fc: num(d.fc), fr: num(d.fr), spo2: num(d.spo2), temperatura: num(d.temperatura) },
      desfechoEvolucao: d.desfecho.trim(),
    });
    setSalvando(false);
    if (error) { console.error(error); setMsg({ erro: true, t: 'Não foi possível registrar. Tente de novo.' }); return; }
    if (!imprimir) { setEditandoId(data?.id ?? null); setMsg({ t: 'Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.' }); return; }
    setEditandoId(null); setDataRegistro('');
    setMsg({ t: 'Intercorrência finalizada.' });
    if (data) onImprimir(data);
    setD(VAZIO());
  }


  return (
    <div className="clinical-split sae-split">
      


      <div className="form-card">
        <div className="fc-header" style={{ flexWrap: 'nowrap' }}><div className="fc-title">
            <h2><i className="ph ph-warning-circle" /> Nota de Intercorrência</h2>
          </div></div>

        <div className="fc-body">
          <div className="enf-group">
            <label>Classificação / Tipo de Evento Agudo:</label>
            <div className="type-chips">
              {TIPOS.map(([t, icon]) => (
                <button key={t} type="button" className={'type-chip' + (d.tipo === t ? ' selected' : '')} onClick={() => set('tipo', d.tipo === t ? '' : t)}>
                  <i className={'ph ' + icon} /> {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-3">
            <div className="enf-group"><label>Horário Exato da Ocorrência</label><input className="enf-control" type="time" value={d.hora} onChange={(e) => set('hora', e.target.value)} /></div>
            <div className="enf-group"><label>Médico Plantonista Comunicado</label><input className="enf-control" type="text" placeholder="Nome (CRM)" value={d.medico} onChange={(e) => set('medico', e.target.value)} /></div>
            <div className="enf-group"><label>Horário da Notificação Médica</label><input className="enf-control" type="time" value={d.horaMedico} onChange={(e) => set('horaMedico', e.target.value)} /></div>
          </div>

          <div className="enf-group">
            <label>Sinais Vitais Durante o Evento:</label>
            <div className="vitals-row">
              {SV.map(([k, r, ph]) => (
                <div key={k} className="vr-item"><label>{r}</label><input type="text" placeholder={ph || ''} value={d[k]} onChange={(e) => set(k, e.target.value)} /></div>
              ))}
            </div>
          </div>

          <div className="enf-group">
            <label>Descrição Detalhada do Evento Agudo e Queixas do Paciente *</label>
            <textarea className="enf-control" rows="3" placeholder="Descreva os sinais objetivos, sintomas relatados pelo paciente ou familiar..." value={d.descricao} onChange={(e) => set('descricao', e.target.value)} />
          </div>
          <div className="enf-group">
            <label>Condutas Assistenciais Imediatas de Enfermagem</label>
            <textarea className="enf-control" rows="3" placeholder="Descreva as medidas imediatas adotadas pela enfermagem..." value={d.condutas} onChange={(e) => set('condutas', e.target.value)} />
          </div>
          <div className="enf-group">
            <label>Evolução do Quadro / Desfecho Pós-Conduta</label>
            <input className="enf-control" type="text" value={d.desfecho} onChange={(e) => set('desfecho', e.target.value)} />
          </div>

          {msg && (
            <div className="condicional-box" style={msg.erro ? { background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' } : undefined}>
              <span style={{ fontSize: 12, fontWeight: 600 }}><i className={'ph ' + (msg.erro ? 'ph-warning' : 'ph-check-circle')} /> {msg.t}</span>
            </div>
          )}
        </div>

        <div className="fc-footer">
          <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> Cancelar</button>
          <div style={{ display: 'flex', gap: 12 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => registrar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="btn-save-print" onClick={() => registrar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
