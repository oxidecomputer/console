import React from 'react'

const labelStyles = `
  text-sm py-2 px-4 bg-gray-500 border rounded border-gray-400 
  hover:text-green-500 peer-focus:ring-2 peer-focus:ring-green-700
  peer-checked:bg-green-900 peer-checked:border-green-500 peer-checked:text-green-500
`

type Props = React.ComponentProps<'input'>

export const RadioCard = ({ children, ...inputProps }: Props) => (
  <label className="items-center inline-flex">
    <input className="peer sr-only" type="radio" {...inputProps} />
    <span className={labelStyles}>{children}</span>
  </label>
)
