import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import Dialog from '@reach/dialog'
import React from 'react'
import './ActionMenu.css'
import cn from 'classnames'
import { matchSorter } from 'match-sorter'

export interface MenuItem {
  value: string
  onSelect: () => void
}

export interface ActionMenuProps {
  isOpen: boolean
  onDismiss: () => void
  className?: string
  inputClassName?: string
  ariaLabel: string
  items: MenuItem[]
}

export function ActionMenu(props: ActionMenuProps) {
  const [input, setInput] = React.useState('')
  const items = matchSorter(props.items, input, {
    keys: ['value'],
    // use original order as tiebreaker instead of, e.g., alphabetical
    baseSort: (a, b) => (a.index < b.index ? -1 : 1),
  })

  function onDismiss() {
    setInput('')
    props.onDismiss()
  }

  return (
    <Dialog
      className="ActionMenu !mt-[20vh] !w-1/3 p-0"
      aria-label={props.ariaLabel}
      isOpen={props.isOpen}
      onDismiss={onDismiss}
    >
      <Combobox
        onSelect={(value) => {
          // have to find by value string because we can't give option a value
          // of the whole item object
          const item = items.find((i) => i.value === value)
          if (item) {
            item.onSelect()
            onDismiss()
          }
        }}
        openOnFocus
      >
        <ComboboxInput
          autocomplete={false}
          className={cn(
            'mousetrap w-full border p-4 bg-raise border-secondary focus:outline-none',
            props.inputClassName
          )}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Find anything..."
        />
        <ComboboxPopover
          portal={false}
          className="!border-none !bg-transparent children:between:border-t-0"
        >
          <ComboboxList>
            {items.map((item) => (
              <ComboboxOption
                className="-mt-px border !p-4 text-sans-md text-secondary bg-raise border-secondary hover:bg-secondary-hover"
                key={item.value}
                value={item.value}
              />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </Dialog>
  )
}
