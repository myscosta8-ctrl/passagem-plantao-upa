export const ABAS_PRINCIPAIS = [
  { chave: 'consulta', rotulo: '1. Anamnese & Admissão', icon: '🩺' },
  { chave: 'aih', rotulo: '2. Laudo de AIH', icon: '🏥' },
  { chave: 'plano', rotulo: '3. Plano Terapêutico', icon: '📋' },
  { chave: 'evolucao', rotulo: '4. Evolução Diária', icon: '📈' },
  { chave: 'prescricao', rotulo: '5. Prescrição Médica', icon: '💊' },
  { chave: 'exames', rotulo: '6. Exames & APAC', icon: '🧪' },
  { chave: 'sangue', rotulo: '7. Hemoterapia', icon: '🩸' },
  { chave: 'receituario', rotulo: '8. Receituário & Alta', icon: '📄' },
];

export const ABAS_SECUNDARIAS = [
  { chave: 'regulacao', rotulo: 'Regulação (SISREG)' },
  { chave: 'atm', rotulo: 'ATM (Antimicrobianos)' },
  { chave: 'tfd', rotulo: 'TFD (Tratamento Fora Domicílio)' },
  { chave: 'intercorrencia', rotulo: 'Nota de Intercorrência' },
  { chave: 'alta', rotulo: 'Sumário de Alta' },
  { chave: 'apac', rotulo: 'APAC' },
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
          <span>{a.icon}</span>
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
