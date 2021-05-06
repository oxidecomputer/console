import { capitalize, getServerParseError } from './str'

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('this is a sentence')).toEqual('This is a sentence')
  })

  it('passes through falsy values', () => {
    expect(capitalize('')).toEqual('')
    expect(capitalize(null)).toEqual(null)
    expect(capitalize(undefined)).toEqual(undefined)
  })
})

describe('getServerParseError', () => {
  it('extracts nice part of error message', () => {
    expect(
      getServerParseError(
        'unable to parse body: hello there, you have an error at line 129 column 4'
      )
    ).toEqual('Hello there, you have an error')
  })

  it('falls back if error string does not match pattern', () => {
    expect(getServerParseError('some nonsense')).toEqual(
      'Unknown error from server'
    )
  })
})
