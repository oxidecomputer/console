/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, type DateValue } from '@internationalized/date'
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
    hourCycle: 'h23',
  })

  const label = useMemo(() => {
    return state.dateValue
      ? formatter.format(state.dateValue.toDate(getLocalTimeZone()))
      : ''
  }, [state, formatter])

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
            'text-sans-md border-default hover:border-raise bg-default relative flex h-11 items-center rounded-l-md rounded-r-md border focus-within:ring-2 focus:z-10',
            state.isInvalid
              ? 'focus-error border-error ring-error-secondary'
              : 'border-default ring-accent-secondary'
          )}
        >
          <div className={cn('text-sans-md relative flex w-40 items-center px-3')}>
            {label}
            {state.isInvalid && (
              <div className="text-error absolute top-0 right-2 bottom-0 flex items-center">
                <Error12Icon className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="border-default -ml-px flex h-[calc(100%-12px)] w-10 items-center justify-center rounded-r-md border-l outline-hidden">
            <Calendar16Icon className="text-secondary h-4 w-4" />
          </div>
        </button>
      </div>
      {state.isInvalid && (
        <p {...errorMessageProps} className="text-sans-md text-error py-2">
          Date is invalid
        </p>
      )}
      {state.isOpen && (
        <Popover triggerRef={ref} state={state} placement="bottom start">
          <Dialog {...dialogProps}>
            <Calendar {...calendarProps} />
            <div className="border-t-secondary flex items-center space-x-2 border-t p-4">
              <TimeField
                value={state.timeValue}
                onChange={(v) => {
                  if (v !== null) state.setTimeValue(v)
                }}
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
