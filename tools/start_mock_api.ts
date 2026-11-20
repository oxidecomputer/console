/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createServer } from 'node:http'
import { arrayBuffer } from 'node:stream/consumers'

import { getResponse } from 'msw'

import { handlers } from '../mock-api/msw/handlers'

// TODO: take port argument
const PORT = 12220
const ORIGIN = `http://localhost:${PORT}`

// The handlers have relative paths, which msw resolves against `location`,
// and Node doesn't have one
Object.assign(globalThis, { location: new URL(ORIGIN) })

createServer(async (req, res) => {
  const headers = new Headers()
  for (const [name, values] of Object.entries(req.headersDistinct)) {
    for (const value of values ?? []) headers.append(name, value)
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const request = new Request(new URL(req.url ?? '/', ORIGIN), {
    method: req.method,
    headers,
    body: hasBody ? await arrayBuffer(req) : undefined,
  })

  const response = await getResponse(handlers, request)
  if (!response) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'Mock not found' }))
    return
  }

  res.statusCode = response.status
  // appendHeader keeps multiple values of the same header, like Set-Cookie
  response.headers.forEach((value, name) => res.appendHeader(name, value))
  res.end(Buffer.from(await response.arrayBuffer()))
}).listen(PORT)

console.info(`Mock Nexus API running at ${ORIGIN}`)
