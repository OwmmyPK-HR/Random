import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ColorName, EventState, MatchOutcome, NumberDrawState, RosterEntry, StoreShape } from '../types'
import { getEventByCode } from '../data/events'
import { drawColorNumbers as randomColorNumbers, drawRoundRobin, drawUnitBracketBySai, groupRosterByColor } from '../utils/shuffle'
import { matchKey } from '../utils/standings'
import {
  loadStore,
  saveStore,
  clearStore,
  loadNumberDraw,
  saveNumberDraw,
  clearNumberDraw,
  STORE_KEY,
  NUMBER_DRAW_KEY,
} from '../utils/storage'

interface Ctx {
  store: StoreShape
  getEvent: (code: string) => EventState
  setRoster: (code: string, roster: RosterEntry[]) => void
  addEntries: (code: string, entries: RosterEntry[]) => void
  removeEntry: (code: string, id: string) => void
  bulkSetRoster: (rosters: Record<string, RosterEntry[]>, mode: 'replace' | 'merge') => void
  drawBracket: (code: string) => void
  setMatchResult: (code: string, a: ColorName, b: ColorName, outcome: MatchOutcome | null) => void
  resetEvent: (code: string) => void
  resetAll: () => void
  replaceStore: (next: StoreShape) => void
  numberDraw: NumberDrawState
  drawColorNumbers: () => void
  resetNumberDraw: () => void
  replaceNumberDraw: (next: NumberDrawState) => void
}

const EMPTY: EventState = { roster: [] }

