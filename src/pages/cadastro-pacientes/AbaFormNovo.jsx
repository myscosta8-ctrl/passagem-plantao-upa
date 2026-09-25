import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import {
  buscarPessoas,
  criarPessoaCompleta,
  atualizarPessoaCompleta,
  abrirAtendimento,
  detectarDuplicatas,
} from '../../lib/pepRecepcao'
import CamposIdentidade from './CamposIdentidade'
import CamposAtendimento from './CamposAtendimento'
import { PESSOA_VAZIA, ATENDIMENTO_VAZIO } from './constantes'

function imprimirFichaIdentificacao({ pessoa, atendimento, atd, setores, responsavelRecepcao }) {
  const setorNome = setores.find((s) => String(s.id) === String(atd.setor_id))?.nome
  localStorage.setItem('ficha_identificacao_dados', JSON.stringify({
    prontuario_numero: pessoa.prontuario_numero,
    numero_atendimento: atendimento?.numero_atendimento,
    tipo_entrada: 'Demanda Espontânea',
    nome: pessoa.nome,
    nome_mae: pessoa.nome_mae,
    sexo: pessoa.sexo,
    raca: pessoa.raca_cor,
    rg: pessoa.rg,
    cpf: pessoa.cpf,
    cns: pessoa.cns,
    data_nascimento: pessoa.data_nascimento,
    endereco: pessoa.endereco,
    endereco_numero: pessoa.endereco_numero,
    bairro: pessoa.bairro,
    cidade: pessoa.cidade,
    telefone: pessoa.telefone,
    medico_notificante: atd.medico,
    setor_nome: setorNome,
    responsavel_recepcao: responsavelRecepcao,
  }))
  window.open('./modelos_impressao_html/22-ficha-identificacao-termos.html', '_blank')
}

