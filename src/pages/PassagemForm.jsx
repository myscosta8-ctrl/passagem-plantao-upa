import ConfirmModal from './ConfirmModal'
import './PassagemForm.css'
import './ficha-medica/AtendimentoMedico.css'

import {
  usePassagemState,
  SecaoIdentificacao,
  SecaoAssistencia,
  SecaoTransferencia,
  SecaoResumoProntuario,
  SecaoPendencias
} from './passagem-form'

export default function PassagemForm({ paciente, leito, setorNome, plantaoId, enfermeiroId, onFechar, onSalvo, embedded = false }) {
  const {
    identificacao,
    passagem,
    carregando,
    salvando,
    salvo,
    erroSalvar,
    camposFaltando,
    rascunhoEncontrado,
    confirmandoFechar,
    origemCopia,
    statusTravado,
    setId,
    set,
    toggleDispositivo,
    salvar,
    fecharComConfirmacao,
    confirmarFecharDescartando,
    continuarRascunho,
    descartarRascunho,
    setConfirmandoFechar
  } = usePassagemState({ paciente, leito, setorNome, plantaoId, enfermeiroId, onSalvo, onFechar })

  if (carregando) {
    return (
      <div className="form-overlay">
        <div className="atendimento-medico-container passagem-form-scope clinical-card" onClick={(e) => e.stopPropagation()}>
          <p style={{ color: 'var(--color-text-muted)', padding: 24 }}>Carregando...</p>
        </div>
      </div>
    )
  }

  const conteudo = (
    <>
      <div className="atendimento-medico-container passagem-form-scope clinical-card" onClick={(e) => e.stopPropagation()}>
        <div className="cc-header">
          <div className="cc-title">
            <h2><i className="ph ph-arrows-clockwise" /> Passagem de Plantão — Leito {leito.numero}</h2>
            {origemCopia && (
              <p>Copiado do plantão de {new Date(origemCopia).toLocaleString('pt-BR')}. Ajuste o que mudou.</p>
            )}
          </div>
          {!embedded && (
            <button type="button" className="btn-cancel" onClick={fecharComConfirmacao}>
              <i className="ph ph-x" /> Fechar
            </button>
          )}
        </div>

        <div className="cc-body">
          <SecaoIdentificacao
            identificacao={identificacao}
            setId={setId}
            statusTravado={statusTravado}
          />

          <SecaoAssistencia
            passagem={passagem}
            set={set}
            toggleDispositivo={toggleDispositivo}
          />

          <SecaoResumoProntuario paciente={paciente} />

          <SecaoTransferencia
            passagem={passagem}
            set={set}
          />

          <SecaoPendencias
            pendencias={passagem.pendencias}
            set={set}
          />

          {salvo && (
            <div className="allergy-alert" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <div className="info" style={{ color: '#166534' }}>
                <i className="ph ph-check-circle" /> Salvo com sucesso.
              </div>
            </div>
          )}
          {camposFaltando.length > 0 && (
            <div className="allergy-alert" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <div className="info" style={{ color: '#92400E' }}>
                <i className="ph ph-warning" /> Preencha antes de salvar: <b>{camposFaltando.join(', ')}</b>
              </div>
            </div>
          )}
          {erroSalvar && (
            <div className="allergy-alert" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
              <div className="info" style={{ color: '#DC2626' }}>
                <i className="ph ph-warning" /> {erroSalvar}
              </div>
            </div>
          )}
        </div>

        <div className="cc-footer">
          <span />
          <button type="button" className="btn-save-print" onClick={salvar} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : 'Salvar passagem'}
          </button>
        </div>
      </div>

      {rascunhoEncontrado && (
        <ConfirmModal
          titulo="Continuar rascunho anterior?"
          mensagem={`Encontramos um rascunho não salvo desta passagem, de ${new Date(rascunhoEncontrado.quando).toLocaleString('pt-BR')} — provavelmente a tela recarregou antes de você conseguir salvar. Deseja continuar de onde parou?`}
          confirmarTexto="Continuar rascunho"
          cancelarTexto="Descartar"
          onConfirmar={continuarRascunho}
          onCancelar={descartarRascunho}
        />
      )}

      {confirmandoFechar && (
        <ConfirmModal
          titulo="Fechar sem salvar?"
          mensagem="Você tem alterações não salvas nesta passagem. O rascunho será descartado."
          confirmarTexto="Fechar mesmo assim"
          cancelarTexto="Continuar editando"
          perigo
          onConfirmar={confirmarFecharDescartando}
          onCancelar={() => setConfirmandoFechar(false)}
        />
      )}
    </>
  )

  if (embedded) return conteudo
  return <div className="form-overlay">{conteudo}</div>
}
