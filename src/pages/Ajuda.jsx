import { useMemo, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { SECOES_AJUDA } from './ajudaConteudo'
import './Ajuda.css'

const semAcento = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Ajuda({ onVoltar }) {
  const { enfermeiro, permissoes } = useAuth()
  const ehAdmin = enfermeiro?.role === 'admin'
  const temGestao = ehAdmin || (permissoes?.length > 0)
  const perfil = enfermeiro?.tipo || 'enfermagem'
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(null)

  const secoes = useMemo(() => {
    const b = semAcento(busca.trim())
    return SECOES_AJUDA
      .filter((s) => s.perfis.includes(perfil) || (ehAdmin && s.perfis.includes('admin')) || (temGestao && s.perfis.includes('gestao')))
      .map((s) => ({ ...s, itens: b ? s.itens.filter((i) => semAcento(`${i.p} ${i.r}`).includes(b)) : s.itens }))
      .filter((s) => s.itens.length)
  }, [busca, perfil, ehAdmin, temGestao])

  return (
    <div className="workspace aj-page">
      <header className="aj-cab">
        <div>
          <h1>Ajuda</h1>
          <p>Como usar o sistema — passo a passo e respostas para as dúvidas mais comuns.</p>
        </div>
        <button type="button" className="aj-btn" onClick={onVoltar}><i className="ph ph-arrow-left" /> Voltar</button>
      </header>

      <label className="aj-busca">
        <i className="ph ph-magnifying-glass" />
        <input type="search" placeholder="Buscar: senha, invalidar, duplicar, realocar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>

      {!busca && (
        <nav className="aj-atalhos">
          {secoes.map((s) => <a key={s.id} href={`#aj-${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`aj-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}><i className={`ph ${s.icone}`} /> {s.titulo}</a>)}
        </nav>
      )}

      {secoes.length === 0 && <p className="aj-vazio">Nada encontrado para "{busca}". Tente outra palavra ou procure o setor administrativo.</p>}

      {secoes.map((s) => (
        <section key={s.id} id={`aj-${s.id}`} className="aj-secao">
          <h2><i className={`ph ${s.icone}`} /> {s.titulo}</h2>
          {s.itens.map((i) => {
            const chave = s.id + i.p
            const on = !!busca || aberto === chave
            return (
              <div key={chave} className={`aj-item ${on ? 'on' : ''}`}>
                <button type="button" className="aj-pergunta" onClick={() => setAberto(aberto === chave ? null : chave)} aria-expanded={on}>
                  <span>{i.p}</span><i className={`ph ph-caret-${on ? 'up' : 'down'}`} />
                </button>
                {on && <p className="aj-resposta">{i.r}</p>}
              </div>
            )
          })}
        </section>
      ))}

      <p className="aj-rodape"><i className="ph ph-chat-circle-dots" /> Não achou o que precisava? Procure o setor administrativo da UPA.</p>
    </div>
  )
}
