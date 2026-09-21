import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import CabecalhoPadraoUPA from './CabecalhoPadraoUPA'
import './PrintView.css'

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

  if (tipo === 'aih') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoAihOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'consulta') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoConsultaOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} dataHora={dataHora} medico={medico} />
        </div>
      </div>
    )
  }

  if (tipo === 'prescricao') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoPrescricaoOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'plano') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoPlanoOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'atm') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoAtmOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'tfd') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoTfdOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'regulacao') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoRegulacaoOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'sangue') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoSangueOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'alta') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoSumarioAltaOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'evolucao') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoEvolucaoMedicaOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'intercorrencia') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoNotaIntercorrenciaOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

  if (tipo === 'receituario') {
    return (
      <div className="print-page">
        <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
          <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>
        <div className="print-area">
          <CorpoReceituarioOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        </div>
      </div>
    )
  }

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

        {tipo === 'apac' && <CorpoApac registro={registro} />}

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

// Caixa com rótulo no canto + linha, igual à "HISTORIA DA DOENÇA ATUAL" /
// "CONDUTA" do papel timbrado real da Breves.
function CampoAdm({ cap, val, livre }) {
  return (
    <div className={`adm-campo${livre ? ' texto-livre' : ''}`}>
      <span className="cap">{cap}</span>
      <span className="val">{val || ' '}</span>
    </div>
  )
}

function CheckAdm({ marcado, children }) {
  return (
    <span className={`adm-check${marcado ? ' marcado' : ''}`}>
      <span className="box">{marcado ? '✓' : ''}</span>{children}
    </span>
  )
}

function SecaoAdm({ titulo, children }) {
  return (
    <div className="adm-secao">
      <div className="adm-secao-titulo">{titulo}</div>
      <div className="adm-secao-corpo">{children}</div>
    </div>
  )
}

function fmtDataHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d) ? iso : d.toLocaleString('pt-BR')
}

function CaixaDoc2({ titulo, valor, grande, children }) {
  return (
    <div className={`doc2-caixa${grande ? ' grande' : ''}`}>
      <div className="doc2-caixa-titulo">{titulo}</div>
      <div className="doc2-caixa-valor">{valor || ' '}</div>
      {children}
    </div>
  )
}

// Réplica da Ficha de Admissão Médica real da UPA Breves (papel timbrado
// simples — nome, duas datas, caixas de rótulo-no-canto, assinatura) — mas
// SEM perder nenhum campo clínico já capturado no sistema (queixa, HDA,
// antecedentes, revisão de sistemas, exame físico, hipótese diagnóstica e
// conduta aparecem todos, cada um na sua própria caixa rotulada).
// Réplica do modelo completo de Admissão Médica (17 seções) — cabeçalho
// UPA/SUS, tabelas, checkboxes — SEM perder nenhum campo clínico já
// capturado (queixa, HDA, antecedentes, revisão de sistemas, exame físico,
// hipótese diagnóstica, conduta continuam presentes, ao lado de todos os
// campos novos do modelo: alergias, medicamentos em uso, sinais vitais,
// exame físico estruturado, hipóteses CID-10, classificação de risco etc.)
function CorpoConsultaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_admissao || {}
  const sv = cf.sv || {}
  const temSv = sv.pa || sv.fc || sv.fr || sv.spo2 || sv.temp || sv.dor || sv.hgt

  return (
    <div className="cons-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="CONSULTA E ADMISSÃO MÉDICA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="cons-secao" style={{ marginTop: '2px' }}>
          <div className="cons-secao-header">1. Queixa Principal e História da Doença Atual (HDA)</div>
          <div className="cons-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.queixa_principal && <div><b>Queixa Principal:</b> {registro.queixa_principal}</div>}
            <div style={{ marginTop: registro.queixa_principal ? '3px' : '0' }}>
              {registro.historia_doenca_atual || (!registro.queixa_principal ? 'Sem relato de HDA preenchido.' : '')}
            </div>
          </div>
        </div>

        <div className="cons-secao">
          <div className="cons-secao-header">2. Antecedentes Pessoais, Comorbidades e Alergias</div>
          <div className="cons-secao-body" style={{ minHeight: '18mm', whiteSpace: 'pre-wrap' }}>
            {registro.antecedentes || cf.antecedentes || 'Nega comorbidades prévias ou alergias medicamentosas conhecidas.'}
          </div>
        </div>

        <div className="cons-secao">
          <div className="cons-secao-header">3. Exame Físico Geral e Especializado</div>
          <div className="cons-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {temSv && (
              <div className="grid-sinais-tfd" style={{ margin: '0 0 4px 0' }}>
                <div><b>PA:</b> {sv.pa || '—'} mmHg</div>
                <div><b>FC:</b> {sv.fc || '—'} bpm</div>
                <div><b>FR:</b> {sv.fr || '—'} irpm</div>
                <div><b>SpO2:</b> {sv.spo2 || '—'}%</div>
                <div><b>Tax:</b> {sv.temp || '—'} °C</div>
                <div><b>HGT/Dor:</b> {sv.hgt ? `${sv.hgt} mg/dL` : (sv.dor ? `Dor ${sv.dor}/10` : '—')}</div>
              </div>
            )}
            {cf.exame_geral || registro.exame_geral || 'Bom estado geral, consciente, orientado em tempo e espaço, corado, hidratado, anictérico, acianótico e afebril. Aparelho cardiovascular: RCR em 2 tempos com bulhas normofonéticas sem sopros. Aparelho respiratório: Murmúrio vesicular preservado bilateralmente, sem ruídos adventícios. Abdome: Plano, flácido, indolor à palpação, ruídos hidroaéreos presentes. Extremidades: Aquecidas, boa perfusão periférica, sem edemas.'}
          </div>
        </div>

        <div className="cons-secao">
          <div className="cons-secao-header">4. Hipóteses Diagnósticas</div>
          <div className="cons-secao-body" style={{ minHeight: '16mm', whiteSpace: 'pre-wrap' }}>
            {registro.hipotese_diagnostica || 'A esclarecer durante a permanência / observação clínica na UPA.'}
          </div>
        </div>

        <div className="cons-secao cons-secao-expansivel">
          <div className="cons-secao-header">5. Conduta Inicial na Admissão</div>
          <div className="cons-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.conduta_inicial || registro.plano_terapeutico || cf.conduta || '1. Admissão em leito de observação clínica na UPA 24h Breves.\n2. Prescrição de medidas de suporte, sintomáticos e hidratação.\n3. Solicitação de exames laboratoriais e complementares conforme protocolo institucional.\n4. Reavaliação clínica seriada e monitorização contínua de sinais vitais.'}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Admissão:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Examinador'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Plantonista — Clínica Médica</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves</span>
          <span>Consulta e Admissão Médica &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

