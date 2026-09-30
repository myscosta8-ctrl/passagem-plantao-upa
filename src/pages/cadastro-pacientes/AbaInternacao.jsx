import { useEffect, useState } from 'react'
import ConfirmModal from '../ConfirmModal'
import { carregarLeitosOcupadosPep, sinalizarInternacaoPep } from '../../lib/pepAtendimentos'

// Sinalização de internação: enfermagem e recepção marcam o paciente como
// "Internado" (ou corrigem de volta para "Em observação"). Fica na trilha de auditoria.
export default function AbaInternacao() {
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [alvo, setAlvo] = useState(null) // { id, nome, para }
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const { pacientesPorLeito } = await carregarLeitosOcupadosPep()
    setPacientes(Object.values(pacientesPorLeito).sort((a, b) => a.nome.localeCompare(b.nome)))
    setCarregando(false)
  }

  async function confirmar() {
    if (!alvo) return
    setProcessando(true); setErro(''); setOk('')
    const { error } = await sinalizarInternacaoPep({ atendimentoId: alvo.id, novoStatus: alvo.para })
    setProcessando(false)
    if (error) {
      setErro('Não foi possível sinalizar. Tente de novo; se persistir, avise o suporte.')
      console.error('Erro ao sinalizar internação:', error)
      return
    }
    setOk(`${alvo.nome}: agora "${alvo.para}".`)
    setAlvo(null)
    carregar()
  }

  const emObs = pacientes.filter((p) => p.status_internacao !== 'Internado')
  const internados = pacientes.filter((p) => p.status_internacao === 'Internado')

  const linha = (p, para, rotulo, perigo) => (
    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{p.nome}</div>
        <div style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{p.diagnostico || 'Sem diagnóstico registrado'}</div>
      </div>
      <button type="button" className={perigo ? 'btn-cancel' : 'btn-save'} onClick={() => { setOk(''); setAlvo({ id: p.id, nome: p.nome, para }) }}>
        {rotulo}
      </button>
    </div>
  )

  return (
    <div className="form-section">
      <div className="form-section-title">Sinalizar internação</div>
      <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: -8, marginBottom: 16 }}>
        Marque aqui o paciente que passou de observação para internado. A mudança fica registrada com o seu nome, data e hora.
      </p>
      {erro && <div className="error-box" style={{ marginBottom: 14 }}>{erro}</div>}
      {ok && <div role="status" style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: 'var(--c-primary-soft, #F0FDFA)', color: 'var(--c-primary-hover, #0F766E)', fontSize: 13 }}>{ok}</div>}
      {carregando ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>
      ) : pacientes.length === 0 ? (
        <p style={{ color: 'var(--c-text-muted)' }}>Nenhum paciente no painel no momento.</p>
      ) : (
        <>
          <h4 style={{ margin: '4px 0', fontSize: 13 }}>Em observação ({emObs.length})</h4>
          {emObs.length === 0 ? <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>Ninguém em observação.</p> : emObs.map((p) => linha(p, 'Internado', 'Sinalizar internação', false))}
          <h4 style={{ margin: '18px 0 4px', fontSize: 13 }}>Internados ({internados.length})</h4>
          {internados.length === 0 ? <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>Ninguém internado.</p> : internados.map((p) => linha(p, 'Em observação', 'Voltar p/ observação', true))}
        </>
      )}

      {alvo && (
        <ConfirmModal
          titulo={alvo.para === 'Internado' ? 'Sinalizar internação' : 'Voltar para observação'}
          mensagem={`Confirma que ${alvo.nome} passa para "${alvo.para}"? Fica registrado com o seu nome, data e hora.`}
          confirmarTexto={processando ? 'Salvando...' : 'Confirmar'}
          onConfirmar={() => !processando && confirmar()}
          onCancelar={() => !processando && setAlvo(null)}
        />
      )}
    </div>
  )
}
