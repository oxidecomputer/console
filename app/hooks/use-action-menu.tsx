import React, { useMemo, useState } from 'react'
import type { ActionMenuProps } from '@oxide/ui'
import { ActionMenu } from '@oxide/ui'
import { useKey } from './use-key'

type Props = Omit<ActionMenuProps, 'isOpen' | 'onDismiss'>

/**
 * UI ActionMenu + keyboard shortcut and state management
 */
export function useActionMenu() {
  const [isOpen, setIsOpen] = useState(false)
  useKey(['command+k'], (e) => {
    e.preventDefault()
    setIsOpen(true)
  })
  return useMemo(
    () => (props: Props) =>
      (
        <ActionMenu
          isOpen={isOpen}
          onDismiss={() => setIsOpen(false)}
          {...props}
        />
      ),
    [isOpen]
  )
}
