import { DISPOSITIVOS_OPCOES, NIVEIS_CONSCIENCIA } from '../passagem-form/constantes'
import { CHIPS_PENDENCIA_RAPIDA } from './regrasColetiva'

// Campos editáveis direto no card da Passagem Coletiva. `ed` = { campo(ps, k), editar(ps, k, v),
// pendenciaDe, dispositivosDe, detalheDe, adicionarChip, toggleDispositivo } (vêm da tela).

export function SimNao({ ps, k, ed }) {
  const v = ed.campo(ps, k)
  return (
    <div className="pc-simnao">
      <button type="button" className={v === false ? 'on' : ''} onClick={() => ed.editar(ps, k, v === false ? null : false)}>Não</button>
      <button type="button" className={v === true ? 'on' : ''} onClick={() => ed.editar(ps, k, v === true ? null : true)}>Sim</button>
    </div>
  )
}

export function BlocoAssistencia({ ps, ed }) {
  const { campo, editar } = ed
  const lista = ed.dispositivosDe(ps)
  return (
    <>
      <div className="pc-linha2">
        <div className="pc-campo"><label>Curativo realizado</label><SimNao ps={ps} k="curativo_realizado" ed={ed} /></div>
        <div className="pc-campo">
          <label>Nível de consciência</label>
          <select className="pc-input" value={campo(ps, 'nivel_consciencia') || ''} onChange={(e) => editar(ps, 'nivel_consciencia', e.target.value)}>
            <option value="">—</option>
            {NIVEIS_CONSCIENCIA.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div className="pc-campo">
        <label>Dispositivos invasivos</label>
        <div className="disp-chips">
          {DISPOSITIVOS_OPCOES.map((d) => (
            <button key={d} type="button" className={`disp-chip ${lista.includes(d) ? 'on' : ''}`} onClick={() => ed.toggleDispositivo(ps, d)}>
              <i className={`ph ${lista.includes(d) ? 'ph-check' : 'ph-plus'}`} /> {d}
            </button>
          ))}
        </div>
      </div>
      {lista.includes('AVP') && (
        <div className="pc-linha2">
          <div className="pc-campo"><label>Inserção do AVP — data</label><input className="pc-input" type="date" value={campo(ps, 'avp_data_insercao') || ''} onChange={(e) => editar(ps, 'avp_data_insercao', e.target.value)} /></div>
          <div className="pc-campo"><label>Hora</label><input className="pc-input" type="time" value={campo(ps, 'avp_hora_insercao') || ''} onChange={(e) => editar(ps, 'avp_hora_insercao', e.target.value)} /></div>
        </div>
      )}
      <div className="pc-campo">
        <label>Detalhe dos dispositivos (nº, tamanho)</label>
        <input className="pc-input" type="text" placeholder="ex: AVP nº 20, SVD nº 16" value={ed.detalheDe(ps)} onChange={(e) => editar(ps, 'dispositivos_detalhe', e.target.value)} />
      </div>
    </>
  )
}

export function BlocoTransferencia({ ps, resumo: r, ed }) {
  const { campo, editar } = ed
  return (
    <>
      <div className="pc-campo"><label>Leito liberado p/ outro hospital</label><SimNao ps={ps} k="leito_liberado_outro_hospital" ed={ed} /></div>
      {campo(ps, 'leito_liberado_outro_hospital') === true && (
        <div className="pc-linha2">
          <div className="pc-campo"><label>Qual hospital</label><input className="pc-input" type="text" value={campo(ps, 'leito_liberado_hospital') || ''} onChange={(e) => editar(ps, 'leito_liberado_hospital', e.target.value)} /></div>
          <div className="pc-campo"><label>Transporte</label><input className="pc-input" type="text" placeholder="SAMU, ambulância..." value={campo(ps, 'leito_liberado_transporte') || ''} onChange={(e) => editar(ps, 'leito_liberado_transporte', e.target.value)} /></div>
        </div>
      )}
      <div className="pc-campo"><label>Alta Sala Vermelha</label><SimNao ps={ps} k="alta_sala_vermelha" ed={ed} /></div>
      {campo(ps, 'alta_sala_vermelha') === true && (
        <div className="pc-linha2">
          <div className="pc-campo"><label>Data da alta</label><input className="pc-input" type="date" value={campo(ps, 'alta_sala_vermelha_data') || ''} onChange={(e) => editar(ps, 'alta_sala_vermelha_data', e.target.value)} /></div>
          <div className="pc-campo"><label>Horário</label><input className="pc-input" type="time" value={campo(ps, 'alta_sala_vermelha_hora') || ''} onChange={(e) => editar(ps, 'alta_sala_vermelha_hora', e.target.value)} /></div>
        </div>
      )}
      <div className="pc-resumo">
        <div className="pc-resumo-titulo"><i className="ph ph-file-text" /> Do prontuário (somente leitura)</div>
        {!r ? <p className="col-vazio">Carregando...</p> : r.itens.length === 0 ? <p className="col-vazio">Sem exames, sorologias, hemoterapia ou regulação.</p> : (
          <ul className="pc-resumo-lista">{r.itens.map((t, i) => <li key={i}>{t}</li>)}</ul>
        )}
      </div>
    </>
  )
}

export function BlocoPendencias({ ps, ed }) {
  return (
    <>
      <textarea className="pending-input" value={ed.pendenciaDe(ps)} onChange={(e) => ed.editar(ps, 'pendencias', e.target.value)} placeholder="O que o próximo turno precisa saber..." />
      <div className="quick-chips">
        {CHIPS_PENDENCIA_RAPIDA.map((c) => <span key={c} className="q-chip" onClick={() => ed.adicionarChip(ps, c)}>+ {c}</span>)}
      </div>
    </>
  )
}
