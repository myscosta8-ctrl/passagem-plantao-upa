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
              {setor.nome}
              <span className="count">{ocupados}/{leitosDoSetor.length}</span>
            </div>

            <div className="leitos-grid">
              {leitosDoSetor.map((leito) => {
                const paciente = pacientesPorLeito[leito.id]
                const p = paciente ? passagemPorPaciente[paciente.id] : null
                return (
                  <div
                    key={leito.id}
                    className={`leito-card ${paciente ? '' : 'vazio'}`}
                    onClick={() => (paciente ? onAbrirPassagem(paciente, leito) : onAbrirModalInternar(leito))}
                  >
                    <span className={`leito-numero ${leito.tipo === 'extra' ? 'extra' : ''}`}>
                      Leito {leito.numero}
                    </span>
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
                    {paciente ? (
                      <>
                        <div className="leito-paciente-nome">
                          {paciente.nome}
                          <span className={`status-badge ${paciente.status_internacao === 'Internado' ? 'internado' : 'observacao'}`}>
                            {paciente.status_internacao}
                          </span>
                          {paciente.alergias && <span className="status-badge alerta">Alergia</span>}
                        </div>
                        <div className="leito-paciente-diag">HD: {paciente.diagnostico || 'Sem diagnóstico registrado'}</div>
                        <div className="leito-paciente-extra">
                          {paciente.idade ? `${paciente.idade} anos` : null}
                          {paciente.idade && paciente.sexo ? ' · ' : null}
                          {paciente.sexo === 'F' ? 'Feminino' : paciente.sexo === 'M' ? 'Masculino' : null}
                          {paciente.data_admissao ? ` · Admissão: ${new Date(paciente.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR')}` : null}
                        </div>
                        <IndicadoresClinicos passagem={p} />
                        {p?.pendencias && (
                          <div className="leito-paciente-pendencia">{p.pendencias}</div>
                        )}
                        {paciente?.ultima_alteracao_por && paciente?.ultima_alteracao_por_enfermeiro && (
                          <div className="leito-ultima-alteracao no-print">
                            Última alteração: {paciente.ultima_alteracao_por_enfermeiro?.nome_exibicao || paciente.ultima_alteracao_por_enfermeiro?.nome || 'desconhecido'}
                            {' — '}
                            {new Date(paciente.ultima_alteracao_em).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="leito-vazio-texto">Leito vazio — clique para internar</div>
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
