import { useEffect, useState } from 'react';
import { listarBalancoHidrico, registrarBalancoHidrico } from '../../lib/pepClinico';

// Balanço Hídrico 24h — mockups-fase2/11-balanco-hidrico-design.html.
// Entrada: item/solução em `observacao`, via em `via`.
// Saída: tipo de eliminação em `via`, aspecto em `observacao`.
const ITENS_ENTRADA = ['Soro Fisiológico 0.9%', 'Soro Glicosado 5%', 'Ringer Lactato', 'Dieta via oral', 'Água ingerida', 'Dieta enteral', 'Medicação EV (diluente)', 'Hemocomponente'];
const VIAS_ENTRADA = ['Via Oral', 'EV (AVP)', 'EV (CVC)', 'SNE / SNG', 'GTT', 'SC'];
const TIPOS_SAIDA = ['Diurese (Urinol)', 'Diurese (SVD)', 'Vômitos / Êmese', 'Evacuação', 'Dreno', 'Drenagem SNG', 'Sangramento'];
const ASPECTOS = ['Clara', 'Amarelo claro', 'Concentrada', 'Hematúrica', 'Serosa', 'Sanguinolenta', 'Biliosa', 'Ausente'];

const agoraHHMM = () => new Date().toTimeString().slice(0, 5);
const LINHA_VAZIA = () => ({ hora: agoraHHMM(), item: '', via: '', volume: '' });
const hora = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fmt = (n) => n.toLocaleString('pt-BR');

function turnoAtual() {
  const h = new Date().getHours();
  return h >= 7 && h < 13 ? 'Manhã' : h >= 13 && h < 19 ? 'Tarde' : 'Noite';
}
function noTurnoAtual(d) {
  const agora = new Date(); const dt = new Date(d); const h = dt.getHours();
  if (agora - dt > 12 * 3600 * 1000) return false;
  const t = h >= 7 && h < 13 ? 'Manhã' : h >= 13 && h < 19 ? 'Tarde' : 'Noite';
  return t === turnoAtual();
}
function dataComHora(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  const d = new Date();
  if (Number.isFinite(h)) d.setHours(h, Number.isFinite(m) ? m : 0, 0, 0);
  if (d > new Date()) d.setDate(d.getDate() - 1); // hora "no futuro" = ontem (plantão noturno)
  return d.toISOString();
}

