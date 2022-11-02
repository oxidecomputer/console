import { validateName } from './NameField'

describe('validateName', () => {
  const validate = (name: string) => validateName(name, 'Name', true)
  it('returns undefined for valid names', () => {
    expect(validate('abc')).toBeUndefined()
    expect(validate('abc-def')).toBeUndefined()
    expect(validate('abc9-d0ef-6')).toBeUndefined()
  })

  it('detects names starting with something other than lower-case letter', () => {
    expect(validate('Abc')).toEqual('Must start with a lower-case letter')
    expect(validate('9bc')).toEqual('Must start with a lower-case letter')
    expect(validate('Abc-')).toEqual('Must start with a lower-case letter')
  })

  it('requires names to end with letter or number', () => {
    expect(validate('abc-')).toEqual('Must end with a letter or number')
    expect(validate('abc---')).toEqual('Must end with a letter or number')
  })

  it('rejects invalid characters', () => {
    expect(validate('aBc')).toEqual(
      'Can only contain lower-case letters, numbers, and dashes'
    )
    expect(validate('asldk:c')).toEqual(
      'Can only contain lower-case letters, numbers, and dashes'
    )
  })
})
