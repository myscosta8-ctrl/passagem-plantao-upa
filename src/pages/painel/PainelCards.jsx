import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePainel } from './PainelContext'
import ConfirmModal from '../ConfirmModal'
import { sinalizarInternacaoPep } from '../../lib/pepAtendimentos'
import { normalizarNome } from './constantes'
import styles from './PainelCards.module.css'
import { sinaisDoLeito, FILTROS_RESUMO } from './sinaisLeito'
import './PainelSinais.css'
const cx = (...classes) => classes.filter(Boolean).map(c => styles[c] || c).join(' ')

export function formatarNomeSetor(nome) {
  if (!nome) return ''
  const n = nome.toLowerCase()
  if (n.includes('vermelha')) return 'Sala Vermelha - Emergência'
  if (n === 'internação' || n === 'internacao') return 'Internação Adulto'
  if (n.includes('pediátr') || n.includes('pediatr')) return 'Observação Pediátrica'
  if (n.includes('observa')) return 'Sala Amarela - Observação Adulto'
  return nome
}

export function formatarNumeroLeito(numero) {
  if (!numero) return ''
  const s = String(numero).trim()
  if (s.toLowerCase().includes('extra')) return s
  if (s === '17-ISO') return '17 (Isolamento)'
  if (s === '06-ISO') return '06 (Isolamento)'
  if (s === '09-ISO') return '09 (Isolamento)'
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && n < 10) return `0${n}`
  return s
}

export function formatarNomePaciente(nome) {
  if (!nome) return 'Paciente N/I'
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => {
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(p)) return p
      return p.charAt(0).toUpperCase() + p.slice(1)
    })
    .join(' ')
}

export function obterClasseRisco(classificacao, setorNome) {
  if (classificacao) {
    const c = classificacao.toLowerCase()
    if (c.includes('verm') || c.includes('emerg')) return 'vermelho'
    if (c.includes('laran') || c.includes('muito')) return 'laranja'
    if (c.includes('amar') || c.includes('urg')) return 'amarelo'
    if (c.includes('verd') || c.includes('pouco')) return 'verde'
    if (c.includes('azul') || c.includes('não') || c.includes('nao')) return 'azul'
  }
  const s = (setorNome || '').toLowerCase()
  if (s.includes('verm') || s.includes('emerg')) return 'vermelho'
  if (s.includes('interna')) return 'laranja'
  return 'amarelo'
}

function formatarAdmissao(dataStr) {
  if (!dataStr) return 'Não informada'
  try {
    const d = new Date(dataStr.includes('T') ? dataStr : `${dataStr}T12:00:00`)
    const hoje = new Date()
    const ehHoje = d.toDateString() === hoje.toDateString()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const ehOntem = d.toDateString() === ontem.toDateString()

    const hora = dataStr.includes('T')
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : ''

    if (ehHoje) return `Hoje${hora ? `, ${hora}` : ''}`
    if (ehOntem) return `Ontem${hora ? `, ${hora}` : ''}`

    const diffHoras = Math.floor((hoje - d) / (1000 * 60 * 60))
    if (diffHoras < 72 && diffHoras > 0) return `Há ${diffHoras}h`

    return `${d.toLocaleDateString('pt-BR')}${hora ? `, ${hora}` : ''}`
  } catch {
    return dataStr
  }
}

export function ordenarLeitos(a, b) {
  const an = String(a.numero).toLowerCase()
  const bn = String(b.numero).toLowerCase()
  const aEx = an.includes('extra')
  const bEx = bn.includes('extra')
  if (aEx && !bEx) return 1
  if (!aEx && bEx) return -1
  return an.localeCompare(bn, undefined, { numeric: true })
}

