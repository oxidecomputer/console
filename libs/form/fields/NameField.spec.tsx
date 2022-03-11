import { validateName } from './NameField'

describe('validateName', () => {
  it('returns undefined for valid names', () => {
    expect(validateName('abc')).toBeUndefined()
    expect(validateName('abc-def')).toBeUndefined()
    expect(validateName('abc9-d0ef-6')).toBeUndefined()
  })

  it('detects names starting with something other than lower-case letter', () => {
    expect(validateName('Abc')).toEqual('Must start with a lower-case letter')
    expect(validateName('9bc')).toEqual('Must start with a lower-case letter')
    expect(validateName('Abc-')).toEqual('Must start with a lower-case letter')
  })

  it('requires names to end with letter or number', () => {
    expect(validateName('abc-')).toEqual('Must end with a letter or number')
    expect(validateName('abc---')).toEqual('Must end with a letter or number')
  })

  it('rejects invalid characters', () => {
    expect(validateName('aBc')).toEqual(
      'Can only contain lower-case letters, numbers, and dashes'
    )
    expect(validateName('asldk:c')).toEqual(
      'Can only contain lower-case letters, numbers, and dashes'
    )
  })
})
