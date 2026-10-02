import { useEffect, useMemo, useState } from 'react';
import { gravar, metaDoc } from '../../lib/documentos';
import { buscarCabecalhoImpressao, mensagemErroSalvar } from '../../lib/pepMedico';
import { useRascunho } from '../../hooks/useRascunho';
import CampoDataRegistro from '../../components/CampoDataRegistro';

// Formulário genérico dos documentos multiprofissionais, montado a partir do esquema
// (ver esquemas.js). Mesmo fluxo de todo documento clínico: Salvar = rascunho,
// Salvar e Imprimir = finaliza (depois só invalidar), Cancelar = descarta o rascunho.
export default function AbaRegistroMulti({ atendimento, autorId, doc, podeCriar, onImprimir, onFechar }) {
  const { tabela, tipo, esquema } = doc;
  const [dados, setDados] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [dataRegistro, setDataRegistro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [idade, setIdade] = useState(null);
  const filtro = useMemo(() => ({ tipo }), [tipo]);

  const rascunho = useRascunho({
    tabela, atendimentoId: atendimento?.atendimento_id, autorId, filtro,
    campos: { dados: [dados, setDados] }, editandoId, setEditandoId, setDataRegistro,
    onReaberto: () => setSucesso('Rascunho reaberto — continue editando. "Salvar" atualiza o rascunho; "Cancelar" o descarta.'),
  });

  useEffect(() => {
    if (!atendimento?.atendimento_id) return;
    let vivo = true;
    buscarCabecalhoImpressao(atendimento.atendimento_id).then((c) => { if (vivo) setIdade(c?.idade ?? null); }).catch(() => {});
    return () => { vivo = false; };
  }, [atendimento?.atendimento_id]);

  const ctx = { idade };
  const set = (k, v) => setDados((p) => ({ ...p, [k]: v }));
  const alternar = (k, op) => setDados((p) => {
    const atual = Array.isArray(p[k]) ? p[k] : [];
    return { ...p, [k]: atual.includes(op) ? atual.filter((x) => x !== op) : [...atual, op] };
  });

  const preenchido = Object.values(dados).some((v) => (Array.isArray(v) ? v.length : String(v ?? '').trim()));

  async function salvar(finalizar) {
    if (!preenchido) { setErro('Preencha ao menos um campo antes de salvar.'); return; }
    setErro(''); setSucesso(''); setSalvando(true);
    // Guarda também os valores calculados (IMC, NRS-2002...) como estavam no momento do registro.
    const calculados = Object.fromEntries(esquema.secoes.flatMap((s) => s.campos).filter((c) => c.tipo === 'calc').map((c) => [c.k, c.calc(dados, ctx) || '']));
    const linha = {
      atendimento_id: atendimento.atendimento_id,
      pessoa_id: atendimento.pessoa_id || null,
      tipo,
      dados: { ...dados, ...calculados, idade_no_registro: idade },
      resumo: (esquema.resumo(dados) || '').slice(0, 500),
      atualizado_em: new Date().toISOString(),
    };
    const { data, error } = await gravar(tabela, editandoId, linha, metaDoc(finalizar, dataRegistro, rascunho.estado));
    setSalvando(false);
    if (error) { console.error(error); setErro(mensagemErroSalvar(error, `a ${doc.titulo}`)); return; }
    if (!finalizar) {
      setEditandoId(data?.id ?? null);
      setSucesso('Rascunho salvo — pode continuar editando. Após "Salvar e Imprimir" o documento é finalizado e só poderá ser invalidado.');
      return;
    }
    setEditandoId(null);
    setDados({});
    setDataRegistro('');
    setSucesso(`${doc.titulo} registrada.`);
    if (data) onImprimir?.({ tipo: doc.impresso, registro: data });
  }

  const renderCampo = (c) => {
    const estilo = { gridColumn: `span ${c.col || 12}` };
    if (c.tipo === 'calc') {
      const v = c.calc(dados, ctx);
      return (
        <div key={c.k} className="form-group mp-campo" style={estilo}>
          <label>{c.rotulo}</label>
          <div className={'mp-calc' + (v ? '' : ' vazio')}>{v || 'calculado automaticamente'}</div>
        </div>
      );
    }
    if (c.tipo === 'chips') {
      const sel = Array.isArray(dados[c.k]) ? dados[c.k] : [];
      return (
        <div key={c.k} className="form-group mp-campo" style={estilo}>
          <label>{c.rotulo}</label>
          <div className="mp-chips">
            {c.opcoes.map((op) => (
              <button key={op} type="button" className={'btn-add-chip' + (sel.includes(op) ? ' on' : '')} aria-pressed={sel.includes(op)} onClick={() => alternar(c.k, op)}>{op}</button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={c.k} className="form-group mp-campo" style={estilo}>
        <label>{c.rotulo}{c.unidade ? ` (${c.unidade})` : ''}</label>
        {c.tipo === 'area' && <textarea className="form-control-area" rows={3} value={dados[c.k] || ''} onChange={(e) => set(c.k, e.target.value)} />}
        {c.tipo === 'select' && (
          <select value={dados[c.k] || ''} onChange={(e) => set(c.k, e.target.value)}>
            <option value="">—</option>
            {c.opcoes.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
        )}
        {(c.tipo === 'texto' || c.tipo === 'numero') && (
          <input type="text" inputMode={c.tipo === 'numero' ? 'decimal' : undefined} placeholder={c.ph || ''} value={dados[c.k] || ''}
            onChange={(e) => set(c.k, c.tipo === 'numero' ? e.target.value.replace(/[^\d.,]/g, '') : e.target.value)} />
        )}
      </div>
    );
  };

  return (
    <div className="clinical-card" style={{ flex: 1 }}>
      <div className="cc-header">
        <div className="cc-title"><h2><i className={'ph ' + doc.icon} /> {doc.titulo}</h2></div>
      </div>
      <div className="cc-body">
        {!podeCriar && (
          <div className="aviso-somente-leitura"><i className="ph ph-lock-simple" /> Só {doc.funcao === 'nutricionista' ? 'o(a) nutricionista' : 'o(a) assistente social'} registra este documento. Os registros já feitos ficam no Histórico Clínico (lupa para visualizar e imprimir).</div>
        )}
        {esquema.secoes.map((s) => (
          <div key={s.titulo} className="form-section-box">
            <div className="form-section-box-title"><i className={'ph ' + s.icone} /> {s.titulo}</div>
            <div className="mp-grade">{s.campos.map(renderCampo)}</div>
          </div>
        ))}
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
      </div>
      {podeCriar && (
        <div className="cc-footer">
          <button type="button" className="btn-cancel" onClick={() => rascunho.cancelar(onFechar)}><i className="ph ph-x-circle" /> Cancelar</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <CampoDataRegistro valor={dataRegistro} onChange={setDataRegistro} />
            <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}><i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}><i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
