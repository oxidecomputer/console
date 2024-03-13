/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { isRootResourceLink, links } from './links'

describe('check links are accessible', () => {
  for (const [key, url] of Object.entries(links)) {
    test(key, async () => {
      // if we run into a page where HEAD doesn't work, we can fall back to GET
      const response = await fetch(url, { method: 'HEAD' })
      expect(response.status).toEqual(200)
    })
  }
})

describe('check isRootResourceLink to evaluate Sidebar navigation links', () => {
  test('should return true for resource creation pages', () => {
    const navUrl = 'projects/mock-project/instances'
    const locationPathname = 'projects/mock-project/instances-new'
    const isLinkToRootResource = isRootResourceLink(navUrl, locationPathname)
    expect(isLinkToRootResource).toEqual(true)
  })
  test('should return false for non-resource creation pages', () => {
    const navUrl = 'projects/mock-project/disks'
    const locationPathname = 'projects/mock-project/instances-new'
    const isLinkToRootResource = isRootResourceLink(navUrl, locationPathname)
    expect(isLinkToRootResource).toEqual(false)
  })
})
