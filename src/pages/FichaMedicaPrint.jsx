import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
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
          <CorpoConsultaOficial registro={registro} pessoa={pessoa} dataHora={dataHora} medico={medico} />
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

        {tipo === 'apac' && <CorpoApac registro={registro} />}
        {tipo === 'atm' && <CorpoAtm registro={registro} />}
        {tipo === 'tfd' && <CorpoTfd registro={registro} />}
        {tipo === 'plano' && <CorpoPlano registro={registro} />}
        {tipo === 'regulacao' && <CorpoRegulacao registro={registro} />}

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
  if (!iso) return '—'
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
  const ta = cf.tipo_atendimento || {}
  const ac = cf.antecedentes_check || {}
  const sv = cf.sv || {}
  const cc = cf.conduta_check || {}
  const et = cf.exames_solicitados_tipo || {}
  const de = cf.destino || {}
  const alergias = cf.alergias || []
  const medicamentosUso = cf.medicamentos_uso || []
  const hipotesesCid = cf.hipoteses_cid || []
  const prescricaoInicial = cf.prescricao_inicial || []
  const nascimento2 = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
  const imc = sv.peso && sv.altura ? (Number(sv.peso) / (Number(sv.altura) ** 2)).toFixed(1) : ''

  return (
    <div className="adm-page">
      <div className="adm-topo">
        <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        <div className="adm-topo-centro">
          <h1>UNIDADE DE PRONTO ATENDIMENTO</h1>
          <div className="sub">Prefeitura Municipal de Breves — Secretaria Municipal de Saúde (SEMSA)</div>
          <div className="sub">Travessa Castilhos França — Breves/PA — CEP 68.800-000 — Fone/Fax (91) 3783-1279</div>
        </div>
        <img src="./logos/semsa.jpg" alt="SEMSA" />
      </div>

      <div className="adm-titulo-barra">
        <h2>ADMISSÃO MÉDICA</h2>
        <div className="atendimento">
          Nº ATENDIMENTO
          <b>{atendimento?.numero_atendimento || pessoa.prontuario_numero || '—'}</b>
        </div>
      </div>

      <SecaoAdm titulo="1. Identificação do Atendimento">
        <div className="adm-linha-campos">
          <CampoAdm cap="Data da admissão" val={dataHora.split(',')[0]} />
          <CampoAdm cap="Unidade" val="UPA 24h Breves" />
          <CampoAdm cap="Setor" val={setorNome} />
          <CampoAdm cap="Leito/Poltrona" val={leitoNumero || '—'} />
          <CampoAdm cap="Médico responsável" val={medico?.nome_exibicao || medico?.nome} />
          <CampoAdm cap="CRM/UF" val={medico?.crm ? `${medico.crm}/PA` : '—'} />
        </div>
        <div className="adm-linha-campos" style={{ marginTop: 4 }}>
          <span className="cap" style={{ fontSize: 8, color: '#555', width: '100%' }}>Tipo de atendimento</span>
          <CheckAdm marcado={ta.espontanea}>Demanda espontânea</CheckAdm>
          <CheckAdm marcado={ta.samu}>SAMU</CheckAdm>
          <CheckAdm marcado={ta.encaminhamento}>Encaminhamento</CheckAdm>
          <CheckAdm marcado={ta.transferencia}>Transferência</CheckAdm>
          <CheckAdm marcado={ta.retorno}>Retorno</CheckAdm>
        </div>
      </SecaoAdm>

      <SecaoAdm titulo="2. Identificação do Paciente">
        <div className="adm-linha-campos">
          <CampoAdm cap="Nome completo" val={pessoa.nome} />
          <CampoAdm cap="Nome social" val={cf.nome_social} />
          <CampoAdm cap="Data de nascimento" val={nascimento2} />
          <CampoAdm cap="Idade" val={idade ? `${idade} anos` : '—'} />
          <CampoAdm cap="Sexo" val={pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : '—'} />
        </div>
        <div className="adm-linha-campos">
          <CampoAdm cap="CPF" val={pessoa.cpf} />
          <CampoAdm cap="CNS" val={pessoa.cns} />
          <CampoAdm cap="Telefone" val={pessoa.telefone} />
          <CampoAdm cap="Endereço" val={[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', ')} />
          <CampoAdm cap="Acompanhante" val={cf.acompanhante} />
          <CampoAdm cap="Parentesco" val={cf.parentesco} />
        </div>
      </SecaoAdm>

      <div className="adm-duas-colunas">
        <SecaoAdm titulo="3. Queixa Principal">
          <CampoAdm livre val={registro.queixa_principal} />
          <div className="adm-linha-campos" style={{ marginTop: 6 }}>
            <CampoAdm cap="Início dos sintomas" val={fmtDataHora(cf.inicio_sintomas)} />
            <CampoAdm cap="Duração" val={cf.duracao_sintomas} />
            <CampoAdm cap="Evolução" val={cf.evolucao_sintomas} />
            <CampoAdm cap="Motivo da procura" val={cf.motivo_procura} />
          </div>
        </SecaoAdm>
        <SecaoAdm titulo="6. Alergias">
          <div className="adm-linha-campos">
            <span className="cap" style={{ fontSize: 8, color: '#555' }}>Possui alergia?</span>
            <CheckAdm marcado={cf.possui_alergia === 'sim'}>Sim</CheckAdm>
            <CheckAdm marcado={cf.possui_alergia === 'nao'}>Não</CheckAdm>
            <CheckAdm marcado={cf.possui_alergia === 'ignorado'}>Ignorado</CheckAdm>
          </div>
          {alergias.length > 0 && (
            <table className="adm-tabela">
              <thead><tr><th>Substância</th><th>Reação</th><th>Gravidade</th></tr></thead>
              <tbody>{alergias.map((a, i) => <tr key={i}><td>{a.substancia}</td><td>{a.reacao}</td><td>{a.gravidade}</td></tr>)}</tbody>
            </table>
          )}
        </SecaoAdm>
      </div>

      <SecaoAdm titulo="4. História da Doença Atual (HDA)">
        <CampoAdm livre val={registro.historia_doenca_atual} />
      </SecaoAdm>

      <div className="adm-duas-colunas">
        <SecaoAdm titulo="5. Antecedentes">
          <div className="adm-grid-check">
            <CheckAdm marcado={ac.has}>Hipertensão arterial</CheckAdm>
            <CheckAdm marcado={ac.neurologica}>Doença neurológica</CheckAdm>
            <CheckAdm marcado={ac.dm}>Diabetes mellitus</CheckAdm>
            <CheckAdm marcado={ac.psiquiatrica}>Doença psiquiátrica</CheckAdm>
            <CheckAdm marcado={ac.cardiovascular}>Doença cardiovascular</CheckAdm>
            <CheckAdm marcado={ac.neoplasia}>Neoplasia</CheckAdm>
            <CheckAdm marcado={ac.respiratoria}>Doença respiratória</CheckAdm>
            <CheckAdm marcado={ac.cirurgias_previas}>Cirurgias prévias</CheckAdm>
            <CheckAdm marcado={ac.renal}>Doença renal</CheckAdm>
            <CheckAdm marcado={ac.internacoes_anteriores}>Internações anteriores</CheckAdm>
            <CheckAdm marcado={ac.hepatica}>Doença hepática</CheckAdm>
            <CheckAdm marcado={!!cf.antecedentes_outros}>Outros: {cf.antecedentes_outros}</CheckAdm>
          </div>
          {registro.antecedentes && <div style={{ marginTop: 6 }}><CampoAdm cap="Antecedentes (texto livre)" val={registro.antecedentes} livre /></div>}
          {registro.revisao_sistemas && <div style={{ marginTop: 6 }}><CampoAdm cap="Revisão de sistemas" val={registro.revisao_sistemas} livre /></div>}
        </SecaoAdm>
        <SecaoAdm titulo="7. Medicamentos em Uso">
          {medicamentosUso.length > 0 ? (
            <table className="adm-tabela">
              <thead><tr><th>Medicamento</th><th>Dose</th><th>Via</th><th>Frequência</th><th>Última dose</th></tr></thead>
              <tbody>{medicamentosUso.map((m, i) => <tr key={i}><td>{m.medicamento}</td><td>{m.dose}</td><td>{m.via}</td><td>{m.frequencia}</td><td>{m.ultima_dose}</td></tr>)}</tbody>
            </table>
          ) : <span className="cap">Nenhum medicamento em uso informado.</span>}
        </SecaoAdm>
      </div>

      <SecaoAdm titulo="8. Sinais Vitais">
        <div className="adm-linha-campos">
          <CampoAdm cap="PA (mmHg)" val={sv.pa} />
          <CampoAdm cap="FC (bpm)" val={sv.fc} />
          <CampoAdm cap="FR (irpm)" val={sv.fr} />
          <CampoAdm cap="SpO2 (%)" val={sv.spo2} />
          <CampoAdm cap="Temp. (°C)" val={sv.temp} />
        </div>
        <div className="adm-linha-campos">
          <CampoAdm cap="Glicemia (mg/dL)" val={sv.glicemia} />
          <CampoAdm cap="Dor (0-10)" val={sv.dor} />
          <CampoAdm cap="Peso (kg)" val={sv.peso} />
          <CampoAdm cap="Altura (m)" val={sv.altura} />
          <CampoAdm cap="IMC" val={imc} />
          <CampoAdm cap="Glasgow" val={sv.glasgow} />
        </div>
        <span className="cap">Registrado por: {cf.sv_registrado_por || '—'} · {fmtDataHora(cf.sv_hora)}</span>
      </SecaoAdm>

      <div className="adm-duas-colunas">
        <SecaoAdm titulo="9. Exame Físico">
          <div className="adm-linha-campos">
            <CampoAdm cap="Estado geral" val={cf.exame_estado_geral} />
            <CampoAdm cap="Consciência" val={cf.exame_consciencia} />
            <CampoAdm cap="Pele" val={cf.exame_pele} />
            <CampoAdm cap="Hidratação" val={cf.exame_hidratacao} />
          </div>
          <CampoAdm cap="Cardiovascular" val={cf.exame_cardiovascular} livre />
          <CampoAdm cap="Respiratório" val={cf.exame_respiratorio} livre />
          <CampoAdm cap="Abdome" val={cf.exame_abdome} livre />
          <CampoAdm cap="Extremidades" val={cf.exame_extremidades} livre />
          <CampoAdm cap="Neurológico" val={cf.exame_neurologico} livre />
          <CampoAdm cap="Outros achados / Exame físico geral" val={[cf.exame_outros_achados, registro.exame_geral].filter(Boolean).join(' — ')} livre />
        </SecaoAdm>
        <SecaoAdm titulo="10. Hipóteses Diagnósticas">
          {hipotesesCid.length > 0 ? (
            <table className="adm-tabela">
              <thead><tr><th>CID-10</th><th>Descrição</th><th>Principal?</th></tr></thead>
              <tbody>{hipotesesCid.map((h, i) => <tr key={i}><td>{h.cid}</td><td>{h.descricao}</td><td>{h.principal ? 'Sim' : 'Não'}</td></tr>)}</tbody>
            </table>
          ) : <span className="cap">Nenhuma hipótese estruturada informada.</span>}
          {registro.hipotese_diagnostica && <div style={{ marginTop: 6 }}><CampoAdm cap="Hipótese diagnóstica (texto livre)" val={registro.hipotese_diagnostica} livre /></div>}
        </SecaoAdm>
      </div>

      <SecaoAdm titulo="11. Diagnóstico / Avaliação Médica">
        <CampoAdm livre val={cf.diagnostico_avaliacao} />
      </SecaoAdm>

      <SecaoAdm titulo="12. Conduta">
        <div className="adm-grid-check">
          <CheckAdm marcado={cc.observacao}>Observação</CheckAdm>
          <CheckAdm marcado={cc.oxigenoterapia}>Oxigenoterapia</CheckAdm>
          <CheckAdm marcado={cc.medicacao}>Medicação</CheckAdm>
          <CheckAdm marcado={cc.avaliacao_especialista}>Avaliação de especialista</CheckAdm>
          <CheckAdm marcado={cc.hidratacao}>Hidratação</CheckAdm>
          <CheckAdm marcado={cc.regulacao}>Regulação</CheckAdm>
          <CheckAdm marcado={cc.exames_lab}>Exames laboratoriais</CheckAdm>
          <CheckAdm marcado={cc.internacao}>Internação</CheckAdm>
          <CheckAdm marcado={cc.exames_imagem}>Exames de imagem</CheckAdm>
          <CheckAdm marcado={cc.transferencia}>Transferência</CheckAdm>
          <CheckAdm marcado={cc.ecg}>ECG</CheckAdm>
          <CheckAdm marcado={cc.procedimento}>Procedimento</CheckAdm>
        </div>
        {cf.conduta_outros && <div style={{ marginTop: 4 }}><CampoAdm cap="Outros" val={cf.conduta_outros} /></div>}
        <div style={{ marginTop: 6 }}><CampoAdm cap="Plano terapêutico / conduta detalhada" val={registro.conduta_inicial} livre /></div>
      </SecaoAdm>

      <SecaoAdm titulo="13. Prescrição Médica (Inicial)">
        {prescricaoInicial.length > 0 ? (
          <table className="adm-tabela">
            <thead><tr><th>Medicamento</th><th>Dose</th><th>Via</th><th>Frequência</th><th>Duração</th></tr></thead>
            <tbody>{prescricaoInicial.map((p, i) => <tr key={i}><td>{p.medicamento}</td><td>{p.dose}</td><td>{p.via}</td><td>{p.frequencia}</td><td>{p.duracao}</td></tr>)}</tbody>
          </table>
        ) : <span className="cap">Nenhuma prescrição inicial registrada nesta ficha — ver aba Prescrição.</span>}
      </SecaoAdm>

      <div className="adm-duas-colunas">
        <SecaoAdm titulo="14. Exames Solicitados">
          <div className="adm-linha-campos">
            <CheckAdm marcado={et.laboratoriais}>Laboratoriais</CheckAdm>
            <CheckAdm marcado={et.imagem}>Imagem</CheckAdm>
            <CheckAdm marcado={et.cardiologicos}>Cardiológicos</CheckAdm>
            <CheckAdm marcado={et.outros}>Outros</CheckAdm>
          </div>
          <CampoAdm cap="Solicitações" val={cf.exames_solicitados_texto} livre />
        </SecaoAdm>
        <SecaoAdm titulo="15. Classificação de Risco">
          <div className="adm-linha-campos">
            <CampoAdm cap="Classificação" val={cf.classificacao_risco} />
            <CampoAdm cap="Prioridade" val={cf.prioridade} />
            <CampoAdm cap="Tempo-alvo" val={cf.tempo_alvo} />
            <CampoAdm cap="Data/hora" val={fmtDataHora(cf.classificacao_datahora)} />
            <CampoAdm cap="Profissional" val={cf.classificacao_profissional} />
          </div>
        </SecaoAdm>
      </div>

      <SecaoAdm titulo="16. Destino Após Avaliação">
        <div className="adm-grid-check">
          <CheckAdm marcado={de.observacao}>Observação</CheckAdm>
          <CheckAdm marcado={de.sala_medicacao}>Sala de medicação</CheckAdm>
          <CheckAdm marcado={de.leito}>Leito</CheckAdm>
          <CheckAdm marcado={de.transferencia}>Transferência</CheckAdm>
          <CheckAdm marcado={de.alta}>Alta</CheckAdm>
          <CheckAdm marcado={de.regulacao}>Regulação</CheckAdm>
          <CheckAdm marcado={de.obito}>Óbito</CheckAdm>
        </div>
      </SecaoAdm>

      <SecaoAdm titulo="17. Assinatura">
        <div className="adm-assinatura-v2">
          <span className="data">Breves/PA, {dataHora.split(',')[0]}.</span>
          <div className="bloco">
            <div className="espaco-carimbo" />
            <div className="linha" />
            <div className="legenda">Assinatura Médica</div>
          </div>
        </div>
      </SecaoAdm>

      <div className="adm-rodape">
        <span>PEP — Prontuário Eletrônico do Paciente</span>
        <span>Este documento faz parte do registro eletrônico do paciente.</span>
        <span>Registrado em {dataHora}</span>
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
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

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

      <table className="pr-info">
        <tbody>
          <tr>
            <td style={{ width: '14%' }}><b>PRONTUÁRIO:</b> {pessoa.prontuario_numero || '—'}</td>
            <td style={{ width: '10%' }}><b>REGISTRO:</b> {atendimento?.numero_atendimento || '—'}</td>
            <td style={{ width: '22%' }}><b>RECEPÇÃO:</b> {atendimento?.tipo_entrada || '—'}</td>
            <td style={{ width: '22%' }}><b>DATA INTERNAÇÃO:</b> {atendimento?.criado_em ? new Date(atendimento.criado_em).toLocaleString('pt-BR') : '—'}</td>
            <td><b>DATA ALTA:</b> {atendimento?.encerrado_em ? new Date(atendimento.encerrado_em).toLocaleString('pt-BR') : '—'}</td>
          </tr>
          <tr>
            <td colSpan={3}><b>PACIENTE:</b> {pessoa.nome}</td>
            <td><b>CARÁTER:</b> {atendimento?.carater || 'Urgência'}</td>
            <td><b>CONVÊNIO:</b> {atendimento?.convenio || 'SUS'}</td>
          </tr>
          <tr>
            <td colSpan={3}><b>MÃE:</b> {pessoa.nome_mae || '—'} &nbsp;&nbsp; <b>SEXO:</b> {pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : '—'}</td>
            <td><b>NACIONALIDADE:</b> Brasil</td>
            <td><b>RAÇA:</b> —</td>
          </tr>
          <tr>
            <td><b>R.G.:</b> —</td>
            <td colSpan={2}><b>C.P.F.:</b> {pessoa.cpf || '—'} &nbsp;&nbsp; <b>C.N.S.:</b> {pessoa.cns || '—'}</td>
            <td><b>DATA NASC.:</b> {nascimento}</td>
            <td><b>IDADE:</b> {idade ? `${idade} anos` : '—'}</td>
          </tr>
          <tr>
            <td colSpan={4}><b>ENDEREÇO:</b> {[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', ') || '—'}</td>
            <td><b>TELEFONE:</b> {pessoa.telefone || '—'}</td>
          </tr>
          <tr>
            <td><b>PRESCRIÇÃO:</b> {registro.id ? registro.id.slice(0, 8).toUpperCase() : '—'}</td>
            <td colSpan={2}><b>DATA DOCUMENTO:</b> {dataHora}</td>
            <td colSpan={2}><b>INÍCIO DA VALIDADE:</b> {dataHora}</td>
          </tr>
          <tr>
            <td colSpan={3}><b>CENTRO DE CUSTO:</b> —</td>
            <td colSpan={2}><b>ESPECIALIDADE:</b> Clínica Médica</td>
          </tr>
          <tr>
            <td colSpan={3}><b>MÉDICO RESPONSÁVEL:</b> {medico?.nome_exibicao || medico?.nome} &nbsp; <b>CRM:</b> {medico?.crm || '—'}</td>
            <td colSpan={2}><b>ALERGIA:</b> Nenhuma informada</td>
          </tr>
          <tr>
            <td><b>LEITO:</b> {leitoNumero || '—'}</td>
            <td><b>QUARTO:</b> {setorNome || '—'}</td>
            <td><b>UNIDADE:</b> UPA 24h Breves</td>
            <td colSpan={2}><b>PESO:</b> —</td>
          </tr>
        </tbody>
      </table>

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
              <td className="qtd">{it.dose ? `${it.dose} ${it.dose_unidade || ''}` : '—'}</td>
              <td className="via">{it.via || '—'}</td>
              <td className="freq">{it.frequencia || '—'}{it.duracao ? ` · ${it.duracao}` : ''}</td>
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
            <tr key={i}><td>{i + 1} — {o.texto}</td><td className="freq">{o.frequencia || '—'}</td></tr>
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
          CRM: {medico?.crm || '—'}
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
      <Secao rotulo="Validade" valor={registro.validade_inicio ? `${new Date(registro.validade_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} a ${registro.validade_fim ? new Date(registro.validade_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}` : null} />
    </>
  )
}

