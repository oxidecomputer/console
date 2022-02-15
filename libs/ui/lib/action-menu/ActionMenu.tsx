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

export interface MenuItem {
  value: string
  action: () => void
}

export interface ActionMenuProps {
  isOpen: boolean
  onDismiss: () => void
  className?: string
  inputClassName?: string
  items: MenuItem[]
  ariaLabel: string
}

export function ActionMenu(props: ActionMenuProps) {
  const [input, setInput] = React.useState('')
  return (
    <Dialog
      className={cn(
        'ActionMenu !mt-[20vh] !w-1/3 p-0',
        props.items.length > 0 ? 'rounded-t-sm' : 'rounded-sm'
      )}
      aria-label={props.ariaLabel}
    >
      <Combobox
        onSelect={(value) => {
          // have to find by value string because we can't give option a value
          // of the whole item object
          props.items.find((i) => i.value === value)?.action()
        }}
      >
        <ComboboxInput
          autocomplete={false}
          className={cn(
            'mousetrap w-full border p-4 bg-raise border-secondary focus:outline-none',
            props.items.length > 0 ? 'rounded-t-sm' : 'rounded-sm',
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
            {props.items.map((item) => (
              <ComboboxOption
                className="rounded border !p-4 text-sans-md text-secondary bg-raise border-secondary hover:bg-secondary-hover"
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
