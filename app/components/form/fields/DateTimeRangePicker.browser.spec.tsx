/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { parseDateTime, type DateValue } from '@internationalized/date'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import { DateTimeRangePicker, type RangeKeyAll } from './DateTimeRangePicker'

const end = parseDateTime('2024-01-02T12:00')
const range = { start: end.subtract({ days: 1 }), end }

function DateTimeRangePickerHarness() {
  const [preset, setPreset] = useState<RangeKeyAll>('lastDay')
  const [selectedRange, setRange] = useState<{ start: DateValue; end: DateValue }>(range)
  return (
    <>
      <DateTimeRangePicker
        preset={preset}
        setPreset={setPreset}
        range={selectedRange}
        setRange={setRange}
      />
      <output>Preset: {preset}</output>
    </>
  )
}

test('chooses a preset with the pointer', async () => {
  const screen = await render(<DateTimeRangePickerHarness />)

  await screen.getByRole('button', { name: 'Choose a time range preset' }).click()
  await screen.getByRole('option', { name: 'Last week' }).click()

  await expect.element(screen.getByText('Preset: lastWeek')).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Choose a time range preset' }))
    .toHaveTextContent('Last week')
})

test('chooses a preset with the keyboard', async () => {
  const screen = await render(<DateTimeRangePickerHarness />)
  const preset = screen.getByRole('button', { name: 'Choose a time range preset' })

  preset.element().focus()
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')

  await expect.element(screen.getByText('Preset: lastWeek')).toBeVisible()
  await expect.element(preset).toHaveFocus()
})

test('closes the date-range dialog with Escape and restores focus', async () => {
  const screen = await render(<DateTimeRangePickerHarness />)
  const dateRange = screen.getByLabelText('Choose a date range').getByRole('button')

  await dateRange.click()
  await expect.element(screen.getByRole('dialog')).toBeVisible()
  await userEvent.keyboard('{Escape}')

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
  await expect.element(dateRange).toHaveFocus()
})
