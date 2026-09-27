import { createContext, useContext } from 'react'
import { usePainelState } from './usePainelState'

export const PainelContext = createContext(null)

export function PainelProvider({ children }) {
  const state = usePainelState()
  return (
    <PainelContext.Provider value={state}>
      {children}
    </PainelContext.Provider>
  )
}

export function usePainel() {
  const context = useContext(PainelContext)
  if (!context) {
    throw new Error('usePainel must be used within a PainelProvider')
  }
  return context
}