function Tabela({ tipo, titulo, icon, cols, linhas, nova, setNova, itens, vias, parcial, onAdicionar, salvando }) {
  return (
    <div className="bh-box">
      <div className={'bh-box-header ' + (tipo === 'entrada' ? 'entradas' : 'saidas')}>
        <span><i className={'ph ' + icon} /> {titulo}</span>
        <span style={{ fontSize: 12 }}>Total Parcial {turnoAtual()}: <strong>{fmt(parcial)} mL</strong></span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="bh-table">
          <thead>
            <tr>
              <th style={{ width: '21%' }}>Hora</th>
              <th style={{ width: '29%' }}>{cols[0]}</th>
              <th style={{ width: '22%' }}>{cols[1]}</th>
              <th style={{ width: '28%', textAlign: 'right' }}>Volume (mL)</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr><td colSpan={4} style={{ color: '#94A3B8', fontSize: 12 }}>Nenhum lançamento nas últimas 24h.</td></tr>
            )}
            {linhas.map((h) => (
              <tr key={h.id}>
                <td><strong>{hora(h.registrado_em)}</strong></td>
                <td>{tipo === 'entrada' ? (h.observacao || '—') : h.via}</td>
                <td>{tipo === 'entrada' ? h.via : (h.observacao || '—')}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(Number(h.volume_ml))}</td>
              </tr>
            ))}
            <tr className="bh-nova">
              <td><input type="time" className="bh-in-hora" value={nova.hora} onChange={(e) => setNova({ ...nova, hora: e.target.value })} /></td>
              <td>
                <input type="text" className="bh-in-txt" list={`bh-itens-${tipo}`} placeholder={tipo === 'entrada' ? 'Solução / item' : 'Tipo de eliminação'} value={nova.item} onChange={(e) => setNova({ ...nova, item: e.target.value })} />
                <datalist id={`bh-itens-${tipo}`}>{itens.map((i) => <option key={i} value={i} />)}</datalist>
              </td>
              <td>
                <input type="text" className="bh-in-txt" list={`bh-vias-${tipo}`} placeholder={tipo === 'entrada' ? 'Via' : 'Aspecto'} value={nova.via} onChange={(e) => setNova({ ...nova, via: e.target.value })} />
                <datalist id={`bh-vias-${tipo}`}>{vias.map((i) => <option key={i} value={i} />)}</datalist>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div className="bh-add-cell">
                  <input type="number" min="0" placeholder="mL" value={nova.volume} onChange={(e) => setNova({ ...nova, volume: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') onAdicionar(); }} />
                  <button type="button" className={'bh-add-btn ' + (tipo === 'entrada' ? 'in' : 'out')} onClick={onAdicionar} disabled={salvando} title={tipo === 'entrada' ? 'Adicionar entrada' : 'Adicionar saída'}>
                    <i className="ph ph-plus" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AbaBalancoHidrico({ atendimento, autorId, onImprimir, onFechar }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novaEntrada, setNovaEntrada] = useState(LINHA_VAZIA);
  const [novaSaida, setNovaSaida] = useState(LINHA_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { carregar(); }, []);
  async function carregar() {
    setCarregando(true);
    setHistorico(await listarBalancoHidrico(atendimento.atendimento_id));
    setCarregando(false);
  }

  const limite = Date.now() - 24 * 3600 * 1000;
  const ult24 = historico.filter((h) => new Date(h.registrado_em).getTime() >= limite).sort((a, b) => new Date(a.registrado_em) - new Date(b.registrado_em));
  const entradas = ult24.filter((h) => h.tipo === 'entrada');
  const saidas = ult24.filter((h) => h.tipo === 'saida');
  const soma = (l) => l.reduce((s, h) => s + Number(h.volume_ml || 0), 0);
  const totalEntradas = soma(entradas);
  const totalSaidas = soma(saidas);
  const saldo = totalEntradas - totalSaidas;

  // Grava só a linha de uma tabela (botão "+" ou Enter no volume).
  async function adicionar(tipo) {
    const l = tipo === 'entrada' ? novaEntrada : novaSaida;
    if (!l.item.trim() || l.volume === '' || Number(l.volume) < 0) { setMsg({ erro: true, t: `Preencha ${tipo === 'entrada' ? 'a solução/item' : 'o tipo de eliminação'} e o volume.` }); return; }
    setMsg(null); setSalvando(true);
    const { error } = await registrarBalancoHidrico({
      atendimentoId: atendimento.atendimento_id, registradoPor: autorId, tipo,
      via: tipo === 'entrada' ? (l.via.trim() || '—') : l.item.trim(),
      observacao: tipo === 'entrada' ? l.item.trim() : l.via.trim(),
      volumeMl: l.volume, registradoEm: dataComHora(l.hora),
    });
    setSalvando(false);
    if (error) { console.error(error); setMsg({ erro: true, t: 'Não foi possível registrar. Tente de novo.' }); return; }
    (tipo === 'entrada' ? setNovaEntrada : setNovaSaida)(LINHA_VAZIA());
    carregar();
  }

  async function salvar(imprimir = false) {
    setMsg(null);
    const pendentes = [];
    const ok = (l) => l.volume !== '' && Number(l.volume) >= 0 && l.item.trim();
    if (ok(novaEntrada)) pendentes.push({ tipo: 'entrada', via: novaEntrada.via.trim() || '—', observacao: novaEntrada.item.trim(), volume: novaEntrada.volume, hora: novaEntrada.hora });
    if (ok(novaSaida)) pendentes.push({ tipo: 'saida', via: novaSaida.item.trim(), observacao: novaSaida.via.trim(), volume: novaSaida.volume, hora: novaSaida.hora });
    const incompleta = [novaEntrada, novaSaida].some((l) => (l.item.trim() || l.volume !== '') && !ok(l));
    if (incompleta) { setMsg({ erro: true, t: 'Preencha o item/tipo e o volume da linha antes de salvar.' }); return; }
    if (pendentes.length === 0 && !imprimir) { setMsg({ erro: true, t: 'Nenhum lançamento novo para salvar.' }); return; }

    setSalvando(true);
    for (const p of pendentes) {
      const { error } = await registrarBalancoHidrico({
        atendimentoId: atendimento.atendimento_id, registradoPor: autorId,
        tipo: p.tipo, via: p.via, volumeMl: p.volume, observacao: p.observacao, registradoEm: dataComHora(p.hora),
      });
      if (error) { console.error(error); setSalvando(false); setMsg({ erro: true, t: 'Não foi possível registrar. Tente de novo.' }); return; }
    }
    setSalvando(false);
    setNovaEntrada(LINHA_VAZIA()); setNovaSaida(LINHA_VAZIA());
    const lista = await listarBalancoHidrico(atendimento.atendimento_id);
    setHistorico(lista);
    if (pendentes.length) setMsg({ t: `${pendentes.length} lançamento(s) registrado(s).` });
    if (imprimir) {
      const l24 = lista.filter((h) => new Date(h.registrado_em).getTime() >= Date.now() - 24 * 3600 * 1000);
      const te = soma(l24.filter((h) => h.tipo === 'entrada')); const ts = soma(l24.filter((h) => h.tipo === 'saida'));
      onImprimir({ historico: l24, totalEntradas: te, totalSaidas: ts, saldo: te - ts, registrado_por: autorId });
    }
  }

  return (
    <div className="bh-container">
      <div className="bh-summary-strip">
        <div className="bh-card-metric">
          <div className="metric-icon in"><i className="ph ph-arrow-down-left" /></div>
          <div className="metric-info"><span className="metric-label">Total Ganhos / Entradas</span><span className="metric-val">{fmt(totalEntradas)} mL</span></div>
        </div>
        <div className="bh-card-metric">
          <div className="metric-icon out"><i className="ph ph-arrow-up-right" /></div>
          <div className="metric-info"><span className="metric-label">Total Perdas / Saídas</span><span className="metric-val">{fmt(totalSaidas)} mL</span></div>
        </div>
        <div className="bh-card-metric">
          <div className={'metric-icon ' + (saldo < 0 ? 'negative' : 'balance')}><i className="ph ph-scales" /></div>
          <div className="metric-info">
            <span className="metric-label">Balanço Cumulativo 24h</span>
            <span className="metric-val" style={{ color: saldo < 0 ? 'var(--danger)' : 'var(--success)' }}>{saldo < 0 ? '−' : '+'} {fmt(Math.abs(saldo))} mL</span>
          </div>
        </div>
        <div>
          <button type="button" className="btn-toggle-sidebar" onClick={() => onImprimir({ historico: ult24, totalEntradas, totalSaidas, saldo, registrado_por: autorId })}>
            <i className="ph ph-printer" /> Visualizar Impresso Oficial 24h
          </button>
        </div>
      </div>

      <div className="bh-body">
        {carregando ? <p className="qs-vazio">Carregando...</p> : (
          <div className="bh-tables-split">
            <Tabela tipo="entrada" titulo="Entradas / Ingesta / Soluções (mL)" icon="ph-plus-circle" cols={['Solução / Item', 'Via']}
              linhas={entradas} nova={novaEntrada} setNova={setNovaEntrada} itens={ITENS_ENTRADA} vias={VIAS_ENTRADA} parcial={soma(entradas.filter((h) => noTurnoAtual(h.registrado_em)))} onAdicionar={() => adicionar('entrada')} salvando={salvando} />
            <Tabela tipo="saida" titulo="Saídas / Eliminações / Drenagens (mL)" icon="ph-minus-circle" cols={['Tipo de Eliminação', 'Aspecto']}
              linhas={saidas} nova={novaSaida} setNova={setNovaSaida} itens={TIPOS_SAIDA} vias={ASPECTOS} parcial={soma(saidas.filter((h) => noTurnoAtual(h.registrado_em)))} onAdicionar={() => adicionar('saida')} salvando={salvando} />
          </div>
        )}
        {msg && (
          <div className="condicional-box" style={msg.erro ? { background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' } : undefined}>
            <span style={{ fontSize: 12, fontWeight: 600 }}><i className={'ph ' + (msg.erro ? 'ph-warning' : 'ph-check-circle')} /> {msg.t}</span>
          </div>
        )}
      </div>

      <div className="bh-footer">
        <button type="button" className="btn-cancel" onClick={onFechar}><i className="ph ph-x-circle" /> Cancelar</button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
        </div>
      </div>
    </div>
  );
}
