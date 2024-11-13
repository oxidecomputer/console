/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import {
  camelCase,
  capitalize,
  commaSeries,
  extractText,
  kebabCase,
  normalizeName,
  titleCase,
} from './str'

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

describe('normalizeName', () => {
  it('converts to lowercase', () => {
    expect(normalizeName('Hello')).toBe('hello')
  })

  it('replaces spaces with dashes', () => {
    expect(normalizeName('Hello World')).toBe('hello-world')
  })

  it('removes non-alphanumeric characters', () => {
    expect(normalizeName('Hello, World!')).toBe('hello-world')
  })

  it('caps at 63 characters', () => {
    expect(normalizeName('aaa')).toBe('aaa')
    expect(normalizeName('aaaaaaaaa')).toBe('aaaaaaaaa')
    expect(normalizeName('a'.repeat(63))).toBe('a'.repeat(63))
    expect(normalizeName('a'.repeat(64))).toBe('a'.repeat(63))
  })

  it('can optionally start with numbers', () => {
    expect(normalizeName('123abc')).toBe('abc')
    expect(normalizeName('123abc', false)).toBe('abc')
    expect(normalizeName('123abc', true)).toBe('123abc')
  })

  it('can optionally start with a dash', () => {
    expect(normalizeName('-abc')).toBe('abc')
    expect(normalizeName('-abc', false)).toBe('abc')
    expect(normalizeName('-abc', true)).toBe('-abc')
  })

  it('does not complain when multiple dashes are present', () => {
    expect(normalizeName('a--b')).toBe('a--b')
  })
})
