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
  border border-gray-300 h-4 w-4 rounded-full
  hover:bg-gray-400 hover:checked:bg-green-950
  focus:ring-2 focus:ring-green-700
  checked:bg-green-900 checked:border-green-500
  disabled:hover:bg-transparent
`

export const Radio = ({ children, ...inputProps }: RadioProps) => (
  <label className="inline-flex items-center">
    <span className="h-4 w-4 relative">
      <Field className={fieldStyles} type="radio" {...inputProps} />
      {/* the dot in the middle. hide by default, use peer-checked to show if checked */}
      <div className="hidden peer-checked:block absolute w-2 h-2 left-1 top-1 rounded-full bg-green-500" />
    </span>

    <span className="text-xs uppercase font-mono ml-2.5">{children}</span>
  </label>
)

const cardLabelStyles = `
  py-2 px-4 text-sm border rounded border-gray-400 bg-gray-500 hover:bg-gray-550
  peer-focus:ring-2 peer-focus:ring-green-700
  peer-checked:bg-green-900 peer-checked:border-green-500 peer-checked:hover:bg-green-950 
  peer-checked:border-green-500 peer-checked:text-green-500
  peer-disabled:hover:text-gray-100 peer-disabled:text-gray-100 peer-disabled:hover:border-gray-400 
  peer-disabled:hover:bg-gray-500

  children:py-2 children:px-4 children:-mx-4 children:border-gray-400
  first:children:-mt-2 last:children:-mb-2
  peer-checked:children:border-green-500
  cursor-pointer peer-disabled:cursor-default
`

export function RadioCard({ children, className, ...inputProps }: RadioProps) {
  return (
    <label className={cn('items-center inline-flex font-mono', className)}>
      <Field className="peer sr-only" type="radio" {...inputProps} />
      <span className={cn(cardLabelStyles, 'divide-y')}>{children}</span>
    </label>
  )
}

// TODO: Remove importants after tailwind variantOrder bug fixed
RadioCard.Unit = ({ children }: PropsWithChildren<unknown>) => (
  <span className="opacity-60 !p-0 !m-0">{children}</span>
)
