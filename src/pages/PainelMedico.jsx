import { useEffect, useState } from 'react'
import { listarAtendimentosAtivos } from '../lib/pepMedico'
import FichaMedica from './FichaMedica'
import './Painel.css'
import './PainelMedico.css'

export default function PainelMedico() {
  const [atendimentos, setAtendimentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [selecionado, setSelecionado] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setAtendimentos(await listarAtendimentosAtivos())
    setCarregando(false)
  }

  // Ficha aberta: ocupa a tela toda no lugar da lista (antes era renderizada abaixo da lista e passava despercebida).
  if (selecionado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%' }}>
        <FichaMedica atendimento={selecionado} onFechar={() => setSelecionado(null)} />
      </div>
    )
  }

  if (carregando) {
    return <div className="page"><p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p></div>
  }

  const porSetor = {}
  for (const a of atendimentos) {
    const chave = a.setor_nome ?? 'Sem setor'
    if (!porSetor[chave]) porSetor[chave] = []
    porSetor[chave].push(a)
  }

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <h1 className="page-title">Pacientes ativos</h1>
      <p className="page-subtitle">Selecione um paciente para abrir a ficha médica.</p>

      {Object.keys(porSetor).length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum paciente internado no momento.</p>
      )}

      {Object.entries(porSetor).map(([setor, lista]) => (
        <div key={setor} className="setor-secao">
          <div className="setor-secao-titulo">
            {setor}
            <span className="count">{lista.length}</span>
          </div>
          <div className="pm-grid">
            {lista.map((a) => {
              const extra = [a.idade ? `${a.idade} anos` : null, a.sexo === 'F' || a.sexo === 'Feminino' ? 'Feminino' : a.sexo === 'M' || a.sexo === 'Masculino' ? 'Masculino' : null].filter(Boolean).join(' · ')
              return (
                <button type="button" key={a.atendimento_id} className="pm-card" onClick={() => setSelecionado(a)}>
                  <span className={`pm-risco ${a.classificacao ? `r-${String(a.classificacao).toLowerCase()}` : ''}`} aria-hidden="true" />
                  <span className="pm-leito">Leito {a.leito_numero}</span>
                  <span className="pm-nome">{a.nome}</span>
                  {extra && <span className="pm-extra">{extra}</span>}
                  <span className="pm-abrir">Abrir ficha <i className="ph ph-arrow-right" /></span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
