import React from 'react'

type Props = { indeterminate?: boolean } & React.ComponentProps<'input'>

// TODO: we may end up wanting to call this IndeterminateCheckbox (ew) if
// we need to distinguish it from one without that state. or not
export const Checkbox = React.forwardRef<HTMLInputElement, Props>(
  ({ indeterminate, ...rest }, outerRef) => {
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

    const checkmark = indeterminate ? '-' : rest.checked ? '✓' : ''

    return (
      <div>
        <div>
          <h3 className="mb-2">Native</h3>
          <input type="checkbox" ref={ref} {...rest} />
        </div>
        <div>
          <h3 className="my-2">Custom</h3>
          <div className="h-6 w-6 border">{checkmark}</div>
        </div>
      </div>
    )
  }
)
