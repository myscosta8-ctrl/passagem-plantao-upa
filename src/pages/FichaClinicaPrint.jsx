import { useEffect, useState } from 'react'
import { buscarCabecalhoImpressao } from '../lib/pepMedico'
import CabecalhoPadraoUPA from './CabecalhoPadraoUPA'
import { CorpoHistoricoEnfermagemFiel, CorpoHistoricoEnfermagemProjeto } from './CorpoHistoricoEnfermagem'
import './PrintView.css'

const TITULOS = {
  sbar: 'Transferência de Paciente — Formato SBAR',
  evolucao_sae: 'Evolução do Enfermeiro — Sistematização (SAE)',
  evolucao: 'Evolução do Enfermeiro — Sistematização (SAE)',
  intercorrencia: 'Nota de Intercorrência de Enfermagem',
  balanco: 'Balanço Hídrico 24 Horas — Controle de Líquidos',
  historico_enfermagem_fiel: 'Admissão de Enfermagem',
  historico_enfermagem_projeto: 'Admissão de Enfermagem',
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

  return (
    <div className={`print-page ${tipo === 'balanco' ? 'bh-landscape' : ''}`}>
      <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
        <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
        <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
      </div>

      <div className="print-area">
        {(tipo === 'historico_enfermagem_fiel' || tipo === 'historico_enfermagem_projeto') && (
          tipo === 'historico_enfermagem_projeto' ? (
            <CorpoHistoricoEnfermagemProjeto registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
          ) : (
            <CorpoHistoricoEnfermagemFiel registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
          )
        )}

        {tipo === 'sbar' && (
          <CorpoSbarOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        )}

        {(tipo === 'evolucao_sae' || tipo === 'evolucao') && (
          <CorpoEvolucaoSaeOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        )}

        {tipo === 'intercorrencia' && (
          <CorpoIntercorrenciaOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        )}

        {tipo === 'balanco' && (
          <CorpoBalancoHidricoOficial registro={registro} pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} medico={medico} dataHora={dataHora} />
        )}
      </div>
    </div>
  )
}

function CorpoSbarOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const sv = registro.sinais_vitais || {}
  const entrega = registro.entrega || medico || {}
  const recebe = registro.recebe || {}

  return (
    <div className="sbar-page">
      <CabecalhoPadraoUPA
        titulo="TRANSFERÊNCIA DE PACIENTE — FORMATO SBAR"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={entrega}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        <div className="sbar-corpo">
          {/* S — SITUAÇÃO */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">S</span> 1. Situação (Motivo e Diagnóstico da Transferência)
            </div>
            <div className="sbar-secao-body">
              <div><b>Setor de Destino:</b> {registro.setores?.nome || registro.setor_destino || 'Setor de internação / Retaguarda'}</div>
              <div style={{ marginTop: 3 }}><b>Impressão Diagnóstica / Motivo da Transferência:</b> {registro.impressao_diagnostica || 'Transferência para leito de observação / continuidade de assistência.'}</div>
            </div>
          </div>

          {/* B — BREVE HISTÓRICO */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">B</span> 2. Breve Histórico (Background & Condições Clínicas Prévias)
            </div>
            <div className="sbar-secao-body">
              <div className="sbar-grid-3">
                <div className="sbar-card-mini">
                  <div className="card-header">Comorbidades / Antecedentes</div>
                  <div className="card-body">{registro.comorbidades || pessoa.comorbidades || 'Nenhuma comorbidade relatada.'}</div>
                </div>
                <div className="sbar-card-mini">
                  <div className="card-header">Alergias Conhecidas</div>
                  <div className="card-body">
                    <span className="check-item"><span className="check-box-fiel">{!registro.alergia ? 'X' : ''}</span> Nega</span>
                    <span className="check-item"><span className="check-box-fiel">{registro.alergia ? 'X' : ''}</span> Sim: {registro.alergia_quais || 'Não especificada'}</span>
                  </div>
                </div>
                <div className="sbar-card-mini">
                  <div className="card-header">Precaução / Isolamento</div>
                  <div className="card-body">
                    <span className="check-item"><span className="check-box-fiel">{!registro.isolamento ? 'X' : ''}</span> Padrão</span>
                    <span className="check-item"><span className="check-box-fiel">{registro.isolamento ? 'X' : ''}</span> Específico: {registro.isolamento_tipo || 'Contato / Gotículas'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* A — AVALIAÇÃO */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">A</span> 3. Avaliação Clínica Atual (Assessment)
            </div>
            <div className="sbar-secao-body">
              <table className="sbar-tabela-sv">
                <thead>
                  <tr>
                    <th>PA (mmHg)</th>
                    <th>FC (bpm)</th>
                    <th>FR (irpm)</th>
                    <th>Temp (°C)</th>
                    <th>SpO₂ (%)</th>
                    <th>HGT (mg/dL)</th>
                    <th>Escala de Dor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : '120x80'}</td>
                    <td>{sv.fc ? `${sv.fc} bpm` : '78 bpm'}</td>
                    <td>{sv.fr ? `${sv.fr} irpm` : '18 irpm'}</td>
                    <td>{sv.temperatura ? `${sv.temperatura} °C` : '36.5 °C'}</td>
                    <td>{sv.spo2 ? `${sv.spo2} %` : '98 % (AA)'}</td>
                    <td>{sv.hgt ? `${sv.hgt} mg/dL` : '108 mg/dL'}</td>
                    <td>{sv.dor ? `${sv.dor}/10` : '0/10 (Ausente)'}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 5 }}>
                <div><b>Nível de Consciência:</b> {registro.nivel_consciencia || 'Alerta, orientado no tempo e espaço (Glasgow 15).'}</div>
                <div><b>Suporte Ventilatório:</b> {registro.suporte_ventilatorio ? 'Em uso de oxigenoterapia' : 'Ar ambiente (sem suporte).'}</div>
              </div>
              <div style={{ marginTop: 4 }}>
                <b>Dispositivos Invasivos:</b> {registro.dispositivos || 'Acesso venoso periférico em MSE com Jelco 20G pérvio.'}
              </div>
            </div>
          </div>

          {/* R — RECOMENDAÇÕES */}
          <div className="sbar-secao">
            <div className="sbar-secao-header">
              <span className="sbar-badge">R</span> 4. Recomendações e Plano Imediato no Destino
            </div>
            <div className="sbar-secao-body">
              <div><b>Plano e Cuidados Imediatos:</b> {registro.recomendacoes || 'Manter monitorização e aguardar reavaliação médica no setor.'}</div>
              <div style={{ marginTop: 4 }}>
                <b>Intercorrências no Transporte:</b>{' '}
                <span className="check-item"><span className="check-box-fiel">{!registro.intercorrencia_transporte ? 'X' : ''}</span> Não houve</span>
                <span className="check-item"><span className="check-box-fiel">{registro.intercorrencia_transporte ? 'X' : ''}</span> Houve intercorrência</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ EXTERNO */}
      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Horário da Transferência:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
            <div style={{ fontSize: '8px', color: '#64748b', marginTop: 2 }}>Origem: {setorNome || 'Setor de Origem'} &bull; Leito {leitoNumero || '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="doc-bloco-assinatura" style={{ minWidth: 190 }}>
              <div className="linha-sig" />
              <div className="nome-sig">{entrega.nome_exibicao || entrega.nome || 'Enfermeiro(a) Responsável'}</div>
              <div className="coren-sig">{entrega.coren ? `COREN-PA ${entrega.coren}` : (entrega.crm ? `COREN-PA ${entrega.crm}` : 'COREN-PA')}</div>
              <div className="cargo-sig">Enfermeiro(a) de Origem</div>
            </div>
            <div className="doc-bloco-assinatura" style={{ minWidth: 190 }}>
              <div className="linha-sig" />
              <div className="nome-sig">{recebe.nome_exibicao || recebe.nome || '(a preencher no destino)'}</div>
              <div className="coren-sig">COREN-PA</div>
              <div className="cargo-sig">Enfermeiro(a) de Destino</div>
            </div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Transferência de Paciente (SBAR) — Folha Única — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function CorpoEvolucaoSaeOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  return (
    <div className="sae-page">
      <CabecalhoPadraoUPA
        titulo="EVOLUÇÃO DO ENFERMEIRO — SISTEMATIZAÇÃO (SAE)"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={enf}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        <div className="sae-corpo">
          <div className="sae-bloco-grid">
            <div className="sae-card-mini">
              <div className="card-header">Nível de Consciência</div>
              <div className="card-body">{registro.nivel_consciencia || 'Alerta, Glasgow 15'}</div>
            </div>
            <div className="sae-card-mini">
              <div className="card-header">Estado Geral</div>
              <div className="card-body">{registro.estado_geral || 'BEG, eupneico, corado'}</div>
            </div>
            <div className="sae-card-mini">
              <div className="card-header">Acesso Venoso</div>
              <div className="card-body">{registro.acesso_venoso || 'AVP em MSE (pérvio)'}</div>
            </div>
            <div className="sae-card-mini">
              <div className="card-header">Eliminações</div>
              <div className="card-body">{registro.eliminacoes || 'Diurese/evacuação presentes'}</div>
            </div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">1. Queixa Principal e Motivo de Admissão / Hospitalização</div>
            <div className="sae-secao-body">{registro.motivo_hospitalizacao || registro.queixa_principal || registro.texto || 'Paciente admitido para observação e propedêutica terapêutica.'}</div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">2. Exame Físico Céfalo-Caudal de Enfermagem</div>
            <div className="sae-secao-body">{registro.exame_fisico || registro.exame_texto || registro.texto || 'Crânio normocéfalo, pupilas isocóricas e fotorreagentes. Mucosas coradas e hidratadas. Tórax simétrico, murmúrio vesicular presente bilateralmente sem ruídos adventícios. Abdome plano, flácido, indolor à palpação, ruídos hidroaéreos normoativos. Extremidades aquecidas, sem edemas, pulsos periféricos palpáveis e cheios. Pele íntegra sem lesões por pressão.'}</div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">3. Dispositivos Invasivos e Cuidados com Cateteres/Sondas</div>
            <div className="sae-secao-body" style={{ padding: 0 }}>
              <table className="sae-tabela-dispositivos">
                <thead>
                  <tr>
                    <th>Dispositivo</th>
                    <th>Localização / Calibre</th>
                    <th>Data de Inserção</th>
                    <th>Condição / Curativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Acesso Venoso Periférico</b></td>
                    <td>{registro.acesso_local || 'MSE — Veia cefálica / Cateter 20G'}</td>
                    <td>{registro.acesso_data || dataHora.split(',')[0]}</td>
                    <td>Pérvio, sem sinais flogísticos, curativo limpo e oclusivo</td>
                  </tr>
                  <tr>
                    <td><b>Sonda / Dreno</b></td>
                    <td>{registro.sonda_local || 'Não se aplica'}</td>
                    <td>—</td>
                    <td>{registro.sonda_condicao || 'Ausente'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">4. Diagnósticos de Enfermagem e Prescrição / Metas (SAE)</div>
            <div className="sae-secao-body">
              <div className="sae-plano-grid">
                <div className="sae-item-diagnostico">
                  <b>DIAGNÓSTICOS:</b> {registro.diagnosticos_enfermagem || 'Risco de infecção relacionado a procedimento invasivo (acesso venoso); Conforto prejudicado.'}
                </div>
                <div className="sae-item-diagnostico">
                  <b>PRESCRIÇÕES / METAS:</b> {registro.prescricoes_enfermagem || 'Monitorar sinais vitais de 4/4h; Manter cabeceira elevada a 30°; Higienização das mãos antes de manipular acesso.'}
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
            <div className="hora-envio"><b>Horário da Evolução:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{enf.nome_exibicao || enf.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{enf.coren ? `COREN-PA ${enf.coren}` : (enf.crm ? `COREN-PA ${enf.crm}` : 'COREN-PA')}</div>
            <div className="cargo-sig">Enfermeiro(a) de Plantão — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Evolução do Enfermeiro (SAE) — Folha Única — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function CorpoIntercorrenciaOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  const sv = registro.sinais_vitais || {}
  return (
    <div className="note-page">
      <CabecalhoPadraoUPA
        titulo="NOTA DE INTERCORRÊNCIA DE ENFERMAGEM"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={enf}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        <div className="not-corpo">
          <div className="not-secao">
            <div className="not-secao-header">1. Descrição do Evento / Intercorrência</div>
            <div className="not-secao-body">{registro.descricao || registro.texto || 'Paciente apresentou episódio de intercorrência clínica durante o plantão.'}</div>
          </div>

          <div className="not-grid-campos">
            <div className="not-card-mini">
              <div className="card-header">Classificação do Evento</div>
              <div className="card-body">{registro.classificacao || 'Intercorrência Clínica Aguda'}</div>
            </div>
            <div className="not-card-mini">
              <div className="card-header">Médico Notificado</div>
              <div className="card-body">{registro.medico_notificado || 'Médico Plantonista da UPA'}</div>
            </div>
            <div className="not-card-mini">
              <div className="card-header">Horário da Notificação</div>
              <div className="card-body">{registro.horario_notificacao || (dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora) || 'Imediato'}</div>
            </div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">2. Sinais Vitais no Momento da Intercorrência</div>
            <div className="not-secao-body" style={{ padding: 4 }}>
              <table className="not-tabela-sv">
                <thead>
                  <tr>
                    <th>PA (mmHg)</th>
                    <th>FC (bpm)</th>
                    <th>FR (irpm)</th>
                    <th>Temp (°C)</th>
                    <th>SpO₂ (%)</th>
                    <th>HGT (mg/dL)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}x${sv.pa_diastolica}` : (registro.pa || '120x80')}</td>
                    <td>{sv.fc || registro.fc || '80'} bpm</td>
                    <td>{sv.fr || registro.fr || '18'} irpm</td>
                    <td>{sv.temperatura || registro.temperatura || '36.5'} °C</td>
                    <td>{sv.spo2 || registro.spo2 || '98'} %</td>
                    <td>{sv.hgt || registro.hgt || '110'} mg/dL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">3. Condutas de Enfermagem Adotadas e Medicações Administradas</div>
            <div className="not-secao-body">{registro.conduta || 'Realizada aferição de sinais vitais, posicionamento do paciente em decúbito elevado, comunicado médico plantonista e administrada medicação conforme prescrição médica imediata.'}</div>
          </div>

          <div className="not-secao">
            <div className="not-secao-header">4. Resposta do Paciente e Desfecho</div>
            <div className="not-secao-body">{registro.desfecho || 'Paciente estável após medidas tomadas, sem queixas no momento, sob monitorização contínua pela equipe de enfermagem.'}</div>
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
            <div className="nome-sig">{enf.nome_exibicao || enf.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{enf.coren ? `COREN-PA ${enf.coren}` : (enf.crm ? `COREN-PA ${enf.crm}` : 'COREN-PA')}</div>
            <div className="cargo-sig">Enfermeiro(a) de Plantão — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Nota de Intercorrência de Enfermagem — Folha Única — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}

function CorpoBalancoHidricoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  const diurnoHoras = ['07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h']
  const noturnoHoras = ['19h', '20h', '21h', '22h', '23h', '00h', '01h', '02h', '03h', '04h', '05h', '06h']
  const entradas = registro.entradas || {}
  const saidas = registro.saidas || {}
  const totais = registro.totais || {}

  return (
    <div className="bh-page">
      <CabecalhoPadraoUPA
        titulo="BALANÇO HÍDRICO 24 HORAS — CONTROLE DE LÍQUIDOS"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={enf}
        profissionalRotulo="ENFERMEIRO(A) RESPONSÁVEL:"
        dataHora={dataHora}
      />

      <div className="doc-corpo">
        <div className="bh-tabela-container">
          <table className="bh-grade">
            <thead>
              <tr>
                <th rowSpan={2} className="col-item">PARÂMETROS / HORÁRIOS</th>
                <th colSpan={12}>TURNO DIURNO (07h às 18h)</th>
                <th rowSpan={2} className="th-subtotal">SUBTOTAL DIA</th>
                <th colSpan={12}>TURNO NOTURNO (19h às 06h)</th>
                <th rowSpan={2} className="th-subtotal">SUBTOTAL NOITE</th>
                <th rowSpan={2} className="th-total-geral">TOTAL 24H</th>
              </tr>
              <tr>
                {diurnoHoras.map((h) => <th key={h}>{h}</th>)}
                {noturnoHoras.map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="tr-secao-ganho">
                <td colSpan={28}><b>GANHOS / ENTRADAS (mL)</b></td>
              </tr>
              {[
                { id: 'vo', label: 'Via Oral / Dieta (VO)' },
                { id: 'sne', label: 'Sonda (SNE / SNG)' },
                { id: 'sg', label: 'Soro Glicosado (SG)' },
                { id: 'sf', label: 'Soro Fisiológico (SF)' },
                { id: 'med', label: 'Medicações / Diluições' },
                { id: 'outros_ganhos', label: 'Outros Ganhos / Hemocomponentes' },
              ].map((row) => (
                <tr key={row.id}>
                  <td className="col-item">{row.label}</td>
                  {diurnoHoras.map((_, i) => <td key={i}>{entradas[`${row.id}_d${i}`] || ''}</td>)}
                  <td className="td-subtotal">{totais[`${row.id}_sub_dia`] || ''}</td>
                  {noturnoHoras.map((_, i) => <td key={i}>{entradas[`${row.id}_n${i}`] || ''}</td>)}
                  <td className="td-subtotal">{totais[`${row.id}_sub_noite`] || ''}</td>
                  <td className="td-total-geral">{totais[`${row.id}_total`] || ''}</td>
                </tr>
              ))}
              <tr className="tr-total-ganho">
                <td className="col-item"><b>TOTAL DE GANHOS (mL)</b></td>
                {diurnoHoras.map((_, i) => <td key={i}>{totais[`ganhos_d${i}`] || ''}</td>)}
                <td className="td-subtotal"><b>{totais.ganhos_sub_dia || ''}</b></td>
                {noturnoHoras.map((_, i) => <td key={i}>{totais[`ganhos_n${i}`] || ''}</td>)}
                <td className="td-subtotal"><b>{totais.ganhos_sub_noite || ''}</b></td>
                <td className="td-total-geral"><b>{totais.ganhos_total_24h || ''}</b></td>
              </tr>

              <tr className="tr-secao-perda">
                <td colSpan={28}><b>PERDAS / SAÍDAS (mL)</b></td>
              </tr>
              {[
                { id: 'diurese', label: 'Diurese (Espontânea / SVD)' },
                { id: 'drenos', label: 'Drenos / SNG Aberta' },
                { id: 'vomitos', label: 'Vômitos / Êmese' },
                { id: 'fezes', label: 'Fezes Líquidas / Diarreia' },
                { id: 'aspiracao', label: 'Aspiração Traqueal' },
                { id: 'outras_perdas', label: 'Outras Perdas / Sangramento' },
              ].map((row) => (
                <tr key={row.id}>
                  <td className="col-item">{row.label}</td>
                  {diurnoHoras.map((_, i) => <td key={i}>{saidas[`${row.id}_d${i}`] || ''}</td>)}
                  <td className="td-subtotal">{totais[`${row.id}_sub_dia`] || ''}</td>
                  {noturnoHoras.map((_, i) => <td key={i}>{saidas[`${row.id}_n${i}`] || ''}</td>)}
                  <td className="td-subtotal">{totais[`${row.id}_sub_noite`] || ''}</td>
                  <td className="td-total-geral">{totais[`${row.id}_total`] || ''}</td>
                </tr>
              ))}
              <tr className="tr-total-perda">
                <td className="col-item"><b>TOTAL DE PERDAS (mL)</b></td>
                {diurnoHoras.map((_, i) => <td key={i}>{totais[`perdas_d${i}`] || ''}</td>)}
                <td className="td-subtotal"><b>{totais.perdas_sub_dia || ''}</b></td>
                {noturnoHoras.map((_, i) => <td key={i}>{totais[`perdas_n${i}`] || ''}</td>)}
                <td className="td-subtotal"><b>{totais.perdas_sub_noite || ''}</b></td>
                <td className="td-total-geral"><b>{totais.perdas_total_24h || ''}</b></td>
              </tr>

              <tr className="tr-balanco-final">
                <td className="col-item"><b>BALANÇO HÍDRICO PARCIAL / FINAL</b></td>
                {diurnoHoras.map((_, i) => <td key={i}>{totais[`bh_d${i}`] || ''}</td>)}
                <td className="td-subtotal"><b>{totais.bh_sub_dia || ''}</b></td>
                {noturnoHoras.map((_, i) => <td key={i}>{totais[`bh_n${i}`] || ''}</td>)}
                <td className="td-subtotal"><b>{totais.bh_sub_noite || ''}</b></td>
                <td className="td-total-geral"><b>{totais.bh_total_24h || ''}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {dataHora.split(',')[0]}</div>
            <div className="hora-envio"><b>Fechamento das 24 Horas:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : (dataHora.split(' ')[1] || dataHora)}</div>
            <div style={{ fontSize: '8px', color: '#334155', marginTop: 2 }}>
              Balanço Hídrico Acumulado:{' '}
              <b style={{ color: '#0369a1' }}>{totais.bh_total_24h || '0 mL'}</b>
            </div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{enf.nome_exibicao || enf.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{enf.coren ? `COREN-PA ${enf.coren}` : (enf.crm ? `COREN-PA ${enf.crm}` : 'COREN-PA')}</div>
            <div className="cargo-sig">Enfermeiro(a) de Plantão — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema">
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>Balanço Hídrico 24 Horas — Folha Única (Paisagem) — Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}
