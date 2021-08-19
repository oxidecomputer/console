import React from 'react'

import CheckIcon from '../../assets/check.svg'
import { classed } from '../../util/classed'

type InputProps = {
  indeterminate?: boolean
  label?: string | React.ReactFragment
} & React.ComponentProps<'input'>

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

// TODO: we may end up wanting to call this IndeterminateCheckbox (ew) if
// we need to distinguish it from one without that state. or not
export const Checkbox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ indeterminate, label, ...rest }, outerRef) => {
    // null, not blank (undefined), otherwise TS is mad when ref passed to input
    const defaultRef = React.useRef<HTMLInputElement>(null)
    const ref = outerRef || defaultRef

    React.useEffect(() => {
      // TODO: this makes types pass by basically ignoring callback refs. see more
      // sophisticated approach here:
      // https://github.com/tannerlinsley/react-table/discussions/1989#discussioncomment-1488
      if (typeof ref !== 'function' && ref?.current) {
        ref.current.indeterminate = indeterminate ?? false
      }
    }, [ref, indeterminate])

    // everything above is to make the native input work with indeterminate. you
    // can't pass indeterminate as a prop, it has to be set on a ref which is
    // passed to the input. We could skip the forwardRef and outerRef bit
    // altogether (just use defaultRef), but this makes it so we can pass a ref
    // from outside if we want

    return (
      <label className="inline-flex items-center">
        <span className="h-4 w-4 relative">
          <input className={inputStyle} type="checkbox" ref={ref} {...rest} />
          {rest.checked && !indeterminate && <Check />}
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
)
