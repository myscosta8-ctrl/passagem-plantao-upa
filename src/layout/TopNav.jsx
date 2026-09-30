import { useEffect, useState } from 'react'
import { lerTemaSalvo, alternarTema } from '../lib/theme'
import './TopNav.css'

// Menu superior da nova interface (liberada por pessoa via enfermeiros.pep_beta).
// Mesmo conteúdo do menu lateral, numa faixa fina no topo: sobra a tela toda para o trabalho.
function iniciais(nome) {
  const p = String(nome || '?').trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase()
}

export default function TopNav({ itens, telaAtual, onNavegar, enfermeiro, isAdmin, plantao, podeEncerrar, onEncerrarPlantao, encerrando, onLogout, extrasConta = [] }) {
  const [menuConta, setMenuConta] = useState(false)
  const [tema, setTema] = useState(lerTemaSalvo)
  const [hora, setHora] = useState('')
  useEffect(() => {
    const f = () => setHora(new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))
    f(); const t = setInterval(f, 30000); return () => clearInterval(t)
  }, [])
  const nome = enfermeiro?.nome_exibicao || enfermeiro?.nome || 'Profissional'
  const ir = (t) => { setMenuConta(false); onNavegar(t) }
  return (
    <header className="tn no-print">
      <div className="tn-marca"><span className="tn-logo"><i className="ph ph-arrows-left-right" /></span><span>UPA Breves</span></div>
      <nav className="tn-nav" aria-label="Menu principal">
        {itens.map((it) => (
          <button key={it.tela} type="button" className={`tn-item ${telaAtual === it.tela ? 'on' : ''}`} onClick={() => ir(it.tela)}>
            <i className={`ph ${it.icone}`} /> <span>{it.rotulo}</span>
            {it.contador > 0 && <em>{it.contador}</em>}
          </button>
        ))}
      </nav>
      <span className="tn-hora">{plantao?.turno ? `Plantão ${String(plantao.turno).toLowerCase()} · ` : ''}{hora}</span>
      <div className="tn-conta">
        <button type="button" className="tn-av" onClick={() => setMenuConta((v) => !v)} aria-label={`Conta de ${nome}`} aria-expanded={menuConta}>{iniciais(nome)}</button>
        {menuConta && (
          <>
            <div className="tn-fundo" onClick={() => setMenuConta(false)} />
            <div className="tn-menu" role="menu">
              <div className="tn-menu-nome"><b>{nome}</b><span>{isAdmin ? 'Administrador geral' : (enfermeiro?.tipo || '')}</span></div>
              {extrasConta.map((it) => (
                <button key={it.tela} type="button" onClick={() => ir(it.tela)}><i className={`ph ${it.icone}`} /> {it.rotulo}</button>
              ))}
              <button type="button" onClick={() => ir('conta')}><i className="ph ph-user-circle" /> Minha conta</button>
              <button type="button" onClick={() => ir('ajuda')}><i className="ph ph-question" /> Ajuda</button>
              <button type="button" onClick={() => setTema(alternarTema())}><i className={`ph ${tema === 'escuro' ? 'ph-moon' : 'ph-sun'}`} /> {tema === 'escuro' ? 'Tema escuro' : 'Tema claro'}</button>
              {podeEncerrar && <button type="button" onClick={() => { setMenuConta(false); onEncerrarPlantao?.() }} disabled={encerrando}><i className="ph ph-sign-out" /> {encerrando ? 'Encerrando...' : 'Encerrar plantão'}</button>}
              <button type="button" className="tn-sair" onClick={onLogout}><i className="ph ph-power" /> Sair</button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
