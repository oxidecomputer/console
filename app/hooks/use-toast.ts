import { useToastStore } from 'app/stores/toast'

export const useToast = () => useToastStore(({ add }) => add)

export const addToast = useToastStore.getState().add
