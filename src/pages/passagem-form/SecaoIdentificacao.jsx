export default function SecaoIdentificacao({ identificacao, setId, statusTravado }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Identificação</div>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Nome</label>
          <input
            type="text"
            value={identificacao.nome}
            onChange={(e) => setId('nome', e.target.value)}
          />
        </div>
        <div className="form-field span-2">
          <label>Diagnóstico</label>
          <input
            type="text"
            value={identificacao.diagnostico}
            onChange={(e) => setId('diagnostico', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Idade</label>
          <input
            type="number"
            value={identificacao.idade}
            onChange={(e) => setId('idade', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Sexo</label>
          <select value={identificacao.sexo} onChange={(e) => setId('sexo', e.target.value)}>
            <option value="">—</option>
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
          </select>
        </div>
        <div className="form-field span-2">
          <label>Status {statusTravado && '(Internação Adulto — fixo)'}</label>
          {statusTravado ? (
            <div className="toggle-group">
              <button type="button" className="toggle-btn on" disabled>Internado</button>
            </div>
          ) : (
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${identificacao.status_internacao === 'Em observação' ? 'on' : ''}`}
                onClick={() => setId('status_internacao', 'Em observação')}
              >
                Em observação
              </button>
              <button
                type="button"
                className={`toggle-btn ${identificacao.status_internacao === 'Internado' ? 'on' : ''}`}
                onClick={() => setId('status_internacao', 'Internado')}
              >
                Internado
              </button>
            </div>
          )}
        </div>
        <div className="form-field span-2">
          <label>Data de admissão</label>
          <input
            type="date"
            value={identificacao.data_admissao}
            onChange={(e) => setId('data_admissao', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Alergias</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${identificacao.alergias === false ? 'on' : ''}`}
              onClick={() => setId('alergias', false)}
            >
              Não
            </button>
            <button
              type="button"
              className={`toggle-btn ${identificacao.alergias === true ? 'on danger' : ''}`}
              onClick={() => setId('alergias', true)}
            >
              Sim
            </button>
          </div>
        </div>
        {identificacao.alergias && (
          <div className="form-field span-3">
            <label>Quais alergias</label>
            <input
              type="text"
              value={identificacao.alergias_obs}
              onChange={(e) => setId('alergias_obs', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
