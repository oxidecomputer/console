/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Dialog from '@radix-ui/react-dialog'
import cn from 'classnames'
import { matchSorter } from 'match-sorter'
import React, { useState } from 'react'

import { Close12Icon } from '@oxide/design-system/icons/react'
import { classed, groupBy } from '@oxide/util'

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
  'aria-label': string
  items: QuickActionItem[]
}

const LIST_HEIGHT = 384

const Outline = classed.div`absolute z-10 h-full w-full border border-accent pointer-events-none`

export function ActionMenu(props: ActionMenuProps) {
  const [input, setInput] = useState('')
  // TODO: filter by both nav group and item value
  const items = matchSorter(props.items, input, {
    keys: ['value'],
    // use original order as tiebreaker instead of, e.g., alphabetical
    baseSort: (a, b) => (a.index < b.index ? -1 : 1),
  })

  // items without a navGroup label are considered actions and rendered first
  const actions = items.filter((i) => !i.navGroup)

  // TODO: repent. this is horrible
  const groupedItems = groupBy(
    items.filter((i) => i.navGroup),
    (i) => i.navGroup!
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
  const inputRef = React.createRef<HTMLInputElement>()

  useSteppedScroll(divRef, ulRef, selectedIdx, LIST_HEIGHT)

  function onDismiss() {
    setInput('')
    setSelectedIdx(0)
    props.onDismiss()
  }

  return (
    <Dialog.Root
      aria-label={props['aria-label']}
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) onDismiss()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent fixed inset-0 mt-[20vh] !w-[46rem] bg-transparent p-0">
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
            <div
              className={cn(
                'flex h-14 w-full overflow-y-auto rounded-lg border bg-raise border-secondary elevation-3'
              )}
            >
              <input
                ref={inputRef}
                className={cn(
                  'mousetrap caret-gray-100 w-full bg-transparent px-4 text-sans-xl focus:outline-none',
                  props.inputClassName
                )}
                value={input}
                onChange={(e) => {
                  setSelectedIdx(0)
                  setInput(e.target.value)
                }}
                placeholder="Search"
                spellCheck="false"
              />

              {input.length > 0 && (
                <button
                  className="flex items-center py-6 pl-6 pr-4 text-secondary"
                  onClick={() => {
                    setInput('')
                    inputRef.current?.focus()
                  }}
                >
                  <Close12Icon />
                </button>
              )}

              <button
                onClick={onDismiss}
                className="flex h-full items-center border-l px-6 align-middle text-mono-sm text-secondary border-secondary"
              >
                Dismiss
              </button>
            </div>

            {items.length > 0 && (
              <div className="relative mt-5 transform-gpu overflow-hidden rounded-lg elevation-3">
                <div
                  className="overflow-y-auto"
                  ref={divRef}
                  style={{ maxHeight: LIST_HEIGHT }}
                >
                  <ul ref={ulRef}>
                    {allGroups.map(([label, items]) => (
                      <div key={label}>
                        <h3 className="sticky top-0 z-20 h-[32px] px-4 py-2 text-mono-sm text-secondary bg-tertiary">
                          {label}
                        </h3>
                        {items.map((item) => (
                          <div
                            key={item.value}
                            className="relative -mt-px first-of-type:mt-0"
                          >
                            {item.value === selectedItem?.value && <Outline />}

                            {/*
                          TODO: there is probably a more correct way of fixing this reasonable lint error.
                          Putting a button inside the <li> is not a great solution because it becomes
                          focusable separate from the item selection
                        */}

                            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                            <li
                              role="option"
                              className={cn(
                                'box-border block h-full w-full cursor-pointer select-none overflow-visible border p-4 text-sans-md text-secondary bg-raise border-secondary hover:bg-hover',
                                item.value === selectedItem?.value &&
                                  'text-accent bg-accent-secondary hover:bg-accent-secondary-hover'
                              )}
                              aria-selected={item.value === selectedItem?.value}
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
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between rounded-b-[3px] px-4 py-2 text-secondary bg-tertiary">
                  <ActionMenuHotkey keys={['Enter']} action="submit" />
                  <ActionMenuHotkey keys={['Arrow Up', 'Arrow Down']} action="select" />
                  <ActionMenuHotkey keys={['Esc']} action="close" />
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface ActionMenuHotkeyProps {
  keys: Array<string>
  action: string
}

export const ActionMenuHotkey = ({ keys, action }: ActionMenuHotkeyProps) => (
  <div>
    <div className="mr-1 inline-block">
      {keys.map((hotkey) => (
        <kbd
          key={hotkey}
          className="mr-1 inline-block rounded border border-[rgba(255,255,255,.15)] px-2 py-1 text-mono-xs text-default"
        >
          {hotkey}
        </kbd>
      ))}
    </div>
    <span className="text-sans-sm text-tertiary">to {action}</span>
  </div>
)
