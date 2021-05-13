import type { SerializedStyles } from '@emotion/react'
import type { PropsWithChildren } from 'react'
import React, { forwardRef } from 'react'

import type { TwStyle } from 'twin.macro'
import tw, { css, theme } from 'twin.macro'

export const buttonSizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const
export const variants = ['ghost', 'link', 'outline', 'solid', 'subtle'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]

const sizeStyle: Record<ButtonSize, TwStyle> = {
  xs: tw`h-8 px-3 text-sm svg:w-4`,
  sm: tw`h-9 px-3 text-sm svg:w-4`,
  base: tw`h-10 px-4 text-sm svg:w-5`,
  lg: tw`h-11 px-5 text-base svg:w-5`,
  xl: tw`h-12 px-6 text-base svg:w-6`,
}

const ring = (color: string) => css`
  box-shadow: inset 0 0 0 1px ${color};
`

const focusRing = (color: string) => css`
  &:focus {
    ${ring(color)};
  }
`

const variantStyle: Record<Variant, Array<TwStyle | SerializedStyles>> = {
  subtle: [
    tw`
      bg-dark-green-800 text-green-400
      hover:not-disabled:bg-dark-green-700
    `,
    focusRing(theme`colors.green.400`),
  ],
  outline: [
    tw`
      bg-dark-green-800 text-green-400
      hover:not-disabled:bg-dark-green-900
      focus:bg-dark-green-800
    `,
    focusRing(theme`colors.green.300`),
    ring(theme`colors.green.500`),
  ],
  ghost: [
    tw`
      text-green-400
      hover:not-disabled:(bg-dark-green-900)
      focus:bg-dark-green-800!
    `,
    focusRing(theme`colors.green.300`),
  ],
  link: [
    tw`
      text-green-500 h-auto p-1  // note h-auto overriding size style
      hover:not-disabled:(underline)
    `,
    focusRing(theme`colors.green.400`),
  ],
  solid: [
    tw`
      bg-green-600 text-green-50
      hover:not-disabled:(bg-green-700 border-green-700)
      disabled:opacity-64
    `,
    focusRing(theme`colors.white`),
  ],
}

const baseStyle = tw`
  border-2 border-transparent rounded-none uppercase
  inline-flex items-center justify-center align-top
  disabled:(cursor-not-allowed opacity-40) focus:outline-none
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
    { children, fullWidth = false, size = 'base', variant = 'solid', ...rest },
    ref
  ) => {
    return (
      <button
        css={[
          baseStyle,
          sizeStyle[size],
          variantStyle[variant],
          fullWidth && tw`w-full`,
        ]}
        ref={ref}
        type="button"
        {...rest}
      >
        {children}
      </button>
    )
  }
)
