/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useId } from 'react'

import { FieldLabel } from '~/ui/lib/FieldLabel'
import { TextInput } from '~/ui/lib/TextInput'

/** Text field the user must fill with `confirmText` before a risky action */
export function TypeToConfirmField({
  confirmText,
  value,
  onChange,
}: {
  confirmText: string
  value: string
  onChange: (value: string) => void
}) {
  const inputId = useId()
  return (
    <div className="space-y-2">
      <FieldLabel id={`${inputId}-label`} htmlFor={inputId}>
        <span>
          Type{' '}
          <code className="text-mono-md text-raise bg-tertiary rounded-sm px-1 tracking-normal! normal-case!">
            {confirmText}
          </code>{' '}
          to confirm
        </span>
      </FieldLabel>
      <TextInput
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  )
}

/** Disabled reason for a submit button until `value` matches `confirmText` */
export const typeToConfirmReason = (confirmText: string, value: string) =>
  value === confirmText ? undefined : `Type ${confirmText} to confirm`
