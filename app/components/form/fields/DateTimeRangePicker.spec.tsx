import { getLocalTimeZone, now as getNow } from '@internationalized/date'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { clickByRole } from 'app/test/unit'

import type { RangeKey } from './DateTimeRangePicker'
import { DateTimeRangePicker } from './DateTimeRangePicker'

const now = getNow(getLocalTimeZone())

function renderLastDay() {
  const setRange = vi.fn()
  render(
    <DateTimeRangePicker
      initialPreset="lastDay"
      range={{
        start: now.subtract({ days: 1 }),
        end: now,
      }}
      setRange={setRange}
    />
  )
  return { setRange }
}

beforeAll(() => {
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
        initialPreset={preset as RangeKey}
        range={{ start, end: now }}
        setRange={() => {}}
      />
    )

    // expect(screen.getByLabelText('Start Date')).toHaveValue('')
    // expect(screen.getByLabelText('End Date')).toHaveValue('')
  })
})

it.each([
  ['Last hour', now.subtract({ hours: 1 })],
  ['Last 3 hours', now.subtract({ hours: 3 })],
  // ['Last day', now.subtract({ days: 1 })],
  ['Last week', now.subtract({ days: 7 })],
  ['Last 30 days', now.subtract({ days: 30 })],
])('choosing a preset sets the times', (option, start) => {
  const { setRange } = renderLastDay()

  clickByRole('button', 'Choose a time range preset')
  clickByRole('option', option)

  expect(setRange).toBeCalledWith({ start, end: now })
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
