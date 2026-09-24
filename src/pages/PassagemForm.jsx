import ConfirmModal from './ConfirmModal'
import './PassagemForm.css'

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
        <div className="form-panel" onClick={(e) => e.stopPropagation()}>
          <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  const conteudo = (
    <>
      <div className={embedded ? "form-panel form-panel-embedded" : "form-panel"} onClick={(e) => e.stopPropagation()}>
        {!embedded && (
          <div className="form-header">
            <span className="form-leito-tag">Leito {leito.numero}</span>
            <button className="form-header-close" onClick={fecharComConfirmacao}>×</button>
          </div>
        )}

        {origemCopia && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: -14, marginBottom: 18 }}>
            Copiado do plantão de {new Date(origemCopia).toLocaleString('pt-BR')}. Ajuste o que mudou.
          </p>
        )}

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

        <div className="form-footer">
          <button className="btn-fechar" onClick={fecharComConfirmacao}>Fechar</button>
          <button className="btn-salvar" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar passagem'}
          </button>
        </div>
        {salvo && <div className="save-flag">Salvo com sucesso.</div>}
        {camposFaltando.length > 0 && (
          <div className="error-box" style={{ marginTop: 10 }}>
            ⚠ Preencha antes de salvar: <b>{camposFaltando.join(', ')}</b>
          </div>
        )}
        {erroSalvar && <div className="error-box" style={{ marginTop: 10 }}>{erroSalvar}</div>}
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
