import type { ApiError } from '@oxide/api'

import { capitalize } from '@oxide/util'

const errorRegex = /^unable to parse body: (.+) at line \d+ column \d+$/

export const getServerParseError = (message: string | undefined) => {
  const innerMsg = message && errorRegex.exec(message)?.[1]
  return capitalize(innerMsg) || 'Unknown error from server'
}

// Generic messages that work anywhere. There will probably be few or none of
// these, but it's convenient for now.
const globalCodeMap: Record<string, string> = {
  Unauthorized: 'Action not authorized',
}

export const getServerError = (
  error: ApiError | null,
  codeMap: Record<string, string> = {}
) => {
  if (!error) return null
  const code = error.data?.error_code
  return (
    (code && (codeMap[code] || globalCodeMap[code])) ||
    getServerParseError(error.data?.message)
  )
}
