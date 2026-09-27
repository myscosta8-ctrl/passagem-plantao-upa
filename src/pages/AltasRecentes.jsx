import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CORES_TIPO = {
  'Alta': { bg: 'var(--success-light)', txt: 'var(--success)' },
  'Transferência': { bg: 'var(--info-light)', txt: 'var(--info)' },
  'Evasão': { bg: 'var(--warning-light)', txt: '#B45309' },
  'Óbito': { bg: 'var(--danger-light)', txt: 'var(--danger)' },
}

export default function AltasRecentes({ onVoltar }) {
  const [desfechos, setDesfechos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const { data } = await supabase
      .from('pacientes')
      .select('*, leitos(numero, setores(nome))')
      .eq('status', 'alta')
      .gte('data_desfecho', seteDiasAtras.toISOString())
      .order('data_desfecho', { ascending: false })

    setDesfechos(data ?? [])
    setCarregando(false)
  }

  const filtrados = desfechos.filter((p) =>
    p.nome.toLowerCase().includes(busca.trim().toLowerCase())
  )

  return (
    <div className="workspace">
      <div className="page-header">
        <div className="page-title">
          <h1>Desfechos e Altas</h1>
          <p>Listagem de pacientes que receberam alta, transferência, óbito ou evasão nos últimos 7 dias.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 12 }}>
           <input
            type="text"
            placeholder="Buscar paciente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 13 }}
          />
          <button className="btn btn-outline" onClick={onVoltar}><i className="ph ph-arrow-left"></i> Voltar</button>
          <button className="btn btn-primary" onClick={() => window.print()}><i className="ph ph-file-pdf"></i> Imprimir</button>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Paciente / Prontuário</th>
              <th>Setor de Origem</th>
              <th>Data / Hora</th>
              <th>Desfecho</th>
              <th>Motivo / Diagnóstico</th>
              <th>Docs</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Carregando registros...</td>
              </tr>
            )}
            {!carregando && filtrados.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Nenhum registro encontrado.</td>
              </tr>
            )}
            {!carregando && filtrados.map(p => {
              const cor = CORES_TIPO[p.tipo_desfecho] || CORES_TIPO['Alta']
              return (
                <tr key={p.id}>
                  <td>
                    <strong>{p.nome}</strong><br/>
                    <span style={{color:'var(--text-muted)', fontSize: 12}}>
                      Idade: {p.idade ? p.idade : 'N/I'} {p.alergias_obs ? `| Alergia: ${p.alergias_obs}` : ''}
                    </span>
                  </td>
                  <td>{p.leitos ? `Leito ${p.leitos.numero} - ${p.leitos.setores?.nome}` : 'Observação'}</td>
                  <td>{new Date(p.data_desfecho).toLocaleString('pt-BR').slice(0, 16)}</td>
                  <td>
                    <span className="badge" style={{ background: cor.bg, color: cor.txt }}>
                      {p.tipo_desfecho || 'Alta Médica'}
                    </span>
                  </td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.desfecho_detalhe || p.diagnostico}>
                    {p.desfecho_detalhe || p.diagnostico || '-'}
                  </td>
                  <td>
                    <i className="ph ph-file-text" style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: 18 }} title="Ver Registro"></i>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
