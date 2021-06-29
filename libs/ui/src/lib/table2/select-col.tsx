import type { Row, TableInstance } from 'react-table'
import React from 'react'

const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean }
>(({ indeterminate, ...rest }, outerRef) => {
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

  return <input type="checkbox" ref={ref} {...rest} />
})

// TODO: make this generic instead of using any?
export const selectCol = {
  id: 'selection',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Header: (props: TableInstance<any>) => (
    <div>
      <IndeterminateCheckbox {...props.getToggleAllRowsSelectedProps()} />
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cell: ({ row }: { row: Row<any> }) => (
    <div className="text-center">
      <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
    </div>
  ),
}
