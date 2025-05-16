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
import { useRef, useState } from 'react'

import { Close12Icon } from '@oxide/design-system/icons/react'

import { KEYS } from '~/ui/util/keys'
import { groupBy } from '~/util/array'
import { classed } from '~/util/classed'

import { DialogOverlay } from './DialogOverlay'
import { useSteppedScroll } from './use-stepped-scroll'

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

  const divRef = useRef<HTMLDivElement>(null)
  const ulRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        <DialogOverlay />
        <Dialog.Content className="fixed inset-0 z-(--z-modal) mx-auto mt-[20vh] w-184 bg-transparent p-0">
          <div
            onKeyDown={(e) => {
              const lastIdx = itemsInOrder.length - 1
              if (e.key === KEYS.enter) {
                if (selectedItem) {
                  selectedItem.onSelect()
                  e.preventDefault()
                  onDismiss()
                }
              } else if (e.key === KEYS.down) {
                const newIdx = selectedIdx === lastIdx ? 0 : selectedIdx + 1
                setSelectedIdx(newIdx)
              } else if (e.key === KEYS.up) {
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
                'bg-raise border-secondary elevation-3 flex h-14 w-full overflow-y-auto rounded-lg border'
              )}
            >
              <input
                ref={inputRef}
                className={cn(
                  'mousetrap text-sans-xl w-full bg-transparent px-4 caret-gray-100 focus:outline-none',
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
                  type="button"
                  className="text-default flex items-center py-6 pr-4 pl-6"
                  onClick={() => {
                    setInput('')
                    inputRef.current?.focus()
                  }}
                >
                  <Close12Icon />
                </button>
              )}

              <button
                type="button"
                onClick={onDismiss}
                className="text-mono-sm text-default border-secondary flex h-full items-center border-l px-6 align-middle"
              >
                Dismiss
              </button>
            </div>

            {items.length > 0 && (
              <div className="elevation-3 relative mt-5 transform-gpu overflow-hidden rounded-lg">
                <div
                  className="overflow-y-auto"
                  ref={divRef}
                  style={{ maxHeight: LIST_HEIGHT }}
                >
                  <ul ref={ulRef}>
                    {allGroups.map(([label, items]) => (
                      <div key={label}>
                        <h3 className="text-mono-sm text-default bg-tertiary sticky top-0 z-20 h-[32px] px-4 py-2">
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
                                'text-sans-md text-default bg-raise border-secondary hover:bg-hover box-border block h-full w-full cursor-pointer overflow-visible border p-4 select-none',
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
                <div className="text-default bg-tertiary flex justify-between rounded-b-[3px] px-4 py-2">
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
          className="text-mono-xs text-raise mr-1 inline-block rounded border border-[rgba(255,255,255,.15)] px-2 py-1"
        >
          {hotkey}
        </kbd>
      ))}
    </div>
    <span className="text-sans-sm text-secondary">to {action}</span>
  </div>
)
