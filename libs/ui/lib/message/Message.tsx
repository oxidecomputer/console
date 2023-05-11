import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import { type ReactNode, useEffect } from 'react'

import { Error12Icon, Success12Icon, Warning12Icon } from '../icons'

type Variant = 'success' | 'error' | 'notice'

export interface MessageProps {
  title: string
  children: ReactNode
  variant?: Variant
  className?: string
}

const icon: Record<Variant, JSX.Element> = {
  success: <Success12Icon />,
  error: <Error12Icon />,
  notice: <Warning12Icon />,
}

const defaultTitle: Record<Variant, string> = {
  success: 'Success',
  error: 'Error',
  notice: 'Note',
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

const secondaryTextColor: Record<Variant, string> = {
  success: 'text-accent-secondary',
  error: 'text-error-secondary',
  notice: 'text-notice-secondary',
}

export const Message = ({
  title,
  children,
  className,
  variant = 'notice',
}: MessageProps) => {
  // TODO: consider assertive announce for error toasts
  useEffect(() => announce(title + ' ' + children, 'polite'), [title, children])
  return (
    <div
      className={cn(
        'relative flex w-full items-start overflow-hidden rounded-lg p-4 elevation-1',
        color[variant],
        textColor[variant],
        className
      )}
    >
      <div className="mt-[2px] flex svg:h-3 svg:w-3">{icon[variant]}</div>
      <div className="flex-1 pl-2.5">
        <div className="text-sans-semi-md">{title || defaultTitle[variant]}</div>
        <div className={cn('text-sans-md', secondaryTextColor[variant])}>{children}</div>
      </div>
    </div>
  )
}
