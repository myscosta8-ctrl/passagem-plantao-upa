export default function SecaoPendencias({ pendencias, set }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Observações/Pendência para o próximo plantão</div>
      <div className="form-field">
        <textarea
          value={pendencias ?? ''}
          onChange={(e) => set('pendencias', e.target.value)}
          placeholder="Descreva pendências assistenciais, exames aguardados ou avisos para a equipe seguinte..."
        />
      </div>
    </div>
  )
}
