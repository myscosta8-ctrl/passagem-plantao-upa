import { HEMO_OPCOES_RAPIDAS } from './itemPrescricao'

// Hemocomponentes e derivados: atalhos (com quantidade) e observação livre.
export default function GrupoHemocomponentes({ hemocomponentes, observacao, onAlternar, onQuantidade, onObservacao }) {
  return (
    <>
    <div className="hemo-chips">
      {HEMO_OPCOES_RAPIDAS.map((h) => {
        const ativo = !!hemocomponentes[h.chave]?.marcado
        return (
          <div key={h.chave} className={`hemo-chip${ativo ? ' ativo' : ''}`}>
            <button type="button" className="hemo-chip-btn" onClick={() => onAlternar(h.chave)}>
              <i className={`ph ${h.icon}`} /> {h.label}
            </button>
            {ativo && (
              <input
                type="text"
                className="hemo-chip-qtd"
                placeholder="Qtd (ex: 2 unid.)"
                value={hemocomponentes[h.chave]?.quantidade || ''}
                onChange={(e) => onQuantidade(h.chave, e.target.value)}
              />
            )}
          </div>
        )
      })}
    </div>
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