export default function AbaFormNovo({ enfermeiroId, pessoaInicial, onCancelarEdicao, onCadastrado }) {
  const { enfermeiro } = useAuth()
  const [dados, setDados] = useState(() => {
    if (pessoaInicial) {
      return {
        nome: pessoaInicial.nome || '',
        sexo: pessoaInicial.sexo || '',
        data_nascimento: pessoaInicial.data_nascimento || '',
        cns: pessoaInicial.cns || '',
        rg: pessoaInicial.rg || '',
        cpf: pessoaInicial.cpf || '',
        numero_registro_nascimento: pessoaInicial.numero_registro_nascimento || '',
        endereco: pessoaInicial.endereco || '',
        endereco_numero: pessoaInicial.endereco_numero || '',
        bairro: pessoaInicial.bairro || '',
        cidade: pessoaInicial.cidade || '',
        telefone: pessoaInicial.telefone || '',
        nome_mae: pessoaInicial.nome_mae || '',
        nome_pai: pessoaInicial.nome_pai || '',
      }
    }
    return PESSOA_VAZIA
  })

  const [atd, setAtd] = useState(ATENDIMENTO_VAZIO)
  const [setores, setSetores] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(null)
  const [candidatosDuplicata, setCandidatosDuplicata] = useState([])

  useEffect(() => {
    supabase.from('setores').select('*').order('ordem').then(({ data }) => {
      setSetores(data ?? [])
      const observacao = (data ?? []).find((s) => s.nome.includes('Observação'))
      if (observacao) setAtd((prev) => ({ ...prev, setor_id: String(observacao.id) }))
    })
  }, [])

  // Detecção preventiva contra duplicatas enquanto digita o nome (se for cadastro novo)
  useEffect(() => {
    if (pessoaInicial || !dados.nome || dados.nome.trim().length < 4) {
      setCandidatosDuplicata([])
      return
    }
    const timeout = setTimeout(async () => {
      const encontrados = await buscarPessoas(dados.nome.trim())
      setCandidatosDuplicata(encontrados.slice(0, 3))
    }, 450)
    return () => clearTimeout(timeout)
  }, [dados.nome, pessoaInicial])

  function set(campo, valor) { setDados((prev) => ({ ...prev, [campo]: valor })) }
  function setA(campo, valor) { setAtd((prev) => ({ ...prev, [campo]: valor })) }

  async function salvar(imprimir = false) {
    if (!dados.nome.trim()) {
      setErro('Nome completo é obrigatório.')
      return
    }
    setErro('')
    setSucesso(null)
    setSalvando(true)

    const responsavelRecepcao = enfermeiro?.nome_exibicao || enfermeiro?.nome || ''

    // Se estiver completando um cadastro existente
    if (pessoaInicial) {
      const { error: erroUpdate } = await atualizarPessoaCompleta(pessoaInicial.id, dados)
      setSalvando(false)
      if (erroUpdate) {
        setErro('Não foi possível atualizar o cadastro. Tente de novo.')
        console.error(erroUpdate)
        return
      }
      setSucesso({
        nome: dados.nome,
        prontuario: pessoaInicial.prontuario_numero || '—',
        atendimento: 'Atualizado com sucesso',
      })
      if (imprimir) {
        imprimirFichaIdentificacao({ pessoa: { ...pessoaInicial, ...dados }, atendimento: null, atd, setores, responsavelRecepcao })
      }
      onCadastrado?.()
      return
    }

    // Se for novo cadastro
    const { data: pessoa, error: erroPessoa } = await criarPessoaCompleta(dados)
    if (erroPessoa) {
      setSalvando(false)
      setErro('Não foi possível salvar o cadastro. Tente de novo.')
      console.error(erroPessoa)
      return
    }
    detectarDuplicatas(pessoa.id, dados)

    const { data: atendimento, error: erroAtd } = await abrirAtendimento({
      pessoaId: pessoa.id,
      setorId: atd.setor_id || null,
      medicoResponsavelNome: atd.medico,
      responsavel: { nome: atd.responsavelNome, rg: atd.responsavelRg, relacao: atd.responsavelRelacao, endereco: atd.responsavelEndereco },
      criadoPor: enfermeiroId,
    })
    setSalvando(false)
    if (erroAtd) {
      setErro('Pessoa cadastrada, mas não foi possível abrir o atendimento. Tente de novo pela busca.')
      console.error(erroAtd)
      return
    }

    setSucesso({ nome: pessoa.nome, prontuario: pessoa.prontuario_numero, atendimento: atendimento.numero_atendimento })
    if (imprimir) {
      imprimirFichaIdentificacao({ pessoa, atendimento, atd, setores, responsavelRecepcao })
    }
    setDados(PESSOA_VAZIA)
    setAtd(ATENDIMENTO_VAZIO)
    onCadastrado?.()
  }

  return (
    <div className="card">
      {pessoaInicial && (
        <div className="error-box" style={{ marginBottom: 18, background: 'var(--c-primary-light)', color: 'var(--c-primary)', borderLeftColor: 'var(--c-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            Você está completando os dados de <b>{pessoaInicial.nome}</b> (Prontuário: {pessoaInicial.prontuario_numero || 'Sem número'}).
          </div>
          <button type="button" className="modal-btn-secondary" onClick={onCancelarEdicao}>Cancelar edição</button>
        </div>
      )}

      {/* Alerta de duplicata preventiva enquanto digita */}
      {!pessoaInicial && candidatosDuplicata.length > 0 && (
        <div className="error-box" style={{ marginBottom: 18, background: '#FFF8E6', color: '#8A5D00', borderLeftColor: '#F2A900' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}><i className="ph ph-warning" /> Atenção: Já encontramos pacientes cadastrados com nome semelhante:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {candidatosDuplicata.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #ECD99F' }}>
                <span style={{ fontSize: 13 }}>
                  <b>{c.nome}</b> {c.prontuario_numero ? `· Prontuário: ${c.prontuario_numero}` : ''} {c.cpf ? `· CPF: ${c.cpf}` : ''}
                </span>
                <button
                  type="button"
                  className="modal-btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => {
                    setDados({
                      nome: c.nome || '',
                      sexo: c.sexo || '',
                      data_nascimento: c.data_nascimento || '',
                      cns: c.cns || '',
                      rg: c.rg || '',
                      cpf: c.cpf || '',
                      numero_registro_nascimento: c.numero_registro_nascimento || '',
                      endereco: c.endereco || '',
                      endereco_numero: c.endereco_numero || '',
                      bairro: c.bairro || '',
                      cidade: c.cidade || '',
                      telefone: c.telefone || '',
                      nome_mae: c.nome_mae || '',
                      nome_pai: c.nome_pai || '',
                    })
                    setCandidatosDuplicata([])
                  }}
                >
                  Usar este registro
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CamposIdentidade dados={dados} set={set} />
      {!pessoaInicial && <CamposAtendimento atd={atd} set={setA} setores={setores} />}

      {erro && <div className="error-box" style={{ marginTop: 16 }}>{erro}</div>}
      {sucesso && (
        <div className="error-box" style={{ marginTop: 16, background: 'var(--c-primary-light)', color: 'var(--c-primary)', borderLeftColor: 'var(--c-primary)' }}>
          {pessoaInicial ? 'Cadastro atualizado: ' : 'Cadastrado: '}
          <b>{sucesso.nome}</b> — prontuário {sucesso.prontuario} ({sucesso.atendimento}).
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 20 }}>
        {pessoaInicial ? (
          <button type="button" className="btn-cancel" onClick={onCancelarEdicao}>
            <i className="ph ph-x-circle" /> Cancelar
          </button>
        ) : <span />}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-save-draft" onClick={() => salvar(false)} disabled={salvando}>
            <i className="ph ph-floppy-disk" /> {salvando ? 'Salvando...' : pessoaInicial ? 'Salvar alterações' : 'Cadastrar paciente'}
          </button>
          <button type="button" className="btn-save-print" onClick={() => salvar(true)} disabled={salvando}>
            <i className="ph ph-printer" /> {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
          </button>
        </div>
      </div>
    </div>
  )
}
