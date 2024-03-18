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
  // try to use icons from the ___12Icon set, rather than forcing a 16px or 24px icon
  icon?: ReactElement
}

const defaultIcon: Record<Variant, ReactElement> = {
  success: <Success12Icon />,
  error: <Error12Icon />,
  notice: <Warning12Icon />,
  info: <Error12Icon className="rotate-180" />,
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary',
  error: 'bg-error-secondary',
  notice: 'bg-notice-secondary',
  info: 'bg-info-secondary',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent children:text-accent',
  error: 'text-error children:text-error',
  notice: 'text-notice children:text-notice',
  info: 'text-info children:text-info',
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
  content,
  className,
  variant = 'success',
  cta,
  icon,
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
      <div className="mt-[2px] flex svg:h-3 svg:w-3">{icon || defaultIcon[variant]}</div>
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
              'mt-1 flex items-center underline text-sans-md',
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
