export default function CamposIdentidade({ dados, set }) {
  return (
    <>
      <div className="form-section-title">Identificação</div>
      <div className="form-grid">
        <div className="form-field span-3">
          <label>Nome completo *</label>
          <input type="text" value={dados.nome} onChange={(e) => set('nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Sexo</label>
          <div className="toggle-group">
            <button type="button" className={`toggle-btn ${dados.sexo === 'F' ? 'on' : ''}`} onClick={() => set('sexo', 'F')}>Fem.</button>
            <button type="button" className={`toggle-btn ${dados.sexo === 'M' ? 'on' : ''}`} onClick={() => set('sexo', 'M')}>Masc.</button>
          </div>
        </div>
        <div className="form-field">
          <label>Data de nascimento</label>
          <input type="date" value={dados.data_nascimento} onChange={(e) => set('data_nascimento', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cartão Nacional SUS</label>
          <input type="text" value={dados.cns} onChange={(e) => set('cns', e.target.value)} />
        </div>
        <div className="form-field">
          <label>RG</label>
          <input type="text" value={dados.rg} onChange={(e) => set('rg', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CPF</label>
          <input type="text" value={dados.cpf} onChange={(e) => set('cpf', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nº registro de nascimento</label>
          <input type="text" value={dados.numero_registro_nascimento} onChange={(e) => set('numero_registro_nascimento', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: 22 }}>Endereço e contato</div>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Endereço</label>
          <input type="text" value={dados.endereco} onChange={(e) => set('endereco', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Número</label>
          <input type="text" value={dados.endereco_numero} onChange={(e) => set('endereco_numero', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Bairro</label>
          <input type="text" value={dados.bairro} onChange={(e) => set('bairro', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cidade</label>
          <input type="text" value={dados.cidade} onChange={(e) => set('cidade', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Contato</label>
          <input type="text" placeholder="(  ) ....." value={dados.telefone} onChange={(e) => set('telefone', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: 22 }}>Filiação</div>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Mãe</label>
          <input type="text" value={dados.nome_mae} onChange={(e) => set('nome_mae', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Pai</label>
          <input type="text" value={dados.nome_pai} onChange={(e) => set('nome_pai', e.target.value)} />
        </div>
      </div>
    </>
  )
}
