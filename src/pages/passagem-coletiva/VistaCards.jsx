import { numeroLimpo } from '../../lib/numeros'
import { permanencia, textoAlergia, temAlergia } from './regrasColetiva'
import { BlocoAssistencia, BlocoTransferencia, BlocoPendencias } from './CamposPassagem'

// Vista em grade: um card por leito (assistência, transferência/prontuário e pendências).
export default function VistaCards({ c }) {
  const { pacientesPorLeito, passagemPorPaciente, passagemEditavel, ed, resumos, resumoDisp, onAbrirPassagem, abrirFoco } = c
  const { leitosFiltrados, recolhidos, toggleRecolhido, toggleConferido, conferindoId } = c
  return (
    <div className="beds-container">
      {leitosFiltrados.length === 0 ? (
        <p className="beds-container-vazio">Nenhum leito nesse filtro.</p>
      ) : leitosFiltrados.map((leito) => {
        const paciente = pacientesPorLeito[leito.id]
        const passagem = passagemPorPaciente[paciente.id]
        const conferido = !!passagem?.conferido_em
        const recolhido = recolhidos.has(leito.id)
        const alergia = temAlergia(paciente)
        const perm = permanencia(paciente)
        const pend = ed.pendenciaDe(passagemEditavel(paciente, leito))
        const disp = resumoDisp(passagemEditavel(paciente, leito))

        return (
          <article key={leito.id} className={`bed-card ${conferido ? 'checked' : ''} ${alergia ? 'has-alert' : ''} ${recolhido ? 'collapsed' : ''}`}>
            <div className="bc-header">
              <div className="bc-header-left">
                <button type="button" className="btn-toggle-bed" onClick={() => toggleRecolhido(leito.id)} title="Recolher / Expandir leito">
                  <i className={`ph ${recolhido ? 'ph-caret-right' : 'ph-caret-down'}`} />
                </button>
                <span className="bed-tag">Leito {leito.numero}</span>
                <span className="patient-title" onClick={() => toggleRecolhido(leito.id)} title="Clique para recolher/expandir">{paciente.nome}{paciente.idade ? `, ${paciente.idade}a` : ''}</span>
                {alergia && <span className="tag-alergia"><i className="ph ph-prohibit" /> Alergia{textoAlergia(paciente) ? `: ${textoAlergia(paciente)}` : ''}</span>}
                {(paciente.numero_atendimento || perm) && <span className="patient-meta-text">{[paciente.numero_atendimento && `Reg: ${numeroLimpo(paciente.numero_atendimento)}`, perm && `Permanência: ${perm}`].filter(Boolean).join(' · ')}</span>}
                <span className="patient-hd-text"><strong>HD:</strong> {paciente.diagnostico || passagem?.diagnostico || 'Sem diagnóstico registrado'}</span>
                <div className="collapsed-summary">
                  {disp && <span>• {disp}</span>}
                  {pend.trim() && <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>· Com pendência</span>}
                </div>
              </div>
              <div className="bc-header-right">
                <button type="button" className={`btn-status-toggle ${conferido ? 'active' : ''}`} onClick={() => toggleConferido(passagem)} disabled={!passagem || conferindoId === passagem?.id}>
                  <i className={`ph ${conferido ? 'ph-check' : 'ph-hourglass'}`} /> {conferido ? 'Conferido' : 'A Conferir'}
                </button>
                <button type="button" className="btn-view-patient" onClick={() => abrirFoco(leito.id)}><i className="ph ph-magnifying-glass" /> Detalhes</button>
                <button type="button" className="btn-view-patient" onClick={() => onAbrirPassagem(paciente, leito)}><i className="ph ph-folder-open" /> Prontuário</button>
              </div>
            </div>

            <div className="bc-content bc-content-3">
              <div className="col-block">
                <div className="col-title"><i className="ph ph-first-aid-kit" /> Assistência</div>
                <BlocoAssistencia ps={passagemEditavel(paciente, leito)} ed={ed} />
              </div>
              <div className="col-block">
                <div className="col-title"><i className="ph ph-ambulance" /> Transferência & Prontuário</div>
                <BlocoTransferencia ps={passagemEditavel(paciente, leito)} resumo={resumos[paciente.id]} ed={ed} />
              </div>
              <div className="col-block col-block-pending">
                <div className="col-title"><i className="ph ph-warning-circle" /> Pendências para o Próximo Turno</div>
                <BlocoPendencias ps={passagemEditavel(paciente, leito)} ed={ed} />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
