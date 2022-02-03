import React from 'react'
import { Checkmark12Icon } from '@oxide/ui'
import { classed } from '@oxide/util'
import cn from 'classnames'

const Check = () => (
  <Checkmark12Icon className="absolute w-3 h-2.5 left-0.5 top-0.5 fill-current text-accent" />
)

const Indeterminate = classed.div`absolute w-2 h-0.5 left-1 top-[7px] bg-accent-solid`

const inputStyle = `
  appearance-none border border-default h-4 w-4 rounded-sm absolute left-0 outline-none
  disabled:cursor-not-allowed
  focus:ring-2 focus:ring-accent-secondary
  hover:bg-secondary
  checked:bg-accent-dim checked:border-accent hover:checked:bg-accent-dark-hover
  indeterminate:bg-accent-dim indeterminate:border-accent hover:indeterminate:bg-accent-dark-hover
`

export type CheckboxProps = {
  indeterminate?: boolean
  children?: React.ReactNode
  className?: string
} & React.ComponentProps<'input'>

// ref function is from: https://davidwalsh.name/react-indeterminate. this makes
// the native input work with indeterminate. you can't pass indeterminate as a
// prop; it has to be set directly on the element through a ref. more elaborate
// examples using forwardRef to allow passing ref from outside:
// https://github.com/tannerlinsley/react-table/discussions/1989

export const Checkbox = ({
  indeterminate,
  children,
  className,
  ...inputProps
}: CheckboxProps) => (
  <label className="inline-flex items-center">
    <span className="h-4 w-4 relative">
      <input
        className={cn(inputStyle, className)}
        type="checkbox"
        ref={(el) => el && (el.indeterminate = !!indeterminate)}
        {...inputProps}
      />
      {inputProps.checked && !indeterminate && <Check />}
      {indeterminate && <Indeterminate />}
    </span>

    {children && (
      <span className="text-sans-md text-secondary ml-2.5">{children}</span>
    )}
  </label>
)
