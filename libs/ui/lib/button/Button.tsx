import cn from 'classnames'
import type { MouseEventHandler } from 'react'
import { forwardRef } from 'react'

import { Spinner, Tooltip, Wrap } from '@oxide/ui'
import { assertUnreachable } from '@oxide/util'

import './button.css'

export const buttonSizes = ['sm', 'icon', 'base'] as const
export const variants = ['primary', 'secondary', 'ghost', 'danger'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]

const sizeStyle: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-mono-sm svg:w-4',
  // meant for buttons that only contain a single icon
  icon: 'h-8 w-8 text-mono-sm svg:w-4',
  base: 'h-10 px-3 text-mono-md svg:w-5',
}

const colorStyle = (variant: Variant): string => {
  switch (variant) {
    case 'primary':
      return 'btn-primary'
    case 'secondary':
      return 'btn-secondary'
    case 'ghost':
      return 'btn-ghost'
    case 'danger':
      return 'btn-danger'
    default:
      assertUnreachable(`Invalid button state ${variant}`, variant)
  }
}

const ringStyle = (variant: Variant) =>
  variant === 'danger' ? 'focus:ring-destructive-secondary' : 'focus:ring-accent-secondary'

const baseStyle = `
  rounded inline-flex items-center justify-center align-top
  disabled:cursor-not-allowed focus:ring-2
`

type ButtonStyleProps = {
  size?: ButtonSize
  variant?: Variant
}

export type ButtonProps = Pick<
  React.ComponentProps<'button'>,
  | 'className'
  | 'onClick'
  | 'aria-disabled'
  | 'disabled'
  | 'children'
  | 'type'
  | 'title'
  | 'form'
> &
  ButtonStyleProps & {
    innerClassName?: string
    loading?: boolean
    disabledReason?: string
  }

export const buttonStyle = ({
  size = 'base',
  variant = 'primary',
}: ButtonStyleProps = {}) => {
  return cn(
    'ox-button',
    `variant-${variant}`,
    baseStyle,
    sizeStyle[size],
    ringStyle(variant),
    colorStyle(variant)
  )
}

/**
 * When the `disabled` prop is passed to the button we put it in a visually disabled state.
 * In that case we want to override the default mouse down and click behavior to simulate a
 * disabled state.
 */
const noop: MouseEventHandler<HTMLButtonElement> = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

// Use `forwardRef` so the ref points to the DOM element (not the React Component)
// so it can be focused using the DOM API (eg. this.buttonRef.current.focus())
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      children,
      size,
      variant,
      className,
      loading,
      innerClassName,
      disabled,
      onClick,
      'aria-disabled': ariaDisabled,
      disabledReason,
      form,
      title,
    },
    ref
  ) => {
    return (
      <Wrap when={disabled && disabledReason} with={<Tooltip content={disabledReason!} />}>
        <button
          className={cn(buttonStyle({ size, variant }), className, {
            'visually-disabled': disabled,
          })}
          ref={ref}
          type={type}
          onMouseDown={disabled ? noop : undefined}
          onClick={disabled ? noop : onClick}
          aria-disabled={disabled || ariaDisabled}
          form={form}
          title={title}
        >
          <>
            {loading && <Spinner className="absolute" />}
            <span
              className={cn('flex items-center', innerClassName, { invisible: loading })}
            >
              {children}
            </span>
          </>
        </button>
      </Wrap>
    )
  }
)
