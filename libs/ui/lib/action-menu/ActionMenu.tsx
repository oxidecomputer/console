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
import { invariant, isOneOf } from '@oxide/util'

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
  children: React.ReactElement[] // really only ActionMenu.Item, enforced at runtime
}

const childrenToItems = (children: React.ReactElement[]): MenuItem[] =>
  React.Children.map(children, (child) => ({
    value: child.props.children,
    onSelect: child.props.onSelect,
  }))

export function ActionMenu(props: ActionMenuProps) {
  invariant(
    isOneOf(props.children, [ActionMenu.Item]),
    'ActionMenu can only have ActionMenu.Item as a child'
  )

  const [input, setInput] = React.useState('')
  const items = matchSorter(childrenToItems(props.children), input, {
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

type ItemProps = {
  children: string
  onSelect: () => void
}

ActionMenu.Item = (_props: ItemProps) => null
