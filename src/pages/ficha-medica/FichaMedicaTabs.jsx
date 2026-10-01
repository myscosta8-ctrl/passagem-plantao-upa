export const ABAS_PRINCIPAIS = [
  { chave: 'consulta', rotulo: '1. Admissão', titulo: 'Admissão Médica', icon: 'ph-stethoscope' },
  { chave: 'aih', rotulo: '2. AIH', titulo: 'Laudo de AIH', icon: 'ph-hospital' },
  { chave: 'plano', rotulo: '3. Plano Terapêutico', icon: 'ph-strategy' },
  { chave: 'evolucao', rotulo: '4. Evoluções', titulo: 'Evoluções Médicas', icon: 'ph-activity' },
  { chave: 'prescricao', rotulo: '5. Prescrição', titulo: 'Prescrição Médica', icon: 'ph-pill' },
  { chave: 'exames', rotulo: '6. Exames & APAC', icon: 'ph-flask' },
  { chave: 'sangue', rotulo: '7. Sangue e Derivados', titulo: 'Solicitação de Sangue, Componentes e Derivados', icon: 'ph-drop' },
  { chave: 'receituario', rotulo: '8. Documentos de Alta', titulo: 'Documentos de Alta do Paciente', icon: 'ph-file-text' },
  { chave: 'sinan', rotulo: '9. Notificação Compulsória', titulo: 'Notificação Compulsória (SINAN)', icon: 'ph-megaphone' },
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
