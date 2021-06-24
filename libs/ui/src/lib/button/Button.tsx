import type { PropsWithChildren } from 'react'
import React, { forwardRef } from 'react'
import type { TwStyle } from 'twin.macro'
import tw from 'twin.macro'

export const buttonSizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const
export const variants = ['solid', 'subtle', 'outline', 'ghost', 'link'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]

const sizeStyle: Record<ButtonSize, TwStyle> = {
  xs: tw`h-8 px-3 text-sm svg:w-4`,
  sm: tw`h-9 px-3 text-sm svg:w-4`,
  base: tw`h-10 px-4 text-sm svg:w-5`,
  lg: tw`h-11 px-5 text-base svg:w-5`,
  xl: tw`h-12 px-6 text-base svg:w-6`,
}

const variantStyle: Record<Variant, TwStyle> = {
  solid: tw`
    bg-green-500 text-black
    hover:not-disabled:(bg-green-600 border-green-600)
    disabled:opacity-64
    focus:shadow-ring-white
  `,
  subtle: tw`
    bg-green-900 text-green-500
    hover:not-disabled:bg-green-950
    focus:shadow-ring-green-500
  `,
  outline: tw`
    bg-green-900 text-green-500 shadow-ring-green-500
    hover:not-disabled:bg-TODO
    focus:(bg-green-900 shadow-ring-TODO)
  `,
  ghost: tw`
    text-green-500
    hover:not-disabled:(bg-green-900)
    focus:(bg-green-900! shadow-ring-green-500)
  `,
  link: tw`
    text-green-500 h-auto p-1  // note h-auto overriding size style
    hover:not-disabled:(underline)
    focus:shadow-ring-green-500
  `,
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
