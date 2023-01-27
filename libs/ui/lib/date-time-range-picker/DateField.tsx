import type { DateValue } from '@internationalized/date'
import { createCalendar } from '@internationalized/date'
import type { TimeValue } from '@react-types/datepicker'
import { useRef } from 'react'
import { useDateField, useDateSegment, useLocale, useTimeField } from 'react-aria'
import type { AriaDateFieldProps, AriaTimeFieldProps } from 'react-aria'
import { useDateFieldState, useTimeFieldState } from 'react-stately'
import type { DateFieldState, DateSegment as DateSegmentType } from 'react-stately'

export function DateField(props: AriaDateFieldProps<DateValue>) {
  const { locale } = useLocale()
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useDateField(props, state, ref)

  return (
    <div {...fieldProps} ref={ref} className="flex items-center">
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  )
}

export function TimeField(props: AriaTimeFieldProps<TimeValue>) {
  const { locale } = useLocale()
  const state = useTimeFieldState({
    ...props,
    locale,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useTimeField(props, state, ref)

  return (
    <div {...fieldProps} ref={ref} className="flex items-center">
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  )
}

function DateSegment({
  segment,
  state,
}: {
  segment: DateSegmentType
  state: DateFieldState
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)

  // todo: a little janky
  // should see if there's a way to override the library defaults
  // the problem is `mm` is so much larger than the actual months
  // so it messes with the spacing
  let placeholder = ''
  if (segment.placeholder === 'mm') {
    placeholder = '12'
  } else if (segment.placeholder === 'dd') {
    placeholder = '31'
  } else if (segment.placeholder === 'yyyy') {
    placeholder = '2023'
  } else if (segment.placeholder === '––') {
    placeholder = '00'
  } else {
    placeholder = segment.placeholder
  }

  return (
    <div
      {...segmentProps}
      ref={ref}
      style={{
        ...segmentProps.style,
        minWidth:
          (segment.maxValue != null && String(segment.maxValue).length + 'ch') || undefined,
      }}
      className="group group box-content rounded px-[1px] text-right tabular-nums outline-none text-sans-md focus:text-default focus:bg-accent-secondary-hover"
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      <span
        aria-hidden="true"
        className="block w-full text-center text-quinary group-focus:text-accent"
        style={{
          visibility: segment.isPlaceholder ? undefined : 'hidden',
          height: segment.isPlaceholder ? '' : 0,
          pointerEvents: 'none',
        }}
      >
        {placeholder}
      </span>
      <span
        className={
          segment.text === '/' ? 'text-quinary' : 'text-default group-focus:text-accent'
        }
      >
        {segment.isPlaceholder ? '' : segment.text}
      </span>
    </div>
  )
}
