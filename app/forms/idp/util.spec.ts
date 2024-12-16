/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { getDelegatedDomain } from './util'

describe('getDomainSuffix', () => {
  it('handles arbitrary URLs by falling back to placeholder', () => {
    expect(getDelegatedDomain({ hostname: 'localhost' })).toBe('placeholder')
    expect(getDelegatedDomain({ hostname: 'console-preview.oxide.computer' })).toBe(
      'placeholder'
    )
  })

  it('handles 1 subdomain after sys', () => {
    const location = { hostname: 'oxide.sys.r3.oxide-preview.com' }
    expect(getDelegatedDomain(location)).toBe('r3.oxide-preview.com')
  })

  it('handles 2 subdomains after sys', () => {
    const location = { hostname: 'oxide.sys.rack2.eng.oxide.computer' }
    expect(getDelegatedDomain(location)).toBe('rack2.eng.oxide.computer')
  })
})
