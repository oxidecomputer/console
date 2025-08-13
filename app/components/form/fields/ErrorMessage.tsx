/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { announce } from '@react-aria/live-announcer'
import { useEffect } from 'react'
import type { FieldError } from 'react-hook-form'

type ErrorMessageProps = {
  error: FieldError | undefined
  label: string
}

export function ErrorMessage({ error, label }: ErrorMessageProps) {
  if (!error) return null

  const message = error.type === 'required' ? `${label} is required` : error.message
  if (!message) return null

  return <InputError>{message}</InputError>
}

export const InputError = ({ children }: { children: string }) => {
  useEffect(() => announce(children, 'assertive'), [children])
  return <div className="ml-px py-2 text-sans-md text-destructive">{children}</div>
}
