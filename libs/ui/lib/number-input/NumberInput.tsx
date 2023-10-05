import cn from 'classnames'
import React, { useRef } from 'react'
import {
  type AriaButtonProps,
  type AriaNumberFieldProps,
  useButton,
  useLocale,
  useNumberField,
} from 'react-aria'
import { mergeRefs } from 'react-merge-refs'
import { useNumberFieldState } from 'react-stately'

export type NumberInputProps = {
  className?: string
  error?: boolean
}

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  AriaNumberFieldProps & NumberInputProps
>((props: AriaNumberFieldProps & NumberInputProps, forwardedRef) => {
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
        ref={mergeRefs([forwardedRef, inputRef])}
        className={cn(
          `w-full rounded border-none px-3
      py-[0.6875rem] !outline-offset-1 text-sans-md
      text-default bg-default placeholder:text-quaternary
      focus:outline-none disabled:cursor-not-allowed disabled:text-tertiary disabled:bg-disabled`,
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
})

function IncrementButton(props: AriaButtonProps<'button'> & { className?: string }) {
  const { children } = props
  const ref = useRef(null)
  const { buttonProps } = useButton(
    {
      ...props,
    },
    ref
  )

  return (
    <button
      {...buttonProps}
      className={cn(
        'flex h-1/2 w-8 items-center justify-center hover:bg-hover',
        buttonProps.disabled ? 'text-quaternary bg-disabled' : 'bg-default'
      )}
      ref={ref}
    >
      {children}
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
