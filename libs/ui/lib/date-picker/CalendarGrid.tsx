import { getWeeksInMonth } from '@internationalized/date'
import { useCalendarGrid, useLocale } from 'react-aria'
import type { AriaCalendarGridProps } from 'react-aria'
import type { CalendarState, RangeCalendarState } from 'react-stately'

import { CalendarCell } from './CalendarCell'

export interface CalendarGridProps extends AriaCalendarGridProps {
  state: CalendarState | RangeCalendarState
  offset?: { months?: number }
}

export function CalendarGrid({ state, ...props }: CalendarGridProps) {
  const { locale } = useLocale()
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state)

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

  return (
    <div className="pl-4 pr-4 pb-4">
      <table {...gridProps} cellPadding="0" className="flex-1">
        <thead {...headerProps} className="text-gray-600">
          <tr>
            {weekDays.map((day, index) => (
              <th className="h-8 w-10 text-center text-mono-md text-quaternary" key={index}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
            <tr key={weekIndex}>
              {state
                .getDatesInWeek(weekIndex)
                .map((date, i) =>
                  date ? <CalendarCell key={i} state={state} date={date} /> : <td key={i} />
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
