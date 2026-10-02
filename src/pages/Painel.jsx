import { lazy, Suspense } from 'react'
import RealocarModal from './RealocarModal'
import ModalDesfecho from './ModalDesfecho'
import { registrarDesfechoPep } from '../lib/pepAtendimentos'
import { ModalInternar, PainelTabela, PainelCards, PainelControles } from './painel/index.js'
import PainelResumo from './painel/PainelResumo'
import { PainelProvider, usePainel } from './painel/PainelContext'
import './Painel.css'
import './painel/PainelV2.css'

const EspacoPaciente = lazy(() => import('./EspacoPaciente'))

// Componente interno que consome o contexto
function PainelInterno({ setoresIds }) {
  const {
    ehMedico,
    modo,
    enfermeiro,
    setores,
    leitos,
    pacientesPorLeito,
    modalLeito,
    setModalLeito,
    cancelarModalInternar,
    erroInternar,
    erroGeral,
    setErroGeral,
    modalPassagem,
    modalRealocar,
    setModalRealocar,
    carregando,
    visualizacao,
    abrirPassagem,
    fecharPassagem,
    carregarTudo,
    internarPaciente,
    modalDesfecho,
    setModalDesfecho,
    processandoDesfecho,
    setProcessandoDesfecho,
  } = usePainel()

  async function confirmarDesfecho(tipo, detalhe, dadosObito) {
    if (!modalDesfecho) return
    setProcessandoDesfecho(true)
    const { error } = await registrarDesfechoPep({
      atendimentoId: modalDesfecho.paciente.id,
      leitoId: modalDesfecho.leitoOrigem.id,
      tipo,
      detalhe,
      autorId: enfermeiro?.id,
      dadosObito,
    })
    setProcessandoDesfecho(false)
    if (!error) {
      setModalDesfecho(null)
      carregarTudo()
    } else {
      setErroGeral('Não foi possível registrar o desfecho. Tente de novo.')
      console.error('Erro ao sinalizar desfecho:', error)
    }
  }

  if (carregando) {
    return <div className="page"><p style={{ color: 'var(--color-text-muted)' }}>Carregando painel...</p></div>
  }

  const setoresVisiveis = setoresIds ? setores.filter((s) => setoresIds.includes(s.id)) : setores

  const novaUI = enfermeiro?.pep_beta === true

  return (
    <div className={novaUI ? 'workspace pv-workspace' : 'workspace'}>
      {novaUI ? (
        <>
          <div className="pv-barra-top">
            <h1>{ehMedico ? 'Painel Médico' : 'Painel de Leitos'}</h1>
            <span className="pv-sub">{ehMedico ? 'Pacientes internados e em observação' : 'Ocupação, risco e pendências do plantão'}</span>
            <div className="pv-ctr"><PainelControles setoresVisiveis={setoresVisiveis} /></div>
          </div>
          <PainelResumo setoresVisiveis={setoresVisiveis} />
        </>
      ) : (
      <div className="painel-header">
        <div className="painel-title">
          <h1>{ehMedico ? 'Painel Médico' : 'Painel do Plantão'}</h1>
          <p>{ehMedico ? 'Pacientes internados e em observação. Clique no paciente para abrir o prontuário médico.' : 'Visão geral de ocupação, classificação de risco e admissão de pacientes da UPA.'}</p>
        </div>
        <PainelResumo setoresVisiveis={setoresVisiveis} />
        <PainelControles setoresVisiveis={setoresVisiveis} />
      </div>
      )}

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
          onAbrirLeito={(paciente, leito) => {
            if (paciente) {
              abrirPassagem(paciente, leito)
            } else if (!ehMedico) {
              setModalLeito(leito)
            }
          }}
        />
      )}

      {visualizacao === 'cards' && (
        <PainelCards setoresVisiveis={setoresVisiveis} />
      )}

      {modalLeito && !ehMedico && (
        <ModalInternar
          leito={modalLeito}
          setorNome={setores.find((s) => s.id === modalLeito.setor_id)?.nome}
          pacientesExistentes={Object.values(pacientesPorLeito)}
          erroExterno={erroInternar}
          onCancelar={cancelarModalInternar}
          onConfirmar={(dados) => internarPaciente(modalLeito, dados)}
        />
      )}

      {modalPassagem && (
        <Suspense fallback={<div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="modal-card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Carregando prontuário do paciente...</div></div>}>
          <EspacoPaciente
            paciente={modalPassagem.paciente}
            leito={modalPassagem.leito}
            setorNome={setores.find((s) => s.id === modalPassagem.leito.setor_id)?.nome}
            onFechar={fecharPassagem}
            pilarInicial={modalPassagem.pilar || (modo === 'multi' ? 'multi' : ehMedico ? 'medico' : 'enfermagem')}
            abaInicial={modalPassagem.abaInicial}
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

      {modalDesfecho && (
        <ModalDesfecho
          nomePaciente={modalDesfecho.paciente.nome}
          numeroLeito={modalDesfecho.leitoOrigem.numero}
          processando={processandoDesfecho}
          onCancelar={() => setModalDesfecho(null)}
          onConfirmar={confirmarDesfecho}
        />
      )}
    </div>
  )
}

// Componente externo que fornece o contexto
export default function Painel({ plantao, setoresIds, modo = 'enfermagem' }) {
  return (
    <PainelProvider modo={modo}>
      <PainelInterno setoresIds={setoresIds} />
    </PainelProvider>
  )
}