export default function PainelCards({ setoresVisiveis }) {
  const {
    leitos,
    pacientesPorLeito,
    passagemPorPaciente,
    buscaTabela: busca,
    setorFiltro,
    statusFiltro,
    menuAcoesLeitoId,
    setMenuAcoesLeitoId,
    abrirPassagem,
    setModalLeito,
    setModalRealocar,
    setModalDesfecho,
    abrirLeitoExtra,
    indicadoresPorPaciente,
    filtroResumo,
    enfermeiro,
    ehMedico,
  } = usePainel()
  const novaUI = enfermeiro?.pep_beta === true
  const queryClient = useQueryClient()
  const [confirmarInternacao, setConfirmarInternacao] = useState(null)
  const [erroInternacao, setErroInternacao] = useState('')

  async function sinalizarInternado() {
    const alvo = confirmarInternacao
    if (!alvo) return
    const { error } = await sinalizarInternacaoPep({ atendimentoId: alvo.paciente.id, novoStatus: 'Internado' })
    setConfirmarInternacao(null)
    if (error) { setErroInternacao('Não foi possível sinalizar a internação. Tente de novo.'); return }
    setErroInternacao('')
    queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => old && ({
      ...old,
      pacientesPorLeito: { ...(old.pacientesPorLeito || {}), [alvo.leito.id]: { ...alvo.paciente, status_internacao: 'Internado' } },
    }))
  }

  const buscaNorm = normalizarNome(busca || '')

  return (
    <>
      {setoresVisiveis
        .filter((setor) => !setorFiltro || setor.id === setorFiltro)
        .map((setor) => {
          const leitosDoSetor = (leitos || [])
            .filter((l) => l.setor_id === setor.id)
            .filter((l) => {
              const paciente = pacientesPorLeito[l.id]

              if (filtroResumo) {
                if (!paciente) return false
                const sn = sinaisDoLeito(paciente, passagemPorPaciente[paciente.id], indicadoresPorPaciente[paciente.id])
                if (!FILTROS_RESUMO[filtroResumo](sn)) return false
              }
              if (statusFiltro === 'ocupado' && !paciente) return false
              if (statusFiltro === 'vazio' && paciente) return false
              if (statusFiltro === 'internado' && paciente?.status_internacao !== 'Internado') return false
              if (statusFiltro === 'observacao' && paciente?.status_internacao !== 'Em observação') return false

              if (buscaNorm) {
                const numeroNorm = normalizarNome(l.numero?.toString() || '')
                const bateNome = paciente && normalizarNome(paciente.nome || '').includes(buscaNorm)
                const bateDiag = paciente && normalizarNome(paciente.diagnostico || '').includes(buscaNorm)
                if (!numeroNorm.includes(buscaNorm) && !bateNome && !bateDiag) {
                  return false
                }
              }
              return true
            })

          leitosDoSetor.sort(ordenarLeitos)

          if (leitosDoSetor.length === 0) return null

          const ocupados = leitosDoSetor.filter((l) => pacientesPorLeito[l.id]).length
          const total = leitosDoSetor.length
          const perc = total > 0 ? (ocupados / total) * 100 : 0
          const colorPerc = perc > 90 ? 'var(--color-danger)' : perc > 70 ? 'var(--color-warning)' : 'var(--color-success)'

          return (
            <section key={setor.id} className={cx('setor-section')}>
              <header className={cx('setor-header')}>
                <h2>{formatarNomeSetor(setor.nome)}</h2>
                <div className={cx('setor-stats')}>
                  <span className={cx('ocupacao-text')} style={{ color: colorPerc }}>
                    {ocupados}/{total} ocupados
                  </span>
                  <div className={cx('ocupacao-bar')}>
                    <div className={cx('ocupacao-fill')} style={{ width: `${perc}%`, background: colorPerc }} />
                  </div>
                  {!ehMedico && <button
                    type="button"
                    className={cx('btn-setor-extra')}
                    onClick={() => abrirLeitoExtra(setor.id)}
                    title={`Abrir leito extra em ${formatarNomeSetor(setor.nome)}`}
                  >
                    <i className={cx('ph', 'ph-plus')} /> Leito Extra
                  </button>}
                </div>
              </header>

              <div className={cx('leitos-grid')}>
                {leitosDoSetor.map((leito) => {
                  const paciente = pacientesPorLeito[leito.id]
                  const classeRisco = paciente ? obterClasseRisco(paciente.classificacao_manchester, setor.nome) : ''
                  const sn = paciente ? sinaisDoLeito(paciente, passagemPorPaciente[paciente.id], indicadoresPorPaciente[paciente.id]) : null

                  return paciente ? (
                    <div
                      key={leito.id}
                      className={`${cx('leito-card')} ${sn?.nivelAlerta ? 'pl-card-' + sn.nivelAlerta : ''}`}
                      onClick={() => abrirPassagem(paciente, leito)}
                    >
                      <div className={cx('risk-bar', classeRisco)} />

                      <div className={cx('leito-header')}>
                        <div className={cx('leito-numero', leito.tipo === 'extra' ? 'extra' : '')}>
                          <i className={cx('ph', 'ph-bed')} /> Leito {formatarNumeroLeito(leito.numero)}
                        </div>
                        <div className={cx('leito-status', paciente.status_internacao === 'Internado' ? 'status-internado' : 'status-observacao')}>
                          {paciente.status_internacao || 'Internado'}
                        </div>
                        {sn.permanencia && <span className="pl-permanencia" title="Tempo de permanência na unidade"><i className="ph ph-timer" /> {sn.permanencia}</span>}
                      </div>

                      <div className={cx('leito-body')}>
                        <div className={cx('paciente-nome')}>
                          {formatarNomePaciente(paciente.nome)}
                        </div>

                        <div className={cx('paciente-meta')}>
                          <span><i className={cx('ph', 'ph-user-circle')} /> {paciente.idade ? `${paciente.idade} anos` : 'Adulto'} • {paciente.sexo === 'F' ? 'Fem' : 'Masc'}</span>
                        </div>

                        <div className={cx('paciente-hd')}>
                          <strong><i className={cx('ph', 'ph-stethoscope')} /> HD:</strong> {paciente.diagnostico || 'Não registrado'}
                        </div>

                        <div className={cx('paciente-admissao')}>
                          <strong><i className={cx('ph', 'ph-clock')} /> Entrada:</strong> {formatarAdmissao(paciente.data_admissao)}
                        </div>

                        {(sn.alergia || sn.isolamento || sn.regulacao) && (
                          <div className="pl-linha pl-tags">
                            {sn.alergia && <span className="pl-tag alergia" title="Alergia"><i className="ph ph-warning-circle" /> Alergia: {sn.alergia}</span>}
                            {sn.isolamento && <span className="pl-tag isolamento" title="Isolamento"><i className="ph ph-virus" /> {sn.isolamento}</span>}
                            {sn.regulacao && <span className="pl-tag regulacao" title="Regulação aberta"><i className="ph ph-ambulance" /> Regulação</span>}
                          </div>
                        )}

                        {(sn.dispositivos.length > 0 || sn.avpDia) && (
                          <div className="pl-linha pl-dispositivos">
                            <i className="ph ph-first-aid" />
                            {sn.dispositivos.map((d) => <span key={d}>{d === 'AVP' && sn.avpDia ? `AVP (D${sn.avpDia})` : d}</span>)}
                            {!sn.dispositivos.includes('AVP') && sn.avpDia && <span>AVP (D{sn.avpDia})</span>}
                          </div>
                        )}

                        {(sn.exames + sn.sorologias + sn.hemo > 0) && (
                          <div className="pl-linha pl-pendencias">
                            {sn.exames > 0 && <span><i className="ph ph-flask" /> {sn.exames} exame(s) pendente(s)</span>}
                            {sn.sorologias > 0 && <span><i className="ph ph-test-tube" /> {sn.sorologias} sorologia(s)</span>}
                            {sn.hemo > 0 && <span><i className="ph ph-drop" /> {sn.hemo} hemocomponente(s)</span>}
                          </div>
                        )}

                        <div className="pl-linha pl-registros">
                          <span className={`pl-presc ${sn.prescricao.nivel}`}><i className="ph ph-prescription" /> {sn.prescricao.texto}</span>
                          <span className={sn.conferida ? 'pl-ok' : 'pl-pendente'}><i className={`ph ${sn.conferida ? 'ph-check-circle' : 'ph-hourglass'}`} /> {sn.conferida ? 'Passagem conferida' : 'Passagem a conferir'}</span>
                        </div>

                        {sn.alertas.filter((a) => !/Prescri/.test(a.texto)).length > 0 && (
                          <div className="pl-alertas">
                            {sn.alertas.filter((a) => !/Prescri/.test(a.texto)).map((a) => (
                              <span key={a.texto} className={`pl-alerta ${a.nivel}`}><i className={`ph ${a.icone}`} /> {a.texto}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={cx('leito-footer', 'no-print')} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={cx('btn-footer', 'action-btn')} onClick={() => abrirPassagem(paciente, leito)}>
                          <i className={cx('ph', 'ph-folder-open')} /> Prontuário
                        </button>
                        {novaUI && (
                          <button type="button" className="pl-btn-evoluir" onClick={() => abrirPassagem(paciente, leito, 'evolucao')} title="Abrir direto a evolução do paciente">
                            <i className="ph ph-pencil-simple" /> Evoluir
                          </button>
                        )}

                        {!ehMedico && <div className={cx('footer-actions-right')}>
                          {paciente.status_internacao !== 'Internado' && (
                            <button type="button" className={cx('btn-footer', 'icon-only')} title="Sinalizar internação" onClick={() => setConfirmarInternacao({ paciente, leito })}>
                              <i className={cx('ph', 'ph-bed')} />
                            </button>
                          )}
                          <button type="button" className={cx('btn-footer', 'icon-only')} title="Realocar / Transferir" onClick={() => setModalRealocar({ paciente, leitoOrigem: leito })}>
                            <i className={cx('ph', 'ph-arrows-left-right')} />
                          </button>
                          <button type="button" className={cx('btn-footer', 'icon-only', 'danger')} title="Sinalizar Desfecho" onClick={() => setModalDesfecho({ paciente, leitoOrigem: leito })}>
                            <i className={cx('ph', 'ph-sign-out')} />
                          </button>
                        </div>}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={leito.id}
                      className={cx('leito-card', 'leito-vazio')}
                      onClick={() => { if (!ehMedico) setModalLeito(leito) }}
                      style={ehMedico ? { cursor: 'default' } : undefined}
                    >
                      <i className={cx('ph', ehMedico ? 'ph-bed' : 'ph-plus-circle', 'vazio-icon')} />
                      <div className={cx('vazio-title')}>Leito {formatarNumeroLeito(leito.numero)}</div>
                      <div className={cx('vazio-subtitle')}>{ehMedico ? 'Livre' : 'Livre • Clique p/ Internar'}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      {erroInternacao && <div role="alert" className="faixa-erro-app">{erroInternacao}<button type="button" onClick={() => setErroInternacao('')}>Fechar</button></div>}
      {confirmarInternacao && (
        <ConfirmModal
          titulo="Sinalizar internação"
          mensagem={`Confirma que ${formatarNomePaciente(confirmarInternacao.paciente.nome)} passa de "Em observação" para "Internado"? Fica registrado com o seu nome, data e hora.`}
          confirmarTexto="Sinalizar internação"
          onConfirmar={sinalizarInternado}
          onCancelar={() => setConfirmarInternacao(null)}
        />
      )}
    </>
  )
}
