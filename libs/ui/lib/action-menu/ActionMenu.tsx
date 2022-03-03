import Dialog from '@reach/dialog'
import React, { useState } from 'react'
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

export function ActionMenu(props: ActionMenuProps) {
  const [input, setInput] = useState('')
  const items = matchSorter(props.items, input, {
    keys: ['value'],
    // use original order as tiebreaker instead of, e.g., alphabetical
    baseSort: (a, b) => (a.index < b.index ? -1 : 1),
  })

  // items without a navGroup label are considered actions and rendered first
  const actions = items.filter((i) => !i.navGroup)

  // TODO: repent. this is horrible
  const groupedItems = Object.entries(
    groupBy(
      items.filter((i) => i.navGroup),
      (i) => i.navGroup! // eslint-disable-line @typescript-eslint/no-non-null-assertion
    )
  )

  const allGroups: [string, QuickActionItem[]][] =
    actions.length > 0
      ? [['Actions', items.filter((i) => !i.navGroup)], ...groupedItems]
      : groupedItems

  const itemsInOrder = ([] as QuickActionItem[]).concat(
    ...allGroups.map(([_, items]) => items)
  )

  const [selectedIdx, setSelectedIdx] = useState(0)
  const selectedItem = itemsInOrder[selectedIdx] as QuickActionItem | undefined

  function onDismiss() {
    setInput('')
    setSelectedIdx(0)
    props.onDismiss()
  }

  return (
    <Dialog
      className="ActionMenu !mt-[20vh] !w-[31] bg-transparent p-0"
      aria-label={props.ariaLabel}
      isOpen={props.isOpen}
      onDismiss={onDismiss}
    >
      <div
        onKeyDown={(e) => {
          switch (e.key) {
            case 'Enter':
              if (selectedItem) {
                selectedItem.onSelect()
                onDismiss()
              }
              break
            case 'ArrowDown':
              setSelectedIdx((i) => (i === itemsInOrder.length - 1 ? 0 : i + 1))
              break
            case 'ArrowUp':
              setSelectedIdx((i) => (i === 0 ? itemsInOrder.length - 1 : i - 1))
              break
          }
        }}
        role="combobox"
        tabIndex={-1}
        aria-controls="TODO"
        aria-expanded
      >
        <input
          className={cn(
            'mousetrap shadow-black/25 block w-full overflow-y-auto rounded-[3px] border p-4 shadow-2xl text-sans-xl bg-raise border-secondary focus:outline-none',
            props.inputClassName
          )}
          style={{ maxHeight: 'calc(80vh - 80px)' }}
          value={input}
          onChange={(e) => {
            setSelectedIdx(0)
            setInput(e.target.value)
          }}
          placeholder="Find anything..."
        />
        <div className="mt-5 !border-none !bg-transparent shadow children:between:border-t-0">
          <ul>
            {allGroups.map(([label, items]) => (
              <>
                <h3 className="rounded-t-[3px] px-4 py-2 text-mono-sm text-secondary bg-secondary">
                  {label}
                </h3>
                {items.map((item) => (
                  // TODO: there is probably a more correct way of fixing this reasonable lint error.
                  // Putting a button inside the <li> is not a great solution because it becomes
                  // focusable separate from the item selection
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    role="option"
                    className={cn(
                      'hover:bg-raise-hover -mt-px cursor-pointer border p-4 text-sans-md text-secondary bg-raise border-tertiary last:rounded-b-[3px]',
                      item.value === selectedItem?.value &&
                        'outline outline-1 text-accent bg-accent-secondary outline-accent hover:bg-accent-secondary-hover'
                    )}
                    aria-selected={item.value === selectedItem?.value}
                    // TODO: there's probably an aria property to put on when it's highlighted
                    key={item.value}
                    onClick={() => {
                      item.onSelect()
                      onDismiss()
                    }}
                  >
                    {item.value}
                  </li>
                ))}
              </>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  )
}
