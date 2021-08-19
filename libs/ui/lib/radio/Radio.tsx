import React from 'react'

type InputProps = {
  id: string
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
export const Radio = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, ...rest }, outerRef) => {
    // null, not blank (undefined), otherwise TS is mad when ref passed to input
    const defaultRef = React.useRef<HTMLInputElement>(null)
    const ref = outerRef || defaultRef

    const baseStyle = `
      appearance-none border border-gray-300 h-4 w-4 rounded-full absolute outline-none
      disabled:cursor-not-allowed
      focus:ring-2 focus:ring-green-700
      hover:bg-gray-400
      checked:bg-green-900 checked:border-green-500 hover:checked:bg-green-950
    `

    return (
      <div className="flex">
        <div className="h-4 w-4 relative">
          <input className={baseStyle} type="radio" ref={ref} {...rest} />

          {rest.checked && (
            <div
              className="
                absolute w-[8px] h-[8px] left-[4px] top-[4px] rounded-full
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
