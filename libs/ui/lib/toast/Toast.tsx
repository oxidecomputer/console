import type { ReactElement } from 'react'
import React from 'react'
import cn from 'classnames'
import Alert from '@reach/alert'

import { TimeoutIndicator } from '../timeout-indicator/TimeoutIndicator'
import { Close12Icon } from '../icons'
import { Button } from '../button/Button'

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
  success: 'bg-accent-secondary text-accent',
  error: 'bg-accent-secondary text-accent',
  info: 'bg-accent-secondary text-accent',
}

export const Toast = ({
  title,
  content,
  icon,
  onClose,
  timeout,
  variant = 'success',
}: ToastProps) => (
  <Alert
    className={cn(
      'flex w-96 items-center space-x-2 rounded-sm p-4',
      color[variant]
    )}
  >
    {icon}
    <div className="flex-1 space-y-1 pl-2">
      <div className="text-sans-xl">{title}</div>
      <div className="text-sans-md">{content}</div>
    </div>
    <div>
      <Button
        className="flex !border-transparent"
        variant="ghost"
        onClick={onClose}
      >
        {timeout !== undefined ? (
          <TimeoutIndicator timeout={timeout} onTimeoutEnd={onClose}>
            <Close12Icon />
          </TimeoutIndicator>
        ) : (
          <Close12Icon />
        )}
      </Button>
    </div>
  </Alert>
)
