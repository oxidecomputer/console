/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { links } from './links'

describe('check links are accessible', () => {
  for (const [key, url] of Object.entries(links)) {
    test(key, async () => {
      // if we run into a page where HEAD doesn't work, we can fall back to GET
      const response = await fetch(url, { method: 'HEAD' })
      expect(response.status).toEqual(200)
    })
  }
})

// describe('check useIsNewResourcePage to evaluate Sidebar navigation links', () => {
//   test('should return false for non-resource creation pages', () => {
//     const fakeURL = new URL('https://oxide.computer/projects/mock-project/instances-new')
//     vi.spyOn(window, 'location', 'get').mockReturnValue(fakeURL)
//     const isNewResourcePage = useIsNewResourcePage('projects/mock-project/instances')
//     expect(isNewResourcePage).toEqual(true)
//   })
// })
