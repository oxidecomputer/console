import { create } from 'zustand'

type DeleteConfig = {
  doDelete: () => void
  warning?: string
  resourceName: string
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

export function confirmDelete(deleteConfig: DeleteConfig) {
  useConfirmDelete.setState({ deleteConfig })
}

export function clearConfirmDelete() {
  useConfirmDelete.setState({ deleteConfig: null })
}
