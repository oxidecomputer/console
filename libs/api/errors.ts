import { camelCaseToWords, capitalize } from '@oxide/util'

import type { ErrorBody, ErrorResult } from '.'

// assume a nice short resource name is the word before create
/**
 * If we can pull the resource name out of the error message, do that, otherwise
 * fall back to using the API method name. The reason we prefer the error
 * message is that instance create also creates a disk, and when the disk is the
 * thing that already exists, the message says "disk" but the method says
 * "instance".
 */
export function getResourceName(method: string, message: string) {
  const match = /^already exists: ([^"]+)/.exec(message)
  if (match) return match[1].trim()

  const words = camelCaseToWords(method)
  const i = words.indexOf('create')
  if (i < 1) return null
  return words[i - 1].replace(/s$/, '')
}

const msgFromCode = (
  method: string,
  errorCode: string,
  errorBody: ErrorBody
): string | undefined => {
  switch (errorCode) {
    case 'Forbidden':
      return 'Action not authorized'

    // TODO: This is a temporary fix for the API; better messages should be provided from there
    case 'ObjectAlreadyExists': {
      const resource = getResourceName(method, errorBody.message)
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
  // resp.error.message, which means the real message disappears. Eventually
  // this should work altogether differently, maybe by preserving the original
  // message while adding on a user-facing message that our error boundary can
  // display.

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
