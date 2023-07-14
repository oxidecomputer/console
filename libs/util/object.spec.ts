import { expect, test } from 'vitest'

import { exclude, pick } from './object'

test('pick', () => {
  expect(pick({ a: 1, b: '2', c: { d: false } }, 'a', 'b')).toEqual({ a: 1, b: '2' })
})

test('exclude', () => {
  expect(exclude({ a: 1, b: '2', c: { d: false } }, 'a', 'c')).toEqual({ b: '2' })
})
