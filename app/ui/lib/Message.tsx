/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactElement, ReactNode } from 'react'

import { Error12Icon, Success12Icon, Warning12Icon } from '@oxide/design-system/icons/react'

type Variant = 'success' | 'error' | 'notice' | 'info'

export interface MessageProps {
  title?: string
  content: ReactNode
  className?: string
  variant?: Variant
  showIcon?: boolean
}

const defaultIcon: Record<Variant, ReactElement> = {
  success: <Success12Icon />,
  error: <Error12Icon />,
  notice: <Warning12Icon />,
  info: <Error12Icon className="rotate-180" />,
}

const themeClass: Record<Variant, string> = {
  success: '',
  error: 'red-theme',
  notice: 'yellow-theme',
  info: 'blue-theme',
}

export const Message = ({
  title,
  // TODO: convert content to a children prop
  content,
  className,
  variant = 'info',
  showIcon = true,
}: MessageProps) => {
  return (
    <div
      className={cn(
        'relative flex items-start gap-2 overflow-hidden rounded-md p-3 pr-5 ring ring-inset ring-current/10',
        'bg-accent text-accent',
        themeClass[variant],
        className
      )}
    >
      {showIcon && (
        <div className="text-accent mt-0.5 flex [&>svg]:h-3 [&>svg]:w-3">
          {defaultIcon[variant]}
        </div>
      )}
      <div className="flex-1">
        {title && <div className="text-sans-semi-md mb-1">{title}</div>}
        {/* group gives HL the right color */}
        <div className="text-sans-md text-accent-secondary [&>a]:tint-underline group max-w-3xl">
          {content}
        </div>
      </div>
    </div>
  )
}
