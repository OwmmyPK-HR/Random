import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { EventState, RosterEntry, StoreShape } from '../types'
import { getEventByCode } from '../data/events'
import { drawColorBracket, drawUnitBracket, groupRosterByColor } from '../utils/shuffle'
import { loadStore, saveStore, clearStore } from '../utils/storage'

interface Ctx {
  store: StoreShape
  getEvent: (code: string) => EventState
  setRoster: (code: string, roster: RosterEntry[]) => void
  addEntries: (code: string, entries: RosterEntry[]) => void
  removeEntry: (code: string, id: string) => void
  bulkSetRoster: (rosters: Record<string, RosterEntry[]>, mode: 'replace' | 'merge') => void
  drawBracket: (code: string) => void
  resetEvent: (code: string) => void
  resetAll: () => void
}

const EMPTY: EventState = { roster: [] }

const EventStoreCtx = createContext<Ctx | null>(null)

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreShape>(() => loadStore())

  useEffect(() => {
    saveStore(store)
  }, [store])

  const getEvent = useCallback((code: string) => store[code] ?? EMPTY, [store])

  const setRoster = useCallback((code: string, roster: RosterEntry[]) => {
    setStore((prev) => ({
      ...prev,
      [code]: { roster, colorBracket: undefined, unitBracket: undefined, drawnAt: undefined },
    }))
  }, [])

  const addEntries = useCallback((code: string, entries: RosterEntry[]) => {
    if (entries.length === 0) return
    setStore((prev) => ({
      ...prev,
      [code]: {
        roster: [...(prev[code]?.roster ?? []), ...entries],
        colorBracket: undefined,
        unitBracket: undefined,
        drawnAt: undefined,
      },
    }))
  }, [])

  const removeEntry = useCallback((code: string, id: string) => {
    setStore((prev) => ({
      ...prev,
      [code]: {
        roster: (prev[code]?.roster ?? []).filter((r) => r.id !== id),
        colorBracket: undefined,
        unitBracket: undefined,
        drawnAt: undefined,
      },
    }))
  }, [])

  const bulkSetRoster = useCallback((rosters: Record<string, RosterEntry[]>, mode: 'replace' | 'merge') => {
    setStore((prev) => {
      const next = { ...prev }
      for (const [code, roster] of Object.entries(rosters)) {
        if (mode === 'merge' && next[code]?.roster?.length) {
          next[code] = { ...next[code], roster: [...next[code].roster, ...roster], colorBracket: undefined, unitBracket: undefined, drawnAt: undefined }
        } else {
          next[code] = { roster, colorBracket: undefined, unitBracket: undefined, drawnAt: undefined }
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
      if (roster.length === 0) return prev
      const grouped = groupRosterByColor(roster)
      const colorBracket = ev.mode === 'colorTeam' ? drawColorBracket() : undefined
      const unitBracket = ev.mode === 'bracket' ? drawUnitBracket(grouped) : undefined
      return {
        ...prev,
        [code]: { roster, colorBracket, unitBracket, drawnAt: new Date().toISOString() },
      }
    })
  }, [])

  const resetEvent = useCallback((code: string) => {
    setStore((prev) => ({
      ...prev,
      [code]: { roster: prev[code]?.roster ?? [], colorBracket: undefined, unitBracket: undefined, drawnAt: undefined },
    }))
  }, [])

  const resetAll = useCallback(() => {
    clearStore()
    setStore({})
  }, [])

  const value = useMemo<Ctx>(
    () => ({ store, getEvent, setRoster, addEntries, removeEntry, bulkSetRoster, drawBracket, resetEvent, resetAll }),
    [store, getEvent, setRoster, addEntries, removeEntry, bulkSetRoster, drawBracket, resetEvent, resetAll],
  )

  return <EventStoreCtx.Provider value={value}>{children}</EventStoreCtx.Provider>
}

export function useEventStore(): Ctx {
  const ctx = useContext(EventStoreCtx)
  if (!ctx) throw new Error('useEventStore must be used within EventStoreProvider')
  return ctx
}
