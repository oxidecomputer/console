/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useId, type ReactNode } from 'react'
import type { FieldError } from 'react-hook-form'

import { FieldLabel, InputHint } from '~/ui/lib/FieldLabel'

import { ErrorMessage } from './ErrorMessage'

export interface FieldWrapperProps {
  variant?: 'default' | 'inline'
  label: string | ReactNode
  /**
   * Displayed inline as supplementary text to the label. Should
   * only be used for text that's necessary context for helping
   * complete the input. This will be announced in tandem with the
   * label when using a screen reader.
   */
  description?: string | ReactNode
  required?: boolean
  hideOptionalTag?: boolean
  error?: FieldError
  className?: string
  /** String label for error messages - falls back to extracting text from ReactNode label */
  errorLabel?: string
  children: (props: { id: string; 'aria-labelledby': string }) => ReactNode
}

export function FieldWrapper({
  variant = 'default',
  label,
  description,
  required,
  hideOptionalTag,
  error,
  className,
  errorLabel,
  children,
}: FieldWrapperProps) {
  const id = useId()
  const ariaLabelledBy = cn(`${id}-label`, description ? `${id}-help-text` : '')

  return (
    <div className={cn(variant !== 'inline' && 'max-w-lg', className)}>
      {/* Hiding the label for inline inputs but keeping it available for screen readers */}
      <div className={cn('mb-2', variant === 'inline' && 'sr-only')}>
        <FieldLabel
          htmlFor={id}
          id={`${id}-label`}
          optional={!required && !hideOptionalTag}
        >
          {label}
        </FieldLabel>
        {description && (
          <InputHint id={`${id}-help-text`} className="mb-2">
            {description}
          </InputHint>
        )}
      </div>
      {children({ id, 'aria-labelledby': ariaLabelledBy })}
      {/* todo: inline error message tooltip */}
      <ErrorMessage
        error={error}
        label={errorLabel || (typeof label === 'string' ? label : 'Field')}
      />
    </div>
  )
}
