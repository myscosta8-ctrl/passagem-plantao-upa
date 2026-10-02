import { useEffect, useState } from 'react';
import { registrarEvolucao, listarSinaisVitais, registrarSinaisVitais } from '../../lib/pepClinico';
import { NANDA_OPCOES, NIC_OPCOES } from './constantes';
import CampoDataRegistro from '../../components/CampoDataRegistro';
import { metaDoc } from '../../lib/documentos';
import { useRascunho } from '../../hooks/useRascunho';
import { retirarDuplicacao } from '../../lib/duplicarPendente';

// Evolução do Enfermeiro (SAE) — mockups-fase2/09-evolucao-enfermagem-sae-design.html.
// Os sinais vitais do turno são gravados em sinais_vitais e um resumo vai para
// evolucoes.objetivo, que o impresso 02 usa.
const SV_VAZIO = { pa: '', fc: '', fr: '', temperatura: '', spo2: '', glicemia: '', dor_escala: '' };
const SV_CAMPOS = [
  ['pa', 'P. Arterial', 'mmHg', '120/80'],
  ['fc', 'F. Cardíaca', 'bpm'],
  ['fr', 'F. Respiratória', 'irpm'],
  ['temperatura', 'Temperatura', '°C'],
  ['spo2', 'SpO₂', '%'],
  ['glicemia', 'HGT / Glicemia', 'mg/dL'],
  ['dor_escala', 'Dor (EVA 0-10)', ''],
];
const nicTexto = (n) => `${n.texto} (${n.frequencia})`;

// Cabeçalho recolhível dos blocos da SAE: fechado mostra só o resumo do que foi marcado,
// para o campo de evolução ficar em destaque. O impresso não muda.
function CabecalhoRecolhivel({ icone, titulo, aberto, onAlternar, selecionados, rotuloAberto }) {
  const resumo = selecionados.length
    ? `${selecionados.length} selecionado${selecionados.length > 1 ? 's' : ''}: ${selecionados.map((t) => t.replace(/\s*\(.*\)$/, '')).join(' · ')}`
    : 'Nenhum selecionado';
  return (
    <button type="button" className="sae-header sae-header-botao" aria-expanded={aberto} onClick={onAlternar}>
      <span className="bloco-num"><i className={'ph ' + icone} /> {titulo}</span>
      <span className="sae-header-sub sae-resumo" title={aberto ? undefined : resumo}>
        {aberto ? rotuloAberto : resumo}
        <i className={'ph ' + (aberto ? 'ph-caret-up' : 'ph-caret-down')} />
      </span>
    </button>
  );
}

function resumoSv(s) {
  return [
    s.pa && `PA ${s.pa} mmHg`, s.fc && `FC ${s.fc} bpm`, s.fr && `FR ${s.fr} irpm`, s.temperatura && `Tax ${s.temperatura} °C`,
    s.spo2 && `SpO₂ ${s.spo2}%`, s.glicemia && `HGT ${s.glicemia} mg/dL`, s.dor_escala !== '' && `Dor EVA ${s.dor_escala}/10`,
  ].filter(Boolean).join(' • ');
}

