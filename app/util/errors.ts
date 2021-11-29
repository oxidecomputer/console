import type { ErrorResponse } from '@oxide/api'

import { capitalize } from '@oxide/util'

const errorRegex = /^unable to parse body: (.+) at line \d+ column \d+$/

export const getServerParseError = (message: string | undefined) => {
  const innerMsg = message && errorRegex.exec(message)?.[1]
  return capitalize(innerMsg) || 'Unknown error from server'
}

export const getServerError = (
  error: ErrorResponse | null,
  codeMap: Record<string, string> = {}
) => {
  if (!error) return null
  const code = error.error?.error_code
  return (code && codeMap[code]) || getServerParseError(error.error?.message)
}
