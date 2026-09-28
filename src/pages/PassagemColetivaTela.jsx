import { lazy, Suspense, useState } from 'react'
import RealocarModal from './RealocarModal'
import { usePainelState } from './painel/index.js'
import PassagemColetiva from './PassagemColetiva'
import PassagemForm from './PassagemForm'
import './Painel.css'

const EspacoPaciente = lazy(() => import('./EspacoPaciente'))

export default function PassagemColetivaTela({ plantao, setoresIds, onImprimir, onCompartilhar, onVoltar }) {
  const [modalPassagemForm, setModalPassagemForm] = useState(null)
  const {
    enfermeiro,
    setores,
    leitos,
    pacientesPorLeito,
    passagemPorPaciente,
    sinaisVitaisPorPaciente,
    balancoPorPaciente,
    modalPassagem,
    modalRealocar,
    setModalRealocar,
    carregando,
    abrirPassagem,
    fecharPassagem,
    carregarTudo,
  } = usePainelState({ plantao })

  if (carregando) {
    return <div className="page"><p style={{ color: 'var(--color-text-muted)' }}>Carregando passagem de plantão...</p></div>
  }

  const setoresVisiveis = setores.filter((s) => setoresIds.includes(s.id))

  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <PassagemColetiva
        plantao={plantao}
        enfermeiroNome={enfermeiro?.nome_exibicao || enfermeiro?.nome}
        setoresVisiveis={setoresVisiveis}
        onCompartilhar={onCompartilhar}
        leitos={leitos}
        pacientesPorLeito={pacientesPorLeito}
        passagemPorPaciente={passagemPorPaciente}
        sinaisVitaisPorPaciente={sinaisVitaisPorPaciente}
        balancoPorPaciente={balancoPorPaciente}
        enfermeiroId={enfermeiro?.id}
        onAbrirPassagem={abrirPassagem}
        onEditarPassagem={(paciente, leito) => setModalPassagemForm({ paciente, leito })}
        onRecarregar={carregarTudo}
        onImprimir={onImprimir}
        onVoltar={onVoltar}
      />

      {modalPassagemForm && (
        <PassagemForm
          paciente={modalPassagemForm.paciente}
          leito={modalPassagemForm.leito}
          setorNome={setores.find((s) => s.id === modalPassagemForm.leito.setor_id)?.nome}
          plantaoId={plantao.id}
          enfermeiroId={enfermeiro?.id}
          onFechar={() => setModalPassagemForm(null)}
          onSalvo={carregarTudo}
          onRealocar={() => setModalPassagemForm(null)}
        />
      )}

      {modalPassagem && (
        <Suspense fallback={<div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="modal-card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Carregando prontuário do paciente...</div></div>}>
          <EspacoPaciente
            paciente={modalPassagem.paciente}
            leito={modalPassagem.leito}
            setorNome={setores.find((s) => s.id === modalPassagem.leito.setor_id)?.nome}
            onFechar={fecharPassagem}
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
