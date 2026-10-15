/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { renderToReadableStream } from 'react-dom/server'
import { ServerRouter, type EntryContext } from 'react-router'

import vercelConfig from '../vercel.json'

// Only used by the dev server and the build-time SPA render.
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const nonce = process.env.CSP_NONCE
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} nonce={nonce} />,
    { nonce, signal: request.signal, onError: console.error }
  )
  await body.allReady
  for (const { key, value } of vercelConfig.headers[0].headers) {
    responseHeaders.set(key, value)
  }
  if (nonce)
    responseHeaders.set(
      'Content-Security-Policy',
      `${responseHeaders.get('Content-Security-Policy')}; script-src 'nonce-${nonce}' 'self'`
    )
  responseHeaders.set('Content-Type', 'text/html')
  return new Response(body, { status: responseStatusCode, headers: responseHeaders })
}
