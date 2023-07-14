import { subDays, subHours, subMinutes, subSeconds } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { timeAgoAbbr } from './date'

const baseDate = new Date(2021, 5, 7)

describe('timeAgoAbbr', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(baseDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats times ago', () => {
    expect(timeAgoAbbr(subSeconds(baseDate, 1))).toEqual('1s')
    expect(timeAgoAbbr(subSeconds(baseDate, 6))).toEqual('6s')
    expect(timeAgoAbbr(subSeconds(baseDate, 55))).toEqual('55s')
    expect(timeAgoAbbr(subSeconds(baseDate, 59))).toEqual('59s')

    expect(timeAgoAbbr(subMinutes(baseDate, 1))).toEqual('1m')
    expect(timeAgoAbbr(subMinutes(baseDate, 6))).toEqual('6m')
    expect(timeAgoAbbr(subMinutes(baseDate, 55))).toEqual('55m')
    expect(timeAgoAbbr(subMinutes(baseDate, 59))).toEqual('59m')

    expect(timeAgoAbbr(subHours(baseDate, 1))).toEqual('1h')
    expect(timeAgoAbbr(subHours(baseDate, 6))).toEqual('6h')
    expect(timeAgoAbbr(subHours(baseDate, 23))).toEqual('23h')
    expect(timeAgoAbbr(subHours(baseDate, 24))).toEqual('1d')

    expect(timeAgoAbbr(subDays(baseDate, 1))).toEqual('1d')
    expect(timeAgoAbbr(subDays(baseDate, 8))).toEqual('8d')

    expect(timeAgoAbbr(subDays(baseDate, 28))).toEqual('28d')
    expect(timeAgoAbbr(subDays(baseDate, 35))).toEqual('1mo')

    expect(timeAgoAbbr(subDays(baseDate, 200))).toEqual('7mo')
    expect(timeAgoAbbr(subDays(baseDate, 355))).toEqual('1y')
    expect(timeAgoAbbr(subDays(baseDate, 400))).toEqual('1y')
    expect(timeAgoAbbr(subDays(baseDate, 800))).toEqual('2y')
  })

  it("addSuffix option adds 'ago'", () => {
    expect(timeAgoAbbr(subDays(baseDate, 200), { addSuffix: true })).toEqual('7mo ago')
    expect(timeAgoAbbr(subDays(baseDate, 3), { addSuffix: true })).toEqual('3d ago')
  })
})
