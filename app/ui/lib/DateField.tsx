/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createCalendar, type DateValue } from '@internationalized/date'
import type { TimeValue } from '@react-types/datepicker'
import cn from 'classnames'
import { useRef } from 'react'
import {
  useDateField,
  useDateSegment,
  useLocale,
  useTimeField,
  type AriaDateFieldProps,
  type AriaTimeFieldProps,
} from 'react-aria'
import {
  useDateFieldState,
  useTimeFieldState,
  type DateFieldState,
  type DateSegment as DateSegmentType,
} from 'react-stately'

const dateTimeFieldStyles = 'flex items-center rounded border p-2'

interface DateFieldProps extends AriaDateFieldProps<DateValue> {
  className?: string
}

export function DateField(props: DateFieldProps) {
  const { locale } = useLocale()
  const state = useDateFieldState({
    ...props,
    granularity: 'day',
    locale,
    createCalendar,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useDateField(props, state, ref)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        state.value === null ? 'border-error' : 'border-default',
        dateTimeFieldStyles,
        props.className
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  )
}

interface TimeFieldProps extends AriaTimeFieldProps<TimeValue> {
  className?: string
}

export function TimeField(props: TimeFieldProps) {
  const { locale } = useLocale()
  const state = useTimeFieldState({
    ...props,
    locale,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useTimeField(props, state, ref)

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        state.value === null ? 'border-error' : 'border-default',
        dateTimeFieldStyles,
        props.className
      )}
    >
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

  const readOnly = segmentProps['aria-readonly'] ? true : false

  return (
    <div
      {...segmentProps}
      ref={ref}
      style={{
        ...segmentProps.style,
        minWidth:
          (segment.maxValue != null && String(segment.maxValue).length + 'ch') || undefined,
      }}
      className={cn(
        'group box-content rounded px-[1px] text-right tabular-nums outline-none',
        !readOnly && 'focus:text-raise focus:bg-accent-secondary-hover',
        segment.type === 'timeZoneName' ? 'ml-1 text-sans-sm' : 'text-sans-md'
      )}
      // Segment props turns this into a focusable element
      // @ts-expect-error
      disabled={readOnly ? true : false}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      <span
        aria-hidden="true"
        className={cn(
          'block w-full text-center text-quaternary',
          !readOnly && 'focus:text-raise'
        )}
        style={{
          visibility: segment.isPlaceholder ? undefined : 'hidden',
          height: segment.isPlaceholder ? '' : 0,
          pointerEvents: 'none',
        }}
      >
        {placeholder}
      </span>
      <span
        className={cn(
          segment.type === 'literal' || segment.type === 'timeZoneName'
            ? 'text-tertiary'
            : 'text-raise',
          !readOnly && 'group-focus:text-accent'
        )}
      >
        {segment.isPlaceholder ? '' : segment.text}
      </span>
    </div>
  )
}
