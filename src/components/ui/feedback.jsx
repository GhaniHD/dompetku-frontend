import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button, Modal } from './index'

const FeedbackContext = createContext(null)

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const toast = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  const confirm = useCallback((options) => {
    setDialog(options)
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (answer) => {
    resolver.current?.(answer)
    setDialog(null)
  }

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <Modal
        open={!!dialog}
        onClose={() => close(false)}
        title={dialog?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              Batal
            </Button>
            <Button variant={dialog?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
              {dialog?.confirmLabel || 'Lanjutkan'}
            </Button>
          </>
        }
      >
        <p className="text-[15px] text-muted">{dialog?.message}</p>
      </Modal>
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
          {toasts.map((t) => (
            <div key={t.id} className="animate-rise pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-ink py-2.5 pl-3.5 pr-5 text-sm font-medium text-canvas shadow-pop">
              {t.tone === 'error' ? <AlertCircle className="size-4 shrink-0 text-expense" /> : <CheckCircle2 className="size-4 shrink-0 text-income" />}
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </FeedbackContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedback = () => useContext(FeedbackContext)
