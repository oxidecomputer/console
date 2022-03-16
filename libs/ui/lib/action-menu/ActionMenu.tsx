import Dialog from '@reach/dialog'
import React, { useState } from 'react'
import cn from 'classnames'
import { matchSorter } from 'match-sorter'
import { groupBy } from '@oxide/util'
import { useSteppedScroll } from '../hooks/use-stepped-scroll'

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

const LIST_HEIGHT = 384

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

  const divRef = React.createRef<HTMLDivElement>()
  const ulRef = React.createRef<HTMLUListElement>()

  useSteppedScroll(divRef, ulRef, selectedIdx, LIST_HEIGHT)

  function onDismiss() {
    setInput('')
    setSelectedIdx(0)
    props.onDismiss()
  }

  return (
    <Dialog
      className="ActionMenu mt-[20vh] !w-[46rem] bg-transparent p-0"
      aria-label={props.ariaLabel}
      isOpen={props.isOpen}
      onDismiss={onDismiss}
    >
      <div
        onKeyDown={(e) => {
          const lastIdx = itemsInOrder.length - 1
          if (e.key === 'Enter') {
            if (selectedItem) {
              selectedItem.onSelect()
              onDismiss()
            }
          } else if (e.key === 'ArrowDown') {
            const newIdx = selectedIdx === lastIdx ? 0 : selectedIdx + 1
            setSelectedIdx(newIdx)
          } else if (e.key === 'ArrowUp') {
            const newIdx = selectedIdx === 0 ? lastIdx : selectedIdx - 1
            setSelectedIdx(newIdx)
          }
        }}
        role="combobox"
        tabIndex={-1}
        aria-controls="TODO"
        aria-expanded
      >
        <input
          className={cn(
            'mousetrap shadow-black/25 block w-full overflow-y-auto rounded-[3px] border px-4 py-2.5 caret-gray-100 shadow-2xl text-sans-xl bg-raise border-secondary focus:outline-none',
            props.inputClassName
          )}
          value={input}
          onChange={(e) => {
            setSelectedIdx(0)
            setInput(e.target.value)
          }}
          placeholder="Search"
        />
        <div className="relative mt-5 transform-gpu overflow-hidden rounded-[3px]">
          <div
            className="overflow-y-auto"
            ref={divRef}
            style={{ maxHeight: LIST_HEIGHT }}
          >
            <ul ref={ulRef}>
              {allGroups.map(([label, items]) => (
                <React.Fragment key={label}>
                  <div>
                    <h3
                      className={cn(
                        'sticky top-0 z-20 px-4 py-2 text-mono-sm text-secondary bg-secondary'
                      )}
                    >
                      {label}
                    </h3>
                    {items.map((item, idx) => (
                      // TODO: there is probably a more correct way of fixing this reasonable lint error.
                      // Putting a button inside the <li> is not a great solution because it becomes
                      // focusable separate from the item selection
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                      <div className={cn('relative', idx !== 0 && '-mt-px')}>
                        {item.value === selectedItem?.value && (
                          <div className="absolute z-10 h-full w-full rounded-[3px] border border-accent" />
                        )}

                        <li
                          role="option"
                          className={cn(
                            'box-border block h-full w-full cursor-pointer overflow-visible border p-4 text-sans-md text-secondary bg-raise border-tertiary border-tertiary hover:bg-raise-hover',
                            item.value === selectedItem?.value &&
                              'text-accent bg-accent-secondary hover:bg-accent-secondary-hover'
                          )}
                          aria-selected={item.value === selectedItem?.value}
                          key={item.value}
                          onClick={() => {
                            item.onSelect()
                            onDismiss()
                          }}
                        >
                          {item.value}
                        </li>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </ul>
          </div>
          <div className="flex justify-between rounded-b-[3px] px-4 py-2 text-secondary bg-secondary">
            <ActionMenuHotkey keys={['Enter']} action="submit" />

            <ActionMenuHotkey
              keys={['Arrow Up', 'Arrow Down']}
              action="select"
            />

            <ActionMenuHotkey keys={['Esc']} action="close" />
          </div>
        </div>
      </div>
    </Dialog>
  )
}

interface ActionMenuHotkeyProps {
  keys: Array<String>
  action: String
}

export const ActionMenuHotkey = ({ keys, action }: ActionMenuHotkeyProps) => (
  <div>
    <div className="mr-1 inline-block">
      {keys.map((hotkey) => (
        <span className="mr-1 inline-block rounded border py-1 px-2 text-mono-xs text-default border-default">
          {hotkey}
        </span>
      ))}
    </div>
    <span className="text-sans-sm text-tertiary">to {action}</span>
  </div>
)
