/**
 * Radio and RadioCard components with identical props APIs.
 *
 * Usage: just like a plain input, except that you should not pass name
 * explicitly. Instead rely on the parent RadioGroup to do that. The other
 * difference is that label content is handled through children.
 */

import type { PropsWithChildren } from 'react'
import React from 'react'
import cn from 'classnames'
import { Field } from 'formik'

// input type is fixed to "radio"
export type RadioProps = Omit<React.ComponentProps<'input'>, 'type'>

const fieldStyles = `
  peer appearance-none absolute outline-none
  border border-default h-4 w-4 rounded-full
  hover:bg-secondary hover:checked:bg-accent-dark-hover
  focus:ring-2 focus:ring-accent-secondary
  checked:bg-accent-dim checked:border-accent disabled:bg-disabled hover:disabled:bg-disabled
  disabled:hover:bg-transparent
`

export const Radio = ({ children, className, ...inputProps }: RadioProps) => (
  <label className="inline-flex items-center">
    <span className="h-4 w-4 relative">
      <Field
        className={cn(fieldStyles, className)}
        type="radio"
        {...inputProps}
      />
      {/* the dot in the middle. hide by default, use peer-checked to show if checked */}
      <div className="hidden peer-checked:block absolute w-2 h-2 left-1 top-1 rounded-full bg-accent-solid" />
    </span>

    <span className="text-sans-md text-secondary ml-2.5">{children}</span>
  </label>
)

const cardLabelStyles = `
  py-2 px-4 text-sm border rounded-sm border-default bg-default hover:bg-raise
  peer-focus:ring-2 peer-focus:ring-accent-secondary
  peer-checked:bg-accent-dim peer-checked:border-accent peer-checked:hover:bg-accent-raise 
  peer-checked:border-accent peer-checked:text-accent
  peer-disabled:bg-disabled peer-disabled:text-secondary

  children:py-2 children:px-4 children:-mx-4 children:border-secondary
  first:children:-mt-2 last:children:-mb-2
  peer-checked:children:border-accent
  cursor-pointer peer-disabled:cursor-default
`

export function RadioCard({ children, className, ...inputProps }: RadioProps) {
  // HACK: This forces the focus states for storybook stories
  const focus = className?.includes(':focus') ? ':focus' : ''
  return (
    <label className="items-center inline-flex font-mono">
      <Field
        className={cn(focus, 'peer sr-only')}
        type="radio"
        {...inputProps}
      />
      <span className={cn(cardLabelStyles, className, 'divide-y')}>
        {children}
      </span>
    </label>
  )
}

// TODO: Remove importants after tailwind variantOrder bug fixed
RadioCard.Unit = ({ children }: PropsWithChildren<unknown>) => (
  <span className="opacity-60 !p-0 !m-0">{children}</span>
)
