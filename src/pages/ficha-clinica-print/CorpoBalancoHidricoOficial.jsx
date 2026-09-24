import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

export default function CorpoBalancoHidricoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
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
