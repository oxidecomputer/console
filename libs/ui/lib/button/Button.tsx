import React, { forwardRef } from 'react'
import cn from 'classnames'
import { match } from 'ts-pattern'
import { invariant } from '@oxide/util'

export const buttonSizes = ['xs', 'sm', 'base'] as const
export const variants = ['solid', 'dim', 'ghost', 'link'] as const
export const colors = ['accent', 'destructive', 'notice', 'secondary'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]
export type Color = typeof colors[number]

const sizeStyle: Record<ButtonSize, string> = {
  xs: 'h-8 px-2 text-mono-sm svg:w-4',
  sm: 'h-9 px-3 text-mono-md svg:w-4',
  base: 'h-10 px-3 text-mono-lg svg:w-5',
}

const colorStyle = (variant: Variant, color: Color) =>
  match<`${Variant} ${Color}`>(`${variant} ${color}`)
    .with('solid accent', () => `.btn-solid-accent`)
    .with('solid notice', () => `.btn-solid-notice`)
    .with('solid destructive', () => `.btn-solid-destructive`)
    .with('dim accent', () => `.btn-dim-accent`)
    .with('dim notice', () => `.btn-dim-notice`)
    .with('dim destructive', () => `.btn-dim-destructive`)
    .exhaustive()

const ringStyle = (color: Color) =>
  match(color)
    .with('destructive', (_) => 'focus:ring-destructive-secondary')
    .with('notice', (_) => 'focus:ring-notice-secondary')
    .otherwise((_) => 'focus:ring-accent-secondary')

// const variantStyle: Record<Variant, string> = {
//   solid: `
//     bg-green-500 border-transparent text-black
//     hover:bg-green-600 disabled:bg-gray-200
//   `,
//   dim: `
//     bg-green-950 border-transparent text-green-500 hover:bg-green-900
//     disabled:text-green-700 disabled:bg-green-900
//   `,
//   ghost: `
//     text-white border-green-500 hover:bg-green-900
//     disabled:border-green-700 disabled:bg-black disabled:text-gray-100
//   `,
//   // note h-auto overriding size style
//   link: 'border-transparent text-green-500 !h-auto !leading-5 !px-0.5 hover:underline',
// }

const baseStyle = `
  rounded-sm uppercase font-mono
  inline-flex items-center justify-center align-top
  disabled:cursor-not-allowed
  focus:ring-2
`

type ButtonStyleProps = {
  size?: ButtonSize
  variant?: Variant
  color?: Color
}

export type ButtonProps = React.ComponentPropsWithRef<'button'> &
  ButtonStyleProps

export const buttonStyle = ({
  size = 'base',
  variant = 'solid',
  color = 'accent',
}: ButtonStyleProps = {}) =>
  cn(baseStyle, sizeStyle[size], ringStyle(color), colorStyle(variant, color))

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
