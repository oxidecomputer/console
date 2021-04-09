import { sortObj } from './use-api-data'

describe('sortObj', () => {
  it('sorts object keys alphabetically', () => {
    const obj = { d: 4, c: 3, b: 2, a: 1 }

    expect(Object.keys(obj)).toEqual(['d', 'c', 'b', 'a'])
    expect(Object.keys(sortObj(obj))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('does not change the order of the original', () => {
    const obj = { d: 4, c: 3, b: 2, a: 1 }

    expect(Object.keys(sortObj(obj))).toEqual(['a', 'b', 'c', 'd'])
    expect(Object.keys(obj)).toEqual(['d', 'c', 'b', 'a'])
  })
})
