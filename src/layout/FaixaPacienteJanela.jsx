import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import { listarAlergias } from '../lib/pepClinico'
import { MANCHESTER_CORES, normalizarNome } from '../pages/painel/constantes'

// Faixa escura do paciente no topo da janela flutuante (mockup 02).
// Só dados do banco; o que não existe não aparece.
const limpar = (v) => String(v || '').replace(/^#?\s*(PEP|AT|REG)-?/i, '')

export default function FaixaPacienteJanela({ atendimento, nomeFallback }) {
  const [cab, setCab] = useState(null)
  const [alergias, setAlergias] = useState([])

  useEffect(() => {
    if (!atendimento?.atendimento_id) return undefined
    let vivo = true
    buscarCabecalhoImpressao(atendimento.atendimento_id).then((c) => { if (vivo) setCab(c) }).catch(() => {})
    if (atendimento.pessoa_id) listarAlergias(atendimento.pessoa_id).then((l) => { if (vivo) setAlergias(l.filter((a) => a.status !== 'inativa')) })
    return () => { vivo = false }
  }, [atendimento?.atendimento_id]) // eslint-disable-line react-hooks/exhaustive-deps

  const p = cab?.pessoa || {}
  const a = cab?.atendimento || {}
  const pac = atendimento?.paciente || {}
  const nome = String(p.nome || pac.nome || atendimento?.nome || nomeFallback || 'Paciente').trim()
  const iniciais = nome.split(/\s+/).filter((x) => x.length > 2 || /^[A-Z]/i.test(x)).map((x) => x[0]).filter(Boolean)
  const sigla = ((iniciais[0] || '') + (iniciais.length > 1 ? iniciais[iniciais.length - 1] : '')).toUpperCase()
  const idade = cab?.idade ?? pac.idade
  const sexoBruto = String(p.sexo || pac.sexo || '').toUpperCase()
  const sexo = sexoBruto.startsWith('F') ? 'Feminino' : sexoBruto ? 'Masculino' : null
  const setor = cab?.setorNome || atendimento?.setorNome
  const leito = cab?.leitoNumero || atendimento?.leito_numero
  const inicio = a.criado_em || pac.data_admissao
  const dias = inicio ? Math.max(0, Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000)) : null
  const classNome = a.classificacao_risco_cor || pac.classificacao_manchester || null
  const classif = classNome ? MANCHESTER_CORES.find((c) => normalizarNome(c.nome) === normalizarNome(classNome)) : null
  const alergiaTxt = alergias.map((x) => x.substancia).filter(Boolean).join(', ') || pac.alergias_obs
  const hd = pac.diagnostico || a.queixa_principal

  const meta = [
    idade ? `${idade}${String(idade).includes('ano') ? '' : ' anos'}` : null,
    sexo,
    p.prontuario_numero ? `Pront. ${limpar(p.prontuario_numero)}` : null,
    a.numero_atendimento ? `Atend. ${limpar(a.numero_atendimento)}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="fpj">
      <span className="fpj-av">{sigla || '—'}</span>
      <div className="fpj-id">
        <b>{nome.toUpperCase()}</b>
        {meta && <small>{meta}</small>}
      </div>
      <div className="fpj-chips">
        {(setor || leito) && <span className="fpj-chip">{[setor, leito && `Leito ${String(leito).padStart(2, '0')}`].filter(Boolean).join(' · ')}</span>}
        {dias !== null && <span className="fpj-chip">{dias === 0 ? 'Internado hoje' : `${dias} dia${dias > 1 ? 's' : ''} de internação`}</span>}
        {classif && <span className="fpj-chip" style={{ background: classif.cor, color: classif.texto }}>{classif.nome}</span>}
        {alergiaTxt && <span className="fpj-chip alergia"><i className="ph ph-warning" /> Alergia: {alergiaTxt}</span>}
        {hd && <span className="fpj-chip">HD: {hd}</span>}
      </div>
    </div>
  )
}
