export const ABAS_PRINCIPAIS = [
  { chave: 'consulta', rotulo: '1. Admissão Médica', icon: 'ph-stethoscope' },
  { chave: 'aih', rotulo: '2. Laudo de AIH', icon: 'ph-hospital' },
  { chave: 'plano', rotulo: '3. Plano Terapêutico', icon: 'ph-strategy' },
  { chave: 'evolucao', rotulo: '4. Evoluções Médicas', icon: 'ph-activity' },
  { chave: 'prescricao', rotulo: '5. Prescrição Médica', icon: 'ph-pill' },
  { chave: 'exames', rotulo: '6. Exames & APAC', icon: 'ph-flask' },
  { chave: 'sangue', rotulo: '7. Hemoterapia', icon: 'ph-drop' },
  { chave: 'receituario', rotulo: '8. Receituário & Alta', icon: 'ph-file-text' },
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

    </div>
  );
}
