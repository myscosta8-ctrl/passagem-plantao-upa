export default function CamposAtendimento({ atd, set, setores }) {
  return (
    <>
      <div className="form-section-title" style={{ marginTop: 22 }}>Atendimento</div>
      <div className="form-grid">
        <div className="form-field">
          <label>Setor</label>
          <select value={atd.setor_id} onChange={(e) => set('setor_id', e.target.value)}>
            <option value="">—</option>
            {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="form-field span-2">
          <label>Médico</label>
          <input type="text" value={atd.medico} onChange={(e) => set('medico', e.target.value)} />
        </div>
      </div>

      <div className="form-section-title" style={{ marginTop: 22 }}>Responsável pelo paciente</div>
      <p style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Pra declaração/termo de responsabilidade — assinado em papel na hora da internação.
      </p>
      <div className="form-grid">
        <div className="form-field span-2">
          <label>Nome do responsável</label>
          <input type="text" value={atd.responsavelNome} onChange={(e) => set('responsavelNome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>RG do responsável</label>
          <input type="text" value={atd.responsavelRg} onChange={(e) => set('responsavelRg', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Relação com o paciente</label>
          <input type="text" placeholder="ex: mãe, cônjuge..." value={atd.responsavelRelacao} onChange={(e) => set('responsavelRelacao', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Endereço do responsável</label>
          <input type="text" value={atd.responsavelEndereco} onChange={(e) => set('responsavelEndereco', e.target.value)} />
        </div>
      </div>
    </>
  )
}
