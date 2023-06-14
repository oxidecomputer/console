import { useToastStore } from 'app/stores/toast'

export const useToast = () => useToastStore(({ add }) => add)
