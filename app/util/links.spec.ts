/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { links } from './links'

describe.skip('check links are accessible', () => {
  for (const [key, url] of Object.entries(links)) {
    test(key, async () => {
      // if we run into a page where HEAD doesn't work, we can fall back to GET
      const response = await fetch(url, { method: 'HEAD' })
      expect(response.status).toEqual(200)
    })
  }
})
