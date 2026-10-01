// Réplica na tela da ficha oficial SINAN: mesmos blocos, mesma numeração e os mesmos códigos do impresso.
import { useMemo } from 'react'
import { visivel, pendencias as listarPendencias, validarCampo, valorEfetivo, ehObrigatorio, ehCodigoOculto } from '../../lib/sinan/modeloUtil'
import { UNIDADE } from '../../lib/sinan/modelos/comum'
import './sinan.css'

function rotuloOpcao(opcoes, v) {
  const o = (opcoes || []).find(([c]) => c === v)
  return o ? `${o[0]} - ${o[1]}` : ''
}

function Campo({ campo, valor, dados, onChange }) {
  const obrig = ehObrigatorio(campo)
  const erro = validarCampo(campo, valor)
  // Campo que não se aplica ao caso e tem código automático: avisa o que sai no papel se ficar vazio.
  const dica = !visivel(campo, dados) && campo.senao && !String(valor ?? '').trim() ? `Em branco sai: ${rotuloOpcao(campo.opcoes, campo.senao)}` : null
  const id = `sn-${campo.chave}`
  let controle
  if (campo.espelho || campo.derivar) {
    const v = valorEfetivo(campo, dados)
    const txt = campo.tipo === 'codigo' || campo.tipo === 'escolha' ? rotuloOpcao(campo.opcoes, v) : campo.tipo === 'data' && v ? String(v).split('-').reverse().join('/') : v
    controle = <div className="sn-na sn-auto">{txt || '—'} <small>(automático)</small></div>
  } else if (campo.tipo === 'marca') {
    controle = (
      <label className="sn-marca"><input id={id} type="checkbox" checked={valor === '1'} onChange={(e) => onChange(e.target.checked ? '1' : '')} /> Marcar (X)</label>
    )
  } else if (campo.tipo === 'escolha') {
    controle = (
      <select id={id} value={valor ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {campo.opcoes.map(([c, r]) => <option key={c} value={c}>{r}</option>)}
      </select>
    )
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
      <div className={`sn-campo${erro ? ' com-erro' : ''}${obrig && !String(valor ?? '').trim() ? ' falta' : ''}`}>
        <label htmlFor={id}>
          {campo.n && <span className="sn-num">{campo.n}</span>}
          {campo.rotulo}{obrig ? <b className="sn-obrig" title="Obrigatório">*</b> : null}
        </label>
        {controle}
        {erro && <small className="sn-erro">{erro}</small>}
        {dica && <small className="sn-dica">{dica}</small>}
      </div>
    </div>
  )
}

const semAcento = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

// IBGE e CNES não aparecem na tela: acompanham o município/unidade digitados.
// Breves e a própria UPA recebem o código automático; qualquer outro local deixa o código em branco no papel.
function ajustarCodigos(d, chave, v) {
  const breves = semAcento(v) === semAcento(UNIDADE.municipio)
  const upa = semAcento(v) === semAcento(UNIDADE.nome)
  if (chave.startsWith('municipio_')) d[`ibge_${chave.slice(10)}`] = breves ? UNIDADE.municipio_ibge : ''
  else if (chave.endsWith('_municipio')) d[`${chave.slice(0, -10)}_ibge`] = breves ? UNIDADE.municipio_ibge : ''
  else if (chave === 'unidade_notificadora') d.cnes = upa ? UNIDADE.cnes : ''
  else if (chave === 'nome_hospital' || chave.startsWith('unidade_') || chave.startsWith('nome_hospital')) {
    const k = chave === 'nome_hospital' ? 'cnes_hospital' : `cnes_${chave.replace(/^(unidade|nome)_/, '')}`
    if (k in d || upa) d[k] = upa ? UNIDADE.cnes : ''
  }
  return d
}

export default function FichaSinan({ modelo, dados, onChange, cabecalho }) {
  const set = (chave, v) => onChange(ajustarCodigos({ ...dados, [chave]: v }, chave, v))
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
            {s.campos.map((c, i) => ehCodigoOculto(c) ? null : <Campo key={`${c.chave}-${i}`} campo={c} valor={dados[c.chave]} dados={dados} onChange={(v) => set(c.chave, v)} />)}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
