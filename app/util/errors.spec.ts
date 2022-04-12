import type { ErrorResponse } from '@oxide/api'
import { getParseError, getServerError } from './errors'

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
    expect(getServerError(parseError)).toEqual('Hello there, you have an error')
  })

  it('uses message from code map if error code matches', () => {
    expect(
      getServerError(alreadyExists, {
        ObjectAlreadyExists: 'that already exists',
      })
    ).toEqual('that already exists')
  })

  it('falls back to server error message if code not found', () => {
    expect(getServerError(alreadyExists, { NotACode: 'stop that' })).toEqual('whatever')
  })

  it('uses global map of generic codes for, e.g., 403s', () => {
    expect(getServerError(unauthorized, {})).toEqual('Action not authorized')
  })

  it('returns null if the error object is null', () => {
    // happens if json parsing fails
    expect(getServerError(null, {})).toEqual(null)
  })
})
