/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it, test } from 'vitest'

import {
  addDashes,
  camelCase,
  capitalize,
  commaSeries,
  extractText,
  kebabCase,
  pluralize,
  titleCase,
} from './str'

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('this is a sentence')).toEqual('This is a sentence')
  })
})

describe('pluralize', () => {
  it('pluralizes correctly', () => {
    expect(pluralize('item', 0)).toBe('items')
    expect(pluralize('item', 1)).toBe('item')
    expect(pluralize('item', 2)).toBe('items')
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
  expect(commaSeries(['a', 'b'], 'and')).toBe('a and b')
  expect(commaSeries(['a', 'b', 'c'], 'or')).toBe('a, b, or c')
  expect(commaSeries(['a', 'b', 'c'], 'and')).toBe('a, b, and c')
})

describe('titleCase', () => {
  it('converts single words to title case', () => {
    expect(titleCase('hello')).toBe('Hello')
  })

  it('converts multiple words to title case', () => {
    expect(titleCase('hello world')).toBe('Hello World')
  })

  it('handles mixed case input correctly', () => {
    expect(titleCase('hElLo WoRlD')).toBe('Hello World')
  })

  it('works correctly with strings containing punctuation', () => {
    expect(titleCase('hello, world!')).toBe('Hello, World!')
  })

  it('works correctly with empty strings', () => {
    expect(titleCase('')).toBe('')
  })

  it('handles strings with only one character', () => {
    expect(titleCase('a')).toBe('A')
  })

  it('doesn’t modify non-letter characters', () => {
    expect(titleCase('123 abc')).toBe('123 Abc')
  })
})

describe('extractText', () => {
  it('extracts strings from React components', () => {
    expect(
      extractText(
        <>
          This is my <strong>text</strong>
        </>
      )
    ).toBe('This is my text')
  })
  it('extracts strings from nested elements', () => {
    expect(
      extractText(
        <p>
          This is my{' '}
          <strong>
            <em>nested</em> text
          </strong>
        </p>
      )
    ).toBe('This is my nested text')
  })
  it('can handle regular strings', () => {
    expect(extractText('Some more text')).toBe('Some more text')
  })
})

test('addDashes', () => {
  expect(addDashes([], 'abcdefgh')).toEqual('abcdefgh')
  expect(addDashes([3], 'abcdefgh')).toEqual('abcd-efgh')
  expect(addDashes([2, 5], 'abcdefgh')).toEqual('abc-def-gh')
  // too-high idxs are ignored
  expect(addDashes([7], 'abcd')).toEqual('abcd')
})
