/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Radio and RadioCard components with identical props APIs.
 *
 * Usage: just like a plain input, except that you should not pass name
 * explicitly. Instead rely on the parent RadioGroup to do that. The other
 * difference is that label content is handled through children.
 */
import cn from 'classnames'
import type { ComponentProps } from 'react'

// input type is fixed to "radio"
export type RadioProps = Omit<React.ComponentProps<'input'>, 'type'>

const fieldStyles = `
  peer appearance-none absolute outline-none
  border border-default h-4 w-4 rounded-full bg-default hover:border-hover checked:hover:border-accent
  checked:bg-accent-secondary checked:border-accent-secondary disabled:bg-disabled hover:disabled:bg-disabled
  disabled:hover:bg-transparent
`

export const Radio = ({ children, className, ...inputProps }: RadioProps) => (
  <label className="inline-flex items-center">
    <span className="relative h-4 w-4">
      <input className={cn(fieldStyles, className)} type="radio" {...inputProps} />
      {/* the dot in the middle. hide by default, use peer-checked to show if checked */}
      <div className="pointer-events-none absolute left-1 top-1 hidden h-2 w-2 rounded-full bg-accent peer-checked:block" />
    </span>

    {children && <span className="ml-2.5 text-sans-md text-default">{children}</span>}
  </label>
)

const cardLabelStyles = `
  py-2 px-4 text-sans-md border rounded border-default bg-default hover:border-hover
  peer-focus:ring-2 peer-focus:ring-accent-secondary  w-44

  children:py-3 children:px-3 children:-mx-4 children:border-secondary
  first:children:-mt-2 last:children:-mb-2 cursor-pointer

  peer-checked:bg-accent-secondary
  peer-checked:border-accent-secondary peer-checked:hover:border-accent peer-checked:children:border-accent peer-checked:children:border-accent-secondary
  peer-checked:text-accent peer-checked:[&>*_.text-default]:text-accent-secondary

  peer-disabled:cursor-not-allowed
  peer-disabled:bg-disabled peer-disabled:peer-checked:bg-accent-secondary
  peer-checked:peer-disabled:hover:border-accent-secondary peer-disabled:hover:border-default
  peer-disabled:[&>*_.text-default]:text-disabled peer-disabled:text-disabled peer-disabled:peer-checked:text-accent-disabled peer-disabled:peer-checked:[&>*_.text-default]:text-accent-disabled
`

export function RadioCard({ children, className, ...inputProps }: RadioProps) {
  // HACK: This forces the focus states for storybook stories
  const focus = className?.includes(':focus') ? ':focus' : ''
  return (
    <label className="inline-flex items-center">
      <input className={cn(focus, 'peer sr-only')} type="radio" {...inputProps} />
      <span className={cn('ox-radio-card divide-y', cardLabelStyles, className)}>
        {children}
      </span>
    </label>
  )
}

// TODO: Remove importants after tailwind variantOrder bug fixed
RadioCard.Unit = ({ children, className, ...props }: ComponentProps<'span'>) => (
  <span className={cn('!m-0 !p-0 text-default', className)} {...props}>
    {children}
  </span>
)