function CorpoAtm({ registro }) {
  return (
    <>
      <Secao rotulo="Medicamento" valor={registro.medicamento} />
      <Secao rotulo="Dose" valor={registro.dose} />
      <Secao rotulo="Posologia" valor={registro.posologia} />
      <Secao rotulo="Intervalo" valor={registro.intervalo} />
      <Secao rotulo="Tempo de uso previsto" valor={registro.tempo_uso_dias ? `${registro.tempo_uso_dias} dias` : null} />
      <Secao rotulo="Justificativa clínica" valor={registro.justificativa_clinica} />
      <div className="doc-secao" style={{ marginTop: 12 }}>
        <span className="rotulo">Parecer da farmácia</span>
        <span className="valor">Liberação avaliada e registrada manualmente pela farmácia — espaço reservado abaixo para parecer, assinatura e carimbo do farmacêutico responsável.</span>
      </div>
      <div className="doc-assinatura" style={{ marginTop: 24 }}>
        <div className="linha-assinatura" />
        Farmacêutico(a) responsável — parecer / assinatura / carimbo
      </div>
    </>
  )
}

function CorpoTfd({ registro }) {
  return (
    <>
      <Secao rotulo="História da doença atual" valor={registro.historia_doenca_atual} />
      <Secao rotulo="Exame físico" valor={registro.exame_fisico} />
      <Secao rotulo="Diagnóstico" valor={registro.diagnostico} />
      <Secao rotulo="Exame complementar" valor={registro.exame_complementar} />
      <Secao rotulo="Tratamento realizado" valor={registro.tratamento_realizado} />
      <Secao rotulo="Tratamento indicado" valor={registro.tratamento_indicado} />
      <Secao rotulo="Tempo provável de tratamento" valor={registro.tempo_provavel_dias ? `${registro.tempo_provavel_dias} dias` : null} />
      <Secao rotulo="Acompanhante" valor={registro.acompanhante_nome ? `${registro.acompanhante_nome}${registro.acompanhante_relacao ? ` (${registro.acompanhante_relacao})` : ''}` : null} />
    </>
  )
}

