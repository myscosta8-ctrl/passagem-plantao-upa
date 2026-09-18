import { useEffect, useState } from 'react'
import { listarAtendimentosAtivos } from '../lib/pepMedico'
import FichaMedica from './FichaMedica'
import './Painel.css'

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
          <div className="leitos-grid">
            {lista.map((a) => (
              <div key={a.atendimento_id} className="leito-card" onClick={() => setSelecionado(a)}>
                <span className="leito-numero">Leito {a.leito_numero}</span>
                <div className="leito-paciente-nome">{a.nome}</div>
                <div className="leito-paciente-extra">
                  {a.idade ? `${a.idade} anos` : null}
                  {a.idade && a.sexo ? ' · ' : null}
                  {a.sexo === 'F' ? 'Feminino' : a.sexo === 'M' ? 'Masculino' : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selecionado && (
        <FichaMedica atendimento={selecionado} onFechar={() => setSelecionado(null)} />
      )}
    </div>
  )
}
