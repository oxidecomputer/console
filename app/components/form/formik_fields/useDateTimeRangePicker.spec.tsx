import { fireEvent, render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { subDays, subHours } from 'date-fns'
import { vi } from 'vitest'

import { clickByRole } from 'app/test/unit'

import type { RangeKey } from './useDateTimeRangePicker'
import { useDateTimeRangePicker } from './useDateTimeRangePicker'

const date = new Date(2020, 1, 1)

describe('useDateTimeRangePicker', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(date)

    return () => vi.useRealTimers()
  })

  it.each([
    ['lastHour', subHours(date, 1)],
    ['last3Hours', subHours(date, 3)],
    ['lastDay', subDays(date, 1)],
    ['lastWeek', subDays(date, 7)],
    ['last30Days', subDays(date, 30)],
  ])('sets initial start and end', (preset, start) => {
    const { result } = renderHook(() => useDateTimeRangePicker(preset as RangeKey))
    expect(result.current.startTime).toEqual(start)
    expect(result.current.endTime).toEqual(date)
  })

  it.each([
    ['Last hour', subHours(date, 1)],
    ['Last 3 hours', subHours(date, 3)],
    // ['Last day', subDays(date, 1)], // skip because we're starting on it
    ['Last week', subDays(date, 7)],
    ['Last 30 days', subDays(date, 30)],
  ])('choosing a preset sets the times', async (option, start) => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDateTimeRangePicker('lastDay')
    )
    render(result.current.dateTimeRangePicker)

    clickByRole('button', 'Choose a time range')
    clickByRole('option', option)

    await waitForNextUpdate()

    expect(result.current.startTime).toEqual(start)
    expect(result.current.endTime).toEqual(date)
  })

  describe('custom mode', () => {
    it('enables datetime inputs', () => {
      const { result } = renderHook(() => useDateTimeRangePicker('last3Hours'))

      render(result.current.dateTimeRangePicker)

      expect(screen.getByLabelText('Start time')).toBeDisabled()

      clickByRole('button', 'Choose a time range')
      clickByRole('option', 'Custom...')

      expect(screen.getByLabelText('Start time')).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Load' })).toBeDisabled()
    })

    it('clicking load after changing date changes range', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useDateTimeRangePicker('last3Hours')
      )
      expect(result.current.startTime).toEqual(subHours(date, 3))
      expect(result.current.endTime).toEqual(date)

      render(result.current.dateTimeRangePicker)
      clickByRole('button', 'Choose a time range')
      clickByRole('option', 'Custom...')

      const startInput = screen.getByLabelText('Start time')
      const endInput = screen.getByLabelText('End time')

      // change input values. figuring out how to actually interact with the
      // input through clicks and typing is too complicated
      fireEvent.change(startInput, { target: { value: '2020-01-15T00:00' } })
      fireEvent.change(endInput, { target: { value: '2020-01-17T00:00' } })

      // changing the input value without clicking load doesn't do anything
      expect(result.current.startTime).toEqual(subHours(date, 3))
      expect(result.current.endTime).toEqual(date)

      // clicking loading changes startTime
      clickByRole('button', 'Load')
      await waitForNextUpdate()
      expect(result.current.startTime).toEqual(new Date(2020, 0, 15))
      expect(result.current.endTime).toEqual(new Date(2020, 0, 17))
    })

    it('clicking reset after changing inputs resets inputs', async () => {
      const { result } = renderHook(() => useDateTimeRangePicker('last3Hours'))

      render(result.current.dateTimeRangePicker)
      clickByRole('button', 'Choose a time range')
      clickByRole('option', 'Custom...')

      const startInput = screen.getByLabelText('Start time')
      const endInput = screen.getByLabelText('End time')

      expect(startInput).toHaveValue('2020-01-31T21:00')
      expect(endInput).toHaveValue('2020-02-01T00:00')

      // change input values. figuring out how to actually interact with the
      // input through clicks and typing is too complicated
      fireEvent.change(startInput, { target: { value: '2020-01-15T00:00' } })
      fireEvent.change(endInput, { target: { value: '2020-01-17T00:00' } })

      expect(startInput).toHaveValue('2020-01-15T00:00')
      expect(endInput).toHaveValue('2020-01-17T00:00')

      // clicking reset resets the inputs
      clickByRole('button', 'Reset')
      expect(startInput).toHaveValue('2020-01-31T21:00')
      expect(endInput).toHaveValue('2020-02-01T00:00')
    })

    it('shows error for invalid range', async () => {
      const { result } = renderHook(() => useDateTimeRangePicker('last3Hours'))

      render(result.current.dateTimeRangePicker)
      clickByRole('button', 'Choose a time range')
      clickByRole('option', 'Custom...')

      const startInput = screen.getByLabelText('Start time')

      expect(startInput).toHaveValue('2020-01-31T21:00')

      // start date is after end
      fireEvent.change(startInput, { target: { value: '2020-02-03T00:00' } })

      await screen.findByText('End time must be later than start time')
    })
  })
})
