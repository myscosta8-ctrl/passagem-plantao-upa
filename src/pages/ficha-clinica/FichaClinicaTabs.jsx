export const ABAS_PRINCIPAIS = [
  { chave: 'admissaoEnfermagem', rotulo: '1. Admissão', icon: 'ph-notepad' },
  { chave: 'evolucao', rotulo: '2. Evolução SAE', icon: 'ph-activity' },
  { chave: 'balanco', rotulo: '3. Balanço Hídrico 24h', icon: 'ph-drop' },
  { chave: 'sbar', rotulo: '4. Transferência SBAR', icon: 'ph-arrows-left-right' },
  { chave: 'intercorrencias', rotulo: '5. Intercorrências', icon: 'ph-siren' },
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
