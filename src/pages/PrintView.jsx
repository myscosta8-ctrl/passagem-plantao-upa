import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { carregarLeitosOcupadosPep, carregarResumoProntuario } from '../lib/pepAtendimentos'
import './PrintView.css'
import './PassagemImpresso.css'
import { avisarErro } from '../lib/erros'

// Passagem de Plantão de Enfermagem (multi-leitos) — modelo oficial
// modelos_impressao_html/15-passagem-plantao.html. Usado para os dois grupos
// (Sala Vermelha + Internação / Pediátrico + Observação). Além dos campos do
// modelo (HD, curativo, nível de consciência, dispositivos, obs — acompanhante retirado),
// sai tudo o que foi preenchido no formulário lateral da passagem.
const GRUPOS = {
  grupo1: { titulo: 'Sala Vermelha + Internação', setoresNomes: ['Sala Vermelha', 'Internação'] },
  grupo2: { titulo: 'Pediatria + Observação', setoresNomes: ['Pediátrico', 'Observação/Internação'] },
}
const COR_SETOR = { 'Sala Vermelha': 'vermelha', 'Internação': 'internacao', 'Pediátrico': 'pediatrico', 'Observação/Internação': 'observacao' }
const TITULO_SETOR = { 'Sala Vermelha': 'Sala Vermelha — Emergência e Estabilização', 'Internação': 'Internação Adulto — Clínica e Cirúrgica', 'Pediátrico': 'Pediatria', 'Observação/Internação': 'Observação / Internação' }

