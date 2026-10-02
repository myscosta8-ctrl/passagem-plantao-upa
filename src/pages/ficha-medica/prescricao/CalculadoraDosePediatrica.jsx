import { calcularDosePediatrica, numBR, ARREDONDAMENTOS, FREQ_CALC } from '../../../lib/calculoPediatrico'
import { dosesPorDia } from '../constantes'
import { fmtMg, fmtMl } from './itemPrescricao'

// Calculadora de dose pediátrica injetável (janela sobre a prescrição).
export default function CalculadoraDosePediatrica({ item, calc, onChange, onAplicar, onCancelar, pacienteNome, pacientePeso }) {
  const { pesoKg, apresentacaoMg, diluenteMl, soroMl, doseTotalMg, doseCalculadaMg, doseDiariaMg, dosesDia, porDia, concentracaoMgMl, volumeAspirarMl } = calcularDosePediatrica(calc, pacientePeso)
  const faltando = [!pesoKg && 'peso', !numBR(calc.doseAlvoMgKg) && 'dose alvo', porDia && !dosesDia && 'horário de administração', !apresentacaoMg && 'apresentação', !diluenteMl && 'diluente'].filter(Boolean)

  const textoFinal = doseTotalMg && volumeAspirarMl
    ? `${item.medicamento_nome || 'Medicação'} — Diluir em ${diluenteMl} mL (AD/Diluente). Aspirar ${fmtMl(volumeAspirarMl)} mL (${fmtMg(doseTotalMg)} mg)${soroMl ? ` e rediluir em ${soroMl} mL de SF 0,9%` : ''}. ${calc.frequencia ? `Administrar de ${calc.frequencia}.` : 'Administrar conforme via prescrita.'}`
    : ''

  const podeAplicar = doseTotalMg > 0 && volumeAspirarMl > 0

  return (
    <div className="modal-overlay">
      <div className="modal-calc">
        <div className="modal-header">
          <h3><i className="ph ph-calculator"></i> Calculadora Pediátrica Injetável</h3>
          <button type="button" className="modal-close" onClick={onCancelar}><i className="ph ph-x"></i></button>
        </div>
        
        <div className="modal-body">
          <div className="calc-info-bar">
            <div className="calc-info-item">
              <label>Paciente</label>
              <span>{pacienteNome || 'Paciente'}</span>
            </div>
            <div className="calc-info-item" style={{ alignItems: 'flex-end' }}>
              <label>Peso (base de cálculo) *</label>
              <span style={{ fontSize: 'var(--fs-lg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input type="text" inputMode="decimal" autoFocus placeholder="ex.: 12,5" aria-label="Peso em kg"
                  style={{ width: 90, border: '2px solid ' + (pesoKg ? '#F5C77E' : '#DC2626'), borderRadius: 6, background: '#fff', textAlign: 'right', fontWeight: 700, color: '#B45309', outline: 'none', padding: '4px 8px', fontSize: 'var(--fs-md)' }}
                  value={calc.pesoKg !== '' ? calc.pesoKg : (pacientePeso || '')} onChange={(e) => onChange('pesoKg', e.target.value.replace(/[^\d.,]/g, ''))} /> kg
              </span>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-box" style={{ flex: 2 }}>
              <label>Medicação Selecionada</label>
              <input type="text" value={item.medicamento_nome || 'Selecione a medicação'} readOnly style={{ background: '#F8FAFC', fontWeight: 600 }} />
            </div>
            <div className="calc-box" style={{ flex: 1.3 }}>
              <label>Dose Alvo</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" placeholder="ex.: 50" value={calc.doseAlvoMgKg} onChange={(e) => onChange('doseAlvoMgKg', e.target.value.replace(/[^\d.,]/g, ''))} />
                <select value={calc.tipoDose || 'dose'} onChange={(e) => onChange('tipoDose', e.target.value)} style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }} title="Dose por tomada ou dose diária total">
                  <option value="dose">mg/kg/dose</option>
                  <option value="dia">mg/kg/dia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="calc-row">
            <div className="calc-box">
              <label>Horário de administração{porDia ? ' *' : ''}</label>
              <select value={calc.frequencia || ''} onChange={(e) => onChange('frequencia', e.target.value)}>
                <option value="">—</option>
                {FREQ_CALC.map((f) => <option key={f} value={f}>{f} ({dosesPorDia(f)}x ao dia)</option>)}
              </select>
            </div>
            <div className="calc-box">
              <label>Arredondar a dose (critério médico)</label>
              <select value={calc.arredondar || ''} onChange={(e) => onChange('arredondar', e.target.value)}>
                {ARREDONDAMENTOS.map((a) => <option key={a.v} value={a.v}>{a.r}</option>)}
              </select>
            </div>
          </div>
          {porDia && doseDiariaMg > 0 && (
            <div style={{ fontSize: 'var(--fs-xs)', color: '#0F766E', fontWeight: 600 }}>
              <i className="ph ph-divide" /> Dose diária {fmtMg(doseDiariaMg)} mg{dosesDia ? ` ÷ ${dosesDia} doses (${calc.frequencia}) = ${fmtMg(doseCalculadaMg)} mg por dose` : ' — escolha o horário de administração para dividir'}
              {doseCalculadaMg > 0 && doseTotalMg !== doseCalculadaMg ? ` → arredondada para ${fmtMg(doseTotalMg)} mg` : ''}
            </div>
          )}
          {!porDia && doseCalculadaMg > 0 && doseTotalMg !== doseCalculadaMg && (
            <div style={{ fontSize: 'var(--fs-xs)', color: '#0F766E', fontWeight: 600 }}><i className="ph ph-arrows-in-line-vertical" /> Dose calculada {fmtMg(doseCalculadaMg)} mg → arredondada para {fmtMg(doseTotalMg)} mg</div>
          )}

          <div className="calc-row">
            <div className="calc-box">
              <label>Apresentação</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" value={calc.apresentacaoMg} onChange={(e) => onChange('apresentacaoMg', e.target.value.replace(/[^\d.,]/g, ''))} />
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }}>mg</span>
              </div>
            </div>
            <div className="calc-box">
              <label>Diluente da Ampola</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" value={calc.diluenteMl} onChange={(e) => onChange('diluenteMl', e.target.value.replace(/[^\d.,]/g, ''))} />
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }}>mL (AD)</span>
              </div>
            </div>
            <div className="calc-box">
              <label>Soro de Rediluição</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" inputMode="decimal" value={calc.soroMl} onChange={(e) => onChange('soroMl', e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Opcional" />
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700 }}>mL (SF)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="calc-result-highlight" style={{ flex: 1 }}>
              <span>Dose por Administração</span>
              <strong>{doseTotalMg ? `${fmtMg(doseTotalMg)} mg` : '—'}</strong>
            </div>
            <div className="calc-result-highlight" style={{ flex: 1, background: '#FFF1F2', borderColor: '#FECDD3' }}>
              <span style={{ color: '#BE123C' }}>Volume a Aspirar{concentracaoMgMl ? ` (${fmtMg(concentracaoMgMl)} mg/mL)` : ''}</span>
              <strong style={{ color: '#BE123C' }}>{volumeAspirarMl ? `${fmtMl(volumeAspirarMl)} mL` : '—'}</strong>
            </div>
          </div>

          {!textoFinal && faltando.length > 0 && (
            <div style={{ fontSize: 'var(--fs-xs)', color: '#B45309', fontWeight: 600 }}><i className="ph ph-info" /> Para calcular, preencha: {faltando.join(', ')}.</div>
          )}
          {textoFinal && (
            <div className="calc-final-text">
              {textoFinal}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="btn-apply" onClick={onAplicar} disabled={!podeAplicar}>
            <i className="ph ph-check" /> Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