export default function AbaEvolucao({ atendimento, autorId, onImprimir, onFechar }) {
  const [carregando, setCarregando] = useState(true);
  const [ultimoSv, setUltimoSv] = useState(null);
  const [sv, setSv] = useState(SV_VAZIO);
  const [texto, setTexto] = useState('');
  const [nanda, setNanda] = useState([]);
  const [nic, setNic] = useState([]);
  const [abertos, setAbertos] = useState({ nanda: false, nic: false });
  const alternar = (k) => setAbertos((a) => ({ ...a, [k]: !a[k] }));
  const [salvando, setSalvando] = useState(false);
  const [dataRegistro, setDataRegistro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const rascunho = useRascunho({ tabela: 'evolucoes', atendimentoId: atendimento?.atendimento_id, autorId: autorId, campos: { texto: [texto, setTexto], nanda: [nanda, setNanda], nic: [nic, setNic], sv: [sv, setSv] }, editandoId, setEditandoId, setDataRegistro, onReaberto: () => setAvisoRasc('Rascunho reaberto — continue editando. "Salvar Rascunho" atualiza o rascunho; "Cancelar" o descarta.') });
  const [avisoRasc, setAvisoRasc] = useState('');
  // Duplicar (escolhido no Histórico Clínico): traz texto, NANDA e NIC; sinais vitais não são copiados.
  useEffect(() => {
    const d = retirarDuplicacao('enfermagem');
    if (!d) return undefined;
    const t = setTimeout(() => { setTexto(d.registro.texto || ''); setNanda(d.registro.diagnosticos_nanda || []); setNic(d.registro.prescricao_nic || []); setAvisoRasc(d.mensagem); }, 400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const svs = await listarSinaisVitais(atendimento.atendimento_id);
    setUltimoSv(svs[0] || null);
    setCarregando(false);
  }

  const toggle = (lista, set, item) => set(lista.includes(item) ? lista.filter((i) => i !== item) : [...lista, item]);

  async function registrar(imprimir = false) {
    if (!texto.trim()) { setErro('Escreva a evolução clínica do enfermeiro.'); return; }
    setErro('');
    setSalvando(true);
    const temSv = Object.values(sv).some((v) => String(v).trim() !== '');
    if (temSv && !editandoId) {
      const [pas, pad] = String(sv.pa).split(/[x/]/i).map((x) => x.trim());
      const { error: e1 } = await registrarSinaisVitais({
        atendimentoId: atendimento.atendimento_id, registradoPor: autorId,
        dados: { pa_sistolica: pas || '', pa_diastolica: pad || '', fc: sv.fc, fr: sv.fr, spo2: sv.spo2, temperatura: String(sv.temperatura).replace(',', '.'), glicemia: sv.glicemia, dor_escala: String(sv.dor_escala).replace(/\D.*$/, '') },
      });
      if (e1) console.error(e1);
    }
    const { data, error } = await registrarEvolucao({
      id: editandoId, situacao: metaDoc(imprimir, dataRegistro, rascunho.estado),
      atendimentoId: atendimento.atendimento_id, autorId, texto: texto.trim(),
      diagnosticosNanda: nanda, prescricaoNic: nic,
      objetivo: temSv ? resumoSv(sv) : null,
    });
    setSalvando(false);
    if (error) { setErro('Não foi possível registrar. Tente de novo.'); console.error(error); return; }
    if (!imprimir) { setEditandoId(data?.id ?? null); setErro(''); setAvisoRasc('Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'); carregar(); return; }
    setEditandoId(null); setDataRegistro(''); setAvisoRasc('');
    if (data) onImprimir(data);
    setTexto(''); setNanda([]); setNic([]); setSv(SV_VAZIO);
    carregar();
  }


  return (
    <div className="clinical-split sae-split">
      


      <div className="sae-card">
        <div className="sc-header" style={{ flexWrap: 'nowrap' }}><div className="sc-title">
            <h2><i className="ph ph-activity" /> Evolução de Enfermagem</h2>
            
          </div></div>

        <div className="sc-body">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
              <label className="enf-label forte bloco-num" style={{ margin: 0 }}><i className="ph ph-thermometer" /> Sinais Vitais do Turno</label>
              <span style={{ fontSize: 12, color: '#64748B' }}>
                <i className="ph ph-clock" /> Última aferição: {ultimoSv ? new Date(ultimoSv.registrado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
            <div className="vitals-grid">
              {SV_CAMPOS.map(([k, rotulo, unid, ph]) => (
                <div key={k} className="vital-box">
                  <label>{rotulo}</label>
                  <div className="vital-input-wrap">
                    <input type="text" inputMode={k === 'pa' ? 'text' : 'decimal'} placeholder={ph || '—'} value={sv[k]} onChange={(e) => setSv((p) => ({ ...p, [k]: e.target.value }))} />
                    {unid && <span>{unid}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sae-section">
            <CabecalhoRecolhivel icone="ph-stethoscope" titulo="Diagnósticos de Enfermagem (NANDA-I)" aberto={abertos.nanda} onAlternar={() => alternar('nanda')}
              selecionados={nanda} rotuloAberto="Selecione os títulos prioritários" />
            {abertos.nanda && <div className="sae-body">
              <div className="chips-container">
                {NANDA_OPCOES.map((item) => {
                  const on = nanda.includes(item);
                  return (
                    <button key={item} type="button" className={'nanda-chip' + (on ? ' selected' : '')} onClick={() => toggle(nanda, setNanda, item)}>
                      <i className={'ph ' + (on ? 'ph-check-circle' : 'ph-plus-circle')} /> {item}
                    </button>
                  );
                })}
              </div>
            </div>}
          </div>

          <div className="sae-section">
            <CabecalhoRecolhivel icone="ph-list-checks" titulo="Prescrição de Enfermagem e Cuidados (NIC)" aberto={abertos.nic} onAlternar={() => alternar('nic')}
              selecionados={nic} rotuloAberto="Aprazamento pelo Enfermeiro" />
            {abertos.nic && <div className="sae-body">
              <div className="nic-list">
                {NIC_OPCOES.map((n) => {
                  const t = nicTexto(n);
                  return (
                    <label key={n.texto} className="nic-item">
                      <div className="nic-left">
                        <input type="checkbox" checked={nic.includes(t)} onChange={() => toggle(nic, setNic, t)} />
                        <span>{n.texto}</span>
                      </div>
                      <span className="nic-freq">{n.frequencia.replace('/', ' / ')}</span>
                    </label>
                  );
                })}
              </div>
            </div>}
          </div>

          <div className="enf-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <label className="bloco-num" style={{ margin: 0 }}><i className="ph ph-text-align-left" /> Evolução Clínica do Enfermeiro (SOAP / Descritiva)</label>
            </div>
            <textarea className="enf-control" rows="4" value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>

          {avisoRasc && <div className="aviso-rascunho"><i className="ph ph-pencil-simple" /> {avisoRasc}</div>}

          {erro && (
            <div className="condicional-box" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}><i className="ph ph-warning" /> {erro}</span>
            </div>
          )}
        </div>

        <div className="sc-footer">
          <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> Cancelar</button>
          <div style={{ display: 'flex', gap: 12 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => registrar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar Rascunho'}</button>
            <button type="button" className="btn-save-print" onClick={() => registrar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Finalizar e Imprimir'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
