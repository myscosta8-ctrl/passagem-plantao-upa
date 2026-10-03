// Painel lateral de "Ver Histórico": troca de guia (modalidade), limpar seleção e protocolos rápidos.
export default function PainelFerramentas({ modalidade, countLab, countImg, countEcg, countApac, setModalidade, onFechar, limparModalidadeAtiva, aplicarProtocolo }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }} onClick={() => onFechar()} />
      <aside className="tools-pane" style={{ position: 'fixed', top: 0, right: 0, width: 420, maxWidth: '100vw', height: '100vh', zIndex: 9999, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>
<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}><button type="button" onClick={() => onFechar()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--fs-lg)', color: 'var(--text-muted)' }}><i className="ph ph-x"></i></button></div>

    <div className="pane-header">
      <span><i className="ph ph-navigation-arrow" /> Modalidade do Pedido</span>
    </div>
    <div className="tools-body">
      <div className="summary-box">
        <h3><i className="ph ph-shield-check" /> Guia Ativa (Bloqueio Mútuo)</h3>
        <div className="modality-nav">
          <button type="button" className={'modality-btn ' + (modalidade === 'lab' ? 'active' : '')} onClick={() => setModalidade('lab')}>
            <span><i className="ph ph-flask" /> 1. Laboratório Interno</span>
            <span className="modality-badge">{countLab} exames</span>
          </button>
          <button type="button" className={'modality-btn ' + (modalidade === 'img' ? 'active' : '')} onClick={() => setModalidade('img')}>
            <span><i className="ph ph-scan" /> 2. Imagem & Radiologia</span>
            <span className="modality-badge">{countImg} exames</span>
          </button>
          <button type="button" className={'modality-btn ' + (modalidade === 'ecg' ? 'active' : '')} onClick={() => setModalidade('ecg')}>
            <span><i className="ph ph-heartbeat" /> 3. Eletrocardiograma (ECG)</span>
            <span className="modality-badge">{countEcg} exame</span>
          </button>
          <button type="button" className={'modality-btn ' + (modalidade === 'apac' ? 'active' : '')} onClick={() => setModalidade('apac')}>
            <span><i className="ph ph-file-text" /> 4. Laudo APAC (Regulação)</span>
            <span className="modality-badge">{countApac} proced.</span>
          </button>
        </div>
        <button type="button" className="btn-cancel"  onClick={limparModalidadeAtiva}>
          <i className="ph ph-trash" /> Limpar Seleção desta Guia
        </button>
      </div>

      <div className="blocking-alert-box">
        <strong><i className="ph ph-lock-key" /> Separação Física Obrigatória</strong>
        O Laboratório de Análises Clínicas, a Radiologia Digital, o Eletrocardiograma (ECG) e a Regulação de APAC são setores/fluxos distintos. Guias mistas são bloqueadas institucionalmente.
      </div>

      <div className="summary-box">
        <h3><i className="ph ph-lightning" /> Protocolos Rápidos de Emergência</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('sepse')}>
            <i className="ph ph-shield-warning" style={{ color: '#d97706' }} /> Combo Sepse / IRA (Lab)
          </button>
          <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('abdome')}>
            <i className="ph ph-scan" style={{ color: 'var(--c-primary, #0D9488)' }} /> Rotina Abdome Agudo (RX)
          </button>
          <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('ecg_urgencia')}>
            <i className="ph ph-heartbeat" style={{ color: '#dc2626' }} /> Protocolo ECG 12D (ECG)
          </button>
          <button type="button" className="btn-cancel" style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }} onClick={() => aplicarProtocolo('apac_usg')}>
            <i className="ph ph-file-text" style={{ color: '#059669' }} /> Preencher APAC - USG Total
          </button>
        </div>
      </div>
    </div>
  </aside>
    </>
  )
}
