import { useEffect, useMemo, useState } from 'react'
import { listarAtendimentosAtivos } from '../lib/pepMedico'
import FichaMedica from './FichaMedica'
import { formatarNomeSetor, formatarNumeroLeito, formatarNomePaciente, obterClasseRisco } from './painel/PainelCards'
import styles from './painel/PainelCards.module.css'
import './painel/PainelSinais.css'
import './Painel.css'
import './PainelMedico.css'

const cx = (...c) => c.filter(Boolean).map((k) => styles[k] || k).join(' ')

function permanencia(iso) {
  if (!iso) return null
  const h = Math.floor((Date.now() - Date.parse(iso)) / 3600000)
  if (h < 0) return null
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`
}
function entradaTexto(iso) {
  if (!iso) return 'Não informada'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
const sexoCurto = (s) => (s === 'F' || s === 'Feminino' ? 'Fem' : s === 'M' || s === 'Masculino' ? 'Masc' : null)

export default function PainelMedico() {
  const [atendimentos, setAtendimentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [selecionado, setSelecionado] = useState(null)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')

  useEffect(() => { carregar() }, [])
  async function carregar() {
    setCarregando(true)
    setAtendimentos(await listarAtendimentosAtivos())
    setCarregando(false)
  }

  const porSetor = useMemo(() => {
    const b = busca.trim().toLowerCase()
    const r = {}
    for (const a of atendimentos) {
      if (status === 'internado' && a.status_internacao !== 'Internado') continue
      if (status === 'observacao' && a.status_internacao === 'Internado') continue
      if (b && !`${a.nome} ${a.leito_numero} ${a.diagnostico || ''}`.toLowerCase().includes(b)) continue
      ;(r[a.setor_nome ?? 'Sem setor'] ||= []).push(a)
    }
    return r
  }, [atendimentos, busca, status])

  // Ficha aberta: ocupa a tela toda no lugar da lista.
  if (selecionado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%' }}>
        <FichaMedica atendimento={selecionado} onFechar={() => { setSelecionado(null); carregar() }} />
      </div>
    )
  }

  const total = atendimentos.length
  const internados = atendimentos.filter((a) => a.status_internacao === 'Internado').length
  const comAlergia = atendimentos.filter((a) => a.alergias.length).length

  return (
    <div className="page pm-page" style={{ maxWidth: 1400 }}>
      <div className="pm-topo">
        <div>
          <h1 className="page-title">Pacientes ativos</h1>
          <p className="page-subtitle">Selecione um paciente para abrir a ficha médica.</p>
        </div>
        <div className="pm-resumo">
          <span><b>{total}</b> pacientes</span>
          <span><b>{internados}</b> internados</span>
          <span><b>{total - internados}</b> em observação</span>
          <span><b>{comAlergia}</b> com alergia</span>
        </div>
      </div>

      <div className="pm-barra">
        <label className="pm-busca"><i className="ph ph-magnifying-glass" /><input type="search" placeholder="Buscar por nome, leito ou diagnóstico" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
        <div className="pm-seg">
          {[['todos', 'Todos'], ['internado', 'Internados'], ['observacao', 'Em observação']].map(([k, r]) => (
            <button key={k} type="button" className={status === k ? 'on' : ''} onClick={() => setStatus(k)}>{r}</button>
          ))}
        </div>
        <button type="button" className="pm-atualizar" onClick={carregar}><i className="ph ph-arrows-clockwise" /> Atualizar</button>
      </div>

      {carregando && <p style={{ color: 'var(--c-text-muted)' }}>Carregando...</p>}
      {!carregando && Object.keys(porSetor).length === 0 && <p style={{ color: 'var(--c-text-muted)' }}>Nenhum paciente encontrado.</p>}

      {!carregando && Object.entries(porSetor).map(([setor, lista]) => (
        <section key={setor} className={cx('setor-section')}>
          <header className={cx('setor-header')}>
            <h2>{formatarNomeSetor(setor)}</h2>
            <div className={cx('setor-stats')}><span className={cx('ocupacao-text')}>{lista.length} paciente{lista.length === 1 ? '' : 's'}</span></div>
          </header>
          <div className={cx('leitos-grid')}>
            {lista.map((a) => {
              const internado = a.status_internacao === 'Internado'
              const perm = permanencia(a.entrada)
              const sx = sexoCurto(a.sexo)
              return (
                <div key={a.atendimento_id} className={cx('leito-card')} role="button" tabIndex={0}
                  onClick={() => setSelecionado(a)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelecionado(a) } }}>
                  <div className={cx('risk-bar', obterClasseRisco(a.classificacao, setor))} />
                  <div className={cx('leito-header')}>
                    <div className={cx('leito-numero')}><i className="ph ph-bed" /> Leito {formatarNumeroLeito(a.leito_numero)}</div>
                    <div className={cx('leito-status', internado ? 'status-internado' : 'status-observacao')}>{a.status_internacao || 'Em observação'}</div>
                    {perm && <span className="pl-permanencia" title="Tempo desde a entrada"><i className="ph ph-timer" /> {perm}</span>}
                  </div>
                  <div className={cx('leito-body')}>
                    <div className={cx('paciente-nome')}>{formatarNomePaciente(a.nome)}</div>
                    <div className={cx('paciente-meta')}><span><i className="ph ph-user-circle" /> {[a.idade ? `${a.idade} anos` : 'Idade N/I', sx].filter(Boolean).join(' • ')}</span></div>
                    <div className={cx('paciente-hd')}><strong><i className="ph ph-stethoscope" /> HD:</strong> {a.diagnostico || 'Não registrado'} {a.diagnostico_fonte === 'aih' && <span className="hd-aih" title="Diagnóstico definido pela AIH do médico">AIH</span>}</div>
                    <div className={cx('paciente-admissao')}><strong><i className="ph ph-clock" /> Entrada:</strong> {entradaTexto(a.entrada)}</div>
                    {(a.alergias.length > 0 || a.isolamento || a.regulacao) && (
                      <div className="pl-linha pl-tags">
                        {a.alergias.length > 0 && <span className="pl-tag alergia"><i className="ph ph-warning-circle" /> Alergia: {a.alergias.join(', ')}</span>}
                        {a.isolamento && <span className="pl-tag isolamento"><i className="ph ph-virus" /> {a.isolamento}</span>}
                        {a.regulacao && <span className="pl-tag regulacao"><i className="ph ph-ambulance" /> Regulação</span>}
                      </div>
                    )}
                  </div>
                  <div className={cx('leito-footer')}>
                    <button type="button" className={cx('btn-footer', 'action-btn')} onClick={(e) => { e.stopPropagation(); setSelecionado(a) }}>
                      <i className="ph ph-folder-open" /> Prontuário médico
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
