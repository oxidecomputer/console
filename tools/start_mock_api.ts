/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createServer } from '@mswjs/http-middleware'

import { handlers } from '@oxide/api-mocks'

// TODO: take port argument
createServer(...handlers).listen(12220)

console.log('Mock Nexus API running at http://localhost:12220')

// TODO: request logging. I tried adding this as a full express server with
// logging middleware and it only logged 404s, not good requests
