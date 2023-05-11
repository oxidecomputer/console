import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import { type ReactNode, useEffect } from 'react'

type Variant = 'success' | 'error' | 'info'

export interface MessageProps {
  title: string
  children: ReactNode
  variant?: Variant
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary',
  error: 'bg-error-secondary',
  notice: 'bg-notice-secondary',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent children:text-accent',
  error: 'text-error children:text-error',
  notice: 'text-notice children:text-notice',
}

export const Message = ({ title, children, variant = 'notice' }: MessageProps) => {
  // TODO: consider assertive announce for error toasts
  useEffect(() => announce(title + ' ' + children, 'polite'), [title, children])
  return (
    <div
      className={cn(
        'relative flex w-full items-start overflow-hidden rounded-lg p-4',
        color[variant],
        textColor[variant]
      )}
    >
      <div className="mt-[2px] flex svg:h-3 svg:w-3">{icon}</div>
      <div className="flex-1 pl-2.5">
        <div className="text-sans-semi-md">{title}</div>
        <div className="text-sans-md text-accent-secondary">{children}</div>
      </div>
    </div>
  )
}
