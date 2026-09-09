import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventByCode } from '../data/events'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { UploadBox } from '../components/UploadBox'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ResultBoard } from '../components/ResultBoard'
import { ColorBracketView, UnitBracketView } from '../components/BracketView'
import { ColorDot } from '../components/ColorBadge'
import { DrawAnimation } from '../components/DrawAnimation'
import { downloadSingleTemplate, exportEventResult, parseWorkbookFileForEvent } from '../utils/excel'
import { groupRosterByColor } from '../utils/shuffle'
import { COLORS, COLOR_THEME, type ColorName, type RosterEntry } from '../types'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DiceIcon,
  DownloadIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
} from '../components/Icons'

const SHAPE_LABEL: Record<string, string> = {
  individual: 'ชื่อ 1 คน / บรรทัด',
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

function parseQuickAdd(shape: string, text: string, color: ColorName): RosterEntry[] {
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
        color,
        teamName: teamPart?.trim() || undefined,
        name1: members[0] ?? '',
        name2: members[1] ?? '',
        name3: members[2] ?? '',
      }
    }
    if (shape === 'pair' || shape === 'pairMixed') {
      const [a, b] = line.split(',').map((s) => s.trim())
      return { id: crypto.randomUUID(), color, name1: a ?? '', name2: b ?? '' }
    }
    return { id: crypto.randomUUID(), color, name1: line }
  })
}

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
        done ? 'bg-team-green text-white' : active ? 'bg-gold-400 text-surface-canvas' : 'bg-surface-raised text-mist-600'
      }`}
    >
      {done ? <CheckCircleIcon size={15} /> : n}
    </span>
  )
}

export function EventPage() {
  const { code = '' } = useParams()
  const ev = getEventByCode(code)
  const { getEvent, setRoster, addEntries, removeEntry, drawBracket, resetEvent } = useEventStore()
  const { notify } = useToast()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [activeColor, setActiveColor] = useState<ColorName>('ฟ้า')
  const [quickAddText, setQuickAddText] = useState<Record<ColorName, string>>({ ฟ้า: '', ม่วง: '', ชมพู: '', เขียว: '' })
  const [confirmRedraw, setConfirmRedraw] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  const state = getEvent(code)

  const headline = useMemo(() => {
    if (!ev) return ''
    const parts = [ev.genderLabel === 'ผสม' ? 'ผสม' : ev.genderLabel]
    if (ev.ageLabel) parts.push(ev.ageLabel)
    return parts.join(' · ')
  }, [ev])

  // เตรียมค่าที่แอนิเมชันสุ่มจะ "หยุด" ลง — คำนวณจากผลจริงที่ drawBracket() บันทึกไว้แล้ว
  const finalSlots = useMemo(() => {
    if (!ev) return undefined
    if (ev.mode === 'colorTeam' && state.colorBracket) {
      const [c0, c1] = state.colorBracket
      return { a: { label: `สี${c0}`, color: c0 }, b: { label: `สี${c1}`, color: c1 } }
    }
    if (ev.mode === 'bracket' && state.unitBracket?.[0]) {
      const p = state.unitBracket[0]
      return { a: p.a, b: p.b }
    }
    return undefined
  }, [ev, state.colorBracket, state.unitBracket])

  if (!ev) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 text-center">
        <p className="text-mist-400">ไม่พบประเภทกีฬานี้</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-gold-400 hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    )
  }

  const hasData = state.roster.length > 0
  const hasBracket = !!(state.colorBracket || state.unitBracket)
  const grouped = groupRosterByColor(state.roster)

  const handleFile = async (file: File) => {
    try {
      const rows = await parseWorkbookFileForEvent(file, ev)
      if (rows.length === 0) {
        notify('ไม่พบรายชื่อในไฟล์นี้ กรุณาตรวจสอบว่ากรอกข้อมูลในคอลัมน์สีที่ถูกต้อง', 'error')
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
    const rows = parseQuickAdd(ev.entryShape, quickAddText[activeColor], activeColor)
    if (rows.length === 0) return
    addEntries(code, rows)
    setQuickAddText((prev) => ({ ...prev, [activeColor]: '' }))
    notify(`เพิ่มรายชื่อเข้าสี${activeColor}สำเร็จ ${rows.length} รายการ`, 'success')
  }

  const doDraw = () => {
    drawBracket(code) // คำนวณผลจริงทันที เก็บไว้เงียบ ๆ ก่อน — แอนิเมชันด้านล่างจะค่อย ๆ เผยผลนี้
    setIsDrawing(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/sport/${ev.groupSlug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-mist-500 hover:text-gold-400">
          <ArrowLeftIcon size={13} /> {ev.sportGroup}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold text-mist-100">{ev.name}</h1>
          <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-semibold text-mist-400">{headline}</span>
          {ev.mode === 'colorTeam' && (
            <span className="rounded-full bg-team-blue/15 px-2.5 py-0.5 text-xs font-semibold text-team-blue-soft">แบ่งตามสีทีม</span>
          )}
        </div>
      </div>

      {/* STEP TRACKER */}
      <div className="flex items-center gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 shadow-soft">
        <StepBadge n={1} active={!hasData} done={hasData} />
        <span className={`text-xs font-semibold ${hasData ? 'text-mist-300' : 'text-mist-100'}`}>รายชื่อนักกีฬา (แยกตามสี)</span>
        <div className={`mx-1 h-0.5 flex-1 rounded ${hasData ? 'bg-team-green/60' : 'bg-surface-raised'}`} />
        <StepBadge n={2} active={hasData && !hasBracket} done={hasBracket} />
        <span className={`text-xs font-semibold ${hasBracket ? 'text-mist-100' : hasData ? 'text-mist-100' : 'text-mist-700'}`}>
          สุ่มจับคู่แข่งขันรอบแรก (Seed 1)
        </span>
      </div>

      {/* ส่วนนำเข้าข้อมูล */}
      <section className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-mist-100">รายชื่อนักกีฬา</h2>
            <p className="text-xs text-mist-500">แต่ละสีมีนักกีฬา/ทีมของตัวเองอยู่แล้ว — กรอกชื่อแยกตามสีที่ถูกต้อง</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadSingleTemplate(ev, state.roster)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-borderLight px-3 py-1.5 text-xs font-semibold text-mist-300 hover:bg-surface-raised"
            >
              <DownloadIcon size={13} /> ดาวน์โหลดฟอร์ม
            </button>
            <button
              onClick={() => setQuickAddOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-borderLight px-3 py-1.5 text-xs font-semibold text-mist-300 hover:bg-surface-raised"
            >
              <PencilIcon size={13} /> พิมพ์รายชื่อเอง
            </button>
            {state.roster.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-900/60 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                <TrashIcon size={13} /> ลบทั้งหมด
              </button>
            )}
          </div>
        </div>

        {quickAddOpen && (
          <div className="mt-3 rounded-xl border border-surface-border bg-surface-sunken p-3">
            <p className="mb-2 text-xs font-semibold text-mist-400">เลือกสีที่จะเพิ่มรายชื่อ</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {COLORS.map((c) => {
                const theme = COLOR_THEME[c]
                const active = activeColor === c
                return (
                  <button
                    key={c}
                    onClick={() => setActiveColor(c)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                    style={
                      active
                        ? { background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`, color: 'white', boxShadow: `0 0 14px ${theme.base}55` }
                        : { backgroundColor: theme.light, color: theme.dark, opacity: 0.6 }
                    }
                  >
                    <ColorDot color={c} size={8} />
                    สี{c}
                  </button>
                )
              })}
            </div>
            <p className="mb-1.5 text-xs font-medium text-mist-400">{SHAPE_LABEL[ev.entryShape]}</p>
            <textarea
              value={quickAddText[activeColor]}
              onChange={(e) => setQuickAddText((prev) => ({ ...prev, [activeColor]: e.target.value }))}
              placeholder={SHAPE_PLACEHOLDER[ev.entryShape]}
              rows={4}
              className="w-full rounded-lg border border-surface-borderLight bg-surface-card p-2.5 text-sm text-mist-100 placeholder:text-mist-700 focus:border-gold-400 focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setQuickAddOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-mist-500">
                ปิด
              </button>
              <button
                onClick={handleQuickAdd}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: COLOR_THEME[activeColor].base }}
              >
                เพิ่มเข้าสี{activeColor}
              </button>
            </div>
          </div>
        )}

        <div className="mt-3">
          <UploadBox onFile={handleFile} label="ลากไฟล์ฟอร์ม Excel (มีคอลัมน์แยกตามสีอยู่แล้ว) มาวาง หรือคลิกเพื่อเลือกไฟล์" />
        </div>
      </section>

      {/* รายชื่อแยกตามสี — แสดงทันทีตามข้อมูลจริง ไม่ต้องสุ่ม */}
      {hasData && (
        <section className="space-y-3">
          <h2 className="font-bold text-mist-100">รายชื่อแยกตามสี</h2>
          <ResultBoard result={grouped} onRemove={(id) => removeEntry(code, id)} />
        </section>
      )}

      {/* ปุ่มสุ่มจับคู่ */}
      <section className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => (hasBracket ? setConfirmRedraw(true) : doDraw())}
          disabled={!hasData || isDrawing}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-bold text-surface-canvas shadow-glowGold transition hover:-translate-y-0.5 hover:bg-gold-300 disabled:pointer-events-none disabled:translate-y-0 disabled:bg-surface-raised disabled:text-mist-600 disabled:shadow-none"
        >
          <DiceIcon size={17} className={isDrawing ? 'animate-tumble' : ''} />
          {isDrawing ? 'กำลังสุ่มจับคู่...' : hasBracket ? 'สุ่มจับคู่ใหม่' : 'สุ่มจับคู่แข่งขัน'}
        </button>
        {hasBracket && !isDrawing && (
          <button
            onClick={() => exportEventResult(ev, state)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-surface-borderLight bg-surface-card px-4 py-2.5 text-sm font-semibold text-mist-200 hover:bg-surface-raised"
          >
            <DownloadIcon size={15} /> ส่งออกผลเป็น Excel
          </button>
        )}
        {state.drawnAt && !isDrawing && (
          <span className="text-xs text-mist-600">
            สุ่มล่าสุด: {new Date(state.drawnAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        )}
      </section>

      {isDrawing && (
        <DrawAnimation
          mode={ev.mode}
          roster={state.roster}
          finalSlots={finalSlots}
          onDone={() => {
            setIsDrawing(false)
            notify('สุ่มจับคู่แข่งขันเรียบร้อย', 'success')
          }}
        />
      )}

      {hasBracket && !isDrawing && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-1.5 font-bold text-mist-100">
            <TrophyIcon size={17} className="text-gold-400" /> คู่แข่งขันรอบแรก (Seed 1)
          </h2>
          {ev.mode === 'colorTeam' && state.colorBracket && <ColorBracketView colors={state.colorBracket} />}
          {ev.mode === 'bracket' && state.unitBracket && <UnitBracketView pairs={state.unitBracket} />}
        </section>
      )}

      <ConfirmDialog
        open={confirmRedraw}
        title="สุ่มจับคู่แข่งขันใหม่?"
        message="สายการแข่งขันรอบแรกเดิมจะถูกแทนที่ด้วยผลใหม่ทันที การกระทำนี้ย้อนกลับไม่ได้ (รายชื่อแยกตามสียังอยู่เหมือนเดิม)"
        confirmLabel="สุ่มใหม่"
        danger
        onCancel={() => setConfirmRedraw(false)}
        onConfirm={() => {
          setConfirmRedraw(false)
          doDraw()
        }}
      />
      <ConfirmDialog
        open={confirmClear}
        title="ลบรายชื่อทั้งหมด?"
        message="รายชื่อและผลจับคู่ของประเภทกีฬานี้จะถูกลบทั้งหมด"
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
