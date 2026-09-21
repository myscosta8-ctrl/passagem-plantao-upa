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

  const dataAssinaturaExtenso = (() => {
    const iso = cf.data_assinatura ? cf.data_assinatura + 'T00:00:00' : (registro.criado_em || registro.atualizado_em)
    const d = iso ? new Date(iso) : null
    return d && !isNaN(d) ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : dataHora.split(',')[0]
  })()

  return (
    <div className="admf-document">
      <header className="admf-header">
        <CabecalhoPadraoUPA
          titulo="ADMISSÃO MÉDICA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />
      </header>

      <section className="admf-section">
        <div className="admf-section-title">QUEIXA PRINCIPAL E HISTÓRIA DA DOENÇA ATUAL (HDA)</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-hda">{registro.queixa_principal || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">ANTECEDENTES RELEVANTES</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-ante">{registro.antecedentes || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">EXAME FÍSICO E SINAIS VITAIS</div>
        <div className="admf-section-body admf-clinical-grid">
          <div className="admf-textbox admf-exam">{cf.exame_geral || registro.exame_geral || ''}</div>

          <div className="admf-vitals">
            <div className="admf-vitals-title">Sinais vitais (na admissão)</div>
            <div className="admf-vgrid">
              <div className="admf-vfield"><b>PA:</b><span className="admf-vval">{sv.pa || ''}</span><span className="admf-unit">mmHg</span></div>
              <div className="admf-vfield"><b>FC:</b><span className="admf-vval">{sv.fc || ''}</span><span className="admf-unit">bpm</span></div>
              <div className="admf-vfield"><b>FR:</b><span className="admf-vval">{sv.fr || ''}</span><span className="admf-unit">irpm</span></div>
              <div className="admf-vfield"><b>SpO₂:</b><span className="admf-vval">{sv.spo2 || ''}</span><span className="admf-unit">%</span></div>
              <div className="admf-vfield"><b>Temp.:</b><span className="admf-vval">{sv.temp || ''}</span><span className="admf-unit">°C</span></div>
              <div className="admf-vfield"><b>Dor (0-10):</b><span className="admf-vval">{sv.dor || ''}</span></div>
            </div>
            <div className="admf-reg">
              <b>Registrado por:</b>
              <span className="admf-vval admf-vval-wide">{cf.sv_registrado_por || ''}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">IMPRESSÃO DIAGNÓSTICA E CONDUTA</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-plan">{registro.hipotese_diagnostica || ''}</div>
        </div>
      </section>

      <div className="admf-assinatura">
        <div className="admf-assinatura-texto">
          {cf.cidade_uf || 'Breves/PA'}, {dataAssinaturaExtenso}.
        </div>
        <div className="admf-assinatura-caixa">
          <div className="admf-sigline" />
          <div className="admf-sig-caption">{medico?.nome_exibicao || medico?.nome || 'Assinatura Médica'}</div>
          <div className="admf-sig-crm">CRM/UF: {medico?.crm ? `${medico.crm}/PA` : ''}</div>
        </div>
      </div>

      <footer className="admf-footer">
        <span>PEP - Prontuário Eletrônico do Paciente</span>
        <span>Registrado em {dataHora}</span>
      </footer>
    </div>
  )
}

