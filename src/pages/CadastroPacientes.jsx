import { numeroLimpo } from '../lib/numeros'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { listarCadastrosRecentes, listarDuplicatasPendentes } from '../lib/pepRecepcao'
import {
  AbaDesfecho,
  AbaInternacao,
  AbaDuplicatas,
  AbaBusca,
  AbaFormNovo,
} from './cadastro-pacientes'
import './PassagemForm.css'
import './CadastroPacientes.css'

// Home da Recepção — cadastro de identidade completo (Ficha de Identificação
// do Paciente, UPA Breves) + abertura do atendimento administrativo. Não
// decide leito nem internação — isso é da equipe assistencial, em outra tela.
export default function CadastroPacientes() {
  const { enfermeiro } = useAuth()
  const [aba, setAba] = useState('buscar') // buscar (obrigatório primeiro) | novo | duplicatas | desfecho
  const [pessoaParaEditar, setPessoaParaEditar] = useState(null)
  const [recentes, setRecentes] = useState([])
  const [qtdDuplicatas, setQtdDuplicatas] = useState(0)
  const novaUI = enfermeiro?.pep_beta === true

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
    <div className={novaUI ? 'page recepcao-page-scroll rc-v2' : 'page recepcao-page-scroll'}>
      <h1 className="page-title">Recepção — Cadastro e Identificação</h1>
      <p className="page-subtitle">
        {novaUI ? 'Ficha de Identificação do Paciente — busque primeiro para evitar registros duplicados.' : 'Ficha de Identificação do Paciente — busque primeiro para evitar registros duplicados. Complete os documentos (CPF, CNS, endereço) de pacientes já abertos no leito ou inicie novo cadastro caso não exista.'}
      </p>
      <div className="rc-layout">
      <div className="rc-principal">

      <div className="doc-subtabs" style={{ marginBottom: 24 }}>
          <button
            className={`doc-subtab ${aba === 'buscar' ? 'active' : ''}`}
            onClick={() => { setAba('buscar'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-magnifying-glass" /> Buscar paciente (1º passo)
          </button>
          <button
            className={`doc-subtab ${aba === 'novo' ? 'active' : ''}`}
            onClick={() => setAba('novo')}
          >
            <i className="ph ph-user-plus" /> {pessoaParaEditar ? 'Completar dados' : 'Novo cadastro'}
          </button>
          <button
            className={`doc-subtab ${aba === 'duplicatas' ? 'active' : ''}`}
            onClick={() => { setAba('duplicatas'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-copy" /> Duplicatas{qtdDuplicatas > 0 ? ` (${qtdDuplicatas})` : ''}
          </button>
          <button
            className={`doc-subtab ${aba === 'internacao' ? 'active' : ''}`}
            onClick={() => { setAba('internacao'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-bed" /> Sinalizar internação
          </button>
          <button
            className={`doc-subtab ${aba === 'desfecho' ? 'active' : ''}`}
            onClick={() => { setAba('desfecho'); setPessoaParaEditar(null) }}
          >
            <i className="ph ph-check-square-offset" /> Registrar desfecho
          </button>
        </div>

      <div className={aba === 'novo' ? 'rc-conteudo rc-form' : 'rc-conteudo'} style={{ marginTop: 22 }}>
        {aba === 'internacao' && <AbaInternacao />}
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

      </div>
      <aside className="form-section rc-recentes" style={{ marginTop: 32 }}>
        <div className="form-section-title">Cadastrados recentemente</div>
        {recentes.length === 0 ? (
          <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>Nenhum cadastro ainda.</p>
        ) : (
          recentes.map((a) => (
            <div key={a.id} className="recepcao-recentes-item">
              <span>{a.pessoas?.nome}</span>
              <span className="recepcao-recentes-meta">
                <i className="ph ph-identification-card" /> {numeroLimpo(a.pessoas?.prontuario_numero)} · {new Date(a.criado_em).toLocaleString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </aside>
      </div>
    </div>
  )
}
