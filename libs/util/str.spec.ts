/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { camelCase, capitalize, commaSeries, kebabCase } from './str'

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('this is a sentence')).toEqual('This is a sentence')
  })
})

describe('camelCase', () => {
  it('basic formats to camel case', () => {
    expect(camelCase('camelCase')).toBe('camelCase')
    expect(camelCase('separate words')).toBe('separateWords')
    expect(camelCase('snake_case')).toBe('snakeCase')
    expect(camelCase('kebab-case')).toBe('kebabCase')
    expect(camelCase('PascalCase')).toBe('pascalCase')
    expect(camelCase('SCREAMING_CASE')).toBe('screamingCase')
    expect(camelCase('whatEVerTHIS_iS')).toBe('whatEverThisIs')
  })
})

describe('kebabCase', () => {
  it('basic formats to kebab case', () => {
    expect(kebabCase('kebab-case')).toBe('kebab-case')
    expect(kebabCase('separate words')).toBe('separate-words')
    expect(kebabCase('snake_case')).toBe('snake-case')
    expect(kebabCase('kebab-case')).toBe('kebab-case')
    expect(kebabCase('PascalCase')).toBe('pascal-case')
    expect(kebabCase('SCREAMING_CASE')).toBe('screaming-case')
    expect(kebabCase('whatEVerTHIS_iS')).toBe('what-ever-this-is')
  })
})

it('commaSeries', () => {
  expect(commaSeries([], 'or')).toBe('')
  expect(commaSeries(['a'], 'or')).toBe('a')
  expect(commaSeries(['a', 'b'], 'or')).toBe('a or b')
  expect(commaSeries(['a', 'b'], 'or')).toBe('a or b')
  expect(commaSeries(['a', 'b', 'c'], 'or')).toBe('a, b, or c')
})
