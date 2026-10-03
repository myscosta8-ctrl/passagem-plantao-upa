import { FREQUENCIAS_CUIDADOS } from '../constantes'
import BuscaLista from './BuscaLista'
import { CUIDADOS_ENFERMAGEM, normalizar } from './catalogoCuidados'

const OPCOES = CUIDADOS_ENFERMAGEM.map((c) => ({ ...c, extra: c.frequencia }))

// Cuidados e orientações de enfermagem: escolhidos na lista (com busca) ou escritos livremente.
// Cada linha continua editável (texto e horário) e pode ser removida.
export default function GrupoOrientacoes({ orientacoes, onCampo, onAlternar, onRemover }) {
  const escolhidos = new Set(orientacoes.filter((o) => o.texto?.trim()).map((o) => normalizar(o.texto)))
  const escolhidosChave = new Set(OPCOES.filter((o) => escolhidos.has(normalizar(o.texto))).map((o) => o.chave))
  const linhas = orientacoes.map((o, i) => ({ o, i })).filter(({ o }, _k, todas) => o.texto?.trim() || todas.length > 1 || o.frequencia)
  return (
    <>
    <BuscaLista
      opcoes={OPCOES}
      escolhidos={escolhidosChave}
      onEscolher={(op) => onAlternar(op)}
      onTextoLivre={(texto) => onAlternar({ texto, frequencia: '' })}
      placeholder="Buscar ou escrever orientação (ex: cabeceira, aspiração, acesso venoso, deambulação)"
      rotulo="Buscar orientação de enfermagem"
    />
    {linhas.length === 0 && <div className="bl-nenhum">Nenhuma orientação adicionada.</div>}
    {linhas.map(({ o, i }, n) => (
      <div key={i} className="bl-linha">
        <span className="bl-num">{n + 1}</span>
        <input type="text" className="form-control" placeholder="Orientação" value={o.texto} onChange={(e) => onCampo(i, 'texto', e.target.value)} aria-label={`Orientação ${n + 1}`} />
        <select className="form-control" value={o.frequencia || ''} onChange={(e) => onCampo(i, 'frequencia', e.target.value)} title="Horário de aferição/realização">
          <option value="">Horário</option>
          {FREQUENCIAS_CUIDADOS.map((f) => <option key={f} value={f}>{f}</option>)}
          {o.frequencia && !FREQUENCIAS_CUIDADOS.includes(o.frequencia) && <option value={o.frequencia}>{o.frequencia}</option>}
        </select>
        <button type="button" className="btn-cancel bl-remover" onClick={() => onRemover(i)} aria-label="Remover orientação" title="Remover orientação"><i className="ph ph-trash" /></button>
      </div>
    ))}
    </>
  )
}
