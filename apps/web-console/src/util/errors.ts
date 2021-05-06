import type { ApiError } from '@oxide/api'

import { capitalize } from './str'

const errorRegex = /^unable to parse body: (.+) at line \d+ column \d+$/

export const getServerParseError = (message: string | undefined) => {
  const innerMsg = message && errorRegex.exec(message)?.[1]
  return capitalize(innerMsg) || 'Unknown error from server'
}

export const getServerError = (
  error: ApiError | null,
  codeMap: Record<string, string> = {}
) => {
  if (!error) return null
  const code = error.data.error_code
  return (code && codeMap[code]) || getServerParseError(error.data.message)
}
