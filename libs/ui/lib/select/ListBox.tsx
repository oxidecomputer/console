import type { AriaListBoxOptions } from '@react-aria/listbox'
import { type RefObject, useRef } from 'react'
import { useListBox } from 'react-aria'
import type { ListState } from 'react-stately'

import { Option } from './Option'

interface ListBoxProps extends AriaListBoxOptions<unknown> {
  listBoxRef?: RefObject<HTMLUListElement>
  state: ListState<unknown>
}

export function ListBox(props: ListBoxProps) {
  const ref = useRef<HTMLUListElement>(null)
  const { listBoxRef = ref, state } = props
  const { listBoxProps } = useListBox(props, state, listBoxRef)

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      className="ox-menu overflow-y-auto !outline-none"
    >
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </ul>
  )
}
