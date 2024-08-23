/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type ReactElement } from 'react'
import { expect, test } from 'vitest'

import { groupBy, intersperse, isSetEqual, setDiff } from './array'

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

test('isSetEqual', () => {
  expect(isSetEqual(new Set(), new Set())).toBe(true)
  expect(isSetEqual(new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c']))).toBe(true)

  expect(isSetEqual(new Set(['a']), new Set(['b']))).toBe(false)
  expect(isSetEqual(new Set(['a']), new Set(['a', 'b']))).toBe(false)
  expect(isSetEqual(new Set(['a', 'b']), new Set(['a']))).toBe(false)

  expect(isSetEqual(new Set([{}]), new Set([{}]))).toBe(false)
})

test('setDiff', () => {
  expect(setDiff(new Set(), new Set())).toEqual(new Set())
  expect(setDiff(new Set(['a']), new Set())).toEqual(new Set(['a']))
  expect(setDiff(new Set(), new Set(['a']))).toEqual(new Set())
  expect(setDiff(new Set(['b', 'a', 'c']), new Set(['b', 'd']))).toEqual(
    new Set(['a', 'c'])
  )
})
