import Campo from './CampoAih'
import { CHIPS_JUSTIFICATIVA } from './aihRegras'

// Seção 3 — Justificativa da internação, diagnóstico e CIDs (campos 20 a 26).
export default function SecaoJustificativa({ dados, set, alternarChip }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>3. JUSTIFICATIVA DA INTERNAÇÃO</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        <div className="col-12">
          <div className="form-group">
            <label>20 - PRINCIPAIS SINAIS E SINTOMAS CLÍNICOS *</label>
            <textarea
              rows={3}
              style={{ width: '100%' }}
              value={dados.sinais_sintomas_clinicos}
              onChange={(e) => set('sinais_sintomas_clinicos', e.target.value)}
            />
          </div>
        </div>

        <div className="col-12">
          <div className="form-group">
            <label>21 - CONDIÇÕES QUE JUSTIFICAM A INTERNAÇÃO</label>
            <textarea
              rows={2}
              style={{ width: '100%' }}
              value={dados.condicoes_justificam_internacao}
              onChange={(e) => set('condicoes_justificam_internacao', e.target.value)}
            />
            <div className="quick-chips">
              {CHIPS_JUSTIFICATIVA.map(([rotulo, texto]) => (
                <span key={texto} className="quick-chip" onClick={() => alternarChip(texto)}>
                  {rotulo}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="form-group">
            <label>22 - PRINCIPAIS RESULTADOS DE PROVAS DIAGNÓSTICAS (EXAMES REALIZADOS)</label>
            <textarea
              rows={2}
              style={{ width: '100%' }}
              value={dados.resultados_provas_diagnosticas}
              onChange={(e) => set('resultados_provas_diagnosticas', e.target.value)}
            />
          </div>
        </div>

        <Campo n="23" rotulo="DIAGNÓSTICO INICIAL" col={12} destaque valor={dados.diagnostico_inicial_texto} onChange={(v) => set('diagnostico_inicial_texto', v.toUpperCase())} placeholder="Ex.: ABSCESSO GLÚTEO / INFECÇÃO DE PELE E PARTES MOLES" />
        <Campo n="24" rotulo="CID-10 PRINCIPAL" col={4} destaque valor={dados.cid_principal} onChange={(v) => set('cid_principal', v.toUpperCase().replace(/\s/g, ''))} placeholder="Ex.: L02.3" />
        <Campo n="25" rotulo="CID-10 SECUNDÁRIO" col={4} valor={dados.cid_secundario} onChange={(v) => set('cid_secundario', v.toUpperCase().replace(/\s/g, ''))} />
        <Campo n="26" rotulo="CID-10 CAUSAS ASSOCIADAS" col={4} valor={dados.cid_causas_associadas} onChange={(v) => set('cid_causas_associadas', v.toUpperCase().replace(/\s/g, ''))} />
      </div>
    </div>
  )
}
