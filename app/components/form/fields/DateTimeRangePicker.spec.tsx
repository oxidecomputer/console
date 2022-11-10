import { fireEvent, render, screen } from '@testing-library/react'
import { subDays, subHours } from 'date-fns'
import { vi } from 'vitest'

import { clickByRole } from 'app/test/unit'

import type { RangeKey } from './DateTimeRangePicker'
import { DateTimeRangePicker, dateForInput } from './DateTimeRangePicker'

const now = new Date(2020, 1, 1)

function renderLastDay() {
  const setStartTime = vi.fn()
  const setEndTime = vi.fn()
  render(
    <DateTimeRangePicker
      initialPreset="lastDay"
      startTime={subDays(now, 1)}
      endTime={now}
      setStartTime={setStartTime}
      setEndTime={setEndTime}
    />
  )
  return { setStartTime, setEndTime }
}

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)

  return () => vi.useRealTimers()
})

describe('useDateTimeRangePicker', () => {
  it.each([
    ['lastHour', subHours(now, 1)],
    ['last3Hours', subHours(now, 3)],
    ['lastDay', subDays(now, 1)],
    ['lastWeek', subDays(now, 7)],
    ['last30Days', subDays(now, 30)],
  ])('sets initial start and end', (preset, start) => {
    render(
      <DateTimeRangePicker
        initialPreset={preset as RangeKey}
        startTime={start}
        endTime={now}
        setStartTime={() => {}}
        setEndTime={() => {}}
      />
    )

    expect(screen.getByLabelText('Start time')).toHaveValue(dateForInput(start))
    expect(screen.getByLabelText('End time')).toHaveValue(dateForInput(now))
  })
})

it.each([
  ['Last hour', subHours(now, 1)],
  ['Last 3 hours', subHours(now, 3)],
  // ['Last day', subDays(now, 1)], // skip because we're starting on it
  ['Last week', subDays(now, 7)],
  ['Last 30 days', subDays(now, 30)],
])('choosing a preset sets the times', (option, start) => {
  const { setStartTime, setEndTime } = renderLastDay()

  clickByRole('button', 'Choose a time range')
  clickByRole('option', option)

  expect(setStartTime).toBeCalledWith(start)
  expect(setEndTime).toBeCalledWith(now)
})

describe('custom mode', () => {
  it('enables datetime inputs', () => {
    const { setStartTime, setEndTime } = renderLastDay()

    expect(screen.getByLabelText('Start time')).toBeDisabled()

    clickByRole('button', 'Choose a time range')
    clickByRole('option', 'Custom...')

    expect(setStartTime).not.toBeCalled()
    expect(setEndTime).not.toBeCalled()
    expect(screen.getByLabelText('Start time')).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveClass('visually-disabled')
    expect(screen.getByRole('button', { name: 'Load' })).toHaveClass('visually-disabled')
  })

  it('clicking load after changing date changes range', async () => {
    const { setStartTime, setEndTime } = renderLastDay()

    expect(screen.getByLabelText('Start time')).toHaveValue(dateForInput(subDays(now, 1)))
    expect(screen.getByLabelText('End time')).toHaveValue(dateForInput(now))

    clickByRole('button', 'Choose a time range')
    clickByRole('option', 'Custom...')

    // change input values. figuring out how to actually interact with the
    // input through clicks and typing is too complicated
    const startInput = screen.getByLabelText('Start time')
    fireEvent.change(startInput, { target: { value: '2020-01-15T00:00' } })

    const endInput = screen.getByLabelText('End time')
    fireEvent.change(endInput, { target: { value: '2020-01-17T00:00' } })

    // changing the input value without clicking Load doesn't do anything
    expect(setStartTime).not.toBeCalled()
    expect(setEndTime).not.toBeCalled()

    // clicking Load calls setTime with the new range
    clickByRole('button', 'Load')
    expect(setStartTime).toBeCalledWith(new Date(2020, 0, 15))
    expect(setEndTime).toBeCalledWith(new Date(2020, 0, 17))
  })

  it('clicking reset after changing inputs resets inputs', async () => {
    const { setStartTime, setEndTime } = renderLastDay()

    expect(screen.getByLabelText('Start time')).toHaveValue(dateForInput(subDays(now, 1)))
    expect(screen.getByLabelText('End time')).toHaveValue(dateForInput(now))

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

    expect(setStartTime).not.toBeCalled()
    expect(setEndTime).not.toBeCalled()
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
