import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import PassagemForm from './PassagemForm'

export default function Pendencias({ plantao, onVoltar }) {
  const { enfermeiro } = useAuth()
  const [exames, setExames] = useState([])
  const [sorologiasPendentes, setSorologiasPendentes] = useState([])
  const [hemoderivados, setHemoderivados] = useState([])
  const [outras, setOutras] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalPassagem, setModalPassagem] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)

    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nome, diagnostico, leito_atual_id, leitos(id, numero, setor_id, setores(nome))')
      .eq('status', 'internado')

    const ids = (pacientes ?? []).map((p) => p.id)
    if (ids.length === 0) {
      setExames([])
      setSorologiasPendentes([])
      setHemoderivados([])
      setOutras([])
      setCarregando(false)
      return
    }

    const { data: passagens } = await supabase
      .from('passagens')
      .select('*')
      .in('paciente_id', ids)
      .order('criado_em', { ascending: false })

    // pega só a passagem mais recente de cada paciente
    const ultimaPorPaciente = {}
    for (const p of passagens ?? []) {
      if (!ultimaPorPaciente[p.paciente_id]) ultimaPorPaciente[p.paciente_id] = p
    }

    const listaExames = []
    const listaSorologias = []
    const listaHemo = []
    const listaOutras = []

    for (const paciente of pacientes ?? []) {
      const p = ultimaPorPaciente[paciente.id]
      if (!p) continue

      if (p.exame_status === 'A realizar' || p.exame_status === 'Aguardando laudo') {
        listaExames.push({ paciente, passagem: p })
      }
      if (p.sorologia_status === 'Coleta pendente' || p.sorologia_status === 'Aguardando resultado') {
        listaSorologias.push({ paciente, passagem: p })
      }
      if (p.hemo_solicitado === true && p.hemo_transfundido !== true) {
        listaHemo.push({ paciente, passagem: p })
      }
      if (p.pendencias) {
        listaOutras.push({ paciente, passagem: p })
      }
    }

    setExames(listaExames)
    setSorologiasPendentes(listaSorologias)
    setHemoderivados(listaHemo)
    setOutras(listaOutras)
    setCarregando(false)
  }

  function abrirPaciente(paciente) {
    if (!paciente.leitos) return
    setModalPassagem({
      paciente,
      leito: paciente.leitos,
      setorNome: paciente.leitos.setores?.nome,
    })
  }

  function Item({ paciente, texto }) {
    return (
      <div
        onClick={() => abrirPaciente(paciente)}
        style={{
          padding: '12px 4px',
          borderBottom: '1px solid var(--color-border)',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {paciente.nome}
          {paciente.leitos && (
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 12.5 }}>
              {' '}— Leito {paciente.leitos.numero} ({paciente.leitos.setores?.nome})
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>{texto}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Pendências</h1>
      <p className="page-subtitle">
        Exames, hemoderivados e observações em aberto de todos os pacientes internados. Clique num item para abrir e atualizar.
      </p>

      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="section-label">Exames a realizar / pendentes ({exames.length})</div>
            {exames.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>Nenhum.</p>}
            {exames.map(({ paciente, passagem }) => (
              <Item
                key={paciente.id}
                paciente={paciente}
                texto={[
                  passagem.exame_nome,
                  passagem.exame_status,
                  passagem.exame_status === 'A realizar' && passagem.exame_a_realizar_data
                    ? `${passagem.exame_a_realizar_data} ${passagem.exame_a_realizar_hora ?? ''} ${passagem.exame_a_realizar_local ?? ''}`
                    : null,
                ].filter(Boolean).join(' · ')}
              />
            ))}
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div className="section-label">Sorologias pendentes ({sorologiasPendentes.length})</div>
            {sorologiasPendentes.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>Nenhuma.</p>}
            {sorologiasPendentes.map(({ paciente, passagem }) => (
              <Item
                key={paciente.id}
                paciente={paciente}
                texto={[passagem.sorologias, passagem.sorologia_status, passagem.sorologia_data_coleta].filter(Boolean).join(' · ')}
              />
            ))}
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div className="section-label">Hemoderivados aguardando transfusão ({hemoderivados.length})</div>
            {hemoderivados.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>Nenhum.</p>}
            {hemoderivados.map(({ paciente, passagem }) => (
              <Item
                key={paciente.id}
                paciente={paciente}
                texto={`${passagem.hemo_tipo || 'Hemoderivado'} solicitado${passagem.hemo_quantidade ? ` (${passagem.hemo_quantidade})` : ''} — aguardando transfusão`}
              />
            ))}
          </div>

          <div className="card">
            <div className="section-label">Outras observações/pendências ({outras.length})</div>
            {outras.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>Nenhuma.</p>}
            {outras.map(({ paciente, passagem }) => (
              <Item key={paciente.id} paciente={paciente} texto={passagem.pendencias} />
            ))}
          </div>
        </>
      )}

      <button
        className="submit-btn"
        style={{ marginTop: 20, maxWidth: 200, background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
        onClick={onVoltar}
      >
        ← Voltar ao painel
      </button>

      {modalPassagem && (
        <PassagemForm
          paciente={modalPassagem.paciente}
          leito={modalPassagem.leito}
          setorNome={modalPassagem.setorNome}
          plantaoId={plantao.id}
          enfermeiroId={enfermeiro?.id}
          onFechar={() => setModalPassagem(null)}
          onSalvo={carregar}
          onRealocar={() => setModalPassagem(null)}
        />
      )}
    </div>
  )
}
