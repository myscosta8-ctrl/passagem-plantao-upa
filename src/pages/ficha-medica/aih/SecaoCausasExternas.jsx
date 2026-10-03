import Campo from './CampoAih'
import { VINCULOS } from './aihRegras'

// Seção 5 — Causas externas: acidentes ou violências (campos 36 a 45).
export default function SecaoCausasExternas({ dados, set }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>5. PREENCHER EM CASO DE CAUSAS EXTERNAS (ACIDENTES OU VIOLÊNCIAS)</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        {[['causa_externa_transito', '36 - Acidente de trânsito'], ['causa_externa_trabalho_tipico', '37 - Acidente de trabalho típico'], ['causa_externa_trabalho_trajeto', '38 - Acidente de trabalho trajeto']].map(([k, r]) => (
          <div key={k} className="col-4">
            <label className="aih-check"><input type="checkbox" checked={!!dados[k]} onChange={(e) => set(k, e.target.checked)} /> {r}</label>
          </div>
        ))}
        <Campo n="39" rotulo="CNPJ DA SEGURADORA" col={5} valor={dados.cnpj_seguradora} onChange={(v) => set('cnpj_seguradora', v)} />
        <Campo n="40" rotulo="Nº DO BILHETE" col={4} valor={dados.numero_bilhete} onChange={(v) => set('numero_bilhete', v)} />
        <Campo n="41" rotulo="SÉRIE" col={3} valor={dados.serie_bilhete} onChange={(v) => set('serie_bilhete', v)} />
        <Campo n="42" rotulo="CNPJ DA EMPRESA" col={5} valor={dados.cnpj_empresa} onChange={(v) => set('cnpj_empresa', v)} />
        <Campo n="43" rotulo="CNAE DA EMPRESA" col={4} valor={dados.cnae_empresa} onChange={(v) => set('cnae_empresa', v)} />
        <Campo n="44" rotulo="CBOR" col={3} valor={dados.cbor} onChange={(v) => set('cbor', v)} />
        <div className="col-12 aih-vinculo">
          <span>45 - VÍNCULO COM A PREVIDÊNCIA</span>
          <div>
            {VINCULOS.map((op) => (
              <label key={op.valor} className="aih-check">
                <input type="radio" name="aih-vinculo" checked={dados.vinculo_previdencia === op.valor} onChange={() => set('vinculo_previdencia', op.valor)} /> {op.rotulo}
              </label>
            ))}
            {dados.vinculo_previdencia && <button type="button" className="aih-limpar" onClick={() => set('vinculo_previdencia', '')}>limpar</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
