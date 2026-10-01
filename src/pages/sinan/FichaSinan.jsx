// Réplica na tela da ficha oficial SINAN: mesmos blocos, mesma numeração e os mesmos códigos do impresso.
import { useMemo } from 'react'
import { visivel, pendencias as listarPendencias, validarCampo, valorEfetivo } from '../../lib/sinan/modeloUtil'
import './sinan.css'

function rotuloOpcao(opcoes, v) {
  const o = (opcoes || []).find(([c]) => c === v)
  return o ? `${o[0]} - ${o[1]}` : ''
}

function Campo({ campo, valor, dados, onChange }) {
  const ativo = visivel(campo, dados)
  const erro = ativo ? validarCampo(campo, valor) : null
  const id = `sn-${campo.chave}`
  let controle
  if (campo.espelho || campo.derivar) {
    const v = valorEfetivo(campo, dados)
    const txt = campo.tipo === 'codigo' ? rotuloOpcao(campo.opcoes, v) : campo.tipo === 'data' && v ? String(v).split('-').reverse().join('/') : v
    controle = <div className="sn-na sn-auto">{txt || '—'} <small>(automático)</small></div>
  } else if (!ativo) {
    controle = <div className="sn-na">{campo.senao ? rotuloOpcao(campo.opcoes, campo.senao) : 'Não se aplica'}</div>
  } else if (campo.tipo === 'codigo') {
    controle = (
      <select id={id} value={valor ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {campo.opcoes.map(([c, r]) => <option key={c} value={c}>{c} - {r}</option>)}
      </select>
    )
  } else if (campo.tipo === 'data') {
    controle = <input id={id} type="date" value={valor ?? ''} onChange={(e) => onChange(e.target.value)} />
  } else if (campo.tipo === 'digitos') {
    controle = (
      <input id={id} inputMode={campo.alfa ? 'text' : 'numeric'} className="sn-digitos" value={valor ?? ''} maxLength={campo.chave.startsWith('telefone') ? 11 : campo.digitos}
        placeholder={'0'.repeat(Math.min(campo.digitos, 15))}
        onChange={(e) => onChange((campo.alfa ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') : e.target.value.replace(/\D/g, '')).slice(0, campo.chave.startsWith('telefone') ? 11 : campo.digitos))} />
    )
  } else if (campo.tipo === 'uf') {
    controle = <input id={id} value={valor ?? ''} maxLength={2} className="sn-uf" onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} />
  } else if (campo.tipo === 'texto_longo') {
    controle = <textarea id={id} rows={4} value={valor ?? ''} onChange={(e) => onChange(e.target.value)} />
  } else {
    controle = <input id={id} value={valor ?? ''} onChange={(e) => onChange(e.target.value)} />
  }
  return (
    <div className={`sn-col sn-col-${campo.larg || 4}`}>
      <div className={`sn-campo${ativo ? '' : ' inativo'}${erro ? ' com-erro' : ''}${campo.obrig && ativo && !String(valor ?? '').trim() ? ' falta' : ''}`}>
        <label htmlFor={id}>
          {campo.n && <span className="sn-num">{campo.n}</span>}
          {campo.rotulo}{campo.obrig && ativo ? <b className="sn-obrig" title="Obrigatório">*</b> : null}
        </label>
        {controle}
        {erro && <small className="sn-erro">{erro}</small>}
      </div>
    </div>
  )
}

export default function FichaSinan({ modelo, dados, onChange, cabecalho }) {
  const set = (chave, v) => onChange({ ...dados, [chave]: v })
  const faltam = useMemo(() => listarPendencias(modelo, dados), [modelo, dados])
  return (
    <div className="sn-ficha">
      <div className="sn-topo">
        <div>
          <div className="sn-sistema">SINAN · Sistema de Informação de Agravos de Notificação</div>
          <h3>{modelo.titulo}</h3>
          {cabecalho}
        </div>
        <div className={`sn-contador${faltam.length ? '' : ' ok'}`}>
          {faltam.length ? <><i className="ph ph-warning-circle" /> {faltam.length} obrigatório(s) em branco</> : <><i className="ph ph-check-circle" /> Obrigatórios preenchidos</>}
        </div>
      </div>
      {modelo.secoes.map((s) => (
        <fieldset key={s.titulo} className="sn-secao">
          <legend>{s.titulo}</legend>
          {s.aviso && <p className="sn-aviso">{s.aviso}</p>}
          <div className="sn-grade">
            {s.campos.map((c, i) => <Campo key={`${c.chave}-${i}`} campo={c} valor={dados[c.chave]} dados={dados} onChange={(v) => set(c.chave, v)} />)}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
