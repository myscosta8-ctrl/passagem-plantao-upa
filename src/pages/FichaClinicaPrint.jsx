import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import './PrintView.css'

const TITULOS = {
  sbar: 'Transferência de Paciente — Formato SBAR',
}

export default function FichaClinicaPrint({ atendimentoId, tipo, registro, onVoltar }) {
  const [cabecalho, setCabecalho] = useState(null)

  useEffect(() => {
    buscarCabecalhoImpressao(atendimentoId).then(setCabecalho)
  }, [atendimentoId])

  if (!cabecalho) return null

  const { pessoa, atendimento, idade, leitoNumero, setorNome } = cabecalho
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
          <div><span className="rotulo">Convênio:</span>{atendimento.convenio || 'SUS'}</div>
          <div className="campo-largo"><span className="rotulo">Setor de origem:</span>{leitoNumero ? `Leito ${leitoNumero} — ${setorNome}` : '—'}</div>
        </div>

        {tipo === 'sbar' && <CorpoSbar registro={registro} />}

        <div className="doc-assinatura">
          <div className="linha-assinatura" />
          Enfermeiro(a) que entrega — {registro.entrega?.nome_exibicao || registro.entrega?.nome || '—'}
        </div>
        <div className="doc-assinatura" style={{ marginTop: 20 }}>
          <div className="linha-assinatura" />
          Enfermeiro(a) que recebe — {registro.recebe?.nome_exibicao || registro.recebe?.nome || '(a preencher no destino)'}
        </div>
        <div className="doc-rodape-meta">Registrado em {dataHora}</div>
      </div>
    </div>
  )
}

function Secao({ rotulo, valor }) {
  if (!valor && valor !== false) return null
  return (
    <div className="doc-secao">
      <span className="rotulo">{rotulo}</span>
      <span className="valor">{typeof valor === 'boolean' ? (valor ? 'Sim' : 'Não') : valor}</span>
    </div>
  )
}

function CorpoSbar({ registro }) {
  const sv = registro.sinais_vitais || {}
  const svTexto = [
    sv.pa_sistolica && sv.pa_diastolica ? `PA ${sv.pa_sistolica}x${sv.pa_diastolica}mmHg` : null,
    sv.fc ? `FC ${sv.fc}bpm` : null,
    sv.fr ? `FR ${sv.fr}irpm` : null,
    sv.temperatura ? `T ${sv.temperatura}°C` : null,
    sv.spo2 ? `SpO2 ${sv.spo2}%` : null,
  ].filter(Boolean).join(' · ')

  return (
    <>
      <Secao rotulo="Destino" valor={registro.setores?.nome} />
      <Secao rotulo="S — Situação (impressão diagnóstica)" valor={registro.impressao_diagnostica} />
      <Secao rotulo="B — Sinais vitais" valor={svTexto || null} />
      <Secao rotulo="Nível de consciência" valor={registro.nivel_consciencia} />
      <Secao rotulo="Alergia" valor={registro.alergia} />
      <Secao rotulo="Suporte ventilatório" valor={registro.suporte_ventilatorio} />
      <Secao rotulo="Isolamento" valor={registro.isolamento} />
      <Secao rotulo="Dispositivos" valor={registro.dispositivos} />
      <Secao rotulo="A/R — Recomendações" valor={registro.recomendacoes} />
      <Secao rotulo="Intercorrência durante o transporte" valor={registro.intercorrencia_transporte} />
    </>
  )
}
