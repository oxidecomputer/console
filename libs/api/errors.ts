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

function getParseError(message: string | undefined): string | undefined {
  if (!message) return undefined
  const inner = /^unable to parse body: (.+) at line \d+ column \d+$/.exec(message)?.[1]
  return inner && capitalize(inner)
}

// -- TESTS ----------------

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  // these have to be functions because the object gets mutated in each test

  const parseError = () => ({
    type: 'error' as const,
    statusCode: 400,
    headers: new Headers(),
    error: {
      requestId: '1',
      errorCode: null,
      message: 'unable to parse body: hello there, you have an error at line 129 column 4',
    },
  })

  const alreadyExists = () => ({
    type: 'error' as const,
    statusCode: 400,
    headers: new Headers(),
    error: {
      requestId: '2',
      errorCode: 'ObjectAlreadyExists',
      message: 'whatever',
    },
  })

  const clientError = () => ({
    type: 'client_error' as const,
    statusCode: 200,
    headers: new Headers(),
    text: 'this was not json',
    error: new Error('failed to parse JSON'),
  })

  describe('getParseError', () => {
    it('extracts nice part of error message', () => {
      expect(getParseError(parseError().error.message)).toEqual(
        'Hello there, you have an error'
      )
    })

    it('returns undefined if error does not match pattern', () => {
      expect(getParseError('some nonsense')).toBeUndefined()
    })
  })

  describe('formatServerError', () => {
    it('extracts message from parse errors', () => {
      expect(formatServerError('', parseError()).error.message).toEqual(
        'Hello there, you have an error'
      )
    })

    it('handles client errors', () => {
      expect(formatServerError('', clientError()).error.message).toEqual(
        'Error reading API response'
      )
    })

    it('uses message from code map if error code matches', () => {
      expect(formatServerError('FakeThingCreate', alreadyExists()).error.message).toEqual(
        'Thing name already exists'
      )
    })

    it('falls back to server error message if code not found', () => {
      expect(formatServerError('', alreadyExists()).error.message).toEqual('whatever')
    })
  })

  it.each([
    ['projectCreate', 'project'],
    ['projectCreateV1', 'project'],
    ['instanceNetworkInterfaceCreate', 'interface'],
    ['instanceNetworkInterfaceCreateV1', 'interface'],
    ['doesNotContainC-reate', null],
  ])('getResourceName gets resource names', (method, resource) => {
    expect(getResourceName(method)).toEqual(resource)
  })
}
