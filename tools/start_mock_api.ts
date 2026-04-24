/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createServer } from '@mswjs/http-middleware'

import { handlers } from '../mock-api/msw/handlers'

const port = Number(process.argv[2] ?? process.env.MOCK_API_PORT ?? 12220)
createServer(...handlers).listen(port)

console.info(`Mock Nexus API running at http://localhost:${port}`)

// TODO: request logging. I tried adding this as a full express server with
// logging middleware and it only logged 404s, not good requests
