import Dialog from '@reach/dialog'
import React, { useEffect, useState } from 'react'
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

  // appreciate this. I suffered
  useEffect(() => {
    const div = divRef.current
    const ul = ulRef.current
    // rather than put refs on all the li, get item by index using the ul ref
    const li = ul?.querySelectorAll('li')[selectedIdx]
    if (div && ul && li) {
      // absolute top and bottom of scroll container in viewport. annoyingly,
      // the div's bounding client rect bottom is the real bottom, including the
      // the part that's scrolled out of view. what we want is the bottom of the
      // part that's in view
      const scrollBoxTop = div.getBoundingClientRect().top
      const scrollBoxBottom = scrollBoxTop + LIST_HEIGHT

      // absolute top and bottom of list and item in viewport. the div stays
      // where it is, the ul moves within it
      const { top: liTop, bottom: liBottom } = li.getBoundingClientRect()
      const { top: ulTop } = ul.getBoundingClientRect()

      // when we decide whether the item we're scrolling to is in view already
      // or not, we need to compare absolute positions, i.e., is this item
      // inside the visible rectangle or not
      const shouldScrollUp = liTop < scrollBoxTop
      const shouldScrollDown = liBottom > scrollBoxBottom

      // this probably the most counterintuitive part. now we're trying to tell
      // the scrolling container how far to scroll, so we need the position of
      // the item relative to the top of the full list (ulTop), not relative to
      // the absolute y-position of the top of the visible scrollPort
      // (scrollBoxTop)
      const itemTopScrollTo = liTop - ulTop - 1
      const itemBottomScrollTo = liBottom - ulTop

      if (shouldScrollUp) {
        // when scrolling up, scroll to the top of the item you're scrolling to.
        // -1 is for top outline
        div.scrollTo({ top: itemTopScrollTo - 1 })
      } else if (shouldScrollDown) {
        // when scrolling down, we want to scroll just far enough so the bottom
        // edge of the selected item is in view. Because scrollTo is about the
        // *top* edge of the scrolling container, that means we scroll to
        // LIST_HEIGHT *above* the bottom edge of the item. +2 is for top *and*
        // bottom outline
        div.scrollTo({ top: itemBottomScrollTo - LIST_HEIGHT + 2 })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx])

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
            'mousetrap shadow-black/25 block w-full overflow-y-auto rounded-[3px] border p-4 shadow-2xl text-sans-xl bg-raise border-secondary focus:outline-none',
            props.inputClassName
          )}
          value={input}
          onChange={(e) => {
            setSelectedIdx(0)
            setInput(e.target.value)
          }}
          placeholder="Find anything..."
        />
        <div
          className="mt-5 overflow-y-auto"
          ref={divRef}
          style={{ maxHeight: LIST_HEIGHT }}
        >
          <ul className="m-px" ref={ulRef}>
            {allGroups.map(([label, items]) => (
              <React.Fragment key={label}>
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
                      '-mt-px cursor-pointer border p-4 text-sans-md text-secondary bg-raise border-tertiary last:rounded-b-[3px] hover:bg-raise-hover',
                      item.value === selectedItem?.value &&
                        'outline outline-1 text-accent bg-accent-secondary outline-accent hover:bg-accent-secondary-hover'
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
                ))}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  )
}
