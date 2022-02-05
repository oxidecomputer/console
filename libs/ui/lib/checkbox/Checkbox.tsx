import { Checkmark12Icon } from '@oxide/ui'
import React from 'react'

import { classed } from '@oxide/util'

const Check = () => (
  <Checkmark12Icon className="absolute left-0.5 top-0.5 h-2.5 w-3 fill-current text-green-500" />
)

const Indeterminate = classed.div`absolute w-2 h-0.5 left-1 top-[7px] bg-green-500`

const inputStyle = `
  appearance-none border border-gray-300 h-4 w-4 rounded-sm absolute left-0 outline-none
  disabled:cursor-not-allowed
  focus:ring-2 focus:ring-green-700
  hover:bg-gray-400
  checked:bg-green-900 checked:border-green-500 hover:checked:bg-green-950
  indeterminate:bg-green-900 indeterminate:border-green-500 hover:indeterminate:bg-green-950
`

export type CheckboxProps = {
  indeterminate?: boolean
  children?: React.ReactNode
} & React.ComponentProps<'input'>

// ref function is from: https://davidwalsh.name/react-indeterminate. this makes
// the native input work with indeterminate. you can't pass indeterminate as a
// prop; it has to be set directly on the element through a ref. more elaborate
// examples using forwardRef to allow passing ref from outside:
// https://github.com/tannerlinsley/react-table/discussions/1989

export const Checkbox = ({
  indeterminate,
  children,
  ...inputProps
}: CheckboxProps) => (
  <label className="inline-flex items-center">
    <span className="relative h-4 w-4">
      <input
        className={inputStyle}
        type="checkbox"
        ref={(el) => el && (el.indeterminate = !!indeterminate)}
        {...inputProps}
      />
      {inputProps.checked && !indeterminate && <Check />}
      {indeterminate && <Indeterminate />}
    </span>

    {children && (
      <span className="text-xs ml-2.5 font-mono uppercase text-gray-200">
        {children}
      </span>
    )}
  </label>
)
