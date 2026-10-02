import { textoValidadeAtm } from '../constantes'

// Avisos de ATM no topo da prescrição: obrigatória (sem ficha válida), em vigor e validade vencendo.
// vigenteDe(item) → { atm, validade } da ficha em vigor para aquele antimicrobiano.
export default function AlertasAtm({ restritosSemAtm, restritosCobertos, alertasAtm, vigenteDe }) {
  return (
    <>
      {restritosSemAtm.length > 0 && (
        <div className="allergy-alert" style={{ background: '#FFF7ED', borderColor: '#FDBA74', margin: '16px 20px 0' }}>
          <div className="info" style={{ color: '#9A3412' }}>
            <i className="ph ph-shield-warning" /> <strong>ATM obrigatória:</strong> {restritosSemAtm.map((it) => {
              const venc = vigenteDe(it)?.validade
              return `${it.medicamento_nome}${venc ? ` (ATM anterior ${textoValidadeAtm(venc)} — renovação)` : ''}`
            }).join(', ')} {restritosSemAtm.length > 1 ? 'são antimicrobianos' : 'é antimicrobiano'} de uso restrito por via intravenosa. Ao clicar em "Finalizar e Imprimir", a Solicitação de Uso de Antimicrobiano (ATM) abre já preenchida e sai junto com a prescrição, na mesma impressão.
          </div>
        </div>
      )}
      {restritosCobertos.length > 0 && (
        <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', margin: '16px 20px 0' }}>
          <div className="info" style={{ color: '#166534' }}>
            <i className="ph ph-shield-check" /> <strong>ATM em vigor:</strong> {restritosCobertos.map((it) => `${it.medicamento_nome} — ${textoValidadeAtm(vigenteDe(it)?.validade)}`).join('; ')}. A ficha não será emitida nem impressa de novo enquanto estiver válida.
          </div>
        </div>
      )}
      {alertasAtm.length > 0 && (
        <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA', margin: '16px 20px 0' }}>
          <div className="info" style={{ color: '#B91C1C', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <i className="ph ph-alarm" /> <strong>Validade da ATM:</strong> {alertasAtm.map((a) => `${a.medicamento} — ${a.texto}`).join('; ')}. O uso vai continuar? {alertasAtm.some((a) => a.validade.vencida) ? 'Se sim, emita nova ficha na aba ATM (ao salvar e imprimir esta prescrição ela abre já preenchida); se não, suspenda o antimicrobiano.' : 'Se sim, mantenha o antimicrobiano na prescrição — a nova ficha será pedida quando a atual vencer; se não, suspenda-o.'}
          </div>
        </div>
      )}
    </>
  )
}
