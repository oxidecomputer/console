import type { PropsWithChildren } from 'react'
import React, { forwardRef } from 'react'
import cn from 'classnames'

export const buttonSizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const
export const variants = ['solid', 'dim', 'ghost', 'link'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]

const sizeStyle: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-sm svg:w-4',
  sm: 'h-9 px-3 text-sm svg:w-4',
  base: 'h-10 px-4 text-sm svg:w-5',
  lg: 'h-11 px-5 text-base svg:w-5',
  xl: 'h-12 px-6 text-base svg:w-6',
}

const variantStyle: Record<Variant, string> = {
  solid: `
    bg-green-500 border-transparent text-black
    hover:bg-green-600 disabled:bg-gray-200
  `,
  dim: `
    bg-green-900 border-transparent text-green-500 hover:bg-green-950
    disabled:text-green-700 disabled:bg-green-900
  `,
  ghost: `
    text-white border-green-500 hover:bg-green-900 
    disabled:border-green-700 disabled:bg-black disabled:text-gray-100
  `,
  // note h-auto overriding size style
  link: 'border-transparent text-green-500 !h-auto !leading-5 !px-0.5 hover:underline',
}

const baseStyle = `
  border rounded-px uppercase
  inline-flex items-center justify-center align-top
  disabled:cursor-not-allowed
  focus:ring-2 focus:ring-green-700
`

export type ButtonProps = React.ComponentPropsWithRef<'button'> & {
  fullWidth?: boolean
  size?: ButtonSize
  variant?: Variant
}

// Use `forwardRef` so the ref points to the DOM element (not the React Component)
// so it can be focused using the DOM API (eg. this.buttonRef.current.focus())
export const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(
  (
    {
      children,
      fullWidth = false,
      size = 'base',
      variant = 'solid',
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          baseStyle,
          sizeStyle[size],
          variantStyle[variant],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        type="button"
        {...rest}
      >
        {children}
      </button>
    )
  }
)
