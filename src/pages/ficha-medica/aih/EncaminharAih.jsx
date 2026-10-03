// Faixa do encaminhamento: quem não é médico escolhe o médico que vai revisar e assinar;
// o médico vê de quem recebeu a AIH pré-preenchida.
export default function EncaminharAih({ ehMedico, medicos, medicoDestino, setMedicoDestino, encaminhada, nomePreenchedor }) {
  return (
    <>
      {!ehMedico && (
        <div className="aih-encaminhar">
          <div className="aih-encaminhar-txt">
            <i className="ph ph-paper-plane-tilt" />
            <div>
              <b>Pré-preenchimento da AIH</b>
              <span>Você preenche e encaminha; o médico escolhido revisa e assina com o login dele. Só o médico finaliza o laudo.</span>
            </div>
          </div>
          <label className="aih-encaminhar-campo">
            Médico que vai revisar e assinar *
            <select value={medicoDestino} onChange={(e) => setMedicoDestino(e.target.value)}>
              <option value="">Selecione o médico...</option>
              {medicos.map((m) => <option key={m.id} value={m.id}>{(m.nome_exibicao || m.nome)}{m.crm ? ` · CRM ${m.crm}` : ''}</option>)}
            </select>
          </label>
        </div>
      )}

      {ehMedico && encaminhada && (
        <div className="aih-encaminhar recebida">
          <div className="aih-encaminhar-txt">
            <i className="ph ph-tray-arrow-down" />
            <div>
              <b>AIH encaminhada a você</b>
              <span>Pré-preenchida por {nomePreenchedor || 'outro profissional'}{encaminhada.em ? ` em ${new Date(encaminhada.em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}. Revise todos os campos; ao clicar em "Finalizar e Imprimir" o laudo sai com a sua assinatura.</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
