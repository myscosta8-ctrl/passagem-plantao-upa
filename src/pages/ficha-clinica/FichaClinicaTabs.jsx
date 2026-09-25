export const ABAS_PRINCIPAIS = [
  { chave: 'admissaoEnfermagem', rotulo: '1. Admissão de Enfermagem', icon: 'ph-notepad' },
  { chave: 'sinaisVitais', rotulo: '2. Sinais Vitais', icon: 'ph-heartbeat' },
  { chave: 'evolucao', rotulo: '3. Evolução', icon: 'ph-activity' },
  { chave: 'dispositivos', rotulo: '4. Dispositivos', icon: 'ph-plugs' },
  { chave: 'balanco', rotulo: '5. Balanço Hídrico', icon: 'ph-drop' },
];

export const ABAS_SECUNDARIAS = [
  { chave: 'escalas', rotulo: 'Escalas' },
  { chave: 'alergias', rotulo: 'Alergias' },
  { chave: 'isolamento', rotulo: 'Isolamento' },
  { chave: 'sbar', rotulo: 'Transferência SBAR' },
  { chave: 'eventosAdversos', rotulo: 'Eventos Adversos' },
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
