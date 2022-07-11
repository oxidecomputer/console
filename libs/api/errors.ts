import { camelCaseToWords, capitalize } from '@oxide/util'

import type { ApiMethods, Error, ErrorResponse } from '.'
import { navToLogin } from './nav-to-login'

const errorCodeFormatter =
  (method: keyof ApiMethods) =>
  (errorCode: string, _: Error): string | undefined => {
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

export const handleErrors = (method: keyof ApiMethods) => (resp: ErrorResponse) => {
  // TODO is this a valid failure condition?
  if (!resp) throw 'unknown server error'

  // if logged out, hit /login to trigger login redirect
  if (resp.status === 401) {
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
  resp: ErrorResponse,
  msgFromCode: (errorCode: string, error: Error) => string | undefined
): ErrorResponse {
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
  } as ErrorResponse

  const alreadyExists = {
    error: {
      requestId: '2',
      errorCode: 'ObjectAlreadyExists',
      message: 'whatever',
    },
  } as ErrorResponse

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
