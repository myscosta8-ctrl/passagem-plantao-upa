import SimNao from './SimNao'

export default function SecaoTransferencia({ passagem, set }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Transferência</div>
      <div className="form-grid">
        <div className="form-field">
          <label>Leito liberado p/ outro hospital</label>
          <SimNao
            valor={passagem.leito_liberado_outro_hospital}
            onChange={(v) => set('leito_liberado_outro_hospital', v)}
          />
        </div>
        {passagem.leito_liberado_outro_hospital === true && (
          <>
            <div className="form-field span-2">
              <label>Qual hospital</label>
              <input
                type="text"
                value={passagem.leito_liberado_hospital ?? ''}
                onChange={(e) => set('leito_liberado_hospital', e.target.value)}
              />
            </div>
            <div className="form-field span-3">
              <label>Tipo de transporte</label>
              <input
                type="text"
                placeholder="ex: SAMU, ambulância própria, veículo particular"
                value={passagem.leito_liberado_transporte ?? ''}
                onChange={(e) => set('leito_liberado_transporte', e.target.value)}
              />
            </div>
          </>
        )}
        <div className="form-field">
          <label>Alta Sala Vermelha</label>
          <SimNao
            valor={passagem.alta_sala_vermelha}
            onChange={(v) => set('alta_sala_vermelha', v)}
          />
        </div>
        {passagem.alta_sala_vermelha === true && (
          <>
            <div className="form-field">
              <label>Data da alta</label>
              <input
                type="date"
                value={passagem.alta_sala_vermelha_data ?? ''}
                onChange={(e) => set('alta_sala_vermelha_data', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Horário da alta</label>
              <input
                type="time"
                value={passagem.alta_sala_vermelha_hora ?? ''}
                onChange={(e) => set('alta_sala_vermelha_hora', e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
