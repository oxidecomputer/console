import type { DateValue } from '@internationalized/date'
import { createCalendar } from '@internationalized/date'
import type { CalendarProps } from 'react-aria'
import { useCalendar, useLocale } from 'react-aria'
import { useCalendarState } from 'react-stately'

import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './RangeCalendar'

export function Calendar(props: CalendarProps<DateValue>) {
  const { locale } = useLocale()
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  })

  const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(
    props,
    state
  )

  return (
    <div {...calendarProps}>
      <CalendarHeader
        state={state}
        title={title}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
      />
      <CalendarGrid state={state} />
    </div>
  )
}
