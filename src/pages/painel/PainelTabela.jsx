import { normalizarNome } from './constantes'

export default function PainelTabela({
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  busca,
  onBusca,
  setorFiltro,
  onSetorFiltro,
  statusFiltro,
  onStatusFiltro,
  onAbrirLeito,
}) {
  const buscaNorm = normalizarNome(busca || '')

  const linhas = setoresVisiveis.flatMap((setor) => {
    const leitosDoSetor = leitos
      .filter((l) => l.setor_id === setor.id)
      .sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === 'extra' ? 1 : -1
        return parseInt(a.numero, 10) - parseInt(b.numero, 10) || a.numero.localeCompare(b.numero)
      })
    return leitosDoSetor.map((leito) => ({ setor, leito, paciente: pacientesPorLeito[leito.id] || null }))
  }).filter(({ setor, paciente }) => {
    if (setorFiltro && setor.id !== setorFiltro) return false
    if (statusFiltro === 'ocupado' && !paciente) return false
    if (statusFiltro === 'vazio' && paciente) return false
    if (statusFiltro === 'internado' && paciente?.status_internacao !== 'Internado') return false
    if (statusFiltro === 'observacao' && paciente?.status_internacao !== 'Em observação') return false
    if (buscaNorm && !(paciente && normalizarNome(paciente.nome).includes(buscaNorm))) return false
    return true
  })

  const ocupados = linhas.filter((l) => l.paciente).length

  return (
    <div>
      <div className="tabela-filtros">
        <div className="tabela-filtro-campo">
          <label>Setor</label>
          <select value={setorFiltro} onChange={(e) => onSetorFiltro(e.target.value)}>
            <option value="">Todos os setores</option>
            {setoresVisiveis.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div className="tabela-filtro-campo">
          <label>Status</label>
          <select value={statusFiltro} onChange={(e) => onStatusFiltro(e.target.value)}>
            <option value="">Todos</option>
            <option value="ocupado">Ocupados</option>
            <option value="vazio">Vazios</option>
            <option value="internado">Internado</option>
            <option value="observacao">Em observação</option>
          </select>
        </div>
        <div className="tabela-filtro-campo" style={{ flexGrow: 1 }}>
          <label>Buscar paciente</label>
          <input type="text" placeholder="Nome do paciente..." value={busca} onChange={(e) => onBusca(e.target.value)} />
        </div>
      </div>

      <div className="tabela-painel-wrap">
        <table className="tabela-painel">
          <thead>
            <tr>
              <th>Setor / Leito</th>
              <th>Paciente</th>
              <th>Status</th>
              <th>HD</th>
              <th>Admissão</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--c-text-muted)', padding: '16px 14px' }}>Nenhum leito encontrado com esses filtros.</td></tr>
            )}
            {linhas.map(({ setor, leito, paciente }) => (
              <tr key={leito.id} onClick={() => onAbrirLeito(leito)}>
                <td>{setor.nome} · L{leito.numero}</td>
                <td style={{ fontWeight: 600 }}>{paciente ? paciente.nome : <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>Leito vazio</span>}</td>
                <td>
                  {paciente && (
                    <span className={`status-badge ${paciente.status_internacao === 'Internado' ? 'internado' : 'observacao'}`}>
                      {paciente.status_internacao}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--c-text-muted)' }}>{paciente?.diagnostico || '—'}</td>
                <td style={{ color: 'var(--c-text-muted)' }}>
                  {paciente?.data_admissao ? new Date(paciente.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabela-painel-rodape">
          <span>{ocupados} leito(s) ocupado(s) de {linhas.length}</span>
        </div>
      </div>
    </div>
  )
}
