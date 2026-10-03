
// Seção 6 — Autorização (46 a 52), preenchida pela Regulação: só leitura.
export default function SecaoAutorizacao({ dados }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>6. AUTORIZAÇÃO (46 a 52 — preenchido pela Regulação)</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        <div className="col-6">
          <div className="aih-field-box readonly">
            <div className="aih-field-header"><label>46 - NOME DO AUTORIZADOR</label></div>
            <div className="aih-field-value">{dados.autorizador_nome}</div>
          </div>
        </div>
        <div className="col-3">
          <div className="aih-field-box readonly">
            <div className="aih-field-header"><label>47 - CÓD. ÓRGÃO EMISSOR</label></div>
            <div className="aih-field-value" style={{ fontWeight: 800 }}>{dados.autorizador_codigo_orgao_emissor}</div>
          </div>
        </div>
        <div className="col-3">
          <div className="aih-field-box readonly">
            <div className="aih-field-header"><label>52 - Nº DA AIH</label></div>
            <div className="aih-field-value" style={{ fontWeight: 800, color: 'var(--c-primary, #0D9488)' }}>{dados.numero_autorizacao}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
