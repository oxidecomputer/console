import { formatServerError, getParseError, getResourceName } from '../errors'

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
  ['projectCreate', 'project'],
  ['instanceNetworkInterfaceCreate', 'interface'],
  ['instanceNetworkInterfaceCreate', 'interface'],
  ['doesNotContainC-reate', null],
])('getResourceName gets resource names', (method, resource) => {
  expect(getResourceName(method)).toEqual(resource)
})