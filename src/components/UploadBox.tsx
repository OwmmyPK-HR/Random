import { useRef, useState } from 'react'

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
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
        dragOver ? 'border-tu-maroon bg-tu-maroon/5' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
      }`}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-slate-400">
        <path
          d="M12 16V4m0 0L7 9m5-5l5 5M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-sm font-medium text-slate-700">{label ?? 'ลากไฟล์ Excel มาวาง หรือคลิกเพื่อเลือกไฟล์'}</p>
      <p className="text-xs text-slate-400">รองรับไฟล์ .xlsx / .xls</p>
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
