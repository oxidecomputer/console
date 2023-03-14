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
