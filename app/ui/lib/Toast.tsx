/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { announce } from '@react-aria/live-announcer'
import cn from 'classnames'
import { useEffect, type ReactElement, type ReactNode } from 'react'
import { Link, type To } from 'react-router'

import {
  Close12Icon,
  Error12Icon,
  Success12Icon,
  Warning12Icon,
} from '@oxide/design-system/icons/react'

import { extractText } from '~/util/str'

import { TimeoutIndicator } from './TimeoutIndicator'
import { Truncate } from './Truncate'

type Variant = 'success' | 'error' | 'info'

export interface ToastProps {
  title?: string
  content: ReactNode
  onClose: () => void
  variant?: Variant
  timeout?: number | null
  cta?: {
    text: string
    link: To
  }
}

const icon: Record<Variant, ReactElement> = {
  success: <Success12Icon />,
  error: <Error12Icon />,
  info: <Warning12Icon />,
}

const defaultTitle: Record<Variant, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Note',
}

const color: Record<Variant, string> = {
  success: 'bg-accent-secondary',
  error: 'bg-error-secondary',
  info: 'bg-notice-secondary',
}

const textColor: Record<Variant, string> = {
  success: 'text-accent children:text-accent',
  error: 'text-error children:text-error',
  info: 'text-notice children:text-notice',
}

const secondaryTextColor: Record<Variant, string> = {
  success: 'text-accent-secondary',
  error: 'text-error-secondary',
  info: 'text-notice-secondary',
}

export const Toast = ({
  title,
  content,
  onClose,
  variant = 'success',
  timeout: timeoutArg,
  cta,
}: ToastProps) => {
  const defaultTimeout = variant === 'error' ? 15000 : 5000
  const timeout = timeoutArg === undefined ? defaultTimeout : timeoutArg
  // TODO: consider assertive announce for error toasts
  useEffect(
    () => announce((title || defaultTitle[variant]) + ' ' + extractText(content), 'polite'),
    [title, content, variant]
  )
  return (
    <div
      className={cn(
        'relative flex w-96 items-start overflow-hidden rounded-lg p-4 elevation-2',
        color[variant],
        textColor[variant]
      )}
    >
      <div className="mt-[2px] flex [&>svg]:h-3 [&>svg]:w-3">{icon[variant]}</div>
      <div className="flex-1 pl-2.5">
        {(title || variant !== 'success') && (
          <div className="text-sans-semi-md">{title || defaultTitle[variant]}</div>
        )}
        {/* 'group' is necessary for HL color trick to work. see HL.tsx */}
        <div className={cn('group text-sans-md', secondaryTextColor[variant])}>
          {content}
        </div>

        {cta && (
          <Link
            className="mt-3 block text-mono-sm text-accent-secondary hover:text-accent"
            to={cta.link}
          >
            <Truncate text={cta.text} maxLength={36} />
          </Link>
        )}
      </div>
      <div className="mr-[2px] mt-[3px] flex items-center self-baseline">
        <button
          type="button"
          aria-label="Dismiss notification"
          className={cn(
            '-m-2 flex items-center rounded !border-transparent p-2 hover:bg-accent-secondary-hover',
            textColor[variant]
          )}
          onClick={onClose}
        >
          <Close12Icon />
        </button>
      </div>

      {timeout !== null && <TimeoutIndicator timeout={timeout} onTimeoutEnd={onClose} />}
    </div>
  )
}
