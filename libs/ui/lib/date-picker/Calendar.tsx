import type { DateValue } from '@internationalized/date'
import { createCalendar } from '@internationalized/date'
import type { CalendarProps } from 'react-aria'
import { useCalendar, useLocale } from 'react-aria'
import { useCalendarState } from 'react-stately'

import { DirectionLeftIcon, DirectionRightIcon } from '../icons'
import { CalendarGrid } from './CalendarGrid'
import { CalendarButton } from './RangeCalendar'

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
    <div {...calendarProps} className="text-gray-800 inline-block">
      <div className="flex items-center p-4">
        <CalendarButton
          handleClick={state.focusPreviousPage}
          isDisabled={prevButtonProps.isDisabled || false}
        >
          <DirectionLeftIcon />
        </CalendarButton>
        <h2 className="text-xl ml-2 flex-1 text-center text-sans-md">{title}</h2>
        <CalendarButton
          handleClick={state.focusNextPage}
          isDisabled={nextButtonProps.isDisabled || false}
        >
          <DirectionRightIcon />
        </CalendarButton>
      </div>
      <CalendarGrid state={state} />
    </div>
  )
}
