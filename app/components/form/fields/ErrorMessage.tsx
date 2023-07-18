/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { FieldError } from 'react-hook-form'

import { TextInputError } from '@oxide/ui'

type ErrorMessageProps = {
  error: FieldError | undefined
  label: string
}

export function ErrorMessage({ error, label }: ErrorMessageProps) {
  if (!error) return null

  const message = error.type === 'required' ? `${label} is required` : error.message
  if (!message) return null

  return <TextInputError>{message}</TextInputError>
}
