/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now as getNow } from '@internationalized/date'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { DateTimeRangePicker } from './DateTimeRangePicker'

function clickByRole(role: string, name: string) {
  fireEvent.click(screen.getByRole(role, { name }))
}

const now = getNow(getLocalTimeZone())

function renderLastDay() {
  const setRange = vi.fn()
  const setPreset = vi.fn()
  render(
    <DateTimeRangePicker
      preset="lastDay"
      setPreset={setPreset}
      range={{ start: now.subtract({ days: 1 }), end: now }}
      setRange={setRange}
    />
  )
  return { setRange, setPreset }
}

it.each([
  ['Last hour', 'lastHour'],
  ['Last 3 hours', 'last3Hours'],
  ['Last week', 'lastWeek'],
  ['Last 30 days', 'last30Days'],
])('choosing a preset sets the times', (option, preset) => {
  const { setPreset } = renderLastDay()

  clickByRole('button', 'Choose a time range preset')
  clickByRole('option', option)

  expect(setPreset).toBeCalledWith(preset)
})
