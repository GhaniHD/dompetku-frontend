import { createContext, useContext, useState } from 'react'
import TransactionForm from '../forms/TransactionForm'
import TransferForm from '../forms/TransferForm'

const QuickContext = createContext(null)

export function QuickActionsProvider({ children }) {
  const [tx, setTx] = useState(null)
  const [transfer, setTransfer] = useState(null)

  const value = {
    openTransaction: (preset = {}) => setTx(preset),
    openTransfer: (preset = {}) => setTransfer(preset),
  }

  return (
    <QuickContext.Provider value={value}>
      {children}
      <TransactionForm open={!!tx} preset={tx || {}} editId={tx?.editId} onClose={() => setTx(null)} />
      <TransferForm open={!!transfer} preset={transfer || {}} onClose={() => setTransfer(null)} />
    </QuickContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useQuick = () => useContext(QuickContext)
