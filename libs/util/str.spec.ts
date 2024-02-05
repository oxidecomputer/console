/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it, test } from 'vitest'

import {
  camelCase,
  capitalize,
  commaSeries,
  IPV4_REGEX,
  IPV6_REGEX,
  kebabCase,
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

// Rust playground showing the results of these test cases match the results of std::net::{Ipv4Addr, Ipv6Addr}
// https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=babc49cd34bf19669137e22b9202d2eb

test.each([
  ['', false],
  ['1', false],
  ['abc', false],
  ['a.b.c.d', false],
  // some implementations (I think incorrectly) allow leading zeros but nexus does not
  ['01.102.103.104', false],
  ['123.4.56.7', true],
  ['1.2.3.4', true],
])('ipv4Regex %s', (s, result) => {
  expect(IPV4_REGEX.test(s)).toBe(result)
})

test.each([
  ['', false],
  ['1', false],
  ['abc', false],
  ['123.4.56.7', false],
  ['2001:db8:3333:4444:5555:6666:7777:8888', true],
  ['2001:db8:3333:4444:CCCC:DDDD:EEEE:FFFF', true],
  ['::', true],
  ['2001:db8::', true],
  ['::1234:5678', true],
  ['2001:db8::1234:5678', true],
  ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', true],
])('ipv6Regex %s', (s, result) => {
  expect(IPV6_REGEX.test(s)).toBe(result)
})
