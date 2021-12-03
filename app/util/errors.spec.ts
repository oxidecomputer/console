import { getParseError, getServerError } from './errors'

const parseError = {
  raw: {} as Response,
  data: {
    request_id: '1',
    error_code: null,
    message:
      'unable to parse body: hello there, you have an error at line 129 column 4',
  },
}

const alreadyExists = {
  raw: {} as Response,
  data: {
    request_id: '2',
    error_code: 'ObjectAlreadyExists',
    message: 'whatever',
  },
}

const unauthorized = {
  raw: {} as Response,
  data: {
    request_id: '3',
    error_code: 'Unauthorized',
    message: "I'm afraid you can't do that, Dave",
  },
}

// happens if json parsing fails
const nullData = {
  raw: {} as Response,
  data: null,
}

describe('getParseError', () => {
  it('extracts nice part of error message', () => {
    expect(getParseError(parseError.data.message)).toEqual(
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
    expect(getServerError(alreadyExists, { NotACode: 'stop that' })).toEqual(
      'whatever'
    )
  })

  it('uses global map of generic codes for, e.g., 401s', () => {
    expect(getServerError(unauthorized, {})).toEqual('Action not authorized')
  })

  it('falls back to generic message if server message empty', () => {
    expect(getServerError(nullData, {})).toEqual('Unknown error from server')
  })
})
