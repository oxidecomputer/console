import { useCallback, useState } from 'react'
import { useKey } from './use-key'

/** Hook up a keyboard shortcut to `isOpen` and `onDismiss` for ActionMenu */
export function useActionMenuState() {
  const [isOpen, setIsOpen] = useState(false)

  const openDialog = useCallback((e) => {
    e.preventDefault()
    setIsOpen(true)
  }, [])

  useKey(['command+k', 'ctrl+k'], openDialog)

  const closeDialog = useCallback(() => setIsOpen(false), [])

  return { isOpen, onDismiss: closeDialog }
}
