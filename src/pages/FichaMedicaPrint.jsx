import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { buscarCabecalhoImpressao, buscarAutorRegistro } from '../lib/pepMedico'
import './PrintView.css'
import './print/leitura.css'
import './print/documento-clinico.css'

import { corpoDoTipo, DocumentoPacote, TIPOS_LEITURA, dataHoraDe } from './ficha-medica-print/corposMedicos'
import PaginaImpressao from '../components/PaginaImpressao'
import CabecalhoPadraoUPA from './CabecalhoPadraoUPA'

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
  regulacao: 'Atualização de Quadro Clínico',
  alta: 'Sumário de Alta',
  evolucao: 'Evolução Médica Diária',
  intercorrencia: 'Nota de Intercorrência Médica',
  receituario: 'Receituário Médico',
  atestado: 'Atestado Médico',
}

function BotoesImpressao({ onVoltar }) {
  return (
    <div className="no-print barra-impressao">
      <button type="button" className="bi-voltar" onClick={onVoltar}><i className="ph ph-arrow-left" /> Voltar</button>
      <button type="button" className="bi-imprimir" onClick={() => window.print()}><i className="ph ph-printer" /> Imprimir / Salvar PDF</button>
    </div>
  )
}

export default function FichaMedicaPrint({ atendimentoId, tipo, registro, extras, onVoltar }) {
  const [cabecalho, setCabecalho] = useState(null)
  const [autor, setAutor] = useState(null)

  useEffect(() => {
    buscarCabecalhoImpressao(atendimentoId).then(setCabecalho)
  }, [atendimentoId])
  useEffect(() => {
    if (!registro?.enfermeiros) buscarAutorRegistro(registro).then(setAutor)
  }, [registro])

  if (!cabecalho || !registro) return null

  // Impressão conjunta (Prescrição + ATM + Receita de Controle Especial): um único "Imprimir".
  // Fica direto no <body> para o navegador aplicar a orientação de cada folha (prescrição e
  // receita em paisagem, ATM em retrato) — dentro da tela posicionada ele ignora isso.
  if (extras?.length) {
    const docs = [{ tipo, registro }, ...extras]
    return createPortal(
      <div className="print-page impressao-pacote">
        <BotoesImpressao onVoltar={onVoltar} />
        {/* Sem <PaginaImpressao>: um @page sem nome declarado depois anula as páginas nomeadas no Chrome. */}
        <div className="no-print pacote-aviso"><i className="ph ph-files" /> Impressão conjunta: {docs.map((d) => (d.registro?.tipo === 'controle_especial' ? 'Receita de Controle Especial (2 vias)' : TITULOS[d.tipo] || d.tipo)).join(' + ')}</div>
        <div className="print-area">
          {docs.map((d, i) => <DocumentoPacote key={(d.registro?.id || '') + i} tipo={d.tipo} registro={d.registro} cabecalho={cabecalho} />)}
        </div>
      </div>,
      document.body
    )
  }

  const { pessoa, atendimento, idade, leitoNumero, setorNome } = cabecalho
  const medico = registro.enfermeiros || autor
  const dataHora = dataHoraDe(registro)

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

  const corpo = corpoDoTipo(tipo, propsComuns)

  if (corpo) {
    return (
      <div className="print-page">
        <BotoesImpressao onVoltar={onVoltar} />
        <PaginaImpressao paisagem={tipo === 'prescricao' || tipo === 'receituario'} margem={tipo === 'receituario' ? '5mm 6mm' : tipo === 'aih' ? '8mm' : '10mm'} />
        <div className={'print-area' + (TIPOS_LEITURA.includes(tipo) ? ' doc-leitura' : '')}>
          {corpo}
        </div>
      </div>
    )
  }

  // Layout genérico de fallback para tipos sem modelo estruturado dedicado (mesma identificação padrão)
  return (
    <div className="print-page">
      <BotoesImpressao onVoltar={onVoltar} />

      <div className="print-area doc-page">
        <CabecalhoPadraoUPA titulo={(TITULOS[tipo] || 'Documento Médico').toUpperCase()} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />

        <div className="doc-assinatura">
          <div className="linha-assinatura" />
          {medico?.nome_exibicao || medico?.nome}{medico?.crm ? ` — CRM ${medico.crm}` : ''}
        </div>
        <div className="doc-rodape-meta">Registrado em {dataHora} · Impresso em {new Date().toLocaleString('pt-BR')}</div>
      </div>
    </div>
  )
}
