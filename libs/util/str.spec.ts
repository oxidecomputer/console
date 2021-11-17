import { capitalize } from './str'

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
