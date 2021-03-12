import { product } from './helpers'

describe('product', () => {
  test('no input returns an empty array', () => {
    expect(product()).toEqual([])
  })

  test('empty array = empty array', () => {
    expect(product([])).toEqual([])
  })

  test('single value = single value', () => {
    expect(product([1])).toEqual([[1]])
  })

  test('single input array returns the items separated into individual array', () => {
    expect(product([1, 2, 3])).toEqual([[1], [2], [3]])
  })

  test('combines two arrays', () => {
    expect(product([1], [1])).toEqual([[1, 1]])
  })

  test('combines a complex example', () => {
    expect(product(['a', 'b', 'c'], ['1', '2'], ['alpha'])).toEqual([
      ['a', '1', 'alpha'],
      ['a', '2', 'alpha'],
      ['b', '1', 'alpha'],
      ['b', '2', 'alpha'],
      ['c', '1', 'alpha'],
      ['c', '2', 'alpha'],
    ])
  })

  test('allows combinations of value types', () => {
    expect(product<string | number>(['a', 'b'], [1, 2])).toEqual([
      ['a', 1],
      ['a', 2],
      ['b', 1],
      ['b', 2],
    ])
  })
})
