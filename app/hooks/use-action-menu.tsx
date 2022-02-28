import React, { useContext, useEffect } from 'react'
import { useCallback, useState } from 'react'
import { useKey } from './use-key'
import { invariant } from '@oxide/util'
import { ActionMenu } from '@oxide/ui'
import type { QuickActionItem } from '@oxide/ui'

type Items = QuickActionItem[]
type SetItems = React.Dispatch<React.SetStateAction<Items>>
type ContextType = [Items, SetItems]
const QuickActionsContext = React.createContext<ContextType>([[], () => {}])

/**
 * Register action items with the global quick actions menu. `itemsToAdd` must
 * be memoized by the caller, otherwise the effect will run too often.
 */
export function useQuickActions(itemsToAdd: QuickActionItem[]) {
  const [, setItems] = useContext(QuickActionsContext)
  useEffect(() => {
    // add items
    const itemsToAddKeys = new Set(itemsToAdd.map((i) => i.value))
    invariant(
      itemsToAdd.length === itemsToAddKeys.size,
      'Items being added to the list of quick actions must have unique `value` values.'
    )

    // In order to avoid adding the same things twice, we overwrite any items in
    // the list matching the values of the new items
    setItems((items) =>
      items.filter((i) => !itemsToAddKeys.has(i.value)).concat(itemsToAdd)
    )

    // remove items, using value as unique ID
    return () => {
      // only works if called in the callabck style
      setItems((items) => items.filter((i) => !itemsToAddKeys.has(i.value)))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsToAdd])
}

type ProviderProps = { children: React.ReactNode }

export function QuickActionsProvider({ children }: ProviderProps) {
  const [items, setItems] = useState<Items>([])
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = useCallback(
    (e) => {
      if (items.length > 0) {
        e.preventDefault()
        setIsOpen(true)
      }
    },
    [items]
  )

  useKey(['command+k', 'ctrl+k'], openDialog)

  const closeDialog = useCallback(() => setIsOpen(false), [])

  return (
    // TODO: constrain setItems more — don't let any caller do whatever they want
    // with the state. I guess a reducer is in order, ew. Or just provide two
    // functions: addItems and removeItems

    // TODO: filter out nav item matching current route
    <QuickActionsContext.Provider value={[items, setItems]}>
      <ActionMenu
        isOpen={isOpen}
        onDismiss={closeDialog}
        ariaLabel="Quick actions"
        items={items}
      />
      {children}
    </QuickActionsContext.Provider>
  )
}
