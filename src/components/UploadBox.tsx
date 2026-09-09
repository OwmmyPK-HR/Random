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
        dragOver ? 'scale-[1.01] border-gold-400 bg-gold-400/5' : 'border-surface-borderLight bg-surface-sunken hover:border-mist-600'
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
          dragOver ? 'bg-gold-400 text-surface-canvas' : 'bg-surface-raised text-mist-500'
        }`}
      >
        <UploadIcon size={20} />
      </div>
      <p className="text-sm font-semibold text-mist-200">{label ?? 'ลากไฟล์ Excel มาวาง หรือคลิกเพื่อเลือกไฟล์'}</p>
      <p className="text-xs text-mist-600">รองรับไฟล์ .xlsx / .xls</p>
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
