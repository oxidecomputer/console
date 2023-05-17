import { getLocalTimeZone } from '@internationalized/date'
import type { TimeValue } from '@react-types/datepicker'
import cn from 'classnames'
import { useRef } from 'react'
import { useMemo } from 'react'
import { useButton, useDateRangePicker } from 'react-aria'
import { useDateFormatter } from 'react-aria'
import { useDateRangePickerState } from 'react-stately'
import type { DateRangePickerStateOptions } from 'react-stately'

import { Calendar16Icon, Error12Icon } from '../icons'
import { TimeField } from './DateField'
import { Dialog } from './Dialog'
import { Popover } from './Popover'
import { RangeCalendar } from './RangeCalendar'

interface RelativeDateRangePickerProps extends DateRangePickerStateOptions {
  label: string
}

export function RelativeDateRangePicker(props: RelativeDateRangePickerProps) {
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

  const label = useMemo(
    () =>
      formatter.formatRange(
        state.dateRange.start.toDate(getLocalTimeZone()),
        state.dateRange.end.toDate(getLocalTimeZone())
      ),
    [state, formatter]
  )

  return (
    <div aria-label={props.label} className="relative flex-col text-left">
      <div {...groupProps} ref={ref} className="group flex">
        <div
          className={cn(
            'relative flex h-10 items-center rounded-l border pl-2 pr-8 border-default focus-within:ring-2 focus-within:ring-accent-secondary',
            state.validationState === 'invalid' ? 'border-error' : 'border-default'
          )}
        >
          {label}
          {state.validationState === 'invalid' && (
            <div className="absolute right-2 top-0 bottom-0 flex items-center text-error">
              <Error12Icon className="h-3 w-3" />
            </div>
          )}
        </div>
        <button
          {...realButtonProps}
          type="button"
          className={cn(
            '-ml-px flex w-10 items-center justify-center rounded-r border outline-none border-default hover:bg-secondary focus:z-10',
            state.isOpen && 'z-10 ring-2 ring-accent-secondary'
          )}
        >
          <Calendar16Icon className="h-4 w-4 text-tertiary" />
        </button>
      </div>
      {state.validationState === 'invalid' && (
        <p {...errorMessageProps} className="mt-1 text-sans-sm text-error">
          Insert error message here
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
                className="flex-shrink-0 flex-grow basis-0"
              />
              <div className="text-quinary">–</div>
              <TimeField
                label="End time"
                value={state.timeRange?.end || null}
                onChange={(v: TimeValue) => state.setTime('end', v)}
                hourCycle={24}
                className="flex-shrink-0 flex-grow basis-0"
              />
            </div>
          </Dialog>
        </Popover>
      )}
    </div>
  )
}
