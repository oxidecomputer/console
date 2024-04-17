/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { subDays, subHours, subMinutes, subSeconds } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  timeAgoAbbr,
  toLocaleDateString,
  toLocaleDateTimeString,
  toLocaleTimeString,
} from './date'

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

  it('formats toLocaleDateString', () => {
    expect(toLocaleDateString(baseDate)).toEqual('Jun 7, 2021')
    expect(toLocaleDateString(baseDate, 'en-US')).toEqual('Jun 7, 2021')
    expect(toLocaleDateString(baseDate, 'fr-FR')).toEqual('7 juin 2021')
    expect(toLocaleDateString(baseDate, 'de-DE')).toEqual('07.06.2021')
    expect(toLocaleDateString(baseDate, 'ja-JP')).toEqual('2021/06/07')
  })

  it('formats toLocaleTimeString', () => {
    expect(toLocaleTimeString(baseDate)).toEqual('12:00 AM')
    expect(toLocaleTimeString(baseDate, 'en-US')).toEqual('12:00 AM')
    expect(toLocaleTimeString(baseDate, 'fr-FR')).toEqual('00:00')
    expect(toLocaleTimeString(baseDate, 'de-DE')).toEqual('00:00')
    expect(toLocaleTimeString(baseDate, 'ja-JP')).toEqual('0:00')
  })

  it('formats toLocaleDateTimeString', () => {
    expect(toLocaleDateTimeString(baseDate)).toEqual('Jun 7, 2021, 12:00 AM')
    expect(toLocaleDateTimeString(baseDate, 'en-US')).toEqual('Jun 7, 2021, 12:00 AM')
    expect(toLocaleDateTimeString(baseDate, 'fr-FR')).toEqual('7 juin 2021, 00:00')
    expect(toLocaleDateTimeString(baseDate, 'de-DE')).toEqual('07.06.2021, 00:00')
    expect(toLocaleDateTimeString(baseDate, 'ja-JP')).toEqual('2021/06/07 0:00')
  })
})
