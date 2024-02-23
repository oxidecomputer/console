/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { handlers } from '@oxide/api-mocks'

export const server = setupServer(
  ...handlers.map((h) => {
    // Node's Fetch implementation does not accept URLs with a protocol and host
    h.info.path = 'http://testhost' + h.info.path
    return h
  })
)

// Override request handlers in order to test special cases
export function overrideOnce(
  method: keyof typeof http,
  path: string,
  status: number,
  body: string | Record<string, unknown>
) {
  server.use(
    http[method](
      path,
      () =>
        // https://mswjs.io/docs/api/response/once
        typeof body === 'string'
          ? new HttpResponse(body, { status })
          : HttpResponse.json(body, { status }),
      { once: true }
    )
  )
}
