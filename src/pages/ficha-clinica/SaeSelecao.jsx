import { useState } from 'react';
import { filtrarSae } from './saeCatalogo';

// Lista agrupada da SAE (diagnósticos ou cuidados) com busca. Grupos recolhíveis: fechados,
// mostram quantos itens do grupo estão marcados; com busca, só os grupos com resultado, abertos.
// Item marcado que não está mais no catálogo (ex.: evolução duplicada antiga) aparece em
// "Já marcados fora da lista" para poder ser desmarcado.
export default function SaeSelecao({ grupos, selecionados, onAlternar, valorDe = (i) => i, rotuloDe = (i) => i, detalheDe, modo = 'chips', placeholder }) {
  const [busca, setBusca] = useState('');
  const [abertos, setAbertos] = useState({});
  const conhecidos = new Set(grupos.flatMap((g) => g.itens.map(valorDe)));
  const fora = selecionados.filter((v) => !conhecidos.has(v));
  const lista = [
    ...(fora.length ? [{ grupo: 'Já marcados fora da lista', itens: fora, fora: true }] : []),
    ...grupos,
  ];

  const renderItem = (item, fora) => {
    const valor = fora ? item : valorDe(item);
    const on = selecionados.includes(valor);
    const rotulo = fora ? item : rotuloDe(item);
    if (modo === 'chips') {
      return (
        <button key={valor} type="button" className={'nanda-chip' + (on ? ' selected' : '')} onClick={() => onAlternar(valor)}>
          <i className={'ph ' + (on ? 'ph-check-circle' : 'ph-plus-circle')} /> {rotulo}
        </button>
      );
    }
    return (
      <label key={valor} className="nic-item">
        <div className="nic-left">
          <input type="checkbox" checked={on} onChange={() => onAlternar(valor)} />
          <span>{rotulo}</span>
        </div>
        {!fora && detalheDe && <span className="nic-freq">{detalheDe(item)}</span>}
      </label>
    );
  };

  return (
    <div className="sae-selecao">
      <div className="sae-busca">
        <i className="ph ph-magnifying-glass" />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={placeholder || 'Buscar (ex.: dor, queda, pele, sonda)'} aria-label="Buscar na lista" />
      </div>
      {lista.map((g) => {
        // Busca nos itens; se nenhum item bate mas o nome do grupo bate (ex.: "respiratório"), mostra o grupo inteiro.
        const porItem = g.itens.filter((i) => filtrarSae(g.fora ? i : rotuloDe(i), busca));
        const itens = porItem.length ? porItem : (busca.trim() && filtrarSae(g.grupo, busca) ? g.itens : porItem);
        if (!itens.length) return null;
        const marcados = g.itens.filter((i) => selecionados.includes(g.fora ? i : valorDe(i))).length;
        const aberto = !!busca.trim() || g.fora || !!abertos[g.grupo];
        return (
          <div key={g.grupo} className="sae-grupo">
            <button type="button" className="sae-grupo-titulo" aria-expanded={aberto} onClick={() => setAbertos((a) => ({ ...a, [g.grupo]: !a[g.grupo] }))} disabled={!!busca.trim() || g.fora}>
              <i className={'ph ' + (aberto ? 'ph-caret-down' : 'ph-caret-right')} />
              <span>{g.grupo}</span>
              <span className="sae-grupo-cont">{marcados ? `${marcados} marcado${marcados > 1 ? 's' : ''} · ` : ''}{g.itens.length}</span>
            </button>
            {aberto && (modo === 'chips'
              ? <div className="chips-container">{itens.map((i) => renderItem(i, g.fora))}</div>
              : <div className="nic-list">{itens.map((i) => renderItem(i, g.fora))}</div>)}
          </div>
        );
      })}
      {busca.trim() && !lista.some((g) => g.itens.some((i) => filtrarSae(g.fora ? i : rotuloDe(i), busca) || filtrarSae(g.grupo, busca))) && (
        <div className="sae-vazio">Nada encontrado para "{busca}".</div>
      )}
    </div>
  );
}
