import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import type { ReactElement } from 'react'
import { useEffect } from 'react'

import { Close12Icon } from '../icons'
import { TimeoutIndicator } from '../timeout-indicator/TimeoutIndicator'

type Variant = 'success' | 'error' | 'info'

export interface ToastProps {
  title: string
  content?: string
  icon: ReactElement
  onClose: () => void
  variant?: Variant
  timeout?: number | null
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

const progressColor: Record<Variant, string> = {
  success: 'bg-accent-raise',
  error: 'bg-destructive-raise',
  info: 'bg-notice-raise',
}

export const Toast = ({
  title,
  content,
  icon,
  onClose,
  variant = 'success',
  timeout = 5000,
}: ToastProps) => {
  useEffect(() => announce(title + ' ' + content, 'polite'), [title, content])
  return (
    <div
      className={cn(
        'relative flex w-96 items-start overflow-hidden rounded-lg p-4',
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
        className={cn('-m-2 flex h-auto !border-transparent p-2', textColor[variant])}
        onClick={onClose}
      >
        <Close12Icon />
      </button>

      {timeout !== null && (
        <TimeoutIndicator
          timeout={timeout}
          onTimeoutEnd={onClose}
          className={progressColor[variant]}
        />
      )}
    </div>
  )
}
