import { useEffect, useRef } from 'react'
import { buscarRascunho, descartarRascunho } from '../lib/documentos'
import { retirarCopia } from '../lib/duplicarPendente'

// Rascunho de documento clínico ("Salvar Rascunho"):
// - ao abrir a aba, reabre o último rascunho do próprio profissional neste
//   atendimento (formulário restaurado exatamente como foi salvo);
// - "Cancelar" antes da finalização descarta o rascunho em definitivo.
// `campos` = { nome: [valor, setValor] } — o que é salvo e restaurado.
// - "Duplicar" no Histórico Clínico: a aba abre com a cópia do documento escolhido, como
//   documento novo (o rascunho que existir continua guardado). `onCopiado(mensagem)` avisa.
export function useRascunho({ tabela, atendimentoId, autorId, campos, editandoId, setEditandoId, setDataRegistro, onReaberto, onCopiado, filtro = null }) {
  const camposRef = useRef(campos)
  camposRef.current = campos
  const onReabertoRef = useRef(onReaberto)
  onReabertoRef.current = onReaberto
  const onCopiadoRef = useRef(onCopiado)
  onCopiadoRef.current = onCopiado

  useEffect(() => {
    let vivo = true
    const copia = atendimentoId && autorId ? retirarCopia(tabela, filtro) : null
    if (copia) {
      // Objeto (ex.: `dados`) entra por cima do que a tela já tem; o resto substitui.
      for (const [nome, par] of Object.entries(camposRef.current)) {
        if (!(nome in copia.estado)) continue
        const v = copia.estado[nome]
        const ehObj = (x) => x && typeof x === 'object' && !Array.isArray(x)
        par[1]((prev) => (ehObj(v) && ehObj(prev) ? { ...prev, ...v } : v))
      }
      setEditandoId(null)
      onCopiadoRef.current?.(copia.mensagem)
      return () => { vivo = false }
    }
    buscarRascunho(tabela, atendimentoId, autorId, filtro).then((r) => {
      if (!vivo || !r) return
      const estado = r.rascunho_estado || {}
      for (const [nome, par] of Object.entries(camposRef.current)) {
        if (nome in estado) par[1](estado[nome])
      }
      setEditandoId(r.id)
      if (r.data_registro && Math.abs(new Date(r.data_registro) - new Date(r.criado_em)) > 60000) {
        const d = new Date(r.data_registro)
        setDataRegistro?.(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
      }
      onReabertoRef.current?.(r)
    })
    return () => { vivo = false }
  }, [tabela, atendimentoId, autorId, JSON.stringify(filtro)]) // eslint-disable-line react-hooks/exhaustive-deps

  const estado = Object.fromEntries(Object.entries(campos).map(([nome, par]) => [nome, par[0]]))

  async function cancelar(fechar) {
    if (editandoId) {
      const ok = window.confirm('Cancelar descarta este rascunho em definitivo. Deseja continuar?')
      if (!ok) return
      const { error } = await descartarRascunho(tabela, editandoId)
      if (error) { console.error('Erro ao descartar rascunho:', error); return }
      setEditandoId(null)
      setDataRegistro?.('')
    }
    fechar?.()
  }

  return { estado, cancelar }
}
