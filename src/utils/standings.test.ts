import { describe, expect, it } from 'vitest'
import type { ColorName, MatchOutcome } from '../types'
import { computeStandings, isRoundRobinComplete, matchKey } from './standings'

const MATCHES: [ColorName, ColorName][] = [
  ['ฟ้า', 'ม่วง'],
  ['ฟ้า', 'ชมพู'],
  ['ฟ้า', 'เขียว'],
  ['ม่วง', 'ชมพู'],
  ['ม่วง', 'เขียว'],
  ['ชมพู', 'เขียว'],
]

describe('matchKey', () => {
  it('is symmetric — order of the two colors does not matter', () => {
    expect(matchKey('ฟ้า', 'ม่วง')).toBe(matchKey('ม่วง', 'ฟ้า'))
  })
})

describe('isRoundRobinComplete', () => {
  it('is false until all 6 matches have a recorded outcome', () => {
    const results: Record<string, MatchOutcome> = { [matchKey('ฟ้า', 'ม่วง')]: 'ฟ้า' }
    expect(isRoundRobinComplete(MATCHES, results)).toBe(false)
  })

  it('is true once every match has an outcome', () => {
    const results: Record<string, MatchOutcome> = {}
    for (const [a, b] of MATCHES) results[matchKey(a, b)] = a
    expect(isRoundRobinComplete(MATCHES, results)).toBe(true)
  })
})

describe('computeStandings', () => {
  it('awards 3 points for a win, 1 each for a draw, 0 for a loss, sorted by points desc', () => {
    // ฟ้า ชนะทุกนัด (3 นัด = 9 แต้ม) ม่วง-ชมพู เสมอกัน เขียว แพ้ทุกนัดที่เหลือ
    const results: Record<string, MatchOutcome> = {
      [matchKey('ฟ้า', 'ม่วง')]: 'ฟ้า',
      [matchKey('ฟ้า', 'ชมพู')]: 'ฟ้า',
      [matchKey('ฟ้า', 'เขียว')]: 'ฟ้า',
      [matchKey('ม่วง', 'ชมพู')]: 'draw',
      [matchKey('ม่วง', 'เขียว')]: 'ม่วง',
      [matchKey('ชมพู', 'เขียว')]: 'ชมพู',
    }
    const standings = computeStandings(MATCHES, results)

    expect(standings[0]).toMatchObject({ color: 'ฟ้า', played: 3, won: 3, drawn: 0, lost: 0, points: 9 })

    const purple = standings.find((s) => s.color === 'ม่วง')!
    expect(purple).toMatchObject({ played: 3, won: 1, drawn: 1, lost: 1, points: 4 })

    const green = standings.find((s) => s.color === 'เขียว')!
    expect(green).toMatchObject({ played: 3, won: 0, drawn: 0, lost: 3, points: 0 })

    // เรียงจากคะแนนมากไปน้อยเสมอ
    for (let i = 1; i < standings.length; i++) {
      expect(standings[i - 1].points).toBeGreaterThanOrEqual(standings[i].points)
    }
  })

  it('ignores matches without a recorded result', () => {
    const standings = computeStandings(MATCHES, {})
    expect(standings.every((s) => s.played === 0 && s.points === 0)).toBe(true)
  })
})
