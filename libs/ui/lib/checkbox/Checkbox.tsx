/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import { Checkmark12Icon } from '@oxide/design-system/icons/react'
import { classed } from '@oxide/util'

const Check = () => (
  <Checkmark12Icon className="pointer-events-none absolute left-0.5 top-0.5 hidden h-3 w-3 fill-current text-accent" />
)

const Indeterminate = classed.div`absolute w-2 h-0.5 left-1 top-[7px] bg-accent pointer-events-none`

const inputStyle = `
  appearance-none border border-default bg-default h-4 w-4 rounded-sm absolute left-0 outline-none
  disabled:cursor-not-allowed
  hover:border-hover hover:cursor-pointer
  checked:bg-accent-secondary checked:border-accent-secondary checked:hover:border-accent [&:checked+svg]:block
  indeterminate:bg-accent-secondary indeterminate:border-accent hover:indeterminate:bg-accent-secondary-hover
`

export type CheckboxProps = {
  indeterminate?: boolean
  children?: React.ReactNode
  className?: string
} & Omit<React.ComponentProps<'input'>, 'type'>

// ref function is from: https://davidwalsh.name/react-indeterminate. this makes
// the native input work with indeterminate. you can't pass indeterminate as a
// prop; it has to be set directly on the element through a ref. more elaborate
// examples using forwardRef to allow passing ref from outside:
// https://github.com/tannerlinsley/react-table/discussions/1989

/** Checkbox component that handles label, styling, and indeterminate state */
export const Checkbox = ({
  indeterminate,
  children,
  className,
  ...inputProps
}: CheckboxProps) => (
  <label className="items-top inline-flex">
    <span className="relative h-4 w-4">
      <input
        className={cn(inputStyle, className)}
        type="checkbox"
        ref={(el) => el && (el.indeterminate = !!indeterminate)}
        {...inputProps}
      />
      {!indeterminate && <Check />}
      {indeterminate && <Indeterminate />}
    </span>

    {children && <span className="ml-2.5 text-sans-md text-secondary">{children}</span>}
  </label>
)
