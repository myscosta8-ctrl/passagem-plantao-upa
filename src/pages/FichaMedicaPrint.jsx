import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import './PrintView.css'

const TITULOS = {
  consulta: 'Ficha de Admissão Médica',
  prescricao: 'Prescrição Médica',
  aih: 'Solicitação de AIH',
}

export default function FichaMedicaPrint({ atendimentoId, tipo, registro, onVoltar }) {
  const [cabecalho, setCabecalho] = useState(null)

  useEffect(() => {
    buscarCabecalhoImpressao(atendimentoId).then(setCabecalho)
  }, [atendimentoId])

  if (!cabecalho) return null

  const { pessoa, atendimento, idade, leitoNumero, setorNome } = cabecalho
  const medico = registro.enfermeiros
  const dataHora = new Date(registro.criado_em).toLocaleString('pt-BR')

  return (
    <div className="print-page">
      <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
        <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
        <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
      </div>

      <div className="print-area doc-page">
        <div className="print-header">
          <div className="print-header-logos">
            <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
            <img src="./logos/semsa.jpg" alt="SEMSA" />
            <img src="./logos/upa24h.jpg" alt="UPA 24h" />
          </div>
        </div>

        <div className="doc-titulo">{TITULOS[tipo]}</div>

        <div className="doc-cabecalho">
          <div><span className="rotulo">Nome:</span>{pessoa.nome}</div>
          <div><span className="rotulo">Prontuário:</span>{pessoa.prontuario_numero || '—'}</div>
          <div><span className="rotulo">Atendimento:</span>{atendimento.numero_atendimento || '—'}</div>
          <div><span className="rotulo">Nascimento:</span>{pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}{idade ? ` (${idade} anos)` : ''}</div>
          <div><span className="rotulo">Sexo:</span>{pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : '—'}</div>
          <div><span className="rotulo">Mãe:</span>{pessoa.nome_mae || '—'}</div>
          <div><span className="rotulo">CNS:</span>{pessoa.cns || '—'}</div>
          <div><span className="rotulo">CPF:</span>{pessoa.cpf || '—'}</div>
          <div><span className="rotulo">Convênio:</span>{atendimento.convenio || 'SUS'}</div>
          <div className="campo-largo"><span className="rotulo">Leito/Setor:</span>{leitoNumero ? `Leito ${leitoNumero} — ${setorNome}` : '—'}</div>
        </div>

        {tipo === 'consulta' && <CorpoConsulta registro={registro} />}
        {tipo === 'prescricao' && <CorpoPrescricao registro={registro} />}
        {tipo === 'aih' && <CorpoAih registro={registro} />}

        <div className="doc-assinatura">
          <div className="linha-assinatura" />
          {medico?.nome_exibicao || medico?.nome}{medico?.crm ? ` — CRM ${medico.crm}` : ''}
        </div>
        <div className="doc-rodape-meta">Registrado em {dataHora}</div>
      </div>
    </div>
  )
}

function Secao({ rotulo, valor }) {
  if (!valor) return null
  return (
    <div className="doc-secao">
      <span className="rotulo">{rotulo}</span>
      <span className="valor">{valor}</span>
    </div>
  )
}

function CorpoConsulta({ registro }) {
  return (
    <>
      <Secao rotulo="Queixa principal" valor={registro.queixa_principal} />
      <Secao rotulo="História da doença atual" valor={registro.historia_doenca_atual} />
      <Secao rotulo="Antecedentes" valor={registro.antecedentes} />
      <Secao rotulo="Revisão de sistemas" valor={registro.revisao_sistemas} />
      <Secao rotulo="Exame físico geral" valor={registro.exame_geral} />
      <Secao rotulo="Hipótese diagnóstica" valor={registro.hipotese_diagnostica} />
      <Secao rotulo="Conduta inicial" valor={registro.conduta_inicial} />
    </>
  )
}

function CorpoPrescricao({ registro }) {
  return (
    <>
      <table className="doc-tabela">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Dose</th>
            <th>Via</th>
            <th>Frequência</th>
            <th>Duração</th>
            <th>Instruções</th>
          </tr>
        </thead>
        <tbody>
          {(registro.prescricao_itens ?? []).map((it) => (
            <tr key={it.id}>
              <td>{it.medicamento_nome}</td>
              <td>{it.dose ? `${it.dose} ${it.dose_unidade || ''}` : '—'}</td>
              <td>{it.via || '—'}</td>
              <td>{it.frequencia || '—'}</td>
              <td>{it.duracao || '—'}</td>
              <td>{it.instrucoes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Secao rotulo="Observações" valor={registro.observacoes} />
      {registro.status === 'cancelada' && (
        <div className="doc-secao" style={{ color: '#8A5A00', fontWeight: 700 }}>
          PRESCRIÇÃO CANCELADA{registro.motivo_cancelamento ? ` — ${registro.motivo_cancelamento}` : ''}
        </div>
      )}
    </>
  )
}

function CorpoAih({ registro }) {
  return (
    <>
      <Secao rotulo="Procedimento principal" valor={`${registro.procedimento_principal_nome}${registro.procedimento_principal_codigo ? ` (${registro.procedimento_principal_codigo})` : ''}`} />
      {registro.cid_catalog && (
        <Secao rotulo="CID principal" valor={`${registro.cid_catalog.codigo} — ${registro.cid_catalog.descricao}`} />
      )}
      <Secao rotulo="Justificativa clínica" valor={registro.justificativa_clinica} />
    </>
  )
}
