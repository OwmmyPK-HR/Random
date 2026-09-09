import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { EventState, RosterEntry, StoreShape } from '../types'
import { getEventByCode } from '../data/events'
import { balancedShuffle, drawColorBracket, drawUnitBracket } from '../utils/shuffle'
import { loadStore, saveStore, clearStore } from '../utils/storage'

interface Ctx {
  store: StoreShape
  getEvent: (code: string) => EventState
  setRoster: (code: string, roster: RosterEntry[]) => void
  bulkSetRoster: (rosters: Record<string, RosterEntry[]>, mode: 'replace' | 'merge') => void
  shuffle: (code: string) => void
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
      [code]: { roster, result: undefined, colorBracket: undefined, unitBracket: undefined, shuffledAt: undefined },
    }))
  }, [])

  const bulkSetRoster = useCallback((rosters: Record<string, RosterEntry[]>, mode: 'replace' | 'merge') => {
    setStore((prev) => {
      const next = { ...prev }
      for (const [code, roster] of Object.entries(rosters)) {
        if (mode === 'merge' && next[code]?.roster?.length) {
          next[code] = { ...next[code], roster: [...next[code].roster, ...roster] }
        } else {
          next[code] = { roster, result: undefined, colorBracket: undefined, unitBracket: undefined, shuffledAt: undefined }
        }
      }
      return next
    })
  }, [])

  const shuffle = useCallback((code: string) => {
    const ev = getEventByCode(code)
    if (!ev) return
    setStore((prev) => {
      const roster = prev[code]?.roster ?? []
      if (roster.length === 0) return prev
      const result = balancedShuffle(roster)
      const colorBracket = ev.mode === 'colorTeam' ? drawColorBracket() : undefined
      const unitBracket = ev.mode === 'bracket' ? drawUnitBracket(result) : undefined
      return {
        ...prev,
        [code]: { roster, result, colorBracket, unitBracket, shuffledAt: new Date().toISOString() },
      }
    })
  }, [])

  const resetEvent = useCallback((code: string) => {
    setStore((prev) => ({
      ...prev,
      [code]: { roster: prev[code]?.roster ?? [], result: undefined, colorBracket: undefined, unitBracket: undefined, shuffledAt: undefined },
    }))
  }, [])

  const resetAll = useCallback(() => {
    clearStore()
    setStore({})
  }, [])

  const value = useMemo<Ctx>(
    () => ({ store, getEvent, setRoster, bulkSetRoster, shuffle, resetEvent, resetAll }),
    [store, getEvent, setRoster, bulkSetRoster, shuffle, resetEvent, resetAll],
  )

  return <EventStoreCtx.Provider value={value}>{children}</EventStoreCtx.Provider>
}

export function useEventStore(): Ctx {
  const ctx = useContext(EventStoreCtx)
  if (!ctx) throw new Error('useEventStore must be used within EventStoreProvider')
  return ctx
}
