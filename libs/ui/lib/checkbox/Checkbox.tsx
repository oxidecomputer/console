import React from 'react'

import CheckIcon from '../../assets/check.svg'

type InputProps = {
  id: string
  indeterminate?: boolean
  label?: string | React.ReactFragment
} & React.ComponentProps<'input'>

type LabelProps = React.ComponentProps<'label'>
const Label = ({ children, ...labelProps }: LabelProps) => (
  <label {...labelProps} className="flex items-baseline font-mono ml-2.5">
    <span className="flex items-baseline text-xs text-gray-200 uppercase">
      {children}
    </span>
  </label>
)

// TODO: we may end up wanting to call this IndeterminateCheckbox (ew) if
// we need to distinguish it from one without that state. or not
export const Checkbox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, indeterminate, label, ...rest }, outerRef) => {
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

    // everything above is just to make the native one work. you can't pass
    // indeterminate as a prop, it has to be set on a ref which is passed to the
    // input. so the above (and probably also the whole forwardRef) can go away
    // once the custom one is in

    const baseStyle = `
      appearance-none border border-gray-300 h-4 w-4 rounded absolute
      disabled:cursor-not-allowed
      focus:ring-2 focus:ring-green-700
      hover:bg-gray-400
      checked:bg-green-900 checked:border-green-500 hover:checked:bg-green-950
      indeterminate:bg-green-900 indeterminate:border-green-500 hover:indeterminate:bg-green-950
    `

    return (
      <div className="flex">
        <div className="h-4 w-4 relative">
          <input className={baseStyle} type="checkbox" ref={ref} {...rest} />

          {rest.checked && !indeterminate && (
            <CheckIcon
              className="
                absolute w-[10px] h-[8px] left-[3px] top-[4px]
                fill-current text-green-500
              "
            />
          )}

          {indeterminate && (
            <div
              className="
                absolute w-[8px] h-[2px] left-[4px] top-[7px]
                bg-green-500
              "
            />
          )}
        </div>

        {label && <Label htmlFor={id}>{label}</Label>}
      </div>
    )
  }
)
