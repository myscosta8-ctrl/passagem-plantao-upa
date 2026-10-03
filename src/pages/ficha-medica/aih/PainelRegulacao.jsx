import { PROCEDIMENTOS_RAPIDOS } from './aihRegras'

// Painel lateral de "Ver Histórico": dados do estabelecimento, re-sincronizar com a admissão e
// procedimentos SIGTAP frequentes.
export default function PainelRegulacao({ onFechar, onResincronizar, onProcedimento }) {
  return (
      <>
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} onClick={() => onFechar()} />
        <aside className="tools-pane" style={{ position: 'fixed', top: 0, right: 0, width: 420, maxWidth: '100vw', height: '100vh', zIndex: 9999, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}><button type="button" onClick={() => onFechar()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--fs-lg)', color: 'var(--text-muted)' }}><i className="ph ph-x"></i></button></div>

      <div className="pane-header">
        <span >
          <i className="ph ph-hospital" style={{ fontSize: 'var(--fs-sm)' }} /> Regulação SUS / AIH
        </span>
        <span style={{ fontSize: 'var(--fs-xs)', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ph ph-check-circle" /> Conectado
        </span>
      </div>

      <div className="tools-body">
        <div className="info-integration-box" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <h3 style={{ color: '#166534', margin: 0, marginBottom: 4 }}><i className="ph ph-check" /> Estabelecimento UPA 24h</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: '#14532D', margin: 0, lineHeight: 1.4 }}>
            <strong>Unidade:</strong> UPA 24H BREVES<br />
            <strong>CNES:</strong> 2418657<br />
            <strong>Caráter:</strong> 02 - Urgência<br />
            <strong>Órgão:</strong> SEMSA BREVES / SUS
          </p>
        </div>

        <div className="info-integration-box">
          <h3 style={{ margin: 0, marginBottom: 4 }}><i className="ph ph-sparkle" /> Dados Sincronizados</h3>
          <p style={{ margin: 0, marginBottom: 6 }}>
            Os campos clínicos desta AIH foram preenchidos a partir da <strong>Admissão Médica</strong>:
          </p>
          <ul style={{ fontSize: 'var(--fs-xs)', color: '#475569', marginLeft: 16, marginBottom: 8, lineHeight: 1.4 }}>
            <li>Queixa e HDA &rarr; Sinais e Sintomas</li>
            <li>Comorbidades &rarr; CID Secundário</li>
            <li>Hipótese &rarr; CID-10 Principal</li>
          </ul>
          <button
            type="button"
            className="btn-switch-screen"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onResincronizar}
          >
            <i className="ph ph-arrows-clockwise" /> Re-sincronizar Agora
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--fs-xs)', color: 'var(--c-text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
            <i className="ph ph-needle" /> Procedimentos SIGTAP Frequentes
          </h3>
          {PROCEDIMENTOS_RAPIDOS.map((p) => (
            <button
              key={p.cod}
              type="button"
              className="template-btn"
              onClick={() => onProcedimento(p.cod, p.desc)}
            >
              <div>
                <strong>{p.rotulo}</strong>
                <span>{p.codFormatado}</span>
              </div>
              <i className="ph ph-check-circle" style={{ color: "#16A34A", fontSize: 'var(--fs-sm)' }} />
            </button>
          ))}
        </div>

      </div>
    </aside>
      </>
  )
}
