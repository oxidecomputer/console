import type { ErrorResponse } from '@oxide/api'

import { capitalize } from '@oxide/util'

export function getParseError(message: string | undefined): string | undefined {
  if (!message) return undefined
  const inner = /^unable to parse body: (.+) at line \d+ column \d+$/.exec(
    message
  )?.[1]
  return inner && capitalize(inner)
}

// Generic messages that work anywhere. There will probably be few or none of
// these, but it's convenient for now.
const globalCodeMap: Record<string, string> = {
  Forbidden: 'Action not authorized',
}

export const getServerError = (
  error: ErrorResponse | null,
  codeMap: Record<string, string> = {}
) => {
  if (!error) return null
  const code = error.error?.errorCode
  const codeMsg = code && (codeMap[code] || globalCodeMap[code])
  const serverMsg = error.error?.message
  return (
    // first try to get friendly message based on code
    codeMsg ||
    // then try to pull out parse error from ugly server error
    // TODO: probably needs a server fix
    getParseError(serverMsg) ||
    // then just display the server error if it's there
    // TODO: we don't want to do this long-term, there is zero change these are
    // user-friendly. but it's handy for debugging for now
    serverMsg ||
    // finally, a generic fallback
    'Unknown error from server'
  )
}
