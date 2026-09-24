import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoEvolucaoSaeOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
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
