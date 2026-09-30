import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoEvolucaoSaeOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  return (
    <div className="sae-page">
      <CabecalhoPadraoUPA
        titulo="EVOLUÇÃO DO ENFERMEIRO"
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
          {/* Somente dados registrados — nada de texto clínico padrão. */}
          <div className="sae-secao">
            <div className="sae-secao-header">1. Sinais Vitais do Turno</div>
            <div className="sae-secao-body">{registro.objetivo || '—'}</div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">2. Evolução Clínica do Enfermeiro (SOAP / Descritiva)</div>
            <div className="sae-secao-body" style={{ whiteSpace: 'pre-wrap', minHeight: '40mm' }}>{registro.texto || ''}</div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">3. Diagnósticos de Enfermagem (NANDA-I)</div>
            <div className="sae-secao-body">
              {(registro.diagnosticos_nanda || []).length > 0
                ? registro.diagnosticos_nanda.map((d, i) => <div key={i}>{i + 1}. {d}</div>)
                : '—'}
            </div>
          </div>

          <div className="sae-secao">
            <div className="sae-secao-header">4. Prescrição de Enfermagem e Cuidados (NIC)</div>
            <div className="sae-secao-body">
              {(registro.prescricao_nic || []).length > 0
                ? registro.prescricao_nic.map((d, i) => <div key={i}>{i + 1}. {d}</div>)
                : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="doc-rodape-container">
        <div className="doc-rodape-externo">
          <div className="doc-bloco-datahora">
            <div className="cidade-data">Breves/PA, {new Date(registro?.data_registro || registro?.criado_em || Date.now()).toLocaleDateString('pt-BR')}</div>
            <div className="hora-envio"><b>Horário da Evolução:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura">
            <div className="linha-sig" />
            <div className="nome-sig">{enf.nome_exibicao || enf.nome || 'Enfermeiro(a) Responsável'}</div>
            <div className="coren-sig">{enf.coren ? `COREN-${enf.conselho_uf || 'PA'} ${enf.coren}` : (enf.crm ? `COREN-${enf.conselho_uf || 'PA'} ${enf.crm}` : 'COREN-PA')}</div>
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
