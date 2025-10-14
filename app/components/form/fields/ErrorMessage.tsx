/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { FieldError } from 'react-hook-form'

import { Info12Icon } from '@oxide/design-system/icons/react'

import { TextInputError } from '~/ui/lib/TextInput'
import { Tooltip } from '~/ui/lib/Tooltip'

type ErrorMessageProps = {
  error: FieldError | undefined
  label: string
  isSmall?: boolean
}

export function ErrorMessage({ error, label }: ErrorMessageProps) {
  if (!error) return null

  const message = error.type === 'required' ? `${label} is required` : error.message
  if (!message) return null

  return <TextInputError>{message}</TextInputError>
}

export function PopoverErrorMessage({
  error,
  label,
  className,
}: ErrorMessageProps & { className?: string }) {
  if (!error) return null

  const message = error.type === 'required' ? `${label} is required` : error.message
  if (!message) return null

  return (
    <Tooltip content={message} placement="top" variant="error">
      <button
        type="button"
        aria-label={`Error: ${message}`}
        tabIndex={0}
        className={cn(
          className,
          '-ml-1 flex h-6 w-6 flex-shrink-0 cursor-help items-center justify-center rounded-full bg-error-secondary'
        )}
      >
        <Info12Icon className="text-error-secondary" aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
