import { useRef, useState } from 'react'
import { UploadIcon } from './Icons'

export function UploadBox({ onFile, label }: { onFile: (file: File) => void; label?: string }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all ${
        dragOver ? 'scale-[1.01] border-brand-600 bg-brand-50' : 'border-ink-200 bg-ink-50/60 hover:border-ink-300 hover:bg-ink-50'
      }`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${dragOver ? 'bg-brand-600 text-white' : 'bg-white text-ink-400 shadow-soft'}`}>
        <UploadIcon size={20} />
      </div>
      <p className="text-sm font-semibold text-ink-700">{label ?? 'ลากไฟล์ Excel มาวาง หรือคลิกเพื่อเลือกไฟล์'}</p>
      <p className="text-xs text-ink-400">รองรับไฟล์ .xlsx / .xls</p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
