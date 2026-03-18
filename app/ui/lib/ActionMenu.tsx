/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import cn from 'classnames'
import { matchSorter } from 'match-sorter'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import * as R from 'remeda'

import { Close12Icon } from '@oxide/design-system/icons/react'

import { KEYS } from '~/ui/util/keys'
import { classed } from '~/util/classed'

import { DialogOverlay } from './DialogOverlay'
import { useSteppedScroll } from './use-stepped-scroll'

export type QuickActionItem = {
  value: string
  navGroup: string
  /** Path string to navigate to or callback to invoke */
  action: string | (() => void)
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

const liBase =
  'text-sans-md border-secondary box-border block h-full w-full cursor-pointer overflow-visible border select-none'
const liSelected = 'text-accent bg-accent hover:bg-accent-hover'
const liDefault = 'text-default bg-raise hover:bg-hover'

export function ActionMenu(props: ActionMenuProps) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  // TODO: filter by both nav group and item value
  const items = matchSorter(props.items, input, {
    keys: ['value'],
    // use original order as tiebreaker instead of, e.g., alphabetical
    baseSort: (a, b) => (a.index < b.index ? -1 : 1),
  })

  const allGroups = R.pipe(
    items,
    R.groupBy((i) => i.navGroup),
    R.entries(),
    // "Actions" first so page-level create/add actions are always at the top.
    // Other sorting by group that we've already done in the calling code is
    // preserved.
    R.sortBy(([key]) => key !== 'Actions')
  )
  const itemsInOrder = allGroups.flatMap(([_, items]) => items)
  // Map each item to its global index for O(1) lookup during render
  const itemIndex = new Map(itemsInOrder.map((item, i) => [item, i]))

  const [selectedIdx, setSelectedIdx] = useState(0)
  const selectedItem = itemsInOrder.at(selectedIdx)

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
    <BaseDialog.Root
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) onDismiss()
      }}
    >
      <BaseDialog.Portal>
        <DialogOverlay />
        <BaseDialog.Popup
          aria-label={props['aria-label']}
          className="fixed inset-0 z-(--z-modal) mx-auto mt-[20vh] w-184 bg-transparent p-0"
        >
          <div
            onKeyDown={(e) => {
              const lastIdx = itemsInOrder.length - 1
              if (e.key === KEYS.enter) {
                if (selectedItem) {
                  if (typeof selectedItem.action === 'function') {
                    selectedItem.action()
                  } else {
                    navigate(selectedItem.action)
                  }
                  e.preventDefault()
                  onDismiss()
                }
              } else if (e.key === KEYS.down || (e.ctrlKey && e.key === 'n')) {
                e.preventDefault()
                const newIdx = selectedIdx === lastIdx ? 0 : selectedIdx + 1
                setSelectedIdx(newIdx)
              } else if (e.key === KEYS.up || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault()
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
                'bg-raise shadow-modal flex h-14 w-full overflow-y-auto rounded-lg'
              )}
            >
              <input
                // jsx-ally no-autofocus rule contradicts WAI-ARIA guidelines on
                // modal dialogs
                // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/816
                // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
                // oxlint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                ref={inputRef}
                className={cn(
                  'mousetrap text-sans-xl w-full bg-transparent px-4 caret-gray-100 focus:outline-hidden',
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
              <div className="shadow-modal relative mt-5 transform-gpu overflow-hidden rounded-lg">
                <div
                  className="overflow-y-auto"
                  ref={divRef}
                  style={{ maxHeight: LIST_HEIGHT }}
                >
                  <ul ref={ulRef}>
                    {allGroups.map(([label, groupItems]) => (
                      <div key={label}>
                        <h3 className="text-mono-sm text-default bg-tertiary sticky top-0 z-20 h-8 px-4 py-2">
                          {label}
                        </h3>
                        {groupItems.map((item) => {
                          const idx = itemIndex.get(item)!
                          const isSelected = idx === selectedIdx
                          const { action } = item
                          return (
                            <div
                              key={`${item.navGroup}/${item.value}`}
                              className="relative -mt-px first-of-type:mt-0"
                            >
                              {isSelected && <Outline />}
                              {typeof action === 'string' ? (
                                <li
                                  role="option"
                                  className={cn(
                                    liBase,
                                    isSelected ? liSelected : liDefault
                                  )}
                                  aria-selected={isSelected}
                                >
                                  <Link
                                    to={action}
                                    className="block p-4"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                      if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                                        onDismiss()
                                      }
                                    }}
                                  >
                                    {item.value}
                                  </Link>
                                </li>
                              ) : (
                                // Keyboard events handled by combobox div above
                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                                <li
                                  role="option"
                                  className={cn(
                                    liBase,
                                    'p-4',
                                    isSelected ? liSelected : liDefault
                                  )}
                                  aria-selected={isSelected}
                                  onClick={() => {
                                    action()
                                    onDismiss()
                                  }}
                                >
                                  {item.value}
                                </li>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </ul>
                </div>
                <div className="text-default bg-tertiary flex justify-between rounded-b-md px-4 py-2">
                  <ActionMenuHotkey keys={['Enter']} action="submit" />
                  <ActionMenuHotkey keys={['Arrow Up', 'Arrow Down']} action="select" />
                  <ActionMenuHotkey keys={['Esc']} action="close" />
                </div>
              </div>
            )}
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
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
          className="text-mono-xs text-raise mr-1 inline-block rounded-md border border-[rgba(255,255,255,.15)] px-2 py-1"
        >
          {hotkey}
        </kbd>
      ))}
    </div>
    <span className="text-sans-sm text-secondary">to {action}</span>
  </div>
)
