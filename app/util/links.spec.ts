/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import links from './links'

describe('check links are accessible', () => {
  for (const category in links) {
    const categoryKey = category as keyof typeof links
    for (const link in links[categoryKey]) {
      test(`${category}.${link}`, async () => {
        const linkKey = link as keyof (typeof links)[typeof categoryKey]
        let response
        try {
          response = await fetch(links[categoryKey][linkKey], { method: 'HEAD' })
        } catch (error) {
          // If HEAD request fails, try GET
          if (error instanceof TypeError) {
            response = await fetch(links[categoryKey][linkKey])
          } else {
            throw error
          }
        }
        // Check if the status code is 200
        expect(response.status).toEqual(200)
      })
    }
  }
})