function CorpoPlano({ registro }) {
  return (
    <>
      <Secao rotulo="Motivo da internação" valor={registro.motivo_internacao} />
      <Secao rotulo="Objetivos terapêuticos" valor={registro.objetivos_terapeuticos} />
      <Secao rotulo="Protocolos institucionais elegíveis" valor={(registro.protocolos_elegiveis ?? []).join(', ')} />
      <Secao rotulo="Tempo de internação previsto" valor={registro.tempo_internacao_previsto_dias ? `${registro.tempo_internacao_previsto_dias} dias` : null} />
      <Secao rotulo="Equipe multidisciplinar envolvida" valor={(registro.equipe_multidisciplinar ?? []).join(', ')} />
    </>
  )
}

function CorpoRegulacao({ registro }) {
  const sv = registro.sinais_vitais || {}
  const svTexto = [
    sv.pa_sistolica && sv.pa_diastolica ? `PA ${sv.pa_sistolica}x${sv.pa_diastolica}mmHg` : null,
    sv.fc ? `FC ${sv.fc}bpm` : null,
    sv.fr ? `FR ${sv.fr}irpm` : null,
    sv.temperatura ? `T ${sv.temperatura}°C` : null,
    sv.spo2 ? `SpO2 ${sv.spo2}%` : null,
    sv.hgt ? `HGT ${sv.hgt}mg/dl` : null,
  ].filter(Boolean).join(' · ')

  return (
    <>
      <Secao rotulo="Sinais vitais" valor={svTexto || null} />
      <Secao rotulo="Evolução" valor={registro.evolucao} />
      <Secao rotulo="Pendências" valor={registro.pendencias} />
      <Secao rotulo="Conduta" valor={registro.conduta} />
      <Secao rotulo="Nº solicitação SER" valor={registro.numero_solicitacao_ser} />
      {registro.mudanca_diagnostico && (
        <Secao rotulo="Mudança de diagnóstico" valor={registro.novo_diagnostico_cid || 'Sim'} />
      )}
    </>
  )
}
