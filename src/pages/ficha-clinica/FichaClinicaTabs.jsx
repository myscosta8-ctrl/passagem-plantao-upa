export const ABAS_PRINCIPAIS = [
  { chave: 'admissaoEnfermagem', rotulo: 'Admissão de Enfermagem', titulo: 'Admissão de Enfermagem', icon: 'ph-clipboard-text' },
  { chave: 'evolucao', rotulo: 'Evolução SAE', titulo: 'Evolução de Enfermagem (SAE)', icon: 'ph-activity' },
  { chave: 'escalasProtocolos', rotulo: 'Escalas e Protocolos', titulo: 'Escalas, Dispositivos e Alergias', icon: 'ph-gauge' },
  { chave: 'balanco', rotulo: 'Balanço Hídrico 24h', titulo: 'Balanço Hídrico 24h', icon: 'ph-drop' },
  { chave: 'sbar', rotulo: 'Transferência Externa', titulo: 'Transferência Externa', icon: 'ph-ambulance' },
  { chave: 'intercorrencias', rotulo: 'Nota de Intercorrência', titulo: 'Nota de Intercorrência', icon: 'ph-warning-octagon' },
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
