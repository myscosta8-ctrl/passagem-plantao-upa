import { useEffect, useState } from 'react'
import { listarModelosEvolucao, salvarModeloPessoal, desativarModelo, aplicarModelo } from '../lib/modelosEvolucao'
import './ModelosEvolucao.css'

const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const bate = (texto, busca) => norm(busca).split(/\s+/).filter(Boolean).every((p) => norm(texto).includes(p))

// Botão "Modelos" da aba de Evolução: abre, dentro da própria aba, a lista de modelos prontos
// (da unidade e os seus). Escolher um preenche os campos; se já houver texto, pergunta se
// substitui ou acrescenta. O texto continua editável antes de salvar.
// campos = [{ chave, rotulo }]; valores = { chave: texto atual }; onAplicar(novosValores).
export default function ModelosEvolucao({ categoria, campos, valores, onAplicar, autorId }) {
  const [aberto, setAberto] = useState(false)
  const [modelos, setModelos] = useState(null)
  const [busca, setBusca] = useState('')
  const [escolhido, setEscolhido] = useState(null)
  const [salvarComo, setSalvarComo] = useState(null) // título em edição
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (aberto && modelos === null) listarModelosEvolucao(categoria).then(setModelos)
  }, [aberto, modelos, categoria])

  const temTexto = campos.some((c) => String(valores[c.chave] || '').trim())
  const temCampoNoModelo = (m) => campos.some((c) => String(m.campos?.[c.chave] || '').trim())

  function usar(m, modo) {
    onAplicar(aplicarModelo(valores, m.campos, modo))
    setEscolhido(null); setAberto(false); setBusca('')
  }

  function escolher(m) {
    if (!temTexto) usar(m, 'substituir')
    else setEscolhido(m)
  }

  async function salvarMeu() {
    const titulo = (salvarComo || '').trim()
    if (!titulo) { setMsg('Dê um nome ao modelo.'); return }
    const camposModelo = Object.fromEntries(campos.map((c) => [c.chave, String(valores[c.chave] || '').trim()]).filter(([, v]) => v))
    const { data, error } = await salvarModeloPessoal({ categoria, titulo, campos: camposModelo })
    if (error) { setMsg('Não foi possível salvar o modelo. Tente de novo.'); return }
    setModelos((l) => [...(l || []), data]); setSalvarComo(null); setMsg(`Modelo "${titulo}" salvo em Meus modelos.`)
  }

  async function excluir(m) {
    const { error } = await desativarModelo(m.id)
    if (error) { setMsg('Não foi possível excluir o modelo.'); return }
    setModelos((l) => l.filter((x) => x.id !== m.id))
  }

  const visiveis = (modelos || []).filter((m) => temCampoNoModelo(m) && bate(`${m.titulo} ${Object.values(m.campos || {}).join(' ')}`, busca))
  const grupos = [
    { titulo: 'Da unidade', itens: visiveis.filter((m) => m.escopo === 'unidade') },
    { titulo: 'Meus modelos', itens: visiveis.filter((m) => m.escopo === 'pessoal') },
  ]

  return (
    <div className={'mev' + (aberto ? ' aberto' : '')}>
      <button type="button" className={'mev-botao' + (aberto ? ' on' : '')} aria-expanded={aberto} onClick={() => { setAberto((a) => !a); setEscolhido(null); setMsg('') }}>
        <i className="ph ph-file-text" /> Modelos <i className={'ph ' + (aberto ? 'ph-caret-up' : 'ph-caret-down')} />
      </button>
      {aberto && (
        <div className="mev-painel" role="dialog" aria-label="Modelos de evolução">
          {escolhido ? (
            <div className="mev-confirma">
              <div>Já há texto escrito. O que fazer com o modelo <strong>{escolhido.titulo}</strong>?</div>
              <div className="mev-acoes">
                <button type="button" className="btn-save-print" onClick={() => usar(escolhido, 'acrescentar')}>Acrescentar ao final</button>
                <button type="button" className="btn-save-draft" onClick={() => usar(escolhido, 'substituir')}>Substituir o texto</button>
                <button type="button" className="btn-cancel" onClick={() => setEscolhido(null)}>Voltar</button>
              </div>
            </div>
          ) : (
            <>
              <div className="mev-busca">
                <i className="ph ph-magnifying-glass" />
                <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar modelo" aria-label="Buscar modelo" autoFocus />
              </div>
              {modelos === null ? <div className="mev-vazio">Carregando...</div> : grupos.map((g) => (
                <div key={g.titulo} className="mev-grupo">
                  <div className="mev-grupo-titulo">{g.titulo}</div>
                  {g.itens.length === 0 ? (
                    <div className="mev-vazio">{g.titulo === 'Meus modelos' ? 'Nenhum ainda. Escreva o texto e use "Salvar o texto atual como meu modelo".' : 'Nenhum modelo encontrado.'}</div>
                  ) : g.itens.map((m) => (
                    <div key={m.id} className="mev-item">
                      <button type="button" className="mev-usar" onClick={() => escolher(m)} title={campos.map((c) => m.campos?.[c.chave]).filter(Boolean).join('\n\n')}>
                        <span className="mev-titulo">{m.titulo}</span>
                        <span className="mev-previa">{campos.map((c) => m.campos?.[c.chave]).filter(Boolean).join(' · ').slice(0, 140)}</span>
                      </button>
                      {m.escopo === 'pessoal' && m.autor_auth === autorId && (
                        <button type="button" className="mev-excluir" onClick={() => excluir(m)} title="Excluir este modelo" aria-label={`Excluir modelo ${m.titulo}`}><i className="ph ph-trash" /></button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div className="mev-rodape">
                {salvarComo === null ? (
                  <button type="button" className="mev-link" disabled={!temTexto} onClick={() => { setSalvarComo(''); setMsg('') }} title={temTexto ? '' : 'Escreva a evolução primeiro'}>
                    <i className="ph ph-floppy-disk" /> Salvar o texto atual como meu modelo
                  </button>
                ) : (
                  <div className="mev-salvar">
                    <input type="text" value={salvarComo} onChange={(e) => setSalvarComo(e.target.value)} placeholder="Nome do modelo (ex.: Pós-op ortopedia)" maxLength={80} autoFocus />
                    <button type="button" className="btn-save-print" onClick={salvarMeu}>Salvar</button>
                    <button type="button" className="btn-cancel" onClick={() => setSalvarComo(null)}>Cancelar</button>
                  </div>
                )}
                {msg && <div className="mev-msg">{msg}</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
