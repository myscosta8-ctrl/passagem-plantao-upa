import { useState } from 'react'

export const TIPOS_DESFECHO = [
  { tipo: 'Alta', legenda: 'Alta médica normal' },
  { tipo: 'Transferência', legenda: 'Encaminhado para outra unidade/hospital' },
  { tipo: 'Evasão', legenda: 'Saiu sem alta médica' },
  { tipo: 'Óbito', legenda: 'Foi a óbito' },
]

export default function ModalDesfecho({ nomePaciente, numeroLeito, processando, onCancelar, onConfirmar }) {
  const [tipo, setTipo] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const [dataHoraObito, setDataHoraObito] = useState('')
  const [causaMortis, setCausaMortis] = useState('')
  const [medicoAtestante, setMedicoAtestante] = useState('')
  const [comunicadoFamilia, setComunicadoFamilia] = useState('')

  function confirmar() {
    const dadosObito = tipo === 'Óbito'
      ? { data_hora_obito: dataHoraObito || null, causa_mortis: causaMortis || null, medico_atestante: medicoAtestante || null, comunicado_familia: comunicadoFamilia || null }
      : null
    onConfirmar(tipo, detalhe, dadosObito)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Desfecho de {nomePaciente}</h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: -10, marginBottom: 16 }}>
          {numeroLeito ? `O leito ${numeroLeito} fica liberado. ` : ''}Isso fica registrado no histórico dos próximos 7 dias.
        </p>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>O que aconteceu?</label>
          <div className="chip-group">
            {TIPOS_DESFECHO.map((op) => (
              <button
                type="button"
                key={op.tipo}
                className={`chip ${tipo === op.tipo ? 'on' : ''}`}
                onClick={() => setTipo(tipo === op.tipo ? '' : op.tipo)}
              >
                {op.tipo}
              </button>
            ))}
          </div>
          {tipo && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>{TIPOS_DESFECHO.find((o) => o.tipo === tipo)?.legenda}</p>}
        </div>

        {(tipo === 'Transferência' || tipo === 'Óbito') && (
          <div className="field" style={{ marginBottom: tipo === 'Óbito' ? 14 : 0 }}>
            <label>{tipo === 'Transferência' ? 'Para qual unidade/hospital' : 'Observação (opcional)'}</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={detalhe}
              onChange={(e) => setDetalhe(e.target.value)}
            />
          </div>
        )}

        {tipo === 'Óbito' && (
          <>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Data/hora do óbito</label>
              <input
                type="datetime-local"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={dataHoraObito}
                onChange={(e) => setDataHoraObito(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Causa mortis</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={causaMortis}
                onChange={(e) => setCausaMortis(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Médico que atestou</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                value={medicoAtestante}
                onChange={(e) => setMedicoAtestante(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Comunicado à família</label>
              <div className="chip-group">
                {['Sim', 'Não'].map((op) => (
                  <button
                    type="button"
                    key={op}
                    className={`chip ${comunicadoFamilia === op ? 'on' : ''}`}
                    onClick={() => setComunicadoFamilia(comunicadoFamilia === op ? '' : op)}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button
            className="modal-btn-primary"
            disabled={!tipo || processando}
            onClick={confirmar}
          >
            {processando ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
