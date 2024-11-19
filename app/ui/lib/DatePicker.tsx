/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, type DateValue } from '@internationalized/date'
import type { TimeValue } from '@react-types/datepicker'
import cn from 'classnames'
import { useMemo, useRef } from 'react'
import { useButton, useDateFormatter, useDatePicker } from 'react-aria'
import { useDatePickerState, type DatePickerStateOptions } from 'react-stately'

import { Calendar16Icon, Error12Icon } from '@oxide/design-system/icons/react'

import { Calendar } from './Calendar'
import { TimeField } from './DateField'
import { Dialog } from './Dialog'
import { Popover } from './Popover'

interface DatePickerProps extends DatePickerStateOptions<DateValue> {
  label: string
  className?: string
}

export function DatePicker(props: DatePickerProps) {
  const state = useDatePickerState({ ...props, shouldCloseOnSelect: false })
  const ref = useRef<HTMLDivElement>(null)
  const { groupProps, errorMessageProps, dialogProps, calendarProps, buttonProps } =
    useDatePicker(props, state, ref)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: realButtonProps } = useButton(buttonProps, buttonRef)

  const formatter = useDateFormatter({
    dateStyle: 'short',
    timeStyle: 'short',
    hourCycle: 'h24',
  })

  const label = useMemo(() => {
    return state.dateValue
      ? formatter.format(state.dateValue.toDate(getLocalTimeZone()))
      : ''
  }, [state, formatter])

  const handleSetTime = (v: TimeValue) => {
    if (v !== null) {
      state.setTimeValue(v)
    }
  }

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
          <div className={cn('relative flex w-[10rem] items-center px-3 text-sans-md')}>
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
          Date is invalid
        </p>
      )}
      {state.isOpen && (
        <Popover triggerRef={ref} state={state} placement="bottom start">
          <Dialog {...dialogProps}>
            <Calendar {...calendarProps} />
            <div className="flex items-center space-x-2 border-t p-4 border-t-secondary">
              <TimeField
                value={state.timeValue}
                onChange={handleSetTime}
                hourCycle={24}
                className="grow"
              />
            </div>
          </Dialog>
        </Popover>
      )}
    </div>
  )
}