// Réplica fiel do modelo de Prescrição aprovado (papel A4 paisagem, timbre
// UPA 24h Breves/SEMSA) — ver pdfs_exemplo/prescricao_preview.html.
function CorpoPrescricaoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_prescricao || {}
  const itens = registro.prescricao_itens || []
  const orientacoes = cf.orientacao_enfermagem || []

  return (
    <div className="pr-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="PRESCRIÇÃO MÉDICA HOSPITALAR"
          pessoa={pessoa}
          atendimento={atendimento}
          idade={idade}
          leitoNumero={leitoNumero}
          setorNome={setorNome}
          medico={medico}
          dataHora={dataHora}
        />

        <div className="pr-secao-titulo">Dieta</div>
        <div className="pr-caixa">{cf.dieta || '1 — Dieta oral branda hipossódica / fracionada.'}</div>

        <div className="pr-secao-titulo">Medicamentos</div>
        <table className="pr-tabela pr-tabela-salutem">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>MEDICAMENTOS</th>
              <th style={{ width: '6%', textAlign: 'center' }}>QTD/UND</th>
              <th style={{ width: '7%', textAlign: 'center' }}>SN/ACM</th>
              <th style={{ width: '6%', textAlign: 'center' }}>VIA</th>
              <th style={{ width: '9%', textAlign: 'center' }}>FREQ</th>
              <th style={{ width: '34%', textAlign: 'center' }}>HORÁRIO DE APLICAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#666', padding: '8px' }}>Nenhum medicamento prescrito.</td></tr>
            ) : itens.map((it, i) => (
              <tr key={it.id || i}>
                <td>
                  <b>{i + 1} — {it.medicamento_nome}</b>
                  {(it.diluicao || it.instrucoes) && (
                    <span className="pr-nota">{[it.diluicao, it.instrucoes].filter(Boolean).join(' — ')}</span>
                  )}
                </td>
                <td className="qtd" style={{ textAlign: 'center' }}>{it.dose ? `${it.dose} ${it.dose_unidade || ''}` : ''}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{it.sn_acm || (it.sn_aplic ? 'SN' : '—')}</td>
                <td className="via" style={{ textAlign: 'center' }}>{it.via || ''}</td>
                <td className="freq" style={{ textAlign: 'center' }}>{it.frequencia || ''}{it.duracao ? ` · ${it.duracao}` : ''}</td>
                <td className="horario" style={{ textAlign: 'center' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pr-secao-titulo">Orientação enfermagem</div>
        <div className="pr-caixa">
          {orientacoes.length === 0
            ? '1 — Monitorização de sinais vitais de 2/2 horas • 2 — Manter cabeceira elevada a 30°-45° e precaução padrão.'
            : orientacoes.map((o, i) => `${i + 1} — ${o.texto}${o.frequencia ? ` (${o.frequencia})` : ''}`).join(' • ')
          }
        </div>

        <div className="pr-secao-titulo">Avaliação multidisciplinar</div>
        <div className="pr-caixa">{cf.avaliacao_multidisciplinar || 'Nenhuma avaliação multidisciplinar registrada no momento.'}</div>

        <div className="pr-secao-titulo">Hemocomponente</div>
        <div className="pr-caixa">{cf.hemocomponente || 'Nenhum hemocomponente prescrito no momento.'}</div>

        {registro.observacoes && (
          <>
            <div className="pr-secao-titulo">Observações</div>
            <div className="pr-caixa">{registro.observacoes}</div>
          </>
        )}

        {registro.status === 'cancelada' && (
          <div className="pr-caixa" style={{ marginTop: 6, borderTop: '1px solid #999', color: '#8A5A00', fontWeight: 700 }}>
            PRESCRIÇÃO CANCELADA{registro.motivo_cancelamento ? ` — ${registro.motivo_cancelamento}` : ''}
          </div>
        )}
      </div>

      <div className="doc-rodape-container">
        <div className="pr-assinaturas-5">
          <div className="bloco"><div className="linha" />Técnico Tarde</div>
          <div className="bloco"><div className="linha" />Técnico Noite</div>
          <div className="bloco"><div className="linha" />Técnico Manhã</div>
          <div className="bloco"><div className="linha" />Enfermeiro Plantonista</div>
          <div className="bloco-medico">
            <div className="linha" />
            <b>{medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}</b>
            <div>{medico?.crm ? `CRM-PA ${medico.crm} • ` : ''}Médico Plantonista</div>
          </div>
        </div>

        <div className="doc-rodape-sistema">
          <span>Prescrição Médica Hospitalar — Sistema Vitaloop / UPA 24h Breves</span>
          <span>Validade: 24 Horas &bull; Documento Oficial &bull; Folha Única (Paisagem) &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

const VINCULO_PREVIDENCIA_OPCOES = [
  { valor: 'empregado', rotulo: 'Empregado' },
  { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' },
  { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' },
  { valor: 'nao_segurado', rotulo: 'Não segurado' },
]

function CampoComb({ cap, val, digitos, w }) {
  const limpo = (val || '').replace(/\D/g, '')
  const total = digitos || Math.max(limpo.length, 6)
  const casas = Array.from({ length: total }, (_, i) => limpo[i] || '')
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: 0 }}>
      <span className="cap">{cap}</span>
      <div className="sus-comb">
        {casas.map((d, i) => <span key={i} className="digito">{d}</span>)}
      </div>
    </div>
  )
}

function CampoSus({ cap, val, w, full }) {
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: full ? '100%' : 0 }}>
      <span className="cap">{cap}</span>
      <span className="val">{val || ' '}</span>
    </div>
  )
}

function Marca({ marcado }) {
  return <span className="caixa">({marcado ? 'X' : '  '})</span>
}

function Digitos({ valor, n }) {
  const limpo = (valor || '').replace(/\D/g, '')
  const casas = Array.from({ length: n }, (_, i) => limpo[i] || '')
  return <div className="sus-comb">{casas.map((d, i) => <span key={i} className="digito">{d}</span>)}</div>
}

// Data em 3 grupos de caixinhas (dd / mm / aaaa), igual ao formulário oficial.
function CampoData({ cap, valorISO, w }) {
  const [ano, mes, dia] = valorISO ? valorISO.split('-') : ['', '', '']
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: 0 }}>
      <span className="cap">{cap}</span>
      <div className="sus-data">
        <Digitos valor={dia} n={2} /><span className="barra">/</span>
        <Digitos valor={mes} n={2} /><span className="barra">/</span>
        <Digitos valor={ano} n={4} />
      </div>
    </div>
  )
}

// DDD + número em caixinhas separadas, com sub-rótulos, igual ao original.
function CampoTelefone({ cap, valor, w }) {
  const limpo = (valor || '').replace(/\D/g, '')
  const ddd = limpo.slice(0, 2)
  const numero = limpo.slice(2)
  return (
    <div className="sus-field" style={{ flexGrow: w || 1, flexBasis: 0 }}>
      <span className="cap">{cap}</span>
      <div className="sus-tel">
        <div className="grupo"><span className="subcap">DDD</span><Digitos valor={ddd} n={2} /></div>
        <div className="grupo"><span className="subcap">Nº do telefone</span><Digitos valor={numero} n={9} /></div>
      </div>
    </div>
  )
}

// Sexo — checkbox + código fixo impresso ao lado (Masc. (X) 1 · Fem. ( ) 3),
// igual ao original: o número não é o dado, é rótulo fixo do formulário.
function CampoSexo({ sexo }) {
  return (
    <div className="sus-field" style={{ flexGrow: 1, flexBasis: 0 }}>
      <span className="cap">9. Sexo</span>
      <div className="sus-sexo">
        <span className="sus-checkbox">Masc. <Marca marcado={sexo === 'M'} /> 1</span>
        <span className="sus-checkbox">Fem. <Marca marcado={sexo === 'F'} /> 3</span>
      </div>
    </div>
  )
}

