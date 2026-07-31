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
    const { data: passagens } = await supabase.from('passagens').select('*').eq('plantao_id', plantao.id)

    const passagemPorPaciente = {}
    for (const p of passagens ?? []) passagemPorPaciente[p.paciente_id] = p

    const pacientePorLeito = {}
    for (const p of pacientes ?? []) if (p.leito_atual_id) pacientePorLeito[p.leito_atual_id] = p

    setDados({ setores: setores ?? [], leitos: leitos ?? [], pacientePorLeito, passagemPorPaciente })
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

function CardPaciente({ leito, paciente, passagem }) {
  const p = passagem ?? {}
  const linhas = []

  linhas.push(<div className="linha" key="dg"><span className="rotulo">Dg:</span> {paciente.diagnostico || '(sem diagnóstico registrado)'}</div>)

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
  if (p.exames_realizados) linhas.push(<div className="linha" key="er"><span className="rotulo">Ex.real:</span> {p.exames_realizados}</div>)
  if (p.laudo_pendente) linhas.push(<div className="linha" key="lp"><span className="rotulo">Laudo:</span> {p.laudo_pendente}</div>)
  if (p.exames_pendentes) linhas.push(<div className="linha" key="ep"><span className="rotulo">Pend:</span> {p.exames_pendentes}</div>)
  if (p.exame_a_realizar_data || p.exame_a_realizar_local) {
    linhas.push(
      <div className="linha" key="ar">
        <span className="rotulo">A realizar:</span> {p.exame_a_realizar_data || ''} {p.exame_a_realizar_hora || ''} {p.exame_a_realizar_local || ''}
      </div>
    )
  }
  if (p.preparo_exame) linhas.push(<div className="linha" key="prep"><span className="rotulo">Preparo:</span> {p.preparo_exame}</div>)
  if (p.sorologias) {
    linhas.push(
      <div className="linha" key="sorol">
        <span className="rotulo">Sorol:</span> {p.sorologias} ({p.coletado ? 'Col' : 'Pend'})
      </div>
    )
  }
  if (p.hemo_tipo || p.hemo_solicitado || p.hemo_transfundido) {
    linhas.push(
      <div className="linha" key="hemo">
        <span className="rotulo">Hemo:</span> {p.hemo_tipo || ''} Sol:{p.hemo_solicitado ? 'S' : 'N'} Transf:{p.hemo_transfundido ? 'S' : 'N'}{p.hemo_quantidade ? ` (${p.hemo_quantidade})` : ''}
      </div>
    )
  }

  const reg = []
  if (p.regulado !== null && p.regulado !== undefined) reg.push(`Reg:${p.regulado ? 'S' : 'N'}`)
  if (p.leito_liberado_outro_hospital !== null && p.leito_liberado_outro_hospital !== undefined) reg.push(`Lib:${p.leito_liberado_outro_hospital ? 'S' : 'N'}`)
  if (p.alta_sala_vermelha !== null && p.alta_sala_vermelha !== undefined) reg.push(`AltaV:${p.alta_sala_vermelha ? 'S' : 'N'}`)
  if (reg.length) linhas.push(<div className="linha" key="reg">{reg.join(' · ')}</div>)

  if (p.notificacao_agravo) {
    linhas.push(
      <div className="linha" key="notif">
        <span className="rotulo">Notif:</span> {p.notificacao_agravo} — {p.notificacao_status || '—'}
      </div>
    )
  }
  if (p.pendencias) linhas.push(<div className="linha" key="obs"><span className="rotulo">Obs:</span> {p.pendencias}</div>)

  return (
    <div className="print-card">
      <b>Leito {leito.numero} — {paciente.nome} ({paciente.status_internacao === 'Internado' ? 'I' : 'O'})</b>
      {linhas}
    </div>
  )
}
