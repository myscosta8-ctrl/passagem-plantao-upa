import { HEMO_OPCOES_RAPIDAS } from './itemPrescricao'
import BuscaLista from './BuscaLista'

const OPCOES = HEMO_OPCOES_RAPIDAS.map((h) => ({ chave: h.chave, texto: h.label, grupo: h.grupo }))

// Hemocomponentes e derivados: escolhidos na lista (com busca), cada um com sua quantidade,
// e uma observação livre para o que não estiver na lista.
export default function GrupoHemocomponentes({ hemocomponentes, observacao, onAlternar, onQuantidade, onObservacao }) {
  const marcados = HEMO_OPCOES_RAPIDAS.filter((h) => hemocomponentes[h.chave]?.marcado)
  return (
    <>
    <BuscaLista
      opcoes={OPCOES}
      escolhidos={new Set(marcados.map((h) => h.chave))}
      onEscolher={(op) => onAlternar(op.chave)}
      placeholder="Buscar hemocomponente ou derivado (ex: hemácias, plasma, albumina)"
      rotulo="Buscar hemocomponente ou derivado"
    />
    {marcados.length === 0 && <div className="bl-nenhum">Nenhum hemocomponente adicionado.</div>}
    {marcados.map((h, n) => (
      <div key={h.chave} className="bl-linha">
        <span className="bl-num">{n + 1}</span>
        <span className="bl-rotulo">{h.label}</span>
        <input type="text" className="form-control" placeholder="Quantidade (ex: 2 unidades)" value={hemocomponentes[h.chave]?.quantidade || ''} onChange={(e) => onQuantidade(h.chave, e.target.value)} aria-label={`Quantidade de ${h.label}`} />
        <button type="button" className="btn-cancel bl-remover" onClick={() => onAlternar(h.chave)} aria-label={`Remover ${h.label}`} title="Remover"><i className="ph ph-trash" /></button>
      </div>
    ))}
    <input
      type="text"
      className="form-control"
      placeholder="Outro hemocomponente ou observação (opcional)"
      value={observacao}
      onChange={(e) => onObservacao(e.target.value)}
    />
    </>
  )
}
