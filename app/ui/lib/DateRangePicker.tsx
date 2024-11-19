/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone } from '@internationalized/date'
import type { TimeValue } from '@react-types/datepicker'
import cn from 'classnames'
import { useMemo, useRef } from 'react'
import { useButton, useDateFormatter, useDateRangePicker } from 'react-aria'
import { useDateRangePickerState, type DateRangePickerStateOptions } from 'react-stately'

import { Calendar16Icon, Error12Icon } from '@oxide/design-system/icons/react'

import { TimeField } from './DateField'
import { Dialog } from './Dialog'
import { Popover } from './Popover'
import { RangeCalendar } from './RangeCalendar'

interface DateRangePickerProps extends DateRangePickerStateOptions {
  label: string
  className?: string
}

export function DateRangePicker(props: DateRangePickerProps) {
  const state = useDateRangePickerState({ ...props, shouldCloseOnSelect: false })
  const ref = useRef<HTMLDivElement>(null)
  const { groupProps, errorMessageProps, dialogProps, calendarProps, buttonProps } =
    useDateRangePicker(props, state, ref)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: realButtonProps } = useButton(buttonProps, buttonRef)

  const formatter = useDateFormatter({
    dateStyle: 'short',
    timeStyle: 'short',
    hourCycle: 'h24',
  })

  const label = useMemo(() => {
    // This is here to make TS happy. This should be impossible in practice
    // because we always pass a value to this component and there is no way to
    // unset the value through the UI.
    if (!state.dateRange) return 'No range selected'

    return formatter.formatRange(
      state.dateRange.start.toDate(getLocalTimeZone()),
      state.dateRange.end.toDate(getLocalTimeZone())
    )
  }, [state.dateRange, formatter])

  return (
    <div
      aria-label={props.label}
      className={cn('relative flex-col text-left', props.className)}
    >
      <div {...groupProps} ref={ref} className="group flex">
        <button
          {...realButtonProps}
          type="button"
          className={cn(
            state.isOpen && 'z-10 ring-2',
            'relative flex h-11 items-center rounded-l rounded-r border text-sans-md border-default focus-within:ring-2 hover:border-raise focus:z-10',
            state.isInvalid
              ? 'focus-error border-error ring-error-secondary'
              : 'border-default ring-accent-secondary'
          )}
        >
          <div className={cn('relative flex w-[17rem] items-center px-3 text-sans-md')}>
            {label}
            {state.isInvalid && (
              <div className="absolute bottom-0 right-2 top-0 flex items-center text-error">
                <Error12Icon className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="-ml-px flex h-[calc(100%-12px)] w-10 items-center justify-center rounded-r border-l outline-none border-default">
            <Calendar16Icon className="h-4 w-4 text-tertiary" />
          </div>
        </button>
      </div>
      {state.isInvalid && (
        <p {...errorMessageProps} className="py-2 text-sans-md text-error">
          Date range is invalid
        </p>
      )}
      {state.isOpen && (
        <Popover triggerRef={ref} state={state} placement="bottom start">
          <Dialog {...dialogProps}>
            <RangeCalendar {...calendarProps} />
            <div className="flex items-center space-x-2 border-t p-4 border-t-secondary">
              <TimeField
                label="Start time"
                value={state.timeRange?.start || null}
                onChange={(v: TimeValue) => state.setTime('start', v)}
                hourCycle={24}
                className="shrink-0 grow basis-0"
              />
              <div className="text-quinary">–</div>
              <TimeField
                label="End time"
                value={state.timeRange?.end || null}
                onChange={(v: TimeValue) => state.setTime('end', v)}
                hourCycle={24}
                className="shrink-0 grow basis-0"
              />
            </div>
          </Dialog>
        </Popover>
      )}
    </div>
  )
}
