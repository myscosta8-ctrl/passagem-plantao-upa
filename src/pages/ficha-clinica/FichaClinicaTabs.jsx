export const ABAS_PRINCIPAIS = [
  { chave: 'admissaoEnfermagem', rotulo: 'Admissão', titulo: 'Admissão de Enfermagem', icon: 'ph-clipboard-text' },
  { chave: 'evolucao', rotulo: 'Evolução SAE', titulo: 'Evolução de Enfermagem (SAE)', icon: 'ph-activity' },
  { chave: 'balanco', rotulo: 'Balanço Hídrico 24h', titulo: 'Balanço Hídrico 24h', icon: 'ph-drop' },
  { chave: 'sbar', rotulo: 'Transferência SBAR', titulo: 'Transferência SBAR', icon: 'ph-ambulance' },
  { chave: 'intercorrencias', rotulo: 'Intercorrências', titulo: 'Intercorrências', icon: 'ph-warning-octagon' },
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