const sn = (v) => (v === true ? 'S' : v === false ? 'N' : '—')
const dataBR = (d) => (d ? new Date(String(d).length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('pt-BR') : '')
const limpar = (v) => String(v || '').replace(/^(PEP|AT)-?/i, '')

async function carregarDados(plantao, viaHistorico) {
  const [{ data: setores }, { data: leitos }, { data: equipe }, { data: chefe }] = await Promise.all([
    supabase.from('setores').select('*').order('ordem'),
    supabase.from('leitos').select('*'),
    supabase.from('plantao_profissionais').select('profissionais(nome, categoria)').eq('plantao_id', plantao.id),
    plantao.enfermeiro_chefe_id
      ? supabase.from('enfermeiros').select('nome_exibicao, nome, coren').eq('id', plantao.enfermeiro_chefe_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  let linhas = []
  if (viaHistorico) {
    // Plantão já encerrado: o que foi registrado naquele plantão.
    const { data: passagens, error: erroConsulta1 } = await supabase
      .from('passagens')
      .select('*, atendimentos(numero_atendimento, status_internacao, pessoas(nome))')
      .eq('plantao_id', plantao.id)
    if (erroConsulta1) avisarErro('PrintView', erroConsulta1)
    linhas = (passagens ?? []).map((p) => ({
      atendimentoId: p.atendimento_id,
      leitoId: p.leito_id,
      setorId: p.setor_id,
      nome: p.atendimentos?.pessoas?.nome || '',
      tag: p.atendimentos?.status_internacao === 'Em observação' ? 'OBS' : 'INT',
      hd: p.diagnostico || '',
      alergia: null,
      passagem: p,
    }))
  } else {
    const { pacientesPorLeito, passagemPorPaciente } = await carregarLeitosOcupadosPep()
    linhas = Object.entries(pacientesPorLeito).map(([leitoId, pac]) => {
      const leito = (leitos ?? []).find((l) => String(l.id) === String(leitoId))
      return {
        atendimentoId: pac.id,
        leitoId: Number(leitoId),
        setorId: leito?.setor_id,
        nome: pac.nome,
        tag: pac.status_internacao === 'Em observação' ? 'OBS' : 'INT',
        hd: pac.diagnostico || passagemPorPaciente[pac.id]?.diagnostico || '',
        alergia: pac.alergia_substancia || (pac.alergias ? 'Sim' : null),
        passagem: passagemPorPaciente[pac.id] || null,
      }
    })
  }

  const resumos = await carregarResumoProntuario(linhas.map((l) => l.atendimentoId))
  linhas.forEach((l) => { l.prontuario = resumos[l.atendimentoId]?.itens || [] })

  const plantonistas = (equipe ?? []).map((e) => e.profissionais).filter(Boolean).sort((a, b) => a.nome.localeCompare(b.nome))
  return { setores: setores ?? [], leitos: leitos ?? [], linhas, plantonistas, chefe }
}

// Itens do formulário lateral que não têm campo próprio no modelo: saem na
// faixa de observações do leito, cada um com seu rótulo.
function observacoes(p, alergia) {
  const itens = []
  if (alergia) itens.push(['Alergia', alergia])
  if (!p) return itens
  if (p.avp) itens.push(['AVP', [p.avp_data_insercao && `inserido ${dataBR(p.avp_data_insercao)}`, p.avp_hora_insercao].filter(Boolean).join(' ') || 'Sim'])
  if (p.exame_nome || p.exame_status || p.exames_texto) {
    let t = [p.exame_nome, p.exame_status].filter(Boolean).join(' — ')
    if (p.exame_status === 'A realizar' && (p.exame_a_realizar_data || p.exame_a_realizar_local)) t += ` (${[dataBR(p.exame_a_realizar_data), p.exame_a_realizar_hora, p.exame_a_realizar_local].filter(Boolean).join(' ')})`
    if (p.exame_resultado) t += ` — ${p.exame_resultado}`
    if (p.exames_texto) t = [t, p.exames_texto].filter(Boolean).join(' · ')
    itens.push(['Exame', t])
  }
  if (p.laudo_pendente) itens.push(['Laudo', 'pendente'])
  if (p.preparo_exame) itens.push(['Preparo', p.preparo_exame])
  if (p.sorologias || p.sorologia_status) itens.push(['Sorologia', [p.sorologias, p.sorologia_status, p.sorologia_data_coleta && `coleta ${dataBR(p.sorologia_data_coleta)}`].filter(Boolean).join(' — ')])
  if (p.notificacao_agravo || p.notificacao_status) itens.push(['Notificação', [p.notificacao_agravo, p.notificacao_status].filter(Boolean).join(' — ')])
  if (p.hemo_tipo || p.hemo_solicitado || p.hemo_transfundido) {
    itens.push(['Hemo', [p.hemo_tipo, `Sol: ${sn(p.hemo_solicitado)}`, `Transf: ${sn(p.hemo_transfundido)}`, p.hemo_quantidade, p.hemo_data_transfusao && dataBR(p.hemo_data_transfusao)].filter(Boolean).join(' · ')])
  }
  if (p.regulado || p.regulacao_flag) itens.push(['Regulação', [p.regulacao_tipo, p.regulacao_data_cadastro && `cadastro ${dataBR(p.regulacao_data_cadastro)}`].filter(Boolean).join(' — ') || 'Sim'])
  if (p.leito_liberado_outro_hospital) itens.push(['Leito liberado', [p.leito_liberado_hospital, p.leito_liberado_transporte].filter(Boolean).join(' — ') || 'Sim'])
  if (p.alta_sala_vermelha) itens.push(['Alta Sala Vermelha', [dataBR(p.alta_sala_vermelha_data), p.alta_sala_vermelha_hora].filter(Boolean).join(' ') || 'Sim'])
  if (p.cuidados) itens.push(['Cuidados', p.cuidados])
  if (p.intercorrencias) itens.push(['Intercorrências', p.intercorrencias])
  if (p.pendencias) itens.unshift(['Obs', p.pendencias])
  return itens
}

function CartaoLeito({ leito, linha }) {
  const p = linha.passagem || {}
  const disp = [...(Array.isArray(p.dispositivos) ? p.dispositivos : [])]
  const obs = [...observacoes(linha.passagem, linha.alergia), ...(linha.prontuario || []).map((t) => { const i = t.indexOf(': '); return [t.slice(0, i), t.slice(i + 2)] })]
  const curat = p.curativo_realizado === true ? 'S' : p.curativo_realizado === false ? 'N' : '—'
  return (
    <div className="bed-card">
      <div className="bc-top">
        <span className="bc-leito-pill">LEITO {String(leito?.numero ?? '').padStart(2, '0')}</span>
        <span className="bc-paciente-nome" title={linha.nome}>{linha.nome}</span>
        <span className="bc-tag-tipo">{linha.tag}</span>
      </div>
      <div className="bc-line"><span className="bc-label">HD:</span><span className="bc-val hd">{linha.hd || '—'}</span></div>
      <div className="bc-metrics-row">
        <span>Curat: <b>{curat}</b></span>
        <span>NC: <b>{p.nivel_consciencia || '—'}</b></span>
      </div>
      <div className="bc-disp-list">
        <span className="bc-label">Disp:</span>{' '}
        {disp.map((d) => <span key={d} className="disp-pill">{d}</span>)}
        {p.dispositivos_detalhe && <span className="disp-pill">{p.dispositivos_detalhe}</span>}
        {disp.length === 0 && !p.dispositivos_detalhe && '—'}
      </div>
      <div className="bc-obs">
        <b>Obs:</b> {obs.length === 0 ? '—' : obs.map(([r, v], i) => <span key={i}>{r === 'Obs' ? v : <><b>{r}:</b> {v}</>}{i < obs.length - 1 ? '; ' : ''}</span>)}
      </div>
    </div>
  )
}

export default function PrintView({ plantao, grupo, onVoltar, viaHistorico }) {
  const [dados, setDados] = useState(null)
  const [emitidoEm] = useState(() => new Date())

  useEffect(() => { carregarDados(plantao, viaHistorico).then(setDados) }, [plantao?.id, viaHistorico])

  if (!dados) return null

  const config = GRUPOS[grupo]
  const setoresDoGrupo = dados.setores.filter((s) => config.setoresNomes.includes(s.nome))
  const idsSetores = setoresDoGrupo.map((s) => s.id)
  const linhasGrupo = dados.linhas.filter((l) => idsSetores.includes(l.setorId))
  const chefeNome = dados.chefe ? (dados.chefe.nome_exibicao || dados.chefe.nome) : ''
  const hora = emitidoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const autenticacao = `UPA-BREVES-PP-${(plantao.data || '').replaceAll('-', '')}-${hora.replace(':', '')}`

  return (
    <div className="print-page">
      <div className="no-print barra-impressao">
        <button type="button" className="bi-voltar" onClick={onVoltar}><i className="ph ph-arrow-left" /> Voltar</button>
        <button type="button" className="bi-imprimir" onClick={() => window.print()}><i className="ph ph-printer" /> Imprimir / Salvar PDF</button>
      </div>

      {viaHistorico && (
        <div className="no-print" style={{ background: '#F0FDFA', color: '#0F766E', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
          Histórico do plantão de {dataBR(plantao.data)} ({plantao.turno}) — somente consulta e reimpressão. O plantão atual não é alterado.
        </div>
      )}

      <div className="print-area pp-folha">
        <div>
          <div className="pr-topo">
            <div className="pr-topo-texto">
              <div className="nome">PREFEITURA MUNICIPAL DE BREVES — SECRETARIA MUNICIPAL DE SAÚDE (SEMSA)</div>
              <div className="sub">UNIDADE DE PRONTO ATENDIMENTO — UPA 24H BREVES • CNPJ: 02.967.963/0001-11</div>
              <div className="sub">TRAVESSA CASTILHOS FRANÇA, S/N — CENTRO — BREVES/PA — CEP: 68.800-000 — FONE: (91) 3783-1279</div>
            </div>
            <div className="pr-topo-logos">
              <img src="./logos/brasao-breves.jpg" alt="Brasão de Breves" />
              <img src="./logos/semsa.jpg" alt="SEMSA" />
              <img src="./logos/upa24h.jpg" alt="UPA 24h" />
            </div>
          </div>
          <div className="pr-topo-hr" />
          <div className="pr-titulo">Passagem de Plantão de Enfermagem — {config.titulo}</div>

          <table className="shift-meta-grid">
            <tbody>
              <tr>
                <td style={{ width: '20%' }}><b>DATA / HORÁRIO:</b> {dataBR(plantao.data)} — {hora}</td>
                <td style={{ width: '25%' }}><b>TURNO:</b> {plantao.turno || ''}</td>
                <td style={{ width: '30%' }}><b>SETORES:</b> {config.titulo}</td>
                <td style={{ width: '25%' }}><b>CENSO TOTAL:</b> {linhasGrupo.length} leito(s) ocupado(s)</td>
              </tr>
              <tr>
                <td colSpan={2}><b>ENFERMEIRO(A) QUE PASSA:</b> {chefeNome}{dados.chefe?.coren ? ` (COREN/PA ${dados.chefe.coren})` : ''}</td>
                <td colSpan={2}><b>ENFERMEIRO(A) QUE ASSUME:</b> </td>
              </tr>
              {dados.plantonistas.length > 0 && (
                <tr>
                  <td colSpan={4}><b>EQUIPE DO PLANTÃO:</b> {dados.plantonistas.map((p) => p.nome).join(', ')}</td>
                </tr>
              )}
            </tbody>
          </table>

          {setoresDoGrupo.map((setor) => {
            const leitosSetor = dados.leitos.filter((l) => l.setor_id === setor.id && (l.tipo !== 'extra' || linhasGrupo.some((x) => x.leitoId === l.id)))
            const doSetor = linhasGrupo
              .filter((l) => l.setorId === setor.id)
              .map((l) => ({ linha: l, leito: dados.leitos.find((x) => x.id === l.leitoId) }))
              .sort((a, b) => String(a.leito?.numero ?? '').localeCompare(String(b.leito?.numero ?? ''), undefined, { numeric: true }))
            const vagos = Math.max(0, leitosSetor.length - doSetor.length)
            return (
              <div key={setor.id}>
                <div className={`sector-header ${COR_SETOR[setor.nome] || 'internacao'}`}>
                  <span>{TITULO_SETOR[setor.nome] || setor.nome}</span>
                  <span className="sector-badge">{doSetor.length} LEITO(S) OCUPADO(S) / {vagos} VAGO(S)</span>
                </div>
                {doSetor.length === 0 ? (
                  <div className="pp-vazio">Nenhum paciente neste setor.</div>
                ) : (
                  <div className="beds-grid">
                    {doSetor.map(({ linha, leito }) => <CartaoLeito key={`${linha.leitoId}-${linha.nome}`} leito={leito} linha={linha} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="doc-rodape-container">
          <div className="rodape-assinaturas">
            <div className="sig-box">
              <div className="sig-line" />
              <div className="sig-name">{chefeNome || ' '}</div>
              <div className="sig-coren">{dados.chefe?.coren ? `COREN/PA ${dados.chefe.coren} • ` : 'COREN/PA ________ • '}Enfermeiro(a) Plantonista (Passou o Plantão)</div>
            </div>
            <div className="sig-box">
              <div className="sig-line" />
              <div className="sig-name">&nbsp;</div>
              <div className="sig-coren">COREN/PA ________ • Enfermeiro(a) Plantonista (Recebeu o Plantão)</div>
            </div>
          </div>
          <div className="rodape-meta">
            <span>UPA 24h Breves • Passagem de Plantão de Enfermagem (Multi-Leitos)</span>
            <span>Emitido em: {emitidoEm.toLocaleDateString('pt-BR')} às {hora}</span>
            <span>Autenticação: {autenticacao}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
