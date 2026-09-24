import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

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

export default function CorpoAtmOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
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
