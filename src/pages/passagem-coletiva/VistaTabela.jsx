import { textoAlergia, temAlergia } from './regrasColetiva'

// Vista em tabela: todos os leitos do setor (vagos aparecem no filtro "Todos"). Clicar abre o detalhe.
export default function VistaTabela({ c }) {
  const { leitosDoSetor, leitosFiltrados, filtro, pacientesPorLeito, passagemPorPaciente, passagemEditavel, ed, resumoDisp, abrirFoco } = c
  return (
    <div className="table-view-container">
      <table className="table-matrix">
        <thead>
          <tr>
            <th style={{ width: 75 }}>Leito</th>
            <th style={{ width: 210 }}>Paciente</th>
            <th style={{ width: 180 }}>HD Principal</th>
            <th style={{ width: 200 }}>Dispositivos</th>
            <th>Pendências</th>
            <th style={{ width: 100, textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {leitosDoSetor.map((leito) => {
            const paciente = pacientesPorLeito[leito.id]
            if (!paciente) {
              return filtro === 'todos' ? (
                <tr key={leito.id} className="vago">
                  <td><strong>Leito {leito.numero}</strong></td>
                  <td colSpan={4}><span style={{ color: 'var(--text-muted)' }}>[ Leito vago ]</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>Vago</span></td>
                </tr>
              ) : null
            }
            if (!leitosFiltrados.includes(leito)) return null
            const ps = passagemPorPaciente[paciente.id]
            const pe = passagemEditavel(paciente, leito) // inclui o que foi digitado e ainda não salvo
            const ok = !!ps?.conferido_em
            return (
              <tr key={leito.id} className={ok ? 'checked' : ''} onClick={() => abrirFoco(leito.id)} style={{ cursor: 'pointer' }}>
                <td><strong>Leito {leito.numero}</strong></td>
                <td><strong>{paciente.nome}</strong>{paciente.idade ? `, ${paciente.idade}a` : ''} {temAlergia(paciente) && <span className="tag-alergia" style={{ fontSize: 'var(--fs-xs)' }}>{textoAlergia(paciente) || 'Alergia'}</span>}</td>
                <td>{paciente.diagnostico || ps?.diagnostico || '—'}</td>
                <td>{resumoDisp(pe) || '—'}</td>
                <td>{ed.pendenciaDe(pe) || '—'}</td>
                <td style={{ textAlign: 'center' }}>
                  {ok ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Conferido</span> : <span style={{ color: 'var(--warning-amber)', fontWeight: 700 }}>⏳ A Conferir</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
