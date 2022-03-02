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
import { groupBy } from '@oxide/util'

export interface QuickActionItem {
  value: string
  // strings are paths to navigate() to
  // onSelect: string | (() => void)
  onSelect: () => void
  navGroup?: string
}

export interface ActionMenuProps {
  isOpen: boolean
  onDismiss: () => void
  className?: string
  inputClassName?: string
  ariaLabel: string
  items: QuickActionItem[]
}

type OptionGroupProps = {
  label?: string
  items: QuickActionItem[]
}

function OptionGroup({ label, items }: OptionGroupProps) {
  return (
    <>
      {label && (
        <h3 className="rounded-t-[3px] px-4 py-2 text-mono-sm text-secondary bg-secondary">
          {label}
        </h3>
      )}
      {items.map((item) => (
        <ComboboxOption
          className="-mt-px border p-4 text-sans-md text-secondary bg-raise border-tertiary last:rounded-b-[3px] hover:bg-secondary-hover"
          key={item.value}
          value={item.value}
        />
      ))}
    </>
  )
}

export function ActionMenu(props: ActionMenuProps) {
  const [input, setInput] = React.useState('')
  const items = matchSorter(props.items, input, {
    keys: ['value'],
    // use original order as tiebreaker instead of, e.g., alphabetical
    baseSort: (a, b) => (a.index < b.index ? -1 : 1),
  })

  // items without a navGroup label are considered actions and rendered first
  const actions = items.filter((i) => !i.navGroup)

  const navGroups = groupBy(
    items.filter((i) => i.navGroup),
    (i) => i.navGroup! // eslint-disable-line @typescript-eslint/no-non-null-assertion
  )

  function onDismiss() {
    setInput('')
    props.onDismiss()
  }

  return (
    <Dialog
      className="ActionMenu !mt-[20vh] !w-[31] bg-transparent p-0"
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
            'mousetrap block w-full rounded-[3px] border p-4 shadow bg-raise border-secondary focus:outline-none',
            props.inputClassName
          )}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Find anything..."
        />
        <ComboboxPopover
          portal={false}
          className="mt-5 !border-none !bg-transparent shadow children:between:border-t-0"
        >
          <ComboboxList>
            {actions.length > 0 && (
              <OptionGroup label="Actions" items={actions} />
            )}
            {Object.entries(navGroups).map(([label, items]) => (
              <OptionGroup label={label} key={label} items={items} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </Dialog>
  )
}
