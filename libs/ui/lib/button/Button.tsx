import cn from 'classnames'
import type { MouseEventHandler } from 'react'
import { forwardRef } from 'react'

import { Spinner } from '@oxide/ui'
import { assertUnreachable } from '@oxide/util'

import './button.css'

export const buttonSizes = ['sm', 'base'] as const
export const variants = ['default', 'ghost', 'link'] as const
export const colors = ['primary', 'secondary', 'destructive', 'notice'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]
export type Color = typeof colors[number]

const sizeStyle: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-mono-sm svg:w-4',
  base: 'h-10 px-3 text-mono-md svg:w-5',
}

const colorStyle = (variant: Variant, color: Color): string => {
  const style: `${Variant} ${Color}` = `${variant} ${color}`
  switch (style) {
    case 'default primary':
      return 'btn-primary'
    case 'default secondary':
      return 'btn-secondary-solid'
    case 'default destructive':
      return 'btn-destructive'
    case 'default notice':
      return 'btn-notice'
    case 'ghost primary':
      return 'btn-primary-ghost'
    case 'ghost secondary':
      return 'btn-secondary'
    case 'ghost destructive':
      return 'btn-destructive-ghost'
    case 'ghost notice':
      return 'btn-notice-ghost'
    case 'link primary':
      return 'btn-primary-link'
    case 'link secondary':
      return 'btn-secondary-link'
    case 'link notice':
      return 'btn-notice-link'
    case 'link destructive':
      return 'btn-destructive-link'
    default:
      assertUnreachable(`Invalid button state ${style}`, style)
  }
}

const ringStyle = (color: Color) =>
  color === 'destructive'
    ? 'focus:ring-destructive-secondary'
    : color === 'notice'
    ? 'focus:ring-notice-secondary'
    : 'focus:ring-accent-secondary'

const baseStyle = `
  rounded inline-flex items-center justify-center align-top
  disabled:cursor-not-allowed focus:ring-2
`

type ButtonStyleProps = {
  size?: ButtonSize
  variant?: Variant
  color?: Color
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
  }

export const buttonStyle = ({
  size = 'base',
  variant = 'default',
  color = 'primary',
}: ButtonStyleProps = {}) => {
  return cn(
    'ox-button',
    `variant-${variant}`,
    baseStyle,
    sizeStyle[size],
    ringStyle(color),
    colorStyle(variant, color)
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
      color,
      className,
      loading,
      innerClassName,
      disabled,
      onClick,
      'aria-disabled': ariaDisabled,
      form,
      title,
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonStyle({ size, variant, color }), className, {
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
          <span className={cn('flex items-center', innerClassName, { invisible: loading })}>
            {children}
          </span>
        </>
      </button>
    )
  }
)
