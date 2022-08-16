import { camelCaseToWords, capitalize } from '@oxide/util'

import type { ApiError, ApiMethods, ErrorBody, ErrorResult } from '.'
import { navToLogin } from './nav-to-login'

const errorCodeFormatter =
  (method: keyof ApiMethods) =>
  (errorCode: string, _: ErrorBody): string | undefined => {
    switch (errorCode) {
      case 'Forbidden':
        return 'Action not authorized'

      // TODO: This is a temporary fix for the API; better messages should be provided from there
      case 'ObjectAlreadyExists':
        if (method.endsWith('Create')) {
          const resource = camelCaseToWords(method).slice(-2)[0].replace(/s$/, '')
          return `${capitalize(resource)} name already exists`
        }
        return undefined
      default:
        return undefined
    }
  }

export const handleErrors = (method: keyof ApiMethods) => (resp: ErrorResult) => {
  // if logged out, hit /login to trigger login redirect
  if (resp.statusCode === 401) {
    // TODO-usability: for background requests, a redirect to login without
    // warning could come as a surprise to the user, especially because
    // sometimes background requests are not directly triggered by a user
    // action, e.g., polling or refetching when window regains focus
    navToLogin({ includeCurrent: true })
  }
  // we need to rethrow because that's how react-query knows it's an error
  throw formatServerError(resp, errorCodeFormatter(method))
}

function formatServerError(
  resp: ErrorResult,
  msgFromCode: (errorCode: string, error: ErrorBody) => string | undefined
): ErrorResult {
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
  const codeMsg = code && msgFromCode(code, resp.error)
  const serverMsg = resp.error.message

  resp.error.message =
    codeMsg || getParseError(serverMsg) || serverMsg || 'Unknown server error'

  return resp
}

function getParseError(message: string | undefined): string | undefined {
  if (!message) return undefined
  const inner = /^unable to parse body: (.+) at line \d+ column \d+$/.exec(message)?.[1]
  return inner && capitalize(inner)
}

// -- TESTS ----------------

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest
  const parseError = {
    error: {
      requestId: '1',
      errorCode: null,
      message: 'unable to parse body: hello there, you have an error at line 129 column 4',
    },
  } as ApiError

  const alreadyExists = {
    error: {
      requestId: '2',
      errorCode: 'ObjectAlreadyExists',
      message: 'whatever',
    },
  } as ApiError

  describe('getParseError', () => {
    it('extracts nice part of error message', () => {
      expect(getParseError(parseError.error.message)).toEqual(
        'Hello there, you have an error'
      )
    })

    it('returns undefined if error does not match pattern', () => {
      expect(getParseError('some nonsense')).toBeUndefined()
    })
  })

  describe('getServerError', () => {
    it('extracts message from parse errors', () => {
      expect(formatServerError(parseError, () => undefined).error.message).toEqual(
        'Hello there, you have an error'
      )
    })

    it('uses message from code map if error code matches', () => {
      expect(
        formatServerError(alreadyExists, (code) =>
          code === 'ObjectAlreadyExists' ? 'that already exists' : undefined
        )
      ).toEqual('that already exists')
    })

    it('falls back to server error message if code not found', () => {
      expect(formatServerError(alreadyExists, () => undefined).error.message).toEqual(
        'whatever'
      )
    })
  })
}
