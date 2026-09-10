import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS, SPORT_GROUPS } from '../data/events'
import { COLORS, COLOR_THEME } from '../types'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { downloadBackupFile, readBackupFile, type RestoreResult } from '../utils/backup'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ColorDistributionBar } from '../components/ColorDistributionBar'
import { groupRosterByColor } from '../utils/shuffle'
import { CheckCircleIcon, ClockIcon, DownloadIcon, SearchIcon, TrashIcon, UploadIcon } from '../components/Icons'

export function SummaryPage() {
  const { store, resetAll, replaceStore, numberDraw, replaceNumberDraw } = useEventStore()
  const { notify } = useToast()
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingRestore, setPendingRestore] = useState<RestoreResult | null>(null)
  const [query, setQuery] = useState('')
  const restoreInputRef = useRef<HTMLInputElement>(null)

  const randomizedTotal = EVENTS.filter((ev) => store[ev.code]?.colorBracket || store[ev.code]?.unitBracket).length
  const colorCounts = Object.fromEntries(
    COLORS.map((c) => [c, EVENTS.reduce((sum, ev) => sum + groupRosterByColor(store[ev.code]?.roster ?? [])[c].length, 0)]),
  ) as Record<(typeof COLORS)[number], number>

  const q = query.trim().toLowerCase()
  const visibleGroups = useMemo(() => {
    if (!q) return SPORT_GROUPS
    return SPORT_GROUPS.map((g) => ({
      ...g,
      events: g.events.filter((ev) => `${g.name} ${ev.name} ${ev.genderLabel} ${ev.ageLabel ?? ''}`.toLowerCase().includes(q)),
    })).filter((g) => g.events.length > 0)
  }, [q])

  const handleRestoreFile = async (file: File) => {
    try {
      const result = await readBackupFile(file)
      setPendingRestore(result)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'อ่านไฟล์สำรองไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-mist-100">สรุปผล &amp; ส่งออก</h1>
          <p className="text-sm text-mist-500">
            สุ่มจับคู่แล้ว {randomizedTotal}/{EVENTS.length} รายการ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              const { exportAllResults } = await import('../utils/excel')
              exportAllResults(store)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-contrast shadow-glowAccent transition hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            <DownloadIcon size={16} /> ส่งออกสรุปผลทั้งหมด (Excel)
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-900/60 px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
          >
            <TrashIcon size={15} /> ล้างข้อมูลทั้งหมด
          </button>
        </div>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-soft">
        <div>
          <p className="text-sm font-bold text-mist-100">สำรอง / กู้คืนข้อมูล</p>
          <p className="text-xs text-mist-500">
            ไฟล์นี้เก็บครบทั้งรายชื่อ ผลจับสลาก ผลแข่งขัน และผลจับฉลากเบอร์ประจำสี (ต่างจากไฟล์ Excel ที่มีแค่รายชื่อ) ใช้ย้ายข้อมูลไปเครื่องอื่น หรือกันไว้เผื่อเบราว์เซอร์ล้างข้อมูล
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadBackupFile(store, numberDraw)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-surface-borderLight bg-surface-sunken px-3.5 py-2 text-sm font-semibold text-mist-200 hover:bg-surface-raised"
          >
            <DownloadIcon size={14} /> สำรองข้อมูล (JSON)
          </button>
          <button
            onClick={() => restoreInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-surface-borderLight bg-surface-sunken px-3.5 py-2 text-sm font-semibold text-mist-200 hover:bg-surface-raised"
          >
            <UploadIcon size={14} /> กู้คืนจากไฟล์สำรอง
          </button>
          <input
            ref={restoreInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleRestoreFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-soft">
        <h2 className="text-sm font-bold uppercase tracking-wide text-mist-300">สัดส่วนนักกีฬาแต่ละสี (รวมทุกประเภทที่มีข้อมูลแล้ว)</h2>
        <div className="mt-4">
          <ColorDistributionBar counts={colorCounts} />
        </div>
      </section>

      <div className="relative">
        <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาประเภทกีฬา เช่น เทนนิส, ชายคู่, ฟุตบอล"
          className="w-full rounded-xl border border-surface-border bg-surface-card py-2.5 pl-10 pr-3 text-sm text-mist-100 placeholder:text-mist-600 focus:border-accent focus:outline-none"
        />
      </div>

      <section className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-soft">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-[11px] font-bold uppercase tracking-wide text-mist-600">
              <th className="px-4 py-3">หมวดกีฬา</th>
              <th className="px-4 py-3">รายการ</th>
              <th className="px-4 py-3">เงื่อนไข</th>
              {COLORS.map((c) => (
                <th key={c} className="px-3 py-3 text-center">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_THEME[c].base, boxShadow: `0 0 6px ${COLOR_THEME[c].base}` }} />
                    {c}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {visibleGroups.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-mist-500">
                  ไม่พบประเภทกีฬาที่ตรงกับ “{query}”
                </td>
              </tr>
            )}
            {visibleGroups.map((g) =>
              g.events.map((ev, idx) => {
                const state = store[ev.code]
                const grouped = groupRosterByColor(state?.roster ?? [])
                const hasBracket = !!(state?.colorBracket || state?.unitBracket)
                return (
                  <tr key={ev.code} className="hover:bg-surface-raised/60">
                    {idx === 0 && (
                      <td className="px-4 py-2.5 align-top font-semibold text-mist-300" rowSpan={g.events.length}>
                        <span className="inline-flex items-center gap-1.5">
                          <img src={`./icons/${g.slug}.png`} alt="" className="h-4 w-4 shrink-0" />
                          {g.name}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <Link to={`/event/${ev.code}`} className="font-medium text-mist-200 hover:text-accent">
                        {ev.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-mist-500">
                      {ev.genderLabel}
                      {ev.ageLabel ? ` · ${ev.ageLabel}` : ''}
                    </td>
                    {COLORS.map((c) => (
                      <td key={c} className="px-3 py-2.5 text-center text-xs font-semibold text-mist-300 [font-variant-numeric:tabular-nums]">
                        {grouped[c].length || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center">
                      {hasBracket ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-team-green/15 px-2 py-0.5 text-[11px] font-bold text-team-green-soft">
                          <CheckCircleIcon size={11} /> จับคู่แล้ว
                        </span>
                      ) : state?.roster?.length ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                          <ClockIcon size={11} /> รอจับคู่
                        </span>
                      ) : (
                        <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-bold text-mist-600">ไม่มีข้อมูล</span>
                      )}
                    </td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="ล้างข้อมูลทั้งหมด?"
        message="รายชื่อนักกีฬา ผลการสุ่มของทุกประเภทกีฬา และผลจับฉลากเบอร์ประจำสี จะถูกลบทั้งหมดออกจากเครื่องนี้ การกระทำนี้ย้อนกลับไม่ได้"
        confirmLabel="ล้างข้อมูลทั้งหมด"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
          notify('ล้างข้อมูลทั้งหมดเรียบร้อย', 'success')
        }}
      />
      <ConfirmDialog
        open={!!pendingRestore}
        title="กู้คืนจากไฟล์สำรอง?"
        message={`พบข้อมูล ${pendingRestore?.eventCount ?? 0} ประเภทกีฬาในไฟล์นี้ การกู้คืนจะแทนที่ข้อมูลทั้งหมดที่มีอยู่ตอนนี้ในเครื่องนี้ทันที การกระทำนี้ย้อนกลับไม่ได้`}
        confirmLabel="กู้คืนข้อมูล"
        danger
        onCancel={() => setPendingRestore(null)}
        onConfirm={() => {
          if (pendingRestore) {
            replaceStore(pendingRestore.store)
            replaceNumberDraw(pendingRestore.numberDraw)
            notify(`กู้คืนข้อมูลสำเร็จ ${pendingRestore.eventCount} ประเภทกีฬา`, 'success')
          }
          setPendingRestore(null)
        }}
      />
    </div>
  )
}
