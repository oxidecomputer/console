/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now as getNow } from '@internationalized/date'
import { fireEvent, render, screen } from '@testing-library/react'
import ResizeObserverPolyfill from 'resize-observer-polyfill'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { DateTimeRangePicker, type RangeKey } from './DateTimeRangePicker'

export function clickByRole(role: string, name: string) {
  const element = screen.getByRole(role, { name })
  fireEvent.click(element)
}

const now = getNow(getLocalTimeZone())

function renderLastDay() {
  const setRange = vi.fn()
  const setPreset = vi.fn()
  render(
    <DateTimeRangePicker
      preset="lastDay"
      setPreset={setPreset}
      range={{
        start: now.subtract({ days: 1 }),
        end: now,
      }}
      setRange={setRange}
    />
  )
  return { setRange, setPreset }
}

beforeAll(() => {
  global.ResizeObserver = ResizeObserverPolyfill

  vi.useFakeTimers()
  vi.setSystemTime(now.toDate())

  return () => vi.useRealTimers()
})

describe.skip('DateTimeRangePicker', () => {
  it.each([
    ['lastHour', now.subtract({ hours: 1 })],
    ['last3Hours', now.subtract({ hours: 3 })],
    ['lastDay', now.subtract({ days: 1 })],
    ['lastWeek', now.subtract({ days: 7 })],
    ['last30Days', now.subtract({ days: 30 })],
  ])('sets initial start and end', (preset, start) => {
    render(
      <DateTimeRangePicker
        preset={preset as RangeKey}
        setPreset={() => {}}
        range={{ start, end: now }}
        setRange={() => {}}
      />
    )

    // expect(screen.getByLabelText('Start Date')).toHaveValue('')
    // expect(screen.getByLabelText('End Date')).toHaveValue('')
  })
})

it.each([
  ['Last hour', 'lastHour'],
  ['Last 3 hours', 'last3Hours'],
  // ['Last day', now.subtract({ days: 1 })],
  ['Last week', 'lastWeek'],
  ['Last 30 days', 'last30Days'],
])('choosing a preset sets the times', (option, preset) => {
  const { setPreset } = renderLastDay()

  clickByRole('button', 'Choose a time range preset')
  clickByRole('option', option)

  expect(setPreset).toBeCalledWith(preset)
})

describe.skip('custom mode', () => {
  it('enables datetime inputs', () => {
    const { setRange } = renderLastDay()

    expect(screen.getByLabelText('Start time')).toBeDisabled()

    clickByRole('button', 'Choose a time range')
    clickByRole('option', 'Custom...')

    expect(setRange).not.toBeCalled()
    expect(screen.getByLabelText('Start time')).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveClass('visually-disabled')
    expect(screen.getByRole('button', { name: 'Load' })).toHaveClass('visually-disabled')
  })

  it('clicking load after changing date changes range', async () => {
    const { setRange } = renderLastDay()

    // expect(screen.getByLabelText('Start time')).toHaveValue(dateForInput(subDays(now, 1)))
    // expect(screen.getByLabelText('End time')).toHaveValue(dateForInput(now))

    clickByRole('button', 'Choose a time range')
    clickByRole('option', 'Custom...')

    // change input values. figuring out how to actually interact with the
    // input through clicks and typing is too complicated
    const startInput = screen.getByLabelText('Start time')
    fireEvent.change(startInput, { target: { value: '2020-01-15T00:00' } })

    const endInput = screen.getByLabelText('End time')
    fireEvent.change(endInput, { target: { value: '2020-01-17T00:00' } })

    // changing the input value without clicking Load doesn't do anything
    expect(setRange).not.toBeCalled()

    // clicking Load calls setTime with the new range
    clickByRole('button', 'Load')
    expect(setRange).toBeCalledWith({
      start: new Date(2020, 0, 15),
      end: new Date(2020, 0, 17),
    })
  })

  it('clicking reset after changing inputs resets inputs', async () => {
    const { setRange } = renderLastDay()

    // expect(screen.getByLabelText('Start time')).toHaveValue(dateForInput(subDays(now, 1)))
    // expect(screen.getByLabelText('End time')).toHaveValue(dateForInput(now))

    clickByRole('button', 'Choose a time range')
    clickByRole('option', 'Custom...')

    const startInput = screen.getByLabelText('Start time')
    fireEvent.change(startInput, { target: { value: '2020-01-15T00:00' } })
    expect(startInput).toHaveValue('2020-01-15T00:00')

    const endInput = screen.getByLabelText('End time')
    fireEvent.change(endInput, { target: { value: '2020-01-17T00:00' } })
    expect(endInput).toHaveValue('2020-01-17T00:00')

    // clicking reset resets the inputs
    clickByRole('button', 'Reset')
    expect(startInput).toHaveValue('2020-01-31T00:00')
    expect(endInput).toHaveValue('2020-02-01T00:00')

    expect(setRange).not.toBeCalled()
  })

  it('shows error for invalid range', () => {
    renderLastDay()

    clickByRole('button', 'Choose a time range')
    clickByRole('option', 'Custom...')

    const startInput = screen.getByLabelText('Start time')
    expect(startInput).toHaveValue('2020-01-31T00:00')

    // start date is after end
    fireEvent.change(startInput, { target: { value: '2020-02-03T00:00' } })

    screen.getByText('Start time must be earlier than end time')
  })
})
