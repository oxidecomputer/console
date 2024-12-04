/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import { Close8Icon } from '@oxide/design-system/icons/react'

export type TagColor = 'default' | 'destructive' | 'notice' | 'neutral'
export type TagVariant = 'default' | 'secondary'

export interface TagProps {
  color?: TagColor
  className?: string
  children: React.ReactNode
  variant?: TagVariant
  narrow?: boolean
  onClose?: () => void
}

export const tagColors: Record<TagVariant, Partial<Record<TagColor, string>>> = {
  default: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
  },
  secondary: {
    default: 'bg-accent-secondary text-accent',
    destructive: 'bg-destructive-secondary text-destructive',
    notice: 'bg-notice-secondary text-notice',
    neutral: 'bg-secondary text-default',
  },
}

export const Tag = ({
  className,
  children,
  color = 'default',
  variant = 'default',
  narrow,
  onClose,
}: TagProps) => {
  return (
    <span
      className={cn(
        'ox-tag',
        `variant-${variant}`,
        'inline-flex items-center whitespace-nowrap rounded px-1 text-mono-sm',
        tagColors[variant][color],
        narrow ? 'h-4' : 'h-6',
        className
      )}
    >
      <span>{children}</span>
      {onClose && (
        <button type="button" className="flex cursor-pointer" onClick={onClose}>
          <Close8Icon
            className={cn(variant === 'default' ? 'text-inverse' : 'text-accent', 'ml-1')}
          />
        </button>
      )}
    </span>
  )
}
