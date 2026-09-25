import { lazy, Suspense } from 'react'
import RealocarModal from './RealocarModal'
import { ModalInternar, PainelTabela, PainelCards, usePainelState } from './painel/index.js'
import PassagemColetiva from './PassagemColetiva'
import './Painel.css'

const EspacoPaciente = lazy(() => import('./EspacoPaciente'))

export default function Painel({ plantao, setoresIds }) {
  const {
    enfermeiro,
    setores,
    leitos,
    pacientesPorLeito,
    passagemPorPaciente,
    modalLeito,
    setModalLeito,
    erroInternar,
    setErroInternar,
    erroGeral,
    setErroGeral,
    modalPassagem,
    modalRealocar,
    setModalRealocar,
    menuAcoesLeitoId,
    setMenuAcoesLeitoId,
    carregando,
    visualizacao,
    setVisualizacao,
    buscaTabela,
    setBuscaTabela,
    setorFiltro,
    setSetorFiltro,
    statusFiltro,
    setStatusFiltro,
    abrirPassagem,
    fecharPassagem,
    carregarTudo,
    abrirLeitoExtra,
    internarPaciente,
  } = usePainelState({ plantao })

  if (carregando) {
    return <div className="page"><p style={{ color: 'var(--color-text-muted)' }}>Carregando painel...</p></div>
  }

  const setoresVisiveis = setores.filter((s) => setoresIds.includes(s.id))

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Painel do plantão</h1>
          <p className="page-subtitle" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
            Selecione um leito para internar, editar ou realocar um paciente.
          </p>
        </div>
        <div className="visualizacao-toggle">
          <button className={visualizacao === 'cards' ? 'on' : ''} onClick={() => setVisualizacao('cards')}><i className="ph ph-squares-four" /> Cards</button>
          <button className={visualizacao === 'tabela' ? 'on' : ''} onClick={() => setVisualizacao('tabela')}><i className="ph ph-list-dashes" /> Lista</button>
          <button className={visualizacao === 'coletiva' ? 'on' : ''} onClick={() => setVisualizacao('coletiva')}><i className="ph ph-arrows-clockwise" /> Passagem Coletiva</button>
        </div>
      </div>
      <div style={{ borderBottom: '1px solid var(--c-border)', marginBottom: 20 }} />

      {erroGeral && (
        <div className="error-box" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{erroGeral}</span>
          <button onClick={() => setErroGeral('')} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 700, cursor: 'pointer' }}><i className="ph ph-x" /></button>
        </div>
      )}

      {visualizacao === 'tabela' && (
        <PainelTabela
          setoresVisiveis={setoresVisiveis}
          leitos={leitos}
          pacientesPorLeito={pacientesPorLeito}
          busca={buscaTabela}
          onBusca={setBuscaTabela}
          setorFiltro={setorFiltro}
          onSetorFiltro={setSetorFiltro}
          statusFiltro={statusFiltro}
          onStatusFiltro={setStatusFiltro}
          onAbrirLeito={(leito) => {
            const paciente = pacientesPorLeito[leito.id]
            if (paciente) {
              abrirPassagem(paciente, leito)
            } else {
              setModalLeito(leito)
            }
          }}
        />
      )}

      {visualizacao === 'cards' && (
        <PainelCards
          setoresVisiveis={setoresVisiveis}
          leitos={leitos}
          pacientesPorLeito={pacientesPorLeito}
          passagemPorPaciente={passagemPorPaciente}
          menuAcoesLeitoId={menuAcoesLeitoId}
          setMenuAcoesLeitoId={setMenuAcoesLeitoId}
          onAbrirPassagem={abrirPassagem}
          onAbrirModalInternar={setModalLeito}
          onAbrirRealocar={setModalRealocar}
          onAbrirLeitoExtra={abrirLeitoExtra}
        />
      )}

      {visualizacao === 'coletiva' && (
        <PassagemColetiva
          setoresVisiveis={setoresVisiveis}
          leitos={leitos}
          pacientesPorLeito={pacientesPorLeito}
          passagemPorPaciente={passagemPorPaciente}
          enfermeiroId={enfermeiro?.id}
          onAbrirPassagem={abrirPassagem}
          onRecarregar={carregarTudo}
        />
      )}

      {modalLeito && (
        <ModalInternar
          leito={modalLeito}
          setorNome={setores.find((s) => s.id === modalLeito.setor_id)?.nome}
          pacientesExistentes={Object.values(pacientesPorLeito)}
          erroExterno={erroInternar}
          onCancelar={() => { setModalLeito(null); setErroInternar('') }}
          onConfirmar={(dados) => internarPaciente(modalLeito, dados)}
        />
      )}

      {modalPassagem && (
        <Suspense fallback={<div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="modal-card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Carregando prontuário do paciente...</div></div>}>
          <EspacoPaciente
            paciente={modalPassagem.paciente}
            leito={modalPassagem.leito}
            setorNome={setores.find((s) => s.id === modalPassagem.leito.setor_id)?.nome}
            plantaoId={plantao.id}
            enfermeiroId={enfermeiro?.id}
            enfermeiro={enfermeiro}
            onFechar={fecharPassagem}
            onSalvo={carregarTudo}
            onRealocar={(paciente, leito) => {
              fecharPassagem()
              setModalRealocar({ paciente, leitoOrigem: leito })
            }}
          />
        </Suspense>
      )}

      {modalRealocar && (
        <RealocarModal
          paciente={modalRealocar.paciente}
          leitoOrigem={modalRealocar.leitoOrigem}
          enfermeiroId={enfermeiro?.id}
          onFechar={() => setModalRealocar(null)}
          onRealocado={() => {
            setModalRealocar(null)
            carregarTudo()
          }}
        />
      )}
    </div>
  )
}
