/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { getSubdomain } from './browser'

describe('getSubdomain', () => {
  it('should handle localhost', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
    })
    expect(getSubdomain()).toBe('localhost')
  })

  it('should handle 1 subdomains after sys', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'https://oxide.sys.r3.oxide-preview.com' },
    })
    expect(getSubdomain()).toBe('r3.oxide-preview.com')
  })

  it('should handle 2 subdomains after sys', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'https://oxide.sys.rack2.eng.oxide.computer' },
    })
    expect(getSubdomain()).toBe('rack2.eng.oxide.computer')
  })
})
