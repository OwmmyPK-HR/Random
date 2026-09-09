interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  danger,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-5 shadow-pop animate-popIn">
        <h3 className="text-lg font-bold text-mist-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mist-400 whitespace-pre-line">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-mist-400 hover:bg-surface-raised"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 ${
              danger ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-accent text-accent-contrast hover:bg-accent-soft'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
