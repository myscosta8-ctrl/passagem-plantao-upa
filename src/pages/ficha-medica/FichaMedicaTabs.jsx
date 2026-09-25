export const ABAS_PRINCIPAIS = [
  { chave: 'consulta', rotulo: '1. Anamnese & Admissão', icon: 'ph-stethoscope' },
  { chave: 'aih', rotulo: '2. Laudo de AIH', icon: 'ph-hospital' },
  { chave: 'plano', rotulo: '3. Plano Terapêutico', icon: 'ph-strategy' },
  { chave: 'evolucao', rotulo: '4. Evolução Diária', icon: 'ph-activity' },
  { chave: 'prescricao', rotulo: '5. Prescrição Médica', icon: 'ph-pill' },
  { chave: 'exames', rotulo: '6. Exames & APAC', icon: 'ph-flask' },
  { chave: 'sangue', rotulo: '7. Hemoterapia', icon: 'ph-drop' },
  { chave: 'receituario', rotulo: '8. Receituário & Alta', icon: 'ph-file-text' },
];

export const ABAS_SECUNDARIAS = [
  { chave: 'regulacao', rotulo: 'Regulação (SISREG)' },
  { chave: 'atm', rotulo: 'ATM (Antimicrobianos)' },
  { chave: 'tfd', rotulo: 'TFD (Tratamento Fora Domicílio)' },
  { chave: 'intercorrencia', rotulo: 'Nota de Intercorrência' },
  { chave: 'alta', rotulo: 'Sumário de Alta' },
  { chave: 'apac', rotulo: 'APAC' },
  { chave: 'atestado', rotulo: 'Atestado Médico' },
  { chave: 'medicacoesContinuas', rotulo: 'Medicações Contínuas' },
  { chave: 'auditoria', rotulo: 'Auditoria' },
];

export default function FichaMedicaTabs({ aba, onSelecionarAba }) {
  return (
    <div className="clinical-tabs">
      {ABAS_PRINCIPAIS.map((a) => (
        <button
          key={a.chave}
          type="button"
          className={`tab-btn ${a.chave === aba ? 'active' : ''}`}
          onClick={() => onSelecionarAba(a.chave)}
        >
          <i className={`ph ${a.icon}`} />
          <span>{a.rotulo}</span>
        </button>
      ))}

      <select
        className="tab-more-select"
        value={ABAS_SECUNDARIAS.some((s) => s.chave === aba) ? aba : ''}
        onChange={(e) => {
          if (e.target.value) onSelecionarAba(e.target.value);
        }}
      >
        <option value="" disabled>Outros Documentos ▾</option>
        {ABAS_SECUNDARIAS.map((s) => (
          <option key={s.chave} value={s.chave}>
            {s.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}
