/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { isCanonicalNumberString } from './NumberInput'

describe('isCanonicalNumberString', () => {
  it.each([
    ['0', true],
    ['-1', true],
    ['1.5', true],
    ['', false],
    ['01', false],
    ['1.', false],
    ['1.0', false],
    ['-0', false],
  ])('%j => %j', (value, expected) => {
    expect(isCanonicalNumberString(value)).toBe(expected)
  })
})
