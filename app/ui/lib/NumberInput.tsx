/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import { useRef, type KeyboardEvent, type Ref } from 'react'
import { mergeRefs } from 'react-merge-refs'

type NumberInputProps = {
  /**
   * Used to name the stepper buttons ("Increase X"). The input itself should
   * be labeled by a `<label htmlFor={id}>`.
   */
  label: string
  /** A non-negative safe integer, or NaN for empty */
  value: number
  /** Fires with the parsed integer on every keystroke and with NaN when cleared */
  onChange: (value: number) => void
  onBlur?: () => void
  /** Bounds for the steppers and arrow keys only. Typed values are not clamped. */
  min?: number
  max?: number
  disabled?: boolean
  error?: boolean
  className?: string
  id?: string
  name?: string
  ref?: Ref<HTMLInputElement>
}

const clamp = (value: number, min = -Infinity, max = Infinity) =>
  Math.min(Math.max(value, min), max)

/**
 * Non-negative integer input. Fully controlled: the box always shows `value`.
 * Out-of-range values are the form's job to reject with a validation message.
 * Clamping while typing rewrites what the user typed, and clamping on blur
 * silently changes it, and neither is a good time to do that.
 */
export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  error,
  className,
  ref,
  ...inputProps
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const maxValue = Math.min(max ?? Infinity, Number.MAX_SAFE_INTEGER)

  const canIncrement = !disabled && (Number.isNaN(value) || value < maxValue)
  const canDecrement =
    !disabled && (Number.isNaN(value) || min === undefined || value > min)

  const step = (direction: 1 | -1) => {
    // stepping an empty input starts from the minimum
    const next = Number.isNaN(value) ? (min ?? 0) : clamp(value + direction, min, maxValue)
    if (next !== value) {
      onChange(next)
      // Stepping changes the text programmatically, so announce the new value.
      announce(String(next), 'assertive')
    }
    inputRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.nativeEvent.isComposing)
      return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (canIncrement) step(1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (canDecrement) step(-1)
    }
  }

  return (
    <div
      className={cn(
        'relative flex rounded-md border',
        error
          ? 'border-error-secondary hover:border-error'
          : 'border-default hover:border-raise',
        disabled && 'border-default!',
        className
      )}
    >
      <input
        {...inputProps}
        ref={mergeRefs([ref, inputRef])}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={Number.isNaN(value) ? '' : String(value)}
        onChange={(e) => {
          const text = e.target.value
          // Ignore anything but digits. React resets the DOM to `value`
          // because the input is controlled, so the keystroke is a no-op.
          if (!/^\d*$/.test(text)) return
          const next = text === '' ? NaN : Number(text)
          // Larger integers lose precision and can render in scientific notation.
          if (text !== '' && !Number.isSafeInteger(next)) return
          // Object.is because NaN !== NaN
          if (!Object.is(next, value)) onChange(next)
        }}
        onKeyDown={onKeyDown}
        className={cn(
          `text-sans-md text-raise bg-default placeholder:text-tertiary disabled:text-secondary disabled:bg-disabled w-full rounded-md border-none px-3 py-2.75 outline-offset-1! focus:outline-hidden disabled:cursor-not-allowed`,
          error && 'focus-error',
          disabled && 'text-disabled bg-disabled'
        )}
      />
      <div className="border-default absolute top-0 right-0 bottom-0 flex flex-col border-l">
        <StepButton
          label={`Increase ${label}`}
          disabled={!canIncrement}
          onClick={() => step(1)}
        >
          <InputArrowIcon />
        </StepButton>
        <div className="border-t-default h-px w-full border-t" />
        <StepButton
          label={`Decrease ${label}`}
          disabled={!canDecrement}
          onClick={() => step(-1)}
        >
          <InputArrowIcon className="rotate-180" />
        </StepButton>
      </div>
    </div>
  )
}

type StepButtonProps = {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}

const StepButton = ({ label, disabled, onClick, children }: StepButtonProps) => (
  <button
    type="button"
    // keyboard users step with the arrow keys, so keep these out of the tab order
    tabIndex={-1}
    aria-label={label}
    disabled={disabled}
    // keep focus in the input so clicking a stepper doesn't blur it
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      'hover:bg-hover flex h-1/2 w-8 items-center justify-center',
      disabled ? 'text-tertiary bg-disabled' : 'bg-default'
    )}
  >
    {children}
  </button>
)

const InputArrowIcon = ({ className }: { className?: string }) => (
  <svg
    width="6"
    height="6"
    viewBox="0 0 6 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2.67844 0.535946C2.82409 0.293194 3.17591 0.293194 3.32156 0.535946L5.65924 4.43208C5.80921 4.68202 5.62917 5.00001 5.33768 5.00001L0.662322 5.00001C0.370837 5.00001 0.190795 4.68202 0.340763 4.43208L2.67844 0.535946Z"
      fill="currentColor"
    />
  </svg>
)
