import React from 'react'

import { classed } from '../../util/classed'

type Props = {
  label: React.ReactNode
} & React.ComponentProps<'input'>

const Dot = classed.div`absolute w-2 h-2 left-1 top-1 rounded-full bg-green-500`

const baseStyle = `
  appearance-none border border-gray-300 h-4 w-4 rounded-full absolute outline-none
  disabled:cursor-not-allowed
  focus:ring-2 focus:ring-green-700
  hover:bg-gray-400
  checked:bg-green-900 checked:border-green-500 hover:checked:bg-green-950
`

export const Radio = ({ label, ...inputProps }: Props) => (
  <label className="inline-flex items-center">
    <span className="h-4 w-4 relative">
      <input className={baseStyle} type="radio" {...inputProps} />
      {inputProps.checked && <Dot />}
    </span>

    <span className="text-xs text-gray-200 uppercase font-mono ml-2.5">
      {label}
    </span>
  </label>
)
