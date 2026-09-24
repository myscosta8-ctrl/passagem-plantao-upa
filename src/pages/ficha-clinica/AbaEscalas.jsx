import { useEffect, useState } from 'react';
import { listarEscalas, registrarEscala } from '../../lib/pepClinico';

function riscoBraden(total) {
  if (total <= 9) return 'Risco muito alto'
  if (total <= 12) return 'Risco alto'
  if (total <= 14) return 'Risco moderado'
  if (total <= 18) return 'Risco baixo'
  return 'Sem risco'
}

const MORSE_CAMPOS = [
  { chave: 'historico_quedas', rotulo: 'Histórico de quedas', opcoes: [{ v: 0, t: 'Não' }, { v: 25, t: 'Sim' }] },
  { chave: 'diagnostico_secundario', rotulo: 'Diagnóstico secundário', opcoes: [{ v: 0, t: 'Não' }, { v: 15, t: 'Sim' }] },
  { chave: 'auxilio_locomocao', rotulo: 'Auxílio de locomoção', opcoes: [
    { v: 0, t: 'Nenhum / leito / cadeira de rodas / enfermeiro' }, { v: 15, t: 'Muletas / bengala / andador' }, { v: 30, t: 'Apoia-se em móveis' },
  ] },
  { chave: 'terapia_ev', rotulo: 'Terapia endovenosa', opcoes: [{ v: 0, t: 'Não' }, { v: 20, t: 'Sim' }] },
  { chave: 'marcha', rotulo: 'Marcha', opcoes: [{ v: 0, t: 'Normal / leito / imóvel' }, { v: 10, t: 'Fraca' }, { v: 20, t: 'Comprometida' }] },
  { chave: 'estado_mental', rotulo: 'Estado mental', opcoes: [
    { v: 0, t: 'Orienta-se quanto à própria capacidade' }, { v: 15, t: 'Superestima capacidade / esquece limitações' },
  ] },
]

function riscoMorse(total) {
  if (total <= 24) return 'Risco baixo'
  if (total <= 50) return 'Risco médio'
  return 'Risco alto'
}


export default function AbaEscalas({ atendimento }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [tipo, setTipo] = useState('braden')
  const [respostas, setRespostas] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarEscalas(atendimento.atendimento_id))
    setCarregando(false)
  }

  const campos = tipo === 'braden' ? BRADEN_CAMPOS : MORSE_CAMPOS
  const completo = campos.every((c) => respostas[c.chave] !== undefined)
  const total = campos.reduce((s, c) => s + (respostas[c.chave] ?? 0), 0)
  const risco = tipo === 'braden' ? riscoBraden(total) : riscoMorse(total)

  function trocarTipo(t) {
    setTipo(t)
    setRespostas({})
  }

  async function registrar() {
    if (!completo) return
    setErro('')
    setSalvando(true)
    const { error } = await registrarEscala({
      atendimentoId: atendimento.atendimento_id, tipo, pontuacao: total, nivelRisco: risco, detalhes: respostas,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível registrar. Tente de novo.')
      console.error(error)
      return
    }
    setRespostas({})
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova avaliação</div>
      <div className="form-field" style={{ marginBottom: 16, maxWidth: 260 }}>
        <div className="toggle-group">
          <button type="button" className={`toggle-btn ${tipo === 'braden' ? 'on' : ''}`} onClick={() => trocarTipo('braden')}>Braden</button>
          <button type="button" className={`toggle-btn ${tipo === 'morse' ? 'on' : ''}`} onClick={() => trocarTipo('morse')}>Morse</button>
        </div>
      </div>

      {campos.map((c) => (
        <div className="form-field span-3" key={c.chave} style={{ marginBottom: 14 }}>
          <label>{c.rotulo}</label>
          <div className="chip-group">
            {c.opcoes.map((o) => (
              <button
                key={o.v}
                type="button"
                className={`chip ${respostas[c.chave] === o.v ? 'on' : ''}`}
                onClick={() => setRespostas((p) => ({ ...p, [c.chave]: o.v }))}
              >
                {o.t} ({o.v})
              </button>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 13, fontWeight: 600, margin: '10px 0' }}>
        Pontuação: {total} — {risco}
      </p>

      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      <button className="submit-btn" style={{ maxWidth: 240 }} onClick={registrar} disabled={salvando || !completo}>
        {salvando ? 'Registrando...' : 'Registrar avaliação'}
      </button>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhuma avaliação registrada ainda.</p>
      ) : (
        <div className="hist-tabela-wrap">
          <table className="hist-tabela">
            <thead>
              <tr><th>Data/hora</th><th>Escala</th><th>Pontuação</th><th>Risco</th></tr>
            </thead>
            <tbody>
              {historico.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--c-text-muted)' }}>{new Date(e.avaliado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{e.tipo}</td>
                  <td>{e.pontuacao}</td>
                  <td><span className={`resumo-badge ${riscoClasse(e.nivel_risco)}`}>{e.nivel_risco}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


