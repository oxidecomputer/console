import { getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { TimeValue } from '@react-types/datepicker'
import cn from 'classnames'
import { useMemo, useRef } from 'react'
import { useButton, useDatePicker } from 'react-aria'
import { useDateFormatter } from 'react-aria'
import { useDatePickerState } from 'react-stately'
import type { DatePickerStateOptions } from 'react-stately'

import { Calendar16Icon, Error12Icon } from '../icons'
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
            'relative flex h-10  items-center rounded-l rounded-r border text-sans-md border-default focus-within:ring-2 hover:bg-raise focus:z-10',
            state.validationState === 'invalid'
              ? 'focus-error border-error ring-error-secondary'
              : 'border-default ring-accent-secondary'
          )}
        >
          <div className={cn('relative flex w-[10rem] items-center px-3 text-sans-md')}>
            {label}
            {state.validationState === 'invalid' && (
              <div className="absolute right-2 top-0 bottom-0 flex items-center text-error">
                <Error12Icon className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="-ml-px flex h-[calc(100%-12px)] w-10 items-center justify-center rounded-r border-l outline-none border-default">
            <Calendar16Icon className="h-4 w-4 text-tertiary" />
          </div>
        </button>
      </div>
      {state.validationState === 'invalid' && (
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
                className="flex-grow"
              />
            </div>
          </Dialog>
        </Popover>
      )}
    </div>
  )
}
