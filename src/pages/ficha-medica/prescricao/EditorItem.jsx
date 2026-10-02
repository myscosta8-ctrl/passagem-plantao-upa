import { VIAS, UNIDADES_DOSE, FREQUENCIAS, CONDICOES_USO, DILUENTES, TEMPOS_INFUSAO } from '../constantes'
import { quantidadeDia, APRESENTACOES } from '../../../lib/frequencia'
import AutocompleteMedicamento from './AutocompleteMedicamento'
import { textoDiluicao } from './itemPrescricao'

// Medicamento em edição (último item da lista): dose, via, frequência, uso, apresentação,
// diluição (só EV/IM/SC) e opcionais. `calculadora` = janela da calculadora pediátrica, quando aberta.
export default function EditorItem({ it, i, catalogo, maisOpcoes, onCampo, onSelecionarMedicamento, onAbrirCalculadora, onLimpar, onMaisOpcoes, calculadora }) {
  return (
    <div style={{ background: 'var(--primary-light, var(--c-primary-soft, #F0FDFA))' }}>
      <div className="presc-input-row presc-input-row-compact">
        <div className="presc-input-linha1">
          <div className="item-num">{String(i + 1).padStart(2, '0')}</div>
          <AutocompleteMedicamento
            catalogo={catalogo}
            valor={it.medicamento_nome}
            onChange={(v) => onCampo('medicamento_nome', v)}
            onSelecionar={onSelecionarMedicamento} placeholder="Medicamento — princípio ativo ou nome comercial"
          />
          <button type="button" className="btn-calc-ped" onClick={onAbrirCalculadora} title="Calculadora de Dose Pediátrica">
            <i className="ph ph-calculator" /><i className="ph ph-baby" />
          </button>
          <button type="button" onClick={onLimpar} className="btn-remover-item" title="Limpar campos">
            <i className="ph ph-eraser" />
          </button>
        </div>

        {/* Linha essencial: dose, via, frequência e uso — o que toda prescrição precisa */}
        <div className="presc-input-linha2" style={{ gridTemplateColumns: '1.1fr 0.7fr 1fr 1fr 1.1fr' }}>
          <div className="presc-dose">
            <input type="text" inputMode="decimal" className="form-control" placeholder="Dose" value={it.dose} onChange={(e) => onCampo('dose', e.target.value)} />
            <select className="form-control" value={it.dose_unidade} onChange={(e) => onCampo('dose_unidade', e.target.value)} title="Unidade da dose">
              {UNIDADES_DOSE.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <select className="form-control" value={it.via} onChange={(e) => onCampo('via', e.target.value)} title="Via de administração">
            {VIAS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="form-control" value={it.frequencia} onChange={(e) => onCampo('frequencia', e.target.value)} title="Frequência">
            <option value="">Frequência</option>
            {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="form-control" value={it.condicao} onChange={(e) => onCampo('condicao', e.target.value)} title="Uso">
            <option value="">Horário fixo</option>
            {CONDICOES_USO.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="presc-apres" title="Quantidade por dose e apresentação (ampola, frasco, blister...)">
            <input type="text" inputMode="decimal" className="form-control" value={it.qtd_por_dose} onChange={(e) => onCampo('qtd_por_dose', e.target.value)} placeholder="Qtd" aria-label="Quantidade por dose" />
            <select className="form-control" value={it.apresentacao} onChange={(e) => onCampo('apresentacao', e.target.value)} aria-label="Apresentação">
              <option value="">Apres.</option>
              {APRESENTACOES.map(([sigla, nome]) => <option key={sigla} value={sigla}>{sigla} — {nome}</option>)}
            </select>
          </div>
        </div>
        {it.apresentacao && <div className="presc-qtd-dia">Quantidade no dia: <b>{quantidadeDia(it)}</b></div>}

        {/* Diluição só aparece para vias injetáveis (EV/IM/SC) */}
        {['EV', 'IM', 'SC'].includes(it.via) && (
          <div className="presc-input-linha3" style={{ gridTemplateColumns: '1.2fr 0.7fr 1.1fr' }}>
            <select className="form-control" value={it.diluente} onChange={(e) => onCampo('diluente', e.target.value)} title="Diluente">
              <option value="">Sem diluição</option>
              {DILUENTES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" inputMode="decimal" className="form-control" placeholder="Volume (mL)" value={it.diluente_ml} disabled={!it.diluente} onChange={(e) => onCampo('diluente_ml', e.target.value)} />
            <select className="form-control" value={it.tempo_infusao} onChange={(e) => onCampo('tempo_infusao', e.target.value)} title="Tempo de administração">
              <option value="">Tempo de infusão</option>
              {TEMPOS_INFUSAO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {/* Opcionais recolhidos: duração e observações */}
        {(maisOpcoes || it.duracao || it.instrucoes) ? (
          <div className="presc-input-linha3" style={{ gridTemplateColumns: '0.8fr 2fr' }}>
            <input type="text" className="form-control" placeholder="Duração (ex: 7 dias)" value={it.duracao} onChange={(e) => onCampo('duracao', e.target.value)} />
            <input type="text" className="form-control" placeholder="Observações (ex: aplicar em jejum)" value={it.instrucoes} onChange={(e) => onCampo('instrucoes', e.target.value)} />
          </div>
        ) : (
          <button type="button" className="presc-mais-opcoes" onClick={onMaisOpcoes}>
            <i className="ph ph-plus" /> Duração / observações
          </button>
        )}
        {textoDiluicao(it) && (
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            <i className="ph ph-eye" /> Na prescrição: <strong>{textoDiluicao(it)}</strong>
          </div>
        )}
      </div>

      {calculadora}
    </div>
  )
}
