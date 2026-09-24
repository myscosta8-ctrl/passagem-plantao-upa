import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import { CorpoHistoricoEnfermagemFiel, CorpoHistoricoEnfermagemProjeto } from './CorpoHistoricoEnfermagem'
import './PrintView.css'

import CorpoSbarOficial from './ficha-clinica-print/CorpoSbarOficial'
import CorpoEvolucaoSaeOficial from './ficha-clinica-print/CorpoEvolucaoSaeOficial'
import CorpoIntercorrenciaOficial from './ficha-clinica-print/CorpoIntercorrenciaOficial'
import CorpoBalancoHidricoOficial from './ficha-clinica-print/CorpoBalancoHidricoOficial'

export {
  CorpoSbarOficial,
  CorpoEvolucaoSaeOficial,
  CorpoIntercorrenciaOficial,
  CorpoBalancoHidricoOficial,
  CorpoHistoricoEnfermagemFiel,
  CorpoHistoricoEnfermagemProjeto
}

export default function FichaClinicaPrint({ atendimentoId, tipo, registro = {}, onVoltar }) {
  const [cabecalho, setCabecalho] = useState(null)

  useEffect(() => {
    buscarCabecalhoImpressao(atendimentoId).then(setCabecalho)
  }, [atendimentoId])

  if (!cabecalho) return null

  const { pessoa, atendimento, idade, leitoNumero, setorNome } = cabecalho
  const medico = registro.enfermeiros || registro.entrega || {}
  const dataHora = new Date(registro.criado_em || Date.now()).toLocaleString('pt-BR')

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

  return (
    <div className={`print-page ${tipo === 'balanco' ? 'bh-landscape' : ''}`}>
      <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
        <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
        <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
      </div>

      <div className="print-area">
        {tipo === 'historico_enfermagem_projeto' && (
          <CorpoHistoricoEnfermagemProjeto {...propsComuns} />
        )}

        {(tipo === 'historico_enfermagem_fiel' || (!['historico_enfermagem_projeto', 'sbar', 'evolucao_sae', 'evolucao', 'intercorrencia', 'balanco'].includes(tipo) && tipo.includes('historico'))) && (
          <CorpoHistoricoEnfermagemFiel {...propsComuns} />
        )}

        {tipo === 'sbar' && (
          <CorpoSbarOficial {...propsComuns} />
        )}

        {(tipo === 'evolucao_sae' || tipo === 'evolucao') && (
          <CorpoEvolucaoSaeOficial {...propsComuns} />
        )}

        {tipo === 'intercorrencia' && (
          <CorpoIntercorrenciaOficial {...propsComuns} />
        )}

        {tipo === 'balanco' && (
          <CorpoBalancoHidricoOficial {...propsComuns} />
        )}
      </div>
    </div>
  )
}
