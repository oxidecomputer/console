import { camelCaseToWords, capitalize } from '@oxide/util'

import type { ErrorBody, ErrorResult } from '.'

// assume a nice short resource name is the word before create
export function getResourceName(method: string) {
  const words = camelCaseToWords(method)
  const i = words.indexOf('create')
  if (i < 1) return null
  return words[i - 1].replace(/s$/, '')
}

const msgFromCode = (
  method: string,
  errorCode: string,
  _: ErrorBody
): string | undefined => {
  switch (errorCode) {
    case 'Forbidden':
      return 'Action not authorized'

    // TODO: This is a temporary fix for the API; better messages should be provided from there
    case 'ObjectAlreadyExists': {
      const resource = getResourceName(method)
      if (resource) {
        return `${capitalize(resource)} name already exists`
      }
      return undefined
    }
    default:
      return undefined
  }
}

export function formatServerError(method: string, resp: ErrorResult): ErrorResult {
  // TODO: I don't like that this function works by modifying
  // resp.error.message, which means the real message disappears. For now I'm
  // logging it here before it gets modified, but eventually this should work
  // altogether differently, maybe by preserving the original message while
  // adding on a user-facing message that our error boundary can display.
  if (process.env.NODE_ENV !== 'test') {
    console.log('Error from API client: ', resp)
  }

  // client error is a JSON parse or processing error and is highly unlikely to
  // be end-user readable
  if (resp.type === 'client_error') {
    resp.error.message = 'Error reading API response'
    return resp
  }

  const code = resp.error.errorCode
  const codeMsg = code && msgFromCode(method, code, resp.error)
  const serverMsg = resp.error.message

  resp.error.message =
    codeMsg || getParseError(serverMsg) || serverMsg || 'Unknown server error'

  return resp
}

export function getParseError(message: string | undefined): string | undefined {
  if (!message) return undefined
  const inner = /^unable to parse body: (.+) at line \d+ column \d+$/.exec(message)?.[1]
  return inner && capitalize(inner)
}
