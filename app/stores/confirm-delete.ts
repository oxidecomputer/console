import { create } from 'zustand'

type DeleteConfig = {
  doDelete: () => void
  warning?: string
  resourceName: string
}

type ConfirmDeleteStore = {
  deleteConfig: DeleteConfig | null
  confirm: (d: DeleteConfig) => void
  clear: () => void
}

export const useConfirmDelete = create<ConfirmDeleteStore>()((set) => ({
  deleteConfig: null,
  confirm: (deleteConfig) => set({ deleteConfig }),
  clear: () => set({ deleteConfig: null }),
}))

export const confirmDelete = useConfirmDelete.getState().confirm
