import cn from 'classnames'
import type { ReactElement } from 'react'
import { Link, type To } from 'react-router-dom'

import { OpenLink12Icon } from '@oxide/ui'

import { Error12Icon, Success12Icon, Warning12Icon } from '../icons'

type Variant = 'success' | 'destructive' | 'notice'

export interface InlineMessageProps {
  content?: string
  variant?: Variant
  cta?: {
    text: string
    link: To
  }
}

const icon: Record<Variant, ReactElement> = {
  success: <Success12Icon />,
  destructive: <Error12Icon />,
  notice: <Warning12Icon />,
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary',
  destructive: 'bg-destructive-secondary',
  notice: 'bg-notice-secondary',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent children:text-accent',
  destructive: 'text-destructive children:text-destructive',
  notice: 'text-notice children:text-notice',
}

const linkColor: Record<Variant, string> = {
  success: 'text-accent-secondary hover:text-accent',
  destructive: 'text-destructive-secondary hover:text-destructive',
  notice: 'text-notice-secondary hover:text-notice',
}

export const InlineMessage = ({
  content,
  variant = 'success',
  cta,
}: InlineMessageProps) => {
  return (
    <div
      className={cn(
        'relative flex items-start overflow-hidden rounded-lg p-4',
        color[variant],
        textColor[variant]
      )}
    >
      <div className="mt-[2px] flex svg:h-3 svg:w-3">{icon[variant]}</div>
      <div className="flex-1 pl-2.5">
        <div className={cn('text-sans-md', textColor[variant])}>{content}</div>

        {cta && (
          <Link
            className={cn(
              'mt-1 block flex items-center underline text-sans-md',
              linkColor[variant]
            )}
            to={cta.link}
          >
            {cta.text}
            <OpenLink12Icon className="ml-1" />
          </Link>
        )}
      </div>
    </div>
  )
}
