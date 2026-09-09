import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircleIcon, CloseIcon, InfoIcon } from '../components/Icons'

interface Toast {
  id: number
  message: string
  kind: 'success' | 'error' | 'info'
}

interface Ctx {
  notify: (message: string, kind?: Toast['kind']) => void
}

const ToastCtx = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, kind: Toast['kind'] = 'info') => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, kind }])
      setTimeout(() => dismiss(id), 3600)
    },
    [dismiss],
  )

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex animate-popIn items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-pop ${
              t.kind === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : t.kind === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-ink-700 bg-ink-800 text-white'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {t.kind === 'success' ? <CheckCircleIcon size={16} /> : t.kind === 'error' ? <InfoIcon size={16} /> : <InfoIcon size={16} />}
            </span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100" aria-label="ปิด">
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
