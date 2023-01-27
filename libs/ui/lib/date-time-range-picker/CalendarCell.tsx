import type { CalendarDate } from '@internationalized/date'
import { getDayOfWeek, isSameDay } from '@internationalized/date'
import cn from 'classnames'
import { useRef } from 'react'
import { mergeProps, useCalendarCell, useFocusRing, useLocale } from 'react-aria'
import type { CalendarState, RangeCalendarState } from 'react-stately'

export interface CalendarCellProps {
  state: CalendarState | RangeCalendarState
  date: CalendarDate
}

export function CalendarCell({ state, date }: CalendarCellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isInvalid,
  } = useCalendarCell({ date }, state, ref)

  // The start and end date of the selected range will have
  // an emphasized appearance.
  const isSelectionStart = (state as RangeCalendarState).highlightedRange
    ? isSameDay(date, (state as RangeCalendarState).highlightedRange.start)
    : isSelected
  const isSelectionEnd = (state as RangeCalendarState).highlightedRange
    ? isSameDay(date, (state as RangeCalendarState).highlightedRange.end)
    : isSelected

  // We add rounded corners on the left for the first day of the month,
  // the first day of each week, and the start date of the selection.
  // We add rounded corners on the right for the last day of the month,
  // the last day of each week, and the end date of the selection.
  const { locale } = useLocale()
  const dayOfWeek = getDayOfWeek(date, locale)
  const isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1)
  const isRoundedRight =
    isSelected &&
    (isSelectionEnd || dayOfWeek === 6 || date.day === date.calendar.getDaysInMonth(date))

  const { focusProps } = useFocusRing()

  return (
    <td {...cellProps} className="relative">
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={cn(
          'group',
          'focus:outline-none',
          'my-0.5 h-8 w-10 text-center text-mono-md',
          isSelectionStart || isSelectionEnd
            ? isInvalid
              ? '!text-error'
              : '!text-accent'
            : '',
          isSelected && !isDisabled
            ? isInvalid
              ? 'text-error bg-error-secondary'
              : 'text-accent-secondary bg-accent-secondary'
            : 'text-tertiary hover:bg-tertiary',
          isRoundedLeft && 'rounded-l',
          isRoundedRight && 'rounded-r',
          // Hover state for non-selected cells.
          !isSelected && !isDisabled ? 'rounded' : ''
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute top-[2px] left-[1px] right-[1px] bottom-[2px] rounded',
            isSelectionStart || isSelectionEnd
              ? isInvalid
                ? 'border border-error-secondary'
                : 'border border-accent-secondary'
              : '',
            isSelected && !isDisabled
              ? isInvalid
                ? 'group-hover:bg-error-secondary-hover'
                : 'group-hover:bg-accent-secondary-hover'
              : '',
            !isSelected && !isDisabled ? 'hover:bg-tertiary' : ''
          )}
        />
        <div
          className={cn(
            'relative z-10 flex h-full w-full items-center justify-center',
            isDisabled && !isInvalid
              ? 'disabled cursor-not-allowed text-disabled !bg-raise'
              : ''
          )}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  )
}
