import { useContext } from 'react'
import { ToastContext } from '../contexts'

export const useToast = () => useContext(ToastContext)
