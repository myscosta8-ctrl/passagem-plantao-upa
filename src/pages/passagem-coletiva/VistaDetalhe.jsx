import { temAlergia, textoAlergia } from './regrasColetiva'
import { BlocoAssistencia, BlocoTransferencia, BlocoPendencias } from './CamposPassagem'

// Vista de detalhe: lista de leitos à esquerda e o paciente escolhido à direita.
export default function VistaDetalhe({ c }) {
  const { leitosFiltrados, leitoFoco, setFocoLeitoId, setorAtivo, pacientesPorLeito, passagemPorPaciente, passagemEditavel, ed, resumos, onAbrirPassagem } = c
  return (
    <div className="focus-view-container">
      <div className="focus-selector-sidebar">
        <div className="focus-selector-title">Leitos do Setor</div>
        {leitosFiltrados.map((l) => {
          const p = pacientesPorLeito[l.id]
          return (
            <div key={l.id} className={`focus-bed-item ${leitoFoco?.id === l.id ? 'active' : ''}`} onClick={() => setFocoLeitoId(l.id)}>
              <strong>Leito {l.numero}</strong>
              <span>{p.nome}{p.idade ? ` (${p.idade}a)` : ''}</span>
            </div>
          )
        })}
        {leitosFiltrados.length === 0 && <p className="beds-container-vazio">Nenhum leito nesse filtro.</p>}
      </div>

      {leitoFoco ? (() => {
        const p = pacientesPorLeito[leitoFoco.id]
        const ps = passagemPorPaciente[p.id]
        return (
          <div className="focus-detail-pane">
            <div className="fd-head">
              <div>
                <h3>{String(p.nome).toUpperCase()}{p.idade ? ` — ${p.idade} anos` : ''}</h3>
                <p>
                  <strong>Leito {leitoFoco.numero} — {setorAtivo?.nome}</strong>
                  {p.data_admissao && <> · Admissão: {new Date(p.data_admissao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>}
                  {(p.diagnostico || ps?.diagnostico) && <> · Diagnóstico: {p.diagnostico || ps.diagnostico}</>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn-compact-tool" onClick={() => onAbrirPassagem(p, leitoFoco)}><i className="ph ph-folder-open" /> Abrir Prontuário</button>
              </div>
            </div>

            {temAlergia(p) && (
              <div className="tag-alergia" style={{ padding: '6px 10px', fontSize: 'var(--fs-xs)', width: 'fit-content' }}>
                <i className="ph ph-warning-circle" /> Alergia{textoAlergia(p) ? `: ${textoAlergia(p)}` : ''} cadastrada no prontuário.
              </div>
            )}

            <div className="fd-grid">
              <div className="fd-box">
                <h4><i className="ph ph-first-aid-kit" /> Assistência & Transferência</h4>
                <BlocoAssistencia ps={passagemEditavel(p, leitoFoco)} ed={ed} />
                <div style={{ marginTop: 10 }}><BlocoTransferencia ps={passagemEditavel(p, leitoFoco)} resumo={resumos[p.id]} ed={ed} /></div>
              </div>
              <div className="fd-box">
                <h4><i className="ph ph-clock-counter-clockwise" /> Última Passagem</h4>
                {ps ? (
                  <p>
                    {ps.enfermeiros && <>Registrada por {ps.enfermeiros.nome_exibicao || ps.enfermeiros.nome} em {new Date(ps.atualizado_em || ps.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}.<br /></>}
                    {ps.nivel_consciencia && <>Consciência: {ps.nivel_consciencia}<br /></>}
                    {ps.intercorrencias && <>Intercorrências: {ps.intercorrencias}</>}
                  </p>
                ) : <p className="col-vazio">Nenhuma passagem registrada.</p>}
              </div>
            </div>

            <div className="fd-box fd-pend">
              <h4><i className="ph ph-list-checks" /> Pendências para o Próximo Turno</h4>
              <BlocoPendencias ps={passagemEditavel(p, leitoFoco)} ed={ed} />
            </div>
          </div>
        )
      })() : <div className="focus-detail-pane"><p className="col-vazio">Nenhum paciente neste setor.</p></div>}
    </div>
  )
}
