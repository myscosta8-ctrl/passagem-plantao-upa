import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { listarCadastrosRecentes, listarDuplicatasPendentes } from '../lib/pepRecepcao'
import {
  AbaDesfecho,
  AbaDuplicatas,
  AbaBusca,
  AbaFormNovo,
} from './cadastro-pacientes'
import './PassagemForm.css'

// Home da Recepção — cadastro de identidade completo (Ficha de Identificação
// do Paciente, UPA Breves) + abertura do atendimento administrativo. Não
// decide leito nem internação — isso é da equipe assistencial, em outra tela.
export default function CadastroPacientes() {
  const { enfermeiro } = useAuth()
  const [aba, setAba] = useState('buscar') // buscar (obrigatório primeiro) | novo | duplicatas | desfecho
  const [pessoaParaEditar, setPessoaParaEditar] = useState(null)
  const [recentes, setRecentes] = useState([])
  const [qtdDuplicatas, setQtdDuplicatas] = useState(0)

  useEffect(() => { carregarRecentes() }, [])
  useEffect(() => { carregarQtdDuplicatas() }, [])

  async function carregarRecentes() {
    setRecentes(await listarCadastrosRecentes())
  }

  async function carregarQtdDuplicatas() {
    setQtdDuplicatas((await listarDuplicatasPendentes()).length)
  }

  function iniciarCompletarCadastro(pessoa) {
    setPessoaParaEditar(pessoa)
    setAba('novo')
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1 className="page-title">Recepção — Cadastro e Identificação</h1>
      <p className="page-subtitle">
        Ficha de Identificação do Paciente — busque primeiro para evitar registros duplicados. Complete os documentos (CPF, CNS, endereço) de pacientes já abertos no leito ou inicie novo cadastro caso não exista.
      </p>

      <div className="form-toolbar" style={{ maxWidth: 520 }}>
        <button
          className={aba === 'buscar' ? 'btn-realocar' : 'btn-copiar'}
          onClick={() => { setAba('buscar'); setPessoaParaEditar(null) }}
        >
          🔍 Buscar paciente (1º passo)
        </button>
        <button
          className={aba === 'novo' ? 'btn-realocar' : 'btn-copiar'}
          onClick={() => setAba('novo')}
        >
          {pessoaParaEditar ? 'Completar dados' : 'Novo cadastro'}
        </button>
        <button
          className={aba === 'duplicatas' ? 'btn-realocar' : 'btn-copiar'}
          onClick={() => { setAba('duplicatas'); setPessoaParaEditar(null) }}
        >
          Duplicatas{qtdDuplicatas > 0 ? ` (${qtdDuplicatas})` : ''}
        </button>
        <button
          className={aba === 'desfecho' ? 'btn-realocar' : 'btn-copiar'}
          onClick={() => { setAba('desfecho'); setPessoaParaEditar(null) }}
        >
          Desfecho
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        {aba === 'desfecho' && <AbaDesfecho />}
        {aba === 'novo' && (
          <AbaFormNovo
            enfermeiroId={enfermeiro?.id}
            pessoaInicial={pessoaParaEditar}
            onCancelarEdicao={() => { setPessoaParaEditar(null); setAba('buscar') }}
            onCadastrado={() => { setPessoaParaEditar(null); carregarRecentes(); }}
          />
        )}
        {aba === 'buscar' && (
          <AbaBusca
            enfermeiroId={enfermeiro?.id}
            onAtendimentoAberto={carregarRecentes}
            onCompletarCadastro={iniciarCompletarCadastro}
            onIrParaNovo={() => { setPessoaParaEditar(null); setAba('novo') }}
          />
        )}
        {aba === 'duplicatas' && (
          <AbaDuplicatas enfermeiroId={enfermeiro?.id} onResolvida={carregarQtdDuplicatas} />
        )}
      </div>

      <div className="form-section" style={{ marginTop: 32 }}>
        <div className="form-section-title">Cadastrados recentemente</div>
        {recentes.length === 0 ? (
          <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>Nenhum cadastro ainda.</p>
        ) : (
          recentes.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--c-border-light)', fontSize: 13 }}>
              <span>{a.pessoas?.nome}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-muted)' }}>
                {a.pessoas?.prontuario_numero} · {new Date(a.criado_em).toLocaleString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
