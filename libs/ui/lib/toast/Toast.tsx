import Alert from '@reach/alert'
import cn from 'classnames'
import type { ReactElement } from 'react'

import { Button } from '../button/Button'
import { Close12Icon } from '../icons'

type Variant = 'success' | 'error' | 'info'

export interface ToastProps {
  title: string
  content?: string
  icon: ReactElement
  onClose: () => void
  variant?: Variant
  timeout?: number
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
}: ToastProps) => (
  <Alert
    className={cn('flex w-96 items-start rounded p-4', color[variant], textColor[variant])}
  >
    {icon}
    <div className="flex-1 pl-2.5">
      <div className="text-sans-semi-md">{title}</div>
      <div className="text-sans-md">{content}</div>
    </div>
    <div>
      <Button
        aria-label="Dismiss notification"
        className={cn('flex !border-transparent px-0 h-auto', textColor[variant])}
        variant="ghost"
        onClick={onClose}
      >
        <Close12Icon />
      </Button>
    </div>
  </Alert>
)
