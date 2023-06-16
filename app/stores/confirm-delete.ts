import type { ReactNode } from 'react'
import { create } from 'zustand'

type DeleteConfig = {
  /** Must be `mutateAsync`, otherwise we can't catch the error generically */
  doDelete: () => Promise<unknown>
  warning?: string
  /**
   * Label identifying the resource. Could be a name or something more elaborate
   * "the Admin role for user Harry Styles". If a string, the modal will
   * automatically give it a highlighted style. Otherwise it will be rendered
   * directly.
   */
  label: ReactNode
}

type ConfirmDeleteStore = {
  deleteConfig: DeleteConfig | null
}

export const useConfirmDelete = create<ConfirmDeleteStore>(() => ({
  deleteConfig: null,
}))

// zustand docs say this pattern is equivalent to putting the actions on the
// store and has no downsides, despite all the readme examples doing it the
// other way. We do it this way so can modify the store in callbacks without
// calling the useStore hook. Only components that need to subscribe to changes
// in the store need to the hook.
// https://github.com/pmndrs/zustand/blob/a5343354/docs/guides/practice-with-no-store-actions.md

/**
 * Note that this returns a function so we can save a line in the calling code.
 */
export const confirmDelete = (deleteConfig: DeleteConfig) => () => {
  useConfirmDelete.setState({ deleteConfig })
}

export function clearConfirmDelete() {
  useConfirmDelete.setState({ deleteConfig: null })
}
