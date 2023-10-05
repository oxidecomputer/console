/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
