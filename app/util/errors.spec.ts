import { getServerParseError, getServerError } from './errors'

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

describe('getServerParseError', () => {
  it('extracts nice part of error message', () => {
    expect(getServerParseError(parseError.data.message)).toEqual(
      'Hello there, you have an error'
    )
  })

  it('falls back if error string does not match pattern', () => {
    expect(getServerParseError('some nonsense')).toEqual(
      'Unknown error from server'
    )
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

  it('falls back to generic server error if code not found', () => {
    expect(getServerError(alreadyExists, { NotACode: 'stop that' })).toEqual(
      'Unknown error from server'
    )
  })
})
