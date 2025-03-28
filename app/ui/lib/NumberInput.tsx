/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useRef, type Ref } from 'react'
import {
  useButton,
  useLocale,
  useNumberField,
  type AriaButtonProps,
  type AriaNumberFieldProps,
} from 'react-aria'
import { mergeRefs } from 'react-merge-refs'
import { useNumberFieldState } from 'react-stately'

type NumberInputProps = AriaNumberFieldProps & {
  className?: string
  error?: boolean
  ref?: Ref<HTMLInputElement>
}

export function NumberInput(props: NumberInputProps) {
  const { locale } = useLocale()
  const state = useNumberFieldState({ ...props, locale })

  const inputRef = useRef(null)
  const { groupProps, inputProps, incrementButtonProps, decrementButtonProps } =
    useNumberField(props, state, inputRef)

  return (
    <div
      className={cn(
        'relative flex rounded border',
        props.error
          ? 'border-error-secondary hover:border-error'
          : 'border-default hover:border-hover',
        props.isDisabled && '!border-default',
        props.className
      )}
      {...groupProps}
    >
      <input
        {...inputProps}
        ref={mergeRefs([props.ref, inputRef])}
        className={cn(
          `w-full rounded border-none px-3 py-[0.6875rem] !outline-offset-1 text-sans-md text-raise bg-default placeholder:text-tertiary focus:outline-none disabled:cursor-not-allowed disabled:text-secondary disabled:bg-disabled`,
          props.error && 'focus-error',
          props.isDisabled && 'text-disabled bg-disabled'
        )}
      />
      <div className="absolute bottom-0 right-0 top-0 flex flex-col border-l border-default">
        <IncrementButton {...incrementButtonProps}>
          <InputArrowIcon />
        </IncrementButton>
        <div className="h-[1px] w-full border-t border-t-default" />
        <IncrementButton {...decrementButtonProps}>
          <InputArrowIcon className="rotate-180" />
        </IncrementButton>
      </div>
    </div>
  )
}

function IncrementButton(props: AriaButtonProps<'button'> & { className?: string }) {
  const ref = useRef(null)
  const { buttonProps } = useButton(props, ref)

  return (
    <button
      type="button"
      {...buttonProps}
      className={cn(
        'flex h-1/2 w-8 items-center justify-center hover:bg-hover',
        buttonProps.disabled ? 'text-tertiary bg-disabled' : 'bg-default'
      )}
      ref={ref}
    >
      {props.children}
    </button>
  )
}

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
