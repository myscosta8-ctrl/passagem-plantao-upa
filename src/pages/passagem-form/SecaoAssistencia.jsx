import SimNao from './SimNao'
import { DISPOSITIVOS_OPCOES, NIVEIS_CONSCIENCIA } from './constantes'

export default function SecaoAssistencia({ passagem, set, toggleDispositivo }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Assistência</div>
      <div className="form-grid">
        <div className="form-field">
          <label>Curativo realizado</label>
          <SimNao valor={passagem.curativo_realizado} onChange={(v) => set('curativo_realizado', v)} />
        </div>
        <div className="form-field">
          <label>Nível de consciência</label>
          <select
            value={passagem.nivel_consciencia ?? ''}
            onChange={(e) => set('nivel_consciencia', e.target.value)}
          >
            <option value="">—</option>
            {NIVEIS_CONSCIENCIA.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="form-field span-3">
          <label>Dispositivos invasivos</label>
          <div className="chip-group">
            {DISPOSITIVOS_OPCOES.map((d) => (
              <button
                type="button"
                key={d}
                className={`chip ${passagem.dispositivos?.includes(d) ? 'on' : ''}`}
                onClick={() => toggleDispositivo(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {passagem.dispositivos?.includes('AVP') && (
          <>
            <div className="form-field">
              <label>Data de inserção do AVP *</label>
              <input
                type="date"
                value={passagem.avp_data_insercao ?? ''}
                onChange={(e) => set('avp_data_insercao', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Hora de inserção *</label>
              <input
                type="time"
                value={passagem.avp_hora_insercao ?? ''}
                onChange={(e) => set('avp_hora_insercao', e.target.value)}
              />
            </div>
            <div className="form-field span-3">
              <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', margin: 0 }}>
                Usado para alertar a troca do AVP nas 96h.
              </p>
            </div>
          </>
        )}
        {passagem.dispositivos?.length > 0 && (
          <div className="form-field span-3">
            <label>Detalhe dos dispositivos (nº, tamanho)</label>
            <input
              type="text"
              placeholder="ex: SVD Nº16, TOT 7,5"
              value={passagem.dispositivos_detalhe ?? ''}
              onChange={(e) => set('dispositivos_detalhe', e.target.value)}
            />
          </div>
        )}
        <div className="form-field span-3">
          <label>Acompanhante presente</label>
          <SimNao valor={passagem.acompanhante} onChange={(v) => set('acompanhante', v)} />
        </div>
      </div>
    </div>
  )
}
