import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventByCode } from '../data/events'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { UploadBox } from '../components/UploadBox'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ResultBoard } from '../components/ResultBoard'
import { ColorBracketView, UnitBracketView } from '../components/BracketView'
import { downloadSingleTemplate, exportEventResult, parseWorkbookFileForEvent } from '../utils/excel'
import type { RosterEntry } from '../types'

const SHAPE_LABEL: Record<string, string> = {
  individual: 'รายชื่อ 1 คน / บรรทัด',
  pair: 'คู่ (ชื่อคนที่ 1, ชื่อคนที่ 2) / บรรทัด',
  pairMixed: 'คู่ผสม (ชื่อฝ่ายชาย, ชื่อฝ่ายหญิง) / บรรทัด',
  team3: 'ทีม 3 คน (ชื่อทีม: คนที่1, คนที่2, คนที่3) / บรรทัด',
}

const SHAPE_PLACEHOLDER: Record<string, string> = {
  individual: 'สมชาย ใจดี\nสมหญิง รักเรียน',
  pair: 'สมชาย ใจดี, วิชัย มั่นคง\nสมหญิง รักเรียน, มาลี ศรีสุข',
  pairMixed: 'สมชาย ใจดี, มาลี ศรีสุข',
  team3: 'ทีมเทพ: สมชาย ใจดี, วิชัย มั่นคง, ประยุทธ์ แข็งแรง',
}

function parseQuickAdd(shape: string, text: string): RosterEntry[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.map((line) => {
    if (shape === 'team3') {
      const [teamPart, rest] = line.includes(':') ? line.split(/:(.+)/) : [undefined, line]
      const members = (rest ?? '').split(',').map((s) => s.trim()).filter(Boolean)
      return {
        id: crypto.randomUUID(),
        teamName: teamPart?.trim() || undefined,
        name1: members[0] ?? '',
        name2: members[1] ?? '',
        name3: members[2] ?? '',
      }
    }
    if (shape === 'pair' || shape === 'pairMixed') {
      const [a, b] = line.split(',').map((s) => s.trim())
      return { id: crypto.randomUUID(), name1: a ?? '', name2: b ?? '' }
    }
    return { id: crypto.randomUUID(), name1: line }
  })
}

