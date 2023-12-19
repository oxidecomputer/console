/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactElement, ReactNode } from 'react'
import { Link, type To } from 'react-router-dom'

import {
  Access16Icon,
  Error12Icon,
  OpenLink12Icon,
  Success12Icon,
  Warning12Icon,
} from '@oxide/design-system/icons/react'

type Variant = 'success' | 'error' | 'notice' | 'info' | 'access'

export interface MessageProps {
  title?: string
  content: ReactNode
  className?: string
  variant?: Variant
  cta?: {
    text: string
    link: To
  }
}

const icon: Record<Variant, ReactElement> = {
  success: <Success12Icon />,
  error: <Error12Icon />,
  notice: <Warning12Icon />,
  info: <Error12Icon className="rotate-180" />,
  access: <Access16Icon />,
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary',
  error: 'bg-error-secondary',
  notice: 'bg-notice-secondary',
  info: 'bg-info-secondary',
  access: 'bg-notice-secondary',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent children:text-accent',
  error: 'text-error children:text-error',
  notice: 'text-notice children:text-notice',
  info: 'text-info children:text-info',
  access: 'text-notice children:text-notice',
}

const secondaryTextColor: Record<Variant, string> = {
  success: 'text-accent-secondary',
  error: 'text-error-secondary',
  notice: 'text-notice-secondary',
  info: 'text-info-secondary',
  access: 'text-notice-secondary',
}

const linkColor: Record<Variant, string> = {
  success: 'text-accent-secondary hover:text-accent',
  error: 'text-error-secondary hover:text-error',
  notice: 'text-notice-secondary hover:text-notice',
  info: 'text-info-secondary hover:text-info',
  access: 'text-notice-secondary hover:text-notice',
}

export const Message = ({
  title,
  content,
  className,
  variant = 'success',
  cta,
}: MessageProps) => {
  return (
    <div
      className={cn(
        'relative flex items-start overflow-hidden rounded-lg p-4 elevation-1',
        color[variant],
        textColor[variant],
        className
      )}
    >
      <div className="mt-[2px] flex svg:h-3 svg:w-3">{icon[variant]}</div>
      <div className="flex-1 pl-2.5">
        {title && <div className="text-sans-semi-md">{title}</div>}
        <div
          className={cn(
            'text-sans-md [&>a]:underline',
            title ? secondaryTextColor[variant] : textColor[variant]
          )}
        >
          {content}
        </div>

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
