/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type ReactElement } from 'react'
import { expect, test } from 'vitest'

import { groupBy, intersperse, lowestBy, sortBy, sumBy } from './array'

test('sortBy', () => {
  expect(sortBy(['d', 'b', 'c', 'a'])).toEqual(['a', 'b', 'c', 'd'])

  expect(sortBy([{ x: 'd' }, { x: 'b' }, { x: 'c' }, { x: 'a' }], (o) => o.x)).toEqual([
    { x: 'a' },
    { x: 'b' },
    { x: 'c' },
    { x: 'd' },
  ])

  expect(
    sortBy(
      [{ x: [0, 0, 0, 0] }, { x: [0, 0, 0] }, { x: [0] }, { x: [0, 0] }],
      (o) => o.x.length
    )
  ).toEqual([{ x: [0] }, { x: [0, 0] }, { x: [0, 0, 0] }, { x: [0, 0, 0, 0] }])
})

test('lowestBy', () => {
  expect(lowestBy([{ x: 'd' }, { x: 'b' }, { x: 'c' }, { x: 'a' }], (o) => o.x)).toEqual({
    x: 'a',
  })

  expect(
    lowestBy(
      [{ x: [0, 0, 0, 0] }, { x: [0, 0, 0] }, { x: [0] }, { x: [0, 0] }],
      (o) => o.x.length
    )
  ).toEqual({ x: [0] })
})

test('groupBy', () => {
  expect(
    groupBy(
      [
        { x: 'a', y: 1 },
        { x: 'b', y: 2 },
        { x: 'a', y: 3 },
      ],
      (o) => o.x
    )
  ).toEqual([
    [
      'a',
      [
        { x: 'a', y: 1 },
        { x: 'a', y: 3 },
      ],
    ],
    ['b', [{ x: 'b', y: 2 }]],
  ])
})

test('sumBy', () => {
  expect(sumBy([], (x) => x)).toEqual(0)
  expect(sumBy([{ a: 1 }, { a: 2 }], (x) => x.a)).toEqual(3)
})

test('intersperse', () => {
  expect(intersperse([], <>,</>)).toEqual([])

  const a = <span key="a">a</span>
  const b = <span key="b">b</span>
  const c = <span key="c">c</span>
  const comma = <>,</>
  const or = <>or</>

  const getText = (el: ReactElement) => el.props.children
  const getKey = (el: ReactElement) => el.key

  expect(intersperse([a], comma).map(getText)).toEqual(['a'])
  expect(intersperse([a], comma).map(getKey)).toEqual(['a'])

  expect(intersperse([a, b], comma).map(getText)).toEqual(['a', ',', 'b'])
  expect(intersperse([a, b], comma).map(getKey)).toEqual(['a', 'sep-1', 'b'])

  expect(intersperse([a, b], comma, or).map(getText)).toEqual(['a', 'or', 'b'])
  expect(intersperse([a, b], comma, or).map(getKey)).toEqual(['a', 'conj', 'b'])

  let result = intersperse([a, b, c], comma)
  expect(result.map(getText)).toEqual(['a', ',', 'b', ',', 'c'])
  expect(result.map(getKey)).toEqual(['a', 'sep-1', 'b', 'sep-2', 'c'])

  result = intersperse([a, b, c], comma, or)
  expect(result.map(getText)).toEqual(['a', ',', 'b', ',', 'or', 'c'])
  expect(result.map(getKey)).toEqual(['a', 'sep-1', 'b', 'sep-2', 'conj', 'c'])
})