export function EventPage() {
  const { code = '' } = useParams()
  const ev = getEventByCode(code)
  const { getEvent, setRoster, shuffle, resetEvent } = useEventStore()
  const { notify } = useToast()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddText, setQuickAddText] = useState('')
  const [confirmReshuffle, setConfirmReshuffle] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const state = getEvent(code)

  const headline = useMemo(() => {
    if (!ev) return ''
    const parts = [ev.genderLabel === 'ผสม' ? 'ผสม' : ev.genderLabel]
    if (ev.ageLabel) parts.push(ev.ageLabel)
    return parts.join(' · ')
  }, [ev])

  if (!ev) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">ไม่พบประเภทกีฬานี้</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-tu-maroon hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    )
  }

  const handleFile = async (file: File) => {
    try {
      const rows = await parseWorkbookFileForEvent(file, ev)
      if (rows.length === 0) {
        notify('ไม่พบรายชื่อในไฟล์นี้ กรุณาตรวจสอบว่ากรอกข้อมูลในคอลัมน์ที่ถูกต้อง', 'error')
        return
      }
      setRoster(code, rows)
      notify(`นำเข้ารายชื่อสำเร็จ ${rows.length} รายการ`, 'success')
    } catch (err) {
      console.error(err)
      notify('อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบรูปแบบไฟล์ Excel', 'error')
    }
  }

  const handleQuickAdd = () => {
    const rows = parseQuickAdd(ev.entryShape, quickAddText)
    if (rows.length === 0) return
    setRoster(code, [...state.roster, ...rows])
    setQuickAddText('')
    setQuickAddOpen(false)
    notify(`เพิ่มรายชื่อสำเร็จ ${rows.length} รายการ`, 'success')
  }

  const removeEntry = (id: string) => {
    setRoster(code, state.roster.filter((r) => r.id !== id))
  }

  const doShuffle = () => {
    shuffle(code)
    notify('สุ่มแบ่งสีเรียบร้อย', 'success')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/sport/${ev.groupSlug}`} className="text-xs font-medium text-slate-400 hover:text-tu-maroon">
          ← {ev.sportGroup}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900">{ev.name}</h1>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{headline}</span>
          {ev.mode === 'colorTeam' && (
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">แบ่งตามสีทีม</span>
          )}
        </div>
      </div>

      {/* ส่วนนำเข้าข้อมูล */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-slate-900">ข้อมูลนักกีฬา</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadSingleTemplate(ev, state.roster)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ⬇ ดาวน์โหลดฟอร์ม
            </button>
            <button
              onClick={() => setQuickAddOpen((v) => !v)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ✎ พิมพ์รายชื่อเอง
            </button>
            {state.roster.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>
        </div>

        {quickAddOpen && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1.5 text-xs font-medium text-slate-500">{SHAPE_LABEL[ev.entryShape]}</p>
            <textarea
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              placeholder={SHAPE_PLACEHOLDER[ev.entryShape]}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-tu-maroon focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setQuickAddOpen(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500">
                ยกเลิก
              </button>
              <button
                onClick={handleQuickAdd}
                className="rounded-lg bg-tu-maroon px-3 py-1.5 text-xs font-semibold text-white hover:bg-tu-maroon/90"
              >
                เพิ่มรายชื่อ
              </button>
            </div>
          </div>
        )}

        <div className="mt-3">
          <UploadBox onFile={handleFile} />
        </div>

        {state.roster.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">รายชื่อทั้งหมด ({state.roster.length})</p>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 scrollbar-thin">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {state.roster.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="w-10 px-3 py-1.5 text-xs text-slate-400">{i + 1}</td>
                      <td className="px-3 py-1.5">
                        {r.teamName && <span className="font-medium text-slate-800">{r.teamName}: </span>}
                        {[r.name1, r.name2, r.name3].filter(Boolean).join(' - ')}
                      </td>
                      <td className="w-10 px-3 py-1.5 text-right">
                        <button
                          onClick={() => removeEntry(r.id)}
                          className="text-xs text-slate-300 hover:text-rose-500"
                          aria-label="ลบรายการนี้"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ปุ่มสุ่ม */}
      <section className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => (state.result ? setConfirmReshuffle(true) : doShuffle())}
          disabled={state.roster.length === 0}
          className="rounded-xl bg-tu-maroon px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-tu-maroon/90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          🎲 {state.result ? 'สุ่มใหม่' : 'สุ่มแบ่งสี'}
        </button>
        {state.result && (
          <button
            onClick={() => exportEventResult(ev, state)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ⬇ ส่งออกผลเป็น Excel
          </button>
        )}
        {state.shuffledAt && (
          <span className="text-xs text-slate-400">
            สุ่มล่าสุด: {new Date(state.shuffledAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        )}
      </section>

      {/* ผลลัพธ์ */}
      {state.result && (
        <section className="space-y-4">
          <h2 className="font-bold text-slate-900">ผลการแบ่งสี</h2>
          <ResultBoard result={state.result} />
        </section>
      )}

      {state.result && (ev.mode === 'colorTeam' ? state.colorBracket : state.unitBracket) && (
        <section className="space-y-4">
          <h2 className="font-bold text-slate-900">คู่แข่งขันรอบแรก (Seed 1)</h2>
          {ev.mode === 'colorTeam' && state.colorBracket && <ColorBracketView colors={state.colorBracket} />}
          {ev.mode === 'bracket' && state.unitBracket && <UnitBracketView pairs={state.unitBracket} />}
        </section>
      )}

      <ConfirmDialog
        open={confirmReshuffle}
        title="สุ่มแบ่งสีใหม่?"
        message="ผลการแบ่งสีและสายการแข่งขันรอบแรกเดิมจะถูกแทนที่ด้วยผลใหม่ทันที การกระทำนี้ย้อนกลับไม่ได้"
        confirmLabel="สุ่มใหม่"
        danger
        onCancel={() => setConfirmReshuffle(false)}
        onConfirm={() => {
          setConfirmReshuffle(false)
          doShuffle()
        }}
      />
      <ConfirmDialog
        open={confirmClear}
        title="ลบรายชื่อทั้งหมด?"
        message="รายชื่อและผลการสุ่มของประเภทกีฬานี้จะถูกลบทั้งหมด"
        confirmLabel="ลบทั้งหมด"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false)
          setRoster(code, [])
          resetEvent(code)
        }}
      />
    </div>
  )
}
