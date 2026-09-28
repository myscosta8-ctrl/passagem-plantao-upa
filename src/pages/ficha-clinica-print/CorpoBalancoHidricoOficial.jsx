import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

const HORAS_DIA = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const HORAS_NOITE = [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6]
const LINHAS_GANHO = ['vo', 'sne', 'sg', 'sf', 'med', 'outros_ganhos']
const LINHAS_PERDA = ['diurese', 'drenos', 'vomitos', 'fezes', 'aspiracao', 'outras_perdas']

function sem(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() }
function linhaGanho(h) {
  const t = sem(`${h.observacao} ${h.via}`)
  if (/glicos|\bsg\b/.test(t)) return 'sg'
  if (/fisiol|\bsf\b|ringer/.test(t)) return 'sf'
  if (/sne|sng|enteral|sonda|gtt/.test(t)) return 'sne'
  if (/medica|dilu/.test(t)) return 'med'
  if (/oral|\bvo\b|dieta|agua|cha|lanche/.test(t)) return 'vo'
  return 'outros_ganhos'
}
function linhaPerda(h) {
  const t = sem(`${h.via} ${h.observacao}`)
  if (/diurese|urin|svd/.test(t)) return 'diurese'
  if (/dreno|sng/.test(t)) return 'drenos'
  if (/vomit|emese/.test(t)) return 'vomitos'
  if (/fez|evacua|diarr/.test(t)) return 'fezes'
  if (/aspira/.test(t)) return 'aspiracao'
  return 'outras_perdas'
}
function montarGrade(historico) {
  const entradas = {}, saidas = {}, totais = {}
  const add = (obj, k, v) => { obj[k] = (obj[k] || 0) + v }
  for (const h of historico) {
    const hora = new Date(h.registrado_em).getHours()
    const v = Number(h.volume_ml || 0)
    const iDia = HORAS_DIA.indexOf(hora), iNoite = HORAS_NOITE.indexOf(hora)
    const sufixo = iDia >= 0 ? `d${iDia}` : `n${iNoite}`
    const periodo = iDia >= 0 ? 'sub_dia' : 'sub_noite'
    const ganho = h.tipo === 'entrada'
    const linha = ganho ? linhaGanho(h) : linhaPerda(h)
    add(ganho ? entradas : saidas, `${linha}_${sufixo}`, v)
    add(totais, `${linha}_${periodo}`, v)
    add(totais, `${linha}_total`, v)
    const grupo = ganho ? 'ganhos' : 'perdas'
    add(totais, `${grupo}_${sufixo}`, v)
    add(totais, `${grupo}_${periodo}`, v)
    add(totais, `${grupo}_total_24h`, v)
    add(totais, `bh_${sufixo}`, ganho ? v : -v)
    add(totais, `bh_${periodo}`, ganho ? v : -v)
    add(totais, 'bh_total_24h', ganho ? v : -v)
  }
  return { entradas, saidas, totais }
}

export default function CorpoBalancoHidricoOficial({ registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const enf = registro.enfermeiros || medico || {}
  const diurnoHoras = ['07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h']
  const noturnoHoras = ['19h', '20h', '21h', '22h', '23h', '00h', '01h', '02h', '03h', '04h', '05h', '06h']
  // A tela envia os lançamentos (registro.historico); aqui eles viram a grade
  // hora a hora do impresso oficial 05.
  const grade = registro.historico ? montarGrade(registro.historico) : null
  const entradas = grade ? grade.entradas : (registro.entradas || {})
  const saidas = grade ? grade.saidas : (registro.saidas || {})
  const totais = grade ? grade.totais : (registro.totais || {})

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
            <div className="cidade-data">Breves/PA, {new Date().toLocaleDateString('pt-BR')}</div>
            <div className="hora-envio"><b>Fechamento das 24 Horas:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : (dataHora.split(' ')[1] || dataHora)}</div>
            <div style={{ fontSize: '10.5px', color: '#334155', marginTop: 2 }}>
              Balanço Hídrico Acumulado:{' '}
              <b style={{ color: '#0369a1' }}>{totais.bh_total_24h != null ? `${totais.bh_total_24h > 0 ? '+' : ''}${totais.bh_total_24h} mL` : '0 mL'}</b>
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
