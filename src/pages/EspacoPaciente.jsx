import { useEffect, useState } from 'react'
import FichaClinica from './FichaClinica'
import FichaMedica from './FichaMedica'
import { obterOuCriarAtendimentoParaPaciente } from '../lib/pepAtendimentos'
import './EspacoPaciente.css'

function calcularPermanencia(dataAdmissao) {
  if (!dataAdmissao) return ''
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const adm = new Date(dataAdmissao + (dataAdmissao.includes('T') ? '' : 'T00:00:00'))
    adm.setHours(0, 0, 0, 0)
    const diffMs = hoje.getTime() - adm.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDias <= 0) return 'Admitido hoje'
    if (diffDias === 1) return 'Internado há 1 dia'
    return `Internado há ${diffDias} dias`
  } catch {
    return ''
  }
}

export default function EspacoPaciente({
  paciente,
  leito,
  setorNome,
  onFechar,
}) {
  // Card do paciente mostra os prontuários (enfermagem/médico) — a edição de
  // diagnóstico/status/Manchester/pendências (antigo pilar "Passagem de
  // Plantão") foi movida para dentro da tela "Passagem de Plantão" do menu
  // lateral, ver PassagemColetiva.jsx.
  const [pilarAtivo, setPilarAtivo] = useState('enfermagem') // 'enfermagem' | 'medico'
  const [atendimentoResolvido, setAtendimentoResolvido] = useState(null)
  const [resolvendo, setResolvendo] = useState(false)
  const [erroPonte, setErroPonte] = useState('')

  const permanencia = calcularPermanencia(paciente?.data_admissao)

  // Pré-resolve ou prepara atendimento quando necessário
  async function garantirAtendimento(chaveDestino) {
    setErroPonte('')
    if (atendimentoResolvido) {
      setPilarAtivo(chaveDestino)
      return
    }

    if (paciente.pep_nativo) {
      const atd = {
        atendimento_id: paciente.id,
        pessoa_id: paciente.pessoa_id,
        nome: paciente.nome,
        leito_numero: leito?.numero,
        paciente,
        leito,
        setorNome,
      }
      setAtendimentoResolvido(atd)
      setPilarAtivo(chaveDestino)
      return
    }

    setResolvendo(true)
    const { atendimentoId, pessoaId, error } = await obterOuCriarAtendimentoParaPaciente(paciente.id)
    setResolvendo(false)

    if (error) {
      setErroPonte('Não foi possível carregar o prontuário deste paciente. Tente novamente.')
      console.error('Erro na ponte de atendimento:', error)
      return
    }

    const atd = {
      atendimento_id: atendimentoId,
      pessoa_id: pessoaId,
      nome: paciente.nome,
      leito_numero: leito?.numero,
      paciente,
      leito,
      setorNome,
    }
    setAtendimentoResolvido(atd)
    setPilarAtivo(chaveDestino)
  }

  useEffect(() => {
    garantirAtendimento('enfermagem')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function trocarPilar(chave) {
    garantirAtendimento(chave)
  }

  return (
    <div className="espaco-paciente-overlay" onClick={onFechar}>
      <div className="espaco-paciente-modal" onClick={(e) => e.stopPropagation()}>
        {/* Topo unificado do paciente */}
        <div className="espaco-paciente-topo">
          <div className="espaco-paciente-info">
            <div className="espaco-paciente-nome">{paciente?.nome || 'Paciente sem nome'}</div>
            <div className="espaco-paciente-meta">
              Leito {leito?.numero} · {setorNome || 'Setor não informado'}
              {permanencia ? ` · ${permanencia}` : ''}
              {paciente?.classificacao_manchester ? ` · Manchester: ${paciente.classificacao_manchester}` : ''}
            </div>
          </div>
          <button
            type="button"
            className="espaco-paciente-fechar-btn"
            onClick={onFechar}
            aria-label="Fechar espaço do paciente"
          >
            ×
          </button>
        </div>

        {/* Pilares do Espaço do Paciente */}
        <div className="espaco-paciente-pilares">
          <div
            className={`espaco-paciente-pilar ${pilarAtivo === 'enfermagem' ? 'ativo' : ''}`}
            onClick={() => trocarPilar('enfermagem')}
          >
            <div className="espaco-paciente-pilar-titulo">
              <i className="ph ph-stethoscope" />
              <span>Prontuário de Enfermagem</span>
            </div>
            <div className="espaco-paciente-pilar-sub">10 seções (Ficha Clínica)</div>
          </div>

          <div
            className={`espaco-paciente-pilar ${pilarAtivo === 'medico' ? 'ativo' : ''}`}
            onClick={() => trocarPilar('medico')}
          >
            <div className="espaco-paciente-pilar-titulo">
              <i className="ph ph-first-aid-kit" />
              <span>Prontuário Médico</span>
            </div>
            <div className="espaco-paciente-pilar-sub">11 seções (Ficha Médica)</div>
          </div>
        </div>

        {/* Mensagem de erro se a ponte falhar */}
        {erroPonte && (
          <div className="error-box" style={{ margin: '14px 24px 0' }}>
            {erroPonte}
          </div>
        )}

        {/* Corpo com rolagem contendo o pilar selecionado */}
        <div className="espaco-paciente-conteudo">
          {resolvendo ? (
            <div className="espaco-paciente-loading">
              <div className="spinner" />
              <span>Abrindo prontuário clínico...</span>
            </div>
          ) : (
            <>
              {pilarAtivo === 'enfermagem' && atendimentoResolvido && (
                <FichaClinica
                  embedded={true}
                  atendimento={atendimentoResolvido}
                  onFechar={onFechar}
                />
              )}

              {pilarAtivo === 'medico' && atendimentoResolvido && (
                <FichaMedica
                  embedded={true}
                  atendimento={atendimentoResolvido}
                  onFechar={onFechar}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
