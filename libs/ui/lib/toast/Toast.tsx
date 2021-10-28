import type { ReactElement } from 'react'
import React from 'react'
import cn from 'classnames'
import Alert from '@reach/alert'

import { TimeoutIndicator } from '../timeout-indicator/TimeoutIndicator'
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
  success: 'bg-green-900 text-green-500',
  error: 'bg-red-900 text-red-500',
  info: 'bg-yellow-900 text-yellow-500',
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
      'w-96 p-4 flex items-center text-base space-x-2',
      color[variant]
    )}
  >
    {icon}
    <div className="flex-1">
      <div>{title}</div>
      <div className="font-light">{content}</div>
    </div>
    <div>
      <button type="button" onClick={() => onClose()} className="flex">
        {timeout !== undefined ? (
          <TimeoutIndicator timeout={timeout} onTimeoutEnd={onClose}>
            <Close12Icon />
          </TimeoutIndicator>
        ) : (
          <Close12Icon />
        )}
      </button>
    </div>
  </Alert>
)
