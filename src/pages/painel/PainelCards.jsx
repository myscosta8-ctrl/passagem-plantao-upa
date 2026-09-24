import IndicadoresClinicos from '../../components/IndicadoresClinicos'

export default function PainelCards({
  setoresVisiveis,
  leitos,
  pacientesPorLeito,
  passagemPorPaciente,
  menuAcoesLeitoId,
  setMenuAcoesLeitoId,
  onAbrirPassagem,
  onAbrirModalInternar,
  onAbrirRealocar,
  onAbrirLeitoExtra,
}) {
  return (
    <>
      {setoresVisiveis.map((setor) => {
        const leitosDoSetor = leitos
          .filter((l) => l.setor_id === setor.id)
          .sort((a, b) => {
            if (a.tipo !== b.tipo) return a.tipo === 'extra' ? 1 : -1
            return parseInt(a.numero, 10) - parseInt(b.numero, 10) || a.numero.localeCompare(b.numero)
          })
        const ocupados = leitosDoSetor.filter((l) => pacientesPorLeito[l.id]).length

        return (
          <div key={setor.id} className="setor-secao">
            <div className="setor-secao-titulo">
              <span>{setor.nome}</span>
              <span className="count">{ocupados} de {leitosDoSetor.length} ocupados</span>
            </div>

            <div className="leitos-grid">
              {leitosDoSetor.map((leito) => {
                const paciente = pacientesPorLeito[leito.id]
                const p = paciente ? passagemPorPaciente[paciente.id] : null
                const manchester = (paciente?.classificacao_manchester || '').toLowerCase()

                return (
                  <div
                    key={leito.id}
                    className={`leito-card ${paciente ? '' : 'vazio'}`}
                    onClick={() => (paciente ? onAbrirPassagem(paciente, leito) : onAbrirModalInternar(leito))}
                  >
                    {/* Faixa de Risco Manchester no topo */}
                    {paciente && <div className={`risk-bar risk-${manchester}`} />}

                    <div className="leito-card-header">
                      <span className={`leito-numero ${leito.tipo === 'extra' ? 'extra' : ''}`}>
                        Leito {leito.numero} {leito.tipo === 'extra' ? '· Extra' : ''}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {paciente?.classificacao_manchester && (
                          <span className={`badge-manchester ${manchester}`}>
                            {paciente.classificacao_manchester}
                          </span>
                        )}
                        {paciente && (
                          <span className={`status-badge ${paciente.status_internacao === 'Internado' ? 'internado' : 'observacao'}`}>
                            {paciente.status_internacao}
                          </span>
                        )}
                        {paciente && (
                          <div className="leito-menu-acoes no-print" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="leito-menu-botao"
                              title="Mais ações"
                              onClick={() => setMenuAcoesLeitoId(menuAcoesLeitoId === leito.id ? null : leito.id)}
                            >
                              ⋮
                            </button>
                            {menuAcoesLeitoId === leito.id && (
                              <div className="leito-menu-dropdown">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuAcoesLeitoId(null)
                                    onAbrirRealocar({ paciente, leitoOrigem: leito })
                                  }}
                                >
                                  ⇄ Realocar paciente
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {paciente ? (
                      <div className="leito-card-body">
                        <div className="leito-paciente-nome">
                          {paciente.nome}
                          {paciente.alergias && <span className="status-badge alerta">Alergia</span>}
                        </div>

                        <div className="leito-paciente-meta">
                          {paciente.idade ? `${paciente.idade} anos` : null}
                          {paciente.idade && paciente.sexo ? ' · ' : null}
                          {paciente.sexo === 'F' ? 'Feminino' : paciente.sexo === 'M' ? 'Masculino' : null}
                          {paciente.data_admissao ? ` · Adm: ${new Date(paciente.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR')}` : null}
                        </div>

                        <div className="leito-paciente-diag">
                          <strong>HD:</strong> {paciente.diagnostico || 'Sem diagnóstico registrado'}
                        </div>

                        <IndicadoresClinicos passagem={p} />

                        {p?.pendencias && (
                          <div className="leito-paciente-pendencia">
                            <strong>Pendência:</strong> {p.pendencias}
                          </div>
                        )}

                        {paciente?.ultima_alteracao_por && paciente?.ultima_alteracao_por_enfermeiro && (
                          <div className="leito-ultima-alteracao no-print">
                            {paciente.ultima_alteracao_por_enfermeiro?.nome_exibicao || paciente.ultima_alteracao_por_enfermeiro?.nome || 'Enfermeiro'}
                            {' · '}
                            {new Date(paciente.ultima_alteracao_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="leito-vazio-card">
                        <div className="vazio-icon">🛏️</div>
                        <div className="vazio-title">Leito {leito.numero} Livre</div>
                        <div className="vazio-subtitle">Clique para admitir paciente</div>
                      </div>
                    )}
                  </div>
                )
              })}
              <button className="leito-add-extra" onClick={() => onAbrirLeitoExtra(setor.id)}>
                + Abrir leito extra
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}
