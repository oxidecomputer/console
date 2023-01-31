import { format } from 'date-fns'

export const formatDateTime = (d: Date) => format(d, 'MMM d, yyyy H:mm aa')
