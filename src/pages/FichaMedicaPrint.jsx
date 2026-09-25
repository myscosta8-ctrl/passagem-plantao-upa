import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import './PrintView.css'

import { limparPrefixo } from './ficha-medica-print/helpersSus'
import CorpoConsultaOficial from './ficha-medica-print/CorpoConsultaOficial'
import CorpoPrescricaoOficial from './ficha-medica-print/CorpoPrescricaoOficial'
import CorpoAihOficial from './ficha-medica-print/CorpoAihOficial'
import CorpoApacOficial from './ficha-medica-print/CorpoApacOficial'
import CorpoAtmOficial from './ficha-medica-print/CorpoAtmOficial'
import CorpoTfdOficial from './ficha-medica-print/CorpoTfdOficial'
import CorpoPlanoOficial from './ficha-medica-print/CorpoPlanoOficial'
import CorpoRegulacaoOficial from './ficha-medica-print/CorpoRegulacaoOficial'
import CorpoSangueOficial from './ficha-medica-print/CorpoSangueOficial'
import CorpoSumarioAltaOficial from './ficha-medica-print/CorpoSumarioAltaOficial'
import CorpoEvolucaoMedicaOficial from './ficha-medica-print/CorpoEvolucaoMedicaOficial'
import CorpoNotaIntercorrenciaOficial from './ficha-medica-print/CorpoNotaIntercorrenciaOficial'
import CorpoReceituarioOficial from './ficha-medica-print/CorpoReceituarioOficial'
import CorpoAtestadoOficial from './ficha-medica-print/CorpoAtestadoOficial'

export {
  CorpoAihOficial,
  CorpoApacOficial,
  CorpoConsultaOficial,
  CorpoPrescricaoOficial,
  CorpoAtmOficial,
  CorpoTfdOficial,
  CorpoPlanoOficial,
  CorpoRegulacaoOficial,
  CorpoSangueOficial,
  CorpoSumarioAltaOficial,
  CorpoEvolucaoMedicaOficial,
  CorpoNotaIntercorrenciaOficial,
  CorpoReceituarioOficial,
  CorpoAtestadoOficial
}

const TITULOS = {
  consulta: 'Ficha de Admissão Médica',
  prescricao: 'Prescrição Médica',
  aih: 'Solicitação de AIH',
  apac: 'Solicitação de APAC',
  atm: 'Solicitação de Autorização de Uso de Antimicrobiano (ATM)',
  tfd: 'Laudo para Tratamento Fora do Domicílio (TFD)',
  plano: 'Plano Terapêutico',
  regulacao: 'Atualização de Quadro Clínico — Regulação (SER/SISREG)',
  alta: 'Sumário de Alta',
  evolucao: 'Evolução Médica Diária',
  intercorrencia: 'Nota de Intercorrência Médica',
  receituario: 'Receituário Médico',
  atestado: 'Atestado Médico',
}

function BotoesImpressao({ onVoltar }) {
  return (
    <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
      <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
      <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
    </div>
  )
}

export default function FichaMedicaPrint({ atendimentoId, tipo, registro, onVoltar }) {
  const [cabecalho, setCabecalho] = useState(null)

  useEffect(() => {
    buscarCabecalhoImpressao(atendimentoId).then(setCabecalho)
  }, [atendimentoId])

  if (!cabecalho) return null

  const { pessoa, atendimento, idade, leitoNumero, setorNome } = cabecalho
  const medico = registro.enfermeiros
  const dataHora = new Date(registro.criado_em || registro.solicitado_em || registro.atualizado_em).toLocaleString('pt-BR')

  const propsComuns = {
    registro,
    pessoa,
    atendimento,
    idade,
    leitoNumero,
    setorNome,
    medico,
    dataHora
  }

  const mapaCorpos = {
    aih: <CorpoAihOficial {...propsComuns} />,
    apac: <CorpoApacOficial {...propsComuns} />,
    consulta: <CorpoConsultaOficial {...propsComuns} />,
    prescricao: <CorpoPrescricaoOficial {...propsComuns} />,
    plano: <CorpoPlanoOficial {...propsComuns} />,
    atm: <CorpoAtmOficial {...propsComuns} />,
    tfd: <CorpoTfdOficial {...propsComuns} />,
    regulacao: <CorpoRegulacaoOficial {...propsComuns} />,
    sangue: <CorpoSangueOficial {...propsComuns} />,
    alta: <CorpoSumarioAltaOficial {...propsComuns} />,
    evolucao: <CorpoEvolucaoMedicaOficial {...propsComuns} />,
    intercorrencia: <CorpoNotaIntercorrenciaOficial {...propsComuns} />,
    receituario: <CorpoReceituarioOficial {...propsComuns} />,
    atestado: <CorpoAtestadoOficial {...propsComuns} />,
  }

  if (mapaCorpos[tipo]) {
    return (
      <div className="print-page">
        <BotoesImpressao onVoltar={onVoltar} />
        <div className="print-area">
          {mapaCorpos[tipo]}
        </div>
      </div>
    )
  }

  // Layout genérico de fallback para tipos sem modelo estruturado dedicado
  return (
    <div className="print-page">
      <BotoesImpressao onVoltar={onVoltar} />

      <div className="print-area doc-page">
        <div className="print-header">
          <div className="print-header-logos">
            <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
            <img src="./logos/semsa.jpg" alt="SEMSA" />
            <img src="./logos/upa24h.jpg" alt="UPA 24h" />
          </div>
        </div>

        <div className="doc-titulo">{TITULOS[tipo] || 'Documento Médico'}</div>

        <div className="doc-cabecalho">
          <div><span className="rotulo">Nome:</span>{pessoa.nome}</div>
          <div><span className="rotulo">Prontuário:</span>{limparPrefixo(pessoa.prontuario_numero)}</div>
          <div><span className="rotulo">Atendimento:</span>{limparPrefixo(atendimento.numero_atendimento)}</div>
          <div><span className="rotulo">Nascimento:</span>{pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''}{idade ? ` (${idade} anos)` : ''}</div>
          <div><span className="rotulo">Sexo:</span>{pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : ''}</div>
          <div><span className="rotulo">Mãe:</span>{pessoa.nome_mae || ''}</div>
          <div><span className="rotulo">CNS:</span>{pessoa.cns || ''}</div>
          <div><span className="rotulo">CPF:</span>{pessoa.cpf || ''}</div>
          <div><span className="rotulo">Convênio:</span>{atendimento.convenio || 'SUS'}</div>
          <div className="campo-largo"><span className="rotulo">Leito/Setor:</span>{leitoNumero ? `Leito ${leitoNumero} — ${setorNome}` : ''}</div>
        </div>

        <div className="doc-assinatura">
          <div className="linha-assinatura" />
          {medico?.nome_exibicao || medico?.nome}{medico?.crm ? ` — CRM ${medico.crm}` : ''}
        </div>
        <div className="doc-rodape-meta">Registrado em {dataHora}</div>
      </div>
    </div>
  )
}
