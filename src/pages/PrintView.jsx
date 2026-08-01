import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './PrintView.css'

const GRUPOS = {
  grupo1: { titulo: 'Sala Vermelha + Internação', setoresNomes: ['Sala Vermelha', 'Internação'] },
  grupo2: { titulo: 'Pediátrico + Observação/Internação', setoresNomes: ['Pediátrico', 'Observação/Internação'] },
}

export default function PrintView({ plantao, grupo, onVoltar }) {
  const [dados, setDados] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data: setores } = await supabase.from('setores').select('*').order('ordem')
    const { data: leitos } = await supabase.from('leitos').select('*').eq('ativo', true)
    const { data: pacientes } = await supabase.from('pacientes').select('*').eq('status', 'internado')
    const idsInternados = (pacientes ?? []).map((p) => p.id)

    let passagens = []
    if (idsInternados.length > 0) {
      const { data } = await supabase
        .from('passagens')
        .select('*')
        .in('paciente_id', idsInternados)
        .order('criado_em', { ascending: false })
      passagens = data ?? []
    }
    const { data: equipe } = await supabase
      .from('plantao_profissionais')
      .select('profissionais(nome, categoria)')
      .eq('plantao_id', plantao.id)

    // mantém só a passagem mais recente de cada paciente (a lista já vem ordenada do mais novo pro mais antigo)
    const passagemPorPaciente = {}
    for (const p of passagens) {
      if (!passagemPorPaciente[p.paciente_id]) passagemPorPaciente[p.paciente_id] = p
    }

    const pacientePorLeito = {}
    for (const p of pacientes ?? []) if (p.leito_atual_id) pacientePorLeito[p.leito_atual_id] = p

    const plantonistas = (equipe ?? [])
      .map((e) => e.profissionais)
      .filter(Boolean)
      .sort((a, b) => a.nome.localeCompare(b.nome))

    setDados({ setores: setores ?? [], leitos: leitos ?? [], pacientePorLeito, passagemPorPaciente, plantonistas })
  }

  if (!dados) return null

  const config = GRUPOS[grupo]
  const setoresDoGrupo = dados.setores.filter((s) => config.setoresNomes.includes(s.nome))

  return (
    <div className="print-page">
      <div className="no-print" style={{ padding: 20, display: 'flex', gap: 10 }}>
        <button className="submit-btn" style={{ maxWidth: 160 }} onClick={onVoltar}>← Voltar</button>
        <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
      </div>

      <div className="print-area">
        <div className="print-header">
          <div className="print-header-logos">
            <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
            <img src="./logos/semsa.jpg" alt="SEMSA" />
            <img src="./logos/upa24h.jpg" alt="UPA 24h" />
          </div>
          <h1>Passagem de Plantão de Enfermagem — {config.titulo}</h1>
          <div className="meta">
            {plantao.turno} — {new Date(plantao.data + 'T00:00:00').toLocaleDateString('pt-BR')}
          </div>
          {dados.plantonistas.length > 0 && (
            <div className="meta">
              Plantonistas: {dados.plantonistas.map((p) => p.nome).join(', ')}
            </div>
          )}
        </div>

        {setoresDoGrupo.map((setor) => {
          const leitosDoSetor = dados.leitos
            .filter((l) => l.setor_id === setor.id && dados.pacientePorLeito[l.id])
            .sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true }))

          return (
            <div key={setor.id}>
              <div className="print-setor-title">{setor.nome}</div>
              {leitosDoSetor.length === 0 ? (
                <div className="print-empty">Nenhum paciente internado neste setor.</div>
              ) : (
                <div className="print-grid">
                  {leitosDoSetor.map((leito) => (
                    <CardPaciente
                      key={leito.id}
                      leito={leito}
                      paciente={dados.pacientePorLeito[leito.id]}
                      passagem={dados.passagemPorPaciente[dados.pacientePorLeito[leito.id].id]}
                      plantaoAtualId={plantao.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CardPaciente({ leito, paciente, passagem, plantaoAtualId }) {
  const p = passagem ?? {}
  const desatualizado = p.plantao_id && p.plantao_id !== plantaoAtualId
  const linhas = []

  linhas.push(<div className="linha" key="dg"><span className="rotulo">HD:</span> {paciente.diagnostico || '(sem diagnóstico registrado)'}</div>)

  if (paciente.alergias) {
    linhas.push(
      <div className="linha" key="alerg">
        <span className="rotulo">Alerg:</span> Sim{paciente.alergias_obs ? ` (${paciente.alergias_obs})` : ''}
      </div>
    )
  }

  const curAvp = []
  if (p.curativo_realizado !== null && p.curativo_realizado !== undefined) curAvp.push(`Curat: ${p.curativo_realizado ? 'S' : 'N'}`)
  if (p.avp !== null && p.avp !== undefined) curAvp.push(`AVP: ${p.avp ? 'S' : 'N'}${p.avp && p.avp_data_insercao ? ` (${p.avp_data_insercao})` : ''}`)
  if (curAvp.length) linhas.push(<div className="linha" key="curavp">{curAvp.join(' · ')}</div>)

  if (p.nivel_consciencia) linhas.push(<div className="linha" key="nc"><span className="rotulo">NC:</span> {p.nivel_consciencia}</div>)
  if (p.acompanhante !== null && p.acompanhante !== undefined) linhas.push(<div className="linha" key="acomp"><span className="rotulo">Acomp:</span> {p.acompanhante ? 'S' : 'N'}</div>)
  if (p.dispositivos?.length) {
    linhas.push(
      <div className="linha" key="disp">
        <span className="rotulo">Disp:</span> {p.dispositivos.join(', ')}{p.dispositivos_detalhe ? ` (${p.dispositivos_detalhe})` : ''}
      </div>
    )
  }

  if (p.exame_nome || p.exame_status) {
    let detalhe = p.exame_status || ''
    if (p.exame_status === 'A realizar' && (p.exame_a_realizar_data || p.exame_a_realizar_local)) {
      detalhe += ` (${p.exame_a_realizar_data || ''} ${p.exame_a_realizar_hora || ''} ${p.exame_a_realizar_local || ''})`
    }
    if (p.exame_resultado) detalhe += ` — ${p.exame_resultado}`
    linhas.push(<div className="linha" key="exame"><span className="rotulo">Exame:</span> {p.exame_nome || ''} {detalhe}</div>)
  }
  if (p.preparo_exame) linhas.push(<div className="linha" key="prep"><span className="rotulo">Preparo:</span> {p.preparo_exame}</div>)

  if (p.sorologias || p.sorologia_status) {
    linhas.push(
      <div className="linha" key="sorol">
        <span className="rotulo">Sorol:</span> {p.sorologias || ''} — {p.sorologia_status || ''}{p.sorologia_data_coleta ? ` (${p.sorologia_data_coleta})` : ''}
      </div>
    )
  }

  if (p.hemo_tipo || p.hemo_solicitado || p.hemo_transfundido) {
    linhas.push(
      <div className="linha" key="hemo">
        <span className="rotulo">Hemo:</span> {p.hemo_tipo || ''} Sol:{p.hemo_solicitado ? 'S' : 'N'} Transf:{p.hemo_transfundido ? 'S' : 'N'}{p.hemo_data_transfusao ? ` (${p.hemo_data_transfusao})` : ''}{p.hemo_quantidade ? ` — ${p.hemo_quantidade}` : ''}
      </div>
    )
  }

  if (p.leito_liberado_outro_hospital) {
    linhas.push(
      <div className="linha" key="lib">
        <span className="rotulo">Leito liberado:</span> {p.leito_liberado_hospital || '—'}{p.leito_liberado_transporte ? ` (${p.leito_liberado_transporte})` : ''}
      </div>
    )
  }
  if (p.alta_sala_vermelha) {
    linhas.push(
      <div className="linha" key="altaV">
        <span className="rotulo">Alta Vermelha:</span> {p.alta_sala_vermelha_data || ''} {p.alta_sala_vermelha_hora || ''}
      </div>
    )
  }

  if (p.pendencias) linhas.push(<div className="linha" key="obs"><span className="rotulo">Obs:</span> {p.pendencias}</div>)

  return (
    <div className="print-card">
      <b>Leito {leito.numero} — {paciente.nome} ({paciente.status_internacao === 'Internado' ? 'INT' : 'OBS'})</b>
      {desatualizado && <div className="linha aviso-desatualizado">⚠ Não revisado neste plantão — dado do plantão anterior</div>}
      {linhas}
    </div>
  )
}
