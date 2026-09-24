import { useEffect, useState } from 'react'
import ConfirmModal from '../ConfirmModal'
import { MANCHESTER_CORES, normalizarNome } from './constantes'

export default function ModalInternar({ leito, setorNome, pacientesExistentes, erroExterno, onCancelar, onConfirmar }) {
  const travado = setorNome === 'Internação'
  const chaveRascunho = `rascunho_internar_${leito.id}`

  const [nome, setNome] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [dataAdmissao, setDataAdmissao] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [classificacaoManchester, setClassificacaoManchester] = useState('')
  const [status, setStatus] = useState(travado ? 'Internado' : 'Em observação')
  const [confirmouDuplicata, setConfirmouDuplicata] = useState(false)
  const [camposFaltando, setCamposFaltando] = useState([])

  const [rascunhoEncontrado, setRascunhoEncontrado] = useState(null)

  useEffect(() => {
    const bruto = localStorage.getItem(chaveRascunho)
    if (!bruto) return
    try {
      const rascunho = JSON.parse(bruto)
      setRascunhoEncontrado(rascunho)
    } catch {
      localStorage.removeItem(chaveRascunho)
    }
  }, [chaveRascunho])

  function continuarRascunho() {
    setNome(rascunhoEncontrado.nome ?? '')
    setDiagnostico(rascunhoEncontrado.diagnostico ?? '')
    setDataAdmissao(rascunhoEncontrado.dataAdmissao ?? '')
    setDataNascimento(rascunhoEncontrado.dataNascimento ?? '')
    setClassificacaoManchester(rascunhoEncontrado.classificacaoManchester ?? '')
    setStatus(rascunhoEncontrado.status ?? (travado ? 'Internado' : 'Em observação'))
    setRascunhoEncontrado(null)
  }

  function descartarRascunho() {
    localStorage.removeItem(chaveRascunho)
    setRascunhoEncontrado(null)
  }

  useEffect(() => {
    if (!nome.trim() && !diagnostico.trim()) return
    const atraso = setTimeout(() => {
      localStorage.setItem(chaveRascunho, JSON.stringify({ nome, diagnostico, dataAdmissao, dataNascimento, classificacaoManchester, status, quando: new Date().toISOString() }))
    }, 800)
    return () => clearTimeout(atraso)
  }, [nome, diagnostico, dataAdmissao, dataNascimento, classificacaoManchester, status, chaveRascunho])

  const duplicata = nome.trim()
    ? (pacientesExistentes ?? []).find((p) => normalizarNome(p.nome) === normalizarNome(nome))
    : null

  function cancelarComLimpeza() {
    localStorage.removeItem(chaveRascunho)
    onCancelar()
  }

  function tentarInternar() {
    const faltando = []
    if (!nome.trim()) faltando.push('Nome completo')
    if (!diagnostico.trim()) faltando.push('Diagnóstico')
    if (!dataAdmissao) faltando.push('Data de admissão')
    if (!dataNascimento) faltando.push('Data de nascimento')
    if (!classificacaoManchester) faltando.push('Classificação de Manchester')
    if (faltando.length > 0) {
      setCamposFaltando(faltando)
      return
    }
    setCamposFaltando([])

    if (duplicata && !confirmouDuplicata) {
      setConfirmouDuplicata(true) // primeiro clique só revela o aviso/confirmação
      return
    }
    localStorage.removeItem(chaveRascunho)
    onConfirmar({ nome, diagnostico, dataAdmissao, dataNascimento, classificacaoManchester, status })
  }

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h2 className="modal-title">Internar no leito {leito.numero}</h2>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nome completo *</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={nome}
              onChange={(e) => { setNome(e.target.value); setConfirmouDuplicata(false); setCamposFaltando([]) }}
              autoFocus
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Diagnóstico *</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={diagnostico}
              onChange={(e) => { setDiagnostico(e.target.value); setCamposFaltando([]) }}
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Data de admissão *</label>
            <input
              type="date"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={dataAdmissao}
              onChange={(e) => { setDataAdmissao(e.target.value); setCamposFaltando([]) }}
            />
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
              Pode ser uma data anterior a hoje (internação retroativa).
            </p>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Data de nascimento *</label>
            <input
              type="date"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }}
              value={dataNascimento}
              onChange={(e) => { setDataNascimento(e.target.value); setCamposFaltando([]) }}
            />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Classificação de Manchester *</label>
            <div className="chip-group">
              {MANCHESTER_CORES.map((c) => (
                <button
                  type="button"
                  key={c.nome}
                  onClick={() => { setClassificacaoManchester(c.nome); setCamposFaltando([]) }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1.5px solid ${c.cor}`,
                    background: classificacaoManchester === c.nome ? c.cor : 'transparent',
                    color: classificacaoManchester === c.nome ? c.texto : c.cor,
                    cursor: 'pointer',
                  }}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Status {travado && '(Internação Adulto — fixo)'}</label>
            {travado ? (
              <div className="toggle-group">
                <button type="button" className="toggle-btn on" disabled>Internado</button>
              </div>
            ) : (
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${status === 'Em observação' ? 'on' : ''}`}
                  onClick={() => setStatus('Em observação')}
                >
                  Em observação
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${status === 'Internado' ? 'on' : ''}`}
                  onClick={() => setStatus('Internado')}
                >
                  Internado
                </button>
              </div>
            )}
          </div>

          {duplicata && (
            <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>
              ⚠ Já existe um paciente com nome parecido internado: <b>{duplicata.nome}</b>.
              {confirmouDuplicata
                ? ' Clique em "Internar mesmo assim" de novo pra confirmar.'
                : ' Confira se não é a mesma pessoa antes de continuar.'}
            </div>
          )}

          {camposFaltando.length > 0 && (
            <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>
              ⚠ Preencha antes de continuar: <b>{camposFaltando.join(', ')}</b>
            </div>
          )}

          {erroExterno && (
            <div className="error-box" style={{ marginTop: 14, marginBottom: 0 }}>{erroExterno}</div>
          )}

          <div className="modal-actions">
            <button className="modal-btn-secondary" onClick={cancelarComLimpeza}>Cancelar</button>
            <button
              className="modal-btn-primary"
              onClick={tentarInternar}
              style={duplicata ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : undefined}
            >
              {duplicata ? (confirmouDuplicata ? 'Internar mesmo assim' : 'Verificar duplicata') : 'Internar'}
            </button>
          </div>
        </div>
      </div>
      {rascunhoEncontrado && (
        <ConfirmModal
          titulo="Continuar rascunho anterior?"
          mensagem={`Encontramos um rascunho não salvo de internação neste leito, de ${new Date(rascunhoEncontrado.quando).toLocaleString('pt-BR')} — a tela deve ter recarregado antes de salvar. Deseja continuar de onde parou?`}
          confirmarTexto="Continuar rascunho"
          cancelarTexto="Descartar"
          onConfirmar={continuarRascunho}
          onCancelar={descartarRascunho}
        />
      )}
    </>
  )
}
