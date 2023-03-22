import type { DateValue } from '@internationalized/date'
import cn from 'classnames'
import { useRef } from 'react'
import { useButton, useDatePicker } from 'react-aria'
import { useDatePickerState } from 'react-stately'
import type { DatePickerStateOptions } from 'react-stately'

import { Calendar16Icon, Error12Icon } from '../icons'
import { Calendar } from './Calendar'
import { DateField, TimeField } from './DateField'
import { Dialog } from './Dialog'
import { Popover } from './Popover'

interface DatePickerProps extends DatePickerStateOptions<DateValue> {
  label: string
}

export function DatePicker(props: DatePickerProps) {
  const state = useDatePickerState({ ...props, shouldCloseOnSelect: false })
  const ref = useRef<HTMLDivElement>(null)
  const { groupProps, fieldProps, dialogProps, calendarProps, buttonProps } = useDatePicker(
    props,
    state,
    ref
  )

  const buttonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: realButtonProps } = useButton(buttonProps, buttonRef)

  return (
    <div aria-label={props.label} className="relative inline-flex flex-col text-left">
      <div {...groupProps} ref={ref} className="group flex">
        <div className="relative flex h-10 items-center rounded-l border p-2 pr-10 border-default focus-within:ring-2 focus-within:ring-accent-secondary">
          <DateField {...fieldProps} />
          {state.validationState === 'invalid' && (
            <div className="absolute right-2 top-0 bottom-0 flex items-center text-error">
              <Error12Icon className="h-3 w-3" />
            </div>
          )}
        </div>
        <button
          {...realButtonProps}
          type="button"
          onClick={state.open}
          className={cn(
            '-ml-px flex w-10 items-center justify-center rounded-r border outline-none border-default hover:bg-secondary focus:z-10',
            state.isOpen && 'z-10 ring-2 ring-accent-secondary'
          )}
        >
          <Calendar16Icon className="h-4 w-4 text-tertiary" />
        </button>
      </div>
      {state.isOpen && (
        <Popover triggerRef={ref} state={state} placement="bottom start">
          <Dialog {...dialogProps}>
            <Calendar {...calendarProps} />
            <div className="flex items-center border-t p-4 border-t-secondary">
              <TimeField
                value={state.timeValue}
                onChange={state.setTimeValue}
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
