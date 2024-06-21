/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { validateName } from './NameField'

describe('validateName', () => {
  const validate = (name: string) => validateName(name, 'Name', true, ['example'])

  it('returns undefined for valid names', () => {
    expect(validate('abc')).toBeUndefined()
    expect(validate('abc-def')).toBeUndefined()
    expect(validate('abc9-d0ef-6')).toBeUndefined()
  })

  it('detects names starting with something other than lower-case letter', () => {
    expect(validate('9bc')).toEqual('Must start with a lower-case letter')
  })

  // this fails if we check last letter before we check all chars
  it('gives correct error on ending with capital letter', () => {
    expect(validate('freeBSD')).toEqual(
      'Can only contain lower-case letters, numbers, and dashes'
    )
  })

  it('requires names to end with letter or number', () => {
    expect(validate('abc-')).toEqual('Must end with a letter or number')
    expect(validate('abc---')).toEqual('Must end with a letter or number')
  })

  it('rejects invalid characters', () => {
    const err = 'Can only contain lower-case letters, numbers, and dashes'
    expect(validate('aBc')).toEqual(err)
    expect(validate('asldk:c')).toEqual(err)
    expect(validate('Abc-')).toEqual(err)
    expect(validate('Abc')).toEqual(err)
  })

  it('rejects names that are too long', () => {
    expect(validate('a'.repeat(64))).toEqual('Must be 63 characters or fewer')
  })

  it('rejects reserved names', () => {
    expect(validate('example')).toEqual('Name is already in use, or is unavailable')
    expect(validate('exam')).toBeUndefined()
    expect(validate('example-2')).toBeUndefined()
  })
})
