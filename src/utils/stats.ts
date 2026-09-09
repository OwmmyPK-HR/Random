import { EVENTS } from '../data/events'
import type { EntryShape, StoreShape } from '../types'

export function headsPerEntry(shape: EntryShape): number {
  switch (shape) {
    case 'individual':
      return 1
    case 'pair':
    case 'pairMixed':
      return 2
    case 'team3':
      return 3
  }
}

export function totalHeadcount(store: StoreShape): number {
  return EVENTS.reduce((sum, ev) => sum + (store[ev.code]?.roster.length ?? 0) * headsPerEntry(ev.entryShape), 0)
}

export function randomizedCount(store: StoreShape): number {
  return EVENTS.filter((ev) => store[ev.code]?.result).length
}

export function eventsWithDataCount(store: StoreShape): number {
  return EVENTS.filter((ev) => (store[ev.code]?.roster.length ?? 0) > 0).length
}
