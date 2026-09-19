import { useEffect, useState } from 'react'
import { calcularIndicadoresClinicos } from '../lib/pepIndicadores'
import './PassagemForm.css'

const PERIODOS = [
  { chave: 'hoje', rotulo: 'Hoje' },
  { chave: '7dias', rotulo: 'Últimos 7 dias' },
  { chave: '30dias', rotulo: 'Últimos 30 dias' },
]

const MANCHESTER_CORES = {
  Vermelho: '#B3261E', Laranja: '#C2670A', Amarelo: '#C9A227', Verde: '#15803d', Azul: '#14507D',
  'Não classificado': '#8B98A0',
}

function formatarHoras(horas) {
  if (horas === null || horas === undefined) return '—'
  const dias = Math.floor(horas / 24)
  const resto = Math.round(horas % 24)
  return dias > 0 ? `${dias}d ${resto}h` : `${Math.round(horas)}h`
}

function Cartao({ titulo, children }) {
  return (
    <div className="form-section" style={{ marginBottom: 16 }}>
      <div className="form-section-title">{titulo}</div>
      {children}
    </div>
  )
}

function NumeroGrande({ valor, legenda }) {
  return (
    <div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--c-primary)', fontFamily: 'var(--font-mono)' }}>{valor}</div>
      {legenda && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{legenda}</div>}
    </div>
  )
}

export default function IndicadoresPainel({ onVoltar }) {
  const [periodo, setPeriodo] = useState('7dias')
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    calcularIndicadoresClinicos(periodo).then((r) => { setDados(r); setCarregando(false) })
  }, [periodo])

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Indicadores Clínicos</h1>
          <p className="page-subtitle" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
            Calculados a partir dos pacientes internados/em observação.
          </p>
        </div>
        {onVoltar && <button className="btn-fechar" onClick={onVoltar}>← Voltar</button>}
      </div>

      <div className="chip-group" style={{ margin: '18px 0 20px' }}>
        {PERIODOS.map((p) => (
          <button key={p.chave} type="button" className={`chip ${periodo === p.chave ? 'on' : ''}`} onClick={() => setPeriodo(p.chave)}>
            {p.rotulo}
          </button>
        ))}
      </div>

      {carregando || !dados ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
            <Cartao titulo="Em observação agora">
              <NumeroGrande valor={dados.emObservacaoAgora} legenda="Não depende do período — é o estado atual." />
            </Cartao>
            <Cartao titulo={`Internaram (${PERIODOS.find((p) => p.chave === periodo).rotulo.toLowerCase()})`}>
              <NumeroGrande valor={dados.internaram.total} legenda="Passaram de Em observação para Internado." />
            </Cartao>
            <Cartao titulo="Tempo médio de internação">
              <NumeroGrande valor={formatarHoras(dados.tempoMedioInternacaoHoras)} legenda="Da admissão ao desfecho, só quem chegou a internar." />
            </Cartao>
            <Cartao titulo="Tempo médio até conduta">
              <NumeroGrande valor={formatarHoras(dados.tempoMedioAteCondutaHoras)} legenda="Da admissão até internar ou ter desfecho definido." />
            </Cartao>
          </div>

          <Cartao titulo="Internação por diagnóstico">
            {dados.internaram.porDiagnostico.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhuma internação no período.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dados.internaram.porDiagnostico.map(([diagnostico, qtd]) => {
                  const max = dados.internaram.porDiagnostico[0][1]
                  return (
                    <div key={diagnostico} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 180, fontSize: 12.5, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{diagnostico}</div>
                      <div style={{ flex: 1, background: 'var(--c-surface-inset)', borderRadius: 4, height: 16, overflow: 'hidden' }}>
                        <div style={{ width: `${(qtd / max) * 100}%`, background: 'var(--c-primary)', height: '100%' }} />
                      </div>
                      <div style={{ width: 24, fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{qtd}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </Cartao>

          <Cartao titulo="Leitos ocupados por classificação de Manchester">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(dados.porManchester).length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhum paciente internado agora.</p>
              ) : (
                Object.entries(dados.porManchester).map(([cor, qtd]) => (
                  <div
                    key={cor}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                      borderRadius: 20, border: `1.5px solid ${MANCHESTER_CORES[cor] || '#8B98A0'}`,
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: MANCHESTER_CORES[cor] || '#8B98A0' }} />
                    <span style={{ fontSize: 12.5 }}>{cor}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{qtd}</span>
                  </div>
                ))
              )}
            </div>
          </Cartao>
        </>
      )}
    </div>
  )
}
