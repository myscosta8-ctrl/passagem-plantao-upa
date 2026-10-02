import { useRef, useState } from 'react'
import { metaDoc } from '../lib/documentos'

// "Salvar documento" comum dos documentos clínicos (Salvar Rascunho / Finalizar e Imprimir).
// Faz em um só lugar o que cada tela repetia:
// - situação (rascunho/finalizado), data clínica do registro e o formulário guardado no rascunho;
// - "Salvando..." nos botões, e um clique duplo nunca grava duas vezes;
// - rascunho salvo: continua editando o mesmo registro (o próximo "Salvar" atualiza, não cria outro);
// - finalizado: limpa o vínculo com o rascunho e a data do registro.
// A tela informa só o que é dela: como gravar e o que fazer depois (imprimir, limpar, avisar).
export const MSG_RASCUNHO_SALVO = 'Rascunho salvo — pode continuar editando. Após "Finalizar e Imprimir" o documento é finalizado e só poderá ser invalidado.'

export function useSalvarDocumento({ rascunho, dataRegistro, editandoId, setEditandoId, setDataRegistro }) {
  const [salvando, setSalvando] = useState(false)
  const emAndamento = useRef(false)

  // gravar({ id, situacao }) → { data, error }   (id = rascunho em edição, ou null para criar)
  async function salvar(finalizar, gravar, { aoSalvarRascunho, aoFinalizar, aoFalhar } = {}) {
    if (emAndamento.current) return null
    emAndamento.current = true
    setSalvando(true)
    let resultado
    try {
      resultado = await gravar({ id: editandoId, situacao: metaDoc(finalizar, dataRegistro, rascunho?.estado) })
    } catch (e) {
      resultado = { data: null, error: e }
    } finally {
      emAndamento.current = false
      setSalvando(false)
    }
    const { data, error } = resultado || {}
    if (error) { aoFalhar?.(error, data); return resultado }
    if (finalizar) {
      setEditandoId(null)
      setDataRegistro?.('')
      aoFinalizar?.(data)
    } else {
      setEditandoId(data?.id ?? null)
      aoSalvarRascunho?.(data)
    }
    return resultado
  }

  return { salvando, salvar }
}
