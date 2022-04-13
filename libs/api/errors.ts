import { navToLogin } from './nav-to-login'
import type { ApiMethods, ErrorResponse } from '.'
import { capitalize } from '@oxide/util'

// Generic messages that work anywhere. There will probably be few or none of
// these, but it's convenient for now.
const globalCodeMap: Record<string, string> = {
  Forbidden: 'Action not authorized',
}

const methodCodeMap: { [key in keyof Partial<ApiMethods>]: Record<string, string> } = {
  organizationsPost: {
    ObjectAlreadyExists: 'An organization with that name already exists',
  },
  projectInstancesPost: {
    ObjectAlreadyExists: 'An instance with that name already exists in this project',
  },
  projectDisksPost: {
    ObjectAlreadyExists: 'A disk with that name already exists in this project',
  },
  projectVpcsPost: {
    ObjectAlreadyExists: 'A VPC with that name already exists in this project',
  },
  vpcSubnetsPost: {
    ObjectAlreadyExists: 'A Subnet with that name already exists in this project',
  },
}

export const handleErrors =
  <M>(method: M) =>
  (resp: ErrorResponse) => {
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
    throw formatServerError(resp, methodCodeMap[method as unknown as keyof ApiMethods])
  }

function formatServerError(
  resp: ErrorResponse,
  codeMap: Record<string, string> = {}
): ErrorResponse {
  const code = resp.error.errorCode
  const codeMsg = code && (codeMap[code] || globalCodeMap[code])
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

  const unauthorized = {
    error: {
      requestId: '3',
      errorCode: 'Forbidden',
      message: "I'm afraid you can't do that, Dave",
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
      expect(formatServerError(parseError, {}).error.message).toEqual(
        'Hello there, you have an error'
      )
    })

    it('uses message from code map if error code matches', () => {
      expect(
        formatServerError(alreadyExists, {
          ObjectAlreadyExists: 'that already exists',
        }).error.message
      ).toEqual('that already exists')
    })

    it('falls back to server error message if code not found', () => {
      expect(
        formatServerError(alreadyExists, { NotACode: 'stop that' }).error.message
      ).toEqual('whatever')
    })

    it('uses global map of generic codes for, e.g., 403s', () => {
      expect(formatServerError(unauthorized, {}).error.message).toEqual(
        'Action not authorized'
      )
    })
  })
}
