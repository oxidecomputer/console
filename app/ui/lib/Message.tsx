/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactElement, ReactNode } from 'react'
import { Link, type To } from 'react-router'

import {
  Error12Icon,
  OpenLink12Icon,
  Success12Icon,
  Warning12Icon,
} from '@oxide/design-system/icons/react'

type Variant = 'success' | 'error' | 'notice' | 'info'

export interface MessageProps {
  title?: string
  content: ReactNode
  className?: string
  variant?: Variant
  cta?: {
    text: string
    link: To
  }
  showIcon?: boolean
}

const defaultIcon: Record<Variant, ReactElement> = {
  success: <Success12Icon />,
  error: <Error12Icon />,
  notice: <Warning12Icon />,
  info: <Error12Icon className="rotate-180" />,
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary border-accent/10',
  error: 'bg-error-secondary border-destructive/10',
  notice: 'bg-notice-secondary border-notice/10',
  info: 'bg-info-secondary border-blue-800/10',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent',
  error: 'text-error',
  notice: 'text-notice',
  info: 'text-info',
}

const secondaryTextColor: Record<Variant, string> = {
  success: 'text-accent-secondary',
  error: 'text-error-secondary',
  notice: 'text-notice-secondary',
  info: 'text-info-secondary',
}

const linkColor: Record<Variant, string> = {
  success: 'text-accent-secondary hover:text-accent',
  error: 'text-error-secondary hover:text-error',
  notice: 'text-notice-secondary hover:text-notice',
  info: 'text-info-secondary hover:text-info',
}

export const Message = ({
  title,
  // TODO: convert content to a children prop
  content,
  className,
  variant = 'info',
  cta,
  showIcon = true,
}: MessageProps) => {
  return (
    <div
      className={cn(
        'elevation-1 relative flex items-start gap-2.5 overflow-hidden rounded-lg border p-3 pr-5',
        color[variant],
        textColor[variant],
        className
      )}
    >
      {showIcon && (
        <div
          className={cn(
            'mt-[2px] flex [&>svg]:h-3 [&>svg]:w-3',
            `[&>svg]:${textColor[variant]}`
          )}
        >
          {defaultIcon[variant]}
        </div>
      )}
      <div className="flex-1">
        {title && <div className="text-sans-semi-md">{title}</div>}
        <div
          className={cn('text-sans-md [&>a]:tint-underline', secondaryTextColor[variant])}
        >
          {content}
        </div>

        {cta && (
          <Link
            className={cn(
              'text-sans-md mt-1 flex items-center underline',
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