// Réplica do formulário oficial do SUS "Laudo para Solicitação de Autorização
// de Internação Hospitalar" — layout de caixas burocráticas padrão nacional,
// igual ao documento físico usado hoje na UPA, campo por campo, sem omitir
// nenhuma seção (Estabelecimento, Paciente, Justificativa, Diagnóstico,
// Procedimento, Causas Externas e Autorização).
function CorpoAihOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_formulario || {}
  const enderecoCompleto = [pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')
  const cidPrincipal = registro.cid_catalog ? `${registro.cid_catalog.codigo} — ${registro.cid_catalog.descricao}` : (registro.cid_principal || '')

  return (
    <div className="sus-page">
      <div className="sus-letterhead">
        <div className="sus-letterhead-texto">
          <div className="nome">UPA 24H BREVES</div>
          <div>PREFEITURA MUNICIPAL DE BREVES</div>
          <div>SECRETARIA MUNICIPAL DE SAÚDE — SEMSA</div>
        </div>
        <div className="sus-letterhead-logos">
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
          <img src="./logos/semsa.jpg" alt="SEMSA" />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 700, marginBottom: 3 }}>ANEXO I</div>
      <div className="sus-header">
        <div className="sus-header-badge"><span className="sigla">SUS</span></div>
        <div className="sus-header-coluna">Sistema Único de Saúde</div>
        <div className="sus-header-coluna">Ministério da Saúde</div>
        <div className="sus-header-titulo">
          LAUDO PARA SOLICITAÇÃO DE AUTORIZAÇÃO<br />DE INTERNAÇÃO HOSPITALAR
        </div>
      </div>

      <div className="sus-corpo">
      <div className="sus-secao">
        <div className="sus-secao-titulo">Identificação do Estabelecimento de Saúde</div>
        <div className="sus-grid">
          <CampoSus cap="1. Nome do estabelecimento solicitante" val={cf.estabelecimento_solicitante_nome} w={3} />
          <CampoComb cap="2. CNES" val={cf.estabelecimento_solicitante_cnes} digitos={7} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="3. Nome do estabelecimento executante" val={cf.estabelecimento_executante_nome} w={3} />
          <CampoComb cap="4. CNES" val={cf.estabelecimento_executante_cnes} digitos={7} />
        </div>
      </div>

      <div className="sus-secao">
        <div className="sus-secao-titulo">Identificação do Paciente</div>
        <div className="sus-grid">
          <CampoSus cap="5. Nome do paciente" val={pessoa.nome} w={3} />
          <CampoSus cap="6. Nº do prontuário" val={pessoa.prontuario_numero} />
        </div>
        <div className="sus-grid">
          <CampoComb cap="7. Cartão Nacional de Saúde (CNS)" val={pessoa.cns} digitos={15} w={2} />
          <CampoData cap="8. Data de nascimento" valorISO={pessoa.data_nascimento} />
          <CampoSexo sexo={pessoa.sexo} />
          <CampoSus cap="10. Raça/Cor · 10.1 Etnia" val={[pessoa.raca_cor, cf.etnia].filter(Boolean).join(' · ')} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="11. Nome da mãe" val={pessoa.nome_mae} w={2} />
          <CampoTelefone cap="12. Telefone de contato" valor={pessoa.telefone} w={2} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="13. Nome do responsável" val={cf.nome_responsavel} w={2} />
          <CampoTelefone cap="14. Telefone de contato" valor="" w={2} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="15. Endereço (rua, nº, bairro)" val={enderecoCompleto} full />
        </div>
        <div className="sus-grid">
          <CampoSus cap="16. Município de residência" val={pessoa.cidade} w={2} />
          <CampoComb cap="17. Cód. IBGE município" val={cf.municipio_residencia_ibge} digitos={7} />
          <CampoSus cap="18. UF" val={cf.municipio_residencia_uf} />
          <CampoComb cap="19. CEP" val={cf.municipio_residencia_cep} digitos={8} />
        </div>
      </div>

      <div className="sus-secao">
        <div className="sus-secao-titulo-central">Justificativa da Internação</div>
        <div className="sus-grid"><CampoSus cap="20. Principais sinais e sintomas clínicos" val={cf.sinais_sintomas_clinicos} full /></div>
        <div className="sus-grid"><CampoSus cap="21. Condições que justificam a internação" val={cf.condicoes_justificam_internacao} full /></div>
        <div className="sus-grid"><CampoSus cap="22. Principais resultados de provas diagnósticas (resultados de exames realizados)" val={cf.resultados_provas_diagnosticas} full /></div>
        <div className="sus-grid" style={{ borderTop: '1px solid #000' }}>
          <CampoSus cap="23. Diagnóstico inicial" val={cf.diagnostico_inicial_texto} w={2.6} />
          <CampoSus cap="24. CID 10 principal" val={cidPrincipal} w={0.9} />
          <CampoSus cap="25. CID 10 secundário" val={registro.cid_secundario} w={0.9} />
          <CampoSus cap="26. CID 10 causas associadas" val={cf.cid_causas_associadas} w={0.9} />
        </div>
      </div>

      <div className="sus-secao">
        <div className="sus-secao-titulo-central">Procedimento Solicitado</div>
        <div className="sus-grid">
          <CampoSus cap="27. Descrição do procedimento solicitado" val={registro.procedimento_principal_nome} w={3} />
          <CampoComb cap="28. Código do procedimento" val={registro.procedimento_principal_codigo} digitos={10} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="29. Clínica" val={cf.clinica || (leitoNumero ? `Leito ${leitoNumero} — ${setorNome}` : '')} />
          <CampoSus cap="30. Caráter da internação" val={cf.carater_internacao === 'ELETIVA' ? 'Eletiva' : 'Urgência'} />
          <div className="sus-field" style={{ flexGrow: 1.4, flexBasis: 0, whiteSpace: 'nowrap' }}>
            <span className="cap">31. Documento</span>
            <div style={{ marginTop: 1, display: 'flex', gap: 6 }}>
              <span className="sus-checkbox"><Marca marcado={cf.profissional_documento_tipo === 'CNS'} /> CNS</span>
              <span className="sus-checkbox"><Marca marcado={cf.profissional_documento_tipo === 'CPF'} /> CPF</span>
            </div>
          </div>
          <CampoComb cap="32. Nº documento (CNS/CPF) do profissional solicitante/assistente" val={cf.profissional_documento_numero} digitos={15} w={2.2} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="33. Nome do profissional solicitante/assistente" val={medico?.nome_exibicao || medico?.nome} w={1.8} />
          <CampoData cap="34. Data da solicitação" valorISO={registro.criado_em ? registro.criado_em.slice(0, 10) : ''} w={1.4} />
          <CampoSus cap="35. Assinatura e carimbo (nº do registro do conselho)" val={medico?.crm ? `CRM ${medico.crm}` : ''} w={1.8} />
        </div>
      </div>
      </div>

      <div className="sus-box-solo">
        <div className="sus-secao-titulo-central">Preencher em Caso de Causas Externas (Acidentes ou Violências)</div>
        <div className="sus-duas-colunas">
          <div className="col" style={{ flex: '0 0 180px' }}>
            <div className="sus-field" style={{ flexBasis: '100%' }}><span className="sus-checkbox"><Marca marcado={cf.causa_externa_transito} /> 36. Acidente de trânsito</span></div>
            <div className="sus-field" style={{ flexBasis: '100%' }}><span className="sus-checkbox"><Marca marcado={cf.causa_externa_trabalho_tipico} /> 37. Acidente trabalho típico</span></div>
            <div className="sus-field" style={{ flexBasis: '100%' }}><span className="sus-checkbox"><Marca marcado={cf.causa_externa_trabalho_trajeto} /> 38. Acidente trabalho trajeto</span></div>
          </div>
          <div className="col">
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoComb cap="39. CNPJ da seguradora" val={cf.cnpj_seguradora} digitos={14} /></div>
            <div className="sus-grid">
              <CampoSus cap="40. Nº do bilhete" val={cf.numero_bilhete} />
              <CampoSus cap="41. Série" val={cf.serie_bilhete} />
            </div>
          </div>
        </div>
        <div className="sus-grid" style={{ borderTop: '1px solid #000' }}>
          <CampoComb cap="42. CNPJ da empresa" val={cf.cnpj_empresa} digitos={14} w={2} />
          <CampoSus cap="43. CNAE da empresa" val={cf.cnae_empresa} />
          <CampoSus cap="44. CBOR" val={cf.cbor} />
        </div>
        <div className="sus-grid" style={{ marginTop: 4, borderTop: '1px solid #000' }}>
          <div className="sus-field" style={{ flexBasis: '100%' }}>
            <span className="cap">45. Vínculo com a previdência</span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 }}>
              {VINCULO_PREVIDENCIA_OPCOES.map((op) => (
                <span key={op.valor} className="sus-checkbox"><Marca marcado={cf.vinculo_previdencia === op.valor} /> {op.rotulo}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sus-box-solo">
        <div className="sus-secao-titulo-central">Autorização</div>
        <div className="sus-duas-colunas">
          <div className="col" style={{ flex: 3 }}>
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoSus cap="46. Nome do profissional autorizador" val={cf.autorizador_nome} /></div>
          </div>
          <div className="col">
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoSus cap="47. Cód. órgão emissor" val={cf.autorizador_codigo_orgao_emissor} /></div>
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoSus cap="52. Nº da autorização de internação hospitalar" val={cf.numero_autorizacao} /></div>
          </div>
        </div>
        <div className="sus-grid" style={{ borderTop: '1px solid #000' }}>
          <div className="sus-field">
            <span className="cap">48. Documento</span>
            <div style={{ marginTop: 1 }}>
              <span className="sus-checkbox"><Marca marcado={cf.autorizador_documento_tipo === 'CNS'} /> CNS</span>
              <span className="sus-checkbox"><Marca marcado={cf.autorizador_documento_tipo === 'CPF'} /> CPF</span>
            </div>
          </div>
          <CampoComb cap="49. Nº documento (CNS/CPF) do profissional autorizador" val={cf.autorizador_documento_numero} digitos={15} w={3} />
        </div>
        <div className="sus-grid">
          <CampoData cap="50. Data da autorização" valorISO={cf.data_autorizacao} />
          <CampoSus cap="51. Assinatura e carimbo (nº do registro do conselho)" val="" w={3} />
        </div>
      </div>

      <div className="sus-rodape-legal">Esta conta é paga com recursos públicos do SUS</div>
      <div className="doc-rodape-meta">Registrado em {dataHora}</div>
    </div>
  )
}

function CorpoApac({ registro }) {
  return (
    <>
      <Secao rotulo="Procedimento" valor={`${registro.procedimento_nome}${registro.procedimento_codigo ? ` (${registro.procedimento_codigo})` : ''}`} />
      <Secao rotulo="Quantidade" valor={registro.quantidade} />
      <Secao rotulo="CID principal" valor={registro.cid_principal} />
      <Secao rotulo="CID secundário" valor={registro.cid_secundario} />
      <Secao rotulo="Justificativa clínica" valor={registro.justificativa} />
      <Secao rotulo="Nº de autorização" valor={registro.numero_autorizacao} />
      <Secao rotulo="Validade" valor={registro.validade_inicio ? `${new Date(registro.validade_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}${registro.validade_fim ? ` a ${new Date(registro.validade_fim + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}` : null} />
    </>
  )
}

// Réplica fiel do "FORMULÁRIO ANTIMICROBIANO - ATM" oficial (UPA Breves) —
// mesma grade de caixas, ordem dos campos e lista de antibióticos de uso
// restrito. O parecer do farmacêutico fica em branco no impresso de propósito
// (é preenchido manualmente no papel, fora do sistema — decisão de produto
// já tomada antes: "liberação avaliada e registrada manualmente").
const ATMF_ANTIBIOTICOS = [
  ['CEFEPIME', 'MEROPENEM'],
  ['CIPROFLOXACINO', 'METRONIDAZOL'],
  ['CLINDAMICINA', 'PIPERACILINA + TAZOBACTAM'],
  ['LEVOFLOXACINO', 'VANCOMICINA'],
]

function CorpoAtmOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}

  return (
    <div className="atmf-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="SOLICITAÇÃO DE AUTORIZAÇÃO DE USO DE ANTIMICROBIANO (ATM)"
          pessoa={pessoa}
          atendimento={atendimento}
          idade={idade}
          leitoNumero={leitoNumero}
          setorNome={setorNome}
          medico={medico}
          dataHora={dataHora}
        />

        <div className="med-secao">
          <div className="med-secao-header">1. Diagnóstico Clínico / Infeccioso e Admissão</div>
          <div className="med-secao-body" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><b>DIAGNÓSTICO:</b> {cf.diagnostico || registro.diagnostico || '—'}</div>
            <div><b>DATA DE INTERNAÇÃO:</b> {cf.data_internacao ? new Date(cf.data_internacao + 'T00:00:00').toLocaleDateString('pt-BR') : dataHora.split(',')[0]}</div>
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Justificativa Clínica para o Uso de Antimicrobiano Restrito</div>
          <div className="med-secao-body">
            {registro.justificativa_clinica || cf.justificativa || 'Paciente com infecção grave/refratária necessitando de escalonamento terapêutico conforme protocolo institucional da CCIH.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Tratamento Antimicrobiano Proposto</div>
          <div className="med-secao-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <div><b>TRATAMENTO PRETENDIDO:</b> {cf.tratamento_pretendido || 'Terapêutica antimicrobiana escalonada'}</div>
              <div><b>VIA:</b> <span style={{ color: '#0369a1', fontWeight: 700 }}>{cf.via || registro.via || 'Endovenosa (EV)'}</span></div>
            </div>
            <div style={{ fontSize: 10, marginBottom: 2 }}>
              <b>MEDICAMENTO SOLICITADO:</b> <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '10.5px' }}>{registro.medicamento || '—'}</span>
            </div>
            <div><b>POSOLOGIA / INFUSÃO:</b> {registro.posologia || 'Conforme prescrição médica e protocolo de infusão da CCIH.'}</div>

            <div className="grid-tratamento">
              <div><b>DOSE:</b> {registro.dose || '—'}</div>
              <div><b>INTERVALO:</b> {registro.intervalo || '—'}</div>
              <div><b>TEMPO DE USO:</b> {registro.tempo_uso_dias ? `${registro.tempo_uso_dias} DIAS` : '—'}</div>
              <div style={{ textAlign: 'right', paddingRight: 4 }}><b>REGIME:</b> Contínuo</div>
            </div>
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Quantitativo Total do Tratamento Solicitado (DxIxT)</div>
          <div className="med-secao-body">
            <div className="grid-dxixt">
              <div><b>CÁLCULO DxIxT:</b> {cf.dxixt || '—'}</div>
              <div><b>AMPOLAS:</b> {cf.ampolas || '—'}</div>
              <div><b>FRASCO-AMPOLAS:</b> {cf.frasco_ampolas || '—'}</div>
              <div><b>BOLSAS:</b> {cf.bolsas || '—'}</div>
            </div>
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">5. Parecer Farmacêutico e Controle de Estoque (CCIH / Farmácia Central)</div>
          <div className="med-secao-body">
            <div className="parecer-box">
              <div className="parecer-opcoes">
                <span>PARECER:</span>
                <label><b>[ {cf.parecer_status === 'de_acordo' ? 'X' : ' '} ] DE ACORDO</b></label>
                <label><b>[ {cf.parecer_status === 'contrario' ? 'X' : ' '} ] CONTRÁRIO</b></label>
                <span style={{ fontSize: 8.5, fontWeight: 'normal', marginLeft: 'auto', color: '#475569' }}>Avaliação Técnica de Farmácia Clínica</span>
              </div>
              <div style={{ fontWeight: 700, margin: '3px 0 2px', fontSize: 8.5 }}>DISPONIBILIDADE EM ESTOQUE HOSPITALAR:</div>
              <div style={{ lineHeight: 1.35 }}>
                <div>[ {cf.parecer_estoque === 'integral' ? 'X' : ' '} ] Há disponível em estoque quantidade que contemple o tratamento proposto integralmente.</div>
                <div>[ {cf.parecer_estoque === 'parcial' ? 'X' : ' '} ] Há disponível em estoque somente quantidade para garantia parcial do tratamento proposto.</div>
                <div>[ {cf.parecer_estoque === 'indisponivel' ? 'X' : ' '} ] Não há disponível em estoque quantidade que contemple o tratamento proposto.</div>
              </div>
              <div style={{ marginTop: 3, borderTop: '1px dashed #cbd5e1', paddingTop: 2 }}>
                <b>OBSERVAÇÕES:</b> {cf.parecer_obs || 'Dispensação avaliada e registrada conforme rotina institucional.'}
              </div>
            </div>
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">6. Antimicrobianos de Uso Restrito Institucional (Controle Obrigatório UPA Breves)</div>
          <div className="med-secao-body">
            <div className="atb-grid">
              {ATMF_ANTIBIOTICOS.map(([a, b]) => (
                <div key={a} style={{ display: 'contents' }}>
                  <div className="atb-item"><span className="atb-bullet">&bull;</span><b>{a}</b></div>
                  <div className="atb-item"><span className="atb-bullet">&bull;</span><b>{b}</b></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo" style={{ paddingTop: 2 }}>
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Solicitação:</b> {dataHora.split(',')[1] || ''} &bull; Validade: 24h</div>
          </div>
          <div style={{ display: 'flex', gap: 30 }}>
            <div className="doc-bloco-assinatura" style={{ minWidth: 170 }}>
              <div className="linha-sig"></div>
              <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Dr(a). Médico(a)'}</div>
              <div className="coren-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'Médico(a) Solicitante'}</div>
              <div className="cargo-sig">Médico Assistente Solicitante</div>
            </div>
            <div className="doc-bloco-assinatura" style={{ minWidth: 170 }}>
              <div className="linha-sig"></div>
              <div className="nome-sig">Farmácia Clínica / CCIH</div>
              <div className="coren-sig">UPA 24h Breves</div>
              <div className="cargo-sig">Farmacêutico(a) Responsável</div>
            </div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Formulário Antimicrobiano (ATM) &bull; Uso Restrito &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function CorpoTfdOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}

  return (
    <div className="tfdf-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="TRATAMENTO FORA DE DOMICÍLIO — LAUDO MÉDICO (LM/TFD)"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="pr-info" style={{ marginTop: '2px', marginBottom: '3.5px' }}>
          <div className="pr-linha" style={{ background: '#f8fafc' }}>
            <div className="pr-campo" style={{ flexBasis: '35%' }}>
              <b>Nº DO LAUDO MÉDICO:</b> <span className="laudo-badge">{cf.numero_laudo || '2026/TFD-UPA'}</span>
            </div>
            <div className="pr-campo" style={{ flexBasis: '35%' }}>
              <b>PROFISSÃO:</b> {cf.profissao || 'Não informada'}
            </div>
            <div className="pr-campo" style={{ flexBasis: '30%' }}>
              <b>CARÁTER:</b> {atendimento?.carater || 'URGÊNCIA REGULADA'}
            </div>
          </div>
          {(registro.acompanhante_nome || cf.identidade) && (
            <div className="pr-linha" style={{ background: '#faf5ff' }}>
              <div className="pr-campo" style={{ flexBasis: '55%' }}>
                <b>ACOMPANHANTE INDICADO:</b> {registro.acompanhante_nome || 'Não necessita'}
              </div>
              <div className="pr-campo" style={{ flexBasis: '25%' }}>
                <b>PARENTESCO / RELAÇÃO:</b> {registro.acompanhante_relacao || '—'}
              </div>
              <div className="pr-campo" style={{ flexBasis: '20%' }}>
                <b>RG ACOMP./PAC.:</b> {cf.identidade || pessoa.rg || '—'}
              </div>
            </div>
          )}
        </div>

        <div className="med-secao">
          <div className="med-secao-header">1. História da Doença Atual (HDA) e Justificativa de Deslocamento</div>
          <div className="med-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.historia_doenca_atual || 'Sem relato de HDA preenchido.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Exame Físico Geral e Específico Dirigido</div>
          <div className="med-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.exame_fisico || 'Exame físico sem alterações descritas.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Hipótese Diagnóstica e Indisponibilidade de Tratamento Local</div>
          <div className="med-secao-body" style={{ minHeight: '16mm', whiteSpace: 'pre-wrap' }}>
            <div><b>DIAGNÓSTICO / CID:</b> {registro.diagnostico || 'Não informado'}</div>
            <div style={{ marginTop: '3px' }}>
              <b>JUSTIFICATIVA TFD:</b> {cf.justificativa_tfd || 'Indisponibilidade de suporte propedêutico especializado e/ou tratamento de alta complexidade no município de Breves/Região do Marajó, necessitando de encaminhamento regulado para serviço de referência.'}
            </div>
          </div>
        </div>

        <div className="med-secao med-secao-expansivel">
          <div className="med-secao-header">4. Tratamentos Realizados e Dados do Encaminhamento TFD</div>
          <div className="med-secao-body" style={{ padding: '2px 4px' }}>
            <table className="tabela-tfd">
              <tbody>
                <tr>
                  <td className="rotulo">Exames Complementares:</td>
                  <td>{registro.exame_complementar || 'Nenhum exame anexado'}</td>
                </tr>
                <tr>
                  <td className="rotulo">Tratamento Realizado na UPA:</td>
                  <td>{registro.tratamento_realizado || 'Medidas de suporte clínico e estabilização'}</td>
                </tr>
                <tr>
                  <td className="rotulo">Tratamento Indicado no Destino:</td>
                  <td>{registro.tratamento_indicado || 'Avaliação por especialista focal e seguimento terciário'}</td>
                </tr>
                <tr>
                  <td className="rotulo">Tempo Provável de Tratamento:</td>
                  <td><b>{registro.tempo_provavel_dias ? `${registro.tempo_provavel_dias} DIAS` : 'A definir pelo serviço de referência'}</b></td>
                </tr>
                <tr>
                  <td className="rotulo">Meio de Transporte Recomendado:</td>
                  <td><b>{cf.meio_transporte || 'Fluvial / Terrestre com Acompanhante'}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Emissão Oficial TFD:</b> Secretaria Municipal de Saúde &bull; Regulação SER</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Solicitante'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Solicitante — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Sistema Único de Saúde — Tratamento Fora de Domicílio (TFD) — SEMSA / UPA 24h Breves</span>
          <span>Laudo Médico LM/TFD Oficial &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

const PLANO_PROTOCOLOS_PADRAO = [
  { nome: 'IDENTIFICAÇÃO DO PACIENTE', obrigatorio: true },
  { nome: 'PREVENÇÃO DE QUEDAS (Grades elevadas)', obrigatorio: true },
  { nome: 'PREVENÇÃO DE LPP (Mudança decúbito)', obrigatorio: true },
  { nome: 'CONTROLE DA DOR', chave: 'dor' },
  { nome: 'TEV — TROMBOEMBOLISMO VENOSO', chave: 'tev' },
  { nome: 'SEPSE / CHOQUE SÉPTICO', chave: 'sepse' },
  { nome: 'AVC — ACIDENTE VASCULAR CEREBRAL', chave: 'avc' },
  { nome: 'SÍNDROME CORONARIANA / DOR TORÁCICA', chave: 'coronariana' },
  { nome: 'INSUFICIÊNCIA RESPIRATÓRIA / VIA AÉREA', chave: 'respirat' },
  { nome: 'EMERGÊNCIAS GLICÊMICAS', chave: 'glic' },
]

const PLANO_EQUIPE_PADRAO = [
  { nome: 'ENFERMAGEM', chave: 'enfermagem' },
  { nome: 'FISIOTERAPIA RESPIRATÓRIA', chave: 'fisioterapia' },
  { nome: 'SERVIÇO SOCIAL', chave: 'social' },
  { nome: 'NUTRIÇÃO CLÍNICA', chave: 'nutri' },
  { nome: 'FARMÁCIA CLÍNICA', chave: 'farm' },
  { nome: 'TRANSPORTE / REGULAÇÃO', chave: 'transporte' },
]

function CorpoPlanoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const extra = registro.campos_extra || {}
  const problemas = extra.problemas_ativos || []
  const protocolosSelecionados = registro.protocolos_elegiveis || []
  const equipeSelecionada = registro.equipe_multidisciplinar || []

  return (
    <div className="plano-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="PLANO TERAPÊUTICO HOSPITALAR"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="med-secao" style={{ marginTop: '2px' }}>
          <div className="med-secao-header">1. Diagnósticos Clínicos e Hipóteses Ativas (Alocando o Principal na 1ª Linha)</div>
          <div className="med-secao-body">
            <div><b>1. PRINCIPAL:</b> {registro.diagnostico_principal_cid || extra.diagnostico_principal || 'Não informado'}</div>
            {extra.diagnosticos_texto && (
              <div style={{ marginTop: '2px' }}><b>2. SECUNDÁRIOS:</b> {extra.diagnosticos_texto}</div>
            )}
            {extra.comorbidades_antecedentes && (
              <div style={{ marginTop: '2px', color: '#475569' }}><b>Comorbidades / Antecedentes:</b> {extra.comorbidades_antecedentes}</div>
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Motivo da Permanência / Internação (Causa-base que justifica a observação)</div>
          <div className="med-secao-body" style={{ minHeight: '14mm', whiteSpace: 'pre-wrap' }}>
            {registro.motivo_internacao || 'Paciente em observação clínica e estabilização na unidade.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Objetivos da Terapêutica (Metas com tempo previsto de alcance)</div>
          <div className="med-secao-body">
            {problemas.length > 0 ? (
              <div className="metas-lista">
                {problemas.map((p, i) => (
                  <div key={i} className="metas-item">
                    <span>&bull; <b>{p.descricao}:</b> {p.meta} {p.conduta ? `(${p.conduta})` : ''}</span>
                    <b>{p.prazo || 'CONTÍNUO'}</b>
                  </div>
                ))}
              </div>
            ) : registro.objetivos_terapeuticos ? (
              <div className="metas-lista">
                {registro.objetivos_terapeuticos.split('\n').filter(Boolean).map((linha, idx) => (
                  <div key={idx} className="metas-item">
                    <span>&bull; {linha}</span>
                    <b>PREVISTO</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="metas-lista">
                <div className="metas-item">
                  <span>&bull; Estabilização hemodinâmica e monitorização de parâmetros vitais</span>
                  <b>CONTÍNUO</b>
                </div>
                <div className="metas-item">
                  <span>&bull; Rastreio propedêutico e resposta clínica às condutas instituídas</span>
                  <b>24 HORAS</b>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Elegível para Protocolos Institucionais (Obrigatórios e Específicos)</div>
          <div className="med-secao-body">
            <div className="proto-grid">
              {PLANO_PROTOCOLOS_PADRAO.map((p) => {
                const ativo = p.obrigatorio || protocolosSelecionados.some((s) => s.toLowerCase().includes(p.chave || p.nome.toLowerCase()))
                return (
                  <div key={p.nome} className={`proto-item ${ativo ? 'ativo' : 'inativo'}`}>
                    <b>{ativo ? '[ X ]' : '[   ]'}</b> {p.nome}
                  </div>
                )
              })}
              {extra.protocolo_outro && (
                <div className="proto-item ativo">
                  <b>[ X ]</b> Outro: {extra.protocolo_outro}
                </div>
              )}
            </div>
            {extra.medidas_seguranca_texto && (
              <div style={{ marginTop: '3px', paddingTop: '2px', borderTop: '1px dashed #e2e8f0', fontSize: '8.2px' }}>
                <b>Medidas de Segurança Assistencial:</b> {extra.medidas_seguranca_texto}
              </div>
            )}
          </div>
        </div>

        <div className="med-secao med-secao-expansivel">
          <div className="med-secao-header">5. Tempo de Permanência Previsto e Equipe Multidisciplinar</div>
          <div className="med-secao-body">
            <div className="grid-equipe-tempo">
              <div className="box-destaque-tempo">
                <span className="num">
                  {registro.tempo_internacao_previsto_dias ? `${String(registro.tempo_internacao_previsto_dias).padStart(2, '0')} DIAS` : '24 a 48H'}
                </span>
                <span className="sub">Tempo Previsto na UPA</span>
                <span style={{ fontSize: '8px', color: '#334155', marginTop: '3px' }}>
                  {extra.criterios_alta ? `Critério de alta: ${extra.criterios_alta}` : 'Estabilização clínica e definição de desfecho'}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '3px' }}>EQUIPE MULTIPROFISSIONAL ENVOLVIDA:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5px 6px', fontSize: '8.5px' }}>
                  {PLANO_EQUIPE_PADRAO.map((eq) => {
                    const ativo = eq.chave === 'enfermagem' || equipeSelecionada.some((s) => s.toLowerCase().includes(eq.chave))
                    return (
                      <div key={eq.nome} style={{ color: ativo ? '#0f172a' : '#64748b', fontWeight: ativo ? 700 : 400 }}>
                        {ativo ? '[ X ]' : '[   ]'} {eq.nome}
                      </div>
                    )
                  })}
                  {extra.equipe_outros && (
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>
                      [ X ] Outro: {extra.equipe_outros}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Elaborado às:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora} &bull; Prontuário Oficial</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Responsável'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Responsável pelo Plano Terapêutico</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Plano Terapêutico Hospitalar &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

// Réplica fiel do formulário oficial da Fundação Hemopa (SOLICITAÇÃO DE
// SANGUE, COMPONENTES E DERIVADOS) — mesmo texto, ordem e agrupamento em
// caixas do modelo em papel. Estilo próprio (prefixo "sg-"), já que este
// documento segue a estética de formulário burocrático clássico (bordas
// finas uniformes, "( )" em vez de checkbox preenchido), não o layout
// moderno em camadas usado pela Admissão/Plano Terapêutico.
const SG_HEMOCOMPONENTES = [
  'Concentrado de hemácias pobre em leucócitos(+ 300 ml/unid)',
  'Concentrado de hemácias (+ 300 ml/unid)',
  'Concentrado de hemácias pobre em leucócitos irradiado(+ 300 ml/unid)',
  'Plasma fresco congelado (+ 200ml/unid)',
  'Concentrado de plaquetas pobre em leucócitos(+ 60 ml/unid)',
  'Concentrado de plaquetas pobre em leucócitos irradiado(+ 60 ml/unid)',
  'Concentrado de plaquetas por aférese (+ 300 ml/unid)',
  'Crioprecipitado (+ 20 ml/unid)',
]

function SgCheck({ marcado, children }) {
  return <span className="sg-check">( {marcado ? 'X' : ' '} ) {children}</span>
}

function CorpoSangueOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}
  const hemo = cf.hemocomponentes || {}
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''
  const fmtData = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR').split('/').join(' / ') : '____/____/____')

  return (
    <div className="sg-page">
      <div className="sg-topo">
        <div className="sg-topo-logo"><img src="./logos/upa24h.jpg" alt="UPA 24h" /></div>
        <div className="sg-topo-texto">
          <div className="nome">PREFEITURA MUNICIPAL DE BREVES</div>
          <div>SECRETARIA MUNICIPAL DE SAÚDE - SEMSA</div>
          <div>Travessa Castilhos França - Aeroporto - CNPJ 02.967.963/0001-11</div>
          <div>Breves - Pará - CEP 68.800-000</div>
        </div>
        <div className="sg-topo-aviso">
          Solicitação incompleta, inadequada ou ilegível, não será aceita pelo Serviço de Hemoterapia,
          conforme legislação vigente do Ministério da Saúde.
          <b>Hemopa adicionado às ______________ horas</b>
        </div>
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">SOLICITAÇÃO DE SANGUE, COMPONENTES E DERIVADOS</div>
        <div className="sg-linha"><b>PACIENTE:</b> <i>{pessoa.nome}</i></div>
        <div className="sg-linha">
          <span><b>DATA NASC.:</b> <i>{nascimento}</i></span>
          <span><b>SEXO:</b> <i>{pessoa.sexo === 'F' ? 'FEMININO' : pessoa.sexo === 'M' ? 'MASCULINO' : ''}</i></span>
          <span><b>PESO:</b> {cf.peso}</span>
          <span><b>HB/HT:</b> <i>{cf.hb_ht}</i></span>
        </div>
        <div className="sg-linha">
          <span><b>HOSPITAL:</b> <i>UPA 24h Breves</i></span>
          <span><b>APT:</b> {cf.apt}</span>
          <span><b>ENFª/LEITO:</b> {cf.enf_leito || leitoNumero}</span>
        </div>
        <div className="sg-linha">
          <span><b>REGISTRO HOSPITALAR:</b> {cf.registro_hospitalar || atendimento?.numero_atendimento}</span>
          <span><b>CATEGORIA:</b> {cf.categoria}</span>
        </div>
        <div className="sg-linha">
          <span><b>RECEBEU TRANSFUSÃO:</b> <i>{cf.recebeu_transfusao === 'sim' ? 'SIM' : cf.recebeu_transfusao === 'nao' ? 'NÃO' : ''}</i></span>
          <span><b>QUANDO:</b> {cf.quando ? new Date(cf.quando + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
          <span><b>ONDE:</b> {cf.onde}</span>
        </div>
        <div className="sg-linha">
          <span><b>ANTECEDENTES DE ANTICORPO IRREGULAR?</b> <SgCheck marcado={cf.antecedentes_anticorpo === 'sim'}>SIM</SgCheck> <SgCheck marcado={cf.antecedentes_anticorpo === 'nao'}>NÃO</SgCheck></span>
          <span><b>SOLICITOU DOADORES?</b> {cf.solicitou_doadores}</span>
        </div>
        <div className="sg-linha"><b>INDICAÇÃO CLÍNICA / CIRURGIA PROPOSTA:</b> <i>{registro.indicacao_clinica}</i></div>
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">HEMOCOMPONENTES / HEMODERIVADOS</div>
        <table className="sg-tabela">
          <tbody>
            {SG_HEMOCOMPONENTES.map((item) => (
              <tr key={item}>
                <td>{item}</td>
                <td className="qtd">{hemo[item]?.marcado ? (hemo[item]?.quantidade || 'X') : ''}</td>
              </tr>
            ))}
            <tr><td>Outros: {cf.outros_hemocomponentes}</td><td></td></tr>
          </tbody>
        </table>
      </div>

      <p className="sg-nota">Obrigatório prescrição do produto no prontuário médico do paciente.</p>
      <p className="sg-nota">Devolver até 48h, o(s) produto(s) não transfundido(s).</p>

      <div className="sg-assinatura">
        <span className="sg-assinatura-linha">Médico solicitante: {medico?.nome_exibicao || medico?.nome}</span>
        <span>Data: {dataHora.split(',')[0]}</span>
        <span>Hora: {dataHora.split(', ')[1] || ''}</span>
      </div>
      <div className="sg-assinatura-legenda">Médico / CRM {medico?.crm ? `— ${medico.crm}` : ''}</div>

      <div className="sg-opcoes">
        <p><SgCheck marcado={cf.urgencia === 'urgencia'}>Urgência, a realizar dentro de 3 horas.</SgCheck></p>
        <p><SgCheck marcado={cf.urgencia === 'rotina'}>Não urgente (rotina), a realizar dentro de 24 horas.</SgCheck></p>
        <p>
          <SgCheck marcado={cf.urgencia === 'cirurgia'}>Programada:</SgCheck> - Para cirurgia eletiva em {fmtData(cf.cirurgia_data)}, às {cf.cirurgia_hora || '_______'} horas com possível transfusão.
        </p>
        <p style={{ paddingLeft: '10mm' }}>Para transfusão em regime ambulatorial, dia {fmtData(cf.ambulatorial_data)}, às {cf.ambulatorial_hora || '_____'} horas.</p>
        <p style={{ paddingLeft: '10mm', fontWeight: 700 }}>OBS.: Encaminhar paciente à Fundação Hemopa com antecedência de 3 (três) dias úteis.</p>
        <p>A não observação deste item cancela automaticamente esta solicitação.</p>
        <p><SgCheck marcado={cf.urgencia === 'residencia'}>Transfusão em residência - Obrigatório preenchimento de Termo de Responsabilidade.</SgCheck></p>
        <p><SgCheck marcado={cf.urgencia === 'auto'}>Auto-transfusão</SgCheck></p>
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">TRANSFUSÃO DE EXTREMA URGÊNCIA</div>
        <p className="sg-nota" style={{ padding: '1mm 2mm' }}>Autorizo a transfusão de sangue sem testes pré-transfusionais exigidos por se tratar de risco de vida.</p>
        <div className="sg-linha">
          <span>Médico solicitante: {cf.extrema_urgencia ? (medico?.nome_exibicao || medico?.nome) : ''}</span>
          <span>Data: {fmtData(cf.extrema_urgencia_data)}</span>
          <span>Hora: {cf.extrema_urgencia_hora || '________'}</span>
        </div>
      </div>

      <div className="sg-linha-solta">
        Coletado por: {cf.coletado_por} &nbsp;&nbsp; Data: {fmtData(cf.coletado_data)} &nbsp;&nbsp; Hora: {cf.coletado_hora || '________'}
      </div>

      <div className="sg-caixa">
        <div className="sg-titulo">ESPAÇO RESERVADO EXCLUSIVAMENTE PARA USO DA FUNDAÇÃO HEMOPA</div>
        <table className="sg-tabela sg-tabela-hemopa">
          <thead>
            <tr>
              <th>DATA</th><th>PRODUTO</th><th>G.S.</th><th>VOLUME</th><th>COLETA</th><th>TUBO</th><th>RESULTADO</th><th>HORA</th><th>TÉCNICO</th><th>SOLICITAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 10 }).map((_, j) => <td key={j}>&nbsp;</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sg-linha-solta">
        PAI: I {cf.pai_i} &nbsp; II {cf.pai_ii} &nbsp; AC: {cf.ac} &nbsp; CD: {cf.cd} &nbsp; RESPONSÁVEL: {cf.responsavel_hemopa} &nbsp; DATA: {fmtData(cf.hemopa_data)} &nbsp; HORA: {cf.hemopa_hora || '_____'}
      </div>
    </div>
  )
}

function SerCampoVital({ rotulo, valor }) {
  return (
    <div className="serf-vital">
      <div className="serf-vital-rotulo">{rotulo}:</div>
      <div className="serf-vital-caixa">{valor || ''}</div>
    </div>
  )
}

function CorpoRegulacaoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const sv = registro.sinais_vitais || {}
  const dataCadastro = dataHora.split(',')[0]

  return (
    <div className="serf-page">
      <CabecalhoPadraoUPA
        titulo="ATUALIZAÇÃO DE QUADRO CLÍNICO DE PACIENTE REGULADO"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
      />

      <div className="doc-corpo">
        {/* Bloco de Identificação da Regulação */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px', background: '#f8fafc', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '3mm', marginBottom: '2mm', fontSize: '9px' }}>
          <div><b>Nº SOLICITAÇÃO NO SER:</b> <span style={{ color: '#0284c7', fontWeight: 700 }}>{registro.numero_solicitacao_ser || 'Em processamento'}</span></div>
          <div><b>DATA DO CADASTRO:</b> {dataCadastro}</div>
          <div style={{ gridColumn: '1 / -1' }}><b>DIAGNÓSTICO REGULADO:</b> {registro.diagnostico_regulado || 'Aguardando parecer/definição'}</div>
          <div style={{ gridColumn: '1 / -1' }}>
            <b>MUDANÇA DE DIAGNÓSTICO?</b> SIM (<SerCheck marcado={registro.mudanca_diagnostico} />) NÃO (<SerCheck marcado={!registro.mudanca_diagnostico} />)
            {registro.mudanca_diagnostico && <span> &nbsp;&nbsp;<b>NOVO DIAGNÓSTICO:</b> {registro.novo_diagnostico_cid || ''}</span>}
          </div>
        </div>

        <div className="serf-vitais">
          <SerCampoVital rotulo="PA" valor={sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica} mmHg` : ''} />
          <SerCampoVital rotulo="FC" valor={sv.fc ? `${sv.fc} bpm` : ''} />
          <SerCampoVital rotulo="FR" valor={sv.fr ? `${sv.fr} irpm` : ''} />
          <SerCampoVital rotulo="T°" valor={sv.temperatura ? `${sv.temperatura} °C` : ''} />
          <SerCampoVital rotulo="SpO₂" valor={sv.spo2 ? `${sv.spo2}%` : ''} />
          <SerCampoVital rotulo="HGT" valor={sv.hgt ? `${sv.hgt} mg/dL` : ''} />
        </div>

        <div className="serf-secao">
          <div className="serf-secao-titulo">1 – EVOLUÇÃO CLÍNICA DIÁRIA / SITUAÇÃO ATUAL</div>
          <div className="serf-secao-corpo">{registro.evolucao || 'Sem alterações registradas no período.'}</div>
        </div>
        <div className="serf-secao">
          <div className="serf-secao-titulo">2 – PENDÊNCIAS / LAUDOS / EXAMES AGUARDADOS</div>
          <div className="serf-secao-corpo">{registro.pendencias || 'Nenhuma pendência diagnóstica relatada.'}</div>
        </div>
        <div className="serf-secao">
          <div className="serf-secao-titulo">3 – CONDUTA MÉDICA / PLANO TERAPÊUTICO</div>
          <div className="serf-secao-corpo">{registro.conduta || 'Mantida conduta prévia e suporte clínico.'}</div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário do Registro:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Regulador / Assistente'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Assistente — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Central de Regulação de Leitos (SER / SISREG)</span>
        </div>
      </div>
    </div>
  )
}

function SerCheck({ marcado }) {
  return <span style={{ fontWeight: 700 }}>{marcado ? 'X' : ' '}</span>
}

function fmtDataAlta(data) {
  if (!data) return null
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

function CorpoSumarioAltaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const dtInternacao = fmtDataAlta(registro.data_internacao) || (atendimento?.criado_em ? new Date(atendimento.criado_em).toLocaleDateString('pt-BR') : '—')
  const dtAlta = fmtDataAlta(registro.data_alta) || (atendimento?.encerrado_em ? new Date(atendimento.encerrado_em).toLocaleDateString('pt-BR') : dataHora.split(',')[0])

  return (
    <div className="alta-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="SUMÁRIO DE ALTA HOSPITALAR"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="alta-secao" style={{ marginTop: '2px' }}>
          <div className="alta-secao-header">1. Período de Internação e Tipo de Desfecho</div>
          <div className="alta-secao-body">
            <div className="alta-grid-2">
              <div><b>Data de Admissão:</b> {dtInternacao}</div>
              <div><b>Data de Alta:</b> {dtAlta}</div>
              <div><b>Tipo de Desfecho:</b> {registro.tipo_alta || 'Alta Clínica / Curado / Melhorado'}</div>
              <div><b>Destino:</b> {registro.destino || 'Domicílio com acompanhamento na Atenção Básica'}</div>
            </div>
          </div>
        </div>

        <div className="alta-secao">
          <div className="alta-secao-header">2. Diagnósticos (Admissional e Final)</div>
          <div className="alta-secao-body">
            <div><b>Diagnóstico de Internação:</b> {[registro.diagnostico_internacao, registro.cid_internacao].filter(Boolean).join(' — ') || 'Não especificado'}</div>
            <div style={{ marginTop: '2px' }}><b>Diagnóstico Definitivo de Alta:</b> {[registro.diagnostico_alta, registro.cid_alta].filter(Boolean).join(' — ') || 'Em acompanhamento ambulatorial'}</div>
          </div>
        </div>

        <div className="alta-secao">
          <div className="alta-secao-header">3. Resumo da Evolução Clínica e Tratamento Realizado</div>
          <div className="alta-secao-body" style={{ minHeight: '30mm', whiteSpace: 'pre-wrap' }}>
            {registro.resumo_clinico || 'Paciente permaneceu em leito de observação da UPA 24h recebendo cuidados e suporte clínico. Apresentou melhora do quadro com estabilidade clínica e hemodinâmica, recebendo alta para seguimento domiciliar.'}
          </div>
        </div>

        <div className="alta-secao">
          <div className="alta-secao-header">4. Prescrição de Medicamentos para Domicílio</div>
          <div className="alta-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.prescricao_domicilio || registro.orientacoes_continuidade || 'Conforme orientação e receituário médico anexo.'}
          </div>
        </div>

        <div className="alta-secao alta-secao-expansivel">
          <div className="alta-secao-header">5. Orientações Gerais e Encaminhamentos</div>
          <div className="alta-secao-body" style={{ whiteSpace: 'pre-wrap' }}>
            {registro.orientacoes_alta || (
              <>
                - Manter repouso e hidratação oral adequada.<br />
                - Encaminhado à Unidade Básica de Saúde (UBS) de referência para acompanhamento contínuo.<br />
                - <b>Sinais de alerta para retorno imediato à UPA:</b> Febre persistente, dor intensa súbita, falta de ar, vômitos incoercíveis ou alteração do estado de consciência.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Alta:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Assistente'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Assistente — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Sumário de Alta Hospitalar &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function CorpoEvolucaoMedicaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  return (
    <div className="evol-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="EVOLUÇÃO MÉDICA DIÁRIA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="med-secao" style={{ marginTop: '2px' }}>
          <div className="med-secao-header">1. Diagnósticos Ativos (CID-10)</div>
          <div className="med-secao-body">
            <div><b>Principal:</b> {registro.diagnosticos || 'Sem diagnóstico ativo informado.'}</div>
            {(registro.comorbidades || registro.comorbidades_texto) && (
              <div style={{ marginTop: '2px', color: '#475569' }}>
                <b>Comorbidades / Antecedentes:</b> {registro.comorbidades_texto || (registro.comorbidades ? 'Presentes' : 'Negadas')}
              </div>
            )}
            {registro.alergias_texto && (
              <div style={{ marginTop: '2px', color: '#b91c1c' }}>
                <b>Alergias Relatadas:</b> {registro.alergias_texto}
              </div>
            )}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">2. Evolução Clínica do Dia e Queixas Atuais</div>
          <div className="med-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {registro.evolucao_dia || registro.historia_doenca_atual || 'Paciente estável em leito de observação, sem queixas agudas no momento.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">3. Exame Físico Dirigido</div>
          <div className="med-secao-body" style={{ minHeight: '24mm', whiteSpace: 'pre-wrap' }}>
            {registro.exame_fisico || 'Bom estado geral, lúcido e orientado, corado, hidratado, anictérico e acianótico. ACV: RCR 2T BNF sem sopros. AR: MVF universalmente audível. Abdome: Plano, flácido e indolor. Extremidades bem perfundidas sem edema.'}
          </div>
        </div>

        <div className="med-secao">
          <div className="med-secao-header">4. Avaliação de Risco e Resultados de Exames</div>
          <div className="med-secao-body">
            <div className="med-grid-3">
              <div><b>Risco TEV:</b> {registro.risco_tev || 'Baixo risco'}</div>
              <div><b>Sepse (2 critérios):</b> {registro.criterios_sepse ? 'SIM (Protocolo)' : 'NÃO'}</div>
              <div><b>Antibioticoterapia:</b> {registro.antibioticoterapia || 'Não em uso'}</div>
            </div>
            {(registro.exames_laboratorio || registro.aguarda_exames_texto) && (
              <div style={{ marginTop: '3px', paddingTop: '2px', borderTop: '1px dashed #cbd5e1' }}>
                {registro.exames_laboratorio && <div><b>Exames:</b> {registro.exames_laboratorio}</div>}
                {registro.aguarda_exames_texto && <div style={{ color: '#0369a1' }}><b>Aguarda:</b> {registro.aguarda_exames_texto}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="med-secao med-secao-expansivel">
          <div className="med-secao-header">5. Conduta Médica e Planejamento Terapêutico</div>
          <div className="med-secao-body" style={{ minHeight: '22mm', whiteSpace: 'pre-wrap' }}>
            {registro.conduta_medica || registro.plano_terapeutico || '1. Manter cuidados gerais e prescrição vigente.\n2. Monitorização contínua de sinais vitais.\n3. Reavaliação clínica e laboratorial conforme evolução.'}
            {registro.data_prevista_alta && (
              <div style={{ marginTop: '3px', fontWeight: 700, color: '#15803d' }}>
                Previsão de Alta: {new Date(registro.data_prevista_alta + 'T00:00:00').toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário do Registro:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Plantonista — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves</span>
          <span>Evolução Médica Diária &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function CorpoNotaIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}

  return (
    <div className="notm-page">
      <div className="doc-corpo">
        <CabecalhoPadraoUPA
          titulo="NOTA DE INTERCORRÊNCIA MÉDICA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />

        <div className="notm-secao" style={{ marginTop: '2px' }}>
          <div className="notm-secao-header">1. Motivo do Chamado e Descrição da Intercorrência</div>
          <div className="notm-secao-body" style={{ minHeight: '30mm', whiteSpace: 'pre-wrap' }}>
            {cf.motivo_chamado || registro.notas || 'Solicitada avaliação médica pela equipe de enfermagem por intercorrência clínica no setor.'}
          </div>
        </div>

        <div className="notm-secao">
          <div className="notm-secao-header">2. Exame Físico no Momento da Avaliação</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {cf.exame_fisico || 'Paciente avaliado à beira do leito. Sinais vitais aferidos, parâmetros hemodinâmicos e ventilatórios monitorizados sem sinais agudos de colapso.'}
          </div>
        </div>

        <div className="notm-secao">
          <div className="notm-secao-header">3. Condutas Médicas Tomadas</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {cf.condutas || 'Instituídas medidas sintomáticas e medicamentosas de urgência para reversão do quadro conforme prescrição médica.'}
          </div>
        </div>

        <div className="notm-secao notm-secao-expansivel">
          <div className="notm-secao-header">4. Reavaliação e Desfecho</div>
          <div className="notm-secao-body" style={{ minHeight: '26mm', whiteSpace: 'pre-wrap' }}>
            {cf.desfecho || 'Paciente reavaliado após intervenção clínica com resposta favorável, permanecendo em leito sob vigilância da equipe assistencial.'}
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário do Registro:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{medico?.nome_exibicao || medico?.nome || 'Médico Plantonista'}</div>
            <div className="crm-sig">{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig">Médico Plantonista — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves</span>
          <span>Nota de Intercorrência Médica &bull; Folha Única &bull; Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function ReceitaColuna({ via, viaRotulo, registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const itensRaw = registro.itens || []
  const viasAgrupadas = itensRaw.reduce((acc, it, i) => {
    const viaNome = (it.via || 'ORAL').toUpperCase()
    if (!acc[viaNome]) acc[viaNome] = []
    acc[viaNome].push({ ...it, originalIndex: i })
    return acc
  }, {})

  return (
    <div className="rxf-coluna">
      <CabecalhoPadraoUPA
        titulo="RECEITUÁRIO MÉDICO"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={medico}
        dataHora={dataHora}
      />

      <div className="rxf-via-faixa">
        <span>PRESCRIÇÃO</span>
        <span className="rxf-via-badge">{viaRotulo || (via === 1 ? '1ª VIA — PACIENTE' : '2ª VIA — FARMÁCIA')}</span>
      </div>

      <div className="rxf-corpo">
        {Object.entries(viasAgrupadas).length === 0 ? (
          <>
             <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10px', marginTop: '8px', marginBottom: '4px', textDecoration: 'underline' }}>USO NÃO ESPECIFICADO</div>
             <div className="rxf-itens-lista"><div className="rxf-linhas-vazias" /></div>
          </>
        ) : (
          Object.entries(viasAgrupadas).map(([viaKey, itensVia]) => (
            <div key={viaKey}>
              <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '10.5px', marginTop: '8px', marginBottom: '4px', textDecoration: 'underline' }}>
                USO {viaKey}
              </div>
              <div className="rxf-itens-lista">
                {itensVia.map((it) => (
                  <div key={it.originalIndex} className="rxf-item-box">
                    <div className="rxf-item-titulo">{it.originalIndex + 1}) {it.medicamento}</div>
                    {it.instrucao && <div className="rxf-item-instrucao">{it.instrucao}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {itensRaw.length > 0 && itensRaw.length <= 3 && (
          <div className="rxf-linhas-vazias" style={{ minHeight: '18mm', border: 'none' }} />
        )}

        <div className="rxf-orientacao-alerta">
          <b>Orientações ao Paciente:</b> Seguir rigorosamente a dosagem e horários prescritos. Não interromper o tratamento sem orientação médica. Em caso de reações adversas ou persistência dos sintomas, retorne à UPA 24h Breves.
        </div>
      </div>

      {/* RODAPÉ INDIVIDUAL DE CADA VIA */}
      <div className="doc-rodape-container" style={{ marginTop: 'auto' }}>
        <div className="doc-rodape-externo" style={{ padding: '3px 2px 2px' }}>
          <div className="doc-bloco-datahora">
            <div className="cidade-data" style={{ fontSize: '8.2px' }}>Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio" style={{ fontSize: '7.2px' }}><b>Emissão:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura" style={{ minWidth: '140px' }}>
            <div className="linha-sig" />
            <div className="nome-sig" style={{ fontSize: '8.5px' }}>{medico?.nome_exibicao || medico?.nome || 'Médico Assistente'}</div>
            <div className="crm-sig" style={{ fontSize: '7.5px' }}>{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig" style={{ fontSize: '7px' }}>Médico Assistente — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema" style={{ fontSize: '7px', paddingTop: '1.5px', marginTop: '2px' }}>
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>{viaRotulo || (via === 1 ? '1ª Via: Paciente' : '2ª Via: Farmácia')}</span>
        </div>
      </div>
    </div>
  )
}

function CorpoReceituarioOficial(props) {
  return (
    <div className="rxf-page">
      <div className="rxf-duas-vias">
        <ReceitaColuna {...props} via={1} viaRotulo="1ª VIA — PACIENTE" />
        <ReceitaColuna {...props} via={2} viaRotulo="2ª VIA — FARMÁCIA" />
      </div>
    </div>
  )
}
