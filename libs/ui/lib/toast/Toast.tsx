import Alert from '@reach/alert'
import cn from 'classnames'
import type { ReactElement } from 'react'

import { Close12Icon } from '../icons'
import { TimeoutIndicator } from '../timeout-indicator/TimeoutIndicator'

type Variant = 'success' | 'error' | 'info'

export interface ToastProps {
  title: string
  content?: string
  icon: ReactElement
  onClose: () => void
  variant?: Variant
  timeout?: number | undefined | null
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary',
  error: 'bg-error-secondary',
  info: 'bg-notice-secondary',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent children:text-accent',
  error: 'text-error children:text-error',
  info: 'text-notice children:text-notice',
}

export const Toast = ({
  title,
  content,
  icon,
  onClose,
  variant = 'success',
  timeout = 5000,
}: ToastProps) => {
  return (
    <Alert
      className={cn(
        'flex w-96 items-start rounded p-4 relative overflow-hidden',
        color[variant],
        textColor[variant]
      )}
    >
      {icon}
      <div className="flex-1 pl-2.5">
        <div className="text-sans-semi-md">{title}</div>
        <div className="text-sans-md text-accent-secondary">{content}</div>
      </div>
      <button
        aria-label="Dismiss notification"
        className={cn('flex !border-transparent p-2 -m-2 h-auto', textColor[variant])}
        onClick={onClose}
      >
        <Close12Icon />
      </button>

      {timeout !== undefined && timeout !== null ? (
        <TimeoutIndicator timeout={timeout} onTimeoutEnd={onClose} />
      ) : null}
    </Alert>
  )
}
