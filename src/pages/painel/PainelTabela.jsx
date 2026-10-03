import { usePainel } from './PainelContext'
import { normalizarNome } from './constantes'
import { formatarNomeSetor, ordenarLeitos } from './PainelCards'
import { sinaisDoLeito, FILTROS_RESUMO } from './sinaisLeito'
import './PainelTabela.css'

const COR_MANCHESTER = { vermelho: '#DC2626', laranja: '#EA580C', amarelo: '#EAB308', verde: '#16A34A', azul: '#2563EB' }
const corRisco = (c) => COR_MANCHESTER[String(c || '').toLowerCase()] || null
const dataBR = (d) => (d ? new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—')

export default function PainelTabela({ setoresVisiveis, onAbrirLeito }) {
  const {
    leitos, pacientesPorLeito, passagemPorPaciente, indicadoresPorPaciente, filtroResumo,
    buscaTabela: busca, setorFiltro, statusFiltro,
    abrirPassagem, setModalLeito, setModalRealocar, setModalDesfecho,
  } = usePainel()

  const buscaNorm = normalizarNome(busca || '')

  const grupos = setoresVisiveis
    .filter((setor) => !setorFiltro || setor.id === setorFiltro || !setoresVisiveis.some((x) => x.id === setorFiltro))
    .map((setor) => {
      const linhas = (leitos || [])
        .filter((l) => l.setor_id === setor.id)
        .sort(ordenarLeitos)
        .map((leito) => {
          const paciente = pacientesPorLeito[leito.id] || null
          const sn = paciente ? sinaisDoLeito(paciente, passagemPorPaciente?.[paciente.id], indicadoresPorPaciente?.[paciente.id]) : null
          return { leito, paciente, sn }
        })
        .filter(({ leito, paciente, sn }) => {
          if (filtroResumo && (!paciente || !FILTROS_RESUMO[filtroResumo]?.(sn))) return false
          if (statusFiltro === 'ocupado' && !paciente) return false
          if (statusFiltro === 'vazio' && paciente) return false
          if (statusFiltro === 'internado' && paciente?.status_internacao !== 'Internado') return false
          if (statusFiltro === 'observacao' && paciente?.status_internacao !== 'Em observação') return false
          if (buscaNorm) {
            const alvo = normalizarNome(`${leito.numero} ${paciente?.nome || ''} ${paciente?.diagnostico || ''}`)
            if (!alvo.includes(buscaNorm)) return false
          }
          return true
        })
      return { setor, linhas, ocupados: linhas.filter((l) => l.paciente).length }
    })
    .filter((g) => g.linhas.length > 0)

  const total = grupos.reduce((n, g) => n + g.linhas.length, 0)
  const ocupados = grupos.reduce((n, g) => n + g.ocupados, 0)

  function abrir(paciente, leito) {
    if (onAbrirLeito) onAbrirLeito(paciente, leito)
    else if (paciente) abrirPassagem(paciente, leito)
    else setModalLeito(leito)
  }

  if (grupos.length === 0) return <div className="pt-vazio">Nenhum leito encontrado com esses filtros.</div>

  return (
    <div className="pt-lista">
      <div className="pt-cabecalho" aria-hidden="true">
        <span>Leito</span><span>Paciente</span><span>Diagnóstico</span><span>Permanência</span><span>Situação do dia</span><span />
      </div>
      {grupos.map(({ setor, linhas, ocupados: oc }) => (
        <section key={setor.id} className="pt-grupo">
          <header className="pt-grupo-topo">
            <span>{formatarNomeSetor(setor.nome)}</span>
            <span className="pt-grupo-contagem">{oc} ocupado(s) · {linhas.length - oc} livre(s)</span>
          </header>
          {linhas.map(({ leito, paciente, sn }) => (
            <div key={leito.id} className={`pt-linha ${!paciente ? 'livre' : ''} ${sn?.nivelAlerta ? 'alerta-' + sn.nivelAlerta : ''}`} onClick={() => abrir(paciente, leito)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') abrir(paciente, leito) }}>
              <div className="pt-leito">
                <span className="pt-leito-num">{leito.numero}</span>
                {paciente && <span className={`pt-status ${paciente.status_internacao === 'Internado' ? 'int' : 'obs'}`}>{paciente.status_internacao === 'Internado' ? 'INT' : 'OBS'}</span>}
              </div>

              {!paciente ? (
                <div className="pt-livre-texto"><i className="ph ph-bed" /> Leito livre <span>— clique para admitir</span></div>
              ) : (
                <>
                  <div className="pt-paciente">
                    <div className="pt-nome">
                      {corRisco(paciente.classificacao_manchester) && <span className="pt-risco" style={{ background: corRisco(paciente.classificacao_manchester) }} title={`Classificação: ${paciente.classificacao_manchester}`} />}
                      {paciente.nome}
                    </div>
                    <div className="pt-sub">
                      {[paciente.idade != null ? `${paciente.idade} anos` : null, paciente.sexo ? String(paciente.sexo)[0].toUpperCase() : null, paciente.data_admissao ? `adm. ${dataBR(paciente.data_admissao)}` : null].filter(Boolean).join(' · ')}
                    </div>
                    <div className="pt-tags">
                      {sn.alergia && <span className="pt-tag alergia"><i className="ph ph-warning-circle" /> {sn.alergia}</span>}
                      {sn.isolamento && <span className="pt-tag isolamento"><i className="ph ph-virus" /> {sn.isolamento}</span>}
                      {sn.regulacao && <span className="pt-tag regulacao"><i className="ph ph-ambulance" /> Regulação</span>}
                      {sn.avpDia && <span className={`pt-tag ${sn.avpDia >= 3 ? 'atencao' : ''}`} title={sn.avpDia >= 3 ? 'Avaliar troca do AVP' : ''}><i className="ph ph-syringe" /> AVP D{sn.avpDia}{sn.avpDia >= 3 ? ' — avaliar troca' : ''}</span>}
                    </div>
                  </div>
                  <div className="pt-hd" title={paciente.diagnostico || ''}>{paciente.diagnostico || <span className="pt-muted">Sem diagnóstico</span>} {paciente.diagnostico_fonte === 'aih' && <span className="hd-aih" title="Diagnóstico definido pela AIH do médico">AIH</span>}</div>
                  <div className="pt-perm">{sn.permanencia || '—'}</div>
                  <div className="pt-situacao">
                    <span className={`pt-chip presc-${sn.prescricao.nivel}`}><i className="ph ph-prescription" /> {sn.prescricao.nivel === 'ok' ? 'Prescrição ok' : sn.prescricao.texto}</span>
                    <span className={`pt-chip ${sn.conferida ? 'ok' : 'pendente'}`}><i className={`ph ${sn.conferida ? 'ph-check-circle' : 'ph-hourglass'}`} /> {sn.conferida ? 'Passagem ok' : 'Passagem a conferir'}</span>
                    {(sn.exames + sn.sorologias + sn.hemo) > 0 && <span className="pt-chip pendente"><i className="ph ph-flask" /> {sn.exames + sn.sorologias + sn.hemo} pendência(s)</span>}
                    {sn.alertas.filter((a) => a.icone !== 'ph-prescription' && a.icone !== 'ph-syringe').slice(0, 2).map((a) => <span key={a.texto} className={`pt-chip ${a.nivel}`}><i className={`ph ${a.icone}`} /> {a.texto}</span>)}
                  </div>
                </>
              )}

              <div className="pt-acoes" onClick={(e) => e.stopPropagation()}>
                {paciente ? (
                  <>
                    <button type="button" className="pt-btn pri" onClick={() => abrir(paciente, leito)} title="Abrir prontuário / passagem"><i className="ph ph-folder-open" /> Prontuário</button>
                    <button type="button" className="pt-btn" title="Realocar / transferir de leito" onClick={() => setModalRealocar({ paciente, leitoOrigem: leito })}><i className="ph ph-arrows-left-right" /></button>
                    <button type="button" className="pt-btn perigo" title="Desfecho (alta, transferência, evasão, óbito)" onClick={() => setModalDesfecho({ paciente, leitoOrigem: leito })}><i className="ph ph-sign-out" /></button>
                  </>
                ) : (
                  <button type="button" className="pt-btn" onClick={() => abrir(null, leito)}><i className="ph ph-plus" /> Admitir</button>
                )}
              </div>
            </div>
          ))}
        </section>
      ))}
      <div className="pt-rodape">{ocupados} leito(s) ocupado(s) de {total} exibido(s)</div>
    </div>
  )
}
