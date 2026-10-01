export const ABAS_PRINCIPAIS = [
  { chave: 'admissaoEnfermagem', rotulo: '1. Admissão', titulo: 'Admissão de Enfermagem', icon: 'ph-clipboard-text' },
  { chave: 'evolucao', rotulo: '2. Evolução SAE', titulo: 'Evolução de Enfermagem', icon: 'ph-activity' },
  { chave: 'escalasProtocolos', rotulo: '3. Escalas e Protocolos', titulo: 'Escalas, Dispositivos e Alergias', icon: 'ph-gauge' },
  { chave: 'balanco', rotulo: '4. Balanço Hídrico 24h', titulo: 'Balanço Hídrico 24h', icon: 'ph-drop' },
  { chave: 'sbar', rotulo: '5. Transferência Externa', titulo: 'Transferência Externa', icon: 'ph-ambulance' },
  { chave: 'intercorrencias', rotulo: '6. Nota de Intercorrência', titulo: 'Nota de Intercorrência', icon: 'ph-warning-octagon' },
];

export default function FichaClinicaTabs({ aba, onSelecionarAba }) {
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