// Réplica fiel do modelo de Prescrição aprovado (papel A4 paisagem, timbre
// UPA 24h Breves/SEMSA) — ver pdfs_exemplo/prescricao_preview.html.
function CorpoPrescricaoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_prescricao || {}
  const itens = registro.prescricao_itens || []
  const orientacoes = cf.orientacao_enfermagem || []
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''

  return (
    <div className="pr-page">
      <div className="pr-topo">
        <div className="pr-topo-texto">
          <div className="nome">PREFEITURA MUNICIPAL DE BREVES — UPA 24H BREVES</div>
          <div className="sub">SECRETARIA MUNICIPAL DE SAÚDE (SEMSA)</div>
          <div className="sub">TRAVESSA CASTILHOS FRANÇA, S/N — BREVES/PA — CEP 68.800-000 — CNPJ: 02.967.963/0001-11 — FONE/FAX: (91) 3783-1279</div>
        </div>
        <div className="pr-topo-logos">
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
          <img src="./logos/semsa.jpg" alt="SEMSA" />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        </div>
      </div>
      <hr />

      <div className="pr-titulo">PRESCRIÇÃO</div>

      <div className="pr-info">
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '12%' }}><b>PRONTUÁRIO:</b> {limparPrefixo(pessoa.prontuario_numero)}</div>
          <div className="pr-campo" style={{ flexBasis: '10%' }}><b>REGISTRO:</b> {limparPrefixo(atendimento?.numero_atendimento)}</div>
          <div className="pr-campo" style={{ flexBasis: '19%' }}><b>RECEPÇÃO:</b> {atendimento?.tipo_entrada || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '29%' }}><b>DATA INTERNAÇÃO:</b> {atendimento?.criado_em ? new Date(atendimento.criado_em).toLocaleString('pt-BR') : ''}</div>
          <div className="pr-campo" style={{ flexBasis: '30%' }}><b>DATA ALTA:</b> {atendimento?.encerrado_em ? new Date(atendimento.encerrado_em).toLocaleString('pt-BR') : ''}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '50%' }}><b>PACIENTE:</b> {pessoa.nome}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>CARÁTER:</b> {atendimento?.carater || 'Urgência'}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>CONVÊNIO:</b> {atendimento?.convenio || 'SUS'}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '42%' }}><b>MÃE:</b> {pessoa.nome_mae || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '13%' }}><b>SEXO:</b> {pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : ''}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>NACIONALIDADE:</b> Brasil</div>
          <div className="pr-campo" style={{ flexBasis: '20%' }}><b>RAÇA:</b> </div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '17%' }}><b>R.G.:</b> </div>
          <div className="pr-campo" style={{ flexBasis: '23%' }}><b>C.P.F.:</b> {pessoa.cpf || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '30%' }}><b>C.N.S.:</b> {pessoa.cns || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>DATA NASC.:</b> {nascimento}</div>
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>IDADE:</b> {idade ? `${idade} anos` : ''}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '75%' }}><b>ENDEREÇO:</b> {[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', ')}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>TELEFONE:</b> {pessoa.telefone || ''}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '35%' }}><b>CENTRO DE CUSTO:</b> </div>
          <div className="pr-campo" style={{ flexBasis: '65%' }}><b>ESPECIALIDADE:</b> Clínica Médica</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '65%' }}><b>MÉDICO RESPONSÁVEL:</b> {medico?.nome_exibicao || medico?.nome} &nbsp; <b>CRM:</b> {medico?.crm || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '35%' }}><b>ALERGIA:</b> Nenhuma informada</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>LEITO:</b> {leitoNumero || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>SETOR:</b> {setorNome || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '40%' }}><b>UNIDADE:</b> UPA 24h Breves</div>
          <div className="pr-campo" style={{ flexBasis: '20%' }}><b>PESO:</b> </div>
        </div>
      </div>

      <div className="pr-secao-titulo">Dieta</div>
      <div className="pr-caixa">{cf.dieta || ' '}</div>

      <div className="pr-secao-titulo">Medicamentos</div>
      <table className="pr-tabela">
        <thead>
          <tr>
            <th style={{ width: '48%' }}>Medicamentos</th>
            <th style={{ width: '6%' }}>Qtd/Und</th>
            <th style={{ width: '5%' }}>Via</th>
            <th style={{ width: '7%' }}>Frequência</th>
            <th style={{ width: '34%' }}>Horário de aplicação</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>Nenhum medicamento prescrito.</td></tr>
          ) : itens.map((it, i) => (
            <tr key={it.id || i}>
              <td>
                {i + 1} — {it.medicamento_nome}{it.sn_aplic ? ' (Se necessário)' : ''}
                {(it.diluicao || it.instrucoes) && (
                  <span className="pr-nota">{[it.diluicao, it.instrucoes].filter(Boolean).join(' — ')}</span>
                )}
              </td>
              <td className="qtd">{it.dose ? `${it.dose} ${it.dose_unidade || ''}` : ''}</td>
              <td className="via">{it.via || ''}</td>
              <td className="freq">{it.frequencia || ''}{it.duracao ? ` · ${it.duracao}` : ''}</td>
              <td className="horario">{it.horario_aplicacao || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pr-secao-titulo">Orientação enfermagem</div>
      <table className="pr-tabela">
        <thead><tr><th style={{ width: '80%' }}>Orientação</th><th>Frequência</th></tr></thead>
        <tbody>
          {orientacoes.length === 0 ? (
            <tr><td colSpan={2} style={{ textAlign: 'center', color: '#666' }}>Nenhuma orientação registrada.</td></tr>
          ) : orientacoes.map((o, i) => (
            <tr key={i}><td>{i + 1} — {o.texto}</td><td className="freq">{o.frequencia || ''}</td></tr>
          ))}
        </tbody>
      </table>

      <div className="pr-secao-titulo">Avaliação multidisciplinar</div>
      <div className="pr-caixa">{cf.avaliacao_multidisciplinar || ' '}</div>

      <div className="pr-secao-titulo">Hemocomponente</div>
      <div className="pr-caixa">{cf.hemocomponente || ' '}</div>

      {registro.observacoes && (
        <>
          <div className="pr-secao-titulo">Observações</div>
          <div className="pr-caixa">{registro.observacoes}</div>
        </>
      )}

      {registro.status === 'cancelada' && (
        <div className="pr-caixa" style={{ marginTop: 10, borderTop: '1px solid #999', color: '#8A5A00', fontWeight: 700 }}>
          PRESCRIÇÃO CANCELADA{registro.motivo_cancelamento ? ` — ${registro.motivo_cancelamento}` : ''}
        </div>
      )}

      <div className="pr-assinaturas">
        <div className="bloco"><div className="linha" />Técnico Tarde</div>
        <div className="bloco"><div className="linha" />Técnico Noite</div>
        <div className="bloco"><div className="linha" />Técnico Manhã</div>
        <div className="bloco"><div className="linha" />Enfermeiro</div>
        <div className="bloco">
          <div className="linha" />
          <span className="nome-medico">{medico?.nome_exibicao || medico?.nome}</span>
          CRM: {medico?.crm || ''}
        </div>
      </div>

      <div className="pr-rodape">
        <span>PEP — Prontuário Eletrônico do Paciente</span>
        <span>Gerado em {dataHora}</span>
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
      <CabecalhoPadraoUPA
        titulo="SOLICITAÇÃO DE AUTORIZAÇÃO DE USO DE ANTIMICROBIANO (ATM)"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
      />

      <div className="atmf-caixa atmf-linha-dupla">
        <div><b>NOME DO PACIENTE:</b> {pessoa.nome}</div>
        <div className="atmf-col-direita">
          <div><b>IDADE:</b> {idade ? `${idade} anos` : ''}</div>
          <div><b>LEITO:</b> {leitoNumero || ''}</div>
        </div>
      </div>

      <div className="atmf-caixa atmf-linha-dupla">
        <div><b>DIAGNÓSTICO:</b> {cf.diagnostico}</div>
        <div><b>DATA DE INTERNAÇÃO:</b> {cf.data_internacao ? new Date(cf.data_internacao + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</div>
      </div>

      <div className="atmf-caixa atmf-alta">
        <b>JUSTIFICATIVA:</b> {registro.justificativa_clinica}
      </div>

      <div className="atmf-caixa atmf-tratamento">
        <div className="atmf-tratamento-campos">
          <div><b>TRATAMENTO PRETENDIDO:</b> {cf.tratamento_pretendido}</div>
          <div><b>MEDICAMENTO:</b> <span className="atmf-forte">{registro.medicamento}</span></div>
          <div><b>POSOLOGIA:</b> {registro.posologia}</div>
          <div className="atmf-linha-tripla">
            <span><b>DOSE:</b> {registro.dose}</span>
            <span><b>INTERVALO:</b> {registro.intervalo}</span>
            <span><b>TEMPO DE USO:</b> {registro.tempo_uso_dias ? `${registro.tempo_uso_dias} DIAS` : ''}</span>
          </div>
        </div>
        <div className="atmf-assinatura-medico">
          <div className="atmf-sigline" />
          <i>MÉDICO</i>
        </div>
      </div>

      <div className="atmf-caixa atmf-linha-dupla">
        <div>
          <div className="atmf-forte-italico">TOTAL DO TRATAMENTO</div>
          <div style={{ marginTop: '4mm' }}><b>DxIxT:</b> {cf.dxixt}</div>
        </div>
        <div className="atmf-col-direita">
          <div><i><b>AMPOLAS:</b></i> {cf.ampolas}</div>
          <div><i><b>FRASCO - AMPOLAS:</b></i> {cf.frasco_ampolas}</div>
          <div><i><b>BOLSAS:</b></i> {cf.bolsas}</div>
        </div>
      </div>

      <div className="atmf-caixa">
        <b>PARECER DO FARMACÊUTICO</b>
        <div className="atmf-linha-dupla" style={{ marginTop: '1mm' }}>
          <span>DE ACORDO&nbsp;&nbsp;( &nbsp;&nbsp; )&nbsp;&nbsp;&nbsp;&nbsp;CONTRÁRIO&nbsp;&nbsp;( &nbsp;&nbsp; )</span>
          <span className="atmf-sigline" />
        </div>
        <div style={{ marginTop: '1mm' }}>JUSTIFICATIVA:</div>
        <div>( &nbsp;&nbsp; ) Há disponível em estoque quantidade que contemple o tratamento proposto.</div>
        <div>( &nbsp;&nbsp; ) Há disponível em estoque somente quantidade para garantia parcial do tratamento proposto.</div>
        <div>( &nbsp;&nbsp; ) Não há disponível em estoque quantidade que contemple o tratamento proposto.</div>
        <div>OUTROS:</div>
        <div>DATA:</div>
      </div>

      <div className="atmf-caixa">
        <b>ANTIBIÓTICOS DE USO RESTRITO:</b>
        <div className="atmf-antibioticos">
          {ATMF_ANTIBIOTICOS.map(([a, b]) => (
            <div key={a} className="atmf-antibioticos-linha">
              <span>{a}</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="doc-rodape-meta" style={{ marginTop: '3mm' }}>Registrado em {dataHora}</div>
    </div>
  )
}

// Réplica fiel do "LAUDO MÉDICO - LM/TFD" oficial (UPA Breves) — caixa única
// externa, seções com rótulo sobreposto à borda superior, igual ao papel.
function TfdSecao({ titulo, valor, tamanho, ultima }) {
  return (
    <div className={`tfdf-secao tfdf-secao-${tamanho} ${ultima ? 'tfdf-secao-ultima' : ''}`}>
      <div className="tfdf-secao-titulo">{titulo}</div>
      <div className="tfdf-secao-corpo">{valor}</div>
    </div>
  )
}

function TfdLinhaTabela({ rotulo, valor }) {
  return (
    <div className="tfdf-tabela-linha">
      <div className="tfdf-tabela-rotulo">{rotulo}</div>
      <div className="tfdf-tabela-valor">{valor}</div>
    </div>
  )
}

function CorpoTfdOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_extra || {}
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''

  return (
    <div className="tfdf-page">
      <CabecalhoPadraoUPA
        titulo="TRATAMENTO FORA DE DOMICÍLIO — LAUDO MÉDICO (LM/TFD)"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
      />

      <div className="tfdf-doc">
        <div className="tfdf-linha tfdf-linha-3">
          <div className="tfdf-campo"><b>NOME:</b> {pessoa.nome}</div>
          <div className="tfdf-campo tfdf-campo-borda"><b>SEXO:</b> {pessoa.sexo === 'F' ? 'FEMININO' : pessoa.sexo === 'M' ? 'MASCULINO' : ''}</div>
          <div className="tfdf-campo tfdf-campo-borda"><b>IDADE:</b> {idade ? `${idade} anos` : ''}</div>
        </div>
        <div className="tfdf-linha">
          <div className="tfdf-campo"><b>Nº DO LAUDO:</b> {cf.numero_laudo || ''}</div>
        </div>
        <div className="tfdf-linha">
          <div className="tfdf-campo"><b>ENDEREÇO:</b> {[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', ')}</div>
        </div>
        <div className="tfdf-linha tfdf-linha-3">
          <div className="tfdf-campo"><b>DATA DE NASCIMENTO:</b> {nascimento}</div>
          <div className="tfdf-campo tfdf-campo-borda"><b>IDENTIDADE:</b> {cf.identidade}</div>
          <div className="tfdf-campo tfdf-campo-borda"><b>PROFISSÃO:</b> {cf.profissao}</div>
        </div>
        <div className="tfdf-linha tfdf-linha-2">
          <div className="tfdf-campo"><b>ACOMPANHANTE:</b> {registro.acompanhante_nome}</div>
          <div className="tfdf-campo tfdf-campo-borda"><b>RELAÇÃO:</b> {registro.acompanhante_relacao}</div>
        </div>

        <TfdSecao titulo="HISTÓRIA DA DOENÇA ATUAL" valor={registro.historia_doenca_atual} tamanho="grande" />
        <TfdSecao titulo="EXAME FÍSICO" valor={registro.exame_fisico} tamanho="media" />
        <TfdSecao titulo="DIAGNÓSTICO" valor={registro.diagnostico} tamanho="pequena" ultima />
      </div>

      <div className="tfdf-tabela">
        <TfdLinhaTabela rotulo="EXAME COMPLEMENTAR:" valor={registro.exame_complementar} />
        <TfdLinhaTabela rotulo="TRATAMENTO REALIZADO:" valor={registro.tratamento_realizado} />
        <TfdLinhaTabela rotulo="TRATAMENTO INDICADO:" valor={registro.tratamento_indicado} />
        <TfdLinhaTabela rotulo="TEMPO PROVÁVEL:" valor={registro.tempo_provavel_dias} />
      </div>

      <div className="tfdf-profissional">
        <div className="tfdf-profissional-titulo">PROFISSIONAL RESPONSÁVEL</div>
        <div className="tfdf-profissional-linha">
          <div className="tfdf-assinatura-data">{dataHora.split(',')[0]}</div>
          <div className="tfdf-assinatura-campo">
            <div className="tfdf-sigline" />
            <span>NOME - CARIMBO</span>
            <div className="tfdf-forte">{medico?.nome_exibicao || medico?.nome}{medico?.crm ? ` — CRM ${medico.crm}` : ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Lista fixa igual à referência (plano_terapeutico_upa_breves_modelo_compacto)
// — sem quadrados de marcar: item selecionado aparece em negrito com "✓",
// os demais em cinza claro, só pra contexto de quais existem no catálogo.
const PLANO_PROTOCOLOS_LISTA = [
  'TEV — Tromboembolismo Venoso', 'Dor torácica / Síndrome Coronariana Aguda',
  'AVC — Acidente Vascular Cerebral', 'SEPSE / Choque Séptico',
  'Anafilaxia', 'Insuficiência Respiratória / Via Aérea',
  'Emergências glicêmicas',
]
const PLANO_EQUIPE_LISTA = ['Enfermagem', 'Fisioterapia', 'Nutrição', 'Serviço Social', 'Psicologia']

function ItemLista({ marcado, children }) {
  return (
    <div style={{ fontWeight: marcado ? 700 : 400, color: marcado ? '#1a1a1a' : '#999' }}>
      {marcado ? '✓ ' : '— '}{children}
    </div>
  )
}

function CorpoPlanoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const extra = registro.campos_extra || {}
  const problemas = extra.problemas_ativos || []
  const protocolosSelecionados = registro.protocolos_elegiveis || []
  const equipeSelecionada = registro.equipe_multidisciplinar || []

  return (
    <div className="admf-document admf-document-compacto">
      <header className="admf-header">
        <CabecalhoPadraoUPA
          titulo="PLANO TERAPÊUTICO"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />
      </header>

      <section className="admf-section">
        <div className="admf-section-title">Diagnósticos</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{[registro.diagnostico_principal_cid, extra.diagnosticos_texto].filter(Boolean).join(' — ')}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Motivo da permanência / observação</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.motivo_internacao || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Objetivos da terapêutica</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.objetivos_terapeuticos || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Protocolos clínicos aplicáveis</div>
        <div className="admf-section-body admf-lista-2col">
          {PLANO_PROTOCOLOS_LISTA.map((p) => (
            <ItemLista key={p} marcado={protocolosSelecionados.includes(p)}>{p}</ItemLista>
          ))}
          <ItemLista marcado={!!extra.protocolo_outro}>Outro protocolo institucional{extra.protocolo_outro ? `: ${extra.protocolo_outro}` : ''}</ItemLista>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Medidas de segurança assistencial</div>
        <div className="admf-section-body">
          <span className="cap">Medidas aplicadas / pertinentes:</span>
          <div className="admf-textbox admf-textbox-plano">{extra.medidas_seguranca_texto || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Planejamento da permanência e equipe multidisciplinar</div>
        <div className="admf-section-body admf-planejamento-grid">
          <div className="admf-tempo-previsto">
            <span className="cap">Tempo previsto</span>
            <div className="admf-tempo-valor">
              {registro.tempo_internacao_previsto_dias || ''}
              {registro.tempo_internacao_previsto_dias ? <small> dias</small> : null}
            </div>
          </div>
          <div>
            <span className="cap">Equipe / profissionais envolvidos</span>
            <div className="admf-lista-2col" style={{ marginTop: '1mm' }}>
              {PLANO_EQUIPE_LISTA.map((e) => (
                <ItemLista key={e} marcado={equipeSelecionada.includes(e)}>{e}</ItemLista>
              ))}
              <ItemLista marcado={!!extra.equipe_outros}>Outros{extra.equipe_outros ? `: ${extra.equipe_outros}` : ''}</ItemLista>
            </div>
          </div>
        </div>
      </section>

      {(extra.comorbidades_antecedentes || extra.medicacoes_uso_continuo) && (
        <section className="admf-section">
          <div className="admf-section-title">Comorbidades e medicações em uso</div>
          <div className="admf-section-body">
            <Secao rotulo="Comorbidades / antecedentes relevantes" valor={extra.comorbidades_antecedentes} />
            <Secao rotulo="Medicações em uso contínuo" valor={extra.medicacoes_uso_continuo} />
          </div>
        </section>
      )}

      {problemas.length > 0 && (
        <section className="admf-section">
          <div className="admf-section-title">Problemas ativos</div>
          <div className="admf-section-body">
            <table className="admf-tabela-problemas">
              <thead>
                <tr><th>Problema</th><th>Meta</th><th>Conduta</th><th>Prazo</th></tr>
              </thead>
              <tbody>
                {problemas.map((p, i) => (
                  <tr key={i}><td>{p.descricao}</td><td>{p.meta}</td><td>{p.conduta}</td><td>{p.prazo}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(extra.criterios_alta || extra.data_reavaliacao_prevista || extra.feedback_equipe) && (
        <section className="admf-section">
          <div className="admf-section-title">Critérios de alta e reavaliação</div>
          <div className="admf-section-body">
            <Secao rotulo="Critérios de alta" valor={extra.criterios_alta} />
            <Secao rotulo="Reavaliação prevista" valor={extra.data_reavaliacao_prevista ? new Date(extra.data_reavaliacao_prevista + 'T00:00:00').toLocaleDateString('pt-BR') : null} />
            <Secao rotulo="Feedback da equipe multiprofissional" valor={extra.feedback_equipe} />
          </div>
        </section>
      )}

      <div className="admf-assinatura">
        <div className="admf-assinatura-texto">
          Breves/PA, {dataHora.split(',')[0]}.
        </div>
        <div className="admf-assinatura-caixa">
          <div className="admf-sigline" />
          <div className="admf-sig-caption">{medico?.nome_exibicao || medico?.nome || 'Responsável pelo Plano Terapêutico'}</div>
          <div className="admf-sig-crm">CRM/UF: {medico?.crm ? `${medico.crm}/PA` : ''}</div>
        </div>
      </div>

      <footer className="admf-footer">
        <span>PEP - Prontuário Eletrônico do Paciente</span>
        <span>Registrado em {dataHora}</span>
      </footer>
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
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''
  const dataCadastro = dataHora.split(',')[0]

  return (
    <div className="serf-page">
      <CabecalhoPadraoUPA
        titulo="ATUALIZAÇÃO DE QUADRO CLÍNICO DE PACIENTE REGULADO"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
      />

      <div className="serf-caixa-nome">
        <span className="serf-tab">NOME:</span>
        <div className="serf-caixa-nome-valor">{pessoa.nome}</div>
      </div>
      <div className="serf-caixa-data">
        <span className="serf-tab">DATA:</span>
        <div className="serf-caixa-data-valor">{dataCadastro}</div>
      </div>

      <div className="serf-linha"><b>DATA DE NASCIMENTO:</b> {nascimento}</div>
      <div className="serf-linha"><b>MUNICÍPIO DE ORIGEM:</b> {pessoa.cidade || ''}</div>
      <div className="serf-linha"><b>NOME DA MÃE:</b> {pessoa.nome_mae || ''}</div>

      <div className="serf-linha"><b>DATA DO CADASTRO:</b> {dataCadastro}</div>
      <div className="serf-linha"><b>DIAGNÓSTICO REGULADO:</b> {registro.diagnostico_regulado || ''}</div>
      <div className="serf-linha">
        <b>MUDANÇA DE DIAGNÓSTICO?</b> SIM (<SerCheck marcado={registro.mudanca_diagnostico} />) NÃO (<SerCheck marcado={!registro.mudanca_diagnostico} />)
        &nbsp;&nbsp;PARA: {registro.mudanca_diagnostico ? (registro.novo_diagnostico_cid || '') : ''}
      </div>
      <div className="serf-linha"><b>Nº DA SOLICITAÇÃO NO SER:</b> {registro.numero_solicitacao_ser || ''}</div>

      <div className="serf-vitais">
        <SerCampoVital rotulo="PA" valor={sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : ''} />
        <SerCampoVital rotulo="FC" valor={sv.fc} />
        <SerCampoVital rotulo="FR" valor={sv.fr} />
        <SerCampoVital rotulo="T°" valor={sv.temperatura} />
        <SerCampoVital rotulo="SPO²" valor={sv.spo2} />
        <SerCampoVital rotulo="HGT" valor={sv.hgt} />
      </div>

      <div className="serf-secao">
        <div className="serf-secao-titulo">1 – EVOLUÇÃO DIÁRIA</div>
        <div className="serf-secao-corpo">{registro.evolucao}</div>
      </div>
      <div className="serf-secao">
        <div className="serf-secao-titulo">3 – PENDÊNCIAS</div>
        <div className="serf-secao-corpo">{registro.pendencias}</div>
      </div>
      <div className="serf-secao">
        <div className="serf-secao-titulo">4 – CONDUTA</div>
        <div className="serf-secao-corpo">{registro.conduta}</div>
      </div>

      <div className="serf-assinatura">
        <div className="serf-sigline" />
        <span>{(medico?.nome_exibicao || medico?.nome) ? `${medico.nome_exibicao || medico.nome}${medico.crm ? ` / CRM ${medico.crm}` : ''}` : 'MÉDICO / CRM'}</span>
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
  return (
    <div className="admf-document admf-document-compacto">
      <header className="admf-header">
        <CabecalhoPadraoUPA
          titulo="SUMÁRIO DE ALTA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />
      </header>

      <section className="admf-section">
        <div className="admf-section-title">Datas do episódio (informadas neste sumário)</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">
            Internação: {fmtDataAlta(registro.data_internacao) || ''} — Alta: {fmtDataAlta(registro.data_alta) || ''}
          </div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Diagnóstico de internação</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">
            {[registro.diagnostico_internacao, registro.cid_internacao].filter(Boolean).join(' — ')}
          </div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Diagnóstico de alta</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">
            {[registro.diagnostico_alta, registro.cid_alta].filter(Boolean).join(' — ')}
          </div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Resumo clínico</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-alta">{registro.resumo_clinico || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Orientações para continuidade do tratamento</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.orientacoes_continuidade || ''}</div>
        </div>
      </section>

      <div className="admf-assinatura">
        <div className="admf-assinatura-texto">
          Breves/PA, {dataHora.split(',')[0]}.
        </div>
        <div className="admf-assinatura-caixa">
          <div className="admf-sigline" />
          <div className="admf-sig-caption">{medico?.nome_exibicao || medico?.nome || 'Médico responsável'}</div>
          <div className="admf-sig-crm">CRM/UF: {medico?.crm ? `${medico.crm}/PA` : ''}</div>
        </div>
      </div>

      <footer className="admf-footer">
        <span>Sumário de Alta</span>
        <span>Registrado em {dataHora}</span>
      </footer>
    </div>
  )
}

function EvolucaoSimNao({ rotulo, valor, textoSe }) {
  return (
    <div className="admf-textbox admf-textbox-plano" style={{ marginBottom: '2mm' }}>
      <b>{rotulo}</b> {valor ? `SIM${textoSe ? ` — ${textoSe}` : ''}` : 'NÃO'}
    </div>
  )
}

function CorpoEvolucaoMedicaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  return (
    <div className="admf-document admf-document-compacto">
      <header className="admf-header">
        <CabecalhoPadraoUPA
          titulo="EVOLUÇÃO MÉDICA DIÁRIA DE ENFERMARIA CLÍNICA"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />
      </header>

      <section className="admf-section">
        <div className="admf-section-title">Diagnósticos (o principal na primeira linha)</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.diagnosticos || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">História da doença atual</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-alta">{registro.historia_doenca_atual || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Comorbidades, reconciliação medicamentosa e alergias</div>
        <div className="admf-section-body">
          <EvolucaoSimNao rotulo="Comorbidades:" valor={registro.comorbidades} textoSe={registro.comorbidades_texto} />
          <EvolucaoSimNao rotulo="Reconciliação medicamentosa:" valor={registro.reconciliacao_medicamentosa} textoSe={registro.reconciliacao_texto} />
          <EvolucaoSimNao rotulo="Alergias:" valor={registro.alergias} textoSe={registro.alergias_texto} />
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Risco de TEV, sepse e antibioticoterapia</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano" style={{ marginBottom: '2mm' }}><b>Risco para TEV:</b> {registro.risco_tev || ''}</div>
          <EvolucaoSimNao rotulo="2 critérios para protocolo de sepse:" valor={registro.criterios_sepse} />
          <div className="admf-textbox admf-textbox-plano"><b>Antibioticoterapia atual:</b> {registro.antibioticoterapia || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Evolução do dia</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-alta">{registro.evolucao_dia}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Exame físico</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-alta">{registro.exame_fisico}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Plano terapêutico</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.plano_terapeutico || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Laboratório / cultura / exames de imagem</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-plano">{registro.exames_laboratorio || ''}</div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Exames pendentes e previsão de alta</div>
        <div className="admf-section-body">
          <EvolucaoSimNao rotulo="Aguarda exames:" valor={registro.aguarda_exames} textoSe={registro.aguarda_exames_texto} />
          <div className="admf-textbox admf-textbox-plano">
            <b>Data prevista da alta hospitalar:</b> {registro.data_prevista_alta ? new Date(registro.data_prevista_alta + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
          </div>
        </div>
      </section>

      <section className="admf-section">
        <div className="admf-section-title">Conduta médica</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-alta">{registro.conduta_medica || ''}</div>
        </div>
      </section>

      <div className="admf-assinatura">
        <div className="admf-assinatura-texto">
          Breves/PA, {dataHora.split(',')[0]}.
        </div>
        <div className="admf-assinatura-caixa">
          <div className="admf-sigline" />
          <div className="admf-sig-caption">{medico?.nome_exibicao || medico?.nome || 'Médico responsável'}</div>
          <div className="admf-sig-crm">CRM/UF: {medico?.crm ? `${medico.crm}/PA` : ''}</div>
        </div>
      </div>

      <footer className="admf-footer">
        <span>Evolução Médica Diária</span>
        <span>Registrado em {dataHora}</span>
      </footer>
    </div>
  )
}

function CorpoNotaIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  return (
    <div className="admf-document admf-document-compacto">
      <header className="admf-header">
        <CabecalhoPadraoUPA
          titulo="NOTAS-INTERCORRÊNCIAS"
          pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
        />
      </header>

      <section className="admf-section">
        <div className="admf-section-title">Notas</div>
        <div className="admf-section-body">
          <div className="admf-textbox admf-textbox-alta">{registro.notas}</div>
        </div>
      </section>

      <div className="admf-assinatura">
        <div className="admf-assinatura-texto">
          Breves/PA, {dataHora.split(',')[0]}.
        </div>
        <div className="admf-assinatura-caixa">
          <div className="admf-sigline" />
          <div className="admf-sig-caption">{medico?.nome_exibicao || medico?.nome || 'Médico responsável'}</div>
          <div className="admf-sig-crm">CRM/UF: {medico?.crm ? `${medico.crm}/PA` : ''}</div>
        </div>
      </div>

      <footer className="admf-footer">
        <span>Nota de Intercorrência Médica</span>
        <span>Registrado em {dataHora}</span>
      </footer>
    </div>
  )
}

function ReceitaColuna({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const itens = registro.itens || []
  return (
    <div className="rxf-coluna">
      <CabecalhoPadraoUPA
        titulo="RECEITUÁRIO MÉDICO"
        pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora}
      />

      <div className="rxf-itens">
        {itens.map((it, i) => (
          <div key={i} className="rxf-item">
            <div className="rxf-item-nome">{i + 1}) {it.medicamento}</div>
            {it.instrucao && <div className="rxf-item-instrucao">{it.instrucao}</div>}
          </div>
        ))}
      </div>
      <div className="rxf-assinatura">
        <span>{dataHora.split(',')[0]}</span>
        <span>{(medico?.nome_exibicao || medico?.nome) ? `${medico.nome_exibicao || medico.nome}${medico.crm ? ` — CRM ${medico.crm}` : ''}` : 'MÉDICO / CRM'}</span>
      </div>
    </div>
  )
}

function CorpoReceituarioOficial(props) {
  return (
    <div className="rxf-page">
      <div className="rxf-duas-vias">
        <ReceitaColuna {...props} />
        <ReceitaColuna {...props} />
      </div>
      <div className="rxf-rodape">
        <span>Receituário Médico</span>
        <span>Registrado em {props.dataHora}</span>
      </div>
    </div>
  )
}