const EventStoreCtx = createContext<Ctx | null>(null)

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreShape>(() => loadStore())
  const [numberDraw, setNumberDraw] = useState<NumberDrawState>(() => loadNumberDraw())

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => {
    saveNumberDraw(numberDraw)
  }, [numberDraw])

  // ซิงก์ข้อมูลข้ามแท็บ/หน้าต่างในเครื่องเดียวกัน — ถ้าอีกแท็บแก้ไขข้อมูลแล้วบันทึกลง localStorage
  // แท็บนี้จะโหลดค่าล่าสุดมาอัปเดตทันที กันข้อมูลสองแท็บหลุดไม่ตรงกันจนอาจเขียนทับกันเองโดยไม่รู้ตัว
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY) setStore(loadStore())
      else if (e.key === NUMBER_DRAW_KEY) setNumberDraw(loadNumberDraw())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const getEvent = useCallback((code: string) => store[code] ?? EMPTY, [store])

  // ล้างเฉพาะผลจับสลาก/ผลแข่งขัน ไม่กระทบรายชื่อ
  const clearDrawFields = { colorBracket: undefined, matchResults: undefined, unitBracket: undefined, drawnAt: undefined } as const

  const setRoster = useCallback((code: string, roster: RosterEntry[]) => {
    setStore((prev) => ({
      ...prev,
      [code]: { ...prev[code], roster, ...clearDrawFields },
    }))
  }, [])

  const addEntries = useCallback((code: string, entries: RosterEntry[]) => {
    if (entries.length === 0) return
    setStore((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        roster: [...(prev[code]?.roster ?? []), ...entries],
        ...clearDrawFields,
      },
    }))
  }, [])

  const removeEntry = useCallback((code: string, id: string) => {
    setStore((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        roster: (prev[code]?.roster ?? []).filter((r) => r.id !== id),
        ...clearDrawFields,
      },
    }))
  }, [])

  const bulkSetRoster = useCallback((rosters: Record<string, RosterEntry[]>, mode: 'replace' | 'merge') => {
    setStore((prev) => {
      const next = { ...prev }
      for (const [code, roster] of Object.entries(rosters)) {
        if (mode === 'merge' && next[code]?.roster?.length) {
          next[code] = { ...next[code], roster: [...next[code].roster, ...roster], ...clearDrawFields }
        } else {
          next[code] = { ...next[code], roster, ...clearDrawFields }
        }
      }
      return next
    })
  }, [])

  const drawBracket = useCallback((code: string) => {
    const ev = getEventByCode(code)
    if (!ev) return
    setStore((prev) => {
      const roster = prev[code]?.roster ?? []
      // ประเภทแบ่งตามสีทีมจับสลากได้เลยโดยไม่ต้องมีรายชื่อ (ตารางพบกันหมดรู้แค่ว่ามี 4 สีก็พอ)
      // ส่วนประเภทเดี่ยว/คู่/ทีม 3 คน ต้องมีรายชื่อก่อนถึงจะจับคู่แข่งขันได้
      if (ev.mode === 'bracket' && roster.length === 0) return prev
      const grouped = groupRosterByColor(roster)
      const colorBracket = ev.mode === 'colorTeam' ? drawRoundRobin() : undefined
      const unitBracket = ev.mode === 'bracket' ? drawUnitBracketBySai(grouped) : undefined
      return {
        ...prev,
        [code]: { ...prev[code], roster, colorBracket, matchResults: undefined, unitBracket, drawnAt: new Date().toISOString() },
      }
    })
  }, [])

  /** บันทึก/ล้างผลนัดพบกันหมด 1 คู่ (ใช้กับกีฬาแบ่งตามสีทีม) — ส่ง outcome เป็น null เพื่อล้างผลนัดนั้น */
  const setMatchResult = useCallback((code: string, a: ColorName, b: ColorName, outcome: MatchOutcome | null) => {
    setStore((prev) => {
      const current = prev[code]
      if (!current) return prev
      const key = matchKey(a, b)
      const results = { ...(current.matchResults ?? {}) }
      if (outcome === null) delete results[key]
      else results[key] = outcome
      return { ...prev, [code]: { ...current, matchResults: results } }
    })
  }, [])

  const resetEvent = useCallback((code: string) => {
    setStore((prev) => ({
      ...prev,
      [code]: { ...prev[code], roster: prev[code]?.roster ?? [], ...clearDrawFields },
    }))
  }, [])

  const resetAll = useCallback(() => {
    clearStore()
    clearNumberDraw()
    setStore({})
    setNumberDraw({})
  }, [])

  /** แทนที่ข้อมูลทั้งหมดในระบบด้วยไฟล์สำรองที่นำเข้ามา (ใช้กับฟีเจอร์กู้คืนข้อมูลสำรอง) */
  const replaceStore = useCallback((next: StoreShape) => {
    setStore(next)
  }, [])

  /** จับฉลากเบอร์ 1-4 ให้แต่ละสีใหม่ (แทนที่ผลเดิมทั้งหมด) */
  const drawColorNumbers = useCallback(() => {
    setNumberDraw({ assignment: randomColorNumbers(), drawnAt: new Date().toISOString() })
  }, [])

  const resetNumberDraw = useCallback(() => {
    clearNumberDraw()
    setNumberDraw({})
  }, [])

  /** แทนที่ผลจับฉลากเบอร์ด้วยไฟล์สำรองที่นำเข้ามา (ใช้กับฟีเจอร์กู้คืนข้อมูลสำรอง) */
  const replaceNumberDraw = useCallback((next: NumberDrawState) => {
    setNumberDraw(next)
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      store,
      getEvent,
      setRoster,
      addEntries,
      removeEntry,
      bulkSetRoster,
      drawBracket,
      setMatchResult,
      resetEvent,
      resetAll,
      replaceStore,
      numberDraw,
      drawColorNumbers,
      resetNumberDraw,
      replaceNumberDraw,
    }),
    [
      store,
      getEvent,
      setRoster,
      addEntries,
      removeEntry,
      bulkSetRoster,
      drawBracket,
      setMatchResult,
      resetEvent,
      resetAll,
      replaceStore,
      numberDraw,
      drawColorNumbers,
      resetNumberDraw,
      replaceNumberDraw,
    ],
  )

  return <EventStoreCtx.Provider value={value}>{children}</EventStoreCtx.Provider>
}

export function useEventStore(): Ctx {
  const ctx = useContext(EventStoreCtx)
  if (!ctx) throw new Error('useEventStore must be used within EventStoreProvider')
  return ctx
}
