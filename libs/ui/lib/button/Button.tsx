import cn from 'classnames'
import { forwardRef } from 'react'

import { assertUnreachable } from '@oxide/util'

import './button.css'

export const buttonSizes = ['xs', 'sm', 'base'] as const
export const variants = ['default', 'secondary', 'ghost', 'link'] as const
export const colors = ['accent', 'destructive', 'notice', 'neutral'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]
export type Color = typeof colors[number]

const sizeStyle: Record<ButtonSize, string> = {
  xs: 'h-8 px-2 text-mono-sm svg:w-4',
  sm: 'h-9 px-3 text-mono-md svg:w-4',
  base: 'h-10 px-3 text-mono-lg svg:w-5',
}

const colorStyle = (variant: Variant, color: Color): string => {
  const style: `${Variant} ${Color}` = `${variant} ${color}`
  switch (style) {
    case 'default accent':
      return 'btn-accent'
    case 'default notice':
      return 'btn-notice'
    case 'default destructive':
      return 'btn-destructive'
    case 'default neutral':
      return 'btn-secondary'
    case 'secondary accent':
      return 'btn-accent-secondary'
    case 'secondary notice':
      return 'btn-notice-secondary'
    case 'secondary destructive':
      return 'btn-destructive-secondary'
    case 'secondary neutral':
      return 'btn-not-implemented'
    case 'ghost accent':
      return 'btn-ghost-accent'
    case 'ghost notice':
      return 'btn-ghost-notice'
    case 'ghost destructive':
      return 'btn-ghost-destructive'
    case 'ghost neutral':
      return 'btn-ghost-secondary'
    case 'link accent':
      return 'btn-link-accent'
    case 'link notice':
      return 'btn-link-notice'
    case 'link destructive':
      return 'btn-link-destructive'
    case 'link neutral':
      return 'btn-link-secondary'
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

export type ButtonProps = React.ComponentPropsWithRef<'button'> & ButtonStyleProps

export const buttonStyle = ({
  size = 'base',
  variant = 'default',
  color = 'accent',
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

// Use `forwardRef` so the ref points to the DOM element (not the React Component)
// so it can be focused using the DOM API (eg. this.buttonRef.current.focus())
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size, variant, color, className, ...rest }, ref) => {
    return (
      <button
        className={cn(buttonStyle({ size, variant, color }), className)}
        ref={ref}
        type="button"
        {...rest}
      >
        {children}
      </button>
    )
  }
)
