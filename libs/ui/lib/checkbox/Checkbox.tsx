import React from 'react'

import CheckIcon from '../../assets/check.svg'
import { classed } from '../../util/classed'

const Check = () => (
  <CheckIcon className="absolute w-2.5 h-2 left-[3px] top-1 fill-current text-green-500" />
)

const Indeterminate = classed.div`absolute w-2 h-0.5 left-1 top-[7px] bg-green-500`

const inputStyle = `
  appearance-none border border-gray-300 h-4 w-4 rounded absolute left-0 outline-none
  disabled:cursor-not-allowed
  focus:ring-2 focus:ring-green-700
  hover:bg-gray-400
  checked:bg-green-900 checked:border-green-500 hover:checked:bg-green-950
  indeterminate:bg-green-900 indeterminate:border-green-500 hover:indeterminate:bg-green-950
`

type Props = {
  indeterminate?: boolean
  label?: React.ReactNode
} & React.ComponentProps<'input'>

export const Checkbox = ({ indeterminate, label, ...inputProps }: Props) => {
  // null, not blank (undefined), otherwise TS is mad when ref passed to input
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false
    }
  }, [ref, indeterminate])

  // the above makes the native input work with indeterminate. you can't pass
  // indeterminate as a prop; it has to be set on a ref, which is then passed to
  // the input. see more elaborate examples here using forwardRef to allow
  // passing ref from outside:
  // https://github.com/tannerlinsley/react-table/discussions/1989

  return (
    <label className="inline-flex items-center">
      <span className="h-4 w-4 relative">
        <input
          className={inputStyle}
          type="checkbox"
          ref={ref}
          {...inputProps}
        />
        {inputProps.checked && !indeterminate && <Check />}
        {indeterminate && <Indeterminate />}
      </span>

      {label && (
        <span className="text-xs text-gray-200 uppercase font-mono ml-2.5">
          {label}
        </span>
      )}
    </label>
  )
}
