import { useEffect, useState } from 'react'
import { obterOuCriarAtendimentoParaPaciente } from '../../lib/pepAtendimentos'
import {
  listarExames,
  listarSorologias,
  listarHemoterapia,
  buscarAberturaRegulacao
} from '../../lib/pepMedico'
import { ROTULO_STATUS_EXAME, ROTULO_STATUS_SOROLOGIA } from './constantes'

// Resumo somente-leitura do Prontuário Médico (Exames/Sorologias/Hemoterapia/
// Regulação) — resolve o atendimento real (ponte da Seção 0, se o paciente
// ainda não tiver um) e carrega uma vez; não edita nada aqui, só mostra.
export default function SecaoResumoProntuario({ paciente }) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      setErro(false)
      let atendimentoId = paciente.pep_nativo ? paciente.id : null
      if (!atendimentoId) {
        const { atendimentoId: id, error } = await obterOuCriarAtendimentoParaPaciente(paciente.id)
        if (error) {
          if (!cancelado) { setErro(true); setCarregando(false) }
          console.error('Erro ao resolver atendimento pro resumo do prontuário:', error)
          return
        }
        atendimentoId = id
      }
      const [exames, sorologias, hemoterapia, regulacao] = await Promise.all([
        listarExames(atendimentoId),
        listarSorologias(atendimentoId),
        listarHemoterapia(atendimentoId),
        buscarAberturaRegulacao(atendimentoId),
      ])
      if (!cancelado) {
        setDados({ exames, sorologias, hemoterapia, regulacao })
        setCarregando(false)
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [paciente.id, paciente.pep_nativo])

  const vazio = dados && dados.exames.length === 0 && dados.sorologias.length === 0
    && dados.hemoterapia.length === 0 && !dados.regulacao?.regulacao_flag

  return (
    <div className="form-section">
      <div className="form-section-title">Resumo do Prontuário (Exames / Sorologias / Hemoterapia / Regulação)</div>
      <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: -10, marginBottom: 14 }}>
        Somente leitura — pra editar, abra o pilar "Prontuário Médico" no Espaço do Paciente.
      </p>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Carregando...</p>
      ) : erro ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Não foi possível carregar o resumo do prontuário.</p>
      ) : vazio ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nada registrado ainda no Prontuário.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          {dados.exames.map((e) => (
            <div key={e.id}>Exame: {e.nome}{e.local ? ` · ${e.local}` : ''} · {ROTULO_STATUS_EXAME[e.status] || e.status}</div>
          ))}
          {dados.sorologias.map((s) => (
            <div key={s.id}>Sorologia: {s.agravo} · {ROTULO_STATUS_SOROLOGIA[s.status] || s.status}</div>
          ))}
          {dados.hemoterapia.map((h) => (
            <div key={h.id}>Hemoterapia: {h.tipo}{h.quantidade ? ` · ${h.quantidade}` : ''} · {h.transfundido_em ? 'transfundido' : 'aguardando transfusão'}</div>
          ))}
          {dados.regulacao?.regulacao_flag && (
            <div>Regulação: aberta · {dados.regulacao.regulacao_tipo}</div>
          )}
        </div>
      )}
    </div>
  )
}
